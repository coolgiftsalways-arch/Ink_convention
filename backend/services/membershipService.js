const TattooStudio = require("../models/TattooStudio");

const PAID_PLANS = new Set(["pro", "verified"]);

function normalizePlan(value) {
  const plan = String(value || "basic")
    .trim()
    .toLowerCase();

  if (
    plan === "verified" ||
    plan === "gold" ||
    plan === "spotlight" ||
    plan === "verified spotlight"
  ) {
    return "verified";
  }

  if (plan === "pro" || plan === "silver" || plan === "pro listing") {
    return "pro";
  }

  return "basic";
}

function addOneCalendarYear(value = new Date()) {
  const start =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid membership start date.");
  }

  const expires = new Date(start.getTime());
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  return expires;
}

function applyBasicPlan(studio) {
  studio.plan = "basic";
  studio.paymentStatus = "unpaid";
  studio.verified = false;
  studio.spotlight = false;
  studio.hallOfFameEligible = false;
  return studio;
}

function isPaidMembershipExpired(studio, now = new Date()) {
  if (!studio) return false;

  const plan = normalizePlan(studio.plan);
  if (!PAID_PLANS.has(plan)) return false;

  if (!studio.planExpiresAt) return false;

  const expiry = new Date(studio.planExpiresAt);
  if (Number.isNaN(expiry.getTime())) return false;

  return expiry.getTime() <= now.getTime();
}

async function ensureMembershipCurrent(studio) {
  if (!studio) return studio;

  const plan = normalizePlan(studio.plan);

  if (PAID_PLANS.has(plan) && !studio.planExpiresAt) {
    const start = studio.planStartedAt || studio.paidAt || null;
    if (start) {
      studio.planStartedAt = studio.planStartedAt || start;
      studio.planExpiresAt = addOneCalendarYear(start);
      await studio.save();
    }
  }

  if (!isPaidMembershipExpired(studio)) {
    return studio;
  }

  applyBasicPlan(studio);
  studio.updatedAt = new Date();
  await studio.save();
  return studio;
}

async function backfillMissingExpiryDates() {
  const studios = await TattooStudio.find({
    plan: { $in: ["pro", "verified"] },
    paymentStatus: "paid",
    $or: [{ planExpiresAt: null }, { planExpiresAt: { $exists: false } }],
  });

  for (const studio of studios) {
    const start = studio.planStartedAt || studio.paidAt || null;
    if (!start) continue;

    studio.planStartedAt = studio.planStartedAt || start;
    studio.planExpiresAt = addOneCalendarYear(start);
    await studio.save();
  }
}

async function expireMemberships() {
  await backfillMissingExpiryDates();

  const now = new Date();

  const result = await TattooStudio.updateMany(
    {
      plan: { $in: ["pro", "verified"] },
      planExpiresAt: { $ne: null, $lte: now },
    },
    {
      $set: {
        plan: "basic",
        paymentStatus: "unpaid",
        verified: false,
        spotlight: false,
        hallOfFameEligible: false,
        updatedAt: now,
      },
    },
  );

  return result;
}

function publicLockedMap(plan) {
  const normalized = normalizePlan(plan);
  const isBasic = normalized === "basic";
  const isVerified = normalized === "verified";

  return {
    city: isBasic,
    profileImage: isBasic,
    phone: isBasic,
    email: !isVerified,
    studio: !isVerified,
    experience: !isVerified,
    instagram: !isVerified,
    bio: !isVerified,
    portfolioImages: isBasic,
  };
}

function getDisplayName(studio = {}) {
  return (
    studio.name ||
    studio.professionalName ||
    studio.artistName ||
    "Tattoo Artist"
  );
}

function serializePublicArtist(source = {}) {
  const studio =
    typeof source.toObject === "function" ? source.toObject() : source;
  const plan = normalizePlan(studio.plan);
  const locked = publicLockedMap(plan);

  const result = {
    _id: studio._id,
    id: studio._id || studio.id,
    plan,
    name: getDisplayName(studio),
    state: studio.state || "",
    claimed: Boolean(
      studio.claimed || studio.phoneVerified || studio.updatedByOwner,
    ),
    phoneVerified: Boolean(studio.phoneVerified),
    updatedByOwner: Boolean(studio.updatedByOwner),
    verified: plan === "verified" && Boolean(studio.verified),
    spotlight: plan === "verified" && Boolean(studio.spotlight),
    hallOfFameEligible:
      plan === "verified" && Boolean(studio.hallOfFameEligible),
    planStartedAt: PAID_PLANS.has(plan) ? studio.planStartedAt || null : null,
    planExpiresAt: PAID_PLANS.has(plan) ? studio.planExpiresAt || null : null,
    locked,
  };

  // FREE / BASIC: only name + state are public.
  if (plan === "basic") {
    return result;
  }

  // SILVER / PRO: name + state + city + photo + phone + first 5 portfolio images are public.
  result.city = studio.city || "";
  result.profileImage = studio.profileImage || "";
  result.phone = studio.phone || "";

  if (plan === "pro") {
    result.portfolioImages = Array.isArray(studio.portfolioImages)
      ? studio.portfolioImages.slice(0, 5)
      : [];

    return result;
  }

  // GOLD / VERIFIED: full public profile + first 10 portfolio images.
  result.email = studio.email || "";
  result.studio = studio.studio || studio.studioName || studio.name || "";
  result.experience = studio.experience || "";
  result.instagram = studio.instagram || "";
  result.bio = studio.bio || "";
  result.portfolioImages = Array.isArray(studio.portfolioImages)
    ? studio.portfolioImages.slice(0, 10)
    : [];

  return result;
}

let expiryWorkerStarted = false;

function startMembershipExpiryWorker() {
  if (expiryWorkerStarted) return;
  expiryWorkerStarted = true;

  const run = async () => {
    try {
      const result = await expireMemberships();
      if (result?.modifiedCount) {
        console.log(
          `✅ Downgraded ${result.modifiedCount} expired membership(s) to Basic.`,
        );
      }
    } catch (error) {
      console.error("❌ Membership expiry worker error:", error.message);
    }
  };

  void run();

  const timer = setInterval(run, 60 * 60 * 1000);
  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

module.exports = {
  PAID_PLANS,
  normalizePlan,
  addOneCalendarYear,
  applyBasicPlan,
  isPaidMembershipExpired,
  ensureMembershipCurrent,
  backfillMissingExpiryDates,
  expireMemberships,
  publicLockedMap,
  serializePublicArtist,
  startMembershipExpiryWorker,
};
