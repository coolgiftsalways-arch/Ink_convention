const express = require("express");
const crypto = require("crypto");

const TattooStudio = require("../models/TattooStudio");
const { verifyMsg91AccessToken } = require("../services/msg91OtpService");

const {
  normalizePlan,
  ensureMembershipCurrent,
  applyBasicPlan,
} = require("../services/membershipService");

const TATTOO_CATEGORIES = require("../constants/tattooCategories");

const router = express.Router();

function compactOwnerProfile(source = {}) {
  const profile =
    typeof source?.toObject === "function" ? source.toObject() : { ...source };

  delete profile.profileImage;
  delete profile.portfolioImages;

  return profile;
}

const CLAIM_COOKIE = "ink_claim_session";
const CLAIM_SESSION_MS = 4 * 60 * 60 * 1000;

function normalizePhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  if (digits.length !== 12 || !digits.startsWith("91")) {
    return "";
  }

  return digits;
}

function maskPhone(phone) {
  const digits = normalizePhone(phone);

  if (!digits) {
    return "REGISTERED NUMBER";
  }

  return `${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTattooStyles(styles) {
  if (!Array.isArray(styles)) {
    return [];
  }

  const allowedMap = new Map(
    TATTOO_CATEGORIES.map((category) => [
      String(category).toLowerCase(),
      String(category),
    ]),
  );

  const cleanedStyles = styles
    .map((style) => String(style || "").trim())
    .filter(Boolean)
    .map((style) => allowedMap.get(style.toLowerCase()) || null)
    .filter(Boolean);

  return [...new Set(cleanedStyles)];
}

function getClaimSecret() {
  const secret = String(process.env.CLAIM_SESSION_SECRET || "").trim();

  if (!secret) {
    throw new Error("CLAIM_SESSION_SECRET is missing in backend .env");
  }

  return secret;
}

function signClaimToken(profileId, expiresAt = Date.now() + CLAIM_SESSION_MS) {
  const payload = Buffer.from(
    JSON.stringify({
      profileId: String(profileId),
      exp: Number(expiresAt),
    }),
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getClaimSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function verifyClaimToken(token) {
  try {
    const [payload, signature] = String(token || "").split(".");

    if (!payload || !signature) {
      return null;
    }

    const expected = crypto
      .createHmac("sha256", getClaimSecret())
      .update(payload)
      .digest("base64url");

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (!data?.profileId || !data?.exp || Date.now() > Number(data.exp)) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

function getCookie(req, name) {
  const raw = String(req.headers.cookie || "");

  for (const item of raw.split(";")) {
    const [key, ...rest] = item.trim().split("=");

    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return "";
}

function claimCookieOptions() {
  const production = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    maxAge: CLAIM_SESSION_MS,

    // IMPORTANT:
    // Must work for both /api/claim and /api/get
    path: "/api",
  };
}

function clearClaimCookieOptions(path = "/api") {
  const production = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    path,
  };
}

function clearClaimSessionCookies(res) {
  res.clearCookie(CLAIM_COOKIE, clearClaimCookieOptions("/api"));

  // Remove older cookie too.
  res.clearCookie(CLAIM_COOKIE, clearClaimCookieOptions("/api/claim"));
}

async function requireClaimSession(req, res, next) {
  try {
    const token = getCookie(req, CLAIM_COOKIE);

    const session = verifyClaimToken(token);

    if (!session) {
      clearClaimSessionCookies(res);

      return res.status(401).json({
        success: false,
        loggedIn: false,
        sessionExpired: true,
        message:
          "Your 4-hour verification session expired. Please verify OTP again.",
      });
    }

    const artist = await TattooStudio.findById(session.profileId).select(
      "claimed phoneVerified ownerVerified updatedByOwner",
    );

    if (!artist) {
      clearClaimSessionCookies(res);

      return res.status(401).json({
        success: false,
        loggedIn: false,
        sessionExpired: true,
        claimRevoked: true,
        message: "Artist profile not found. Please verify OTP again.",
      });
    }

    const claimActive = Boolean(
      artist.claimed === true &&
      artist.phoneVerified === true &&
      artist.ownerVerified === true,
    );

    if (!claimActive) {
      clearClaimSessionCookies(res);

      return res.status(401).json({
        success: false,
        loggedIn: false,
        sessionExpired: true,
        claimRevoked: true,
        message: "Your artist claim was reset. Please verify OTP again.",
      });
    }

    req.claimSession = session;
    req.claimArtist = artist;

    return next();
  } catch (error) {
    console.error("❌ Claim session validation error:", error);

    clearClaimSessionCookies(res);

    return res.status(401).json({
      success: false,
      loggedIn: false,
      sessionExpired: true,
      message: "Unable to verify your claim session. Please verify OTP again.",
    });
  }
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");

    if (parts.length < 2) {
      return null;
    }

    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }
}

function tryParseJsonString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  if (!text) {
    return null;
  }

  const possibleObject = text.startsWith("{") && text.endsWith("}");

  const possibleArray = text.startsWith("[") && text.endsWith("]");

  if (!possibleObject && !possibleArray) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function addPhoneCandidate(value, found) {
  if (typeof value === "number") {
    const normalized = normalizePhone(value);

    if (normalized) {
      found.add(normalized);
    }

    return;
  }

  if (typeof value !== "string") {
    return;
  }

  const text = value.trim();

  if (!text) {
    return;
  }

  if (/^[+\d\s().-]+$/.test(text)) {
    const normalized = normalizePhone(text);

    if (normalized) {
      found.add(normalized);
    }
  }

  const matches =
    text.match(/(?:\+?91[\s().-]*)?[6-9](?:[\s().-]*\d){9}/g) || [];

  for (const match of matches) {
    const normalized = normalizePhone(match);

    if (normalized) {
      found.add(normalized);
    }
  }
}

function collectVerifiedPhones(value, depth = 0, found = new Set()) {
  if (value === null || value === undefined || depth > 8) {
    return found;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectVerifiedPhones(item, depth + 1, found);
    }

    return found;
  }

  if (typeof value === "string") {
    const parsed = tryParseJsonString(value);

    if (parsed !== null) {
      collectVerifiedPhones(parsed, depth + 1, found);
    }

    addPhoneCandidate(value, found);

    return found;
  }

  if (typeof value === "number") {
    addPhoneCandidate(value, found);

    return found;
  }

  if (typeof value !== "object") {
    return found;
  }

  for (const nested of Object.values(value)) {
    collectVerifiedPhones(nested, depth + 1, found);
  }

  return found;
}

function getVerifiedPhoneCandidates(msg91Result, accessToken) {
  const found = new Set();

  collectVerifiedPhones(msg91Result, 0, found);

  const tokenPayload = decodeJwtPayload(accessToken);

  if (tokenPayload) {
    collectVerifiedPhones(tokenPayload, 0, found);
  }

  return found;
}

function isVerifiedPhoneConfirmed(msg91Result, accessToken, expectedPhone) {
  if (!expectedPhone) {
    return false;
  }

  const candidates = getVerifiedPhoneCandidates(msg91Result, accessToken);

  return candidates.has(expectedPhone);
}

function maskCandidatePhones(candidates) {
  return Array.from(candidates).map((phone) => maskPhone(phone));
}

function getMsg91AuthKey() {
  const authkey = String(process.env.MSG91_AUTH_KEY || "").trim();

  if (!authkey) {
    throw new Error("MSG91_AUTH_KEY is missing in backend .env");
  }

  return authkey;
}

function getMsg91OtpTemplateId() {
  const templateId = String(
    process.env.MSG91_OTP_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID || "",
  ).trim();

  if (!templateId) {
    throw new Error("MSG91_OTP_TEMPLATE_ID is missing in backend .env");
  }

  return templateId;
}

async function readMsg91Json(response) {
  const rawText = await response.text();

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    console.error("❌ MSG91 INVALID RESPONSE:", rawText);

    throw new Error("MSG91 returned an invalid response.");
  }
}

async function sendDirectMsg91Otp(phone) {
  const authkey = getMsg91AuthKey();

  const templateId = getMsg91OtpTemplateId();

  const url = new URL("https://control.msg91.com/api/v5/otp");

  url.searchParams.set("template_id", templateId);

  url.searchParams.set("mobile", phone);

  url.searchParams.set("otp_length", "6");

  const response = await fetch(url, {
    method: "POST",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authkey,
    },
  });

  const data = await readMsg91Json(response);

  const type = String(data?.type || "")
    .trim()
    .toLowerCase();

  if (!response.ok || type === "error" || data?.success === false) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Unable to send OTP to the new mobile number.",
    );
  }

  return data;
}

async function verifyDirectMsg91Otp(phone, otp) {
  const authkey = getMsg91AuthKey();

  const url = new URL("https://control.msg91.com/api/v5/otp/verify");

  url.searchParams.set("otp", otp);

  url.searchParams.set("mobile", phone);

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Accept: "application/json",
      authkey,
    },
  });

  const data = await readMsg91Json(response);

  const type = String(data?.type || "")
    .trim()
    .toLowerCase();

  const message = String(data?.message || "")
    .trim()
    .toLowerCase();

  const verified =
    response.ok &&
    data?.success !== false &&
    type !== "error" &&
    (type === "success" ||
      message.includes("otp verified success") ||
      message.includes("otp verified successfully"));

  if (!verified) {
    throw new Error(
      data?.message || data?.error || "Incorrect or expired OTP.",
    );
  }

  return data;
}

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Claim API is working.",
    sessionHours: 4,
  });
});

router.post("/find", async (req, res) => {
  try {
    const query = String(req.body?.query || "").trim();

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Enter at least 2 characters.",
      });
    }

    const regex = new RegExp(escapeRegExp(query), "i");

    const profiles = await TattooStudio.find({
      $or: [
        {
          name: regex,
        },
        {
          artistName: regex,
        },
        {
          professionalName: regex,
        },
        {
          studio: regex,
        },
        {
          studioName: regex,
        },
        {
          city: regex,
        },
        {
          state: regex,
        },
      ],
    })
      .limit(25)
      .lean();

    const safeProfiles = profiles.map((profile) => ({
      _id: profile._id,

      id: profile._id,

      name:
        profile.name ||
        profile.artistName ||
        profile.professionalName ||
        "Artist",

      studio: profile.studio || profile.studioName || "",

      city: profile.city || "",

      state: profile.state || "",

      profileImage: profile.profileImage || "",

      plan: normalizePlan(profile.plan),

      paymentStatus: String(profile.paymentStatus || "unpaid")
        .trim()
        .toLowerCase(),

      planStartedAt: profile.planStartedAt || null,

      planExpiresAt: profile.planExpiresAt || null,

      silverToGoldUpgradeUsed: Boolean(profile.silverToGoldUpgradeUsed),

      claimed: Boolean(profile.claimed),

      maskedPhone: maskPhone(profile.phone),

      phoneMasked: maskPhone(profile.phone),
    }));

    return res.status(200).json({
      success: true,

      count: safeProfiles.length,

      profiles: safeProfiles,

      artists: safeProfiles,

      results: safeProfiles,
    });
  } catch (error) {
    console.error("❌ Claim search error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to search profiles.",

      error: error.message,
    });
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    const { profileId } = req.body || {};

    if (!profileId) {
      return res.status(400).json({
        success: false,

        message: "profileId is required.",
      });
    }

    const studio = await TattooStudio.findById(profileId)
      .select("_id phone")
      .lean();

    if (!studio) {
      return res.status(404).json({
        success: false,

        message: "Artist profile not found.",
      });
    }

    const identifier = normalizePhone(studio.phone);

    if (!identifier) {
      return res.status(400).json({
        success: false,

        message: "This artist does not have a valid registered mobile number.",
      });
    }

    return res.status(200).json({
      success: true,

      identifier,

      maskedPhone: maskPhone(identifier),

      phoneMasked: maskPhone(identifier),
    });
  } catch (error) {
    console.error("❌ Prepare OTP error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to prepare OTP verification.",

      error: error.message,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { profileId, accessToken } = req.body || {};

    if (!profileId || !accessToken) {
      return res.status(400).json({
        success: false,

        message: "profileId and accessToken are required.",
      });
    }

    const studio = await TattooStudio.findById(profileId);

    if (!studio) {
      return res.status(404).json({
        success: false,

        message: "Artist profile not found.",
      });
    }

    const msg91Result = await verifyMsg91AccessToken(accessToken);

    const profilePhone = normalizePhone(studio.phone);

    if (!profilePhone) {
      return res.status(400).json({
        success: false,

        message: "This artist does not have a valid registered mobile number.",
      });
    }

    const verifiedPhoneCandidates = getVerifiedPhoneCandidates(
      msg91Result,
      accessToken,
    );

    console.log("========================================");

    console.log("✅ MSG91 access token verified");

    console.log("📱 EXPECTED PROFILE PHONE:", maskPhone(profilePhone));

    console.log(
      "📱 VERIFIED PHONE CANDIDATES:",
      maskCandidatePhones(verifiedPhoneCandidates),
    );

    console.log("========================================");

    const phoneConfirmed = verifiedPhoneCandidates.has(profilePhone);

    if (!phoneConfirmed) {
      console.error(
        "❌ MSG91 verified token phone does not match artist profile.",
      );

      return res.status(403).json({
        success: false,

        message: "Verified mobile number does not match this artist profile.",
      });
    }

    console.log("✅ Verified mobile matches artist profile");

    const now = new Date();

    studio.claimed = true;
    studio.phoneVerified = true;
    studio.ownerVerified = true;
    studio.updatedByOwner = true;

    if (!studio.claimedAt) {
      studio.claimedAt = now;
    }

    studio.updatedAt = now;

    await studio.save();

    await ensureMembershipCurrent(studio);

    const sessionExpiresAt = Date.now() + CLAIM_SESSION_MS;

    const claimToken = signClaimToken(studio._id, sessionExpiresAt);

    res.cookie(CLAIM_COOKIE, claimToken, claimCookieOptions());

    console.log("✅ OTP verified");

    console.log("🔐 4-hour claim session started:", String(studio._id));

    return res.status(200).json({
      success: true,

      message: "OTP verified successfully. You are logged in for 4 hours.",

      sessionHours: 4,

      sessionExpiresAt,

      profile: studio.toObject(),

      artist: studio.toObject(),

      maskedPhone: maskPhone(studio.phone),

      phoneMasked: maskPhone(studio.phone),
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);

    return res.status(401).json({
      success: false,

      message: error.message || "OTP verification failed or expired.",
    });
  }
});

router.get("/me", requireClaimSession, async (req, res) => {
  try {
    const studio = await TattooStudio.findById(req.claimSession.profileId);

    if (!studio) {
      return res.status(404).json({
        success: false,

        message: "Artist profile not found.",
      });
    }

    await ensureMembershipCurrent(studio);

    return res.status(200).json({
      success: true,

      loggedIn: true,

      sessionHours: 4,

      sessionExpiresAt: Number(req.claimSession.exp),

      profile: studio.toObject(),

      artist: studio.toObject(),

      maskedPhone: maskPhone(studio.phone),

      phoneMasked: maskPhone(studio.phone),
    });
  } catch (error) {
    console.error("❌ Claim me error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to load profile.",
    });
  }
});

router.post("/update", requireClaimSession, async (req, res) => {
  try {
    const {
      profileId,
      name,
      email,
      city,
      state,
      studio,
      experience,
      instagram,
      tattooStyles,
      bio,
      profileLinks,
      profileImage,
      portfolioImages,
    } = req.body || {};

    if (
      !profileId ||
      String(profileId) !== String(req.claimSession.profileId)
    ) {
      return res.status(403).json({
        success: false,

        message: "You cannot update this profile.",
      });
    }

    const artist = await TattooStudio.findById(profileId);

    if (!artist) {
      return res.status(404).json({
        success: false,

        message: "Artist profile not found.",
      });
    }

    if (typeof name === "string") {
      artist.name = name.trim();
    }

    if (typeof email === "string") {
      artist.email = email.trim().toLowerCase();
    }

    if (typeof city === "string") {
      artist.city = city.trim();
    }

    if (typeof state === "string") {
      artist.state = state.trim();
    }

    if (typeof studio === "string") {
      artist.studio = studio.trim();

      if (
        Object.prototype.hasOwnProperty.call(artist.toObject(), "studioName")
      ) {
        artist.studioName = studio.trim();
      }
    }

    if (typeof experience === "string") {
      artist.experience = experience.trim();
    }

    if (typeof instagram === "string") {
      artist.instagram = instagram.trim();
    }

    if (typeof bio === "string") {
      const cleanBio = bio.trim();

      if (cleanBio.length > 1500) {
        return res.status(400).json({
          success: false,

          message: "Bio must be 1500 characters or less.",
        });
      }

      artist.bio = cleanBio;
    }

    if (profileLinks !== undefined) {
      if (!Array.isArray(profileLinks)) {
        return res.status(400).json({
          success: false,

          message: "profileLinks must be an array.",
        });
      }

      artist.profileLinks = profileLinks
        .map((link) => String(link || "").trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    if (typeof profileImage === "string") {
      artist.profileImage = profileImage.trim() ? profileImage : "";
    }

    if (tattooStyles !== undefined) {
      if (!Array.isArray(tattooStyles)) {
        return res.status(400).json({
          success: false,

          message: "tattooStyles must be an array.",
        });
      }

      const normalizedStyles = normalizeTattooStyles(tattooStyles);

      if (tattooStyles.length > 0 && normalizedStyles.length === 0) {
        return res.status(400).json({
          success: false,

          message: "Please select valid tattoo styles.",
        });
      }

      artist.tattooStyles = normalizedStyles;
    }

    if (portfolioImages !== undefined) {
      if (!Array.isArray(portfolioImages)) {
        return res.status(400).json({
          success: false,

          message: "portfolioImages must be an array.",
        });
      }

      artist.portfolioImages = portfolioImages
        .map((image) => String(image || "").trim())
        .filter(Boolean)
        .slice(0, 10);
    }

    artist.claimed = true;
    artist.phoneVerified = true;
    artist.ownerVerified = true;
    artist.updatedByOwner = true;
    artist.updatedAt = new Date();

    await artist.save();

    const responseProfile =
      String(req.query?.compact || "") === "1"
        ? compactOwnerProfile(artist)
        : artist.toObject();

    return res.status(200).json({
      success: true,

      message: "Profile updated successfully.",

      profile: responseProfile,

      artist: responseProfile,

      maskedPhone: maskPhone(artist.phone),

      phoneMasked: maskPhone(artist.phone),
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to update profile.",
    });
  }
});

router.post("/select-free", requireClaimSession, async (req, res) => {
  try {
    const artist = await TattooStudio.findById(req.claimSession.profileId);

    if (!artist) {
      return res.status(404).json({
        success: false,

        message: "Artist profile not found.",
      });
    }

    await ensureMembershipCurrent(artist);

    const currentPlan = normalizePlan(artist.plan);

    const expiry = artist.planExpiresAt
      ? new Date(artist.planExpiresAt).getTime()
      : 0;

    const hasActivePaidMembership =
      (currentPlan === "pro" || currentPlan === "verified") &&
      artist.paymentStatus === "paid" &&
      expiry > Date.now();

    if (hasActivePaidMembership) {
      return res.status(409).json({
        success: false,

        message:
          "Your paid membership is still active. It will return to Free automatically after expiry.",

        plan: currentPlan,

        planExpiresAt: artist.planExpiresAt,
      });
    }

    applyBasicPlan(artist);

    artist.planStartedAt = null;
    artist.planExpiresAt = null;

    await artist.save();

    return res.status(200).json({
      success: true,

      message: "Free / Basic listing is active.",

      profile: artist.toObject(),

      artist: artist.toObject(),
    });
  } catch (error) {
    console.error("❌ Select free plan error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to activate the Free plan.",
    });
  }
});

router.post("/change-phone/send-otp", requireClaimSession, async (req, res) => {
  try {
    const { profileId, newPhone } = req.body || {};

    if (
      !profileId ||
      String(profileId) !== String(req.claimSession.profileId)
    ) {
      return res.status(403).json({
        success: false,

        message: "You cannot update this profile.",
      });
    }

    const normalizedNewPhone = normalizePhone(newPhone);

    if (!normalizedNewPhone) {
      return res.status(400).json({
        success: false,

        message: "Enter a valid new mobile number.",
      });
    }

    const artist = await TattooStudio.findById(profileId).lean();

    if (!artist) {
      return res.status(404).json({
        success: false,

        message: "Artist profile not found.",
      });
    }

    const currentPhone = normalizePhone(artist.phone);

    if (currentPhone && currentPhone === normalizedNewPhone) {
      return res.status(400).json({
        success: false,

        message: "This is already your registered mobile number.",
      });
    }

    await sendDirectMsg91Otp(normalizedNewPhone);

    console.log("📲 Change-phone OTP sent:", maskPhone(normalizedNewPhone));

    return res.status(200).json({
      success: true,

      message: "OTP sent to the new mobile number.",

      maskedPhone: maskPhone(normalizedNewPhone),

      phoneMasked: maskPhone(normalizedNewPhone),
    });
  } catch (error) {
    console.error("❌ Change phone send OTP error:", error);

    return res.status(400).json({
      success: false,

      message: error.message || "Unable to send OTP to the new mobile number.",
    });
  }
});

router.post(
  "/change-phone/verify-otp",
  requireClaimSession,
  async (req, res) => {
    try {
      const { profileId, newPhone, otp, accessToken } = req.body || {};

      if (
        !profileId ||
        String(profileId) !== String(req.claimSession.profileId)
      ) {
        return res.status(403).json({
          success: false,

          message: "You cannot update this profile.",
        });
      }

      const normalizedNewPhone = normalizePhone(newPhone);

      if (!normalizedNewPhone) {
        return res.status(400).json({
          success: false,

          message: "Enter a valid new mobile number.",
        });
      }

      if (accessToken) {
        const msg91Result = await verifyMsg91AccessToken(accessToken);

        const newPhoneConfirmed = isVerifiedPhoneConfirmed(
          msg91Result,
          accessToken,
          normalizedNewPhone,
        );

        if (!newPhoneConfirmed) {
          return res.status(403).json({
            success: false,

            message:
              "The verified number does not match the new mobile number.",
          });
        }
      } else {
        const cleanOtp = String(otp || "").replace(/\D/g, "");

        if (!/^\d{4,6}$/.test(cleanOtp)) {
          return res.status(400).json({
            success: false,

            message: "Enter the OTP sent to the new mobile number.",
          });
        }

        await verifyDirectMsg91Otp(normalizedNewPhone, cleanOtp);
      }

      const artist = await TattooStudio.findById(profileId);

      if (!artist) {
        return res.status(404).json({
          success: false,

          message: "Artist profile not found.",
        });
      }

      artist.phone = `+${normalizedNewPhone}`;

      artist.phoneVerified = true;
      artist.claimed = true;
      artist.ownerVerified = true;
      artist.updatedByOwner = true;
      artist.updatedAt = new Date();

      await artist.save();

      return res.status(200).json({
        success: true,

        message: "Mobile number updated successfully.",

        maskedPhone: maskPhone(artist.phone),

        phoneMasked: maskPhone(artist.phone),

        profile: artist.toObject(),

        artist: artist.toObject(),
      });
    } catch (error) {
      console.error("❌ Change phone error:", error);

      return res.status(401).json({
        success: false,

        message: error.message || "Unable to verify the new mobile number.",
      });
    }
  },
);

router.post("/logout", (req, res) => {
  clearClaimSessionCookies(res);

  return res.status(200).json({
    success: true,
    loggedIn: false,
    message: "Logged out successfully.",
  });
});

module.exports = router;

// IMPORTANT:
// GET ENTRY reuses the exact same claim-session middleware.
module.exports.requireClaimSession = requireClaimSession;
