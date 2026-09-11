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

async function completePendingRequestsForPlan(
  profileId,
  requestedPlan,
  now = new Date(),
) {
  if (!profileId || !["pro", "verified"].includes(requestedPlan)) {
    return;
  }

  await MembershipRequest.updateMany(
    {
      profileId,
      requestedPlan,
      requestStatus: {
        $in: ["new", "contacted", "paid"],
      },
    },
    {
      $set: {
        requestStatus: "completed",
        paymentStatus: "paid",
        activatedAt: now,
        completedAt: now,
        paidAt: now,
      },
    },
  );
}

/* =========================================================
   CREATE SILVER / GOLD REQUEST
   POST /api/membership-requests
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

    const pricingType = "standard-membership";
    const requestedAmount = standardAmount(requestedPlan);

    const existingRequest = await MembershipRequest.findOne({
      profileId: studio._id,
      requestedPlan,
      requestStatus: {
        $in: ["new", "contacted", "paid"],
      },
    }).sort({ createdAt: -1 });

    if (existingRequest) {
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
   GET ONLY ACTIVE / WAITING REQUESTS FOR ADMIN
   GET /api/membership-requests

   SHOW:
   - new
   - contacted
   - paid but not activated yet

   HIDE:
   - completed
   - cancelled
========================================================= */

router.get("/", async (req, res) => {
  try {
    const filter = {
      requestStatus: {
        $in: ["new", "contacted", "paid"],
      },
    };

    if (req.query.status) {
      const status = cleanText(req.query.status).toLowerCase();

      if (["new", "contacted", "paid"].includes(status)) {
        filter.requestStatus = status;
      }
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
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

/* =========================================================
   DIRECT ADMIN PLAN CHANGE
   PATCH /api/membership-requests/admin/activate-profile

   IMPORTANT:
   When admin directly makes artist Silver/Gold,
   any matching waiting request is automatically COMPLETED.
   So it disappears from "Silver / Gold Requests".
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

    /* ================================
       CHANGE TO FREE
    ================================= */

    if (targetPlan === "basic") {
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

    /* ================================
       ALREADY ACTIVE
       Still complete a matching old request.
    ================================= */

    if (currentPlan === targetPlan && studio.paymentStatus === "paid") {
      const now = new Date();

      await completePendingRequestsForPlan(studio._id, targetPlan, now);

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

    /* ================================
       GOLD -> SILVER
    ================================= */

    if (currentPlan === "verified" && targetPlan === "pro") {
      const now = new Date();

      studio.plan = "pro";
      studio.paymentStatus = "paid";
      studio.verified = false;
      studio.spotlight = false;
      studio.hallOfFameEligible = false;

      await studio.save();

      await completePendingRequestsForPlan(studio._id, "pro", now);

      return res.status(200).json({
        success: true,
        message: "Gold membership changed to Silver from admin dashboard.",
        artist: studio,
      });
    }

    /* ================================
       ACTIVATE SILVER / GOLD
    ================================= */

    const now = new Date();
    const amount = standardAmount(targetPlan);

    studio.plan = targetPlan;
    studio.paymentStatus = "paid";

    studio.planStartedAt = now;
    studio.planExpiresAt = addOneCalendarYear(now);

    studio.paidAt = now;
    studio.paymentAmount = amount;
    studio.paymentCurrency = "INR";

    studio.razorpayOrderId = "";
    studio.razorpayPaymentId = "";
    studio.razorpaySignature = "";

    await studio.save();

    // IMPORTANT:
    // Admin made this artist Silver/Gold, so the matching request
    // is finished and must disappear from Silver / Gold Requests.
    await completePendingRequestsForPlan(studio._id, targetPlan, now);

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
   MARK PAYMENT AS PAID
   PATCH /api/membership-requests/:id/paid
========================================================= */

router.patch("/:id/paid", async (req, res) => {
  try {
    const requestId = cleanText(req.params.id);

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (request.requestStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled request cannot be marked as paid.",
      });
    }

    if (request.requestStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "This membership request is already completed.",
      });
    }

    if (request.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Payment is already marked as paid.",
        request,
      });
    }

    request.paymentStatus = "paid";
    request.paidAt = new Date();

    // Keep request in waiting queue until activation.
    request.requestStatus = "contacted";

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Payment marked as paid successfully.",
      request,
    });
  } catch (error) {
    console.error("❌ MARK PAYMENT PAID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark payment as paid.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

/* =========================================================
   ACTIVATE REQUEST AFTER MANUAL PAYMENT
   PATCH /api/membership-requests/:id/activate

   After activation:
   requestStatus = completed
   Therefore it disappears from request list.
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

    if (request.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Mark payment as PAID before activating membership.",
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
    studio.paymentAmount = standardAmount(targetPlan);
    studio.paymentCurrency = "INR";

    studio.razorpayOrderId = "";
    studio.razorpayPaymentId = "";
    studio.razorpaySignature = "";

    await studio.save();

    request.requestedAmount = standardAmount(targetPlan);

    request.pricingType = "standard-membership";

    request.paymentStatus = "paid";
    request.requestStatus = "completed";

    request.activatedAt = now;
    request.completedAt = now;
    request.paidAt = request.paidAt || now;

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
   CANCEL REQUEST
   PATCH /api/membership-requests/:id/cancel

   Cancelled requests are hidden from GET list.
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

/* =========================================================
   DELETE MEMBERSHIP REQUEST
   DELETE /api/membership-requests/:id

   Deletes request only.
   Does NOT delete TattooStudio / artist profile.
========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    const requestId = cleanText(req.params.id);

    if (!isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    await MembershipRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: "Membership request deleted successfully.",
      deletedRequestId: requestId,
    });
  } catch (error) {
    console.error("❌ DELETE MEMBERSHIP REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete membership request.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

module.exports = router;
