const mongoose = require("mongoose");

const stallBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },

    ownerName: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    expoCity: {
      type: String,
      default: "",
      trim: true,
    },

    brandName: {
      type: String,
      default: "",
      trim: true,
    },

    studioName: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "1",
    },

    packageId: {
      type: String,
      default: "",
    },

    packageName: {
      type: String,
      default: "",
    },

    packagePrice: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    advanceAmount: {
      type: Number,
      default: 1499,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    bookingStatus: {
      type: String,
      enum: ["new", "contacted", "confirmed", "paid", "cancelled"],
      default: "confirmed",
    },

    status: {
      type: String,
      default: "CONFIRMED",
    },

    razorpay_order_id: {
      type: String,
      default: "",
    },

    razorpay_payment_id: {
      type: String,
      default: "",
    },

    razorpay_signature: {
      type: String,
      default: "",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    orderId: {
      type: String,
      default: "",
    },

    paymentId: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    extraData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

module.exports =
  mongoose.models.StallBooking ||
  mongoose.model("StallBooking", stallBookingSchema);
