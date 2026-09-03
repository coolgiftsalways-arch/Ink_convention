const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const TattooStudio = require("../models/TattooStudio");

const { importExcelFile } = require("../utils/excelImporter");

const {
  normalizePlan,
  expireMemberships,
  serializePublicArtist,
  startMembershipExpiryWorker,
} = require("../services/membershipService");

const router = express.Router();

/* =========================================================
   START MEMBERSHIP EXPIRY WORKER
========================================================= */

startMembershipExpiryWorker();

/* =========================================================
   SAFE REGEX
========================================================= */

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* =========================================================
   EXCEL UPLOAD DIRECTORY
========================================================= */

const uploadDir = path.join(__dirname, "../uploads/excel");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowed = [".xlsx", ".xls", ".csv"];

  if (!allowed.includes(extension)) {
    return cb(
      new Error(
        "Invalid file type. Please upload an Excel (.xlsx/.xls) or CSV file.",
      ),
      false,
    );
  }

  return cb(null, true);
};

/* =========================================================
   MULTER
========================================================= */

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

/* =========================================================
   IMPORT EXCEL

   POST
   /api/admin/tattoo-studios/import
========================================================= */

router.post(
  "/import",

  upload.single("file"),

  async (req, res) => {
    let uploadedFilePath = null;

    try {
      /* =============================================
         DATABASE CHECK
      ============================================= */

      if (TattooStudio.db.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database is not connected.",
        });
      }

      /* =============================================
         FILE CHECK
      ============================================= */

      if (!req.file) {
        return res.status(400).json({
          success: false,

          message: "Please upload an Excel file.",
        });
      }

      uploadedFilePath = req.file.path;

      /* =============================================
         IMPORT
      ============================================= */

      const result = await importExcelFile(uploadedFilePath);

      /* =============================================
         DELETE TEMP FILE
      ============================================= */

      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }

      return res.status(200).json({
        success: true,

        message: "Tattoo directory imported successfully.",

        file: {
          name: req.file.originalname,

          size: req.file.size,
        },

        ...result,
      });
    } catch (error) {
      console.error("❌ Tattoo directory import error:", error);

      /* =============================================
         CLEAN TEMP FILE
      ============================================= */

      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (cleanupError) {
          console.error("⚠️ Import cleanup error:", cleanupError.message);
        }
      }

      return res.status(500).json({
        success: false,

        message: "Failed to import tattoo directory.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   PUBLIC ARTIST DIRECTORY

   GET
   /api/admin/tattoo-studios


   IMPORTANT FLOW:

   MongoDB REAL DATA
          ↓
   FILTERS
          ↓
   GOLD FIRST
          ↓
   SILVER
          ↓
   FREE
          ↓
   HIDE PRIVATE DATA


   FREE:
   Name + State

   SILVER:
   Name
   State
   City
   Profile Image
   Phone

   GOLD:
   Full public profile


   SPECIAL:

   ?paidOnly=true

   ONLY RETURNS:

   GOLD / VERIFIED
   SILVER / PRO

   FREE / BASIC WILL NOT RETURN
========================================================= */

router.get(
  "/",

  async (req, res) => {
    try {
      /* =============================================
         EXPIRE OLD PAID PLANS FIRST
      ============================================= */

      await expireMemberships();

      /* =============================================
         PAGINATION
      ============================================= */

      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

      const requestedLimit = parseInt(req.query.limit, 10) || 20;

      const limit = Math.min(Math.max(requestedLimit, 1), 1000);

      const skip = (page - 1) * limit;

      /* =============================================
         QUERY VALUES
      ============================================= */

      const {
        city,
        state,
        category,
        tattooStyle,
        plan,
        verified,
        minRating,
        search,
        paidOnly,
      } = req.query;

      const filter = {};

      /* =============================================
         PAID ONLY

         paidOnly=true means:

         SILVER
         plan = pro
         paymentStatus = paid

         GOLD
         plan = verified
         paymentStatus = paid

         FREE / BASIC WILL NOT BE RETURNED
      ============================================= */

      if (
        String(paidOnly || "")
          .trim()
          .toLowerCase() === "true"
      ) {
        filter.paymentStatus = "paid";

        filter.plan = {
          $in: ["pro", "verified"],
        };
      }

      /* =============================================
         CITY FILTER

         IMPORTANT:

         This happens BEFORE
         serializePublicArtist().

         So FREE artists are still found
         using their REAL MongoDB city.

         But their city is removed from
         public response later.
      ============================================= */

      if (
        city &&
        String(city).trim() &&
        String(city).trim().toUpperCase() !== "ALL"
      ) {
        const cityValue = String(city).trim();

        filter.city = {
          $regex: `^${escapeRegex(cityValue)}$`,

          $options: "i",
        };
      }

      /* =============================================
         STATE FILTER
      ============================================= */

      if (
        state &&
        String(state).trim() &&
        String(state).trim().toUpperCase() !== "ALL"
      ) {
        const stateValue = String(state).trim();

        filter.state = {
          $regex: `^${escapeRegex(stateValue)}$`,

          $options: "i",
        };
      }

      /* =============================================
         BUSINESS CATEGORY FILTER
      ============================================= */

      if (
        category &&
        String(category).trim() &&
        String(category).trim().toUpperCase() !== "ALL"
      ) {
        const categoryValue = String(category).trim();

        filter.category = {
          $regex: `^${escapeRegex(categoryValue)}$`,

          $options: "i",
        };
      }

      /* =============================================
         TATTOO STYLE FILTER

         Example:
         Anime
         Realism
         Black & Grey
      ============================================= */

      if (
        tattooStyle &&
        String(tattooStyle).trim() &&
        String(tattooStyle).trim().toUpperCase() !== "ALL"
      ) {
        const styleValue = String(tattooStyle).trim();

        filter.tattooStyles = {
          $regex: `^${escapeRegex(styleValue)}$`,

          $options: "i",
        };
      }

      /* =============================================
         PLAN FILTER

         IMPORTANT:

         If paidOnly=true, don't allow
         normal plan filter to override it.
      ============================================= */

      if (
        String(paidOnly || "")
          .trim()
          .toLowerCase() !== "true" &&
        plan &&
        String(plan).trim() &&
        String(plan).trim().toUpperCase() !== "ALL"
      ) {
        filter.plan = normalizePlan(plan);
      }

      /* =============================================
         VERIFIED FILTER
      ============================================= */

      if (verified !== undefined && String(verified).trim() !== "") {
        const verifiedValue = String(verified).trim().toLowerCase();

        if (verifiedValue === "true") {
          filter.verified = true;
        }

        if (verifiedValue === "false") {
          filter.verified = false;
        }
      }

      /* =============================================
         MINIMUM RATING
      ============================================= */

      if (minRating !== undefined && String(minRating).trim() !== "") {
        const rating = Number(minRating);

        if (Number.isFinite(rating) && rating >= 0 && rating <= 5) {
          filter.rating = {
            $gte: rating,
          };
        }
      }

      /* =============================================
         SEARCH

         SEARCH REAL DATABASE DATA
      ============================================= */

      if (search && String(search).trim()) {
        const regex = new RegExp(escapeRegex(String(search).trim()), "i");

        filter.$or = [
          {
            name: regex,
          },

          {
            professionalName: regex,
          },

          {
            artistName: regex,
          },

          {
            studio: regex,
          },

          {
            studioName: regex,
          },

          {
            city: regex,
          },

          {
            state: regex,
          },

          {
            category: regex,
          },

          {
            tattooStyles: regex,
          },
        ];
      }

      /* =============================================
         GET REAL DATA FROM MONGODB

         SORT:

         GOLD
            ↓
         SILVER
            ↓
         FREE
      ============================================= */

      const [studios, total] = await Promise.all([
        TattooStudio.find(filter)
          .sort({
            verified: -1,

            spotlight: -1,

            plan: -1,

            updatedAt: -1,

            name: 1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        TattooStudio.countDocuments(filter),
      ]);

      /* =============================================
         PUBLIC PRIVACY SERIALIZER
      ============================================= */

      const publicStudios = studios.map(serializePublicArtist);

      const totalPages = Math.ceil(total / limit) || 1;

      /* =============================================
         RESPONSE
      ============================================= */

      return res.status(200).json({
        success: true,

        data: publicStudios,

        artists: publicStudios,

        users: publicStudios,

        total,

        selectedCity:
          city && String(city).trim()
            ? String(city).trim()
            : "ALL",

        selectedState:
          state && String(state).trim()
            ? String(state).trim()
            : "ALL",

        paidOnly:
          String(paidOnly || "")
            .trim()
            .toLowerCase() === "true",

        order: ["verified", "pro", "basic"],

        pagination: {
          page,

          limit,

          total,

          totalPages,

          hasNextPage: page < totalPages,

          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error("❌ Fetch public tattoo studios error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while fetching tattoo studios.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   PUBLIC SINGLE ARTIST PROFILE

   GET
   /api/admin/tattoo-studios/public/:id
========================================================= */

router.get(
  "/public/:id",

  async (req, res) => {
    try {
      /* =============================================
         EXPIRE MEMBERSHIP FIRST
      ============================================= */

      await expireMemberships();

      /* =============================================
         FIND REAL MONGODB PROFILE
      ============================================= */

      const studio = await TattooStudio.findById(req.params.id).lean();

      if (!studio) {
        return res.status(404).json({
          success: false,

          message: "Tattoo studio not found.",
        });
      }

      /* =============================================
         PUBLIC PRIVACY
      ============================================= */

      const artist = serializePublicArtist(studio);

      return res.status(200).json({
        success: true,

        artist,

        profile: artist,
      });
    } catch (error) {
      console.error("❌ Public artist fetch error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to load public artist profile.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   FILTER OPTIONS

   GET
   /api/admin/tattoo-studios/filters
========================================================= */

router.get(
  "/filters",

  async (req, res) => {
    try {
      await expireMemberships();

      /* =============================================
         GET REAL VALUES FROM MONGODB
      ============================================= */

      const [states, cities, categories, tattooStylesRaw] =
        await Promise.all([
          TattooStudio.distinct("state", {
            state: {
              $exists: true,

              $nin: ["", null],
            },
          }),

          TattooStudio.distinct("city", {
            city: {
              $exists: true,

              $nin: ["", null],
            },
          }),

          TattooStudio.distinct("category", {
            category: {
              $exists: true,

              $nin: ["", null],
            },
          }),

          TattooStudio.distinct("tattooStyles", {
            tattooStyles: {
              $exists: true,

              $ne: [],
            },
          }),
        ]);

      /* =============================================
         CLEAN + REMOVE DUPLICATES
      ============================================= */

      const cleanSort = (values) =>
        values
          .map((value) => String(value || "").trim())
          .filter(Boolean)
          .filter(
            (value, index, array) =>
              array.findIndex(
                (item) => item.toLowerCase() === value.toLowerCase(),
              ) === index,
          )
          .sort((a, b) => a.localeCompare(b));

      /* =============================================
         RESPONSE
      ============================================= */

      return res.status(200).json({
        success: true,

        filters: {
          states: cleanSort(states),

          cities: cleanSort(cities),

          categories: cleanSort(categories),

          tattooStyles: cleanSort(tattooStylesRaw),

          plans: ["basic", "pro", "verified"],

          ratings: [5, 4.5, 4, 3.5, 3],

          verified: [true, false],
        },
      });
    } catch (error) {
      console.error("❌ Tattoo directory filters error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while fetching directory filters.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   DIRECTORY STATS

   GET
   /api/admin/tattoo-studios/stats
========================================================= */

router.get(
  "/stats",

  async (req, res) => {
    try {
      await expireMemberships();

      const [
        total,
        gold,
        silver,
        basic,
        paidGold,
        paidSilver,
      ] = await Promise.all([
        TattooStudio.countDocuments(),

        TattooStudio.countDocuments({
          plan: "verified",
        }),

        TattooStudio.countDocuments({
          plan: "pro",
        }),

        TattooStudio.countDocuments({
          plan: "basic",
        }),

        TattooStudio.countDocuments({
          plan: "verified",
          paymentStatus: "paid",
        }),

        TattooStudio.countDocuments({
          plan: "pro",
          paymentStatus: "paid",
        }),
      ]);

      return res.status(200).json({
        success: true,

        stats: {
          total,

          /* GOLD */
          verified: gold,

          gold,

          paidGold,

          /* SILVER */
          pro: silver,

          silver,

          paidSilver,

          /* FREE */
          free: basic,

          basic,

          paidFeatured:
            paidGold + paidSilver,
        },
      });
    } catch (error) {
      console.error("❌ Tattoo studio stats error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while fetching directory statistics.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   DELETE DIRECTORY RECORD

   DELETE
   /api/admin/tattoo-studios/:id
========================================================= */

router.delete(
  "/:id",

  async (req, res) => {
    try {
      const deletedStudio = await TattooStudio.findByIdAndDelete(
        req.params.id,
      );

      if (!deletedStudio) {
        return res.status(404).json({
          success: false,

          message: "Tattoo studio not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message: "Tattoo studio deleted successfully.",
      });
    } catch (error) {
      console.error("❌ Delete tattoo studio error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while deleting tattoo studio.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

router.use((error, req, res, next) => {
  /* =============================================
       MULTER ERROR
    ============================================= */

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,

        message: "Excel file is too large. Maximum size is 200 MB.",
      });
    }

    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }

  /* =============================================
       OTHER ERROR
    ============================================= */

  if (error) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }

  return next();
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
