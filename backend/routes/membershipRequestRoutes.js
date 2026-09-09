const express = require("express");
const mongoose = require("mongoose");

const MembershipRequest = require("../models/MembershipRequest");
const TattooStudio = require("../models/TattooStudio");

const {
  normalizePlan,
  addOneCalendarYear,
} = require("../services/membershipService");

const router = express.Router();

const cleanText = (value) => String(value || "").trim();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
}

function standardAmount(plan) {
  if (plan === "verified") return 5999;
  if (plan === "pro") return 2999;
  return 0;
}

/* =========================================================
   CREATE SILVER / GOLD REQUEST
   POST /api/membership-requests

   NO RAZORPAY.
   THIS DOES NOT ACTIVATE THE PLAN.
========================================================= */

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};

    const profileId = cleanText(body.profileId);
    const requestedPlan = normalizePlan(body.requestedPlan);

    if (!isValidObjectId(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Valid artist profile ID is required.",
      });
    }

    if (!["pro", "verified"].includes(requestedPlan)) {
      return res.status(400).json({
        success: false,
        message: "Only Silver or Gold membership can be requested.",
      });
    }

    const studio = await TattooStudio.findById(profileId);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Artist profile not found.",
      });
    }

    const currentPlan = normalizePlan(studio.plan);

    if (currentPlan === "verified") {
      return res.status(400).json({
        success: false,
        message: "Gold membership is already active for this artist.",
      });
    }

    if (currentPlan === "pro" && requestedPlan === "pro") {
      return res.status(400).json({
        success: false,
        message: "Silver membership is already active for this artist.",
      });
    }

    // Silver and Gold always use their full standard price.
    // Silver -> Gold is NOT discounted; Gold remains ₹5,999.
    const pricingType = "standard-membership";
    const requestedAmount = standardAmount(requestedPlan);

    const existingRequest = await MembershipRequest.findOne({
      profileId: studio._id,
      requestedPlan,
      requestStatus: { $in: ["new", "contacted"] },
    }).sort({ createdAt: -1 });

    if (existingRequest) {
      // Keep older pending requests in sync with the current pricing.
      // This also fixes requests created when Silver/Gold used older prices.
      if (
        Number(existingRequest.requestedAmount) !== requestedAmount ||
        existingRequest.pricingType !== "standard-membership"
      ) {
        existingRequest.requestedAmount = requestedAmount;
        existingRequest.pricingType = "standard-membership";
        existingRequest.requestedPlanName =
          requestedPlan === "verified" ? "GOLD / VERIFIED" : "SILVER / PRO";
        await existingRequest.save();
      }

      return res.status(200).json({
        success: true,
        duplicate: true,
        message:
          "Your membership request is already received. Our team will contact you within 24 hours.",
        request: existingRequest,
      });
    }

    const request = await MembershipRequest.create({
      profileId: studio._id,

      name:
        cleanText(body.name) ||
        studio.name ||
        studio.professionalName ||
        studio.artistName ||
        "Tattoo Artist",

      email: cleanText(body.email) || studio.email || "",
      phone: cleanText(body.phone) || studio.phone || "",
      city: cleanText(body.city) || studio.city || "",
      state: cleanText(body.state) || studio.state || "",

      studio:
        cleanText(body.studio) || studio.studio || studio.studioName || "",

      currentPlan,
      requestedPlan,

      requestedPlanName:
        requestedPlan === "verified" ? "GOLD / VERIFIED" : "SILVER / PRO",

      requestedAmount,
      pricingType,

      requestStatus: "new",
      paymentStatus: "pending",

      source: cleanText(body.source) || "artist_membership_page",
    });

    return res.status(201).json({
      success: true,
      message:
        "Membership request received. Our team will contact you within 24 hours.",
      request,
    });
  } catch (error) {
    console.error("❌ CREATE MEMBERSHIP REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send membership request.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

/* =========================================================
   GET REQUESTS FOR ADMIN
   GET /api/membership-requests
========================================================= */

router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.requestStatus = cleanText(req.query.status).toLowerCase();
    }

    if (req.query.plan) {
      const requestedPlan = normalizePlan(req.query.plan);

      if (["pro", "verified"].includes(requestedPlan)) {
        filter.requestedPlan = requestedPlan;
      }
    }

    const requests = await MembershipRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("❌ GET MEMBERSHIP REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      requests: [],
      message: "Unable to load membership requests.",
    });
  }
});

/* =========================================================
   DIRECT ADMIN ACTIVATION
   PATCH /api/membership-requests/admin/activate-profile

   USE FROM ADMIN DASHBOARD ONLY.
   Allows:
   FREE / BASIC -> SILVER / PRO
   FREE / BASIC -> GOLD / VERIFIED
   SILVER / PRO -> FREE / BASIC
   SILVER / PRO -> GOLD / VERIFIED
   GOLD / VERIFIED -> SILVER / PRO
   GOLD / VERIFIED -> FREE / BASIC

   NO RAZORPAY. PAID ACTIVATIONS REQUIRE MANUAL PAYMENT CONFIRMATION.
========================================================= */

router.patch("/admin/activate-profile", async (req, res) => {
  try {
    const profileId = cleanText(req.body?.profileId);
    const targetPlan = normalizePlan(req.body?.plan);

    if (!isValidObjectId(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Valid artist profile ID is required.",
      });
    }

    if (!["basic", "pro", "verified"].includes(targetPlan)) {
      return res.status(400).json({
        success: false,
        message: "Admin can set only Free, Silver or Gold.",
      });
    }

    const studio = await TattooStudio.findById(profileId);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Artist profile not found.",
      });
    }

    const currentPlan = normalizePlan(studio.plan);

    if (targetPlan === "basic") {
      if (currentPlan === "basic" && studio.paymentStatus !== "paid") {
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: "Free membership is already active.",
          artist: studio,
        });
      }

      studio.plan = "basic";
      studio.paymentStatus = "unpaid";
      studio.verified = false;
      studio.spotlight = false;
      studio.hallOfFameEligible = false;
      studio.planStartedAt = null;
      studio.planExpiresAt = null;
      studio.paidAt = null;
      studio.paymentAmount = 0;
      studio.paymentCurrency = "INR";
      studio.razorpayOrderId = "";
      studio.razorpayPaymentId = "";
      studio.razorpaySignature = "";

      await studio.save();

      return res.status(200).json({
        success: true,
        message: "Artist changed to Free from admin dashboard.",
        artist: studio,
      });
    }

    if (currentPlan === targetPlan && studio.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message:
          targetPlan === "verified"
            ? "Gold membership is already active."
            : "Silver membership is already active.",
        artist: studio,
      });
    }

    // GOLD -> SILVER is an admin downgrade.
    // No new payment is taken and the existing membership dates are preserved.
    if (currentPlan === "verified" && targetPlan === "pro") {
      studio.plan = "pro";
      studio.paymentStatus = "paid";
      studio.verified = false;
      studio.spotlight = false;
      studio.hallOfFameEligible = false;

      // Keep the existing paid/start/expiry dates because this is a downgrade,
      // not a new Silver purchase.
      await studio.save();

      return res.status(200).json({
        success: true,
        message: "Gold membership changed to Silver from admin dashboard.",
        artist: studio,
      });
    }

    const now = new Date();

    // Always charge the full current plan price.
    // Silver -> Gold costs the full Gold price: ₹5,999.
    const amount = standardAmount(targetPlan);

    studio.plan = targetPlan;
    studio.paymentStatus = "paid";
    studio.planStartedAt = now;
    studio.planExpiresAt = addOneCalendarYear(now);
    studio.paidAt = now;
    studio.paymentAmount = amount;
    studio.paymentCurrency = "INR";

    // This is a manual admin activation, not Razorpay.
    studio.razorpayOrderId = "";
    studio.razorpayPaymentId = "";
    studio.razorpaySignature = "";

    await studio.save();

    return res.status(200).json({
      success: true,
      message:
        targetPlan === "verified"
          ? "Gold membership activated from admin dashboard."
          : "Silver membership activated from admin dashboard.",
      artist: studio,
    });
  } catch (error) {
    console.error("❌ DIRECT ADMIN MEMBERSHIP ACTIVATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to activate membership from admin dashboard.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

/* =========================================================
   MARK CONTACTED
   PATCH /api/membership-requests/:id/contacted
========================================================= */

router.patch("/:id/contacted", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (request.requestStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "This membership has already been activated.",
      });
    }

    if (request.requestStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This membership request is cancelled.",
      });
    }

    request.requestStatus = "contacted";
    request.contactedAt = request.contactedAt || new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Membership request marked as contacted.",
      request,
    });
  } catch (error) {
    console.error("❌ MARK CONTACTED ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update membership request.",
    });
  }
});

/* =========================================================
   ACTIVATE AFTER MANUAL PAYMENT
   PATCH /api/membership-requests/:id/activate
========================================================= */

router.patch("/:id/activate", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (request.requestStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled membership request cannot be activated.",
      });
    }

    if (request.requestStatus === "completed") {
      const alreadyActiveStudio = await TattooStudio.findById(
        request.profileId,
      );

      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Membership is already active.",
        request,
        artist: alreadyActiveStudio,
      });
    }

    const studio = await TattooStudio.findById(request.profileId);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Artist profile linked to this request was not found.",
      });
    }

    const targetPlan = normalizePlan(request.requestedPlan);

    if (!["pro", "verified"].includes(targetPlan)) {
      return res.status(400).json({
        success: false,
        message: "This request does not contain a valid paid membership plan.",
      });
    }

    const now = new Date();

    studio.plan = targetPlan;
    studio.paymentStatus = "paid";

    studio.planStartedAt = now;
    studio.planExpiresAt = addOneCalendarYear(now);

    studio.paidAt = now;
    // Always store the current full plan price, even if an older request
    // in MongoDB contains a legacy amount such as ₹1,999 or ₹699.
    studio.paymentAmount = standardAmount(targetPlan);

    request.requestedAmount = standardAmount(targetPlan);
    request.pricingType = "standard-membership";
    studio.paymentCurrency = "INR";

    // Manual payment flow: clear old Razorpay identifiers so this activation
    // cannot be mistaken for a Razorpay transaction.
    studio.razorpayOrderId = "";
    studio.razorpayPaymentId = "";
    studio.razorpaySignature = "";

    await studio.save();

    request.paymentStatus = "paid";
    request.requestStatus = "completed";
    request.activatedAt = now;
    request.completedAt = now;

    await request.save();

    return res.status(200).json({
      success: true,
      message:
        targetPlan === "verified"
          ? "Gold membership activated successfully."
          : "Silver membership activated successfully.",
      request,
      artist: studio,
    });
  } catch (error) {
    console.error("❌ ACTIVATE MEMBERSHIP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to activate membership.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

/* =========================================================
   CANCEL
   PATCH /api/membership-requests/:id/cancel
========================================================= */

router.patch("/:id/cancel", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (request.requestStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "An activated membership request cannot be cancelled here.",
      });
    }

    request.requestStatus = "cancelled";
    request.cancelledAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Membership request cancelled.",
      request,
    });
  } catch (error) {
    console.error("❌ CANCEL MEMBERSHIP REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel membership request.",
    });
  }
});

module.exports = router;
