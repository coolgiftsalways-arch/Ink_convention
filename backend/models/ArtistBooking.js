const mongoose = require("mongoose");

const artistBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    preferredArtist: {
      type: String,
      default: "",
      trim: true,
    },

    preferredDate: {
      type: Date,
      default: null,
    },

    tattooIdea: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "new",
      index: true,
    },

    suggestedArtistIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TattooStudio",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const ArtistBooking =
  mongoose.models.ArtistBooking ||
  mongoose.model("ArtistBooking", artistBookingSchema);

module.exports = ArtistBooking;