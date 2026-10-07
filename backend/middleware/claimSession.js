const crypto = require("crypto");

/* =========================================================
   SHARED CLAIM SESSION

   Used by BOTH:
   - /api/claim
   - /api/get

   Session duration: exactly 4 hours.
========================================================= */

const CLAIM_COOKIE = "ink_claim_session";
const CLAIM_SESSION_MS = 4 * 60 * 60 * 1000;

/* =========================================================
   SECRET
========================================================= */

function getClaimSecret() {
  const secret = String(process.env.CLAIM_SESSION_SECRET || "").trim();

  if (!secret) {
    throw new Error("CLAIM_SESSION_SECRET is missing in backend .env");
  }

  return secret;
}

/* =========================================================
   SIGN TOKEN
========================================================= */

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

/* =========================================================
   VERIFY TOKEN
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
   COOKIE HELPERS
========================================================= */

function getCookieValues(req, name) {
  const raw = String(req.headers.cookie || "");
  const values = [];

  for (const item of raw.split(";")) {
    const [key, ...rest] = item.trim().split("=");

    if (key === name) {
      try {
        values.push(decodeURIComponent(rest.join("=")));
      } catch {
        values.push(rest.join("="));
      }
    }
  }

  return values.filter(Boolean);
}

function claimCookieOptions() {
  const production = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    maxAge: CLAIM_SESSION_MS,

    // IMPORTANT:
    // Available to BOTH /api/claim and /api/get.
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

/* =========================================================
   SET SESSION COOKIE

   Also removes the old /api/claim-only cookie.
========================================================= */

function setClaimSessionCookie(res, token) {
  const options = claimCookieOptions();
  const session = verifyClaimToken(token);

  // Keep the ORIGINAL signed expiry.
  // This does NOT restart the 4-hour session.
  if (session?.exp) {
    options.maxAge = Math.max(1, Number(session.exp) - Date.now());
  }

  res.clearCookie(CLAIM_COOKIE, clearClaimCookieOptions("/api/claim"));

  res.cookie(CLAIM_COOKIE, token, options);
}

/* =========================================================
   CLEAR SESSION COOKIES
========================================================= */

function clearClaimSessionCookies(res) {
  res.clearCookie(CLAIM_COOKIE, clearClaimCookieOptions("/api"));

  // Remove old cookie from previous implementation.
  res.clearCookie(CLAIM_COOKIE, clearClaimCookieOptions("/api/claim"));
}

/* =========================================================
   REQUIRE VERIFIED CLAIM SESSION
========================================================= */

function requireClaimSession(req, res, next) {
  const tokens = getCookieValues(req, CLAIM_COOKIE);

  let session = null;
  let validToken = "";

  for (const token of tokens) {
    const verified = verifyClaimToken(token);

    if (verified) {
      session = verified;
      validToken = token;
      break;
    }
  }

  if (!session) {
    return res.status(401).json({
      success: false,
      sessionExpired: true,
      message:
        "Your 4-hour verification session expired. Please verify OTP again.",
    });
  }

  req.claimSession = session;

  /*
    MIGRATION SUPPORT

    Previous version stored the cookie only at:
    /api/claim

    Now we safely migrate it to:
    /api

    The SAME signed token and SAME expiry are used.
  */
  setClaimSessionCookie(res, validToken);

  next();
}

module.exports = {
  CLAIM_COOKIE,
  CLAIM_SESSION_MS,
  signClaimToken,
  verifyClaimToken,
  claimCookieOptions,
  clearClaimCookieOptions,
  setClaimSessionCookie,
  clearClaimSessionCookies,
  requireClaimSession,
};
