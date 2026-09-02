const mongoose = require("mongoose");

/* =========================================================
   TATTOO STUDIO SCHEMA
========================================================= */

const tattooStudioSchema = new mongoose.Schema(
  {
    /* =====================================================
       EXCEL / DIRECTORY DATA
    ===================================================== */

    // Original row number / identifier from the Excel file
    sourceRowId: {
      type: String,
      default: "",
      trim: true,
    },

    // Studio / business name
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Google rating
    rating: {
      type: Number,
      default: null,
    },

    // Number of reviews
    reviews: {
      type: Number,
      default: 0,
    },

    // Full address
    address: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       LOCATION
    ===================================================== */

    city: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    country: {
      type: String,
      default: "IN",
      trim: true,
    },

    /* =====================================================
       CONTACT / ONLINE INFORMATION
    ===================================================== */

    website: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       ARTIST / PROFILE INFORMATION
    ===================================================== */

    professionalName: {
      type: String,
      default: "",
      trim: true,
    },

    studio: {
      type: String,
      default: "",
      trim: true,
    },

    studioName: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    /* =====================================================
       TATTOO SPECIALITIES

       USED BY:
       BOOK YOUR ARTIST

       Example:

       tattooStyles: [
         "Anime",
         "Realism",
         "Black & Grey"
       ]
    ===================================================== */

    tattooStyles: {
      type: [String],
      default: [],
      index: true,
    },

    /* =====================================================
       EXCEL IMPORT DATA
    ===================================================== */

    items: {
      type: String,
      default: "",
      trim: true,
    },

    mapsUrl: {
      type: String,
      default: "",
      trim: true,
    },

    /*
      Keep this as Excel/business category.

      Example:
      "Tattoo shop"

      Anime / Realism etc. goes in tattooStyles.
    */

    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    sourceSheet: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /* =====================================================
       DUPLICATE PROTECTION
    ===================================================== */

    duplicateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    /* =====================================================
       CLAIM / OWNERSHIP
    ===================================================== */

    claimed: {
      type: Boolean,
      default: false,
      index: true,
    },

    claimedAt: {
      type: Date,
      default: null,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    updatedByOwner: {
      type: Boolean,
      default: false,
    },

    ownerVerified: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       DIRECTORY LISTING PLAN

       free     = Basic
       pro      = Silver
       verified = Gold
    ===================================================== */

    plan: {
      type: String,

      enum: [
        "free",
        "pro",
        "verified",
      ],

      default: "free",

      index: true,

      /*
        Normalize old/new names before validation.

        silver -> pro
        gold -> verified
        spotlight -> verified
        basic -> free
      */
      set(value) {
        const plan = String(
          value || "free",
        )
          .trim()
          .toLowerCase();

        if (plan === "silver") {
          return "pro";
        }

        if (
          plan === "gold" ||
          plan === "spotlight"
        ) {
          return "verified";
        }

        if (plan === "basic") {
          return "free";
        }

        return plan;
      },
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    spotlight: {
      type: Boolean,
      default: false,
      index: true,
    },

    hallOfFameEligible: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       PAYMENT
    ===================================================== */

    paymentStatus: {
      type: String,

      enum: [
        "",
        "pending",
        "paid",
        "failed",
      ],

      default: "",
    },

    /* =====================================================
       IMPORT DATE
    ===================================================== */

    importedAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  },
);

/* =========================================================
   NORMALIZE TATTOO STYLES BEFORE SAVE

   IMPORTANT:
   NO next()
========================================================= */

tattooStudioSchema.pre(
  "save",

  function normalizeTattooStyles() {
    if (
      Array.isArray(
        this.tattooStyles,
      )
    ) {
      this.tattooStyles = [
        ...new Set(
          this.tattooStyles
            .map((style) =>
              String(
                style || "",
              ).trim(),
            )
            .filter(Boolean),
        ),
      ];
    }
  },
);

/* =========================================================
   NORMALIZE MEMBERSHIP FLAGS BEFORE SAVE

   IMPORTANT:
   NO next()
========================================================= */

tattooStudioSchema.pre(
  "save",

  function normalizeMembershipPlan() {
    const plan = String(
      this.plan || "free",
    )
      .trim()
      .toLowerCase();

    /* =============================================
       GOLD / VERIFIED
    ============================================= */

    if (plan === "verified") {
      this.verified = true;

      this.spotlight = true;

      this.hallOfFameEligible =
        true;

      return;
    }

    /* =============================================
       SILVER / PRO
    ============================================= */

    if (plan === "pro") {
      this.verified = false;

      this.spotlight = false;

      this.hallOfFameEligible =
        false;

      return;
    }

    /* =============================================
       BASIC / FREE
    ============================================= */

    this.verified = false;

    this.spotlight = false;

    this.hallOfFameEligible =
      false;
  },
);

/* =========================================================
   NORMALIZE findOneAndUpdate PLAN

   This makes PATCH / update routes safe too.
========================================================= */

tattooStudioSchema.pre(
  "findOneAndUpdate",

  function normalizePlanUpdate() {
    const update =
      this.getUpdate() || {};

    const setData =
      update.$set || update;

    if (!setData) {
      return;
    }

    /* =============================================
       PLAN
    ============================================= */

    if (
      setData.plan !== undefined
    ) {
      let plan = String(
        setData.plan || "free",
      )
        .trim()
        .toLowerCase();

      if (plan === "silver") {
        plan = "pro";
      }

      if (
        plan === "gold" ||
        plan === "spotlight"
      ) {
        plan = "verified";
      }

      if (plan === "basic") {
        plan = "free";
      }

      setData.plan = plan;

      /* GOLD */

      if (plan === "verified") {
        setData.verified = true;

        setData.spotlight = true;

        setData.hallOfFameEligible =
          true;
      }

      /* SILVER */

      if (plan === "pro") {
        setData.verified = false;

        setData.spotlight = false;

        setData.hallOfFameEligible =
          false;
      }

      /* BASIC */

      if (plan === "free") {
        setData.verified = false;

        setData.spotlight = false;

        setData.hallOfFameEligible =
          false;
      }
    }

    /* =============================================
       TATTOO STYLES
    ============================================= */

    if (
      Array.isArray(
        setData.tattooStyles,
      )
    ) {
      setData.tattooStyles = [
        ...new Set(
          setData.tattooStyles
            .map((style) =>
              String(
                style || "",
              ).trim(),
            )
            .filter(Boolean),
        ),
      ];
    }

    if (update.$set) {
      update.$set = setData;
    }

    this.setUpdate(update);
  },
);

/* =========================================================
   MODEL
========================================================= */

const TattooStudio =
  mongoose.models.TattooStudio ||
  mongoose.model(
    "TattooStudio",
    tattooStudioSchema,
  );

module.exports = TattooStudio;