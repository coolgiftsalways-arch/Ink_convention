const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const TattooStudio = require("../models/TattooStudio");
const { importExcelFile } = require("../utils/excelImporter");

const router = express.Router();

/* =========================================================
   REGEX ESCAPE HELPER
   Prevents special characters from breaking filters
========================================================= */

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
};

/* =========================================================
   EXCEL UPLOAD STORAGE
========================================================= */

const uploadDir = path.join(__dirname, "../uploads/excel");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

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
   EXCEL FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".xlsx",
    ".xls",
    ".csv",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(
      new Error(
        "Invalid file type. Please upload an Excel (.xlsx/.xls) or CSV file.",
      ),
      false,
    );
  }

  cb(null, true);
};

/* =========================================================
   MULTER
========================================================= */

const upload = multer({
  storage,
  fileFilter,

  limits: {
    // 200 MB maximum for directory imports
    fileSize: 200 * 1024 * 1024,
  },
});

/* =========================================================
   IMPORT EXCEL DATA
=========================================================

   POST /api/admin/tattoo-studios/import

   Form-data:
   file = Excel file
========================================================= */

router.post(
  "/import",
  upload.single("file"),

  async (req, res) => {
    let uploadedFilePath = null;

    try {
      console.log("");
      console.log(
        "==============================================",
      );
      console.log(
        "📥 TATTOO DIRECTORY IMPORT REQUEST",
      );
      console.log(
        "==============================================",
      );

      /* =====================================================
         DATABASE CHECK
      ===================================================== */

      if (TattooStudio.db.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: "Database is not connected.",
        });
      }

      /* =====================================================
         FILE CHECK
      ===================================================== */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an Excel file.",
        });
      }

      uploadedFilePath = req.file.path;

      console.log(
        `📁 File: ${req.file.originalname}`,
      );

      console.log(
        `📦 Size: ${req.file.size} bytes`,
      );

      console.log(
        `📍 Saved: ${uploadedFilePath}`,
      );

      /* =====================================================
         IMPORT
      ===================================================== */

      const result = await importExcelFile(
        uploadedFilePath,
      );

      /* =====================================================
         DELETE TEMPORARY EXCEL FILE
      ===================================================== */

      try {
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);

          console.log(
            "🗑️ Temporary Excel file deleted.",
          );
        }
      } catch (deleteError) {
        console.error(
          "⚠️ Could not delete temporary Excel file:",
          deleteError.message,
        );
      }

      /* =====================================================
         RESPONSE
      ===================================================== */

      console.log(
        "==============================================",
      );

      console.log(
        "✅ IMPORT REQUEST FINISHED",
      );

      console.log(
        "==============================================",
      );

      return res.status(200).json({
        success: true,

        message:
          "Tattoo directory imported successfully.",

        file: {
          name: req.file.originalname,
          size: req.file.size,
        },

        ...result,
      });
    } catch (error) {
      console.error(
        "❌ Tattoo directory import error:",
        error,
      );

      /* =====================================================
         CLEANUP IF IMPORT FAILED
      ===================================================== */

      if (
        uploadedFilePath &&
        fs.existsSync(uploadedFilePath)
      ) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (cleanupError) {
          console.error(
            "⚠️ Cleanup error:",
            cleanupError.message,
          );
        }
      }

      return res.status(500).json({
        success: false,

        message:
          "Failed to import tattoo directory.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   GET DIRECTORY DATA
=========================================================

   GET /api/admin/tattoo-studios

   Supports:

   ?page=1
   ?limit=20

   ?city=Mumbai
   ?state=Maharashtra
   ?category=Tattoo shop

   ?plan=free
   ?verified=true
   ?minRating=4.5

   ?search=ink
========================================================= */

router.get("/", async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1,
    );

    const requestedLimit =
      parseInt(req.query.limit, 10) || 20;

    const limit = Math.min(
      Math.max(requestedLimit, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const {
      city,
      state,
      category,
      plan,
      verified,
      minRating,
      search,
    } = req.query;

    const filter = {};

    /* =====================================================
       CITY FILTER
       Exact city match
       
       Mumbai → Mumbai
       Navi Mumbai → Navi Mumbai
    ===================================================== */

    if (city && String(city).trim()) {
      const cityValue = String(city).trim();

      filter.city = {
        $regex: `^${escapeRegex(cityValue)}$`,
        $options: "i",
      };
    }

    /* =====================================================
       STATE FILTER
       Exact state match
    ===================================================== */

    if (state && String(state).trim()) {
      const stateValue = String(state).trim();

      filter.state = {
        $regex: `^${escapeRegex(stateValue)}$`,
        $options: "i",
      };
    }

    /* =====================================================
       CATEGORY FILTER
       Exact category match
    ===================================================== */

    if (category && String(category).trim()) {
      const categoryValue =
        String(category).trim();

      filter.category = {
        $regex: `^${escapeRegex(categoryValue)}$`,
        $options: "i",
      };
    }

    /* =====================================================
       PLAN FILTER
       
       free
       pro
       verified
    ===================================================== */

    if (plan && String(plan).trim()) {
      const planValue = String(plan)
        .trim()
        .toLowerCase();

      if (
        [
          "free",
          "pro",
          "verified",
        ].includes(planValue)
      ) {
        filter.plan = planValue;
      }
    }

    /* =====================================================
       VERIFIED FILTER
       
       ?verified=true
       ?verified=false
    ===================================================== */

    if (
      verified !== undefined &&
      String(verified).trim() !== ""
    ) {
      const verifiedValue =
        String(verified).toLowerCase();

      if (verifiedValue === "true") {
        filter.verified = true;
      }

      if (verifiedValue === "false") {
        filter.verified = false;
      }
    }

    /* =====================================================
       MINIMUM RATING FILTER
       
       ?minRating=4
       ?minRating=4.5
       ?minRating=5
    ===================================================== */

    if (
      minRating !== undefined &&
      String(minRating).trim() !== ""
    ) {
      const rating = Number(minRating);

      if (
        Number.isFinite(rating) &&
        rating >= 0 &&
        rating <= 5
      ) {
        filter.rating = {
          $gte: rating,
        };
      }
    }

    /* =====================================================
       SEARCH
       
       Searches:
       - studio name
       - city
       - state
       - category
    ===================================================== */

    if (
      search &&
      String(search).trim()
    ) {
      const searchText =
        String(search).trim();

      const escapedSearch =
        escapeRegex(searchText);

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },

        {
          city: {
            $regex: escapedSearch,
            $options: "i",
          },
        },

        {
          state: {
            $regex: escapedSearch,
            $options: "i",
          },
        },

        {
          category: {
            $regex: escapedSearch,
            $options: "i",
          },
        },

        {
          address: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    /* =====================================================
       DATABASE QUERY
    ===================================================== */

    const [studios, total] =
      await Promise.all([
        TattooStudio.find(filter)
          .sort({
            verified: -1,
            spotlight: -1,
            rating: -1,
            reviews: -1,
            name: 1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        TattooStudio.countDocuments(filter),
      ]);

    const totalPages =
      Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,

      data: studios,

      pagination: {
        page,
        limit,
        total,
        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ Fetch tattoo studios error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching tattoo studios.",

      error: error.message,
    });
  }
});

/* =========================================================
   GET DIRECTORY FILTER OPTIONS
=========================================================

   GET /api/admin/tattoo-studios/filters

   Returns unique values directly from MongoDB.

   New cities/states/categories added through future
   Excel uploads automatically become available.
========================================================= */

router.get(
  "/filters",
  async (req, res) => {
    try {
      const [
        states,
        cities,
        categories,
      ] = await Promise.all([
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
      ]);

      /* =====================================================
         CLEAN + SORT VALUES
      ===================================================== */

      const cleanSort = (values) =>
        values
          .map((value) =>
            String(value).trim(),
          )
          .filter(Boolean)
          .filter(
            (value, index, array) =>
              array.findIndex(
                (item) =>
                  item.toLowerCase() ===
                  value.toLowerCase(),
              ) === index,
          )
          .sort((a, b) =>
            a.localeCompare(b),
          );

      return res.status(200).json({
        success: true,

        filters: {
          states: cleanSort(states),

          cities: cleanSort(cities),

          categories:
            cleanSort(categories),

          plans: [
            "free",
            "pro",
            "verified",
          ],

          ratings: [
            5,
            4.5,
            4,
            3.5,
            3,
          ],

          verified: [
            true,
            false,
          ],
        },
      });
    } catch (error) {
      console.error(
        "❌ Tattoo directory filters error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while fetching directory filters.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   GET DIRECTORY COUNTS
=========================================================

   GET /api/admin/tattoo-studios/stats
========================================================= */

router.get(
  "/stats",
  async (req, res) => {
    try {
      const [
        total,
        verified,
        pro,
        free,
      ] = await Promise.all([
        TattooStudio.countDocuments(),

        TattooStudio.countDocuments({
          verified: true,
        }),

        TattooStudio.countDocuments({
          plan: "pro",
        }),

        TattooStudio.countDocuments({
          plan: "free",
        }),
      ]);

      return res.status(200).json({
        success: true,

        stats: {
          total,
          verified,
          pro,
          free,
        },
      });
    } catch (error) {
      console.error(
        "❌ Tattoo studio stats error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while fetching directory statistics.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   DELETE DIRECTORY RECORD
=========================================================

   DELETE /api/admin/tattoo-studios/:id

   This deletes ONLY an Excel directory record.
   It does NOT touch your User collection.
========================================================= */

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const deletedStudio =
        await TattooStudio.findByIdAndDelete(
          req.params.id,
        );

      if (!deletedStudio) {
        return res.status(404).json({
          success: false,
          message:
            "Tattoo studio not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Tattoo studio deleted successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Delete tattoo studio error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while deleting tattoo studio.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

router.use(
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (
        error.code === "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Excel file is too large. Maximum size is 200 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  },
);

module.exports = router;