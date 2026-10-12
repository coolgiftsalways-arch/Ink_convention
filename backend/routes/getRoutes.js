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
   PRICING
===================================================== */

const PASS_PRICES = {
  1: 2999,
  2: 4999,
  3: 5999,
};

const EXTRA_PERSON_PRICE = 1499;

/* =====================================================
   VALID CITY DATES
===================================================== */

const CITY_DATES = {
  jaipur: ["2026-10-30", "2026-10-31", "2026-11-01"],

  udaipur: ["2026-11-13", "2026-11-14", "2026-11-15"],

  kota: ["2026-11-20", "2026-11-21", "2026-11-22"],
};

/* =====================================================
   EXISTING CLAIM SESSION
   ONLY FOR OLD ARTIST-VERIFIED ENDPOINT
===================================================== */

const requireClaimSession = claimRoutes.requireClaimSession;

const requireGetEntryClaimSession = (req, res, next) => {
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
   NEW PUBLIC GET ENTRY RESPONSE

   POST /api/get/response

   NO ARTIST CLAIM REQUIRED
   NO OTP REQUIRED
   NO PAYMENT REQUIRED

   PRICES CALCULATED ON SERVER
===================================================== */

router.post("/response", async (req, res) => {
  try {
    /* ===============================================
       CHECK DATABASE
    =============================================== */

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected.",
      });
    }

    /* ===============================================
       READ REQUEST
    =============================================== */

    const { fullName, email, mobile, state, tickets, bookings } =
      req.body || {};

    /* ===============================================
       PERSONAL DETAILS
    =============================================== */

    const cleanName = String(fullName || "").trim();

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    const cleanMobile = String(mobile || "").trim();

    const cleanState = String(state || "").trim();

    if (!cleanName || !cleanEmail || !cleanMobile || !cleanState) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all personal details.",
      });
    }

    if (
      cleanName.length > 150 ||
      cleanEmail.length > 254 ||
      cleanMobile.length > 25 ||
      cleanState.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more personal details are too long.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    const mobileDigits = cleanMobile.replace(/\D/g, "");

    if (mobileDigits.length < 10 || mobileDigits.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number.",
      });
    }

    /* ===============================================
       VALIDATE PEOPLE
    =============================================== */

    const totalPeople = Number(tickets);

    if (!Number.isInteger(totalPeople) || totalPeople < 1 || totalPeople > 10) {
      return res.status(400).json({
        success: false,
        message: "Number of people must be between 1 and 10.",
      });
    }

    /* ===============================================
       VALIDATE CITY BOOKINGS
    =============================================== */

    if (
      !Array.isArray(bookings) ||
      bookings.length < 1 ||
      bookings.length > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "Select between 1 and 3 cities.",
      });
    }

    const usedCities = new Set();

    const validatedBookings = [];

    let grandTotal = 0;

    /* ===============================================
       CHECK EACH CITY
    =============================================== */

    for (const booking of bookings) {
      const eventCity = String(booking?.eventCity || "")
        .trim()
        .toLowerCase();

      const passDays = Number(booking?.passDays);

      const selectedDates = booking?.selectedDates;

      /* =============================================
         VALID CITY
      ============================================= */

      if (!CITY_DATES[eventCity]) {
        return res.status(400).json({
          success: false,
          message: "Invalid event city selected.",
        });
      }

      /* =============================================
         PREVENT DUPLICATE CITIES
      ============================================= */

      if (usedCities.has(eventCity)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate city booking is not allowed.",
        });
      }

      usedCities.add(eventCity);

      /* =============================================
         VALID PASS
      ============================================= */

      if (!Number.isInteger(passDays) || !PASS_PRICES[passDays]) {
        return res.status(400).json({
          success: false,
          message: `Invalid entry pass for ${eventCity}.`,
        });
      }

      /* =============================================
         CHECK DATES
      ============================================= */

      if (!Array.isArray(selectedDates)) {
        return res.status(400).json({
          success: false,
          message: `Select dates for ${eventCity}.`,
        });
      }

      if (selectedDates.length !== passDays) {
        return res.status(400).json({
          success: false,
          message: `${eventCity} requires exactly ${passDays} selected dates.`,
        });
      }

      const uniqueDates = [...new Set(selectedDates)];

      if (uniqueDates.length !== selectedDates.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate dates are not allowed.",
        });
      }

      const validDates = CITY_DATES[eventCity];

      const invalidDate = uniqueDates.some(
        (date) => typeof date !== "string" || !validDates.includes(date),
      );

      if (invalidDate) {
        return res.status(400).json({
          success: false,
          message: `Invalid date selected for ${eventCity}.`,
        });
      }

      /* =============================================
         CALCULATE PRICE

         FIRST PERSON:
         1 DAY = 2999
         2 DAYS = 4999
         3 DAYS = 5999

         ADDITIONAL PERSON = 1499
      ============================================= */

      const firstPersonPrice = PASS_PRICES[passDays];

      const additionalAmount =
        Math.max(0, totalPeople - 1) * EXTRA_PERSON_PRICE;

      const cityTotal = firstPersonPrice + additionalAmount;

      grandTotal += cityTotal;

      validatedBookings.push({
        eventCity,

        passDays,

        passType: `${passDays}-Day`,

        selectedDates: uniqueDates.sort(),

        tickets: totalPeople,

        firstPersonPrice,

        additionalAmount,

        totalAmount: cityTotal,
      });
    }

    /* ===============================================
       SAVE REQUEST

       Keep legacy eventCity/eventDate fields
       for existing admin dashboard compatibility.
    =============================================== */

    const firstBooking = validatedBookings[0];

    const entry = await Get.create({
      fullName: cleanName,

      email: cleanEmail,

      mobile: cleanMobile,

      state: cleanState,

      // Public visitor request.
      // No artistProfile is required.

      eventCity: firstBooking.eventCity,

      eventDate: firstBooking.selectedDates.join(", "),

      tickets: totalPeople,

      ticketPrice: firstBooking.firstPersonPrice,

      additionalTicketPrice: EXTRA_PERSON_PRICE,

      bookings: validatedBookings,

      totalAmount: grandTotal,

      source: "rajasthan-entry",

      status: "New",
    });

    console.log("✅ Rajasthan entry response saved:", entry._id);

    /* ===============================================
       SUCCESS
    =============================================== */

    return res.status(201).json({
      success: true,

      message:
        "Your response has been submitted successfully. Our team will contact you within 24 hours.",

      request: {
        _id: entry._id,

        fullName: entry.fullName,

        email: entry.email,

        tickets: entry.tickets,

        bookings: entry.bookings,

        totalAmount: entry.totalAmount,

        status: entry.status,

        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ GET ENTRY response error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,

      message: "Unable to submit your response. Please try again.",
    });
  }
});

/* =====================================================
   EXISTING GET ENTRY
   KEEP OLD CLAIM FLOW FOR LEGACY REQUESTS
===================================================== */

router.post("/", requireGetEntryClaimSession, createGet);

/* =====================================================
   EXISTING ADMIN ROUTES
===================================================== */

// Existing admin listing
router.get("/", getAllGets);

// Get single entry
router.get("/:id", getGetById);

// Update status
router.patch("/:id/status", updateGetStatus);

// Delete entry
router.delete("/:id", deleteGet);

module.exports = router;
