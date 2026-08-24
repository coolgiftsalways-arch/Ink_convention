const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Package prices - ALWAYS keep these on the backend
const PACKAGE_PRICES = {
  single: 499,
  pro: 1299,
  multi: 1999,
};

/*
|--------------------------------------------------------------------------
| CREATE RAZORPAY ORDER
|--------------------------------------------------------------------------
| POST /api/payment/create-order
*/
router.post("/create-order", async (req, res) => {
  try {
    const { amount, packageId, email, phone, name } = req.body;

    // Validate package
    if (!PACKAGE_PRICES[packageId]) {
      return res.status(400).json({
        success: false,
        message: "Invalid entry package.",
      });
    }

    // Get price from backend, NOT from frontend
    const expectedAmount = PACKAGE_PRICES[packageId];

    // Make sure frontend amount matches backend price
    if (Number(amount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
      });
    }

    // Razorpay expects amount in paise
    const amountInPaise = expectedAmount * 100;

    const receipt = `INK26_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,

      notes: {
        packageId: packageId,
        customerName: name || "",
        email: email || "",
        phone: phone || "",
      },

      // Recommended for normal one-time payments
      payment_capture: 1,
    });

    return res.status(200).json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      orderId: order.id,

      amount: order.amount,

      currency: order.currency,

      packageId: packageId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| VERIFY RAZORPAY PAYMENT
|--------------------------------------------------------------------------
| POST /api/payment/verify
*/
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details.",
      });
    }

    // Create HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Timing-safe comparison
    const isValid =
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
      error: error.message,
    });
  }
});

module.exports = router;
