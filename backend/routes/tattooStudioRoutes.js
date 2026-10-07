const express = require("express");
const mongoose = require("mongoose");
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

let filterCache = null;
let filterCacheTime = 0;

const FILTER_CACHE_TTL = 10 * 60 * 1000;

/* =========================================================
   LIGHTWEIGHT DIRECTORY COUNT CACHE

   Prevents countDocuments() from running again and again
   for the same filter during normal browsing.
========================================================= */

const directoryCountCache = new Map();

const DIRECTORY_COUNT_CACHE_MS = 60 * 1000;

function getCountCacheKey(filter) {
  try {
    return JSON.stringify(filter);
  } catch (error) {
    return "";
  }
}

async function getCachedDirectoryCount(filter) {
  const key = getCountCacheKey(filter);

  const cached = key ? directoryCountCache.get(key) : null;

  if (
    cached &&
    Date.now() - Number(cached.savedAt || 0) < DIRECTORY_COUNT_CACHE_MS
  ) {
    return Number(cached.total || 0);
  }

  const total = await TattooStudio.countDocuments(filter);

  if (key) {
    directoryCountCache.set(key, {
      total,

      savedAt: Date.now(),
    });

    if (directoryCountCache.size > 100) {
      const firstKey = directoryCountCache.keys().next().value;

      directoryCountCache.delete(firstKey);
    }
  }

  return total;
}

/* =========================================================
   START MEMBERSHIP EXPIRY WORKER
========================================================= */

if (process.env.NODE_ENV !== "test") {
  startMembershipExpiryWorker();
}

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

    cb(
      null,

      `${Date.now()}-${safeName}`,
    );
  },
});

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowed = [".xlsx", ".csv"];

  if (!allowed.includes(extension)) {
    return cb(
      new Error(
        "Invalid file type. Please upload an Excel (.xlsx) or CSV file.",
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
    fileSize: 20 * 1024 * 1024,
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
   ADMIN ARTIST DIRECTORY

   GET
   /api/admin/tattoo-studios/admin-directory

   IMPORTANT:
   This route is for the admin dashboard and returns the REAL
   MongoDB contact details, including phone numbers for FREE
   CLAIMED artists.

   Public route still uses serializePublicArtist().
========================================================= */

router.get(
  "/admin-directory",

  async (req, res) => {
    try {
      const page = Math.max(
        parseInt(req.query.page, 10) || 1,

        1,
      );

      const requestedLimit = parseInt(req.query.limit, 10) || 50;

      const limit = Math.min(
        Math.max(requestedLimit, 1),

        1000,
      );

      const skip = (page - 1) * limit;

      const { city, state, plan, paidOnly, claimed, search } = req.query;

      const filter = {};

      /* =============================================
         PAID FILTER
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
      } else if (
        plan &&
        String(plan).trim() &&
        String(plan).trim().toUpperCase() !== "ALL"
      ) {
        filter.plan = normalizePlan(plan);
      }

      /* =============================================
         CITY
      ============================================= */

      if (
        city &&
        String(city).trim() &&
        String(city).trim().toUpperCase() !== "ALL"
      ) {
        filter.city = {
          $regex: `^${escapeRegex(String(city).trim())}$`,

          $options: "i",
        };
      }

      /* =============================================
         STATE
      ============================================= */

      if (
        state &&
        String(state).trim() &&
        String(state).trim().toUpperCase() !== "ALL"
      ) {
        filter.state = {
          $regex: `^${escapeRegex(String(state).trim())}$`,

          $options: "i",
        };
      }

      /* =============================================
         CLAIM STATUS
      ============================================= */

      if (claimed !== undefined && String(claimed).trim() !== "") {
        const claimedValue = String(claimed).trim().toLowerCase();

        if (claimedValue === "true") {
          filter.$and = [
            ...(Array.isArray(filter.$and) ? filter.$and : []),

            {
              $or: [
                {
                  claimed: true,
                },

                {
                  phoneVerified: true,
                },

                {
                  ownerVerified: true,
                },

                {
                  updatedByOwner: true,
                },
              ],
            },
          ];
        }

        if (claimedValue === "false") {
          filter.$and = [
            ...(Array.isArray(filter.$and) ? filter.$and : []),

            {
              claimed: {
                $ne: true,
              },
            },

            {
              phoneVerified: {
                $ne: true,
              },
            },

            {
              ownerVerified: {
                $ne: true,
              },
            },

            {
              updatedByOwner: {
                $ne: true,
              },
            },
          ];
        }
      }

      /* =============================================
         SEARCH
      ============================================= */

      if (search && String(search).trim()) {
        const rawSearch = String(search).trim();

        if (rawSearch.length < 3) {
          return res.status(200).json({
            success: true,

            artists: [],

            total: 0,

            pagination: {
              page: 1,

              limit,

              total: 0,

              totalPages: 1,

              hasNextPage: false,

              hasPreviousPage: false,
            },
          });
        }

        const prefixRegex = new RegExp(
          `^${escapeRegex(rawSearch)}`,

          "i",
        );

        const digits = rawSearch.replace(/\D/g, "");

        filter.$or = [
          {
            name: prefixRegex,
          },

          {
            professionalName: prefixRegex,
          },

          {
            artistName: prefixRegex,
          },

          {
            studio: prefixRegex,
          },

          {
            studioName: prefixRegex,
          },

          {
            email: prefixRegex,
          },

          ...(digits.length >= 3
            ? [
                {
                  phone: new RegExp(
                    `^(?:\\+?91\\D*)?${digits
                      .split("")
                      .map((digit) => escapeRegex(digit))
                      .join("\\D*")}`,

                    "i",
                  ),
                },
              ]
            : []),
        ];
      }

      /* =============================================
         QUERY
      ============================================= */

      const artistQuery = TattooStudio.find(filter)
        .select({
          _id: 1,

          name: 1,

          artistName: 1,

          professionalName: 1,

          studio: 1,

          studioName: 1,

          city: 1,

          state: 1,

          country: 1,

          category: 1,

          tattooStyles: 1,

          plan: 1,

          paymentStatus: 1,

          verified: 1,

          spotlight: 1,

          hallOfFameEligible: 1,

          rating: 1,

          reviews: 1,

          experience: 1,

          phone: 1,

          email: 1,

          instagram: 1,

          website: 1,

          profileLinks: 1,

          bio: 1,

          profileImage: 1,

          portfolioImages: 1,

          claimed: 1,

          claimedAt: 1,

          phoneVerified: 1,

          updatedByOwner: 1,

          ownerVerified: 1,

          planStartedAt: 1,

          planExpiresAt: 1,

          paidAt: 1,

          whatsappContactCount: 1,

          whatsappLastContactedAt: 1,

          createdAt: 1,

          updatedAt: 1,
        })
        .sort({
          plan: -1,

          updatedAt: -1,

          name: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean();

      const [studios, total] = await Promise.all([
        artistQuery,

        TattooStudio.countDocuments(filter),
      ]);

      const artists = studios.map((studio) => ({
        ...studio,

        id: studio._id,

        claimed: Boolean(
          studio.claimed ||
          studio.phoneVerified ||
          studio.ownerVerified ||
          studio.updatedByOwner,
        ),

        phone: studio.phone || "",

        email: studio.email || "",

        whatsappContactCount: Number(studio.whatsappContactCount || 0),

        whatsappLastContactedAt: studio.whatsappLastContactedAt || null,
      }));

      const totalPages = Math.ceil(total / limit) || 1;

      return res.status(200).json({
        success: true,

        artists,

        total,

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
      console.error("❌ Admin tattoo directory error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to load admin artist directory.",

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
========================================================= */

router.get(
  "/",

  async (req, res) => {
    try {
      /* =============================================
         PAGINATION
      ============================================= */

      const page = Math.max(
        parseInt(req.query.page, 10) || 1,

        1,
      );

      const requestedLimit = parseInt(req.query.limit, 10) || 20;

      const limit = Math.min(
        Math.max(requestedLimit, 1),

        50,
      );

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
        claimed,
      } = req.query;

      const filter = {};

      /* =============================================
         PAID ONLY
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
      ============================================= */

      if (
        city &&
        String(city).trim() &&
        String(city).trim().toUpperCase() !== "ALL"
      ) {
        filter.city = String(city).trim();
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
         CATEGORY FILTER
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
         CLAIM FILTER
      ============================================= */

      if (claimed !== undefined && String(claimed).trim() !== "") {
        const claimedValue = String(claimed).trim().toLowerCase();

        if (claimedValue === "true") {
          filter.$and = [
            ...(Array.isArray(filter.$and) ? filter.$and : []),

            {
              $or: [
                {
                  claimed: true,
                },

                {
                  phoneVerified: true,
                },

                {
                  ownerVerified: true,
                },

                {
                  updatedByOwner: true,
                },
              ],
            },
          ];
        }

        if (claimedValue === "false") {
          filter.$and = [
            ...(Array.isArray(filter.$and) ? filter.$and : []),

            {
              claimed: {
                $ne: true,
              },
            },

            {
              phoneVerified: {
                $ne: true,
              },
            },

            {
              ownerVerified: {
                $ne: true,
              },
            },

            {
              updatedByOwner: {
                $ne: true,
              },
            },
          ];
        }
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
         RATING
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
      ============================================= */

      if (search && String(search).trim()) {
        const rawSearch = String(search).trim();

        if (rawSearch.length < 3) {
          return res.status(200).json({
            success: true,

            data: [],

            artists: [],

            users: [],

            total: 0,

            pagination: {
              page: 1,

              limit,

              total: 0,

              totalPages: 1,

              hasNextPage: false,

              hasPreviousPage: false,
            },
          });
        }

        const prefixRegex = new RegExp(
          `^${escapeRegex(rawSearch)}`,

          "i",
        );

        const digits = rawSearch.replace(/\D/g, "");

        filter.$or = [
          {
            name: prefixRegex,
          },

          {
            professionalName: prefixRegex,
          },

          {
            artistName: prefixRegex,
          },

          {
            studio: prefixRegex,
          },

          {
            studioName: prefixRegex,
          },

          {
            email: prefixRegex,
          },

          ...(digits.length >= 3
            ? [
                {
                  phone: new RegExp(
                    `^(?:\\+?91\\D*)?${digits
                      .split("")
                      .map((digit) => escapeRegex(digit))
                      .join("\\D*")}`,

                    "i",
                  ),
                },
              ]
            : []),
        ];
      }

      /* =============================================
         QUERY
      ============================================= */

      const hasFilters = Object.keys(filter).length > 0;

      const hasCityFilter =
        city &&
        String(city).trim() &&
        String(city).trim().toUpperCase() !== "ALL";

      let artistQuery = TattooStudio.find(filter).select({
        _id: 1,

        name: 1,

        artistName: 1,

        professionalName: 1,

        studio: 1,

        studioName: 1,

        city: 1,

        state: 1,

        category: 1,

        tattooStyles: 1,

        plan: 1,

        paymentStatus: 1,

        verified: 1,

        spotlight: 1,

        hallOfFameEligible: 1,

        rating: 1,

        experience: 1,

        phone: 1,

        email: 1,

        whatsappContactCount: 1,

        whatsappLastContactedAt: 1,

        instagram: 1,

        website: 1,

        claimed: 1,

        claimedAt: 1,

        phoneVerified: 1,

        updatedByOwner: 1,

        ownerVerified: 1,

        updatedAt: 1,
      });

      if (hasCityFilter) {
        artistQuery = artistQuery.collation({
          locale: "en",

          strength: 2,
        });
      }

      artistQuery = artistQuery
        .sort({
          plan: -1,

          updatedAt: -1,

          name: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean();

      let countQuery;

      if (hasFilters) {
        countQuery = TattooStudio.countDocuments(filter);

        if (hasCityFilter) {
          countQuery = countQuery.collation({
            locale: "en",

            strength: 2,
          });
        }
      } else {
        countQuery = TattooStudio.estimatedDocumentCount();
      }

      const [studios, total] = await Promise.all([artistQuery, countQuery]);

      /* =============================================
         PUBLIC SERIALIZER
      ============================================= */

      const publicStudios = studios.map((studio) => ({
        ...serializePublicArtist(studio),

        whatsappContactCount: Number(studio.whatsappContactCount || 0),

        whatsappLastContactedAt: studio.whatsappLastContactedAt || null,

        claimed: Boolean(
          studio.claimed ||
          studio.phoneVerified ||
          studio.ownerVerified ||
          studio.updatedByOwner,
        ),

        claimedAt: studio.claimedAt || null,
      }));

      const totalPages = Math.ceil(total / limit) || 1;

      return res.status(200).json({
        success: true,

        artists: publicStudios,

        total,

        selectedCity: city && String(city).trim() ? String(city).trim() : "ALL",

        selectedState:
          state && String(state).trim() ? String(state).trim() : "ALL",

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
   HALL OF FAME - GOLD MEMBERS ONLY

   GET
   /api/admin/tattoo-studios/hall-of-fame
========================================================= */

router.get(
  "/hall-of-fame",

  async (req, res) => {
    try {
      const studios = await TattooStudio.find({
        plan: "verified",

        paymentStatus: "paid",

        hallOfFameEligible: true,
      })
        .sort({
          updatedAt: -1,

          name: 1,
        })
        .lean();

      const artists = studios.map(serializePublicArtist);

      return res.status(200).json({
        success: true,

        artists,

        total: artists.length,
      });
    } catch (error) {
      console.error("❌ Hall Of Fame fetch error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to load Hall of Fame.",

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
      const studio = await TattooStudio.findById(req.params.id).lean();

      if (!studio) {
        return res.status(404).json({
          success: false,

          message: "Tattoo studio not found.",
        });
      }

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
   FILTER RESPONSE CACHE
========================================================= */

let directoryFiltersCache = null;

let directoryFiltersCacheAt = 0;

const DIRECTORY_FILTERS_CACHE_MS = 24 * 60 * 60 * 1000;

/* =========================================================
   FILTER OPTIONS

   GET
   /api/admin/tattoo-studios/filters
========================================================= */

router.get(
  "/filters",

  async (req, res) => {
    try {
      if (
        directoryFiltersCache &&
        Date.now() - directoryFiltersCacheAt < DIRECTORY_FILTERS_CACHE_MS
      ) {
        return res.status(200).json(directoryFiltersCache);
      }

      const [states, cities, categories, tattooStylesRaw] = await Promise.all([
        TattooStudio.distinct(
          "state",

          {
            state: {
              $exists: true,

              $nin: ["", null],
            },
          },
        ),

        TattooStudio.distinct(
          "city",

          {
            city: {
              $exists: true,

              $nin: ["", null],
            },
          },
        ),

        TattooStudio.distinct(
          "category",

          {
            category: {
              $exists: true,

              $nin: ["", null],
            },
          },
        ),

        TattooStudio.distinct(
          "tattooStyles",

          {
            tattooStyles: {
              $exists: true,

              $ne: [],
            },
          },
        ),
      ]);

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

      filterCache = {
        states: cleanSort(states),

        cities: cleanSort(cities),

        categories: cleanSort(categories),

        tattooStyles: cleanSort(tattooStylesRaw),

        plans: ["basic", "pro", "verified"],

        ratings: [5, 4.5, 4, 3.5, 3],

        verified: [true, false],
      };

      filterCacheTime = Date.now();

      const filtersResponse = {
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
      };

      directoryFiltersCache = filtersResponse;

      directoryFiltersCacheAt = Date.now();

      return res.status(200).json(filtersResponse);
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
      const claimedOwnerFilter = {
        plan: "basic",

        $or: [
          {
            claimed: true,
          },

          {
            phoneVerified: true,
          },

          {
            ownerVerified: true,
          },

          {
            updatedByOwner: true,
          },
        ],
      };

      const [total, gold, silver, basic, freeClaimed, paidGold, paidSilver] =
        await Promise.all([
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

          TattooStudio.countDocuments(claimedOwnerFilter),

          TattooStudio.countDocuments({
            plan: "verified",

            paymentStatus: "paid",
          }),

          TattooStudio.countDocuments({
            plan: "pro",

            paymentStatus: "paid",
          }),
        ]);

      const freeUnclaimed = Math.max(
        basic - freeClaimed,

        0,
      );

      return res.status(200).json({
        success: true,

        stats: {
          total,

          verified: gold,

          gold,

          paidGold,

          pro: silver,

          silver,

          paidSilver,

          free: basic,

          basic,

          freeClaimed,

          claimedFree: freeClaimed,

          freeUnclaimed,

          unclaimedFree: freeUnclaimed,

          paidFeatured: paidGold + paidSilver,
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
   ADMIN UNCLAIM ARTIST

   PATCH
   /api/admin/tattoo-studios/:id/unclaim

   IMPORTANT:

   This only removes the ownership claim.

   It keeps:
   - Artist name
   - Phone
   - Email
   - City
   - State
   - Images
   - Portfolio
   - Tattoo styles
   - Membership plan
   - Payment information

   After this:
   The artist can claim the same card again through OTP.
========================================================= */

router.patch(
  "/:id/unclaim",

  async (req, res) => {
    try {
      const artistId = String(req.params.id || "").trim();

      /* =============================================
         VALIDATE ID
      ============================================= */

      if (!mongoose.Types.ObjectId.isValid(artistId)) {
        return res.status(400).json({
          success: false,

          message: "Invalid tattoo studio ID.",
        });
      }

      /* =============================================
         FIND ARTIST
      ============================================= */

      const artist = await TattooStudio.findById(artistId);

      if (!artist) {
        return res.status(404).json({
          success: false,

          message: "Tattoo studio not found.",
        });
      }

      /* =============================================
         RESET CLAIM FLAGS
      ============================================= */

      artist.claimed = false;

      artist.phoneVerified = false;

      artist.ownerVerified = false;

      artist.updatedByOwner = false;

      artist.claimedAt = null;

      artist.updatedAt = new Date();

      /* =============================================
         SAVE
      ============================================= */

      await artist.save();

      /* =============================================
         CLEAR CACHE

         Makes dashboard counts refresh correctly.
      ============================================= */

      filterCache = null;

      filterCacheTime = 0;

      directoryCountCache.clear();

      directoryFiltersCache = null;

      directoryFiltersCacheAt = 0;

      /* =============================================
         RESPONSE
      ============================================= */

      const cleanArtist = artist.toObject();

      return res.status(200).json({
        success: true,

        message:
          "Artist unclaimed successfully. They can claim the card again with OTP.",

        artist: {
          ...cleanArtist,

          id: cleanArtist._id,

          claimed: false,

          phoneVerified: false,

          ownerVerified: false,

          updatedByOwner: false,

          claimedAt: null,
        },
      });
    } catch (error) {
      console.error("❌ Admin unclaim artist error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to unclaim this artist.",

        error: error.message,
      });
    }
  },
);

/* =========================================================
   WHATSAPP CONTACT COUNTER

   PATCH
   /api/admin/tattoo-studios/:id/whatsapp-contact
========================================================= */

router.patch(
  "/:id/whatsapp-contact",

  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,

          message: "Invalid tattoo studio ID.",
        });
      }

      const contactedAt = new Date();

      const artist = await TattooStudio.findByIdAndUpdate(
        req.params.id,

        {
          $inc: {
            whatsappContactCount: 1,
          },

          $set: {
            whatsappLastContactedAt: contactedAt,
          },
        },

        {
          new: true,

          runValidators: true,
        },
      )
        .select({
          _id: 1,

          name: 1,

          artistName: 1,

          professionalName: 1,

          phone: 1,

          whatsappContactCount: 1,

          whatsappLastContactedAt: 1,
        })
        .lean();

      if (!artist) {
        return res.status(404).json({
          success: false,

          message: "Tattoo studio not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message: "WhatsApp contact count updated.",

        artist: {
          id: artist._id,

          _id: artist._id,

          name:
            artist.name ||
            artist.artistName ||
            artist.professionalName ||
            "Tattoo Artist",

          phone: artist.phone || "",

          whatsappContactCount: Number(artist.whatsappContactCount || 0),

          whatsappLastContactedAt:
            artist.whatsappLastContactedAt || contactedAt,
        },
      });
    } catch (error) {
      console.error("❌ WhatsApp contact count error:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to update WhatsApp contact count.",

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
      const deletedStudio = await TattooStudio.findByIdAndDelete(req.params.id);

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

        message: "Excel file is too large. Maximum size is 20 MB.",
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
