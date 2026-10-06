const mongoose = require("mongoose");

const getSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required."],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required."],
      trim: true,
    },

    eventCity: {
      type: String,
      required: true,
      enum: ["jaipur", "udaipur", "kota"],
      lowercase: true,
      trim: true,
    },

    eventDate: {
      type: String,
      required: true,
    },

    tickets: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },

    ticketPrice: {
      type: Number,
      required: true,
      default: 1100,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Confirmed", "Cancelled"],
      default: "New",
    },

    contactedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

getSchema.index({
  createdAt: -1,
});

getSchema.index({
  status: 1,
});

const Get = mongoose.models.Get || mongoose.model("Get", getSchema);

module.exports = Get;
