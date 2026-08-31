const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

// =====================================================
// CHECK RAZORPAY ENV
// =====================================================

if (!process.env.RAZORPAY_KEY_ID) {
  console.error("❌ RAZORPAY_KEY_ID missing from .env");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ RAZORPAY_KEY_SECRET missing from .env");
}

// =====================================================
// RAZORPAY
// =====================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// PACKAGE PRICES
// =====================================================

const PACKAGE_PRICES = {
  // Existing packages
  single: 999,
   pro: 1499,
  multi: 1999,

  // Stall booking
  "stall-booking": 1499,

  // Artist membership
  silver: 799,
  gold: 1299,

  // Enter.jsx membership plans
  pro: 1499,
  verified: 2999,
};

// =====================================================
// PAYMENT API TEST
// GET /api/payment
// =====================================================

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Payment API is working!",
  });
});

// =====================================================
// CREATE RAZORPAY ORDER
// POST /api/payment/create-order
// =====================================================

router.post("/create-order", async (req, res) => {
  try {
    console.log("💳 Create order request:", req.body);

    const {
      amount,
      packageId,
      email,
      phone,
      name,
    } = req.body;

    // =================================================
    // CHECK RAZORPAY CONFIG
    // =================================================

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      console.error("❌ Razorpay environment variables are missing");

      return res.status(500).json({
        success: false,
        message: "Razorpay configuration is missing.",
      });
    }

    // =================================================
    // VALIDATE PACKAGE
    // =================================================

    if (!packageId || !Object.prototype.hasOwnProperty.call(PACKAGE_PRICES, packageId)) {
      console.error("❌ Invalid package:", packageId);

      return res.status(400).json({
        success: false,
        message: "Invalid entry package.",
        packageId,
        availablePackages: Object.keys(PACKAGE_PRICES),
      });
    }

    // =================================================
    // GET EXPECTED PRICE FROM BACKEND
    // =================================================

    const expectedAmount = PACKAGE_PRICES[packageId];

    console.log("📦 Package:", packageId);
    console.log("💰 Frontend amount:", amount);
    console.log("💰 Backend amount:", expectedAmount);

    // =================================================
    // VALIDATE AMOUNT
    // =================================================

    if (Number(amount) !== expectedAmount) {
      console.error(
        `❌ Amount mismatch. Frontend: ${amount}, Backend: ${expectedAmount}`
      );

      return res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
        expectedAmount,
        receivedAmount: Number(amount),
      });
    }

    // =================================================
    // RAZORPAY USES PAISE
    // =================================================

    const amountInPaise = expectedAmount * 100;

    const receipt = `INK26_${Date.now()}`;

    console.log("💵 Amount in paise:", amountInPaise);

    // =================================================
    // CREATE RAZORPAY ORDER
    // =================================================

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,

      notes: {
        packageId: packageId,
        customerName: name || "",
        email: email || "",
        phone: phone || "",
      },
    });

    console.log("✅ Razorpay order created:", order.id);

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      packageId: packageId,
    });
  } catch (error) {
    console.error("❌ Razorpay order creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order.",
      error:
        error?.error?.description ||
        error?.message ||
        "Unknown Razorpay error",
    });
  }
});

// =====================================================
// VERIFY RAZORPAY PAYMENT
// POST /api/payment/verify
// =====================================================

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log(
      "🔐 Verifying Razorpay payment:",
      razorpay_payment_id
    );

    // =================================================
    // VALIDATE PAYMENT DATA
    // =================================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details.",
      });
    }

    // =================================================
    // CHECK SECRET
    // =================================================

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret is missing.",
      });
    }

    // =================================================
    // GENERATE SIGNATURE
    // =================================================

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // =================================================
    // COMPARE SIGNATURES
    // =================================================

    const generatedBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    let isValid = false;

    if (generatedBuffer.length === receivedBuffer.length) {
      isValid = crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );
    }

    if (!isValid) {
      console.error("❌ Invalid Razorpay signature");

      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    console.log("✅ Payment verified successfully");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error(
      "❌ Razorpay verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
      error: error.message,
    });
  }
});

// =====================================================
// EXPORT
// =====================================================

module.exports = router;