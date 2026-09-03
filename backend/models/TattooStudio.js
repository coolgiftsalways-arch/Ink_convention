const mongoose = require("mongoose");

/* =========================================================
   TATTOO STUDIO SCHEMA
========================================================= */

const tattooStudioSchema = new mongoose.Schema(
  {
    /* =====================================================
       IMPORT / DIRECTORY DATA
    ===================================================== */

    sourceRowId: {
      type: String,
      default: "",
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /* =====================================================
       OLD / IMPORTED NAME COMPATIBILITY
    ===================================================== */

    artistName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    professionalName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    rating: {
      type: Number,
      default: null,
    },

    reviews: {
      type: Number,
      default: 0,
    },

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

    /* =====================================================
       OWNER PROFILE DETAILS

       IMPORTANT:

       ALL THESE VALUES STAY SAVED
       REGARDLESS OF FREE / SILVER / GOLD.

       membershipService.js controls
       what public visitors receive.
    ===================================================== */

    studio: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    studioName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    instagram: {
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

    portfolioImages: {
      type: [String],
      default: [],
    },

    /* =====================================================
       TATTOO SPECIALITIES

       PULLED FEATURE KEPT.

       USED BY:
       BOOK YOUR ARTIST

       Example:

       [
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
      Keep category as the
      Excel/business category.

      Example:
      "Tattoo shop"

      Anime / Realism etc.
      belongs inside tattooStyles.
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

       CLAIM DOES NOT EXPIRE WHEN
       THE MEMBERSHIP EXPIRES.
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
       MEMBERSHIP

       CANONICAL VALUES:

       basic    = FREE
       pro      = SILVER
       verified = GOLD

       Legacy "free" is temporarily
       accepted so old MongoDB rows
       don't break.

       When saved:
       free -> basic
    ===================================================== */

    plan: {
      type: String,

      enum: ["free", "basic", "pro", "verified"],

      default: "basic",

      index: true,
    },

    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    paymentStatus: {
      type: String,

      enum: ["unpaid", "pending", "paid", "failed", "refunded"],

      default: "unpaid",

      index: true,
    },

    /* =====================================================
       PREMIUM FLAGS
    ===================================================== */

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
      index: true,
    },

    /* =====================================================
       RAZORPAY INFORMATION

       DO NOT STORE:
       CARD NUMBER
       CVV
       OTP
    ===================================================== */

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },

    paymentAmount: {
      type: Number,
      default: 0,
    },

    paymentCurrency: {
      type: String,
      default: "INR",
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       1-YEAR MEMBERSHIP DATES
    ===================================================== */

    planStartedAt: {
      type: Date,
      default: null,
    },

    planExpiresAt: {
      type: Date,
      default: null,
      index: true,
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
   NORMALIZE PLAN VALUE

   SUPPORT OLD / NEW VALUES

   free      -> basic
   basic     -> basic

   silver    -> pro
   pro       -> pro

   gold      -> verified
   spotlight -> verified
   verified  -> verified
========================================================= */

function normalizePlanValue(value) {
  const plan = String(value || "basic")
    .trim()
    .toLowerCase();

  if (plan === "silver") {
    return "pro";
  }

  if (plan === "gold" || plan === "spotlight") {
    return "verified";
  }

  if (plan === "free") {
    return "basic";
  }

  if (plan === "basic" || plan === "pro" || plan === "verified") {
    return plan;
  }

  return "basic";
}

/* =========================================================
   NORMALIZE TATTOO STYLES

   Remove:
   duplicates
   blanks
   extra spaces
========================================================= */

function normalizeStyles(styles) {
  if (!Array.isArray(styles)) {
    return [];
  }

  return [
    ...new Set(
      styles.map((style) => String(style || "").trim()).filter(Boolean),
    ),
  ];
}

/* =========================================================
   MEMBERSHIP FLAGS

   GOLD + PAID
   =
   VERIFIED
   SPOTLIGHT
   HALL OF FAME

   SILVER / FREE
   =
   FLAGS FALSE
========================================================= */

function applyPlanFlags(target) {
  const plan = normalizePlanValue(target.plan);

  target.plan = plan;

  if (plan === "verified" && target.paymentStatus === "paid") {
    target.verified = true;

    target.spotlight = true;

    target.hallOfFameEligible = true;

    return;
  }

  target.verified = false;

  target.spotlight = false;

  target.hallOfFameEligible = false;
}

/* =========================================================
   BEFORE SAVE

   Mongoose newer style:
   no next() callback needed.
========================================================= */

tattooStudioSchema.pre(
  "save",

  function normalizeTattooStudio() {
    /* =============================================
       PLAN
    ============================================= */

    this.plan = normalizePlanValue(this.plan);

    /* =============================================
       TATTOO STYLES
    ============================================= */

    this.tattooStyles = normalizeStyles(this.tattooStyles);

    /* =============================================
       MAXIMUM 10 PORTFOLIO IMAGES
    ============================================= */

    if (Array.isArray(this.portfolioImages)) {
      this.portfolioImages = this.portfolioImages
        .map((image) => String(image || "").trim())
        .filter(Boolean)
        .slice(0, 10);
    } else {
      this.portfolioImages = [];
    }

    /* =============================================
       PREMIUM FLAGS
    ============================================= */

    applyPlanFlags(this);
  },
);

/* =========================================================
   NORMALIZE findOneAndUpdate

   This protects direct updates too.
========================================================= */

tattooStudioSchema.pre(
  "findOneAndUpdate",

  function normalizeStudioUpdate() {
    const update = this.getUpdate() || {};

    const setData = update.$set || update;

    if (!setData || typeof setData !== "object") {
      return;
    }

    /* =============================================
       PLAN
    ============================================= */

    if (setData.plan !== undefined) {
      setData.plan = normalizePlanValue(setData.plan);

      /*
        Do not allow a route to create
        Gold premium flags just by
        changing the plan name.

        Gold flags require:
        plan = verified
        paymentStatus = paid
      */

      if (setData.plan === "verified" && setData.paymentStatus === "paid") {
        setData.verified = true;

        setData.spotlight = true;

        setData.hallOfFameEligible = true;
      } else {
        setData.verified = false;

        setData.spotlight = false;

        setData.hallOfFameEligible = false;
      }
    }

    /* =============================================
       TATTOO STYLES
    ============================================= */

    if (setData.tattooStyles !== undefined) {
      setData.tattooStyles = normalizeStyles(setData.tattooStyles);
    }

    /* =============================================
       PORTFOLIO MAX 10
    ============================================= */

    if (setData.portfolioImages !== undefined) {
      setData.portfolioImages = Array.isArray(setData.portfolioImages)
        ? setData.portfolioImages
            .map((image) => String(image || "").trim())
            .filter(Boolean)
            .slice(0, 10)
        : [];
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
  mongoose.model("TattooStudio", tattooStudioSchema);

module.exports = TattooStudio;
