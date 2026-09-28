const express = require("express");
const mongoose = require("mongoose");

const ArtistBooking = require("../models/ArtistBooking");
const TattooStudio = require("../models/TattooStudio");

const {
  sendFreeArtistBooking,
  sendPaidArtistBooking,
} = require("../services/interaktWhatsAppService");

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

/* =========================================================
   NORMALIZE ARTIST PLAN

   basic    = FREE
   pro      = SILVER
   verified = GOLD
========================================================= */

function normalizePlan(plan) {
  const value = cleanText(plan).toLowerCase();

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

/* =========================================================
   GET ARTIST PLAN
========================================================= */

function getArtistPlan(artist) {
  return normalizePlan(
    artist?.plan ||
      artist?.membershipPlan ||
      artist?.subscriptionPlan ||
      artist?.artistPlan ||
      "basic"
  );
}

/* =========================================================
   GET ARTIST NAME
========================================================= */

function getArtistName(artist) {
  return (
    cleanText(
      artist?.professionalName ||
        artist?.studioName ||
        artist?.studio ||
        artist?.name
    ) || "Artist"
  );
}

/* =========================================================
   GET ARTIST PHONE
========================================================= */

function getArtistPhone(artist) {
  return cleanText(
    artist?.phone ||
      artist?.phoneNumber ||
      artist?.mobile ||
      artist?.mobileNumber ||
      artist?.contactNumber ||
      artist?.whatsapp ||
      artist?.whatsappNumber ||
      artist?.whatsappPhone
  );
}

/* =========================================================
   SERIALIZE BOOKING
========================================================= */

function serializeBooking(booking) {
  if (!booking) {
    return null;
  }

  const data =
    typeof booking.toObject === "function"
      ? booking.toObject()
      : { ...booking };

  return {
    ...data,

    // Keep compatibility with existing frontend/admin
    preferredArtist:
      data.selectedArtistName || "",

    city:
      data.artistCity || "",

    state:
      data.artistState || "",

    category:
      data.tattooStyle || "",
  };
}

/* =========================================================
   SEND ARTIST WHATSAPP
========================================================= */

async function notifyArtist({
  booking,
  artist,
  artistName,
  artistPlan,
}) {
  const artistPhone =
    getArtistPhone(artist);

  console.log("📱 Artist notification check:", {
    artistId:
      String(artist._id),

    artistName,

    artistPlan,

    hasPhone:
      Boolean(artistPhone),
  });

  /* =====================================================
     NO PHONE
  ===================================================== */

  if (!artistPhone) {
    const message =
      "Artist WhatsApp phone number is missing.";

    booking.artistNotified = false;

    booking.artistNotifiedAt = null;

    booking.artistNotificationChannel =
      "whatsapp";

    booking.artistNotificationError =
      message;

    await booking.save();

    console.error(
      "❌ Artist WhatsApp notification failed:",
      message
    );

    return {
      sent: false,
      messageId: "",
      error: message,
    };
  }

  try {
    let result;

    /* =====================================================
       FREE ARTIST
    ===================================================== */

    if (artistPlan === "basic") {
      console.log(
        "🆓 FREE artist detected — sending masked booking template..."
      );

      result =
        await sendFreeArtistBooking({
          artistPhone,

          artistName,

          customerName:
            booking.name,

          customerPhone:
            booking.phone,

          tattooStyle:
            booking.tattooStyle,

          tattooIdea:
            booking.tattooIdea,

          preferredDate:
            booking.preferredDate,

          preferredTime:
            booking.preferredTime,

          bookingId:
            String(
              booking._id
            ),
        });

      booking.artistNotificationType =
        "free-upgrade";
    }

    /* =====================================================
       SILVER / GOLD ARTIST
    ===================================================== */

    else {
      console.log(
        "💎 PAID artist detected — sending full booking template..."
      );

      result =
        await sendPaidArtistBooking({
          artistPhone,

          artistName,

          customerName:
            booking.name,

          customerPhone:
            booking.phone,

          customerEmail:
            booking.email,

          tattooStyle:
            booking.tattooStyle,

          tattooIdea:
            booking.tattooIdea,

          preferredDate:
            booking.preferredDate,

          preferredTime:
            booking.preferredTime,

          bookingId:
            String(
              booking._id
            ),
        });

      booking.artistNotificationType =
        artistPlan === "verified"
          ? "gold-booking"
          : "silver-booking";
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    const messageId =
      cleanText(
        result?.messageId
      );

    booking.artistNotified =
      true;

    booking.artistNotifiedAt =
      new Date();

    booking.artistNotificationChannel =
      "whatsapp";

    booking.artistNotificationMessageId =
      messageId;

    booking.artistNotificationError =
      "";

    booking.artistNotificationMessage =
      artistPlan === "basic"
        ? `Interakt template: ${
            process.env
              .INTERAKT_FREE_TEMPLATE ||
            "inkconvention_free_booking"
          }`
        : `Interakt template: ${
            process.env
              .INTERAKT_PAID_TEMPLATE ||
            "inkconvention_paid_booking"
          }`;

    await booking.save();

    console.log(
      "✅ Artist WhatsApp notification sent:",
      {
        bookingId:
          String(
            booking._id
          ),

        artistId:
          String(
            artist._id
          ),

        artistName,

        artistPlan,

        messageId,
      }
    );

    return {
      sent: true,

      messageId,

      error: "",
    };
  } catch (error) {
    /* =====================================================
       WHATSAPP FAILED

       Booking itself should NOT fail.
    ===================================================== */

    const message =
      error?.message ||
      "Unable to send WhatsApp notification.";

    booking.artistNotified =
      false;

    booking.artistNotifiedAt =
      null;

    booking.artistNotificationChannel =
      "whatsapp";

    booking.artistNotificationError =
      message.slice(
        0,
        1000
      );

    await booking.save();

    console.error(
      "❌ Artist WhatsApp notification failed:",
      {
        bookingId:
          String(
            booking._id
          ),

        artistId:
          String(
            artist._id
          ),

        artistName,

        artistPlan,

        error:
          message,
      }
    );

    return {
      sent: false,

      messageId: "",

      error:
        message,
    };
  }
}

/* =========================================================
   CREATE DIRECT ARTIST BOOKING

   POST /api/artist-bookings
========================================================= */

router.post(
  "/",
  async (req, res) => {
    try {
      /* =====================================================
         CUSTOMER
      ===================================================== */

      const name =
        cleanText(
          req.body.name
        );

      const phone =
        cleanText(
          req.body.phone
        );

      const email =
        cleanText(
          req.body.email
        ).toLowerCase();

      /* =====================================================
         ARTIST
      ===================================================== */

      const selectedArtistId =
        cleanText(
          req.body
            .selectedArtistId
        );

      /* =====================================================
         BOOKING
      ===================================================== */

      const tattooStyle =
        cleanText(
          req.body
            .tattooStyle ||
            req.body.category
        );

      const tattooIdea =
        cleanText(
          req.body
            .tattooIdea
        );

      const preferredTime =
        cleanText(
          req.body
            .preferredTime
        );

      const bodyPlacement =
        cleanText(
          req.body
            .bodyPlacement
        );

      const tattooSize =
        cleanText(
          req.body
            .tattooSize
        );

      const budget =
        cleanText(
          req.body
            .budget
        );

      const referenceLink =
        cleanText(
          req.body
            .referenceLink
        );

      const additionalMessage =
        cleanText(
          req.body
            .additionalMessage
        );

      const preferredDate =
        req.body
          .preferredDate
          ? new Date(
              req.body
                .preferredDate
            )
          : null;

      /* =====================================================
         VALIDATION
      ===================================================== */

      if (!name) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name is required.",
          });
      }

      if (!phone) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Phone number is required.",
          });
      }

      if (
        !email ||
        !/^\S+@\S+\.\S+$/.test(
          email
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Valid email is required.",
          });
      }

      if (
        !selectedArtistId
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Selected artist ID is required.",
          });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          selectedArtistId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid artist ID.",
          });
      }

      if (
        !tattooStyle
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Tattoo style is required.",
          });
      }

      if (
        !tattooIdea
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Tattoo idea is required.",
          });
      }

      if (
        preferredDate &&
        Number.isNaN(
          preferredDate.getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid preferred date.",
          });
      }

      /* =====================================================
         FIND ARTIST FROM DATABASE
      ===================================================== */

      const artist =
        await TattooStudio.findById(
          selectedArtistId
        );

      if (!artist) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Selected artist was not found.",
          });
      }

      const artistName =
        getArtistName(
          artist
        );

      const artistPlan =
        getArtistPlan(
          artist
        );

      const artistPhone =
        getArtistPhone(
          artist
        );

      console.log(
        "🎨 Selected artist:",
        {
          id:
            String(
              artist._id
            ),

          name:
            artistName,

          plan:
            artistPlan,

          hasPhone:
            Boolean(
              artistPhone
            ),
        }
      );

      /* =====================================================
         CREATE BOOKING
      ===================================================== */

      const booking =
        await ArtistBooking.create(
          {
            /* CUSTOMER */

            name,

            phone,

            email,

            /* ARTIST */

            selectedArtistId:
              artist._id,

            selectedArtistName:
              artistName,

            artistCity:
              cleanText(
                artist.city
              ),

            artistState:
              cleanText(
                artist.state
              ),

            artistPlanAtBooking:
              artistPlan,

            artistSelectedAt:
              new Date(),

            /* BOOKING */

            tattooStyle,

            preferredDate,

            preferredTime,

            tattooIdea,

            bodyPlacement,

            tattooSize,

            budget,

            referenceLink,

            additionalMessage,

            /* STATUS */

            status:
              "pending",

            /* ARTIST NOTIFICATION */

            artistNotified:
              false,

            artistNotifiedAt:
              null,

            artistNotificationType:
              "",

            artistNotificationChannel:
              "",

            artistNotificationMessage:
              "",

            artistNotificationMessageId:
              "",

            artistNotificationError:
              "",
          }
        );

      console.log(
        "✅ Direct artist booking created:",
        {
          bookingId:
            String(
              booking._id
            ),

          artistId:
            String(
              artist._id
            ),

          artistName,

          artistPlan,
        }
      );

      /* =====================================================
         START WHATSAPP
      ===================================================== */

      console.log(
        "🚀 Starting artist WhatsApp notification..."
      );

      const notification =
        await notifyArtist({
          booking,

          artist,

          artistName,

          artistPlan,
        });

      console.log(
        "📲 WhatsApp notification result:",
        notification
      );

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Booking request submitted successfully.",

          notificationSent:
            notification.sent,

          notificationMessageId:
            notification.messageId,

          notificationError:
            notification.error ||
            "",

          booking:
            serializeBooking(
              booking
            ),

          artist: {
            _id:
              artist._id,

            name:
              artistName,

            plan:
              artistPlan,

            city:
              cleanText(
                artist.city
              ),

            state:
              cleanText(
                artist.state
              ),

            notificationSent:
              notification.sent,
          },
        });
    } catch (error) {
      console.error(
        "❌ Direct artist booking error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to submit artist booking.",

          error:
            process.env
              .NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }
  }
);

/* =========================================================
   GET ALL BOOKINGS

   GET /api/artist-bookings
========================================================= */

router.get(
  "/",
  async (req, res) => {
    try {
      const page =
        Math.max(
          1,

          Number(
            req.query.page
          ) || 1
        );

      const limit =
        Math.min(
          100,

          Math.max(
            1,

            Number(
              req.query
                .limit
            ) || 20
          )
        );

      const skip =
        (page - 1) *
        limit;

      const filter =
        {};

      /* =====================================================
         STATUS
      ===================================================== */

      if (
        req.query
          .status
      ) {
        filter.status =
          cleanText(
            req.query
              .status
          ).toLowerCase();
      }

      /* =====================================================
         CITY
      ===================================================== */

      if (
        req.query.city
      ) {
        filter.artistCity =
          {
            $regex:
              `^${escapeRegex(
                req.query
                  .city
              )}$`,

            $options:
              "i",
          };
      }

      /* =====================================================
         TATTOO STYLE
      ===================================================== */

      if (
        req.query
          .category ||
        req.query
          .tattooStyle
      ) {
        const style =
          cleanText(
            req.query
              .category ||
              req.query
                .tattooStyle
          );

        filter.tattooStyle =
          {
            $regex:
              `^${escapeRegex(
                style
              )}$`,

            $options:
              "i",
          };
      }

      /* =====================================================
         PLAN
      ===================================================== */

      if (
        req.query.plan
      ) {
        filter.artistPlanAtBooking =
          normalizePlan(
            req.query
              .plan
          );
      }

      /* =====================================================
         ARTIST ID
      ===================================================== */

      if (
        req.query
          .artistId
      ) {
        const artistId =
          cleanText(
            req.query
              .artistId
          );

        if (
          !mongoose.Types.ObjectId.isValid(
            artistId
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Invalid artist ID.",
            });
        }

        filter.selectedArtistId =
          artistId;
      }

      /* =====================================================
         QUERY
      ===================================================== */

      const [
        bookings,
        total,
      ] =
        await Promise.all(
          [
            ArtistBooking.find(
              filter
            )
              .sort({
                createdAt:
                  -1,
              })
              .skip(
                skip
              )
              .limit(
                limit
              )
              .populate(
                {
                  path:
                    "selectedArtistId",

                  select:
                    [
                      "name",
                      "professionalName",
                      "studio",
                      "studioName",
                      "city",
                      "state",
                      "plan",
                      "membershipPlan",
                      "subscriptionPlan",
                      "tattooStyles",
                      "rating",
                      "reviews",
                      "profileImage",
                      "email",
                      "phone",
                      "phoneNumber",
                      "mobile",
                      "mobileNumber",
                      "whatsapp",
                      "whatsappNumber",
                    ].join(
                      " "
                    ),
                }
              )
              .lean(),

            ArtistBooking.countDocuments(
              filter
            ),
          ]
        );

      return res
        .status(200)
        .json({
          success:
            true,

          count:
            bookings.length,

          total,

          bookings:
            bookings.map(
              serializeBooking
            ),

          pagination: {
            page,

            limit,

            total,

            totalPages:
              Math.max(
                1,

                Math.ceil(
                  total /
                    limit
                )
              ),

            hasNextPage:
              page *
                limit <
              total,

            hasPreviousPage:
              page > 1,
          },
        });
    } catch (error) {
      console.error(
        "❌ Get artist bookings error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load artist bookings.",

          error:
            process.env
              .NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }
  }
);

/* =========================================================
   GET ONE BOOKING

   GET /api/artist-bookings/:id
========================================================= */

router.get(
  "/:id",
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid booking ID.",
          });
      }

      const booking =
        await ArtistBooking.findById(
          req.params.id
        )
          .populate({
            path:
              "selectedArtistId",

            select:
              [
                "name",
                "professionalName",
                "studio",
                "studioName",
                "city",
                "state",
                "plan",
                "membershipPlan",
                "subscriptionPlan",
                "tattooStyles",
                "rating",
                "reviews",
                "profileImage",
                "email",
                "phone",
                "phoneNumber",
                "mobile",
                "mobileNumber",
                "whatsapp",
                "whatsappNumber",
              ].join(
                " "
              ),
          })
          .lean();

      if (!booking) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Booking not found.",
          });
      }

      return res
        .status(200)
        .json({
          success:
            true,

          booking:
            serializeBooking(
              booking
            ),
        });
    } catch (error) {
      console.error(
        "❌ Get booking error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load booking.",

          error:
            process.env
              .NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }
  }
);

/* =========================================================
   UPDATE BOOKING STATUS

   PATCH /api/artist-bookings/:id/status
========================================================= */

router.patch(
  "/:id/status",
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid booking ID.",
          });
      }

      const allowedStatuses =
        [
          "pending",
          "accepted",
          "declined",
          "contacted",
          "confirmed",
          "completed",
          "cancelled",
        ];

      const status =
        cleanText(
          req.body.status
        ).toLowerCase();

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid booking status.",
          });
      }

      const booking =
        await ArtistBooking.findById(
          req.params.id
        );

      if (!booking) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Booking not found.",
          });
      }

      booking.status =
        status;

      /* =====================================================
         ACCEPTED
      ===================================================== */

      if (
        status ===
        "accepted"
      ) {
        booking.acceptedAt =
          new Date();

        booking.declinedAt =
          null;

        booking.declineReason =
          "";
      }

      /* =====================================================
         DECLINED
      ===================================================== */

      if (
        status ===
        "declined"
      ) {
        booking.declinedAt =
          new Date();

        booking.declineReason =
          cleanText(
            req.body
              .declineReason
          );
      }

      /* =====================================================
         CONTACTED
      ===================================================== */

      if (
        status ===
        "contacted"
      ) {
        booking.contactedAt =
          new Date();
      }

      /* =====================================================
         CONFIRMED
      ===================================================== */

      if (
        status ===
        "confirmed"
      ) {
        booking.confirmedAt =
          new Date();
      }

      /* =====================================================
         COMPLETED
      ===================================================== */

      if (
        status ===
        "completed"
      ) {
        booking.completedAt =
          new Date();
      }

      /* =====================================================
         CANCELLED
      ===================================================== */

      if (
        status ===
        "cancelled"
      ) {
        booking.cancelledAt =
          new Date();
      }

      await booking.save();

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Booking status updated.",

          booking:
            serializeBooking(
              booking
            ),
        });
    } catch (error) {
      console.error(
        "❌ Booking status error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update booking.",

          error:
            process.env
              .NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;