const express = require("express");
const crypto = require("crypto");

const TattooStudio = require("../models/TattooStudio");
const ClaimOtp = require("../models/ClaimOtp");

const router = express.Router();

const OTP_EXPIRY_MINUTES = 5;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/* =========================================================
   HELPERS
========================================================= */

function normalizePhone(phone) {
  if (!phone) return "";

  let value = String(phone).trim();

  // Remove spaces, brackets, hyphens, etc.
  value = value.replace(/[^\d+]/g, "");

  // Convert 0091XXXXXXXXXX -> +91XXXXXXXXXX
  if (value.startsWith("0091")) {
    value = "+" + value.substring(2);
  }

  // Convert 91XXXXXXXXXX -> +91XXXXXXXXXX
  if (/^91\d{10}$/.test(value)) {
    value = "+" + value;
  }

  // Convert 10-digit Indian number -> +91XXXXXXXXXX
  if (/^\d{10}$/.test(value)) {
    value = "+91" + value;
  }

  return value;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 4) {
    return "REGISTERED NUMBER";
  }

  return `${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

/* =========================================================
   SEND SMS USING FAST2SMS
========================================================= */

async function sendSms(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    throw new Error("FAST2SMS_API_KEY is missing in .env");
  }

  const cleanPhone = phone.replace(/\D/g, "");

  const message =
    `Your Ink Convention verification OTP is ${otp}. ` +
    `It is valid for ${OTP_EXPIRY_MINUTES} minutes. ` +
    `Do not share this OTP with anyone.`;

  const response = await fetch(
    "https://www.fast2sms.com/dev/bulkV2",
    {
      method: "POST",

      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        route: "q",
        message,
        numbers: cleanPhone,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.return === false) {
    console.error("Fast2SMS error:", data);

    throw new Error(
      data.message ||
        "Unable to send SMS. Please try again."
    );
  }

  console.log(
    `📱 OTP SMS sent to ${maskPhone(phone)}`
  );

  return data;
}

/* =========================================================
   POST /api/claim/send-otp
========================================================= */

router.post("/send-otp", async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "profileId is required.",
      });
    }

    const studio = await TattooStudio.findById(profileId);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Artist profile not found.",
      });
    }

    const phone = normalizePhone(studio.phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message:
          "This artist does not have a registered phone number.",
      });
    }

    // Check whether a recently generated OTP exists
    const existingOtp = await ClaimOtp.findOne({
      profileId: studio._id,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existingOtp) {
      const secondsSinceCreation =
        Math.floor(
          (Date.now() - existingOtp.createdAt.getTime()) /
            1000
        );

      if (secondsSinceCreation < RESEND_SECONDS) {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another OTP.",
          resendAfterSeconds:
            RESEND_SECONDS - secondsSinceCreation,
        });
      }

      await ClaimOtp.deleteMany({
        profileId: studio._id,
        verified: false,
      });
    }

    // Generate OUR OWN OTP
    const otp = generateOtp();

    const otpHash = hashOtp(otp);

    const expiresAt = new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // Store only the HASH, not the actual OTP
    await ClaimOtp.create({
      profileId: studio._id,
      phone,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    // Send the actual OTP to the phone
    await sendSms(phone, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
      maskedPhone: maskPhone(phone),
      resendAfterSeconds: RESEND_SECONDS,
    });
  } catch (error) {
    console.error(
      "❌ Send OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to send OTP.",
    });
  }
});

/* =========================================================
   POST /api/claim/verify-otp
========================================================= */

router.post("/verify-otp", async (req, res) => {
  try {
    const { profileId, otp } = req.body;

    if (!profileId || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "profileId and OTP are required.",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit OTP.",
      });
    }

    const otpRecord = await ClaimOtp.findOne({
      profileId,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await ClaimOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await ClaimOtp.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const incomingHash = hashOtp(otp);

    if (incomingHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP.",
        attemptsRemaining:
          MAX_ATTEMPTS - otpRecord.attempts,
      });
    }

    // OTP is correct
    otpRecord.verified = true;
    await otpRecord.save();

    const studio = await TattooStudio.findById(
      profileId
    ).lean();

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Artist profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully.",
      profile: studio,
      maskedPhone: maskPhone(
        studio.phone
      ),
    });
  } catch (error) {
    console.error(
      "❌ Verify OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify OTP.",
    });
  }
});

/* =========================================================
   GET /api/claim/me
========================================================= */

router.get("/me", async (req, res) => {
  return res.status(401).json({
    success: false,
    message:
      "No active claim session.",
  });
});

module.exports = router;