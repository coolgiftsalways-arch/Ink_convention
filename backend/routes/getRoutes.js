const express = require("express");
const mongoose = require("mongoose");

const {
  createGet,
  getAllGets,
  getGetById,
  updateGetStatus,
  deleteGet,
} = require("../Controller/getController");

const Get = require("../models/Get");

const claimRoutes = require("./claimRoutes");

const router = express.Router();

/* =====================================================
   INKCONVENTION — FIVE CITY TOUR

   Each city has one fixed date.
===================================================== */

const TOUR_DATES = Object.freeze({
  gorakhpur: "2026-11-22",

  noida: "2026-11-29",

  varanasi: "2026-12-06",

  agra: "2026-12-13",

  lucknow: "2026-12-20",
});

/* =====================================================
   NORMAL AND VIP PRICING

   NORMAL:
   First person: ₹999
   Additional person: ₹999

   VIP:
   First person: ₹1999
   Additional person: ₹1499
===================================================== */

const TOUR_PASS_PRICES = Object.freeze({
  normal: {
    first: 999,
    extra: 999,
  },

  vip: {
    first: 1999,
    extra: 1499,
  },
});

/* =====================================================
   EXISTING CLAIM SESSION

   Keep the previous artist-verified flow.
===================================================== */

const requireGetEntryClaimSession = (req, res, next) => {
  const requireClaimSession = claimRoutes.requireClaimSession;

  if (typeof requireClaimSession !== "function") {
    console.error("requireClaimSession not exported from claimRoutes.js");

    return res.status(500).json({
      success: false,
      message: "Claim middleware is not configured.",
    });
  }

  return requireClaimSession(req, res, next);
};

/* =====================================================
   ERROR RESPONSE HELPER
===================================================== */

const reject = (res, message, status = 400) =>
  res.status(status).json({
    success: false,
    message,
  });

/* =====================================================
   PUBLIC GET ENTRY RESPONSE

   POST /api/get/response

   - No artist claim required
   - No OTP required
   - No payment collected
   - One city per response
   - NORMAL or VIP
   - Prices calculated on server
===================================================== */

router.post("/response", async (req, res) => {
  try {
    /* ===============================================
       CHECK DATABASE CONNECTION
    =============================================== */

    if (mongoose.connection.readyState !== 1) {
      return reject(res, "Database is not connected.", 503);
    }

    /* ===============================================
       READ REQUEST BODY
    =============================================== */

    const { fullName, email, mobile, state, tickets, bookings, passType } =
      req.body || {};

    /* ===============================================
       CLEAN PERSONAL DETAILS
    =============================================== */

    const cleanName = String(fullName ?? "").trim();

    const cleanEmail = String(email ?? "")
      .trim()
      .toLowerCase();

    const cleanMobile = String(mobile ?? "").trim();

    const cleanState = String(state ?? "").trim();

    /* ===============================================
       VALIDATE REQUIRED DETAILS
    =============================================== */

    if (!cleanName || !cleanEmail || !cleanMobile || !cleanState) {
      return reject(res, "Please fill in all personal details.");
    }

    /* ===============================================
       VALIDATE INPUT LENGTH
    =============================================== */

    if (
      cleanName.length > 150 ||
      cleanEmail.length > 254 ||
      cleanMobile.length > 25 ||
      cleanState.length > 100
    ) {
      return reject(res, "One or more personal details are too long.");
    }

    /* ===============================================
       VALIDATE EMAIL
    =============================================== */

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return reject(res, "Invalid email address.");
    }

    /* ===============================================
       VALIDATE MOBILE NUMBER
    =============================================== */

    const mobileDigits = cleanMobile.replace(/\D/g, "");

    if (mobileDigits.length < 10 || mobileDigits.length > 15) {
      return reject(res, "Invalid mobile number.");
    }

    /* ===============================================
       VALIDATE NUMBER OF PEOPLE
    =============================================== */

    const people = Number(tickets);

    if (!Number.isInteger(people) || people < 1 || people > 10) {
      return reject(res, "Number of people must be between 1 and 10.");
    }

    /* ===============================================
       VALIDATE BOOKING ARRAY

       Only one city can be selected.
    =============================================== */

    if (!Array.isArray(bookings) || bookings.length !== 1) {
      return reject(res, "Please select exactly one event city.");
    }

    const requested = bookings[0];

    if (
      !requested ||
      typeof requested !== "object" ||
      Array.isArray(requested)
    ) {
      return reject(res, "Invalid booking information.");
    }

    /* ===============================================
       VALIDATE SELECTED CITY
    =============================================== */

    const city = String(requested.eventCity ?? "")
      .trim()
      .toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(TOUR_DATES, city)) {
      return reject(res, "Invalid event city selected.");
    }

    /* ===============================================
       VALIDATE ONE-DAY PASS
    =============================================== */

    if (Number(requested.passDays) !== 1) {
      return reject(res, "Only a one-day pass is available for this event.");
    }

    /* ===============================================
       VALIDATE EVENT DATE

       Each city has one allowed date.
    =============================================== */

    if (
      !Array.isArray(requested.selectedDates) ||
      requested.selectedDates.length !== 1 ||
      requested.selectedDates[0] !== TOUR_DATES[city]
    ) {
      return reject(res, `Invalid event date selected for ${city}.`);
    }

    /* ===============================================
       NORMAL / VIP VALIDATION

       Frontend sends passType at top level
       and inside bookings[0].
    =============================================== */

    const topPass = String(passType ?? "")
      .trim()
      .toLowerCase();

    const bookingPass = String(requested.passType ?? "")
      .trim()
      .toLowerCase();

    /* ===============================================
       ENSURE PASS TYPES MATCH
    =============================================== */

    if (topPass && bookingPass && topPass !== bookingPass) {
      return reject(res, "The selected pass types do not match.");
    }

    const selectedPass = bookingPass || topPass;

    /* ===============================================
       VALIDATE SELECTED PASS
    =============================================== */

    if (!Object.prototype.hasOwnProperty.call(TOUR_PASS_PRICES, selectedPass)) {
      return reject(res, "Please choose NORMAL or VIP.");
    }

    /* ===============================================
       VALIDATE ATTENDEE COUNT
    =============================================== */

    if (
      requested.tickets !== undefined &&
      Number(requested.tickets) !== people
    ) {
      return reject(res, "The number of attendees does not match.");
    }

    /* ===============================================
       SERVER-SIDE PRICE CALCULATION

       Never trust prices sent by frontend.
    =============================================== */

    const prices = TOUR_PASS_PRICES[selectedPass];

    const firstPersonPrice = prices.first;

    const additionalAmount = (people - 1) * prices.extra;

    const totalAmount = firstPersonPrice + additionalAmount;

    /* ===============================================
       PREPARE VALIDATED BOOKING
    =============================================== */

    const selectedBooking = {
      eventCity: city,

      passDays: 1,

      passType: selectedPass,

      selectedDates: [TOUR_DATES[city]],

      tickets: people,

      firstPersonPrice,

      additionalAmount,

      totalAmount,
    };

    /* ===============================================
       SAVE TO MONGODB

       Preserve original admin fields.
    =============================================== */

    const entry = await Get.create({
      fullName: cleanName,

      email: cleanEmail,

      mobile: cleanMobile,

      state: cleanState,

      artistProfile: null,

      eventCity: city,

      eventDate: TOUR_DATES[city],

      tickets: people,

      ticketPrice: firstPersonPrice,

      additionalTicketPrice: prices.extra,

      passType: selectedPass,

      bookings: [selectedBooking],

      totalAmount,

      source: "tour-entry",

      status: "New",
    });

    console.log("INKCONVENTION tour entry response saved:", entry._id);

    /* ===============================================
       SUCCESS RESPONSE
    =============================================== */

    return res.status(201).json({
      success: true,

      message:
        "Your response has been submitted successfully. Our team will contact you within 24 hours.",

      request: {
        _id: entry._id,

        fullName: entry.fullName,

        email: entry.email,

        eventCity: entry.eventCity,

        eventDate: entry.eventDate,

        tickets: entry.tickets,

        passType: entry.passType,

        bookings: entry.bookings,

        totalAmount: entry.totalAmount,

        status: entry.status,

        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error("GET ENTRY response error:", error);

    /* ===============================================
       MONGOOSE VALIDATION ERROR
    =============================================== */

    if (error.name === "ValidationError") {
      return reject(res, error.message, 400);
    }

    /* ===============================================
       OTHER SERVER ERRORS
    =============================================== */

    return reject(
      res,
      "Unable to submit your response. Please try again.",
      500,
    );
  }
});

/* =====================================================
   EXISTING ARTIST CLAIM BOOKING

   Do not remove this route.
===================================================== */

router.post("/", requireGetEntryClaimSession, createGet);

/* =====================================================
   EXISTING ADMIN ROUTES
===================================================== */

// Get all entries
router.get("/", getAllGets);

// Get one entry
router.get("/:id", getGetById);

// Update booking status
router.patch("/:id/status", updateGetStatus);

// Delete entry
router.delete("/:id", deleteGet);

/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;
