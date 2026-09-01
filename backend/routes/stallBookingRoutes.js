const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");

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

// =====================================================
// POST /api/stall-bookings
// CREATE BOOKING
// =====================================================

router.post("/", async (req, res) => {
  try {
    console.log("=======================================");
    console.log("💾 STALL BOOKING REQUEST");
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
        message: "Phone is required.",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    // =================================================
    // RAZORPAY DATA
    // =================================================

    const razorpayOrderId = cleanText(
      body.razorpay_order_id || body.razorpayOrderId || body.orderId,
    );

    const razorpayPaymentId = cleanText(
      body.razorpay_payment_id || body.razorpayPaymentId || body.paymentId,
    );

    const razorpaySignature = cleanText(
      body.razorpay_signature || body.razorpaySignature,
    );

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment details are missing.",
      });
    }

    // =================================================
    // VERIFY SIGNATURE
    // =================================================

    const razorpaySecret =
      process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

    if (!razorpaySecret) {
      console.error("❌ Razorpay secret missing in backend .env");

      return res.status(500).json({
        success: false,
        message: "Razorpay server configuration is missing.",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("❌ INVALID RAZORPAY SIGNATURE");

      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    // =================================================
    // DUPLICATE PAYMENT CHECK
    // =================================================

    const existingBooking = await StallBooking.findOne({
      $or: [
        {
          razorpay_payment_id: razorpayPaymentId,
        },
        {
          razorpayPaymentId,
        },
        {
          paymentId: razorpayPaymentId,
        },
      ],
    });

    if (existingBooking) {
      console.log("⚠️ Booking already exists:", existingBooking._id);

      return res.status(200).json({
        success: true,
        message: "Booking already exists.",
        booking: existingBooking,
      });
    }

    // =================================================
    // PACKAGE
    // =================================================

    const duration = cleanText(body.duration) || "1";

    const fallbackPackage = getPackageData(duration);

    const packageId = cleanText(body.packageId) || fallbackPackage.packageId;

    const packageName =
      cleanText(body.packageName) || fallbackPackage.packageName;

    const packagePrice =
      cleanNumber(body.packagePrice || body.totalAmount || body.price) ||
      fallbackPackage.packagePrice;

    const advanceAmount =
      cleanNumber(body.advanceAmount || body.paidAmount || body.amount) || 1499;

    // =================================================
    // CREATE MONGODB RECORD
    // =================================================

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

      advanceAmount,

      paidAmount: advanceAmount,

      amount: advanceAmount,

      paymentStatus: "paid",

      bookingStatus: "confirmed",

      status: "CONFIRMED",

      razorpay_order_id: razorpayOrderId,

      razorpay_payment_id: razorpayPaymentId,

      razorpay_signature: razorpaySignature,

      razorpayOrderId,

      razorpayPaymentId,

      razorpaySignature,

      orderId: razorpayOrderId,

      paymentId: razorpayPaymentId,

      extraData: body,
    });

    console.log("=======================================");
    console.log("✅ STALL BOOKING SAVED");
    console.log("ID:", booking._id);
    console.log("Studio:", booking.brandName);
    console.log("Payment:", booking.razorpay_payment_id);
    console.log("=======================================");

    return res.status(201).json({
      success: true,
      message: "Stall booking saved successfully.",
      booking,
    });
  } catch (error) {
    console.error("❌ STALL BOOKING CREATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save stall booking.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

// =====================================================
// GET /api/stall-bookings
// GET ALL BOOKINGS
// =====================================================

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

// =====================================================
// GET SINGLE
// =====================================================

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

// =====================================================
// PUT /api/stall-bookings/:id
// UPDATE STATUS
// =====================================================

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

    const updateData = {
      bookingStatus: requestedStatus,
      status: requestedStatus.toUpperCase(),
    };

    if (requestedStatus === "paid") {
      updateData.paymentStatus = "paid";
    }

    const booking = await StallBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

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

// =====================================================
// DELETE
// =====================================================

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
