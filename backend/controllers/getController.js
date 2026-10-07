const mongoose = require("mongoose");

const Get = require("../models/Get");
const TattooStudio = require("../models/TattooStudio");

const FIRST_TICKET_PRICE = 2999;
const ADDITIONAL_TICKET_PRICE = 1499;

const EVENT_DATES = {
  jaipur: "30 Oct – 01 Nov 2026",
  udaipur: "13 Nov – 15 Nov 2026",
  kota: "20 Nov – 22 Nov 2026",
};

const VALID_STATUSES = ["New", "Contacted", "Confirmed", "Cancelled"];

const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
};

const createGet = async (req, res) => {
  try {
    const verifiedProfileId = String(req.claimSession?.profileId || "").trim();

    if (!verifiedProfileId || !isValidMongoId(verifiedProfileId)) {
      return res.status(401).json({
        success: false,

        message: "A verified artist claim session is required.",
      });
    }

    const verifiedArtist = await TattooStudio.findById(verifiedProfileId);

    if (!verifiedArtist) {
      return res.status(404).json({
        success: false,

        message: "Verified artist profile not found.",
      });
    }

    if (
      !verifiedArtist.claimed ||
      !verifiedArtist.phoneVerified ||
      !verifiedArtist.ownerVerified
    ) {
      return res.status(403).json({
        success: false,

        message: "Please complete your artist card claim before getting entry.",
      });
    }

    const { fullName, email, mobile, state, eventCity, tickets } =
      req.body || {};

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({
        success: false,

        message: "Full name is required.",
      });
    }

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

    if (!state || !String(state).trim()) {
      return res.status(400).json({
        success: false,

        message: "State is required.",
      });
    }

    const cleanState = String(state).trim();

    const normalizedCity = String(eventCity || "")
      .trim()
      .toLowerCase();

    if (!EVENT_DATES[normalizedCity]) {
      return res.status(400).json({
        success: false,

        message: "Please select a valid event city.",
      });
    }

    const ticketCount = Number(tickets || 1);

    if (!Number.isInteger(ticketCount) || ticketCount < 1 || ticketCount > 10) {
      return res.status(400).json({
        success: false,

        message: "Tickets must be between 1 and 10.",
      });
    }

    const totalAmount =
      FIRST_TICKET_PRICE +
      Math.max(0, ticketCount - 1) * ADDITIONAL_TICKET_PRICE;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,

        message: "Database not connected.",
      });
    }

    const entry = await Get.create({
      artistProfile: verifiedArtist._id,

      fullName: String(fullName).trim(),

      email: cleanEmail,

      mobile: cleanMobile,

      state: cleanState,

      eventCity: normalizedCity,

      eventDate: EVENT_DATES[normalizedCity],

      tickets: ticketCount,

      ticketPrice: FIRST_TICKET_PRICE,

      additionalTicketPrice: ADDITIONAL_TICKET_PRICE,

      totalAmount,

      status: "New",
    });

    return res.status(201).json({
      success: true,

      message:
        "Entry received successfully. Our team will contact you within 24 hours.",

      entry,

      verifiedArtist: {
        id: verifiedArtist._id,

        name:
          verifiedArtist.name ||
          verifiedArtist.artistName ||
          verifiedArtist.professionalName ||
          "Artist",
      },
    });
  } catch (error) {
    console.error("❌ CREATE GET ENTRY ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to submit entry.",

      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const getAllGets = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,

        message: "Database not connected.",
      });
    }

    const entries = await Get.find()
      .populate(
        "artistProfile",
        "name artistName professionalName phone city state claimed phoneVerified ownerVerified",
      )
      .sort({
        createdAt: -1,
      });

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
    console.error("❌ GET ALL GET ENTRIES ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to load entries.",

      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const getGetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,

        message: "Invalid entry ID.",
      });
    }

    const entry = await Get.findById(id).populate(
      "artistProfile",
      "name artistName professionalName phone city state claimed phoneVerified ownerVerified",
    );

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

const updateGetStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body || {};

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,

        message: "Invalid entry ID.",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid status.",
      });
    }

    const updateData = {
      status,
    };

    if (status === "Contacted") {
      updateData.contactedAt = new Date();
    }

    const entry = await Get.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,

        message: "Entry not found.",
      });
    }

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

const deleteGet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,

        message: "Invalid entry ID.",
      });
    }

    const entry = await Get.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        success: false,

        message: "Entry not found.",
      });
    }

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

module.exports = {
  createGet,
  getAllGets,
  getGetById,
  updateGetStatus,
  deleteGet,
};
