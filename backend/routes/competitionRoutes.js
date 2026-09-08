const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Competition = require("../models/Competition");

const router = express.Router();

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const safeName = String(file.originalname || "file")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const competitionUpload = upload.fields([
  {
    name: "images",
    maxCount: 5,
  },
  {
    name: "videos",
    maxCount: 3,
  },
]);

// =====================================================
// HELPERS
// =====================================================

const toBoolean = (value) => {
  return value === true || value === "true";
};

const createEntryId = () => {
  return `INK26-${Math.floor(100000 + Math.random() * 900000)}`;
};

// =====================================================
// CREATE COMPETITION ENTRY
//
// POST /api/competitions
//
// NO RAZORPAY
// NO PAYMENT
// TEAM REVIEW WITHIN 48 HOURS
// =====================================================

router.post(
  "/",

  competitionUpload,

  async (req, res) => {
    try {
      // ==========================================
      // DATABASE CHECK
      // ==========================================

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      // ==========================================
      // FORM DATA
      // ==========================================

      const {
        category,
        entryPackage,

        firstName,
        lastName,
        professionalName,

        gmail,
        phone,

        instagram,
        studio,

        city,
        state,
        country,

        primaryStyle,
        experience,

        tattooTitle,
        description,

        placement,
        size,
        isOriginal,

        declarationOriginal,
        declarationConsent,
        termsAccepted,
      } = req.body;

      // ==========================================
      // REQUIRED VALIDATION
      // ==========================================

      if (
        !category ||
        !entryPackage ||
        !firstName ||
        !lastName ||
        !gmail ||
        !phone ||
        !city ||
        !tattooTitle ||
        !description
      ) {
        return res.status(400).json({
          success: false,

          message: "Please provide all required competition details.",
        });
      }

      // ==========================================
      // IMAGES
      // ==========================================

      const imagePaths = req.files?.images
        ? req.files.images.map((file) => `uploads/${file.filename}`)
        : [];

      // ==========================================
      // VIDEOS
      // ==========================================

      const videoPaths = req.files?.videos
        ? req.files.videos.map((file) => `uploads/${file.filename}`)
        : [];

      // ==========================================
      // IMAGE REQUIRED
      // ==========================================

      if (imagePaths.length === 0) {
        return res.status(400).json({
          success: false,

          message: "Please upload at least 1 tattoo image.",
        });
      }

      // ==========================================
      // DECLARATION CHECK
      // ==========================================

      if (
        !toBoolean(declarationOriginal) ||
        !toBoolean(declarationConsent) ||
        !toBoolean(termsAccepted)
      ) {
        return res.status(400).json({
          success: false,

          message: "Please accept all declarations before submitting.",
        });
      }

      // ==========================================
      // GENERATE UNIQUE ENTRY ID
      // ==========================================

      let entryId = createEntryId();

      let existingEntry = await Competition.exists({
        entryId,
      });

      while (existingEntry) {
        entryId = createEntryId();

        existingEntry = await Competition.exists({
          entryId,
        });
      }

      // ==========================================
      // 48 HOUR REVIEW TIME
      // ==========================================

      const reviewDueAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // ==========================================
      // CREATE COMPETITION ENTRY
      // ==========================================

      const competition = await Competition.create({
        entryId,

        category: String(category).trim(),

        entryPackage: String(entryPackage).trim(),

        firstName: String(firstName).trim(),

        lastName: String(lastName).trim(),

        professionalName: String(professionalName || "").trim(),

        gmail: String(gmail).trim().toLowerCase(),

        phone: String(phone).trim(),

        instagram: String(instagram || "").trim(),

        studio: String(studio || "").trim(),

        city: String(city).trim(),

        state: String(state || "").trim(),

        country: String(country || "India").trim(),

        primaryStyle: String(primaryStyle || "").trim(),

        experience: String(experience || "").trim(),

        tattooTitle: String(tattooTitle).trim(),

        description: String(description).trim(),

        placement: String(placement || "").trim(),

        size: String(size || "").trim(),

        isOriginal: String(isOriginal || ""),

        images: imagePaths,

        videos: videoPaths,

        declarationOriginal: toBoolean(declarationOriginal),

        declarationConsent: toBoolean(declarationConsent),

        termsAccepted: toBoolean(termsAccepted),

        status: "Pending Review",

        reviewDueAt,
      });

      // ==========================================
      // SUCCESS
      // ==========================================

      return res.status(201).json({
        success: true,

        message:
          "Competition entry received. Our team will review it within 48 hours.",

        entryId: competition.entryId,

        status: competition.status,

        reviewDueAt: competition.reviewDueAt,

        competition,
      });
    } catch (error) {
      console.error("❌ Competition submission error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to submit competition entry.",

        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  },
);

// =====================================================
// GET ALL COMPETITION ENTRIES
//
// GET /api/competitions
//
// ADMIN DASHBOARD CAN USE THIS
// =====================================================

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,

        message: "Database not connected.",
      });
    }

    const entries = await Competition.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,

      count: entries.length,

      entries,
    });
  } catch (error) {
    console.error("❌ Competition fetch error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to load competition entries.",
    });
  }
});

// =====================================================
// GET SINGLE COMPETITION ENTRY
//
// GET /api/competitions/:id
// =====================================================

router.get(
  "/:id",

  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      const entry = await Competition.findById(req.params.id);

      if (!entry) {
        return res.status(404).json({
          success: false,

          message: "Competition entry not found.",
        });
      }

      return res.status(200).json({
        success: true,

        entry,
      });
    } catch (error) {
      console.error("❌ Single competition fetch error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to load competition entry.",
      });
    }
  },
);

// =====================================================
// UPDATE COMPETITION STATUS / RESULT
//
// PATCH /api/competitions/:id/status
//
// Pending Review
// Approved
// Rejected
// =====================================================

router.patch(
  "/:id/status",

  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      const { status, reviewResult } = req.body;

      const allowedStatuses = ["Pending Review", "Approved", "Rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,

          message: "Invalid competition status.",
        });
      }

      const updateData = {
        status,

        reviewResult: String(reviewResult || "").trim(),
      };

      if (status === "Approved" || status === "Rejected") {
        updateData.reviewedAt = new Date();
      } else {
        updateData.reviewedAt = null;
      }

      const entry = await Competition.findByIdAndUpdate(
        req.params.id,

        updateData,

        {
          new: true,
          runValidators: true,
        },
      );

      if (!entry) {
        return res.status(404).json({
          success: false,

          message: "Competition entry not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message: "Competition result updated successfully.",

        entry,
      });
    } catch (error) {
      console.error("❌ Competition status update error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to update competition result.",
      });
    }
  },
);

// =====================================================
// DELETE COMPETITION ENTRY
//
// DELETE /api/competitions/:id
// =====================================================

router.delete(
  "/:id",

  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      const entry = await Competition.findByIdAndDelete(req.params.id);

      if (!entry) {
        return res.status(404).json({
          success: false,

          message: "Competition entry not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message: "Competition entry deleted successfully.",
      });
    } catch (error) {
      console.error("❌ Competition delete error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to delete competition entry.",
      });
    }
  },
);

module.exports = router;
