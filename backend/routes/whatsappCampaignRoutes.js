const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const TattooStudio = require("../models/TattooStudio");
const WhatsAppCampaignLog = require("../models/WhatsAppCampaignLog");

const {
  normalizeWhatsAppPhone,
  getMetaWhatsAppConfigurationStatus,
  createArtistProfileUrl,
  sendArtistProfileTemplate,
} = require("../services/metaWhatsAppService");

const router = express.Router();

const DEFAULT_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 100;
const DEFAULT_CONCURRENCY = 5;

/*
  Prevent two "Send Next 100" requests for the same campaign from
  running at exactly the same time on this Node process.
*/
const sendingCampaigns = new Set();

const INDIA_STATE_NAMES = [
  "ANDAMAN AND NICOBAR ISLANDS",
  "ANDHRA PRADESH",
  "ARUNACHAL PRADESH",
  "ASSAM",
  "BIHAR",
  "CHANDIGARH",
  "CHHATTISGARH",
  "DADRA AND NAGAR HAVELI AND DAMAN AND DIU",
  "DELHI",
  "GOA",
  "GUJARAT",
  "HARYANA",
  "HIMACHAL PRADESH",
  "JAMMU AND KASHMIR",
  "JHARKHAND",
  "KARNATAKA",
  "KERALA",
  "LADAKH",
  "LAKSHADWEEP",
  "MADHYA PRADESH",
  "MAHARASHTRA",
  "MANIPUR",
  "MEGHALAYA",
  "MIZORAM",
  "NAGALAND",
  "ODISHA",
  "PUDUCHERRY",
  "PUNJAB",
  "RAJASTHAN",
  "SIKKIM",
  "TAMIL NADU",
  "TELANGANA",
  "TRIPURA",
  "UTTAR PRADESH",
  "UTTARAKHAND",
  "WEST BENGAL",
];

const MAIN_CITIES_BY_STATE = {
  "ANDAMAN AND NICOBAR ISLANDS": ["PORT BLAIR"],
  "ANDHRA PRADESH": [
    "VISAKHAPATNAM",
    "VIJAYAWADA",
    "GUNTUR",
    "TIRUPATI",
    "NELLORE",
    "KURNOOL",
    "RAJAHMUNDRY",
    "KAKINADA",
    "ANANTAPUR",
    "KADAPA",
    "ELURU",
    "ONGOLE",
  ],
  "ARUNACHAL PRADESH": ["ITANAGAR", "NAHARLAGUN", "PASIGHAT"],
  ASSAM: [
    "GUWAHATI",
    "DIBRUGARH",
    "SILCHAR",
    "JORHAT",
    "TEZPUR",
    "NAGAON",
    "TINSUKIA",
    "SIVASAGAR",
  ],
  BIHAR: [
    "PATNA",
    "GAYA",
    "MUZAFFARPUR",
    "BHAGALPUR",
    "BIHAR SHARIF",
    "DARBHANGA",
    "PURNIA",
    "ARA",
    "BEGUSARAI",
    "KATIHAR",
    "MUNGER",
    "CHAPRA",
    "HAJIPUR",
    "SASARAM",
  ],
  CHANDIGARH: ["CHANDIGARH"],
  CHHATTISGARH: [
    "RAIPUR",
    "BHILAI",
    "DURG",
    "BILASPUR",
    "KORBA",
    "RAJNANDGAON",
    "JAGDALPUR",
    "RAIGARH",
    "AMBIKAPUR",
  ],
  "DADRA AND NAGAR HAVELI AND DAMAN AND DIU": ["SILVASSA", "DAMAN", "DIU"],
  DELHI: ["DELHI", "NEW DELHI"],
  GOA: ["PANAJI", "MARGAO", "VASCO DA GAMA", "MAPUSA", "PONDA"],
  GUJARAT: [
    "AHMEDABAD",
    "SURAT",
    "VADODARA",
    "RAJKOT",
    "GANDHINAGAR",
    "BHAVNAGAR",
    "JAMNAGAR",
    "JUNAGADH",
    "ANAND",
    "BHARUCH",
    "NAVSARI",
    "VAPI",
    "MORBI",
    "MEHSANA",
    "NADIAD",
    "PORBANDAR",
    "BHUJ",
  ],
  HARYANA: [
    "GURUGRAM",
    "FARIDABAD",
    "PANIPAT",
    "AMBALA",
    "KARNAL",
    "HISAR",
    "ROHTAK",
    "SONIPAT",
    "PANCHKULA",
    "YAMUNANAGAR",
    "KURUKSHETRA",
    "REWARI",
    "BHIWANI",
    "SIRSA",
  ],
  "HIMACHAL PRADESH": [
    "SHIMLA",
    "DHARAMSHALA",
    "SOLAN",
    "MANDI",
    "KULLU",
    "MANALI",
    "HAMIRPUR",
    "UNA",
    "BILASPUR",
    "CHAMBA",
    "NAHAN",
  ],
  "JAMMU AND KASHMIR": [
    "SRINAGAR",
    "JAMMU",
    "ANANTNAG",
    "BARAMULLA",
    "UDHAMPUR",
    "KATHUA",
  ],
  JHARKHAND: [
    "RANCHI",
    "JAMSHEDPUR",
    "DHANBAD",
    "BOKARO",
    "DEOGHAR",
    "HAZARIBAGH",
    "GIRIDIH",
    "RAMGARH",
  ],
  KARNATAKA: [
    "BENGALURU",
    "MYSURU",
    "MANGALURU",
    "HUBBALLI",
    "DHARWAD",
    "BELAGAVI",
    "DAVANAGERE",
    "BALLARI",
    "KALABURAGI",
    "SHIVAMOGGA",
    "TUMAKURU",
    "UDUPI",
    "HASSAN",
    "VIJAYAPURA",
  ],
  KERALA: [
    "THIRUVANANTHAPURAM",
    "KOCHI",
    "KOZHIKODE",
    "THRISSUR",
    "KOLLAM",
    "KANNUR",
    "KOTTAYAM",
    "ALAPPUZHA",
    "PALAKKAD",
    "MALAPPURAM",
    "KASARAGOD",
  ],
  LADAKH: ["LEH", "KARGIL"],
  LAKSHADWEEP: ["KAVARATTI"],
  "MADHYA PRADESH": [
    "INDORE",
    "BHOPAL",
    "JABALPUR",
    "GWALIOR",
    "UJJAIN",
    "SAGAR",
    "DEWAS",
    "SATNA",
    "RATLAM",
    "REWA",
    "SINGRAULI",
    "CHHINDWARA",
    "KHANDWA",
  ],
  MAHARASHTRA: [
    "MUMBAI",
    "NAVI MUMBAI",
    "PUNE",
    "NAGPUR",
    "NASHIK",
    "THANE",
    "CHHATRAPATI SAMBHAJINAGAR",
    "SOLAPUR",
    "KOLHAPUR",
    "AMRAVATI",
    "NANDED",
    "SANGLI",
    "JALGAON",
    "AKOLA",
    "LATUR",
    "AHILYANAGAR",
    "DHULE",
    "CHANDRAPUR",
    "PARBHANI",
    "SATARA",
    "RATNAGIRI",
    "PANVEL",
  ],
  MANIPUR: ["IMPHAL", "THOUBAL"],
  MEGHALAYA: ["SHILLONG", "TURA"],
  MIZORAM: ["AIZAWL", "LUNGLEI"],
  NAGALAND: ["DIMAPUR", "KOHIMA", "MOKOKCHUNG"],
  ODISHA: [
    "BHUBANESWAR",
    "CUTTACK",
    "ROURKELA",
    "BERHAMPUR",
    "SAMBALPUR",
    "PURI",
    "BALASORE",
    "BARIPADA",
    "JHARSUGUDA",
  ],
  PUDUCHERRY: ["PUDUCHERRY", "KARAIKAL"],
  PUNJAB: [
    "LUDHIANA",
    "AMRITSAR",
    "JALANDHAR",
    "PATIALA",
    "BATHINDA",
    "MOHALI",
    "PATHANKOT",
    "HOSHIARPUR",
    "MOGA",
    "FIROZPUR",
  ],
  RAJASTHAN: [
    "JAIPUR",
    "JODHPUR",
    "UDAIPUR",
    "KOTA",
    "AJMER",
    "BIKANER",
    "ALWAR",
    "BHARATPUR",
    "BHILWARA",
    "SIKAR",
    "PALI",
    "SRI GANGANAGAR",
    "CHITTORGARH",
    "BARMER",
    "JAISALMER",
    "TONK",
  ],
  SIKKIM: ["GANGTOK", "NAMCHI"],
  "TAMIL NADU": [
    "CHENNAI",
    "COIMBATORE",
    "MADURAI",
    "TIRUCHIRAPPALLI",
    "SALEM",
    "TIRUPPUR",
    "ERODE",
    "VELLORE",
    "THOOTHUKUDI",
    "TIRUNELVELI",
    "DINDIGUL",
    "THANJAVUR",
    "HOSUR",
    "NAGERCOIL",
    "KANCHIPURAM",
  ],
  TELANGANA: [
    "HYDERABAD",
    "WARANGAL",
    "NIZAMABAD",
    "KARIMNAGAR",
    "KHAMMAM",
    "RAMAGUNDAM",
    "MAHBUBNAGAR",
    "NALGONDA",
  ],
  TRIPURA: ["AGARTALA"],
  "UTTAR PRADESH": [
    "LUCKNOW",
    "KANPUR",
    "GHAZIABAD",
    "NOIDA",
    "GREATER NOIDA",
    "AGRA",
    "VARANASI",
    "PRAYAGRAJ",
    "MEERUT",
    "BAREILLY",
    "ALIGARH",
    "MORADABAD",
    "SAHARANPUR",
    "GORAKHPUR",
    "JHANSI",
    "MATHURA",
    "AYODHYA",
    "FIROZABAD",
    "MUZAFFARNAGAR",
    "RAMPUR",
  ],
  UTTARAKHAND: [
    "DEHRADUN",
    "HARIDWAR",
    "HALDWANI",
    "ROORKEE",
    "RISHIKESH",
    "RUDRAPUR",
    "KASHIPUR",
    "NAINITAL",
  ],
  "WEST BENGAL": [
    "KOLKATA",
    "HOWRAH",
    "DURGAPUR",
    "ASANSOL",
    "SILIGURI",
    "KHARAGPUR",
    "DARJEELING",
    "HALDIA",
    "BARDHAMAN",
    "MALDA",
    "BAHARAMPUR",
  ],
};

/*
  These aliases are NOT shown in the dropdown.
  They are only used so locality/old-name records are grouped under
  the proper main city when counting cards and sending a batch.
*/
const CITY_ALIASES = {
  MAHARASHTRA: {
    MUMBAI: [
      "MUMBAI",
      "BOMBAY",
      "MAHIM",
      "ANDHERI",
      "BANDRA",
      "BORIVALI",
      "KANDIVALI",
      "MALAD",
      "GOREGAON",
      "JOGESHWARI",
      "VILE PARLE",
      "SANTACRUZ",
      "SANTA CRUZ",
      "KHAR",
      "DADAR",
      "WORLI",
      "PAREL",
      "LOWER PAREL",
      "BYCULLA",
      "COLABA",
      "CHEMBUR",
      "GHATKOPAR",
      "POWAI",
      "KURLA",
      "SION",
      "MULUND",
      "BHANDUP",
      "MARINE LINES",
      "GRANT ROAD",
    ],
    "NAVI MUMBAI": [
      "NAVI MUMBAI",
      "VASHI",
      "NERUL",
      "CBD BELAPUR",
      "BELAPUR",
      "KHARGHAR",
      "AIROLI",
      "GHANSOLI",
      "KOPAR KHAIRANE",
      "SANPADA",
      "TURBHE",
      "JUINAGAR",
      "SEAWOODS",
      "KAMOTHE",
      "KALAMBOLI",
    ],
    PUNE: [
      "PUNE",
      "POONA",
      "HINJEWADI",
      "WAKAD",
      "BANER",
      "AUNDH",
      "KOTHRUD",
      "HADAPSAR",
      "VIMAN NAGAR",
      "KOREGAON PARK",
      "KHARADI",
      "SHIVAJINAGAR",
    ],
    NASHIK: ["NASHIK", "NASIK"],
    "CHHATRAPATI SAMBHAJINAGAR": ["CHHATRAPATI SAMBHAJINAGAR", "AURANGABAD"],
    AHILYANAGAR: ["AHILYANAGAR", "AHMEDNAGAR"],
  },
  DELHI: {
    DELHI: [
      "DELHI",
      "DWARKA",
      "ROHINI",
      "SAKET",
      "JANAKPURI",
      "PITAMPURA",
      "RAJOURI GARDEN",
      "KAROL BAGH",
      "LAJPAT NAGAR",
      "CONNAUGHT PLACE",
    ],
    "NEW DELHI": ["NEW DELHI"],
  },
  HARYANA: {
    GURUGRAM: ["GURUGRAM", "GURGAON"],
  },
  KARNATAKA: {
    BENGALURU: [
      "BENGALURU",
      "BANGALORE",
      "WHITEFIELD",
      "KORAMANGALA",
      "INDIRANAGAR",
      "JAYANAGAR",
      "HSR LAYOUT",
      "MARATHAHALLI",
      "ELECTRONIC CITY",
      "YELAHANKA",
      "BELLANDUR",
    ],
    MYSURU: ["MYSURU", "MYSORE"],
    MANGALURU: ["MANGALURU", "MANGALORE"],
    HUBBALLI: ["HUBBALLI", "HUBLI"],
    BELAGAVI: ["BELAGAVI", "BELGAUM"],
    BALLARI: ["BALLARI", "BELLARY"],
    KALABURAGI: ["KALABURAGI", "GULBARGA"],
    SHIVAMOGGA: ["SHIVAMOGGA", "SHIMOGA"],
    VIJAYAPURA: ["VIJAYAPURA", "BIJAPUR"],
  },
  TELANGANA: {
    HYDERABAD: [
      "HYDERABAD",
      "SECUNDERABAD",
      "BANJARA HILLS",
      "JUBILEE HILLS",
      "GACHIBOWLI",
      "MADHAPUR",
      "KONDAPUR",
      "KUKATPALLY",
      "HITEC CITY",
    ],
  },
  "TAMIL NADU": {
    CHENNAI: [
      "CHENNAI",
      "MADRAS",
      "T NAGAR",
      "T. NAGAR",
      "ADYAR",
      "VELACHERY",
      "ANNA NAGAR",
      "MYLAPORE",
      "NUNGAMBAKKAM",
      "TAMBARAM",
    ],
  },
  "WEST BENGAL": {
    KOLKATA: [
      "KOLKATA",
      "CALCUTTA",
      "SALT LAKE",
      "BIDHANNAGAR",
      "NEW TOWN",
      "RAJARHAT",
      "PARK STREET",
    ],
    BARDHAMAN: ["BARDHAMAN", "BURDWAN"],
  },
  "UTTAR PRADESH": {
    PRAYAGRAJ: ["PRAYAGRAJ", "ALLAHABAD"],
  },
};

function cleanDisplayLocation(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function getCanonicalCitiesForState(state) {
  const cleanState = cleanDisplayLocation(state);
  return Array.isArray(MAIN_CITIES_BY_STATE[cleanState])
    ? MAIN_CITIES_BY_STATE[cleanState]
    : [];
}

function getCityAliases(state, city) {
  const cleanState = cleanDisplayLocation(state);
  const cleanCity = cleanDisplayLocation(city);

  if (!cleanCity) {
    return [];
  }

  const aliases = CITY_ALIASES?.[cleanState]?.[cleanCity] || [cleanCity];

  return Array.from(
    new Set([cleanCity, ...aliases].map(cleanDisplayLocation).filter(Boolean)),
  );
}

function getCityRegexes(state, city) {
  return getCityAliases(state, city).map(
    (value) => new RegExp(`^${escapeRegex(value)}$`, "i"),
  );
}

function getCityFieldMatch(state, city) {
  const regexes = getCityRegexes(state, city);

  if (regexes.length === 0) {
    return null;
  }

  if (regexes.length === 1) {
    return regexes[0];
  }

  return { $in: regexes };
}

function rawCityBelongsToCanonicalCity(rawCity, state, canonicalCity) {
  const cleanRaw = cleanDisplayLocation(rawCity);

  if (!cleanRaw) {
    return false;
  }

  return getCityAliases(state, canonicalCity).includes(cleanRaw);
}

/* =========================================================
   SECURITY
========================================================= */

function safeEqualText(first, second) {
  const a = Buffer.from(String(first || ""));
  const b = Buffer.from(String(second || ""));

  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

function requireCampaignAdminKey(req, res, next) {
  const expected = String(process.env.WHATSAPP_CAMPAIGN_ADMIN_KEY || "").trim();
  const received = String(req.get("x-whatsapp-campaign-key") || "").trim();

  if (!expected) {
    return res.status(503).json({
      success: false,
      message:
        "WHATSAPP_CAMPAIGN_ADMIN_KEY is missing in backend/.env. Campaign sending is disabled.",
    });
  }

  if (!safeEqualText(expected, received)) {
    return res.status(401).json({
      success: false,
      message: "Invalid WhatsApp campaign security key.",
    });
  }

  return next();
}

/* =========================================================
   PUBLIC LOCATION FILTER OPTIONS

   Only state/city names are returned here. No phone/email/contact
   data is exposed. This allows the dashboard dropdowns to populate
   immediately, even before the campaign security key is entered.
========================================================= */

router.get("/filters", async (req, res) => {
  try {
    const selectedState = cleanDisplayLocation(
      normalizeLocationFilter(req.query.state),
    );

    const stateFilter = {
      state: { $exists: true, $nin: ["", null] },
    };

    const cityFilter = {
      city: { $exists: true, $nin: ["", null] },
    };

    if (selectedState) {
      cityFilter.state = exactLocationMatch(selectedState);
    }

    const [rawStates, rawCities] = await Promise.all([
      TattooStudio.distinct("state", stateFilter),
      TattooStudio.distinct("city", cityFilter),
    ]);

    const stateSet = new Set(
      rawStates
        .map(cleanDisplayLocation)
        .filter((state) => INDIA_STATE_NAMES.includes(state)),
    );

    const cleanStates = INDIA_STATE_NAMES.filter((state) =>
      stateSet.has(state),
    );

    /*
      IMPORTANT:
      Do not show every raw MongoDB locality in the CITY dropdown.
      Example: MAHIM, WAKAD, VASHI, BANJARA HILLS etc. stay hidden.
      They are grouped under their main city instead.
    */
    let cleanCities = [];

    if (selectedState) {
      const rawCitySet = new Set(
        rawCities.map(cleanDisplayLocation).filter(Boolean),
      );

      cleanCities = getCanonicalCitiesForState(selectedState).filter(
        (canonicalCity) => {
          const aliases = getCityAliases(selectedState, canonicalCity);

          return aliases.some((alias) => rawCitySet.has(alias));
        },
      );
    }

    return res.status(200).json({
      success: true,
      filters: {
        selectedState: selectedState || "ALL",
        states: cleanStates,
        cities: cleanCities,
      },
    });
  } catch (error) {
    console.error("❌ WhatsApp campaign filters error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load WhatsApp campaign filters.",
    });
  }
});

function hasValidCampaignAdminKey(req) {
  const expected = String(process.env.WHATSAPP_CAMPAIGN_ADMIN_KEY || "").trim();
  const received = String(req.get("x-whatsapp-campaign-key") || "").trim();

  if (!expected || !received) {
    return false;
  }

  return safeEqualText(expected, received);
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeCampaignKey(value) {
  const fallback =
    String(process.env.WHATSAPP_CAMPAIGN_DEFAULT_KEY || "").trim() ||
    "artist_outreach_2026";

  const campaignKey = String(value || fallback)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80);

  return campaignKey || fallback;
}

function getBatchSize(value) {
  const requested = Number.parseInt(value, 10);

  if (!Number.isFinite(requested)) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(Math.max(requested, 1), MAX_BATCH_SIZE);
}

function getConcurrency() {
  const requested = Number.parseInt(
    process.env.WHATSAPP_CAMPAIGN_CONCURRENCY,
    10,
  );

  if (!Number.isFinite(requested)) {
    return DEFAULT_CONCURRENCY;
  }

  return Math.min(Math.max(requested, 1), 10);
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPhoneSearchPattern(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length < 3) {
    return "";
  }

  // Allows searches such as 982 to match stored values like +91 98204 11469.
  return digits
    .split("")
    .map((digit) => escapeRegex(digit))
    .join("\\D*");
}

function normalizeLocationFilter(value) {
  const text = String(value || "").trim();

  if (!text || text.toUpperCase() === "ALL") {
    return "";
  }

  return text;
}

function exactLocationMatch(value) {
  return {
    $regex: `^${escapeRegex(value)}$`,
    $options: "i",
  };
}

function getEligibleArtistFilter({ state = "", city = "" } = {}) {
  const cleanState = normalizeLocationFilter(state);
  const cleanCity = normalizeLocationFilter(city);

  const filter = {
    whatsappOptIn: true,

    /*
      MongoDB { field: null } matches null OR a missing field,
      so old artist records remain compatible.
    */
    whatsappOptOutAt: null,

    phone: {
      $exists: true,
      $nin: ["", null],
    },
  };

  if (cleanState) {
    filter.state = exactLocationMatch(cleanState);
  }

  if (cleanCity) {
    filter.city = getCityFieldMatch(cleanState, cleanCity);
  }

  return filter;
}

function getLogLocationFilter({ state = "", city = "" } = {}) {
  const cleanState = normalizeLocationFilter(state);
  const cleanCity = normalizeLocationFilter(city);

  const filter = {};

  if (cleanState) {
    filter.artistState = exactLocationMatch(cleanState);
  }

  if (cleanCity) {
    filter.artistCity = getCityFieldMatch(cleanState, cleanCity);
  }

  return filter;
}

async function getAttemptedArtistIds(campaignKey) {
  return WhatsAppCampaignLog.distinct("artistId", {
    campaignKey,
  });
}

async function getRemainingCount(campaignKey, locationFilters = {}) {
  const attemptedIds = await getAttemptedArtistIds(campaignKey);

  const filter = getEligibleArtistFilter(locationFilters);

  if (attemptedIds.length > 0) {
    filter._id = {
      $nin: attemptedIds,
    };
  }

  return TattooStudio.countDocuments(filter);
}

async function getRecentBatches(campaignKey, locationFilters = {}) {
  const batches = await WhatsAppCampaignLog.aggregate([
    {
      $match: {
        campaignKey,
        ...getLogLocationFilter(locationFilters),
      },
    },
    {
      $group: {
        _id: {
          batchId: "$batchId",
          batchNumber: "$batchNumber",
        },

        attempted: {
          $sum: 1,
        },

        sent: {
          $sum: {
            $cond: [{ $eq: ["$status", "sent"] }, 1, 0],
          },
        },

        failed: {
          $sum: {
            $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
          },
        },

        startedAt: {
          $min: "$attemptedAt",
        },

        lastUpdatedAt: {
          $max: "$updatedAt",
        },
      },
    },
    {
      $sort: {
        "_id.batchNumber": -1,
      },
    },
    {
      $limit: 5,
    },
  ]);

  return batches.map((batch) => ({
    batchId: batch?._id?.batchId || "",
    batchNumber: Number(batch?._id?.batchNumber || 0),
    attempted: Number(batch?.attempted || 0),
    sent: Number(batch?.sent || 0),
    failed: Number(batch?.failed || 0),
    startedAt: batch?.startedAt || null,
    lastUpdatedAt: batch?.lastUpdatedAt || null,
  }));
}

async function getCampaignStats(campaignKey, locationFilters = {}) {
  const cleanState = normalizeLocationFilter(locationFilters.state);
  const cleanCity = normalizeLocationFilter(locationFilters.city);

  const locationFilter = {};

  if (cleanState) {
    locationFilter.state = exactLocationMatch(cleanState);
  }

  if (cleanCity) {
    locationFilter.city = getCityFieldMatch(cleanState, cleanCity);
  }

  const eligibleFilter = getEligibleArtistFilter({
    state: cleanState,
    city: cleanCity,
  });

  const logLocationFilter = getLogLocationFilter({
    state: cleanState,
    city: cleanCity,
  });

  const [
    totalArtists,
    eligible,
    attempted,
    sent,
    failed,
    remaining,
    recentBatches,
  ] = await Promise.all([
    TattooStudio.countDocuments(locationFilter),

    TattooStudio.countDocuments(eligibleFilter),

    WhatsAppCampaignLog.countDocuments({
      campaignKey,
      ...logLocationFilter,
    }),

    WhatsAppCampaignLog.countDocuments({
      campaignKey,
      ...logLocationFilter,
      status: "sent",
    }),

    WhatsAppCampaignLog.countDocuments({
      campaignKey,
      ...logLocationFilter,
      status: "failed",
    }),

    getRemainingCount(campaignKey, {
      state: cleanState,
      city: cleanCity,
    }),

    getRecentBatches(campaignKey, {
      state: cleanState,
      city: cleanCity,
    }),
  ]);

  return {
    campaignKey,
    filters: {
      state: cleanState || "ALL",
      city: cleanCity || "ALL",
    },
    totalArtists,
    eligible,
    notEligible: Math.max(0, totalArtists - eligible),
    attempted,
    sent,
    failed,
    pending: remaining,
    remaining,
    recentBatches,
    meta: getMetaWhatsAppConfigurationStatus(),
  };
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

/* =========================================================
   GET CAMPAIGN STATS

   GET /api/whatsapp-campaigns/stats
========================================================= */

router.get("/stats", async (req, res) => {
  try {
    const campaignKey = normalizeCampaignKey(req.query.campaignKey);

    const stats = await getCampaignStats(campaignKey, {
      state: req.query.state,
      city: req.query.city,
    });

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("❌ WhatsApp campaign stats error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load WhatsApp campaign stats.",
    });
  }
});

/* =========================================================
   GET ARTISTS FOR SELECTED STATE / CITY

   Read-only card data can load without the campaign send key.
   Private phone/email values are returned only when a valid campaign key
   is supplied. This endpoint returns every matching directory artist, not
   only WhatsApp-eligible artists. Sending eligibility is shown per card.

   GET /api/whatsapp-campaigns/artists?state=...&city=...&page=1&limit=100
========================================================= */

router.get("/artists", async (req, res) => {
  try {
    const canSeePrivateContact = hasValidCampaignAdminKey(req);
    const campaignKey = normalizeCampaignKey(req.query.campaignKey);
    const selectedState = normalizeLocationFilter(req.query.state);
    const selectedCity = normalizeLocationFilter(req.query.city);
    const searchQuery = String(req.query.search || "").trim();
    const searchActive = searchQuery.length >= 3;

    const requestedView = String(req.query.view || "pending")
      .trim()
      .toLowerCase();

    const view = ["pending", "sent", "failed", "all"].includes(requestedView)
      ? requestedView
      : "pending";

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 100, 1),
      100,
    );
    const skip = (page - 1) * limit;

    const locationFilter = {};

    if (selectedState) {
      locationFilter.state = exactLocationMatch(selectedState);
    }

    if (selectedCity) {
      locationFilter.city = getCityFieldMatch(selectedState, selectedCity);
    }

    let artistFilter = {
      ...locationFilter,
    };

    if (view === "pending") {
      artistFilter = getEligibleArtistFilter({
        state: selectedState,
        city: selectedCity,
      });

      const attemptedIds = await getAttemptedArtistIds(campaignKey);

      if (attemptedIds.length > 0) {
        artistFilter._id = {
          $nin: attemptedIds,
        };
      }
    }

    if (view === "sent" || view === "failed") {
      const matchingLogs = await WhatsAppCampaignLog.find({
        campaignKey,
        ...getLogLocationFilter({
          state: selectedState,
          city: selectedCity,
        }),
        status: view,
      })
        .select({ artistId: 1 })
        .lean();

      const artistIds = matchingLogs.map((log) => log.artistId);

      artistFilter = {
        ...locationFilter,
        _id: {
          $in: artistIds,
        },
      };
    }

    if (searchActive) {
      const textPattern = escapeRegex(searchQuery);
      const phonePattern = buildPhoneSearchPattern(searchQuery);

      const searchConditions = [
        { name: { $regex: textPattern, $options: "i" } },
        { artistName: { $regex: textPattern, $options: "i" } },
        { professionalName: { $regex: textPattern, $options: "i" } },
        { studio: { $regex: textPattern, $options: "i" } },
        { studioName: { $regex: textPattern, $options: "i" } },
      ];

      if (phonePattern) {
        searchConditions.push({
          phone: { $regex: phonePattern, $options: "i" },
        });
      }

      artistFilter = {
        $and: [
          artistFilter,
          {
            $or: searchConditions,
          },
        ],
      };
    }

    const [artists, total] = await Promise.all([
      TattooStudio.find(artistFilter)
        .select({
          _id: 1,
          name: 1,
          artistName: 1,
          professionalName: 1,
          studio: 1,
          studioName: 1,
          phone: 1,
          email: 1,
          state: 1,
          city: 1,
          plan: 1,
          claimed: 1,
          phoneVerified: 1,
          ownerVerified: 1,
          updatedByOwner: 1,
          profileImage: 1,
          whatsappOptIn: 1,
          whatsappOptInAt: 1,
          whatsappOptOutAt: 1,
          whatsappContactCount: 1,
          whatsappLastContactedAt: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .sort({ state: 1, city: 1, name: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      TattooStudio.countDocuments(artistFilter),
    ]);

    const artistIds = artists.map((artist) => artist._id);

    const logs = artistIds.length
      ? await WhatsAppCampaignLog.find({
          campaignKey,
          artistId: { $in: artistIds },
        })
          .select({
            artistId: 1,
            status: 1,
            sentAt: 1,
            attemptedAt: 1,
            batchNumber: 1,
          })
          .lean()
      : [];

    const logByArtistId = new Map(
      logs.map((log) => [String(log.artistId), log]),
    );

    const rows = artists.map((artist) => {
      const log = logByArtistId.get(String(artist._id));
      const normalizedPhone = normalizeWhatsAppPhone(artist.phone);

      const eligible = Boolean(
        artist.whatsappOptIn && !artist.whatsappOptOutAt && normalizedPhone,
      );

      return {
        ...artist,
        id: String(artist._id),
        phone: canSeePrivateContact ? artist.phone || "" : "",
        email: canSeePrivateContact ? artist.email || "" : "",
        eligible,
        normalizedPhone: canSeePrivateContact ? normalizedPhone : "",
        campaignAttempted: Boolean(log),
        campaignStatus: log?.status || "not-sent",
        campaignBatchNumber: Number(log?.batchNumber || 0),
        campaignSentAt: log?.sentAt || null,
        campaignAttemptedAt: log?.attemptedAt || null,
      };
    });

    return res.status(200).json({
      success: true,
      filters: {
        state: selectedState || "ALL",
        city: selectedCity || "ALL",
        view,
        search: searchActive ? searchQuery : "",
      },
      artists: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("❌ WhatsApp campaign artist list error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load artists for this location.",
    });
  }
});

/* =========================================================
   SEND ONE ARTIST (TEST / MANUAL CARD BUTTON)

   POST /api/whatsapp-campaigns/send-one

   IMPORTANT:
   - Uses the SAME campaignKey as SEND NEXT 100.
   - The artist must be explicitly WhatsApp opted-in.
   - Once attempted here, SEND NEXT 100 automatically skips them.
   - The unique campaignKey + artistId index prevents duplicates.
========================================================= */

router.post("/send-one", requireCampaignAdminKey, async (req, res) => {
  const campaignKey = normalizeCampaignKey(req.body?.campaignKey);
  const artistId = String(req.body?.artistId || "").trim();
  const selectedState = normalizeLocationFilter(req.body?.state);
  const selectedCity = normalizeLocationFilter(req.body?.city);

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    return res.status(400).json({
      success: false,
      message: "A valid artist ID is required.",
    });
  }

  try {
    const metaStatus = getMetaWhatsAppConfigurationStatus();

    if (!metaStatus.configured) {
      return res.status(503).json({
        success: false,
        message: `Meta WhatsApp configuration is incomplete. Missing: ${metaStatus.missing.join(
          ", ",
        )}`,
      });
    }

    const alreadyAttempted = await WhatsAppCampaignLog.findOne({
      campaignKey,
      artistId,
    })
      .select({
        status: 1,
        batchNumber: 1,
        sentAt: 1,
        attemptedAt: 1,
      })
      .lean();

    if (alreadyAttempted) {
      return res.status(409).json({
        success: false,
        message:
          alreadyAttempted.status === "sent"
            ? "This artist was already sent a message in this campaign."
            : "This artist was already attempted in this campaign and will not be repeated.",
      });
    }

    const eligibleFilter = getEligibleArtistFilter({
      state: selectedState,
      city: selectedCity,
    });

    eligibleFilter._id = artistId;

    const artist = await TattooStudio.findOne(eligibleFilter)
      .select({
        _id: 1,
        name: 1,
        artistName: 1,
        professionalName: 1,
        phone: 1,
        state: 1,
        city: 1,
        whatsappOptIn: 1,
        whatsappOptInAt: 1,
        whatsappOptOutAt: 1,
      })
      .lean();

    if (!artist) {
      return res.status(400).json({
        success: false,
        message:
          "This artist is not eligible for Meta WhatsApp in the selected location. A valid phone number and WhatsApp opt-in are required.",
      });
    }

    const latestBatch = await WhatsAppCampaignLog.findOne({
      campaignKey,
    })
      .sort({
        batchNumber: -1,
      })
      .select({
        batchNumber: 1,
      })
      .lean();

    const batchNumber = Number(latestBatch?.batchNumber || 0) + 1;
    const batchId = `${campaignKey}-single-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const artistName =
      artist?.name ||
      artist?.professionalName ||
      artist?.artistName ||
      "Tattoo Artist";

    const normalizedPhone = normalizeWhatsAppPhone(artist?.phone);
    const profileUrl = createArtistProfileUrl(String(artist._id));

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "This artist does not have a valid WhatsApp phone number.",
      });
    }

    let log;

    try {
      log = await WhatsAppCampaignLog.create({
        campaignKey,
        batchId,
        batchNumber,
        artistId: artist._id,
        artistName,
        artistState: String(artist?.state || ""),
        artistCity: String(artist?.city || ""),
        filterState: selectedState || "ALL",
        filterCity: selectedCity || "ALL",
        phone: String(artist?.phone || ""),
        normalizedPhone,
        profileUrl,
        templateName: metaStatus.templateName,
        status: "queued",
        attemptedAt: new Date(),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This artist has already been attempted in this campaign.",
        });
      }

      throw error;
    }

    try {
      const metaResult = await sendArtistProfileTemplate({
        to: normalizedPhone,
        artistName,
        artistId: String(artist._id),
        profileUrl,
      });

      const sentAt = new Date();

      await Promise.all([
        WhatsAppCampaignLog.findByIdAndUpdate(log._id, {
          $set: {
            status: "sent",
            metaMessageId: metaResult.messageId,
            metaWaId: metaResult.waId,
            sentAt,
            error: "",
          },
        }),

        TattooStudio.findByIdAndUpdate(artist._id, {
          $inc: {
            whatsappContactCount: 1,
          },
          $set: {
            whatsappLastContactedAt: sentAt,
          },
        }),
      ]);

      const stats = await getCampaignStats(campaignKey, {
        state: selectedState,
        city: selectedCity,
      });

      return res.status(200).json({
        success: true,
        message: `Message sent to ${artistName}.`,
        send: {
          artistId: String(artist._id),
          artistName,
          batchId,
          batchNumber,
          sent: 1,
          attempted: 1,
          failed: 0,
          status: "sent",
          profileUrl,
          messageId: metaResult.messageId,
        },
        batch: {
          batchId,
          batchNumber,
          requested: 1,
          attempted: 1,
          sent: 1,
          failed: 0,
          skipped: 0,
          filterState: selectedState || "ALL",
          filterCity: selectedCity || "ALL",
        },
        stats,
      });
    } catch (error) {
      const message = error?.message || "Unknown Meta WhatsApp sending error.";

      await WhatsAppCampaignLog.findByIdAndUpdate(log._id, {
        $set: {
          status: "failed",
          error: message.slice(0, 2000),
        },
      });

      const stats = await getCampaignStats(campaignKey, {
        state: selectedState,
        city: selectedCity,
      });

      return res.status(502).json({
        success: false,
        message,
        send: {
          artistId: String(artist._id),
          artistName,
          batchId,
          batchNumber,
          sent: 0,
          attempted: 1,
          failed: 1,
          status: "failed",
          profileUrl,
        },
        stats,
      });
    }
  } catch (error) {
    console.error("❌ WhatsApp send-one error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to send this WhatsApp message.",
    });
  }
});

/* =========================================================
   SEND NEXT AUTOMATIC BATCH

   POST /api/whatsapp-campaigns/send-next-batch

   IMPORTANT:
   - No manual artist selection.
   - Only explicit WhatsApp opt-ins.
   - Any artist already attempted in this campaign is excluded.
   - Maximum 100 per request.
========================================================= */

router.post("/send-next-batch", requireCampaignAdminKey, async (req, res) => {
  const campaignKey = normalizeCampaignKey(req.body?.campaignKey);
  const batchSize = getBatchSize(req.body?.batchSize);
  const selectedState = normalizeLocationFilter(req.body?.state);
  const selectedCity = normalizeLocationFilter(req.body?.city);

  if (sendingCampaigns.has(campaignKey)) {
    return res.status(409).json({
      success: false,
      message: "This WhatsApp campaign is already sending a batch.",
    });
  }

  sendingCampaigns.add(campaignKey);

  try {
    const metaStatus = getMetaWhatsAppConfigurationStatus();

    if (!metaStatus.configured) {
      return res.status(503).json({
        success: false,
        message: `Meta WhatsApp configuration is incomplete. Missing: ${metaStatus.missing.join(
          ", ",
        )}`,
      });
    }

    const attemptedIds = await getAttemptedArtistIds(campaignKey);

    const candidateFilter = getEligibleArtistFilter({
      state: selectedState,
      city: selectedCity,
    });

    if (attemptedIds.length > 0) {
      candidateFilter._id = {
        $nin: attemptedIds,
      };
    }

    /*
      Stable ordering:
      oldest consent / oldest record first.
      This ensures the next click naturally moves to the next group.
    */
    const artists = await TattooStudio.find(candidateFilter)
      .select({
        _id: 1,
        name: 1,
        artistName: 1,
        professionalName: 1,
        phone: 1,
        state: 1,
        city: 1,
        whatsappOptIn: 1,
        whatsappOptInAt: 1,
        whatsappOptOutAt: 1,
        createdAt: 1,
      })
      .sort({
        whatsappOptInAt: 1,
        createdAt: 1,
        _id: 1,
      })
      .limit(batchSize)
      .lean();

    if (artists.length === 0) {
      const stats = await getCampaignStats(campaignKey, {
        state: selectedState,
        city: selectedCity,
      });

      return res.status(200).json({
        success: true,
        message: "No unsent opted-in artists remain for this campaign.",
        batch: {
          batchNumber: 0,
          attempted: 0,
          sent: 0,
          failed: 0,
        },
        stats,
      });
    }

    const latestBatch = await WhatsAppCampaignLog.findOne({
      campaignKey,
    })
      .sort({
        batchNumber: -1,
      })
      .select({
        batchNumber: 1,
      })
      .lean();

    const batchNumber = Number(latestBatch?.batchNumber || 0) + 1;

    const batchId = `${campaignKey}-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const concurrency = getConcurrency();

    const results = [];

    async function processArtist(artist) {
      const artistId = String(artist?._id || "");

      const artistName =
        artist?.name ||
        artist?.professionalName ||
        artist?.artistName ||
        "Tattoo Artist";

      const normalizedPhone = normalizeWhatsAppPhone(artist?.phone);

      const profileUrl = createArtistProfileUrl(artistId);

      let log;

      try {
        log = await WhatsAppCampaignLog.create({
          campaignKey,
          batchId,
          batchNumber,
          artistId: artist._id,
          artistName,
          artistState: String(artist?.state || ""),
          artistCity: String(artist?.city || ""),
          filterState: selectedState || "ALL",
          filterCity: selectedCity || "ALL",
          phone: String(artist?.phone || ""),
          normalizedPhone,
          profileUrl,
          templateName: metaStatus.templateName,
          status: "queued",
          attemptedAt: new Date(),
        });
      } catch (error) {
        /*
          Unique campaignKey + artistId protects against repeats,
          even if two requests somehow race.
        */
        if (error?.code === 11000) {
          return {
            artistId,
            artistName,
            status: "skipped",
            error: "Already attempted in this campaign.",
          };
        }

        throw error;
      }

      if (!normalizedPhone) {
        const message = "Invalid or missing WhatsApp phone number.";

        await WhatsAppCampaignLog.findByIdAndUpdate(log._id, {
          $set: {
            status: "failed",
            error: message,
          },
        });

        return {
          artistId,
          artistName,
          status: "failed",
          error: message,
        };
      }

      try {
        const metaResult = await sendArtistProfileTemplate({
          to: normalizedPhone,
          artistName,
          artistId,
          profileUrl,
        });

        const sentAt = new Date();

        await Promise.all([
          WhatsAppCampaignLog.findByIdAndUpdate(log._id, {
            $set: {
              status: "sent",
              metaMessageId: metaResult.messageId,
              metaWaId: metaResult.waId,
              sentAt,
              error: "",
            },
          }),

          /*
            Keep the existing card-level counter useful:
            a successful Meta API send counts as one WhatsApp contact.
          */
          TattooStudio.findByIdAndUpdate(artist._id, {
            $inc: {
              whatsappContactCount: 1,
            },

            $set: {
              whatsappLastContactedAt: sentAt,
            },
          }),
        ]);

        return {
          artistId,
          artistName,
          phone: normalizedPhone,
          status: "sent",
          messageId: metaResult.messageId,
        };
      } catch (error) {
        const message =
          error?.message || "Unknown Meta WhatsApp sending error.";

        await WhatsAppCampaignLog.findByIdAndUpdate(log._id, {
          $set: {
            status: "failed",
            error: message.slice(0, 2000),
          },
        });

        return {
          artistId,
          artistName,
          phone: normalizedPhone,
          status: "failed",
          error: message,
        };
      }
    }

    /*
      Process in small concurrent groups instead of firing all 100
      requests at the exact same millisecond.
    */
    for (let index = 0; index < artists.length; index += concurrency) {
      const group = artists.slice(index, index + concurrency);

      const groupResults = await Promise.all(
        group.map((artist) => processArtist(artist)),
      );

      results.push(...groupResults);
    }

    const sentCount = results.filter((item) => item.status === "sent").length;

    const failedCount = results.filter(
      (item) => item.status === "failed",
    ).length;

    const skippedCount = results.filter(
      (item) => item.status === "skipped",
    ).length;

    const stats = await getCampaignStats(campaignKey, {
      state: selectedState,
      city: selectedCity,
    });

    return res.status(200).json({
      success: true,

      message: `Batch ${batchNumber} completed.`,

      batch: {
        batchId,
        batchNumber,
        requested: batchSize,
        filterState: selectedState || "ALL",
        filterCity: selectedCity || "ALL",
        attempted: results.length,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
      },

      results,

      stats,
    });
  } catch (error) {
    console.error("❌ WhatsApp send-next-batch error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to send WhatsApp batch.",
    });
  } finally {
    sendingCampaigns.delete(campaignKey);
  }
});

/* =========================================================
   EXPORT CAMPAIGN LOG CSV

   GET /api/whatsapp-campaigns/export
========================================================= */

router.get("/export", requireCampaignAdminKey, async (req, res) => {
  try {
    const campaignKey = normalizeCampaignKey(req.query.campaignKey);
    const selectedState = normalizeLocationFilter(req.query.state);
    const selectedCity = normalizeLocationFilter(req.query.city);

    const rows = await WhatsAppCampaignLog.find({
      campaignKey,
      ...getLogLocationFilter({
        state: selectedState,
        city: selectedCity,
      }),
    })
      .sort({
        batchNumber: 1,
        attemptedAt: 1,
      })
      .lean();

    const headings = [
      "Campaign",
      "Batch",
      "Artist ID",
      "Artist Name",
      "Artist State",
      "Artist City",
      "Batch Filter State",
      "Batch Filter City",
      "Phone",
      "Normalized Phone",
      "Status",
      "Meta Message ID",
      "Profile URL",
      "Attempted At",
      "Sent At",
      "Error",
    ];

    const csvRows = rows.map((row) =>
      [
        row.campaignKey,
        row.batchNumber,
        row.artistId,
        row.artistName,
        row.artistState,
        row.artistCity,
        row.filterState,
        row.filterCity,
        row.phone,
        row.normalizedPhone,
        row.status,
        row.metaMessageId,
        row.profileUrl,
        row.attemptedAt,
        row.sentAt,
        row.error,
      ]
        .map(csvEscape)
        .join(","),
    );

    const csv = [headings.map(csvEscape).join(","), ...csvRows].join("\n");

    const safeName = campaignKey.replace(/[^a-zA-Z0-9_-]/g, "_");

    const filterSuffix = [
      selectedState ? selectedState.replace(/[^a-zA-Z0-9_-]/g, "_") : "ALL",
      selectedCity ? selectedCity.replace(/[^a-zA-Z0-9_-]/g, "_") : "ALL",
    ].join("_");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}_${filterSuffix}_whatsapp_log.csv"`,
    );

    return res.status(200).send(`\uFEFF${csv}`);
  } catch (error) {
    console.error("❌ WhatsApp campaign CSV export error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to export WhatsApp campaign log.",
    });
  }
});

module.exports = router;
