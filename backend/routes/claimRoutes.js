const express = require("express");


const TattooStudio = require("../models/TattooStudio");

const {
  verifyMsg91AccessToken,
} = require("../services/msg91OtpService");

const router = express.Router();



/* =========================================================
   HELPERS
========================================================= */

function normalizePhone(phone) {
  if (!phone) return "";

  let value = String(phone).trim();

  // Remove spaces, brackets, hyphens etc.
  value = value.replace(/[^\d+]/g, "");

  // 0091XXXXXXXXXX -> +91XXXXXXXXXX
  if (value.startsWith("0091")) {
    value = "+" + value.substring(2);
  }

  // 91XXXXXXXXXX -> +91XXXXXXXXXX
  if (/^91\d{10}$/.test(value)) {
    value = "+" + value;
  }

  // XXXXXXXXXX -> +91XXXXXXXXXX
  if (/^\d{10}$/.test(value)) {
    value = "+91" + value;
  }

  return value;
}

function phoneDigits(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  // Convert 10 digit number to 91XXXXXXXXXX
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  return digits;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 4) {
    return "REGISTERED NUMBER";
  }

  return `${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}`;
}

/* =========================================================
   GET VERIFIED IDENTIFIER FROM MSG91 RESPONSE
========================================================= */

function getVerifiedIdentifier(data) {
  if (!data || typeof data !== "object") {
    return "";
  }

  return (
    data.identifier ||
    data.mobile ||
    data.phone ||
    data.mobileNumber ||
    data.mobile_number ||
    data?.data?.identifier ||
    data?.data?.mobile ||
    data?.data?.phone ||
    data?.data?.mobileNumber ||
    data?.data?.mobile_number ||
    ""
  );
}

/* =========================================================
   POST /api/claim/send-otp

   NO LONGER SENDS OTP.

   MSG91 Web SDK handles sending OTP from frontend.

   We keep this endpoint temporarily so your existing frontend
   doesn't immediately get a 404 while we update Enter.jsx.
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

    const studio = await TattooStudio.findById(
      profileId
    ).lean();

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

    /*
      IMPORTANT:

      This endpoint DOES NOT send OTP anymore.

      Enter.jsx will call:
      window.sendOtp(...)

      through the MSG91 Widget.
    */

    return res.status(200).json({
      success: true,

      message:
        "Registered phone number found.",

      /*
        Frontend needs the identifier because MSG91
        custom Web SDK sends OTP from the browser.

        MSG91 wants country code WITHOUT +
        Example: 919876543210
      */
      identifier: phoneDigits(phone),

      maskedPhone: maskPhone(phone),
    });

  } catch (error) {
    console.error(
      "❌ Get claim phone error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to prepare OTP verification.",
    });
  }
});

/* =========================================================
   POST /api/claim/verify-otp

   FRONTEND WILL SEND:

   {
      profileId,
      accessToken
   }

========================================================= */

router.post("/verify-otp", async (req, res) => {
  try {
    const {
      profileId,
      accessToken,
    } = req.body;

    /* =============================================
       VALIDATE REQUEST
    ============================================= */

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "profileId is required.",
      });
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message:
          "OTP verification token is required.",
      });
    }

    /* =============================================
       FIND PROFILE
    ============================================= */

    const studio =
      await TattooStudio.findById(
        profileId
      ).lean();

    if (!studio) {
      return res.status(404).json({
        success: false,
        message:
          "Artist profile not found.",
      });
    }

    if (!studio.phone) {
      return res.status(400).json({
        success: false,
        message:
          "This artist does not have a registered phone number.",
      });
    }

    /* =============================================
       VERIFY ACCESS TOKEN WITH MSG91
    ============================================= */

    let msg91Result;

    try {
      msg91Result =
        await verifyMsg91AccessToken(
          accessToken
        );
    } catch (error) {
      console.error(
        "❌ MSG91 verification failed:",
        error.message
      );

      return res.status(401).json({
        success: false,
        message:
          "OTP verification failed or expired.",
      });
    }

    console.log(
      "✅ MSG91 access token verified"
    );

    /* =============================================
       SECURITY CHECK

       Make sure the phone verified by MSG91 is
       the SAME phone belonging to this profile.
    ============================================= */

    const verifiedIdentifier =
      getVerifiedIdentifier(
        msg91Result
      );

    if (verifiedIdentifier) {
      const profilePhone =
        phoneDigits(studio.phone);

      const verifiedPhone =
        phoneDigits(
          verifiedIdentifier
        );

      if (
        profilePhone !==
        verifiedPhone
      ) {
        console.error(
          "❌ Verified phone does not match profile phone"
        );

        return res.status(403).json({
          success: false,
          message:
            "Verified phone number does not match this artist profile.",
        });
      }
    }

    /* =============================================
       OTP IS NOW VERIFIED ✅

       Your previous route only returned the studio,
       so we preserve that same behavior.
    ============================================= */

    return res.status(200).json({
      success: true,

      message:
        "OTP verified successfully.",

      profile: studio,

      maskedPhone:
        maskPhone(studio.phone),
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
   POST /api/claim/update
========================================================= */

router.post("/update", async (req, res) => {
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
      profileImage,
    } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "profileId is required.",
      });
    }

    const artist = await TattooStudio.findById(profileId);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist profile not found.",
      });
    }

    // ============================================
    // UPDATE ALLOWED FIELDS
    // ============================================

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
    }

    if (typeof experience === "string") {
      artist.experience = experience.trim();
    }

    if (typeof instagram === "string") {
      artist.instagram = instagram.trim();
    }

    if (
      typeof profileImage === "string" &&
      profileImage.trim()
    ) {
      artist.profileImage = profileImage;
    }

    await artist.save();

    const updatedProfile = artist.toObject();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(
      "❌ Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update profile.",
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