const express = require("express");
const mongoose = require("mongoose");

const StallBooking = require("../models/StallBooking");

const router = express.Router();

const cleanText = (value) => {
  return String(value || "").trim();
};

const cleanNumber = (value, fallback = 0) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPackageData = (duration) => {
  const value = String(duration || "1");

  if (value === "2") {
    return {
      packageId: "2-days",
      packageName: "2 Days Stall",
      packagePrice: 8999,
    };
  }

  if (value === "3") {
    return {
      packageId: "3-days",
      packageName: "3 Days Stall",
      packagePrice: 12499,
    };
  }

  return {
    packageId: "1-day",
    packageName: "1 Day Stall",
    packagePrice: 4999,
  };
};

/* =========================================================
   CREATE A STALL REQUEST
   NO RAZORPAY
   NO PAYMENT ON WEBSITE

   POST /api/stall-bookings/request

   Also supports:
   POST /api/stall-bookings
   so older frontend code will not break.
========================================================= */

const createStallRequest = async (req, res) => {
  try {
    console.log("=======================================");
    console.log("🏪 NEW STALL REQUEST");
    console.log(req.body);
    console.log("=======================================");

    const body = req.body || {};

    const fullName = cleanText(
      body.fullName || body.ownerName || body.name || body.customerName,
    );

    const brandName = cleanText(
      body.brandName || body.studioName || body.brand || body.company,
    );

    const email = cleanText(
      body.email || body.gmail || body.customerEmail,
    ).toLowerCase();

    const phone = cleanText(body.phone || body.mobile || body.phoneNumber);

    const city = cleanText(body.city || body.userCity);

    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!brandName) {
      return res.status(400).json({
        success: false,
        message: "Brand / Studio name is required.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "Preferred city is required.",
      });
    }

    /* -----------------------------
       PACKAGE
    ----------------------------- */

    const duration = cleanText(body.duration) || "1";

    const fallbackPackage = getPackageData(duration);

    const packageId = cleanText(body.packageId) || fallbackPackage.packageId;

    const packageName =
      cleanText(body.packageName) ||
      cleanText(body.stallType) ||
      cleanText(body.stallName) ||
      fallbackPackage.packageName;

    const packagePrice =
      cleanNumber(body.packagePrice || body.totalAmount || body.price) ||
      fallbackPackage.packagePrice;

    /* -----------------------------
       SAVE AS NEW REQUEST
       PAYMENT IS NOT DONE YET
    ----------------------------- */

    const booking = await StallBooking.create({
      name: fullName,
      fullName,
      ownerName: fullName,

      brandName,
      studioName: brandName,

      email,
      phone,
      city,

      state: cleanText(body.state),

      expoCity: cleanText(
        body.expoCity || body.preferredExpoCity || body.eventCity,
      ),

      duration,

      packageId,
      packageName,
      packagePrice,
      totalAmount: packagePrice,

      // Your team will discuss this after contacting the user.
      advanceAmount: 1499,

      // No money has been received yet.
      paidAmount: 0,
      amount: 0,

      paymentStatus: "pending",
      bookingStatus: "new",
      status: "NEW REQUEST",

      notes: cleanText(body.notes),

      source: cleanText(body.source) || "website_stall_request",

      extraData: body,
    });

    console.log("=======================================");
    console.log("✅ STALL REQUEST SAVED");
    console.log("ID:", booking._id);
    console.log("Studio:", booking.brandName);
    console.log("Phone:", booking.phone);
    console.log("Payment Status:", booking.paymentStatus);
    console.log("Booking Status:", booking.bookingStatus);
    console.log("=======================================");

    return res.status(201).json({
      success: true,
      message:
        "Your stall request has been submitted successfully. Our team will contact you within 24 hours.",
      booking,
    });
  } catch (error) {
    console.error("❌ STALL REQUEST CREATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit stall request.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// New frontend route.
router.post("/request", createStallRequest);

// Backward compatibility.
// If any older page still posts to /api/stall-bookings,
// it will now also create a request without Razorpay.
router.post("/", createStallRequest);

/* =========================================================
   GET /api/stall-bookings
   GET ALL BOOKINGS / REQUESTS
========================================================= */

router.get("/", async (req, res) => {
  try {
    const bookings = await StallBooking.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    console.log(`🏪 GET /api/stall-bookings → ${bookings.length} booking(s)`);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ STALL BOOKING GET ERROR:", error);

    return res.status(500).json({
      success: false,
      count: 0,
      bookings: [],
      message: "Unable to load stall bookings.",
    });
  }
});

/* =========================================================
   GET SINGLE BOOKING
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await StallBooking.findById(req.params.id).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("❌ SINGLE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load booking.",
    });
  }
});

/* =========================================================
   UPDATE BOOKING STATUS

   PUT /api/stall-bookings/:id

   Example bodies:

   { "bookingStatus": "contacted" }

   { "bookingStatus": "paid" }

   { "bookingStatus": "confirmed" }

   { "bookingStatus": "cancelled" }
========================================================= */

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const requestedStatus = cleanText(
      req.body.bookingStatus || req.body.status,
    ).toLowerCase();

    const allowedStatuses = [
      "new",
      "contacted",
      "confirmed",
      "paid",
      "cancelled",
    ];

    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const existingBooking = await StallBooking.findById(req.params.id);

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const updateData = {
      bookingStatus: requestedStatus,
      status:
        requestedStatus === "new"
          ? "NEW REQUEST"
          : requestedStatus.toUpperCase(),
    };

    // Your admin clicks PAID only after manually verifying
    // that the ₹1,499 advance reached your account.
    if (requestedStatus === "paid") {
      updateData.paymentStatus = "paid";
      updateData.paidAmount = existingBooking.advanceAmount || 1499;
      updateData.amount = existingBooking.advanceAmount || 1499;
    }

    // If cancelled before payment, payment stays pending.
    if (
      requestedStatus === "cancelled" &&
      existingBooking.paymentStatus !== "paid"
    ) {
      updateData.paymentStatus = "pending";
      updateData.paidAmount = 0;
      updateData.amount = 0;
    }

    const booking = await StallBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      booking,
    });
  } catch (error) {
    console.error("❌ BOOKING UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update booking.",
    });
  }
});

/* =========================================================
   DELETE BOOKING
========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await StallBooking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error("❌ DELETE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete booking.",
    });
  }
});

module.exports = router;
