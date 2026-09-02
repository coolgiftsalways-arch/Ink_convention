const express = require("express");

const ArtistBooking = require("../models/ArtistBooking");
const TattooStudio = require("../models/TattooStudio");

const TATTOO_CATEGORIES = require("../constants/tattooCategories");

const {
  sendArtistBookingEmail,
} = require("../services/emailService");

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

  if (
    value === "silver" ||
    value === "pro"
  ) {
    return "pro";
  }

  return "basic";
}

function getPlanPriority(artist) {
  const plan = normalizePlan(artist.plan);

  if (plan === "verified") {
    return 1;
  }

  if (plan === "pro") {
    return 2;
  }

  return 3;
}

function sortRecommendedArtists(artists) {
  return [...artists].sort((a, b) => {
    const priorityA = getPlanPriority(a);
    const priorityB = getPlanPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const ratingA = Number(a.rating) || 0;
    const ratingB = Number(b.rating) || 0;

    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }

    const reviewsA = Number(a.reviews) || 0;
    const reviewsB = Number(b.reviews) || 0;

    return reviewsB - reviewsA;
  });
}

/* =========================================================
   FIND MATCHING ARTISTS
========================================================= */

async function findMatchingArtists({
  city,
  category,
  preferredArtist,
}) {
  const escapedCity = escapeRegex(city);
  const escapedCategory = escapeRegex(category);

  /*
    FIRST PRIORITY:
    category + same city
  */

  let artists = await TattooStudio.find({
    city: {
      $regex: `^${escapedCity}$`,
      $options: "i",
    },

    tattooStyles: {
      $elemMatch: {
        $regex: `^${escapedCategory}$`,
        $options: "i",
      },
    },
  })
    .limit(30)
    .lean();

  /*
    SECOND PRIORITY:
    same tattoo category anywhere
  */

  if (artists.length === 0) {
    artists = await TattooStudio.find({
      tattooStyles: {
        $elemMatch: {
          $regex: `^${escapedCategory}$`,
          $options: "i",
        },
      },
    })
      .limit(30)
      .lean();
  }

  /*
    OPTIONAL:
    If customer typed a specific artist/studio,
    move matching artist to the top.
  */

  if (preferredArtist) {
    const search = preferredArtist.toLowerCase();

    artists.sort((a, b) => {
      const aName = String(
        a.name ||
          a.professionalName ||
          a.studio ||
          a.studioName ||
          "",
      ).toLowerCase();

      const bName = String(
        b.name ||
          b.professionalName ||
          b.studio ||
          b.studioName ||
          "",
      ).toLowerCase();

      const aMatches = aName.includes(search);
      const bMatches = bName.includes(search);

      if (aMatches && !bMatches) {
        return -1;
      }

      if (!aMatches && bMatches) {
        return 1;
      }

      return 0;
    });
  }

  /*
    Gold first
    Silver second
    Basic third

    Then rating + reviews
  */

  artists = sortRecommendedArtists(artists);

  /*
    Send only best 6 artists
  */

  return artists.slice(0, 6);
}

/* =========================================================
   CREATE BOOKING

   POST /api/artist-bookings
========================================================= */

router.post("/", async (req, res) => {
  try {
    const name = cleanText(req.body.name);

    const phone = cleanText(req.body.phone);

    const email = cleanText(req.body.email).toLowerCase();

    const city = cleanText(req.body.city);

    const category = cleanText(req.body.category);

    const preferredArtist = cleanText(
      req.body.preferredArtist,
    );

    const tattooIdea = cleanText(
      req.body.tattooIdea,
    );

    const preferredDate = req.body.preferredDate
      ? new Date(req.body.preferredDate)
      : null;

    /* =====================================================
       VALIDATION
    ===================================================== */

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

    if (
      !email ||
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required.",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Tattoo category is required.",
      });
    }

    /*
      Validate category against your allowed list.
    */

    const validCategory =
      TATTOO_CATEGORIES.some(
        (item) =>
          item.toLowerCase() ===
          category.toLowerCase(),
      );

    if (!validCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid tattoo category.",
      });
    }

    if (
      preferredDate &&
      Number.isNaN(preferredDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred date.",
      });
    }

    /* =====================================================
       FIND RECOMMENDED ARTISTS
    ===================================================== */

    const suggestedArtists =
      await findMatchingArtists({
        city,
        category,
        preferredArtist,
      });

    /* =====================================================
       SAVE BOOKING TO MONGODB
    ===================================================== */

    const booking = await ArtistBooking.create({
      name,
      phone,
      email,
      city,
      category,
      preferredArtist,
      preferredDate,
      tattooIdea,

      suggestedArtistIds:
        suggestedArtists.map(
          (artist) => artist._id,
        ),
    });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Booking request submitted successfully.",

      booking: {
        _id: booking._id,

        name: booking.name,

        phone: booking.phone,

        email: booking.email,

        city: booking.city,

        category: booking.category,

        preferredArtist:
          booking.preferredArtist,

        preferredDate:
          booking.preferredDate,

        tattooIdea: booking.tattooIdea,

        status: booking.status,

        createdAt: booking.createdAt,
      },

      count: suggestedArtists.length,

      suggestedArtists,
    });
  } catch (error) {
    console.error(
      "❌ Artist booking error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to submit artist booking.",

      error: error.message,
    });
  }
});

/* =========================================================
   SELECT ARTIST + SEND EMAIL

   Customer clicks:
   BOOK THIS ARTIST
           ↓
   SEND REQUEST

   POST /api/artist-bookings/:id/select-artist
========================================================= */

router.post(
  "/:id/select-artist",
  async (req, res) => {
    try {
      const bookingId = req.params.id;

      const artistId = cleanText(
        req.body.artistId,
      );

      /* =====================================================
         VALIDATION
      ===================================================== */

      if (!artistId) {
        return res.status(400).json({
          success: false,
          message:
            "Artist ID is required.",
        });
      }

      if (
        !require("mongoose").Types.ObjectId.isValid(
          bookingId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking ID.",
        });
      }

      if (
        !require("mongoose").Types.ObjectId.isValid(
          artistId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid artist ID.",
        });
      }

      /* =====================================================
         FIND BOOKING
      ===================================================== */

      const booking =
        await ArtistBooking.findById(
          bookingId,
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      /* =====================================================
         PREVENT SELECTING AGAIN
      ===================================================== */

      if (booking.selectedArtistId) {
        /*
          If same artist was already selected,
          don't create/send duplicate request.
        */

        if (
          String(
            booking.selectedArtistId,
          ) === String(artistId)
        ) {
          return res.status(200).json({
            success: true,

            message:
              "Booking request was already sent to this artist.",

            notificationSent:
              booking.artistNotified ===
              true,

            booking: {
              _id: booking._id,

              status: booking.status,

              selectedArtistId:
                booking.selectedArtistId,

              artistNotified:
                booking.artistNotified,

              artistNotifiedAt:
                booking.artistNotifiedAt,
            },
          });
        }

        return res.status(409).json({
          success: false,

          message:
            "You have already selected an artist for this booking.",
        });
      }

      /* =====================================================
         FIND ARTIST
      ===================================================== */

      const artist =
        await TattooStudio.findById(
          artistId,
        );

      if (!artist) {
        return res.status(404).json({
          success: false,

          message:
            "Artist not found.",
        });
      }

      /* =====================================================
         CHECK ARTIST WAS ACTUALLY SUGGESTED
      ===================================================== */

      const wasSuggested =
        Array.isArray(
          booking.suggestedArtistIds,
        ) &&
        booking.suggestedArtistIds.some(
          (id) =>
            String(id) ===
            String(artistId),
        );

      if (!wasSuggested) {
        return res.status(400).json({
          success: false,

          message:
            "This artist was not suggested for this booking.",
        });
      }

      /* =====================================================
         SAVE SELECTED ARTIST
      ===================================================== */

      booking.selectedArtistId =
        artist._id;

      booking.artistSelectedAt =
        new Date();

      booking.status = "pending";

      await booking.save();

      /* =====================================================
         GET ARTIST EMAIL
      ===================================================== */

      const artistEmail =
        cleanText(artist.email)
          .toLowerCase();

      const artistName =
        cleanText(
          artist.professionalName ||
            artist.studioName ||
            artist.studio ||
            artist.name,
        ) || "Artist";

      /* =====================================================
         SEND EMAIL
      ===================================================== */

      let notificationSent = false;

      let notificationMessage = "";

      if (!artistEmail) {
        console.log(
          "⚠️ Artist does not have email:",
          artist._id,
        );

        notificationMessage =
          "Artist does not have an email address.";
      } else {
        try {
          await sendArtistBookingEmail({
            to: artistEmail,

            artistName,

            artistId:
              String(artist._id),

            bookingId:
              String(booking._id),

            /*
              IMPORTANT:

              We intentionally DO NOT send:

              booking.name
              booking.phone
              booking.email

              in the email.

              Customer information should
              only be shown inside the
              verified artist dashboard.
            */
          });

          /* ===============================================
             EMAIL SUCCESS
          =============================================== */

          booking.artistNotified = true;

          booking.artistNotifiedAt =
            new Date();

          await booking.save();

          notificationSent = true;

          notificationMessage =
            "Artist email sent successfully.";

          console.log(
            "✅ Artist booking email sent:",
            artistEmail,
          );
        } catch (emailError) {
          console.error(
            "❌ Artist booking email failed:",
            emailError,
          );

          notificationMessage =
            "Booking saved, but artist email could not be sent.";
        }
      }

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.status(200).json({
        success: true,

        message: notificationSent
          ? "Booking request sent. Artist has been notified."
          : "Booking request saved. Artist notification could not be sent.",

        notificationSent,

        notificationMessage,

        booking: {
          _id: booking._id,

          status: booking.status,

          selectedArtistId:
            booking.selectedArtistId,

          artistSelectedAt:
            booking.artistSelectedAt,

          artistNotified:
            booking.artistNotified,

          artistNotifiedAt:
            booking.artistNotifiedAt,
        },

        artist: {
          _id: artist._id,

          name: artistName,

          plan:
            normalizePlan(
              artist.plan,
            ),
        },
      });
    } catch (error) {
      console.error(
        "❌ Select artist error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Something went wrong while sending booking request.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  },
);

/* =========================================================
   GET ALL BOOKINGS

   Useful later for Admin Panel

   GET /api/artist-bookings
========================================================= */

router.get("/", async (req, res) => {
  try {
    const page = Math.max(
      1,
      Number(req.query.page) || 1,
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(req.query.limit) || 20,
      ),
    );

    const skip =
      (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = cleanText(
        req.query.status,
      );
    }

    if (req.query.city) {
      filter.city = {
        $regex: `^${escapeRegex(
          req.query.city,
        )}$`,

        $options: "i",
      };
    }

    if (req.query.category) {
      filter.category = {
        $regex: `^${escapeRegex(
          req.query.category,
        )}$`,

        $options: "i",
      };
    }

    const [bookings, total] =
      await Promise.all([
        ArtistBooking.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .populate({
            path:
              "suggestedArtistIds",

            select:
              "name professionalName studio studioName city state plan tattooStyles rating reviews profileImage",
          })
          .populate({
            path:
              "selectedArtistId",

            select:
              "name professionalName studio studioName city state plan tattooStyles rating reviews profileImage email",
          })
          .lean(),

        ArtistBooking.countDocuments(
          filter,
        ),
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

        totalPages:
          Math.max(
            1,
            Math.ceil(
              total / limit,
            ),
          ),

        hasNextPage:
          page * limit < total,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get artist bookings error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load artist bookings.",
    });
  }
});

/* =========================================================
   GET ONE BOOKING
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    const booking =
      await ArtistBooking.findById(
        req.params.id,
      )
        .populate({
          path:
            "suggestedArtistIds",

          select:
            "name professionalName studio studioName city state plan tattooStyles rating reviews profileImage",
        })
        .populate({
          path:
            "selectedArtistId",

          select:
            "name professionalName studio studioName city state plan tattooStyles rating reviews profileImage",
        })
        .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,

        message:
          "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,

      booking,
    });
  } catch (error) {
    console.error(
      "❌ Get booking error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load booking.",
    });
  }
});

/* =========================================================
   UPDATE BOOKING STATUS

   PATCH /api/artist-bookings/:id/status
========================================================= */

router.patch(
  "/:id/status",

  async (req, res) => {
    try {
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

      const status = cleanText(
        req.body.status,
      ).toLowerCase();

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid booking status.",
        });
      }

      const booking =
        await ArtistBooking.findById(
          req.params.id,
        );

      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            "Booking not found.",
        });
      }

      booking.status = status;

      /* =====================================================
         SAVE STATUS DATE/TIME
      ===================================================== */

      if (status === "accepted") {
        booking.acceptedAt =
          new Date();

        booking.declinedAt = null;
      }

      if (status === "declined") {
        booking.declinedAt =
          new Date();
      }

      if (status === "confirmed") {
        booking.confirmedAt =
          new Date();
      }

      if (status === "completed") {
        booking.completedAt =
          new Date();
      }

      if (status === "cancelled") {
        booking.cancelledAt =
          new Date();
      }

      await booking.save();

      return res.status(200).json({
        success: true,

        message:
          "Booking status updated.",

        booking,
      });
    } catch (error) {
      console.error(
        "❌ Booking status error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to update booking.",
      });
    }
  },
);

module.exports = router;