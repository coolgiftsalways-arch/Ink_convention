const express = require("express");
const mongoose = require("mongoose");

const ArtistBooking = require("../models/ArtistBooking");
const TattooStudio = require("../models/TattooStudio");

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  return String(value || "").trim();
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePlan(plan) {
  const value = String(plan || "")
    .trim()
    .toLowerCase();

  if (
    value === "gold" ||
    value === "verified" ||
    value === "spotlight"
  ) {
    return "verified";
  }

  if (value === "silver" || value === "pro") {
    return "pro";
  }

  return "basic";
}

function getArtistName(artist) {
  return (
    cleanText(
      artist?.professionalName ||
        artist?.studioName ||
        artist?.studio ||
        artist?.name,
    ) || "Artist"
  );
}

/* =========================================================
   CREATE DIRECT ARTIST BOOKING

   POST /api/artist-bookings
========================================================= */

router.post("/", async (req, res) => {
  try {
    const name = cleanText(req.body.name);
    const phone = cleanText(req.body.phone);
    const email = cleanText(req.body.email).toLowerCase();

    const selectedArtistId = cleanText(req.body.selectedArtistId);

    const category = cleanText(req.body.category);
    const tattooIdea = cleanText(req.body.tattooIdea);

    const preferredTime = cleanText(req.body.preferredTime);

    const preferredDate = req.body.preferredDate
      ? new Date(req.body.preferredDate)
      : null;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required.",
      });
    }

    if (!selectedArtistId) {
      return res.status(400).json({
        success: false,
        message: "Selected artist ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(selectedArtistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid artist ID.",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Tattoo style is required.",
      });
    }

    if (!tattooIdea) {
      return res.status(400).json({
        success: false,
        message: "Tattoo idea is required.",
      });
    }

    if (preferredDate && Number.isNaN(preferredDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred date.",
      });
    }

    const artist = await TattooStudio.findById(selectedArtistId);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Selected artist was not found.",
      });
    }

    const artistName = getArtistName(artist);
    const artistPlan = normalizePlan(artist.plan);

    const booking = await ArtistBooking.create({
      name,
      phone,
      email,

      city: cleanText(artist.city),
      category,

      preferredArtist: artistName,

      selectedArtistId: artist._id,
      artistSelectedAt: new Date(),

      preferredDate,
      preferredTime,

      tattooIdea,

      status: "pending",

      // SMS/email disabled for now
      artistNotified: false,
      artistNotifiedAt: null,
    });

    console.log("✅ Direct artist booking created:", {
      bookingId: String(booking._id),
      artistId: String(artist._id),
      artistName,
      artistPlan,
    });

    return res.status(201).json({
      success: true,

      message: "Booking request submitted successfully.",

      // No actual SMS/email yet
      notificationSent: false,

      booking: {
        _id: booking._id,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        city: booking.city,
        category: booking.category,
        preferredArtist: booking.preferredArtist,
        selectedArtistId: booking.selectedArtistId,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        tattooIdea: booking.tattooIdea,
        status: booking.status,
        createdAt: booking.createdAt,
      },

      artist: {
        _id: artist._id,
        name: artistName,
        plan: artistPlan,
        city: artist.city,
        state: artist.state,
      },
    });
  } catch (error) {
    console.error("❌ Direct artist booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit artist booking.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

/* =========================================================
   GET ALL BOOKINGS

   GET /api/artist-bookings
========================================================= */

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);

    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 20),
    );

    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = cleanText(req.query.status);
    }

    if (req.query.city) {
      filter.city = {
        $regex: `^${escapeRegex(req.query.city)}$`,
        $options: "i",
      };
    }

    if (req.query.category) {
      filter.category = {
        $regex: `^${escapeRegex(req.query.category)}$`,
        $options: "i",
      };
    }

    if (req.query.artistId) {
      const artistId = cleanText(req.query.artistId);

      if (!mongoose.Types.ObjectId.isValid(artistId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid artist ID.",
        });
      }

      filter.selectedArtistId = artistId;
    }

    const [bookings, total] = await Promise.all([
      ArtistBooking.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "selectedArtistId",
          select:
            "name professionalName studio studioName city state plan tattooStyles rating reviews profileImage email phone",
        })
        .lean(),

      ArtistBooking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      bookings,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get artist bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load artist bookings.",
    });
  }
});

/* =========================================================
   GET ONE BOOKING

   GET /api/artist-bookings/:id
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await ArtistBooking.findById(req.params.id)
      .populate({
        path: "selectedArtistId",
        select:
          "name professionalName studio studioName city state plan tattooStyles rating reviews profileImage email phone",
      })
      .lean();

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
    console.error("❌ Get booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load booking.",
    });
  }
});

/* =========================================================
   UPDATE BOOKING STATUS

   PATCH /api/artist-bookings/:id/status
========================================================= */

router.patch("/:id/status", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const allowedStatuses = [
      "new",
      "pending",
      "accepted",
      "declined",
      "contacted",
      "confirmed",
      "completed",
      "cancelled",
    ];

    const status = cleanText(req.body.status).toLowerCase();

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const booking = await ArtistBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    booking.status = status;

    if (status === "accepted") {
      booking.acceptedAt = new Date();
      booking.declinedAt = null;
    }

    if (status === "declined") {
      booking.declinedAt = new Date();
    }

    if (status === "confirmed") {
      booking.confirmedAt = new Date();
    }

    if (status === "completed") {
      booking.completedAt = new Date();
    }

    if (status === "cancelled") {
      booking.cancelledAt = new Date();
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated.",
      booking,
    });
  } catch (error) {
    console.error("❌ Booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update booking.",
    });
  }
});

module.exports = router;