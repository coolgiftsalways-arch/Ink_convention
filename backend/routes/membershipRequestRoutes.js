const express = require("express");
const mongoose = require("mongoose");

const MembershipRequest = require("../models/MembershipRequest");
const TattooStudio = require("../models/TattooStudio");

const {
  normalizePlan,
  addOneCalendarYear,
  addCalendarMonths,
} = require("../services/membershipService");

const router = express.Router();

const cleanText = (value) => String(value || "").trim();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
}

/* =========================================================
   STANDARD MEMBERSHIP PRICES
========================================================= */

function standardAmount(plan) {
  if (plan === "verified") return 5999;
  if (plan === "pro") return 2999;
  return 0;
}

/* =========================================================
   NEW MEMBERSHIP PLANS
========================================================= */

const OUR_PLANS_CATALOG = Object.freeze({
  quarterly: Object.freeze({
    title: "3 Months",
    durationMonths: 3,
    price: 1999,
    customers: 2,
  }),

  "half-yearly": Object.freeze({
    title: "6 Months",
    durationMonths: 6,
    price: 2999,
    customers: 5,
  }),

  yearly: Object.freeze({
    title: "1 Year",
    durationMonths: 12,
    price: 4999,
    customers: 12,
  }),
});

/* =========================================================
   COMPLETE PENDING REQUESTS
========================================================= */

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
   MEMBERSHIP DURATION
========================================================= */

function requestDurationMonths(request) {
  const durationByOption = {
    quarterly: 3,
    "half-yearly": 6,
    yearly: 12,
  };

  const option = cleanText(request.planOption).toLowerCase();

  if (option) {
    return durationByOption[option] || 0;
  }

  if (request.durationMonths != null) {
    const duration = Number(request.durationMonths);

    return [3, 6, 12].includes(duration) ? duration : 0;
  }

  return 12;
}

/* =========================================================
   ADD CALENDAR MONTHS
========================================================= */

function addUtcCalendarMonths(startDate, months) {
  const date = new Date(startDate);

  const originalDay = date.getUTCDate();

  const target = new Date(date);

  target.setUTCDate(1);

  target.setUTCMonth(target.getUTCMonth() + months);

  const endOfMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(originalDay, endOfMonth));

  return target;
}

/* =========================================================
   CREATE MEMBERSHIP REQUEST

   POST /api/membership-requests
========================================================= */

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};

    const profileId = cleanText(body.profileId);

    const requestedPlan = normalizePlan(body.requestedPlan);

    const planOption = cleanText(body.planOption).toLowerCase();

    const isOurPlansSubmission =
      cleanText(body.source) === "our_plans_page" || Boolean(planOption);

    const chosenPlan = OUR_PLANS_CATALOG[planOption] || null;

    /* VALIDATE PROFILE */

    if (!isValidObjectId(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Valid artist profile ID is required.",
      });
    }

    /* VALIDATE MEMBERSHIP */

    if (!["pro", "verified"].includes(requestedPlan)) {
      return res.status(400).json({
        success: false,
        message: "Only Silver or Gold membership can be requested.",
      });
    }

    /* VALIDATE SELECTED PLAN */

    if (isOurPlansSubmission && !chosenPlan) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid 3-month, 6-month or 12-month plan.",
      });
    }

    if (chosenPlan && requestedPlan !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Duration-based plans belong to Gold membership.",
      });
    }

    /* FIND ARTIST */

    const studio = await TattooStudio.findById(profileId);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Artist profile not found.",
      });
    }

    const currentPlan = normalizePlan(studio.plan);

    /* CHECK EXISTING MEMBERSHIP */

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

    /* DETERMINE PRICE FROM BACKEND */

    const requestedAmount = chosenPlan
      ? chosenPlan.price
      : standardAmount(requestedPlan);

    const pricingType = chosenPlan
      ? "diwali-membership"
      : "standard-membership";

    const requestedPlanName = chosenPlan
      ? `Gold — ${chosenPlan.title}`
      : requestedPlan === "verified"
        ? "GOLD / VERIFIED"
        : "SILVER / PRO";

    const storedOption = chosenPlan ? planOption : null;

    const durationMonths = chosenPlan ? chosenPlan.durationMonths : null;

    const promisedCustomers = chosenPlan ? chosenPlan.customers : null;

    /* =====================================================
       ARTIST DETAILS

       TAKE FROM DATABASE PROFILE
    ===================================================== */

    const name =
      cleanText(studio.name) ||
      cleanText(studio.professionalName) ||
      cleanText(studio.artistName) ||
      "Tattoo Artist";

    const email = cleanText(studio.email).toLowerCase();

    const phone = cleanText(
      studio.phone || studio.mobile || studio.phoneNumber,
    );

    const city = cleanText(studio.city);

    const state = cleanText(studio.state);

    const studioName = cleanText(studio.studio || studio.studioName);

    /* =====================================================
       CHECK EXISTING REQUEST
    ===================================================== */

    const existingRequest = await MembershipRequest.findOne({
      profileId: studio._id,
      requestedPlan,

      requestStatus: {
        $in: ["new", "contacted", "paid"],
      },
    }).sort({
      createdAt: -1,
    });

    if (existingRequest) {
      const existingOption = cleanText(
        existingRequest.planOption,
      ).toLowerCase();

      const differentPackage = existingOption !== (storedOption || "");

      const canRepairEarlierFormSubmission =
        Boolean(chosenPlan) &&
        existingRequest.paymentStatus !== "paid" &&
        existingOption === "" &&
        existingRequest.source === "our_plans_page";

      if (differentPackage && !canRepairEarlierFormSubmission) {
        return res.status(409).json({
          success: false,
          message:
            "A different membership request is already open for this artist. Contact the Ink Convention team to change it.",
        });
      }

      /* UPDATE UNPAID REQUEST */

      if (existingRequest.paymentStatus !== "paid") {
        existingRequest.name = name;
        existingRequest.email = email;
        existingRequest.phone = phone;
        existingRequest.city = city;
        existingRequest.state = state;
        existingRequest.studio = studioName;

        existingRequest.requestedPlanName = requestedPlanName;

        existingRequest.requestedAmount = requestedAmount;

        existingRequest.pricingType = pricingType;

        existingRequest.planOption = storedOption;

        existingRequest.durationMonths = durationMonths;

        existingRequest.promisedCustomers = promisedCustomers;

        await existingRequest.save();
      }

      return res.status(200).json({
        success: true,

        duplicate: !canRepairEarlierFormSubmission,

        updated: canRepairEarlierFormSubmission,

        message: canRepairEarlierFormSubmission
          ? "Your earlier request has been updated with the selected plan."
          : "Your membership request is already received.",

        request: existingRequest,
      });
    }

    /* =====================================================
       SAVE NEW MEMBERSHIP REQUEST
    ===================================================== */

    const request = await MembershipRequest.create({
      profileId: studio._id,

      name,
      email,
      phone,
      city,
      state,

      studio: studioName,

      currentPlan,
      requestedPlan,
      requestedPlanName,

      planOption: storedOption,

      durationMonths,

      promisedCustomers,

      requestedAmount,

      pricingType,

      requestStatus: "new",

      paymentStatus: "pending",

      source: cleanText(body.source) || "artist_membership_page",
    });

    return res.status(201).json({
      success: true,

      message: "Membership request received successfully.",

      request,
    });
  } catch (error) {
    console.error("CREATE MEMBERSHIP REQUEST ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to send membership request.",

      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

/* =========================================================
   GET ALL MEMBERSHIP REQUESTS

   GET /api/membership-requests/admin/all

   SHOW ALL STATUSES
========================================================= */

router.get("/admin/all", async (req, res) => {
  try {
    const requests = await MembershipRequest.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("GET ALL MEMBERSHIP REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      requests: [],
      message: "Unable to load membership request history.",
    });
  }
});

/* =========================================================
   GET ACTIVE MEMBERSHIP REQUESTS

   GET /api/membership-requests
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
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("GET MEMBERSHIP REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      requests: [],
      message: "Unable to load membership requests.",
    });
  }
});

/* =========================================================
   DIRECT ADMIN MEMBERSHIP ACTIVATION

   PATCH /api/membership-requests/admin/activate-profile
========================================================= */

router.patch("/admin/activate-profile", async (req, res) => {
  try {
    const profileId = cleanText(req.body?.profileId);
    const targetPlan = normalizePlan(req.body?.plan);

    if (!isValidObjectId(profileId)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Valid artist profile ID is required.",
        });
    }
    if (!["basic", "pro", "verified"].includes(targetPlan)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Admin can set only Free, Silver or Gold.",
        });
    }

    const durationMonths = Number(req.body?.durationMonths);
    if (targetPlan === "verified" && ![3, 6, 12].includes(durationMonths)) {
      return res.status(400).json({
        success: false,
        message: "Select Gold membership for 3, 6 or 12 months.",
      });
    }

    const studio = await TattooStudio.findById(profileId);
    if (!studio) {
      return res
        .status(404)
        .json({ success: false, message: "Artist profile not found." });
    }

    const currentPlan = normalizePlan(studio.plan);

    // FREE: manually deactivate immediately.
    if (targetPlan === "basic") {
      studio.plan = "basic";
      studio.paymentStatus = "unpaid";
      studio.verified = false;
      studio.spotlight = false;
      studio.hallOfFameEligible = false;
      studio.planStartedAt = null;
      studio.planExpiresAt = null;
      studio.planDurationMonths = null;
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

    // Preserve existing Silver behavior (one year); a Gold->Silver change
    // will reset the Silver dates to a full year from this confirmation.
    if (targetPlan === "pro") {
      if (currentPlan === "pro" && studio.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: "Silver membership is already active.",
          artist: studio,
        });
      }
      const now = new Date();
      studio.plan = "pro";
      studio.paymentStatus = "paid";
      studio.verified = false;
      studio.spotlight = false;
      studio.hallOfFameEligible = false;
      studio.planStartedAt = now;
      studio.planExpiresAt = addOneCalendarYear(now);
      studio.planDurationMonths = 12;
      studio.paidAt = now;
      studio.paymentAmount = standardAmount("pro");
      studio.paymentCurrency = "INR";
      studio.razorpayOrderId = "";
      studio.razorpayPaymentId = "";
      studio.razorpaySignature = "";
      await studio.save();
      await completePendingRequestsForPlan(studio._id, "pro", now);
      return res.status(200).json({
        success: true,
        message: "Silver membership activated for 12 months.",
        artist: studio,
      });
    }

    // GOLD: new or renewal. Always start from the moment admin confirms.
    // No silent no-op for an existing Gold member; explicit duration renews it.
    const now = new Date();
    studio.plan = "verified";
    studio.paymentStatus = "paid";
    studio.planStartedAt = now;
    studio.planExpiresAt = addCalendarMonths(now, durationMonths);
    studio.planDurationMonths = durationMonths;
    studio.paidAt = now;

    // Admin confirms payment OUTSIDE the website; this manual action is not
    // proof of a Razorpay transaction. Use the published price for the term.
    studio.paymentAmount = { 3: 1999, 6: 2999, 12: 4999 }[durationMonths];
    studio.paymentCurrency = "INR";
    studio.razorpayOrderId = "";
    studio.razorpayPaymentId = "";
    studio.razorpaySignature = "";
    await studio.save();

    // This action is only allowed after the admin confirms payment manually.
    // Close any matching pending applications as paid and completed.
    await completePendingRequestsForPlan(studio._id, "verified", now);

    return res.status(200).json({
      success: true,
      message: `Gold membership activated for ${durationMonths} months.`,
      durationMonths,
      activatedAt: studio.planStartedAt,
      expiresAt: studio.planExpiresAt,
      artist: studio,
    });
  } catch (error) {
    console.error("ADMIN MEMBERSHIP ACTIVATION ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to activate membership." });
  }
});

/* =========================================================
   MARK CONTACTED

   PATCH /api/membership-requests/:id/contacted
========================================================= */

router.patch("/:id/contacted", async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (["completed", "cancelled"].includes(request.requestStatus)) {
      return res.status(400).json({
        success: false,
        message: "This membership request cannot be updated.",
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
    console.error("MARK CONTACTED ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update membership request.",
    });
  }
});

/* =========================================================
   CONFIRM PAYMENT

   PATCH /api/membership-requests/:id/paid
========================================================= */

router.patch("/:id/paid", async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (["completed", "cancelled"].includes(request.requestStatus)) {
      return res.status(400).json({
        success: false,
        message: "This request cannot be marked as paid.",
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

    request.requestStatus = "contacted";

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Payment marked as paid successfully.",
      request,
    });
  } catch (error) {
    console.error("CONFIRM PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark payment as paid.",
    });
  }
});

/* =========================================================
   ACTIVATE MEMBERSHIP

   PATCH /api/membership-requests/:id/activate
========================================================= */

router.patch("/:id/activate", async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(id);

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
      const artist = await TattooStudio.findById(request.profileId);

      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Membership is already active.",
        request,
        artist,
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

    const durationMonths = requestDurationMonths(request);

    if (!durationMonths) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership validity stored in this request.",
      });
    }

    const now = new Date();

    const recordedAmount = Number(request.requestedAmount);

    const amount =
      Number.isFinite(recordedAmount) && recordedAmount > 0
        ? recordedAmount
        : standardAmount(targetPlan);

    /* UPDATE ARTIST MEMBERSHIP */

    studio.plan = targetPlan;

    studio.paymentStatus = "paid";

    studio.planStartedAt = now;

    studio.planExpiresAt = addCalendarMonths(now, durationMonths);
    studio.planDurationMonths = durationMonths;

    studio.paidAt = now;

    studio.paymentAmount = amount;

    studio.paymentCurrency = "INR";

    studio.razorpayOrderId = "";
    studio.razorpayPaymentId = "";
    studio.razorpaySignature = "";

    await studio.save();

    /* UPDATE REQUEST */

    request.requestedAmount = amount;

    request.paymentStatus = "paid";

    request.requestStatus = "completed";

    request.activatedAt = now;

    request.completedAt = now;

    request.paidAt = request.paidAt || now;

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Membership activated successfully.",
      request,
      artist: studio,
    });
  } catch (error) {
    console.error("ACTIVATE MEMBERSHIP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to activate membership.",
    });
  }
});

/* =========================================================
   CANCEL MEMBERSHIP REQUEST

   PATCH /api/membership-requests/:id/cancel
========================================================= */

router.patch("/:id/cancel", async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    if (request.requestStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed requests cannot be cancelled.",
      });
    }

    if (request.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Payment is recorded as paid. Arrange any required refund before cancelling the request.",
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
    console.error("CANCEL MEMBERSHIP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel membership request.",
    });
  }
});

/* =========================================================
   SAVE INTERNAL NOTES

   PATCH /api/membership-requests/:id/notes
========================================================= */

router.patch("/:id/notes", async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    if (typeof req.body?.notes !== "string" || req.body.notes.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Notes must contain at most 5000 characters.",
      });
    }

    const request = await MembershipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    request.notes = req.body.notes.trim();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Internal notes saved successfully.",
      request,
    });
  } catch (error) {
    console.error("SAVE NOTES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save internal notes.",
    });
  }
});

/* =========================================================
   DELETE MEMBERSHIP REQUEST

   DELETE /api/membership-requests/:id
========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership request ID.",
      });
    }

    const request = await MembershipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Membership request not found.",
      });
    }

    await MembershipRequest.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Membership request deleted successfully.",
      deletedRequestId: id,
    });
  } catch (error) {
    console.error("DELETE MEMBERSHIP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete membership request.",
    });
  }
});

module.exports = router;
