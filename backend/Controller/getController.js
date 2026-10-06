const mongoose = require("mongoose");
const Get = require("../models/Get");

const TICKET_PRICE = 1100;

const EVENT_DATES = {
  jaipur: "30 Oct – 01 Nov 2026",
  udaipur: "13 Nov – 15 Nov 2026",
  kota: "20 Nov – 22 Nov 2026",
};

const VALID_STATUSES = ["New", "Contacted", "Confirmed", "Cancelled"];

/* =========================================================
   HELPERS
========================================================= */

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
};

/* =========================================================
   CREATE GET ENTRY

   POST /api/get
========================================================= */

const createGet = async (req, res) => {
  try {
    const { fullName, email, mobile, state, eventCity, tickets } = req.body;

    /* =====================================================
       FULL NAME
    ===================================================== */

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    /* =====================================================
       EMAIL
    ===================================================== */

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    /* =====================================================
       MOBILE
    ===================================================== */

    if (!mobile || !String(mobile).trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required.",
      });
    }

    const cleanMobile = String(mobile).trim();

    const mobileDigits = cleanMobile.replace(/\D/g, "");

    if (mobileDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid mobile number.",
      });
    }

    /* =====================================================
       STATE
    ===================================================== */

    if (!state || !String(state).trim()) {
      return res.status(400).json({
        success: false,
        message: "State is required.",
      });
    }

    const cleanState = String(state).trim();

    /* =====================================================
       EVENT CITY
    ===================================================== */

    const normalizedCity = String(eventCity || "")
      .trim()
      .toLowerCase();

    if (!EVENT_DATES[normalizedCity]) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid event city.",
      });
    }

    /* =====================================================
       TICKETS
    ===================================================== */

    const ticketCount = Number(tickets || 1);

    if (!Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 10) {
      return res.status(400).json({
        success: false,
        message: "Tickets must be between 1 and 10.",
      });
    }

    /* =====================================================
       PRICE

       1 ticket = ₹1,100
       2 tickets = ₹2,200
       3 tickets = ₹3,300
       etc.
    ===================================================== */

    const totalAmount = ticketCount * TICKET_PRICE;

    /* =====================================================
       CHECK DATABASE
    ===================================================== */

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected.",
      });
    }

    /* =====================================================
       CREATE ENTRY
    ===================================================== */

    const entry = await Get.create({
      fullName: String(fullName).trim(),

      email: cleanEmail,

      mobile: cleanMobile,

      state: cleanState,

      eventCity: normalizedCity,

      eventDate: EVENT_DATES[normalizedCity],

      tickets: ticketCount,

      ticketPrice: TICKET_PRICE,

      totalAmount,

      status: "New",
    });

    console.log("");
    console.log("=======================================");
    console.log("🎟️ NEW GET ENTRY SAVED");
    console.log("ID:", entry._id);
    console.log("NAME:", entry.fullName);
    console.log("CITY:", entry.eventCity);
    console.log("TICKETS:", entry.tickets);
    console.log("TOTAL:", entry.totalAmount);
    console.log("=======================================");
    console.log("");

    return res.status(201).json({
      success: true,

      message:
        "Entry received successfully. Our team will contact you within 24 hours.",

      entry,
    });
  } catch (error) {
    console.error("");
    console.error("❌ CREATE GET ENTRY ERROR");
    console.error(error);
    console.error("");

    return res.status(500).json({
      success: false,

      message: "Failed to submit entry.",

      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

/* =========================================================
   GET ALL GET ENTRIES

   GET /api/get
========================================================= */

const getAllGets = async (req, res) => {
  try {
    /* =====================================================
       DATABASE CHECK
    ===================================================== */

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected.",
      });
    }

    /* =====================================================
       LOAD ENTRIES
    ===================================================== */

    const entries = await Get.find().sort({
      createdAt: -1,
    });

    /* =====================================================
       DASHBOARD COUNTS
    ===================================================== */

    const [total, newCount, contacted, confirmed, cancelled] =
      await Promise.all([
        Get.countDocuments(),

        Get.countDocuments({
          status: "New",
        }),

        Get.countDocuments({
          status: "Contacted",
        }),

        Get.countDocuments({
          status: "Confirmed",
        }),

        Get.countDocuments({
          status: "Cancelled",
        }),
      ]);

    return res.status(200).json({
      success: true,

      count: entries.length,

      stats: {
        total,
        new: newCount,
        contacted,
        confirmed,
        cancelled,
      },

      entries,
    });
  } catch (error) {
    console.error("");
    console.error("❌ GET ALL ENTRIES ERROR");
    console.error(error);
    console.error("");

    return res.status(500).json({
      success: false,

      message: "Failed to load entries.",

      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

/* =========================================================
   GET SINGLE ENTRY

   GET /api/get/:id
========================================================= */

const getGetById = async (req, res) => {
  try {
    const { id } = req.params;

    /* =====================================================
       ID CHECK
    ===================================================== */

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entry ID.",
      });
    }

    /* =====================================================
       DATABASE CHECK
    ===================================================== */

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected.",
      });
    }

    /* =====================================================
       FIND ENTRY
    ===================================================== */

    const entry = await Get.findById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("❌ GET SINGLE ENTRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load entry.",
    });
  }
};

/* =========================================================
   UPDATE STATUS

   PATCH /api/get/:id/status
========================================================= */

const updateGetStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    /* =====================================================
       ID CHECK
    ===================================================== */

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entry ID.",
      });
    }

    /* =====================================================
       STATUS CHECK
    ===================================================== */

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Status must be New, Contacted, Confirmed or Cancelled.",
      });
    }

    /* =====================================================
       DATABASE CHECK
    ===================================================== */

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected.",
      });
    }

    /* =====================================================
       UPDATE DATA
    ===================================================== */

    const updateData = {
      status,
    };

    if (status === "Contacted") {
      updateData.contactedAt = new Date();
    }

    /* =====================================================
       UPDATE ENTRY
    ===================================================== */

    const entry = await Get.findByIdAndUpdate(
      id,

      updateData,

      {
        new: true,
        runValidators: true,
      },
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found.",
      });
    }

    console.log(`✅ GET ENTRY STATUS UPDATED: ${entry._id} → ${status}`);

    return res.status(200).json({
      success: true,

      message: "Status updated successfully.",

      entry,
    });
  } catch (error) {
    console.error("❌ UPDATE GET STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update status.",
    });
  }
};

/* =========================================================
   DELETE ENTRY

   DELETE /api/get/:id
========================================================= */

const deleteGet = async (req, res) => {
  try {
    const { id } = req.params;

    /* =====================================================
       ID CHECK
    ===================================================== */

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entry ID.",
      });
    }

    /* =====================================================
       DATABASE CHECK
    ===================================================== */

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected.",
      });
    }

    /* =====================================================
       DELETE
    ===================================================== */

    const entry = await Get.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found.",
      });
    }

    console.log("🗑️ GET ENTRY DELETED:", id);

    return res.status(200).json({
      success: true,

      message: "Entry deleted successfully.",

      deletedId: id,
    });
  } catch (error) {
    console.error("❌ DELETE GET ENTRY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete entry.",
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createGet,
  getAllGets,
  getGetById,
  updateGetStatus,
  deleteGet,
};
