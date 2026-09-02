const TattooStudio = require("../models/TattooStudio");

const PAID_PLANS = new Set(["pro", "verified"]);

/* =========================================================
   NORMALIZE PLAN

   basic    = FREE
   pro      = SILVER
   verified = GOLD
========================================================= */

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

/* =========================================================
   ADD 1 CALENDAR YEAR
========================================================= */

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

/* =========================================================
   APPLY FREE / BASIC PLAN

   IMPORTANT:

   PROFILE DATA IS NOT DELETED.

   We only change membership
   and premium flags.
========================================================= */

function applyBasicPlan(studio) {
  studio.plan = "basic";

  studio.paymentStatus = "unpaid";

  studio.verified = false;

  studio.spotlight = false;

  studio.hallOfFameEligible = false;

  return studio;
}

/* =========================================================
   CHECK IF PAID MEMBERSHIP EXPIRED
========================================================= */

function isPaidMembershipExpired(studio, now = new Date()) {
  if (!studio) {
    return false;
  }

  const plan = normalizePlan(studio.plan);

  if (!PAID_PLANS.has(plan)) {
    return false;
  }

  if (!studio.planExpiresAt) {
    return false;
  }

  const expiry = new Date(studio.planExpiresAt);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  return expiry.getTime() <= now.getTime();
}

/* =========================================================
   ENSURE SINGLE PROFILE MEMBERSHIP IS CURRENT
========================================================= */

async function ensureMembershipCurrent(studio) {
  if (!studio) {
    return studio;
  }

  const plan = normalizePlan(studio.plan);

  /* =======================================================
     BACKFILL OLD PAID PROFILE

     If profile is paid but missing
     planExpiresAt, calculate expiry
     from planStartedAt / paidAt.
  ======================================================= */

  if (PAID_PLANS.has(plan) && !studio.planExpiresAt) {
    const start = studio.planStartedAt || studio.paidAt || null;

    if (start) {
      studio.planStartedAt = studio.planStartedAt || start;

      studio.planExpiresAt = addOneCalendarYear(start);

      await studio.save();
    }
  }

  /* =======================================================
     ACTIVE MEMBERSHIP
  ======================================================= */

  if (!isPaidMembershipExpired(studio)) {
    return studio;
  }

  /* =======================================================
     EXPIRED

     DOWNGRADE TO FREE.

     DO NOT DELETE:
     city
     phone
     email
     image
     studio
     bio
     portfolio
     ownership
     etc.
  ======================================================= */

  applyBasicPlan(studio);

  studio.updatedAt = new Date();

  await studio.save();

  return studio;
}

/* =========================================================
   BACKFILL ALL OLD PAID PROFILES
========================================================= */

async function backfillMissingExpiryDates() {
  const studios = await TattooStudio.find({
    plan: {
      $in: ["pro", "verified"],
    },

    paymentStatus: "paid",

    $or: [
      {
        planExpiresAt: null,
      },

      {
        planExpiresAt: {
          $exists: false,
        },
      },
    ],
  });

  for (const studio of studios) {
    const start = studio.planStartedAt || studio.paidAt || null;

    if (!start) {
      continue;
    }

    studio.planStartedAt = studio.planStartedAt || start;

    studio.planExpiresAt = addOneCalendarYear(start);

    await studio.save();
  }
}

/* =========================================================
   EXPIRE MEMBERSHIPS

   GOLD / SILVER
   after expiry
   ↓
   FREE / BASIC

   IMPORTANT:

   DOCUMENT IS NOT DELETED.
========================================================= */

async function expireMemberships() {
  /* =======================================================
     FIRST FIX OLD PAID RECORDS
  ======================================================= */

  await backfillMissingExpiryDates();

  const now = new Date();

  /* =======================================================
     DOWNGRADE EXPIRED MEMBERSHIPS
  ======================================================= */

  const result = await TattooStudio.updateMany(
    {
      plan: {
        $in: ["pro", "verified"],
      },

      planExpiresAt: {
        $ne: null,

        $lte: now,
      },
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

/* =========================================================
   PUBLIC LOCK MAP

   FREE:
   name + state

   SILVER:
   name
   state
   city
   profile image
   phone

   GOLD:
   everything
========================================================= */

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

    portfolioImages: !isVerified,
  };
}

/* =========================================================
   DISPLAY NAME
========================================================= */

function getDisplayName(studio = {}) {
  return (
    studio.name ||
    studio.professionalName ||
    studio.artistName ||
    "Tattoo Artist"
  );
}

/* =========================================================
   PUBLIC ARTIST SERIALIZER

   SECURITY IMPORTANT:

   We do NOT send hidden real
   values to frontend.

   They are completely removed
   from API response.
========================================================= */

function serializePublicArtist(source = {}) {
  const studio =
    typeof source.toObject === "function" ? source.toObject() : source;

  const plan = normalizePlan(studio.plan);

  const locked = publicLockedMap(plan);

  /* =======================================================
     ALWAYS PUBLIC
  ======================================================= */

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

  /* =======================================================
     FREE / BASIC

     ONLY:
     NAME
     STATE
  ======================================================= */

  if (plan === "basic") {
    return result;
  }

  /* =======================================================
     SILVER / PRO

     ADD:
     CITY
     PROFILE IMAGE
     PHONE
  ======================================================= */

  result.city = studio.city || "";

  result.profileImage = studio.profileImage || "";

  result.phone = studio.phone || "";

  if (plan === "pro") {
    return result;
  }

  /* =======================================================
     GOLD / VERIFIED

     FULL PUBLIC PROFILE
  ======================================================= */

  result.email = studio.email || "";

  result.studio = studio.studio || studio.studioName || studio.name || "";

  result.experience = studio.experience || "";

  result.instagram = studio.instagram || "";

  result.bio = studio.bio || "";

  result.portfolioImages = Array.isArray(studio.portfolioImages)
    ? studio.portfolioImages.slice(0, 3)
    : [];

  return result;
}

/* =========================================================
   MEMBERSHIP EXPIRY WORKER

   Runs immediately
   then every 1 hour.
========================================================= */

let expiryWorkerStarted = false;

function startMembershipExpiryWorker() {
  if (expiryWorkerStarted) {
    return;
  }

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

  /* =======================================================
     RUN ON SERVER START
  ======================================================= */

  void run();

  /* =======================================================
     RUN EVERY 1 HOUR
  ======================================================= */

  const timer = setInterval(run, 60 * 60 * 1000);

  /* =======================================================
     DO NOT KEEP NODE PROCESS
     ALIVE ONLY FOR TIMER
  ======================================================= */

  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

/* =========================================================
   EXPORTS
========================================================= */

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
