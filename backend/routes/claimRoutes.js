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

/* =========================================================
   CLAIM SESSION

   EXACTLY 4 HOURS
========================================================= */

const CLAIM_COOKIE = "ink_claim_session";

const CLAIM_SESSION_MS = 4 * 60 * 60 * 1000;

/* =========================================================
   PHONE HELPERS
========================================================= */

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

/* =========================================================
   REGEX SAFE
========================================================= */

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* =========================================================
   TATTOO STYLE HELPERS

   PULLED BOOK YOUR ARTIST
   FEATURE KEPT
========================================================= */

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

/* =========================================================
   CLAIM SESSION SECRET
========================================================= */

function getClaimSecret() {
  const secret = String(process.env.CLAIM_SESSION_SECRET || "").trim();

  if (!secret) {
    throw new Error("CLAIM_SESSION_SECRET is missing in backend .env");
  }

  return secret;
}

/* =========================================================
   CREATE CLAIM SESSION
========================================================= */

function signClaimToken(
  profileId,

  expiresAt = Date.now() + CLAIM_SESSION_MS,
) {
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

/* =========================================================
   VERIFY CLAIM SESSION
========================================================= */

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

/* =========================================================
   READ COOKIE
========================================================= */

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

/* =========================================================
   COOKIE SETTINGS
========================================================= */

function claimCookieOptions() {
  const production = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: production,

    sameSite: production ? "none" : "lax",

    maxAge: CLAIM_SESSION_MS,

    path: "/api/claim",
  };
}

function clearClaimCookieOptions() {
  const production = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: production,

    sameSite: production ? "none" : "lax",

    path: "/api/claim",
  };
}

/* =========================================================
   REQUIRE LOGIN SESSION
========================================================= */

function requireClaimSession(req, res, next) {
  const token = getCookie(req, CLAIM_COOKIE);

  const session = verifyClaimToken(token);

  if (!session) {
    return res.status(401).json({
      success: false,

      sessionExpired: true,

      message:
        "Your 4-hour verification session expired. Please verify OTP again.",
    });
  }

  req.claimSession = session;

  next();
}

/* =========================================================
   JWT PAYLOAD
========================================================= */

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

/* =========================================================
   MSG91 PHONE EXTRACTION
========================================================= */

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

/* =========================================================
   ADD PHONE CANDIDATE
========================================================= */

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

/* =========================================================
   COLLECT VERIFIED PHONES
========================================================= */

function collectVerifiedPhones(
  value,

  depth = 0,

  found = new Set(),
) {
  if (value === null || value === undefined || depth > 8) {
    return found;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectVerifiedPhones(
        item,

        depth + 1,

        found,
      );
    }

    return found;
  }

  if (typeof value === "string") {
    const parsed = tryParseJsonString(value);

    if (parsed !== null) {
      collectVerifiedPhones(
        parsed,

        depth + 1,

        found,
      );
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
    collectVerifiedPhones(
      nested,

      depth + 1,

      found,
    );
  }

  return found;
}

/* =========================================================
   GET VERIFIED PHONE CANDIDATES
========================================================= */

function getVerifiedPhoneCandidates(msg91Result, accessToken) {
  const found = new Set();

  collectVerifiedPhones(msg91Result, 0, found);

  const tokenPayload = decodeJwtPayload(accessToken);

  if (tokenPayload) {
    collectVerifiedPhones(tokenPayload, 0, found);
  }

  return found;
}

/* =========================================================
   PHONE CONFIRMATION
========================================================= */

function isVerifiedPhoneConfirmed(msg91Result, accessToken, expectedPhone) {
  if (!expectedPhone) {
    return false;
  }

  const candidates = getVerifiedPhoneCandidates(msg91Result, accessToken);

  return candidates.has(expectedPhone);
}

/* =========================================================
   SAFE PHONE LOGGING
========================================================= */

function maskCandidatePhones(candidates) {
  return Array.from(candidates).map((phone) => maskPhone(phone));
}

/* =========================================================
   MSG91 DIRECT OTP HELPERS

   USED FOR CHANGE PHONE ONLY

   MAIN OWNER OTP STILL USES
   MSG91 WIDGET
========================================================= */

function getMsg91AuthKey() {
  const authkey = String(process.env.MSG91_AUTH_KEY || "").trim();

  if (!authkey) {
    throw new Error("MSG91_AUTH_KEY is missing in backend .env");
  }

  return authkey;
}

/* =========================================================
   OTP TEMPLATE
========================================================= */

function getMsg91OtpTemplateId() {
  const templateId = String(
    process.env.MSG91_OTP_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID || "",
  ).trim();

  if (!templateId) {
    throw new Error("MSG91_OTP_TEMPLATE_ID is missing in backend .env");
  }

  return templateId;
}

/* =========================================================
   READ MSG91 RESPONSE
========================================================= */

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

/* =========================================================
   SEND DIRECT OTP

   CHANGE PHONE ONLY
========================================================= */

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

/* =========================================================
   VERIFY DIRECT OTP

   CHANGE PHONE ONLY
========================================================= */

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

/* =========================================================
   HEALTH CHECK

   GET
   /api/claim
========================================================= */

router.get(
  "/",

  (req, res) => {
    return res.status(200).json({
      success: true,

      message: "Claim API is working.",

      sessionHours: 4,
    });
  },
);

/* =========================================================
   FIND ARTIST

   POST
   /api/claim/find
========================================================= */

router.post(
  "/find",

  async (req, res) => {
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

      /* =============================================
         DO NOT EXPOSE RAW PHONE
         DURING OWNER SEARCH
      ============================================= */

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
  },
);

/* =========================================================
   PREPARE MAIN OTP

   POST
   /api/claim/send-otp

   FRONTEND SENDS PROFILE ID.

   BACKEND READS SAVED PHONE.
========================================================= */

router.post(
  "/send-otp",

  async (req, res) => {
    try {
      const { profileId } = req.body || {};

      if (!profileId) {
        return res.status(400).json({
          success: false,

          message: "profileId is required.",
        });
      }

      const studio = await TattooStudio.findById(profileId).lean();

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

          message:
            "This artist does not have a valid registered mobile number.",
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
  },
);

/* =========================================================
   VERIFY MAIN OTP

   POST
   /api/claim/verify-otp

   {
     profileId,
     accessToken
   }
========================================================= */

router.post(
  "/verify-otp",

  async (req, res) => {
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

      /* =============================================
         VERIFY TOKEN WITH MSG91
      ============================================= */

      const msg91Result = await verifyMsg91AccessToken(accessToken);

      /* =============================================
         PHONE SAVED ON THIS ARTIST
      ============================================= */

      const profilePhone = normalizePhone(studio.phone);

      if (!profilePhone) {
        return res.status(400).json({
          success: false,

          message:
            "This artist does not have a valid registered mobile number.",
        });
      }

      /* =============================================
         GET VERIFIED PHONE FROM MSG91
      ============================================= */

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

      /* =============================================
         SECURITY

         A VALID OTP FOR ARTIST A
         CANNOT UNLOCK ARTIST B.
      ============================================= */

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

      /* =============================================
         MARK OWNER VERIFIED
      ============================================= */

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

      /* =============================================
         CHECK MEMBERSHIP EXPIRY
      ============================================= */

      await ensureMembershipCurrent(studio);

      /* =============================================
         CREATE EXACT 4-HOUR SESSION

         THIS HAPPENS ONLY AFTER OTP.

         PAYMENT NEVER RESTARTS
         THIS SESSION.
      ============================================= */

      const sessionExpiresAt = Date.now() + CLAIM_SESSION_MS;

      const claimToken = signClaimToken(
        studio._id,

        sessionExpiresAt,
      );

      res.cookie(
        CLAIM_COOKIE,

        claimToken,

        claimCookieOptions(),
      );

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
  },
);

/* =========================================================
   CURRENT VERIFIED PROFILE

   GET
   /api/claim/me

   PRIVATE OWNER FLOW ONLY.

   THIS DOES NOT CREATE
   OR REFRESH A SESSION.
========================================================= */

router.get(
  "/me",

  requireClaimSession,

  async (req, res) => {
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

        /* =========================================
             ORIGINAL SESSION EXPIRY

             DO NOT RESET.
          ========================================= */

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
  },
);

/* =========================================================
   IMPORTANT

   THERE IS NO:

   /refresh-session

   OWNER SESSION IS EXACTLY
   4 HOURS FROM MAIN OTP.
========================================================= */

/* =========================================================
   UPDATE PROFILE

   POST
   /api/claim/update

   ALL DETAILS ARE SAVED
   REGARDLESS OF PLAN.

   PLAN ONLY CONTROLS
   PUBLIC VISIBILITY.
========================================================= */

router.post(
  "/update",

  requireClaimSession,

  async (req, res) => {
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

        profileImage,

        portfolioImages,
      } = req.body || {};

      /* =============================================
         SECURITY

         OWNER CAN UPDATE ONLY
         THE VERIFIED PROFILE.
      ============================================= */

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

      /* =============================================
         NAME
      ============================================= */

      if (typeof name === "string") {
        artist.name = name.trim();
      }

      /* =============================================
         EMAIL
      ============================================= */

      if (typeof email === "string") {
        artist.email = email.trim().toLowerCase();
      }

      /* =============================================
         CITY
      ============================================= */

      if (typeof city === "string") {
        artist.city = city.trim();
      }

      /* =============================================
         STATE
      ============================================= */

      if (typeof state === "string") {
        artist.state = state.trim();
      }

      /* =============================================
         STUDIO
      ============================================= */

      if (typeof studio === "string") {
        artist.studio = studio.trim();

        if (
          Object.prototype.hasOwnProperty.call(artist.toObject(), "studioName")
        ) {
          artist.studioName = studio.trim();
        }
      }

      /* =============================================
         EXPERIENCE
      ============================================= */

      if (typeof experience === "string") {
        artist.experience = experience.trim();
      }

      /* =============================================
         INSTAGRAM
      ============================================= */

      if (typeof instagram === "string") {
        artist.instagram = instagram.trim();
      }

      /* =============================================
         BIO
      ============================================= */

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

      /* =============================================
         PROFILE IMAGE
      ============================================= */

      if (typeof profileImage === "string") {
        artist.profileImage = profileImage.trim() ? profileImage : "";
      }

      /* =============================================
         TATTOO SPECIALITIES

         PULLED BOOK YOUR ARTIST
         FEATURE KEPT
      ============================================= */

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

      /* =============================================
         PORTFOLIO

         MAXIMUM 3
      ============================================= */

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
          .slice(0, 3);
      }

      /* =============================================
         OWNER FLAGS
      ============================================= */

      artist.claimed = true;

      artist.phoneVerified = true;

      artist.ownerVerified = true;

      artist.updatedByOwner = true;

      artist.updatedAt = new Date();

      /* =============================================
         SAVE

         FREE / SILVER / GOLD
         DOES NOT DELETE DETAILS.
      ============================================= */

      await artist.save();

      return res.status(200).json({
        success: true,

        message: "Profile updated successfully.",

        profile: artist.toObject(),

        artist: artist.toObject(),

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
  },
);

/* =========================================================
   SELECT FREE / BASIC

   POST
   /api/claim/select-free

   PROFILE DETAILS STAY SAVED.
========================================================= */

router.post(
  "/select-free",

  requireClaimSession,

  async (req, res) => {
    try {
      const artist = await TattooStudio.findById(req.claimSession.profileId);

      if (!artist) {
        return res.status(404).json({
          success: false,

          message: "Artist profile not found.",
        });
      }

      /* =============================================
         FIRST CHECK MEMBERSHIP
      ============================================= */

      await ensureMembershipCurrent(artist);

      const currentPlan = normalizePlan(artist.plan);

      const expiry = artist.planExpiresAt
        ? new Date(artist.planExpiresAt).getTime()
        : 0;

      const hasActivePaidMembership =
        (currentPlan === "pro" || currentPlan === "verified") &&
        artist.paymentStatus === "paid" &&
        expiry > Date.now();

      /* =============================================
         DO NOT DESTROY ACTIVE
         SILVER / GOLD MEMBERSHIP
      ============================================= */

      if (hasActivePaidMembership) {
        return res.status(409).json({
          success: false,

          message:
            "Your paid membership is still active. It will return to Free automatically after expiry.",

          plan: currentPlan,

          planExpiresAt: artist.planExpiresAt,
        });
      }

      /* =============================================
         ACTIVATE FREE
      ============================================= */

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
  },
);

/* =========================================================
   CHANGE PHONE

   SEND OTP

   POST
   /api/claim/change-phone/send-otp
========================================================= */

router.post(
  "/change-phone/send-otp",

  requireClaimSession,

  async (req, res) => {
    try {
      const { profileId, newPhone } = req.body || {};

      /* =============================================
         OWNERSHIP CHECK
      ============================================= */

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

      /* =============================================
         SEND OTP FROM BACKEND
      ============================================= */

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

        message:
          error.message || "Unable to send OTP to the new mobile number.",
      });
    }
  },
);

/* =========================================================
   CHANGE PHONE

   VERIFY OTP

   POST
   /api/claim/change-phone/verify-otp

   SUPPORTS:

   {
     profileId,
     newPhone,
     otp
   }

   OR

   {
     profileId,
     newPhone,
     accessToken
   }
========================================================= */

router.post(
  "/change-phone/verify-otp",

  requireClaimSession,

  async (req, res) => {
    try {
      const {
        profileId,

        newPhone,

        otp,

        accessToken,
      } = req.body || {};

      /* =============================================
         OWNERSHIP CHECK
      ============================================= */

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

      /* =============================================
         OPTION 1

         MSG91 WIDGET TOKEN
      ============================================= */

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
        /* ===========================================
           OPTION 2

           DIRECT OTP FROM ENTER.JSX
        =========================================== */

        const cleanOtp = String(otp || "").replace(/\D/g, "");

        if (!/^\d{4,6}$/.test(cleanOtp)) {
          return res.status(400).json({
            success: false,

            message: "Enter the OTP sent to the new mobile number.",
          });
        }

        await verifyDirectMsg91Otp(
          normalizedNewPhone,

          cleanOtp,
        );
      }

      /* =============================================
         OTP VERIFIED

         UPDATE PHONE
      ============================================= */

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

      /* =============================================
         IMPORTANT

         PHONE CHANGE DOES NOT
         RESTART THE 4-HOUR SESSION.
      ============================================= */

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

/* =========================================================
   LOGOUT

   POST
   /api/claim/logout
========================================================= */

router.post(
  "/logout",

  (req, res) => {
    res.clearCookie(
      CLAIM_COOKIE,

      clearClaimCookieOptions(),
    );

    return res.status(200).json({
      success: true,

      loggedIn: false,

      message: "Logged out successfully.",
    });
  },
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
