import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  MapPin,
  MapPinned,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import gsap from "gsap";

/* =========================================================
   SETTINGS
========================================================= */

const ARTISTS_PER_PAGE = 20;
const AUTO_ROTATE_MS = 4000;

const ONE_DAY = 24 * 60 * 60 * 1000;
const INITIAL_DAY_INDEX = Math.floor(Date.now() / ONE_DAY);
const CITY_COUNTER_KEY = "inkConventionCityCounters";

/* =========================================================
   COMMUNITY CITIES
========================================================= */

const communityCounters = [
  { city: "MUMBAI", count: 2003, state: "MAHARASHTRA" },
  { city: "DELHI", count: 1820, state: "DELHI" },
  { city: "BENGALURU", count: 1745, state: "KARNATAKA" },
  { city: "HYDERABAD", count: 1410, state: "TELANGANA" },
  { city: "CHENNAI", count: 1336, state: "TAMIL NADU" },
  { city: "KOLKATA", count: 1251, state: "WEST BENGAL" },
  { city: "AHMEDABAD", count: 1290, state: "GUJARAT" },
  { city: "PUNE", count: 1550, state: "MAHARASHTRA" },
  { city: "SURAT", count: 1050, state: "GUJARAT" },
  { city: "JAIPUR", count: 1100, state: "RAJASTHAN" },
  { city: "LUCKNOW", count: 980, state: "UTTAR PRADESH" },
  { city: "KANPUR", count: 850, state: "UTTAR PRADESH" },
  { city: "NAGPUR", count: 950, state: "MAHARASHTRA" },
  { city: "INDORE", count: 900, state: "MADHYA PRADESH" },
  { city: "PATNA", count: 820, state: "BIHAR" },
  { city: "KOCHI", count: 780, state: "KERALA" },
  { city: "CHANDIGARH", count: 740, state: "CHANDIGARH" },
  { city: "VISAKHAPATNAM", count: 720, state: "ANDHRA PRADESH" },
  { city: "BHUBANESWAR", count: 690, state: "ODISHA" },
  { city: "GUWAHATI", count: 650, state: "ASSAM" },
];

/* =========================================================
   CITY COORDINATES
========================================================= */

const CITY_COORDINATES = {
  MUMBAI: [72.8777, 19.076],
  DELHI: [77.209, 28.6139],
  BENGALURU: [77.5946, 12.9716],
  HYDERABAD: [78.4867, 17.385],
  CHENNAI: [80.2707, 13.0827],
  KOLKATA: [88.3639, 22.5726],
  AHMEDABAD: [72.5714, 23.0225],
  PUNE: [73.8567, 18.5204],
  SURAT: [72.8311, 21.1702],
  JAIPUR: [75.7873, 26.9124],
  LUCKNOW: [80.9462, 26.8467],
  KANPUR: [80.3319, 26.4499],
  NAGPUR: [79.0882, 21.1458],
  INDORE: [75.8577, 22.7196],
  PATNA: [85.1376, 25.5941],
  KOCHI: [76.2673, 9.9312],
  CHANDIGARH: [76.7794, 30.7333],
  VISAKHAPATNAM: [83.2185, 17.6868],
  BHUBANESWAR: [85.8245, 20.2961],
  GUWAHATI: [91.7362, 26.1445],
};

/* =========================================================
   CITY FAMOUS PLACES
========================================================= */

const CITY_FAMOUS_PLACES = {
  MUMBAI: [
    { name: "GATEWAY OF INDIA", area: "COLABA", x: 72, y: 68 },
    { name: "MARINE DRIVE", area: "SOUTH MUMBAI", x: 40, y: 72 },
    { name: "CST", area: "FORT", x: 58, y: 42 },
    {
      name: "BANDRA-WORLI SEA LINK",
      area: "BANDRA",
      x: 28,
      y: 28,
    },
  ],

  DELHI: [
    { name: "INDIA GATE", area: "NEW DELHI", x: 62, y: 60 },
    { name: "RED FORT", area: "OLD DELHI", x: 73, y: 28 },
    { name: "QUTUB MINAR", area: "MEHRAULI", x: 35, y: 76 },
    { name: "LOTUS TEMPLE", area: "KALKAJI", x: 76, y: 78 },
  ],

  BENGALURU: [
    {
      name: "BANGALORE PALACE",
      area: "VASANTH NAGAR",
      x: 45,
      y: 28,
    },
    { name: "CUBBON PARK", area: "CENTRAL", x: 52, y: 50 },
    {
      name: "VIDHANA SOUDHA",
      area: "AMBEDKAR VEEDHI",
      x: 30,
      y: 44,
    },
    { name: "LALBAGH", area: "MAVALLI", x: 63, y: 76 },
  ],

  HYDERABAD: [
    { name: "CHARMINAR", area: "OLD CITY", x: 64, y: 68 },
    {
      name: "GOLCONDA FORT",
      area: "IBRAHIM BAGH",
      x: 28,
      y: 52,
    },
    {
      name: "HUSSAIN SAGAR",
      area: "TANK BUND",
      x: 54,
      y: 30,
    },
    {
      name: "SALAR JUNG MUSEUM",
      area: "DAR-UL-SHIFA",
      x: 76,
      y: 50,
    },
  ],

  CHENNAI: [
    {
      name: "MARINA BEACH",
      area: "TRIPLICANE",
      x: 76,
      y: 64,
    },
    {
      name: "KAPALEESHWARAR TEMPLE",
      area: "MYLAPORE",
      x: 54,
      y: 70,
    },
    {
      name: "FORT ST. GEORGE",
      area: "GEORGE TOWN",
      x: 64,
      y: 28,
    },
    {
      name: "SANTHOME BASILICA",
      area: "SANTHOME",
      x: 38,
      y: 58,
    },
  ],

  KOLKATA: [
    {
      name: "VICTORIA MEMORIAL",
      area: "MAIDAN",
      x: 44,
      y: 64,
    },
    {
      name: "HOWRAH BRIDGE",
      area: "HOWRAH",
      x: 28,
      y: 28,
    },
    {
      name: "INDIAN MUSEUM",
      area: "PARK STREET",
      x: 58,
      y: 46,
    },
    {
      name: "PARK STREET",
      area: "CENTRAL KOLKATA",
      x: 72,
      y: 72,
    },
  ],

  AHMEDABAD: [
    {
      name: "SABARMATI ASHRAM",
      area: "ASHRAM ROAD",
      x: 42,
      y: 28,
    },
    {
      name: "ADALAJ STEPWELL",
      area: "ADALAJ",
      x: 68,
      y: 22,
    },
    {
      name: "SIDI SAIYYED MOSQUE",
      area: "LAL DARWAJA",
      x: 56,
      y: 52,
    },
    {
      name: "KANKARIA LAKE",
      area: "MANINAGAR",
      x: 70,
      y: 76,
    },
  ],

  PUNE: [
    {
      name: "SHANIWAR WADA",
      area: "SHANIWAR PETH",
      x: 54,
      y: 42,
    },
    {
      name: "AGA KHAN PALACE",
      area: "KALYANI NAGAR",
      x: 76,
      y: 34,
    },
    {
      name: "SINHAGAD FORT",
      area: "SINHAGAD",
      x: 28,
      y: 76,
    },
    {
      name: "PATALESHWAR CAVE",
      area: "SHIVAJINAGAR",
      x: 36,
      y: 28,
    },
  ],

  SURAT: [
    {
      name: "DUMAS BEACH",
      area: "DUMAS",
      x: 28,
      y: 74,
    },
    {
      name: "DUTCH GARDEN",
      area: "NANPURA",
      x: 42,
      y: 52,
    },
    {
      name: "GOPI TALAV",
      area: "GOPIPURA",
      x: 66,
      y: 62,
    },
    {
      name: "SARTHANA NATURE PARK",
      area: "SARTHANA",
      x: 76,
      y: 28,
    },
  ],

  JAIPUR: [
    {
      name: "HAWA MAHAL",
      area: "BADI CHAUPAR",
      x: 62,
      y: 46,
    },
    {
      name: "AMBER FORT",
      area: "AMER",
      x: 58,
      y: 20,
    },
    {
      name: "CITY PALACE",
      area: "PINK CITY",
      x: 42,
      y: 52,
    },
    {
      name: "JAL MAHAL",
      area: "MAN SAGAR",
      x: 76,
      y: 34,
    },
  ],

  LUCKNOW: [
    {
      name: "BARA IMAMBARA",
      area: "HUSSAINABAD",
      x: 38,
      y: 42,
    },
    {
      name: "RUMI DARWAZA",
      area: "HUSSAINABAD",
      x: 58,
      y: 35,
    },
    {
      name: "THE RESIDENCY",
      area: "QAISER BAGH",
      x: 52,
      y: 62,
    },
    {
      name: "AMBEDKAR MEMORIAL",
      area: "GOMTI NAGAR",
      x: 76,
      y: 70,
    },
  ],

  KANPUR: [
    {
      name: "JK TEMPLE",
      area: "SARVODAYA NAGAR",
      x: 52,
      y: 38,
    },
    {
      name: "ALLEN FOREST ZOO",
      area: "NAWABGANJ",
      x: 30,
      y: 30,
    },
    {
      name: "MOTI JHEEL",
      area: "HARSH NAGAR",
      x: 66,
      y: 56,
    },
    {
      name: "MEMORIAL CHURCH",
      area: "CANTONMENT",
      x: 72,
      y: 76,
    },
  ],

  NAGPUR: [
    {
      name: "DEEKSHABHOOMI",
      area: "RAMDASPETH",
      x: 48,
      y: 62,
    },
    {
      name: "FUTALA LAKE",
      area: "VAYUSENA NAGAR",
      x: 28,
      y: 40,
    },
    {
      name: "ZERO MILE",
      area: "CIVIL LINES",
      x: 58,
      y: 36,
    },
    {
      name: "SEMINARY HILLS",
      area: "SEMINARY HILLS",
      x: 72,
      y: 24,
    },
  ],

  INDORE: [
    {
      name: "RAJWADA PALACE",
      area: "RAJWADA",
      x: 46,
      y: 52,
    },
    {
      name: "LAL BAGH PALACE",
      area: "LAL BAGH",
      x: 27,
      y: 32,
    },
    {
      name: "SARAFA BAZAAR",
      area: "CENTRAL INDORE",
      x: 62,
      y: 68,
    },
    {
      name: "KHAJRANA TEMPLE",
      area: "KHAJRANA",
      x: 78,
      y: 46,
    },
  ],

  PATNA: [
    {
      name: "GOLGHAR",
      area: "BANKIPORE",
      x: 45,
      y: 42,
    },
    {
      name: "BIHAR MUSEUM",
      area: "BAILEY ROAD",
      x: 32,
      y: 64,
    },
    {
      name: "TAKHT SRI PATNA SAHIB",
      area: "PATNA CITY",
      x: 78,
      y: 48,
    },
    {
      name: "GANDHI GHAT",
      area: "GANGA RIVERFRONT",
      x: 58,
      y: 24,
    },
  ],

  KOCHI: [
    {
      name: "FORT KOCHI",
      area: "FORT KOCHI",
      x: 30,
      y: 46,
    },
    {
      name: "CHINESE FISHING NETS",
      area: "FORT KOCHI",
      x: 34,
      y: 24,
    },
    {
      name: "MATTANCHERRY PALACE",
      area: "MATTANCHERRY",
      x: 56,
      y: 58,
    },
    {
      name: "MARINE DRIVE",
      area: "ERNAKULAM",
      x: 76,
      y: 38,
    },
  ],

  CHANDIGARH: [
    {
      name: "ROCK GARDEN",
      area: "SECTOR 1",
      x: 62,
      y: 26,
    },
    {
      name: "SUKHNA LAKE",
      area: "SECTOR 1",
      x: 78,
      y: 42,
    },
    {
      name: "CAPITOL COMPLEX",
      area: "SECTOR 1",
      x: 38,
      y: 22,
    },
    {
      name: "ROSE GARDEN",
      area: "SECTOR 16",
      x: 44,
      y: 70,
    },
  ],

  VISAKHAPATNAM: [
    {
      name: "RK BEACH",
      area: "MAHARANI PETA",
      x: 70,
      y: 58,
    },
    {
      name: "KAILASAGIRI",
      area: "HILL TOP ROAD",
      x: 48,
      y: 24,
    },
    {
      name: "INS KURSURA MUSEUM",
      area: "BEACH ROAD",
      x: 60,
      y: 44,
    },
    {
      name: "YARADA BEACH",
      area: "YARADA",
      x: 34,
      y: 78,
    },
  ],

  BHUBANESWAR: [
    {
      name: "LINGARAJ TEMPLE",
      area: "OLD TOWN",
      x: 46,
      y: 68,
    },
    {
      name: "UDAYAGIRI CAVES",
      area: "KHANDAGIRI",
      x: 26,
      y: 42,
    },
    {
      name: "DHAULI SHANTI STUPA",
      area: "DHAULI",
      x: 76,
      y: 72,
    },
    {
      name: "NANDANKANAN",
      area: "BARANG",
      x: 62,
      y: 22,
    },
  ],

  GUWAHATI: [
    {
      name: "KAMAKHYA TEMPLE",
      area: "NILACHAL HILL",
      x: 28,
      y: 42,
    },
    {
      name: "UMANANDA ISLAND",
      area: "BRAHMAPUTRA",
      x: 52,
      y: 34,
    },
    {
      name: "ASSAM STATE ZOO",
      area: "HENGRABARI",
      x: 72,
      y: 56,
    },
    {
      name: "BRAHMAPUTRA RIVERFRONT",
      area: "PAN BAZAR",
      x: 48,
      y: 76,
    },
  ],
};

/* =========================================================
   INDIA MAP
========================================================= */

const INDIA_GEOJSON_URL =
  "https://raw.githubusercontent.com/AbhinavSwami28/india-official-geojson/main/india-states-simplified.geojson";

const MAP_WIDTH = 430;
const MAP_HEIGHT = 430;

const INDIA_BOUNDS = {
  minLon: 68,
  maxLon: 98,
  minLat: 6,
  maxLat: 38,
};

function projectCoordinate(coordinates) {
  const [longitude, latitude] = coordinates;

  const paddingX = 28;
  const paddingY = 12;

  const usableWidth = MAP_WIDTH - paddingX * 2;

  const usableHeight = MAP_HEIGHT - paddingY * 2;

  const x =
    paddingX +
    ((longitude - INDIA_BOUNDS.minLon) /
      (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon)) *
      usableWidth;

  const y =
    paddingY +
    ((INDIA_BOUNDS.maxLat - latitude) /
      (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) *
      usableHeight;

  return [x, y];
}

function ringToPath(ring) {
  if (!Array.isArray(ring) || ring.length === 0) {
    return "";
  }

  const result = ring
    .map((coordinate, index) => {
      const [x, y] = projectCoordinate(coordinate);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return `${result} Z`;
}

function geometryToPath(geometry) {
  if (!geometry) {
    return "";
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringToPath(ring)).join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((polygon) => polygon.map((ring) => ringToPath(ring)).join(" "))
      .join(" ");
  }

  return "";
}

/* =========================================================
   COMMUNITY COUNTER HELPERS
========================================================= */

function getDailyIncrement(city, dayNumber) {
  const text = `${city}-${dayNumber}`;

  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }

  return 3 + (Math.abs(hash) % 6);
}

function getDefaultCounts() {
  const result = {};

  communityCounters.forEach((city) => {
    result[city.city] = city.count;
  });

  return result;
}

function getUpdatedCounterData() {
  const now = Date.now();

  let savedData = null;

  try {
    const stored = localStorage.getItem(CITY_COUNTER_KEY);

    if (stored) {
      savedData = JSON.parse(stored);
    }
  } catch (error) {
    console.error("Counter error:", error);
  }

  if (!savedData || !savedData.counts || !savedData.lastUpdated) {
    const firstData = {
      counts: getDefaultCounts(),

      lastUpdated: now,
    };

    try {
      localStorage.setItem(CITY_COUNTER_KEY, JSON.stringify(firstData));
    } catch (error) {
      console.error("Unable to save city counter:", error);
    }

    return firstData;
  }

  const difference = now - Number(savedData.lastUpdated);

  const daysPassed = Math.floor(difference / ONE_DAY);

  if (daysPassed <= 0) {
    return savedData;
  }

  const newCounts = {
    ...savedData.counts,
  };

  for (let day = 1; day <= daysPassed; day += 1) {
    const dayTime = Number(savedData.lastUpdated) + day * ONE_DAY;

    const dayNumber = Math.floor(dayTime / ONE_DAY);

    communityCounters.forEach((city) => {
      const current = Number(newCounts[city.city]) || city.count;

      const increase = getDailyIncrement(city.city, dayNumber);

      newCounts[city.city] = current + increase;
    });
  }

  const updatedData = {
    counts: newCounts,

    lastUpdated: Number(savedData.lastUpdated) + daysPassed * ONE_DAY,
  };

  try {
    localStorage.setItem(CITY_COUNTER_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error("Unable to update city counter:", error);
  }

  return updatedData;
}

/* =========================================================
   API BASE
========================================================= */

function getApiBase() {
  if (import.meta.env.DEV) {
    return "";
  }

  return String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
    .trim()
    .replace(/\/$/, "");
}

/* =========================================================
   HELPERS
========================================================= */

function safeText(value) {
  return String(value || "").toLowerCase();
}

/* =========================================================
   PLAN NORMALIZER
========================================================= */

function normalizePlan(value) {
  const plan = safeText(value).trim();

  if (
    plan === "gold" ||
    plan === "verified" ||
    plan === "spotlight" ||
    plan.includes("gold") ||
    plan.includes("verified") ||
    plan.includes("spotlight")
  ) {
    return "verified";
  }

  if (
    plan === "silver" ||
    plan === "pro" ||
    plan.includes("silver") ||
    plan.includes("pro")
  ) {
    return "pro";
  }

  return "basic";
}

/* =========================================================
   PLAN PRIORITY
========================================================= */

function getPlanPriority(artist) {
  const plan = normalizePlan(artist?.plan);

  if (plan === "verified") {
    return 1;
  }

  if (plan === "pro") {
    return 2;
  }

  return 3;
}

/* =========================================================
   DEFAULT PUBLIC LOCKS
========================================================= */

function getDefaultLocked(plan) {
  const normalized = normalizePlan(plan);

  return {
    city: normalized === "basic",

    profileImage: normalized === "basic",

    phone: normalized === "basic",

    email: normalized !== "verified",

    studio: normalized !== "verified",

    experience: normalized !== "verified",

    instagram: normalized !== "verified",

    bio: normalized !== "verified",

    portfolioImages: normalized !== "verified",
  };
}

/* =========================================================
   NORMALIZE ARTIST
========================================================= */

function normalizeArtist(source = {}) {
  const plan = normalizePlan(source.plan);

  return {
    ...source,

    id: source._id || source.id || source.profileId || "",

    plan,

    name:
      source.name ||
      source.professionalName ||
      source.artistName ||
      "Tattoo Artist",

    state: source.state || "",

    city: source.city || "",

    profileImage: source.profileImage || "",

    phone: source.phone || "",

    email: source.email || "",

    studio: source.studio || source.studioName || "",

    experience: source.experience || "",

    instagram: source.instagram || "",

    bio: source.bio || "",

    portfolioImages: Array.isArray(source.portfolioImages)
      ? source.portfolioImages.slice(0, 3)
      : [],

    locked: {
      ...getDefaultLocked(plan),

      ...(source.locked || {}),
    },

    claimed: Boolean(
      source.claimed || source.phoneVerified || source.updatedByOwner,
    ),

    verified: plan === "verified" && Boolean(source.verified),

    spotlight: plan === "verified" && Boolean(source.spotlight),

    hallOfFameEligible:
      plan === "verified" && Boolean(source.hallOfFameEligible),

    planStartedAt: source.planStartedAt || null,

    planExpiresAt: source.planExpiresAt || null,

    updatedAt: source.updatedAt || source.createdAt || "",

    createdAt: source.createdAt || "",
  };
}

/* =========================================================
   SORT ARTISTS
========================================================= */

function sortArtists(artists) {
  return [...artists].sort((a, b) => {
    const priorityDifference = getPlanPriority(a) - getPlanPriority(b);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;

    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

/* =========================================================
   FORMAT EXPIRY
========================================================= */

function formatExpiry(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Artists() {
  const location = useLocation();

  const [selectedCity, setSelectedCity] = React.useState("ALL");

  const [searchQuery, setSearchQuery] = React.useState("");

  const [directoryCities, setDirectoryCities] = React.useState([]);

  const [artists, setArtists] = React.useState([]);

  const [directoryTotal, setDirectoryTotal] = React.useState(0);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState("");

  const [selectedArtist, setSelectedArtist] = React.useState(null);

  const [page, setPage] = React.useState(0);

  const artistSectionRef = React.useRef(null);

  const artistGridRef = React.useRef(null);

  /* =======================================================
     LOAD REAL CITIES
  ======================================================= */

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadCities() {
      try {
        const response = await fetch(
          `${getApiBase()}/api/admin/tattoo-studios/filters`,
          {
            signal: controller.signal,

            credentials: "include",

            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`City filters HTTP ${response.status}`);
        }

        const data = await response.json();

        const cities = Array.isArray(data?.filters?.cities)
          ? data.filters.cities
          : [];

        const uniqueCities = Array.from(
          new Set(
            cities
              .map((city) =>
                String(city || "")
                  .trim()
                  .toUpperCase(),
              )
              .filter(Boolean),
          ),
        ).sort((a, b) => a.localeCompare(b));

        setDirectoryCities(uniqueCities);
      } catch (requestError) {
        if (requestError?.name === "AbortError") {
          return;
        }

        console.error("❌ City filter error:", requestError);

        setDirectoryCities([]);
      }
    }

    void loadCities();

    return () => {
      controller.abort();
    };
  }, []);

  /* =======================================================
     LOAD REAL ARTISTS
  ======================================================= */

  React.useEffect(() => {
    const controller = new AbortController();

    let cancelled = false;

    async function loadArtists() {
      setLoading(true);
      setError("");

      const allResults = [];

      const limit = 1000;

      let currentPage = 1;

      let totalPages = 1;

      let backendTotal = 0;

      try {
        do {
          const params = new URLSearchParams({
            page: String(currentPage),

            limit: String(limit),
          });

          if (selectedCity !== "ALL") {
            // Selected city = Gold + Silver + Free from that city
            params.set("city", selectedCity);
          }

          const response = await fetch(
            `${getApiBase()}/api/admin/tattoo-studios?${params.toString()}`,
            {
              signal: controller.signal,

              credentials: "include",

              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`Artist directory HTTP ${response.status}`);
          }

          const data = await response.json();

          const currentResults = Array.isArray(data?.artists)
            ? data.artists
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.users)
                ? data.users
                : [];

          allResults.push(...currentResults);

          backendTotal = Math.max(
            backendTotal,
            Number(data?.pagination?.total || data?.total || allResults.length),
          );

          totalPages = Math.max(1, Number(data?.pagination?.totalPages || 1));

          currentPage += 1;
        } while (
          currentPage <= totalPages &&
          !cancelled &&
          !controller.signal.aborted
        );

        if (cancelled || controller.signal.aborted) {
          return;
        }

        const normalized = allResults.map(normalizeArtist);

        setArtists(sortArtists(normalized));

        setDirectoryTotal(Math.max(backendTotal, normalized.length));
      } catch (requestError) {
        if (requestError?.name === "AbortError") {
          return;
        }

        console.error("❌ Artist directory error:", requestError);

        if (!cancelled) {
          setArtists([]);

          setDirectoryTotal(0);

          setError("Unable to load artists. Please try again.");
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadArtists();

    const handleFocus = () => {
      if (!cancelled && !controller.signal.aborted) {
        void loadArtists();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;

      controller.abort();

      window.removeEventListener("focus", handleFocus);
    };
  }, [selectedCity, location.state?.refreshDirectory]);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  React.useEffect(() => {
    if (!location.state?.newArtistId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      artistSectionRef.current?.scrollIntoView({
        behavior: "smooth",

        block: "start",
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [location.state]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredArtists = React.useMemo(() => {
    const query = safeText(searchQuery).trim();

    if (!query) {
      return sortArtists(artists);
    }

    const results = artists.filter((artist) => {
      const plan = normalizePlan(artist.plan);

      const publicValues = [artist.name, artist.state];

      if (plan === "pro" || plan === "verified") {
        publicValues.push(artist.city, artist.phone);
      }

      if (plan === "verified") {
        publicValues.push(
          artist.email,
          artist.studio,
          artist.experience,
          artist.instagram,
          artist.bio,
        );
      }

      return publicValues.some((value) => safeText(value).includes(query));
    });

    return sortArtists(results);
  }, [artists, searchQuery]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalArtistPages = Math.max(
    1,
    Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE),
  );

  const safeArtistPage = Math.min(page, totalArtistPages - 1);

  const artistPageStart = safeArtistPage * ARTISTS_PER_PAGE;

  const visibleArtists = filteredArtists.slice(
    artistPageStart,
    artistPageStart + ARTISTS_PER_PAGE,
  );

  const firstVisibleArtistNumber =
    filteredArtists.length === 0 ? 0 : artistPageStart + 1;

  const lastVisibleArtistNumber = Math.min(
    artistPageStart + ARTISTS_PER_PAGE,
    filteredArtists.length,
  );

  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedCity]);

  React.useEffect(() => {
    if (totalArtistPages <= 1 || selectedArtist) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % totalArtistPages);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [totalArtistPages, selectedArtist]);

  React.useEffect(() => {
    if (!artistGridRef.current || visibleArtists.length === 0) {
      return undefined;
    }

    const rows = Array.from(artistGridRef.current.children);

    const tween = gsap.fromTo(
      rows,
      {
        opacity: 0,
        y: 14,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.022,
        ease: "power3.out",
      },
    );

    return () => tween.kill();
  }, [safeArtistPage, selectedCity, searchQuery, visibleArtists.length]);

  React.useEffect(() => {
    if (!selectedArtist) {
      document.body.style.overflow = "";

      return undefined;
    }

    document.body.style.overflow = "hidden";

    const closeWithEsc = (event) => {
      if (event.key === "Escape") {
        setSelectedArtist(null);
      }
    };

    window.addEventListener("keydown", closeWithEsc);

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener("keydown", closeWithEsc);
    };
  }, [selectedArtist]);

  const cityOptions = ["ALL", ...directoryCities];

  const quickCityOptions = [
    "ALL",
    "MUMBAI",
    "DELHI",
    "PUNE",
    "BENGALURU",
    "HYDERABAD",
    "CHENNAI",
    "KOLKATA",
    "AHMEDABAD",
    "JAIPUR",
  ];

  return (
    <>
      <style>{`
        @keyframes inkSilverSweep {
          0% {
            transform: translateX(-190%) skewX(-18deg);
            opacity: 0;
          }
          10% { opacity: .8; }
          46% { opacity: .35; }
          60%, 100% {
            transform: translateX(430%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes inkGoldSweep {
          0% {
            transform: translateX(-190%) skewX(-18deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          46% { opacity: .5; }
          60%, 100% {
            transform: translateX(430%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes inkGoldPulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(245,196,81,.22);
          }
          50% {
            box-shadow: 0 0 34px rgba(245,196,81,.50);
          }
        }

        @keyframes inkSilverPulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(226,232,240,.12);
          }
          50% {
            box-shadow: 0 0 28px rgba(226,232,240,.32);
          }
        }

        .ink-silver-shine {
          animation: inkSilverSweep 3.4s ease-in-out infinite;
        }

        .ink-gold-shine {
          animation: inkGoldSweep 2.9s ease-in-out infinite;
        }

        .ink-gold-card-pulse {
          animation: inkGoldPulse 2.8s ease-in-out infinite;
        }

        .ink-silver-card-pulse {
          animation: inkSilverPulse 3.4s ease-in-out infinite;
        }
      `}</style>

      <main
        className="
          min-h-screen
          overflow-x-hidden
          bg-[#08080a]
          text-white
          pt-32
          pb-24
          px-4
          sm:px-6
          lg:px-10
        "
      >
        <div
          className="
            max-w-[1700px]
            mx-auto
            space-y-12
          "
        >
          {/* HERO */}

          <section
            className="
              grid
              grid-cols-1
              xl:grid-cols-[minmax(0,0.78fr)_minmax(580px,1.22fr)]
              gap-10
              xl:gap-16
              items-center
              border-b
              border-white/10
              pb-12
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-purple-400
                  text-[10px]
                  font-mono
                  tracking-[0.2em]
                "
              >
                <Sparkles size={13} />
                INDIA TATTOO DIRECTORY
              </div>

              <h1
                className="
                  mt-5
                  text-[clamp(3.8rem,8vw,7.4rem)]
                  leading-[0.82]
                  font-black
                  uppercase
                  tracking-[-0.065em]
                "
              >
                FIND YOUR
                <br />
                <span
                  className="
                    text-purple-500
                  "
                >
                  ARTIST.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-sm
                  sm:text-base
                  leading-relaxed
                  text-gray-500
                "
              >
                Real artists from your MongoDB directory. Select a city and the
                order stays Gold first, Silver second and Free after them.
              </p>

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  sm:flex-row
                  gap-3
                "
              >
                <Link
                  to="/book-artist"
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    px-6
                    py-4
                    rounded-xl
                    bg-purple-600
                    hover:bg-purple-500
                    border
                    border-purple-400/40
                    text-[9px]
                    font-black
                    tracking-[0.13em]
                    transition
                  "
                >
                  <Sparkles size={14} />
                  BOOK YOUR ARTIST
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/Enter"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    px-6
                    py-4
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.035]
                    hover:bg-white/[0.07]
                    text-[9px]
                    font-black
                    tracking-[0.13em]
                  "
                >
                  FIND / UPDATE YOUR PROFILE
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* =================================================
                THIS IS THE ONLY TOP-RIGHT CHANGE
                OLD COUNTERS REMOVED
                MAP ADDED
            ================================================= */}

            <CommunityMapPanel />
          </section>

          {/* FILTERS */}

          <section
            className="
              rounded-[24px]
              border
              border-white/10
              bg-[#0d0d11]
              p-4
              sm:p-5
            "
          >
            <div
              className="
                grid
                grid-cols-1
                lg:grid-cols-[minmax(0,1fr)_320px]
                gap-3
              "
            >
              <div
                className="
                  relative
                "
              >
                <Search
                  size={16}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-600
                  "
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="SEARCH PUBLIC ARTIST DETAILS..."
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-black/40
                    py-4
                    pl-11
                    pr-4
                    text-xs
                    text-white
                    outline-none
                    placeholder:text-gray-700
                    focus:border-purple-500
                  "
                />
              </div>

              <div
                className="
                  relative
                "
              >
                <MapPin
                  size={15}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-purple-400
                  "
                />

                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-white/10
                    bg-black/40
                    py-4
                    pl-11
                    pr-4
                    text-[10px]
                    font-black
                    tracking-widest
                    text-white
                    outline-none
                    focus:border-purple-500
                  "
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city === "ALL" ? "ALL CITIES" : city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              {quickCityOptions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`
                      shrink-0
                      rounded-full
                      border
                      px-4
                      py-2
                      text-[8px]
                      font-black
                      tracking-widest
                      transition

                      ${
                        selectedCity === city
                          ? `
                            border-purple-400
                            bg-purple-500/15
                            text-purple-300
                          `
                          : `
                            border-white/10
                            bg-white/[0.02]
                            text-gray-600
                            hover:text-white
                          `
                      }
                    `}
                >
                  {city}
                </button>
              ))}
            </div>
          </section>

          {/* DIRECTORY */}

          <section
            ref={artistSectionRef}
            className="
              scroll-mt-32
            "
          >
            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-end
                justify-between
                gap-5
                mb-8
              "
            >
              <div>
                <p
                  className="
                    text-purple-400
                    text-[9px]
                    font-mono
                    tracking-widest
                    mb-2
                  "
                >
                  TATTOO DIRECTORY
                </p>

                <h2
                  className="
                    text-3xl
                    sm:text-5xl
                    font-black
                    uppercase
                  "
                >
                  {searchQuery
                    ? "SEARCH RESULTS"
                    : selectedCity !== "ALL"
                      ? `${selectedCity} ARTISTS`
                      : "DISCOVER ARTISTS"}
                </h2>

                <p
                  className="
                    mt-3
                    text-xs
                    text-gray-600
                  "
                >
                  {selectedCity === "ALL"
                    ? "All directory profiles are shown with Gold → Silver → Free priority."
                    : `All ${selectedCity} profiles are shown with Gold → Silver → Free priority.`}
                </p>
              </div>

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    sm:items-end
                    gap-1.5
                  "
                >
                  <span
                    className="
                      text-[9px]
                      font-mono
                      text-gray-600
                    "
                  >
                    {loading
                      ? "LOADING..."
                      : `${filteredArtists.length} ARTISTS`}
                  </span>

                  {filteredArtists.length > ARTISTS_PER_PAGE && (
                    <span
                      className="
                        text-[8px]
                        font-mono
                        text-purple-400
                      "
                    >
                      SHOWING {firstVisibleArtistNumber}-
                      {lastVisibleArtistNumber} / PAGE {safeArtistPage + 1} OF{" "}
                      {totalArtistPages} / AUTO 4S
                    </span>
                  )}
                </div>

                <Link
                  to="/book-artist"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    px-6
                    py-3.5
                    rounded-xl
                    bg-purple-600
                    hover:bg-purple-500
                    text-[9px]
                    font-black
                    tracking-widest
                  "
                >
                  <Sparkles size={14} />
                  BOOK YOUR ARTIST
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {error && (
              <div
                className="
                  mb-6
                  rounded-xl
                  border
                  border-red-500/25
                  bg-red-500/[0.06]
                  p-4
                  text-sm
                  text-red-400
                "
              >
                {error}
              </div>
            )}

            {loading ? (
              <DirectoryLoader />
            ) : filteredArtists.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div
                  className="
                    w-full
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-white/10
                    bg-[#0d0d11]
                  "
                >
                  <div
                    className="
                      grid
                      grid-cols-[48px_minmax(0,1fr)_78px_82px]
                      md:grid-cols-[56px_minmax(0,1.65fr)_minmax(115px,1.15fr)_84px_88px]
                      xl:grid-cols-[60px_minmax(0,2fr)_minmax(0,1.45fr)_minmax(88px,0.9fr)_minmax(0,1.35fr)_88px_96px]
                      items-center
                      gap-2
                      md:gap-3
                      px-3
                      sm:px-4
                      lg:px-5
                      py-4
                      border-b
                      border-white/10
                      bg-black/30
                      text-[7px]
                      sm:text-[8px]
                      font-mono
                      font-black
                      tracking-[0.12em]
                      uppercase
                      text-gray-600
                    "
                  >
                    <span
                      className="
                        text-center
                      "
                    >
                      Profile
                    </span>

                    <span>Artist / Studio</span>

                    <span
                      className="
                        hidden
                        md:block
                      "
                    >
                      Location
                    </span>

                    <span
                      className="
                        hidden
                        xl:block
                      "
                    >
                      Phone
                    </span>

                    <span
                      className="
                        hidden
                        xl:block
                      "
                    >
                      Email
                    </span>

                    <span
                      className="
                        text-center
                      "
                    >
                      Book Artist
                    </span>

                    <span
                      className="
                        text-center
                      "
                    >
                      Action
                    </span>
                  </div>

                  <div ref={artistGridRef}>
                    {visibleArtists.map((artist, index) => {
                      const globalIndex = artistPageStart + index;

                      return (
                        <ArtistRow
                          key={artist.id || `${artist.name}-${globalIndex}`}
                          artist={artist}
                          index={globalIndex}
                          isNew={
                            String(location.state?.newArtistId || "") ===
                            String(artist.id || "")
                          }
                          onClick={() => setSelectedArtist(artist)}
                        />
                      );
                    })}
                  </div>
                </div>

                {totalArtistPages > 1 && (
                  <Pagination
                    page={safeArtistPage}
                    totalPages={totalArtistPages}
                    onPrevious={() =>
                      setPage((current) => Math.max(0, current - 1))
                    }
                    onNext={() =>
                      setPage((current) =>
                        Math.min(totalArtistPages - 1, current + 1),
                      )
                    }
                  />
                )}
              </>
            )}
          </section>
        </div>

        {selectedArtist && (
          <ArtistModal
            artist={selectedArtist}
            selectedCity={selectedCity}
            onClose={() => setSelectedArtist(null)}
          />
        )}
      </main>
    </>
  );
}

/* =========================================================
   COMMUNITY MAP PANEL
========================================================= */

function CommunityMapPanel() {
  const [counterIndex, setCounterIndex] = React.useState(0);

  const [dayIndex, setDayIndex] = React.useState(INITIAL_DAY_INDEX);

  const [cityCounts, setCityCounts] = React.useState(
    () => getUpdatedCounterData().counts,
  );

  React.useEffect(() => {
    const checkCounter = () => {
      const data = getUpdatedCounterData();

      setCityCounts(data.counts);

      setDayIndex(Math.floor(Date.now() / ONE_DAY));
    };

    const interval = window.setInterval(checkCounter, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setCounterIndex((previous) => (previous + 1) % communityCounters.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  const currentCounter = communityCounters[counterIndex];

  const currentCount = cityCounts[currentCounter.city] ?? currentCounter.count;

  const todayIncrement = getDailyIncrement(currentCounter.city, dayIndex);

  return (
    <CommunityMapBox
      currentCounter={currentCounter}
      currentCount={currentCount}
      todayIncrement={todayIncrement}
      cityCounts={cityCounts}
    />
  );
}

/* =========================================================
   COMMUNITY MAP
========================================================= */

function CommunityMapBox({
  currentCounter,
  currentCount,
  todayIncrement,
  cityCounts,
}) {
  const [mapFeatures, setMapFeatures] = React.useState([]);

  const [mapError, setMapError] = React.useState(false);

  const [exploredCity, setExploredCity] = React.useState(null);

  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const [featuredImage, setFeaturedImage] = React.useState("");

  const [featuredImageLoading, setFeaturedImageLoading] = React.useState(false);

  const contentRef = React.useRef(null);

  const numberRef = React.useRef(null);

  const glowRef = React.useRef(null);

  const baseViewRef = React.useRef(null);

  const indiaSceneRef = React.useRef(null);

  const cityOverlayRef = React.useRef(null);

  const cityContentRef = React.useRef(null);

  const transitionFxRef = React.useRef(null);

  const exploredCityData = React.useMemo(
    () =>
      communityCounters.find((city) => city.city === exploredCity) ||
      currentCounter,
    [exploredCity, currentCounter],
  );

  const featuredPlace = CITY_FAMOUS_PLACES[exploredCityData?.city]?.[0] || {
    name: `${exploredCityData?.city || "CITY"} LANDMARK`,

    area: exploredCityData?.state || "INDIA",

    x: 50,
    y: 50,
  };

  const exploredCount =
    cityCounts?.[exploredCityData?.city] ??
    exploredCityData?.count ??
    currentCount;

  /* LOAD FAMOUS PLACE IMAGE */

  React.useEffect(() => {
    if (!exploredCity) {
      return undefined;
    }

    const controller = new AbortController();

    const loadPlaceImage = async () => {
      try {
        const searchText = `${featuredPlace.name} ${exploredCityData.city} India`;

        const url =
          "https://en.wikipedia.org/w/api.php" +
          `?action=query&generator=search&gsrsearch=${encodeURIComponent(
            searchText,
          )}` +
          "&gsrlimit=5&prop=pageimages&piprop=thumbnail%7Coriginal" +
          "&pithumbsize=1400&format=json&origin=*";

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Place image HTTP ${response.status}`);
        }

        const data = await response.json();

        const pages = Object.values(data?.query?.pages || {});

        const pageWithImage =
          pages.find((page) => page?.original?.source) ||
          pages.find((page) => page?.thumbnail?.source);

        const imageSource =
          pageWithImage?.original?.source ||
          pageWithImage?.thumbnail?.source ||
          "";

        if (!controller.signal.aborted) {
          setFeaturedImage(imageSource);
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Featured place image error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setFeaturedImageLoading(false);
        }
      }
    };

    void loadPlaceImage();

    return () => {
      controller.abort();
    };
  }, [exploredCity, exploredCityData.city, featuredPlace.name]);

  /* LOAD INDIA MAP */

  React.useEffect(() => {
    let cancelled = false;

    fetch(INDIA_GEOJSON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Map HTTP ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (!Array.isArray(data.features)) {
          throw new Error("Invalid map data");
        }

        setMapFeatures(data.features);

        setMapError(false);
      })
      .catch((error) => {
        console.error("India map error:", error);

        if (!cancelled) {
          setMapError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!contentRef.current || exploredCity) {
      return undefined;
    }

    const tween = gsap.fromTo(
      contentRef.current,
      {
        opacity: 0,
        y: 14,
        filter: "blur(3px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power3.out",
      },
    );

    return () => tween.kill();
  }, [currentCounter.city, exploredCity]);

  React.useEffect(() => {
    if (!numberRef.current || exploredCity) {
      return undefined;
    }

    const tween = gsap.fromTo(
      numberRef.current,
      {
        opacity: 0,
        scale: 0.86,
        y: 8,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.55,
        ease: "back.out(1.5)",
      },
    );

    return () => tween.kill();
  }, [currentCounter.city, currentCount, exploredCity]);

  React.useEffect(() => {
    if (!glowRef.current) {
      return undefined;
    }

    const tween = gsap.to(glowRef.current, {
      scale: 1.12,
      opacity: 0.65,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => tween.kill();
  }, []);

  const openCurrentCity = () => {
    if (isTransitioning || exploredCity) {
      return;
    }

    const city = currentCounter.city;

    setFeaturedImage("");

    setFeaturedImageLoading(true);

    if (CITY_COORDINATES[city]) {
      setIsTransitioning(true);
    }

    setExploredCity(city);
  };

  React.useEffect(() => {
    if (!exploredCity) {
      return undefined;
    }

    if (
      !baseViewRef.current ||
      !indiaSceneRef.current ||
      !cityOverlayRef.current
    ) {
      return undefined;
    }

    const coordinates = CITY_COORDINATES[exploredCity];

    if (!coordinates) {
      gsap.set(cityOverlayRef.current, {
        opacity: 1,
        scale: 1,
        clipPath: "circle(150% at 50% 50%)",
      });

      return undefined;
    }

    const [x, y] = projectCoordinate(coordinates);

    const originX = (x / MAP_WIDTH) * 100;

    const originY = (y / MAP_HEIGHT) * 100;

    gsap.set(indiaSceneRef.current, {
      opacity: 1,
      scale: 1,
      transformOrigin: `${originX}% ${originY}%`,
    });

    gsap.set(cityOverlayRef.current, {
      opacity: 0,
      scale: 1.12,
      filter: "blur(10px)",
      clipPath: `circle(0% at ${originX}% ${originY}%)`,
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(baseViewRef.current, {
          opacity: 0,
        });

        gsap.set(cityOverlayRef.current, {
          opacity: 1,

          scale: 1,

          filter: "blur(0px)",

          clipPath: "circle(150% at 50% 50%)",
        });

        setIsTransitioning(false);
      },
    });

    timeline.to(
      indiaSceneRef.current,
      {
        scale: 2.25,
        duration: 0.34,
        ease: "power2.in",
      },
      0,
    );

    timeline.to(
      indiaSceneRef.current,
      {
        scale: 11.5,
        filter: "blur(3px) brightness(0.5)",
        duration: 0.78,
        ease: "power4.inOut",
      },
      0.28,
    );

    timeline.to(
      cityOverlayRef.current,
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        clipPath: "circle(150% at 50% 50%)",
        duration: 0.72,
        ease: "power4.out",
      },
      0.82,
    );

    return () => timeline.kill();
  }, [exploredCity]);

  const closeCity = () => {
    if (
      !exploredCity ||
      isTransitioning ||
      !baseViewRef.current ||
      !indiaSceneRef.current ||
      !cityOverlayRef.current
    ) {
      return;
    }

    setIsTransitioning(true);

    const coordinates = CITY_COORDINATES[exploredCity];

    const [x, y] = coordinates
      ? projectCoordinate(coordinates)
      : [MAP_WIDTH / 2, MAP_HEIGHT / 2];

    const originX = (x / MAP_WIDTH) * 100;

    const originY = (y / MAP_HEIGHT) * 100;

    gsap.set(baseViewRef.current, {
      opacity: 1,
    });

    gsap.set(indiaSceneRef.current, {
      opacity: 1,
      scale: 11.5,
      transformOrigin: `${originX}% ${originY}%`,
      filter: "blur(4px) brightness(0.55)",
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(indiaSceneRef.current, {
          clearProps: "transform,transformOrigin,filter,opacity",
        });

        setFeaturedImage("");

        setFeaturedImageLoading(false);

        setExploredCity(null);

        setIsTransitioning(false);
      },
    });

    timeline.to(cityOverlayRef.current, {
      opacity: 0,
      scale: 1.16,
      filter: "blur(12px)",
      clipPath: `circle(0% at ${originX}% ${originY}%)`,
      duration: 0.48,
      ease: "power3.in",
    });

    timeline
      .to(
        indiaSceneRef.current,
        {
          scale: 3.2,
          duration: 0.36,
          ease: "power3.out",
        },
        0.28,
      )
      .to(
        indiaSceneRef.current,
        {
          scale: 1,
          filter: "blur(0px)",
          duration: 0.62,
          ease: "power4.out",
        },
        0.58,
      );
  };

  return (
    <div
      className="
        relative
        w-full
        min-w-0
      "
    >
      <div
        ref={glowRef}
        className="
          pointer-events-none
          absolute
          right-[5%]
          top-[15%]
          w-[320px]
          h-[320px]
          rounded-full
          bg-purple-600/[0.10]
          blur-[110px]
        "
      />

      <div
        className="
          relative
          w-full
          min-h-[440px]
          overflow-hidden
          bg-[#0b0b0f]
          border
          border-white/10
          rounded-[28px]
        "
      >
        <div
          ref={baseViewRef}
          className="
            relative
            z-10
            min-h-[440px]
            p-5
            sm:p-7
          "
        >
          <div
            className="
              relative
              z-30
              flex
              items-center
              justify-between
              gap-4
              pb-5
              border-b
              border-white/[0.07]
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-purple-400
                text-[9px]
                font-mono
                tracking-[0.15em]
              "
            >
              <Users size={13} />
              OUR COMMUNITY
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                text-[8px]
                font-mono
                text-gray-600
              "
            >
              <span
                className="
                  relative
                  flex
                  w-2
                  h-2
                "
              >
                <span
                  className="
                    absolute
                    w-full
                    h-full
                    rounded-full
                    bg-purple-400
                    animate-ping
                    opacity-70
                  "
                />

                <span
                  className="
                    relative
                    w-2
                    h-2
                    rounded-full
                    bg-purple-500
                  "
                />
              </span>
              LIVE
            </div>
          </div>

          <div
            className="
              relative
              z-10
              grid
              grid-cols-1
              md:grid-cols-[0.72fr_1.28fr]
              gap-4
              md:gap-6
              items-center
              min-h-[320px]
            "
          >
            <div
              ref={contentRef}
              className="
                relative
                z-20
                min-w-0
                py-6
                md:py-0
              "
            >
              <p
                className="
                  text-[8px]
                  sm:text-[9px]
                  font-mono
                  tracking-[0.22em]
                  text-gray-600
                  uppercase
                  mb-4
                "
              >
                OUR COMMUNITY IN
              </p>

              <h2
                className="
                  text-[clamp(2rem,4vw,3.7rem)]
                  font-black
                  uppercase
                  tracking-[-0.06em]
                  leading-[0.88]
                "
              >
                {currentCounter.city}
              </h2>

              <span
                ref={numberRef}
                className="
                  block
                  mt-5
                  text-[clamp(3rem,6vw,5rem)]
                  font-black
                  text-purple-500
                  tracking-[-0.075em]
                  leading-[0.8]
                "
              >
                {currentCount}+
              </span>

              <div
                className="
                  mt-7
                  flex
                  items-center
                  gap-2
                  text-[8px]
                  font-mono
                  text-gray-500
                "
              >
                <MapPinned
                  size={13}
                  className="
                    text-purple-500
                  "
                />

                {currentCounter.state}
              </div>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    rounded-full
                    border
                    border-purple-500/20
                    bg-purple-500/[0.05]
                  "
                >
                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-purple-500
                      animate-pulse
                    "
                  />

                  <span
                    className="
                      text-[7px]
                      font-mono
                      tracking-[0.16em]
                      text-purple-400
                    "
                  >
                    ACTIVE CITY
                  </span>
                </div>

                <button
                  type="button"
                  onClick={openCurrentCity}
                  disabled={isTransitioning || Boolean(exploredCity)}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    bg-white
                    text-black
                    hover:bg-purple-500
                    hover:text-white
                    disabled:opacity-50
                    text-[7px]
                    font-black
                  "
                >
                  {isTransitioning ? "ENTERING..." : "MORE"}

                  <ArrowRight size={11} />
                </button>
              </div>
            </div>

            <div
              ref={indiaSceneRef}
              className="
                relative
                w-full
                min-h-[310px]
                flex
                items-center
                justify-center
              "
            >
              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                className="
                  relative
                  z-10
                  w-full
                  max-w-[430px]
                  h-auto
                "
              >
                <g>
                  {mapFeatures.map((feature, index) => (
                    <path
                      key={
                        feature.properties?.name ||
                        feature.properties?.NAME_1 ||
                        index
                      }
                      d={geometryToPath(feature.geometry)}
                      fill="rgba(255,255,255,0.006)"
                      stroke="rgba(255,255,255,0.50)"
                      strokeWidth="0.65"
                      fillRule="evenodd"
                    />
                  ))}
                </g>

                <g>
                  {communityCounters.map((city) => {
                    const coordinates = CITY_COORDINATES[city.city];

                    if (!coordinates) {
                      return null;
                    }

                    const [x, y] = projectCoordinate(coordinates);

                    const isActive = currentCounter.city === city.city;

                    return (
                      <g key={city.city}>
                        {isActive && (
                          <circle
                            cx={x}
                            cy={y}
                            r="10"
                            fill="none"
                            stroke="#a855f7"
                          >
                            <animate
                              attributeName="r"
                              values="6;18;6"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}

                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 4.5 : 2.8}
                          fill={isActive ? "#a855f7" : "rgba(255,255,255,0.52)"}
                          stroke={
                            isActive ? "#ffffff" : "rgba(255,255,255,0.30)"
                          }
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>

              {mapFeatures.length === 0 && !mapError && (
                <div
                  className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      text-[8px]
                      font-mono
                      text-gray-600
                    "
                >
                  LOADING INDIA MAP...
                </div>
              )}

              {mapError && (
                <div
                  className="
                    absolute
                    inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-gray-500
                  "
                >
                  <MapPinned
                    size={28}
                    className="
                      text-purple-500
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-[8px]
                      font-mono
                    "
                  >
                    INDIA MAP COULD NOT LOAD
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="
              relative
              z-30
              flex
              items-center
              justify-between
              gap-4
              border-t
              border-white/10
              pt-4
            "
          >
            <span
              className="
                text-[7px]
                sm:text-[8px]
                font-mono
                text-gray-600
              "
            >
              COMMUNITY GROWTH
            </span>

            <span
              className="
                text-[8px]
                font-mono
                text-purple-400
              "
            >
              +{todayIncrement} TODAY
            </span>
          </div>
        </div>

        {exploredCity && (
          <div
            ref={cityOverlayRef}
            className="
              absolute
              inset-0
              z-50
              min-h-[440px]
              p-5
              sm:p-7
              overflow-hidden
              bg-[#0b0b0f]
            "
          >
            <div
              ref={cityContentRef}
              className="
                relative
                z-20
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  pb-5
                  border-b
                  border-white/[0.08]
                "
              >
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-purple-400
                      text-[8px]
                      font-mono
                    "
                  >
                    <MapPinned size={13} />
                    INSIDE {exploredCityData.city}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCity}
                  disabled={isTransitioning}
                  className="
                    w-10
                    h-10
                    rounded-full
                    border
                    border-white/10
                    bg-black/40
                    flex
                    items-center
                    justify-center
                  "
                >
                  <X size={17} />
                </button>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-[0.75fr_1.25fr]
                  gap-6
                  pt-6
                "
              >
                <div>
                  <p
                    className="
                      text-[8px]
                      font-mono
                      text-gray-600
                    "
                  >
                    YOU ENTERED
                  </p>

                  <h2
                    className="
                      mt-3
                      text-[clamp(2.6rem,5vw,4.8rem)]
                      font-black
                      uppercase
                      text-white
                    "
                  >
                    {exploredCityData.city}
                  </h2>

                  <p
                    className="
                      mt-4
                      text-[9px]
                      font-mono
                      text-purple-400
                    "
                  >
                    {exploredCityData.state}
                  </p>

                  <div
                    className="
                      mt-6
                      flex
                      items-end
                      gap-3
                    "
                  >
                    <span
                      className="
                        text-5xl
                        font-black
                        text-purple-500
                      "
                    >
                      {exploredCount}+
                    </span>

                    <span
                      className="
                        text-[7px]
                        font-mono
                        text-gray-600
                      "
                    >
                      COMMUNITY
                    </span>
                  </div>

                  <div
                    className="
                      mt-8
                      border-l-2
                      border-purple-500
                      pl-4
                    "
                  >
                    <p
                      className="
                        text-[7px]
                        font-mono
                        text-gray-600
                      "
                    >
                      FEATURED PLACE
                    </p>

                    <h3
                      className="
                        mt-2
                        text-xl
                        font-black
                        uppercase
                      "
                    >
                      {featuredPlace.name}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-[8px]
                        text-purple-400
                      "
                    >
                      {featuredPlace.area}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    relative
                    min-h-[340px]
                    rounded-[24px]
                    border
                    border-white/10
                    bg-black/25
                    overflow-hidden
                  "
                >
                  {featuredImage && (
                    <img
                      src={featuredImage}
                      alt={featuredPlace.name}
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        opacity-80
                      "
                    />
                  )}

                  {featuredImageLoading && (
                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-[#09090d]
                      "
                    >
                      <p
                        className="
                          text-[8px]
                          text-gray-600
                        "
                      >
                        LOADING {featuredPlace.name}
                      </p>
                    </div>
                  )}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-[#07070a]
                      via-black/20
                      to-black/20
                    "
                  />

                  <div
                    style={{
                      left: `${featuredPlace.x || 50}%`,

                      top: `${featuredPlace.y || 50}%`,
                    }}
                    className="
                      absolute
                      z-20
                      -translate-x-1/2
                      -translate-y-1/2
                    "
                  >
                    <span
                      className="
                        relative
                        w-12
                        h-12
                        rounded-full
                        bg-purple-600
                        text-white
                        border-2
                        border-purple-300
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <MapPin size={20} />
                    </span>
                  </div>

                  <div
                    className="
                      absolute
                      z-30
                      left-4
                      right-4
                      bottom-4
                      rounded-2xl
                      border
                      border-purple-500/25
                      bg-[#09090d]/95
                      p-4
                    "
                  >
                    <p
                      className="
                        text-[7px]
                        font-mono
                        text-purple-400
                      "
                    >
                      {exploredCityData.city} / FAMOUS PLACE
                    </p>

                    <h3
                      className="
                        mt-1
                        text-lg
                        font-black
                        uppercase
                      "
                    >
                      {featuredPlace.name}
                    </h3>

                    <p
                      className="
                        mt-1
                        text-[8px]
                        text-gray-600
                      "
                    >
                      {featuredPlace.area}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  mt-6
                  pt-4
                  border-t
                  border-white/10
                  flex
                  justify-end
                "
              >
                <button
                  type="button"
                  onClick={closeCity}
                  className="
                    text-[8px]
                    font-black
                    text-purple-400
                  "
                >
                  ← BACK TO INDIA MAP
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          ref={transitionFxRef}
          className="
            pointer-events-none
            absolute
            z-40
            left-1/2
            top-1/2
            w-[220px]
            h-[220px]
            opacity-0
          "
        />
      </div>
    </div>
  );
}

/* =========================================================
   ARTIST ROW
========================================================= */

function ArtistRow({ artist, index, isNew, onClick }) {
  const a = normalizeArtist(artist);

  const isBasic = a.plan === "basic";

  const isPro = a.plan === "pro";

  const isGold = a.plan === "verified";

  const locationText = isBasic
    ? a.state || "India"
    : [a.city, a.state].filter(Boolean).join(", ") || "India";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`
        group
        relative
        w-full
        text-left
        grid
        grid-cols-[48px_minmax(0,1fr)_78px_82px]
        md:grid-cols-[56px_minmax(0,1.65fr)_minmax(115px,1.15fr)_84px_88px]
        xl:grid-cols-[60px_minmax(0,2fr)_minmax(0,1.45fr)_minmax(88px,0.9fr)_minmax(0,1.35fr)_88px_96px]
        items-center
        gap-2
        md:gap-3
        min-h-[96px]
        px-3
        sm:px-4
        lg:px-5
        py-4
        border-b
        border-white/10
        transition-all
        duration-300
        last:border-b-0

        ${
          isGold
            ? `
              bg-gradient-to-r
              from-[#f5c451]/[0.11]
              via-[#f5c451]/[0.035]
              to-transparent
              hover:from-[#f5c451]/[0.16]
              ink-gold-card-pulse
            `
            : isPro
              ? `
                bg-gradient-to-r
                from-white/[0.065]
                via-white/[0.02]
                to-transparent
                hover:from-white/[0.10]
                ink-silver-card-pulse
              `
              : `
                bg-[#0d0d11]
                hover:bg-white/[0.035]
              `
        }

        ${
          isNew
            ? `
              ring-1
              ring-inset
              ring-purple-500
            `
            : ""
        }
      `}
    >
      {isGold && (
        <span
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <span
            className="
              ink-gold-shine
              absolute
              -left-1/2
              top-0
              h-full
              w-[10%]
              bg-gradient-to-r
              from-transparent
              via-[#fff2a8]/20
              to-transparent
            "
          />
        </span>
      )}

      {isPro && (
        <span
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <span
            className="
              ink-silver-shine
              absolute
              -left-1/2
              top-0
              h-full
              w-[10%]
              bg-gradient-to-r
              from-transparent
              via-white/15
              to-transparent
            "
          />
        </span>
      )}

      <div
        className="
          relative
          z-10
          flex
          justify-center
        "
      >
        <PublicAvatar artist={a} compact />
      </div>

      <div
        className="
          relative
          z-10
          min-w-0
        "
      >
        <p
          className={`
            mb-1
            text-[7px]
            font-mono
            font-black
            tracking-[0.13em]
            uppercase

            ${
              isGold
                ? "text-[#caa33d]"
                : isPro
                  ? "text-slate-400"
                  : "text-purple-400"
            }
          `}
        >
          {isGold
            ? "VERIFIED SPOTLIGHT"
            : isPro
              ? "SILVER PRO LISTING"
              : a.claimed
                ? "UPDATED FREE LISTING"
                : "FREE DIRECTORY LISTING"}
        </p>

        <h3
          className="
            truncate
            text-[15px]
            font-black
            uppercase
          "
        >
          {a.name}
        </h3>

        <p
          className="
            mt-1
            truncate
            text-[8px]
            text-gray-700
          "
        >
          {isGold
            ? a.studio || "Gold verified profile"
            : isPro
              ? "Silver public profile"
              : "Free public profile"}
        </p>
      </div>

      <div
        className="
          relative
          z-10
          hidden
          md:flex
          items-center
          gap-2
          min-w-0
          text-[10px]
          text-gray-400
        "
      >
        <MapPin
          size={13}
          className="
            text-purple-500
            shrink-0
          "
        />

        <span
          className="
            truncate
          "
        >
          {locationText}
        </span>
      </div>

      <div
        className="
          relative
          z-10
          hidden
          xl:block
          min-w-0
          truncate
          text-[11px]
          text-gray-400
        "
      >
        {a.locked.phone ? <MiniLock /> : a.phone || "—"}
      </div>

      <div
        className="
          relative
          z-10
          hidden
          xl:block
          min-w-0
          truncate
          text-[11px]
          text-gray-400
        "
      >
        {a.locked.email ? <MiniLock /> : a.email || "—"}
      </div>

      <div
        className="
          relative
          z-10
          flex
          justify-center
        "
      >
        <Link
          to="/book-artist"
          state={{
            preferredArtist: a.name,
            preferredArtistId: a.id,
            city: a.city,
            state: a.state,
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            rounded-lg
            bg-purple-600
            hover:bg-purple-500
            px-3
            py-2.5
            text-[7px]
            font-black
            uppercase
            tracking-wider
            text-white
            transition
            whitespace-nowrap
          "
        >
          BOOK ARTIST
          <ArrowRight size={11} />
        </Link>
      </div>

      <div
        className="
          relative
          z-10
          flex
          justify-center
        "
      >
        <span
          className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            rounded-lg
            border
            border-white/10
            px-3
            py-2.5
            text-[7px]
            font-black
          "
        >
          VIEW
          <ArrowRight size={11} />
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MINI LOCK
========================================================= */

function MiniLock() {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        text-gray-700
      "
    >
      <Lock size={10} />
      LOCKED
    </span>
  );
}

/* =========================================================
   PLAN BADGE
========================================================= */

function PlanBadge({ plan, compact = false }) {
  const normalized = normalizePlan(plan);

  const padding = compact ? "px-2 py-1.5" : "px-3 py-1.5";

  if (normalized === "verified") {
    return (
      <span
        className={`
          inline-flex
          items-center
          justify-center
          rounded-full
          bg-gradient-to-r
          from-[#c8911f]
          via-[#ffe58d]
          to-[#c8911f]
          ${padding}
          text-[7px]
          font-black
          text-black
        `}
      >
        ★ GOLD
      </span>
    );
  }

  if (normalized === "pro") {
    return (
      <span
        className={`
          inline-flex
          items-center
          justify-center
          rounded-full
          bg-gradient-to-r
          from-slate-300
          via-white
          to-slate-300
          ${padding}
          text-[7px]
          font-black
          text-black
        `}
      >
        SILVER
      </span>
    );
  }

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-full
        border
        border-purple-500/20
        bg-purple-500/[0.07]
        ${padding}
        text-[7px]
        font-black
        text-purple-400
      `}
    >
      FREE
    </span>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function PublicAvatar({ artist, size = "card", compact = false }) {
  const locked = Boolean(artist.locked?.profileImage);

  const plan = normalizePlan(artist.plan);

  const sizeClass = compact
    ? "h-11 w-11 sm:h-12 sm:w-12"
    : size === "modal"
      ? "h-28 w-28 sm:h-36 sm:w-36"
      : "h-16 w-16";

  const borderClass =
    plan === "verified"
      ? "border-[#f5c451]"
      : plan === "pro"
        ? "border-slate-300"
        : "border-white/10";

  return (
    <div
      className={`
        relative
        shrink-0
        overflow-hidden
        rounded-full
        border-2
        bg-black
        ${sizeClass}
        ${borderClass}
      `}
    >
      {locked ? (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-gradient-to-br
            from-white/[0.08]
            to-purple-500/[0.08]
          "
        >
          <Lock
            size={size === "modal" ? 23 : compact ? 13 : 16}
            className="
              text-gray-500
            "
          />
        </div>
      ) : artist.profileImage ? (
        <img
          src={artist.profileImage}
          alt={artist.name || "Artist"}
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            font-black
            text-gray-400
          "
        >
          {artist.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PROFILE MODAL
========================================================= */

function ArtistModal({ artist, selectedCity, onClose }) {
  const modalRef = React.useRef(null);

  const a = normalizeArtist(artist);

  const isBasic = a.plan === "basic";

  const isGold = a.plan === "verified";

  const expiryText = formatExpiry(a.planExpiresAt);

  React.useEffect(() => {
    if (!modalRef.current) {
      return undefined;
    }

    const tween = gsap.fromTo(
      modalRef.current,
      {
        opacity: 0,
        scale: 0.94,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.35,
        ease: "power3.out",
      },
    );

    return () => tween.kill();
  }, []);

  const manageState = {
    manageProfile: true,

    ownerMode: true,

    profileId: a.id,

    claimArtistId: a.id,

    artistId: a.id,

    artist: {
      _id: a.id,
      id: a.id,
      name: a.name,
      state: a.state,
      city: a.city,
      plan: a.plan,
      profileImage: a.profileImage,
    },
  };

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="
        fixed
        inset-0
        z-[9999]
        overflow-y-auto
        bg-black/85
        backdrop-blur-xl
        p-4
        sm:p-8
        flex
        items-center
        justify-center
      "
    >
      <div
        ref={modalRef}
        className={`
          relative
          w-full
          max-w-[1050px]
          max-h-[92vh]
          overflow-y-auto
          rounded-[28px]
          border
          bg-[#0d0d11]

          ${isGold ? "border-[#f5c451]/65" : "border-white/10"}
        `}
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            z-20
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-black/60
          "
        >
          <X size={17} />
        </button>

        <div
          className="
            border-b
            border-white/10
            p-6
            pr-20
            sm:p-10
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              gap-6
            "
          >
            <PublicAvatar artist={a} size="modal" />

            <div
              className="
                flex-1
                min-w-0
              "
            >
              <PlanBadge plan={a.plan} />

              <h2
                className="
                  mt-4
                  text-4xl
                  sm:text-6xl
                  font-black
                  uppercase
                "
              >
                {a.name}
              </h2>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  text-gray-400
                "
              >
                <MapPin
                  size={14}
                  className="
                    text-purple-500
                  "
                />

                {isBasic
                  ? a.state || "India"
                  : [a.city, a.state].filter(Boolean).join(", ") || "India"}
              </div>

              {isBasic && selectedCity !== "ALL" && (
                <p
                  className="
                      mt-3
                      text-[8px]
                      font-mono
                      text-gray-600
                    "
                >
                  INCLUDED IN {selectedCity} RESULTS · CITY VALUE LOCKED ON FREE
                  PLAN
                </p>
              )}

              {expiryText && (
                <p
                  className="
                    mt-3
                    text-[8px]
                    font-mono
                    text-gray-600
                  "
                >
                  MEMBERSHIP ACTIVE UNTIL {expiryText}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="
            p-6
            sm:p-10
          "
        >
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-x-10
              gap-y-7
            "
          >
            <PublicField
              title="NAME"
              value={a.name}
              locked={false}
              plan={a.plan}
            />

            <PublicField
              title="STATE"
              value={a.state}
              locked={false}
              plan={a.plan}
            />

            <PublicField
              title="CITY"
              value={a.city}
              locked={a.locked.city}
              plan={a.plan}
            />

            <PublicField
              title="PHONE"
              value={a.phone}
              locked={a.locked.phone}
              plan={a.plan}
            />

            <PublicField
              title="EMAIL"
              value={a.email}
              locked={a.locked.email}
              plan={a.plan}
            />

            <PublicField
              title="STUDIO"
              value={a.studio}
              locked={a.locked.studio}
              plan={a.plan}
            />

            <PublicField
              title="EXPERIENCE"
              value={a.experience}
              locked={a.locked.experience}
              plan={a.plan}
            />

            <PublicField
              title="INSTAGRAM"
              value={a.instagram}
              locked={a.locked.instagram}
              plan={a.plan}
            />
          </div>

          <div
            className="
              mt-8
            "
          >
            <PublicField
              title="BIO / ABOUT"
              value={a.bio}
              locked={a.locked.bio}
              plan={a.plan}
              multiline
            />
          </div>

          <div
            className="
              mt-8
              border-t
              border-white/10
              pt-8
            "
          >
            <p
              className="
                mb-4
                text-[8px]
                font-mono
                text-gray-500
              "
            >
              PORTFOLIO
            </p>

            {a.locked.portfolioImages ? (
              <LockedPortfolio />
            ) : a.portfolioImages.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  gap-4
                "
              >
                {a.portfolioImages.map((image, index) => (
                  <div
                    key={`${index}-${image.slice(0, 20)}`}
                    className="
                        aspect-square
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                      "
                  >
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="
                          h-full
                          w-full
                          object-cover
                        "
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  p-6
                  text-gray-600
                "
              >
                No portfolio images added yet.
              </div>
            )}
          </div>

          <PlanVisibilityMessage plan={a.plan} />

          <div
            className="
              mt-10
              border-t
              border-white/10
              pt-6
            "
          >
            <p
              className="
                text-[9px]
                font-black
              "
            >
              IS THIS YOUR PROFILE?
            </p>

            <p
              className="
                mt-1
                text-xs
                text-gray-600
              "
            >
              Manage or edit this profile using owner OTP verification.
            </p>

            <div
              className="
                mt-5
                flex
                flex-col
                sm:flex-row
                justify-end
                gap-3
              "
            >
              <button
                type="button"
                onClick={onClose}
                className="
                  px-7
                  py-4
                  bg-white/5
                  border
                  border-white/10
                  text-[9px]
                  font-black
                "
              >
                CLOSE PROFILE
              </button>

              <Link
                to="/book-artist"
                onClick={onClose}
                className="
                  px-7
                  py-4
                  text-center
                  border
                  border-white/10
                  text-[9px]
                  font-black
                "
              >
                BOOK AN ARTIST →
              </Link>

              <Link
                to="/Enter"
                state={manageState}
                onClick={onClose}
                className="
                  px-7
                  py-4
                  text-center
                  bg-purple-600
                  text-[9px]
                  font-black
                "
              >
                MANAGE / EDIT MY PROFILE →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PUBLIC FIELD
========================================================= */

function PublicField({ title, value, locked, plan, multiline = false }) {
  const normalized = normalizePlan(plan);

  const accent =
    normalized === "verified"
      ? "text-[#f5c451]"
      : normalized === "pro"
        ? "text-slate-300"
        : "text-purple-400";

  return (
    <div
      className="
        min-w-0
        border-b
        border-white/10
        pb-5
      "
    >
      <p
        className={`
          mb-2
          text-[8px]
          font-mono
          tracking-[0.2em]
          ${accent}
        `}
      >
        {title}
      </p>

      {locked ? (
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <span
            className="
              blur-[4px]
              text-base
              text-gray-600
            "
          >
            LOCKED PRIVATE DETAIL
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-1
              text-[7px]
              text-gray-600
            "
          >
            <Lock size={9} />
            LOCKED
          </span>
        </div>
      ) : (
        <p
          className={`
            text-base
            font-semibold
            text-white
            ${multiline ? "whitespace-pre-wrap leading-relaxed" : "break-words"}
          `}
        >
          {value || "-"}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   LOCKED PORTFOLIO
========================================================= */

function LockedPortfolio() {
  return (
    <div
      className="
        grid
        grid-cols-3
        gap-3
      "
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="
              relative
              aspect-square
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              flex
              items-center
              justify-center
            "
        >
          <Lock
            size={18}
            className="
                text-gray-600
              "
          />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   VISIBILITY MESSAGE
========================================================= */

function PlanVisibilityMessage({ plan }) {
  const normalized = normalizePlan(plan);

  let title = "FREE / BASIC PUBLIC PROFILE";

  let text =
    "Only Name and State are public. City, Photo, Phone, Email, Studio, Experience, Instagram, Bio and Portfolio remain locked.";

  if (normalized === "pro") {
    title = "SILVER / PRO PUBLIC PROFILE";

    text =
      "Name, State, City, Profile Photo and Phone are public. Email, Studio, Experience, Instagram, Bio and Portfolio remain locked.";
  }

  if (normalized === "verified") {
    title = "GOLD / VERIFIED PUBLIC PROFILE";

    text =
      "The complete artist profile is public, including Photo, Phone, Email, Studio, Experience, Instagram, Bio and up to 3 Portfolio images.";
  }

  return (
    <div
      className="
        mt-8
        rounded-[22px]
        border
        border-white/10
        bg-white/[0.03]
        p-6
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <Sparkles
          size={15}
          className="
            text-purple-400
          "
        />

        <p
          className="
            text-[9px]
            font-black
          "
        >
          {title}
        </p>
      </div>

      <p
        className="
          mt-3
          text-sm
          text-gray-500
        "
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({ page, totalPages, onPrevious, onNext }) {
  return (
    <div
      className="
        mt-8
        flex
        flex-col
        sm:flex-row
        items-center
        justify-between
        gap-4
        border-t
        border-white/10
        pt-6
      "
    >
      <p
        className="
          text-[9px]
          font-mono
          text-gray-600
        "
      >
        PAGE {page + 1} OF {totalPages} · AUTO ROTATES EVERY 4 SECONDS
      </p>

      <div
        className="
          flex
          gap-3
        "
      >
        <button
          type="button"
          onClick={onPrevious}
          disabled={page === 0}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/[0.03]
            px-5
            py-3
            text-[9px]
            font-black
            disabled:opacity-30
          "
        >
          <ArrowLeft size={13} />
          PREVIOUS
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages - 1}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-purple-600
            px-5
            py-3
            text-[9px]
            font-black
            disabled:opacity-30
          "
        >
          NEXT
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LOADER
========================================================= */

function DirectoryLoader() {
  return (
    <div
      className="
        min-h-[320px]
        rounded-[28px]
        border
        border-dashed
        border-white/10
        flex
        flex-col
        items-center
        justify-center
      "
    >
      <div
        className="
          h-12
          w-12
          animate-spin
          rounded-full
          border-2
          border-white/10
          border-t-purple-500
        "
      />

      <p
        className="
          mt-5
          text-[9px]
          font-mono
          text-purple-400
        "
      >
        LOADING REAL ARTISTS...
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div
      className="
        min-h-[280px]
        rounded-[28px]
        border
        border-dashed
        border-white/10
        flex
        flex-col
        items-center
        justify-center
        text-center
        p-6
      "
    >
      <Users
        size={34}
        className="
          text-gray-700
        "
      />

      <h3
        className="
          mt-4
          font-black
        "
      >
        NO ARTISTS FOUND
      </h3>

      <p
        className="
          mt-2
          text-xs
          text-gray-600
        "
      >
        Try another real city or search term.
      </p>
    </div>
  );
}
