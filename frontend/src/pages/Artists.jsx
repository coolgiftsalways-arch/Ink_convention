import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  MapPinned,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import gsap from "gsap";

/* =========================================================
   CONSTANTS
========================================================= */

const ONE_DAY = 24 * 60 * 60 * 1000;
const INITIAL_DAY_INDEX = Math.floor(Date.now() / ONE_DAY);
const CITY_COUNTER_KEY = "inkConventionCityCounters";

/* Maximum cards visible at one time */
const ARTISTS_PER_PAGE = 20;

/* Change to next group every 4 seconds */
const ARTIST_ROTATE_MS = 4000;

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
   [longitude, latitude]
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

   Used by the interactive "go inside the map" view.
   Every community city has its own local places.
========================================================= */

const CITY_FAMOUS_PLACES = {
  MUMBAI: [
    { name: "GATEWAY OF INDIA", area: "COLABA", x: 72, y: 68 },
    { name: "MARINE DRIVE", area: "SOUTH MUMBAI", x: 40, y: 72 },
    { name: "CST", area: "FORT", x: 58, y: 42 },
    { name: "BANDRA-WORLI SEA LINK", area: "BANDRA", x: 28, y: 28 },
  ],
  DELHI: [
    { name: "INDIA GATE", area: "NEW DELHI", x: 62, y: 60 },
    { name: "RED FORT", area: "OLD DELHI", x: 73, y: 28 },
    { name: "QUTUB MINAR", area: "MEHRAULI", x: 35, y: 76 },
    { name: "LOTUS TEMPLE", area: "KALKAJI", x: 76, y: 78 },
  ],
  BENGALURU: [
    { name: "BANGALORE PALACE", area: "VASANTH NAGAR", x: 45, y: 28 },
    { name: "CUBBON PARK", area: "CENTRAL", x: 52, y: 50 },
    { name: "VIDHANA SOUDHA", area: "AMBEDKAR VEEDHI", x: 30, y: 44 },
    { name: "LALBAGH", area: "MAVALLI", x: 63, y: 76 },
  ],
  HYDERABAD: [
    { name: "CHARMINAR", area: "OLD CITY", x: 64, y: 68 },
    { name: "GOLCONDA FORT", area: "IBRAHIM BAGH", x: 28, y: 52 },
    { name: "HUSSAIN SAGAR", area: "TANK BUND", x: 54, y: 30 },
    { name: "SALAR JUNG MUSEUM", area: "DAR-UL-SHIFA", x: 76, y: 50 },
  ],
  CHENNAI: [
    { name: "MARINA BEACH", area: "TRIPLICANE", x: 76, y: 64 },
    { name: "KAPALEESHWARAR TEMPLE", area: "MYLAPORE", x: 54, y: 70 },
    { name: "FORT ST. GEORGE", area: "GEORGE TOWN", x: 64, y: 28 },
    { name: "SANTHOME BASILICA", area: "SANTHOME", x: 38, y: 58 },
  ],
  KOLKATA: [
    { name: "VICTORIA MEMORIAL", area: "MAIDAN", x: 44, y: 64 },
    { name: "HOWRAH BRIDGE", area: "HOWRAH", x: 28, y: 28 },
    { name: "INDIAN MUSEUM", area: "PARK STREET", x: 58, y: 46 },
    { name: "PARK STREET", area: "CENTRAL KOLKATA", x: 72, y: 72 },
  ],
  AHMEDABAD: [
    { name: "SABARMATI ASHRAM", area: "ASHRAM ROAD", x: 42, y: 28 },
    { name: "ADALAJ STEPWELL", area: "ADALAJ", x: 68, y: 22 },
    { name: "SIDI SAIYYED MOSQUE", area: "LAL DARWAJA", x: 56, y: 52 },
    { name: "KANKARIA LAKE", area: "MANINAGAR", x: 70, y: 76 },
  ],
  PUNE: [
    { name: "SHANIWAR WADA", area: "SHANIWAR PETH", x: 54, y: 42 },
    { name: "AGA KHAN PALACE", area: "KALYANI NAGAR", x: 76, y: 34 },
    { name: "SINHAGAD FORT", area: "SINHAGAD", x: 28, y: 76 },
    { name: "PATALESHWAR CAVE", area: "SHIVAJINAGAR", x: 36, y: 28 },
  ],
  SURAT: [
    { name: "DUMAS BEACH", area: "DUMAS", x: 28, y: 74 },
    { name: "DUTCH GARDEN", area: "NANPURA", x: 42, y: 52 },
    { name: "GOPI TALAV", area: "GOPIPURA", x: 66, y: 62 },
    { name: "SARTHANA NATURE PARK", area: "SARTHANA", x: 76, y: 28 },
  ],
  JAIPUR: [
    { name: "HAWA MAHAL", area: "BADI CHAUPAR", x: 62, y: 46 },
    { name: "AMBER FORT", area: "AMER", x: 58, y: 20 },
    { name: "CITY PALACE", area: "PINK CITY", x: 42, y: 52 },
    { name: "JAL MAHAL", area: "MAN SAGAR", x: 76, y: 34 },
  ],
  LUCKNOW: [
    { name: "BARA IMAMBARA", area: "HUSSAINABAD", x: 38, y: 42 },
    { name: "RUMI DARWAZA", area: "HUSSAINABAD", x: 58, y: 35 },
    { name: "THE RESIDENCY", area: "QAISER BAGH", x: 52, y: 62 },
    { name: "AMBEDKAR MEMORIAL", area: "GOMTI NAGAR", x: 76, y: 70 },
  ],
  KANPUR: [
    { name: "JK TEMPLE", area: "SARVODAYA NAGAR", x: 52, y: 38 },
    { name: "ALLEN FOREST ZOO", area: "NAWABGANJ", x: 30, y: 30 },
    { name: "MOTI JHEEL", area: "HARSH NAGAR", x: 66, y: 56 },
    { name: "MEMORIAL CHURCH", area: "CANTONMENT", x: 72, y: 76 },
  ],
  NAGPUR: [
    { name: "DEEKSHABHOOMI", area: "RAMDASPETH", x: 48, y: 62 },
    { name: "FUTALA LAKE", area: "VAYUSENA NAGAR", x: 28, y: 40 },
    { name: "ZERO MILE", area: "CIVIL LINES", x: 58, y: 36 },
    { name: "SEMINARY HILLS", area: "SEMINARY HILLS", x: 72, y: 24 },
  ],
  INDORE: [
    { name: "RAJWADA PALACE", area: "RAJWADA", x: 46, y: 52 },
    { name: "LAL BAGH PALACE", area: "LAL BAGH", x: 27, y: 32 },
    { name: "SARAFA BAZAAR", area: "CENTRAL INDORE", x: 62, y: 68 },
    { name: "KHAJRANA TEMPLE", area: "KHAJRANA", x: 78, y: 46 },
  ],
  PATNA: [
    { name: "GOLGHAR", area: "BANKIPORE", x: 45, y: 42 },
    { name: "BIHAR MUSEUM", area: "BAILEY ROAD", x: 32, y: 64 },
    { name: "TAKHT SRI PATNA SAHIB", area: "PATNA CITY", x: 78, y: 48 },
    { name: "GANDHI GHAT", area: "GANGA RIVERFRONT", x: 58, y: 24 },
  ],
  KOCHI: [
    { name: "FORT KOCHI", area: "FORT KOCHI", x: 30, y: 46 },
    { name: "CHINESE FISHING NETS", area: "FORT KOCHI", x: 34, y: 24 },
    { name: "MATTANCHERRY PALACE", area: "MATTANCHERRY", x: 56, y: 58 },
    { name: "MARINE DRIVE", area: "ERNAKULAM", x: 76, y: 38 },
  ],
  CHANDIGARH: [
    { name: "ROCK GARDEN", area: "SECTOR 1", x: 62, y: 26 },
    { name: "SUKHNA LAKE", area: "SECTOR 1", x: 78, y: 42 },
    { name: "CAPITOL COMPLEX", area: "SECTOR 1", x: 38, y: 22 },
    { name: "ROSE GARDEN", area: "SECTOR 16", x: 44, y: 70 },
  ],
  VISAKHAPATNAM: [
    { name: "RK BEACH", area: "MAHARANI PETA", x: 70, y: 58 },
    { name: "KAILASAGIRI", area: "HILL TOP ROAD", x: 48, y: 24 },
    { name: "INS KURSURA MUSEUM", area: "BEACH ROAD", x: 60, y: 44 },
    { name: "YARADA BEACH", area: "YARADA", x: 34, y: 78 },
  ],
  BHUBANESWAR: [
    { name: "LINGARAJ TEMPLE", area: "OLD TOWN", x: 46, y: 68 },
    { name: "UDAYAGIRI CAVES", area: "KHANDAGIRI", x: 26, y: 42 },
    { name: "DHAULI SHANTI STUPA", area: "DHAULI", x: 76, y: 72 },
    { name: "NANDANKANAN", area: "BARANG", x: 62, y: 22 },
  ],
  GUWAHATI: [
    { name: "KAMAKHYA TEMPLE", area: "NILACHAL HILL", x: 28, y: 42 },
    { name: "UMANANDA ISLAND", area: "BRAHMAPUTRA", x: 52, y: 34 },
    { name: "ASSAM STATE ZOO", area: "HENGRABARI", x: 72, y: 56 },
    { name: "BRAHMAPUTRA RIVERFRONT", area: "PAN BAZAR", x: 48, y: 76 },
  ],
};

/* =========================================================
   INDIA MAP
   PURE GEOJSON + SVG
   NO react-simple-maps
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

/* =========================================================
   MAP HELPERS
========================================================= */

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
  if (!Array.isArray(ring) || ring.length === 0) return "";

  const result = ring
    .map((coordinate, index) => {
      const [x, y] = projectCoordinate(coordinate);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return `${result} Z`;
}

function geometryToPath(geometry) {
  if (!geometry) return "";

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
   DIRECTORY PLAN HELPERS

   NEW MODEL:
   1. VERIFIED SPOTLIGHT — ₹2,999 / YEAR
   2. PRO LISTING        — ₹1,499 / YEAR
   3. BASIC LISTING      — EXISTING DIRECTORY DATA

   THERE IS NO SEPARATE "FREE PLAN" CARD ANYMORE.

   LEGACY SUPPORT:
   gold   -> verified
   silver -> pro
   free   -> basic
========================================================= */

const safeText = (value) => String(value || "").toLowerCase();

function normalizePlan(plan) {
  const value = safeText(plan).trim();

  if (
    value === "gold" ||
    value === "verified" ||
    value === "spotlight" ||
    value.includes("gold") ||
    value.includes("verified") ||
    value.includes("spotlight")
  ) {
    return "verified";
  }

  if (
    value === "silver" ||
    value === "pro" ||
    value.includes("silver") ||
    value.includes("pro")
  ) {
    return "pro";
  }

  return "basic";
}

function getArtistPriority(artist) {
  const plan = normalizePlan(artist?.plan);

  if (plan === "verified") return 1;
  if (plan === "pro") return 2;

  /* Claimed / updated basic listings appear before untouched data. */
  if (artist?.claimed || artist?.phoneVerified || artist?.updatedByOwner) {
    return 3;
  }

  return 4;
}

function normalizeArtist(artist) {
  const plan = normalizePlan(artist?.plan);

  return {
    ...artist,
    plan,
    claimed: Boolean(
      artist?.claimed || artist?.phoneVerified || artist?.updatedByOwner,
    ),
    verified: plan === "verified" || Boolean(artist?.verified),
    spotlight: plan === "verified" || Boolean(artist?.spotlight),
    hallOfFameEligible:
      plan === "verified" || Boolean(artist?.hallOfFameEligible),
  };
}

function getPlanLabel(artist) {
  const normalizedArtist = normalizeArtist(artist);

  if (normalizedArtist.plan === "verified") {
    return "VERIFIED SPOTLIGHT · ₹2,999/YEAR";
  }

  if (normalizedArtist.plan === "pro") {
    return "PRO LISTING · ₹1,499/YEAR";
  }

  if (normalizedArtist.claimed) {
    return "UPDATED BASIC LISTING";
  }

  return "EXISTING DIRECTORY LISTING";
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 4) return "NUMBER ON FILE";

  const first = digits.slice(0, 2);
  const last = digits.slice(-2);

  return `${first}${"X".repeat(Math.max(digits.length - 4, 4))}${last}`;
}

/* =========================================================
   DAILY COMMUNITY INCREASE
   +3 TO +8 EVERY 24 HOURS
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
    if (stored) savedData = JSON.parse(stored);
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

  if (daysPassed <= 0) return savedData;

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
   MAIN ARTISTS PAGE
========================================================= */

export default function Artists() {
  const location = useLocation();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState("ALL");

  const [backendArtists, setBackendArtists] = React.useState([]);
  const [backendTotal, setBackendTotal] = React.useState(0);
  const [counterIndex, setCounterIndex] = React.useState(0);
  const [selectedArtist, setSelectedArtist] = React.useState(null);
  const [artistPage, setArtistPage] = React.useState(0);
  const [dayIndex, setDayIndex] = React.useState(INITIAL_DAY_INDEX);

  const [cityCounts, setCityCounts] = React.useState(() => {
    const data = getUpdatedCounterData();
    return data.counts;
  });

  const artistSectionRef = React.useRef(null);
  const artistGridRef = React.useRef(null);
  const entryButtonRef = React.useRef(null);

  /* =========================================================
     UPDATE CARD BUTTON ANIMATION
  ========================================================= */

  React.useEffect(() => {
    const button = entryButtonRef.current;
    if (!button) return undefined;

    const arrow = button.querySelector(".entry-arrow");
    const shine = button.querySelector(".entry-shine");

    const entrance = gsap.fromTo(
      button,
      { opacity: 0, scale: 0.88, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "back.out(1.7)",
      },
    );

    const pulse = gsap.to(button, {
      scale: 1.025,
      boxShadow: "0 0 35px rgba(168,85,247,0.42)",
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1.2,
    });

    const arrowTween = arrow
      ? gsap.to(arrow, {
          x: 5,
          duration: 0.65,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      : null;

    const shineTween = shine
      ? gsap.fromTo(
          shine,
          { xPercent: -200 },
          {
            xPercent: 300,
            duration: 1.2,
            repeat: -1,
            repeatDelay: 1.4,
            ease: "power2.inOut",
          },
        )
      : null;

    return () => {
      entrance.kill();
      pulse.kill();
      arrowTween?.kill();
      shineTween?.kill();
    };
  }, []);

  /* =========================================================
     CHECK 24-HOUR COMMUNITY COUNTER
  ========================================================= */

  React.useEffect(() => {
    const checkCounter = () => {
      const data = getUpdatedCounterData();
      setCityCounts(data.counts);
      setDayIndex(Math.floor(Date.now() / ONE_DAY));
    };

    const interval = setInterval(checkCounter, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     ROTATE ACTIVE CITY EVERY 2.8 SECONDS
  ========================================================= */

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCounterIndex((previous) => (previous + 1) % communityCounters.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     LOAD IMPORTED TATTOO DIRECTORY

     IMPORTANT:
     Your Excel importer stores records in the TattooStudio collection.
     The backend exposes that collection at:

       GET /api/admin/tattoo-studios

     We load every page in chunks so all imported MongoDB records can
     participate in the directory, while the UI still renders only
     ARTISTS_PER_PAGE cards at one time.
  ========================================================= */

  React.useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const mapDirectoryStudio = (studio, index) => {
      const plan = normalizePlan(
        studio.plan || studio.membershipPlan || studio.directoryPlan || "basic",
      );

      return normalizeArtist({
        id: studio._id || studio.id || studio.profileId || `studio-${index}`,
        plan,

        // Imported Excel records use `name` for the tattoo studio/business.
        name:
          studio.professionalName ||
          studio.artistName ||
          studio.name ||
          "Tattoo Studio",

        profileImage: studio.profileImage || studio.image || studio.photo || "",

        phone: studio.phone || studio.phoneNumber || "",
        email: studio.email || studio.gmail || "",
        city: studio.city || "",
        state: studio.state || "",

        // Keep a separate studio field when one exists. The imported
        // business name is already available through `name`.
        studio:
          studio.studio ||
          studio.studioName ||
          studio.brandName ||
          studio.name ||
          "",

        experience: studio.experience || "",
        instagram: studio.instagram || "",
        website: studio.website || "",
        mapsUrl: studio.mapsUrl || "",
        address: studio.address || "",
        category: studio.category || "",
        rating: studio.rating ?? null,
        reviews: studio.reviews ?? 0,
        country: studio.country || "India",

        claimed: Boolean(
          studio.claimed || studio.phoneVerified || studio.updatedByOwner,
        ),
        phoneVerified: Boolean(studio.phoneVerified),
        verified: Boolean(studio.verified || plan === "verified"),
        spotlight: Boolean(studio.spotlight || plan === "verified"),
        hallOfFameEligible: Boolean(
          studio.hallOfFameEligible || plan === "verified",
        ),
        paymentStatus: studio.paymentStatus || studio.payment?.status || "",
        updatedAt:
          studio.updatedAt || studio.importedAt || studio.createdAt || "",
        createdAt: studio.createdAt || studio.importedAt || "",
        year: "2026",
      });
    };

    const loadArtists = async () => {
      const apiBase = (
        import.meta.env.VITE_API_URL || "http://localhost:5000"
      ).replace(/\/$/, "");

      const PAGE_SIZE = 1000;
      let page = 1;
      let totalPages;
      let total;
      const allStudios = [];

      try {
        do {
          const response = await fetch(
            `${apiBase}/api/admin/tattoo-studios?page=${page}&limit=${PAGE_SIZE}`,
            { signal: controller.signal },
          );

          if (!response.ok) {
            throw new Error(`Tattoo directory API HTTP ${response.status}`);
          }

          const data = await response.json();

          const pageStudios = Array.isArray(data?.artists)
            ? data.artists
            : Array.isArray(data?.data)
              ? data.data
              : [];

          allStudios.push(...pageStudios);

          total = Number(
            data?.total || data?.pagination?.total || allStudios.length,
          );

          totalPages = Math.max(1, Number(data?.pagination?.totalPages || 1));

          console.log(
            `✅ Directory page ${page}/${totalPages}: ${pageStudios.length} records`,
          );

          page += 1;
        } while (
          page <= totalPages &&
          !cancelled &&
          !controller.signal.aborted
        );

        if (cancelled || controller.signal.aborted) return;

        const normalized = allStudios.map(mapDirectoryStudio);

        setBackendArtists(normalized);
        setBackendTotal(total || normalized.length);

        console.log(
          `✅ TOTAL IMPORTED DIRECTORY RECORDS LOADED: ${normalized.length}`,
        );
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Backend tattoo directory error:", error);

        if (!cancelled) {
          setBackendArtists([]);
          setBackendTotal(0);
        }
      }
    };

    // Initial directory load
    void loadArtists();

    // Refresh directory whenever the user comes back to this tab/window.
    // This allows newly purchased Gold/Silver plans to appear
    // without requiring another Excel upload.
    const handleFocus = () => {
      if (!cancelled && !controller.signal.aborted) {
        console.log(
          "🔄 User returned to Artists page — refreshing directory...",
        );
        void loadArtists();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      controller.abort();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  /* =========================================================
     AUTO SCROLL TO NEW ARTIST
  ========================================================= */

  React.useEffect(() => {
    if (!location.state?.newArtistId) return undefined;

    const timer = setTimeout(() => {
      artistSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [location.state]);

  /* =========================================================
     MODAL BODY LOCK + ESC
  ========================================================= */

  React.useEffect(() => {
    if (!selectedArtist) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const closeWithEsc = (event) => {
      if (event.key === "Escape") setSelectedArtist(null);
    };

    window.addEventListener("keydown", closeWithEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEsc);
    };
  }, [selectedArtist]);

  /* =========================================================
     COMBINE DIRECTORY DATA
  ========================================================= */

  const allArtists = React.useMemo(() => {
    return backendArtists.map((artist) => normalizeArtist(artist));
  }, [backendArtists]);

  /* =========================================================
     CITY FILTER OPTIONS
  ========================================================= */

  const cityOptions = React.useMemo(() => {
    const cities = new Set();

    allArtists.forEach((artist) => {
      const city = String(artist.city || "").trim();
      if (city) cities.add(city.toUpperCase());
    });

    communityCounters.forEach((item) => {
      if (item.city) cities.add(String(item.city).toUpperCase());
    });

    return ["ALL", ...Array.from(cities).sort((a, b) => a.localeCompare(b))];
  }, [allArtists]);

  const directoryTotal = Math.max(backendTotal, allArtists.length);

  /* =========================================================
     SEARCH + CITY FILTER + DIRECTORY SORT

     ORDER:
     1. VERIFIED SPOTLIGHT ₹2,999
     2. PRO ₹1,499
     3. BASIC / OWNER UPDATED
     4. EXISTING / NOT UPDATED
  ========================================================= */

  const filteredArtists = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    /*
     * =========================================================
     * ALL FILTER
     *
     * ONLY PREMIUM ARTISTS ARE ALLOWED HERE.
     *
     * Priority:
     * 1. GOLD / VERIFIED
     * 2. SILVER / PRO
     *
     * Maximum = 6 cards.
     *
     * BASIC / FREE ARTISTS ARE NEVER SHOWN IN ALL.
     * =========================================================
     */

    if (selectedCity === "ALL") {
      let premiumArtists = allArtists.filter((artist) => {
        const plan = normalizePlan(artist.plan);

        return plan === "verified" || plan === "pro";
      });

      /*
       * Search inside premium artists only.
       */
      if (query) {
        premiumArtists = premiumArtists.filter((artist) => {
          const plan = normalizePlan(artist.plan);

          const publicSearchText = [
            artist.name,
            artist.studio,
            artist.city,
            artist.state,
          ];

          /*
           * Pro can search email.
           */
          if (plan === "pro") {
            publicSearchText.push(artist.email);
          }

          /*
           * Gold gets complete searchable profile.
           */
          if (plan === "verified") {
            publicSearchText.push(
              artist.phone,
              artist.email,
              artist.instagram,
              artist.experience,
            );
          }

          return publicSearchText.some((value) =>
            safeText(value).includes(query),
          );
        });
      }

      /*
       * GOLD FIRST
       * SILVER SECOND
       *
       * Then newest updated profile first within
       * the same plan.
       */
      premiumArtists.sort((a, b) => {
        const priorityA = getArtistPriority(a);
        const priorityB = getArtistPriority(b);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;

        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;

        return dateB - dateA;
      });

      /*
       * VERY IMPORTANT:
       * ALL FILTER CAN NEVER HAVE MORE THAN 6 CARDS.
       */
      return premiumArtists.slice(0, 6);
    }

    /*
     * =========================================================
     * CITY FILTER
     *
     * CITY FILTER SHOWS EVERY ARTIST IN THAT CITY:
     *
     * GOLD
     * SILVER
     * UPDATED BASIC
     * EXISTING BASIC
     *
     * =========================================================
     */

    let results = allArtists.filter(
      (artist) => safeText(artist.city).toUpperCase() === selectedCity,
    );

    /*
     * SEARCH WITHIN CITY
     */
    if (query) {
      results = results.filter((artist) => {
        const plan = normalizePlan(artist.plan);

        const publicSearchText = [
          artist.name,
          artist.studio,
          artist.city,
          artist.state,
        ];

        /*
         * Pro can search email.
         */
        if (plan === "pro") {
          publicSearchText.push(artist.email);
        }

        /*
         * Gold can search complete profile.
         */
        if (plan === "verified") {
          publicSearchText.push(
            artist.phone,
            artist.email,
            artist.instagram,
            artist.experience,
          );
        }

        return publicSearchText.some((value) =>
          safeText(value).includes(query),
        );
      });
    }

    /*
     * CITY ORDER:
     *
     * 1. GOLD
     * 2. SILVER
     * 3. UPDATED BASIC
     * 4. EXISTING BASIC
     */
    return [...results].sort((a, b) => {
      const priorityA = getArtistPriority(a);
      const priorityB = getArtistPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;

      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;

      return dateB - dateA;
    });
  }, [allArtists, searchQuery, selectedCity]);

  /* =========================================================
     20-CARD AUTO ROTATION
  ========================================================= */

  const totalArtistPages = Math.max(
    1,
    Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE),
  );

  const safeArtistPage = Math.min(
    artistPage,
    Math.max(totalArtistPages - 1, 0),
  );

  const artistPageStart = safeArtistPage * ARTISTS_PER_PAGE;

  const visibleArtists = React.useMemo(() => {
    const start = safeArtistPage * ARTISTS_PER_PAGE;
    return filteredArtists.slice(start, start + ARTISTS_PER_PAGE);
  }, [filteredArtists, safeArtistPage]);

  const firstVisibleArtistNumber =
    filteredArtists.length === 0 ? 0 : artistPageStart + 1;

  const lastVisibleArtistNumber = Math.min(
    artistPageStart + ARTISTS_PER_PAGE,
    filteredArtists.length,
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setArtistPage(0);
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setArtistPage(0);
  };

  React.useEffect(() => {
    if (totalArtistPages <= 1) return undefined;

    const interval = setInterval(() => {
      setArtistPage((previous) => (previous + 1) % totalArtistPages);
    }, ARTIST_ROTATE_MS);

    return () => clearInterval(interval);
  }, [totalArtistPages]);

  React.useEffect(() => {
    if (!artistGridRef.current) return undefined;

    const cards = Array.from(artistGridRef.current.children);
    if (cards.length === 0) return undefined;

    gsap.killTweensOf(cards);

    const tween = gsap.fromTo(
      cards,
      { opacity: 0, y: 20, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.025,
        ease: "power3.out",
      },
    );

    return () => tween.kill();
  }, [safeArtistPage, filteredArtists.length]);

  /* =========================================================
     CURRENT COMMUNITY CITY
  ========================================================= */

  const currentCounter = communityCounters[counterIndex];
  const currentCount = cityCounts[currentCounter.city] ?? currentCounter.count;
  const todayIncrement = getDailyIncrement(currentCounter.city, dayIndex);

  return (
    <>
      <style>{`
        @keyframes inkSilverSweep {
          0% { transform: translateX(-180%) skewX(-18deg); opacity: 0; }
          12% { opacity: 0.85; }
          42% { opacity: 0.35; }
          58%, 100% { transform: translateX(420%) skewX(-18deg); opacity: 0; }
        }

        @keyframes inkGoldSweep {
          0% { transform: translateX(-190%) skewX(-18deg); opacity: 0; }
          10% { opacity: 1; }
          46% { opacity: 0.5; }
          60%, 100% { transform: translateX(430%) skewX(-18deg); opacity: 0; }
        }

        @keyframes inkPremiumFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: .35; }
          50% { transform: translate3d(12px, -14px, 0) scale(1.14); opacity: .8; }
        }

        @keyframes inkGoldPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(245,196,81,.22), inset 0 0 0 rgba(245,196,81,0); }
          50% { box-shadow: 0 0 34px rgba(245,196,81,.50), inset 0 0 22px rgba(245,196,81,.06); }
        }

        @keyframes inkSilverPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(226,232,240,.12); }
          50% { box-shadow: 0 0 28px rgba(226,232,240,.32); }
        }

        @keyframes inkDotBlink {
          0%, 100% { opacity: .22; transform: scale(.78); }
          50% { opacity: 1; transform: scale(1.25); }
        }

        .ink-silver-shine { animation: inkSilverSweep 3.4s ease-in-out infinite; }
        .ink-gold-shine { animation: inkGoldSweep 2.9s ease-in-out infinite; }
        .ink-premium-float { animation: inkPremiumFloat 4.6s ease-in-out infinite; }
        .ink-gold-card-pulse { animation: inkGoldPulse 2.8s ease-in-out infinite; }
        .ink-silver-card-pulse { animation: inkSilverPulse 3.4s ease-in-out infinite; }
        .ink-premium-dot { animation: inkDotBlink 1.8s ease-in-out infinite; }
      `}</style>

      <main className="min-h-screen overflow-x-hidden bg-[#08080a] text-white pt-32 pb-24 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1700px] mx-auto space-y-12">
          {/* =================================================
              HERO
          ================================================= */}

          <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.75fr)_minmax(650px,1.25fr)] gap-12 xl:gap-16 items-center border-b border-white/10 pb-12">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-[10px] font-mono tracking-[0.2em] mb-5">
                <Sparkles size={13} />
                INDIA TATTOO DIRECTORY
              </div>

              <h1 className="text-[clamp(3.5rem,7vw,7rem)] font-black uppercase tracking-[-0.065em] leading-[0.85]">
                FIND YOUR
                <br />
                <span className="text-purple-500">ARTIST.</span>
              </h1>

              <p className="max-w-xl mt-6 text-gray-500 text-sm leading-relaxed">
                Discover tattoo artists and studios across India. Verified
                Spotlight members appear first, followed by Pro listings,
                owner-updated basic profiles and untouched directory records.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="border border-purple-500/20 bg-purple-500/[0.04] rounded-full px-4 py-2 text-[8px] font-mono tracking-[0.12em] text-purple-400">
                  VERIFIED FIRST
                </span>
                <span className="border border-white/10 bg-white/[0.02] rounded-full px-4 py-2 text-[8px] font-mono tracking-[0.12em] text-gray-500">
                  LOCAL DISCOVERY
                </span>
                <span className="border border-white/10 bg-white/[0.02] rounded-full px-4 py-2 text-[8px] font-mono tracking-[0.12em] text-gray-500">
                  INDIA-WIDE NETWORK
                </span>
                <span className="border border-white/10 bg-white/[0.02] rounded-full px-4 py-2 text-[8px] font-mono tracking-[0.12em] text-gray-500">
                  {directoryTotal.toLocaleString("en-IN")} DIRECTORY RECORDS
                </span>
              </div>
            </div>

            <CommunityMapBox
              currentCounter={currentCounter}
              currentCount={currentCount}
              todayIncrement={todayIncrement}
              cityCounts={cityCounts}
            />
          </section>

          {/* =================================================
              SEARCH + CITY FILTER + UPDATE CARD
          ================================================= */}

          <section className="bg-[#0d0d11] border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="SEARCH ARTIST OR STUDIO NAME..."
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-xl pl-11 pr-4 py-4 text-xs text-white outline-none placeholder:text-gray-700 transition"
                />
              </div>

              <div className="relative min-w-[220px]">
                <MapPin
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
                />

                <select
                  value={selectedCity}
                  onChange={(event) => handleCityChange(event.target.value)}
                  className="w-full appearance-none bg-black/40 border border-white/10 focus:border-purple-500 rounded-xl pl-10 pr-10 py-4 text-[10px] font-black tracking-widest text-white outline-none cursor-pointer"
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city === "ALL" ? "ALL CITIES" : city}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                ref={entryButtonRef}
                to="/Enter"
                className="group relative overflow-hidden bg-purple-600 hover:bg-purple-500 border border-purple-400/40 rounded-xl px-7 py-4 flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.14em] whitespace-nowrap shadow-[0_0_20px_rgba(168,85,247,0.20)] transition-all duration-300 hover:-translate-y-1"
              >
                <span className="entry-shine absolute top-0 bottom-0 left-[-40%] w-[30%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] pointer-events-none" />
                <span className="relative z-10 w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.95)]" />
                <span className="relative z-10">FIND / UPDATE YOUR CARD</span>
                <ArrowRight size={14} className="entry-arrow relative z-10" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              {["ALL", "MUMBAI", "PUNE", "DELHI", "BENGALURU", "HYDERABAD"].map(
                (city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCityChange(city)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[8px] font-black tracking-widest transition ${
                      selectedCity === city
                        ? "border-purple-400 bg-purple-500/15 text-purple-300"
                        : "border-white/10 bg-white/[0.02] text-gray-600 hover:text-white"
                    }`}
                  >
                    {city}
                  </button>
                ),
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[8px] font-mono tracking-wider text-gray-600">
              <span>01 · VERIFIED ₹2,999 FIRST</span>
              <span>02 · PRO ₹1,499 NEXT</span>
              <span>03 · UPDATED BASIC</span>
              <span>04 · NOT UPDATED LAST</span>
            </div>
          </section>

          {/* =================================================
              ARTISTS
          ================================================= */}

          <section ref={artistSectionRef} className="scroll-mt-32">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
              {/* LEFT: SECTION TITLE */}
              <div>
                <p className="text-purple-400 text-[9px] font-mono tracking-widest mb-2">
                  TATTOO DIRECTORY
                </p>

                <h2 className="text-3xl sm:text-5xl font-black uppercase">
                  {searchQuery
                    ? "SEARCH RESULTS"
                    : selectedCity !== "ALL"
                      ? `${selectedCity} ARTISTS`
                      : "DISCOVER ARTISTS"}
                </h2>
              </div>

              {/* RIGHT: COUNT + BOOK YOUR ARTIST BUTTON */}
              <div className="flex flex-col sm:flex-row sm:items-center lg:items-end gap-4">
                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className="text-[9px] font-mono text-gray-600">
                    {filteredArtists.length} ARTISTS
                  </span>

                  {filteredArtists.length > ARTISTS_PER_PAGE && (
                    <span className="text-[8px] font-mono tracking-[0.12em] text-purple-400 uppercase whitespace-nowrap">
                      SHOWING {firstVisibleArtistNumber}-{lastVisibleArtistNumber}
                      {" / "}
                      PAGE {safeArtistPage + 1} OF {totalArtistPages}
                      {" / AUTO 4S"}
                    </span>
                  )}
                </div>

                <Link
                  to="/book-artist"
                  className="
                    group
                    relative
                    overflow-hidden
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    w-full
                    sm:w-auto
                    px-5
                    sm:px-6
                    py-3.5
                    rounded-xl
                    bg-purple-600
                    hover:bg-purple-500
                    border
                    border-purple-400/40
                    text-[9px]
                    font-black
                    tracking-[0.13em]
                    whitespace-nowrap
                    text-white
                    shadow-[0_0_22px_rgba(168,85,247,0.25)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-[0_0_35px_rgba(168,85,247,0.40)]
                  "
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.10] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                  <Sparkles size={14} className="relative z-10 shrink-0" />

                  <span className="relative z-10">BOOK YOUR ARTIST</span>

                  <ArrowRight
                    size={14}
                    className="relative z-10 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {filteredArtists.length === 0 ? (
              <div className="min-h-[280px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[28px]">
                <Search size={35} className="text-gray-700 mb-4" />
                <h3 className="font-black">NO ARTISTS FOUND</h3>
                <p className="mt-2 text-xs text-gray-600">
                  Try another city, artist name or studio.
                </p>
              </div>
            ) : (
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
                <div className="w-full">
                  {/* TABLE HEADER */}
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
                    <span className="text-center">Profile</span>
                    <span className="min-w-0">Artist / Studio</span>
                    <span className="hidden md:block min-w-0">Location</span>
                    <span className="hidden xl:block min-w-0">Phone</span>
                    <span className="hidden xl:block min-w-0">Email</span>
                    <span className="text-center">Plan</span>
                    <span className="text-center">Action</span>
                  </div>

                  {/* KEEP REF HERE SO YOUR EXISTING GSAP STILL WORKS */}
                  <div ref={artistGridRef}>
                    {visibleArtists.map((artist, index) => {
                      const globalIndex = artistPageStart + index;

                      return (
                        <ArtistCard
                          key={artist.id || `${artist.name}-${globalIndex}`}
                          artist={artist}
                          index={globalIndex}
                          isNew={location.state?.newArtistId === artist.id}
                          onClick={() => setSelectedArtist(artist)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedArtist && (
        <ArtistModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </>
  );
}

/* =========================================================
   COMMUNITY MAP BOX
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

  /* Real famous-place image for the active city */
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

  /* Show only ONE famous place for the city. */
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

  /* =======================================================
     LOAD REAL IMAGE FOR THE CITY'S FEATURED PLACE

     MUMBAI -> GATEWAY OF INDIA
     DELHI -> INDIA GATE
     JAIPUR -> HAWA MAHAL
     ...and the same system for every city.

     Images are fetched automatically from Wikipedia/Wikimedia.
  ======================================================= */

  React.useEffect(() => {
    if (!exploredCity) return undefined;

    const controller = new AbortController();

    const loadPlaceImage = async () => {
      try {
        const searchText = `${featuredPlace.name} ${exploredCityData.city} India`;

        const url =
          "https://en.wikipedia.org/w/api.php" +
          `?action=query&generator=search&gsrsearch=${encodeURIComponent(searchText)}` +
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

    loadPlaceImage();

    return () => {
      controller.abort();
    };
  }, [exploredCity, exploredCityData.city, featuredPlace.name]);

  /* =======================================================
     LOAD INDIA MAP
  ======================================================= */

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
        if (cancelled) return;

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

  /* =======================================================
     ACTIVE CITY TEXT ANIMATION
  ======================================================= */

  React.useEffect(() => {
    if (!contentRef.current || exploredCity) return undefined;

    gsap.killTweensOf(contentRef.current);

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
    if (!numberRef.current || exploredCity) return undefined;

    gsap.killTweensOf(numberRef.current);

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
    if (!glowRef.current) return undefined;

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

  /* =======================================================
     OPEN CITY

     IMPORTANT:
     The normal India map NEVER unmounts.
     We keep it behind the city layer, so when you press X
     there is no blank/empty box anymore.
  ======================================================= */

  const openCurrentCity = () => {
    if (isTransitioning || exploredCity) return;

    const city = currentCounter.city;

    setFeaturedImage("");
    setFeaturedImageLoading(true);

    if (CITY_COORDINATES[city]) {
      setIsTransitioning(true);
    }

    setExploredCity(city);
  };

  /* =======================================================
     BEST "GO INSIDE MAP" ANIMATION

     1. Transform origin moves to the exact active city dot.
     2. India map quickly approaches the city.
     3. Deep zoom + blur makes it feel like entering the map.
     4. Circular portal opens the city screen.
  ======================================================= */

  React.useEffect(() => {
    if (!exploredCity) return undefined;

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

      gsap.set(baseViewRef.current, { opacity: 0 });
      return undefined;
    }

    const [x, y] = projectCoordinate(coordinates);
    const originX = (x / MAP_WIDTH) * 100;
    const originY = (y / MAP_HEIGHT) * 100;

    gsap.killTweensOf([
      baseViewRef.current,
      indiaSceneRef.current,
      cityOverlayRef.current,
      contentRef.current,
      transitionFxRef.current,
    ]);

    gsap.set(baseViewRef.current, {
      opacity: 1,
      pointerEvents: "none",
    });

    gsap.set(indiaSceneRef.current, {
      opacity: 1,
      scale: 1,
      filter: "blur(0px) brightness(1)",
      transformOrigin: `${originX}% ${originY}%`,
      willChange: "transform, filter, opacity",
    });

    if (contentRef.current) {
      gsap.set(contentRef.current, {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
      });
    }

    gsap.set(cityOverlayRef.current, {
      opacity: 0,
      scale: 1.12,
      filter: "blur(10px)",
      clipPath: `circle(0% at ${originX}% ${originY}%)`,
      pointerEvents: "none",
    });

    if (transitionFxRef.current) {
      gsap.set(transitionFxRef.current, {
        opacity: 0,
        scale: 0.5,
      });
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(baseViewRef.current, {
          opacity: 0,
          pointerEvents: "none",
        });

        gsap.set(cityOverlayRef.current, {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          clipPath: "circle(150% at 50% 50%)",
          pointerEvents: "auto",
        });

        setIsTransitioning(false);
      },
    });

    /* First approach */
    timeline.to(
      indiaSceneRef.current,
      {
        scale: 2.25,
        duration: 0.34,
        ease: "power2.in",
      },
      0,
    );

    /* City text slides away */
    if (contentRef.current) {
      timeline.to(
        contentRef.current,
        {
          opacity: 0,
          x: -34,
          filter: "blur(6px)",
          duration: 0.34,
          ease: "power2.in",
        },
        0.12,
      );
    }

    /* Strong deep zoom toward active city */
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

    /* Purple tunnel flash */
    if (transitionFxRef.current) {
      timeline
        .to(
          transitionFxRef.current,
          {
            opacity: 0.95,
            scale: 1.8,
            duration: 0.34,
            ease: "power2.out",
          },
          0.58,
        )
        .to(
          transitionFxRef.current,
          {
            opacity: 0,
            scale: 3.3,
            duration: 0.42,
            ease: "power2.in",
          },
          0.82,
        );
    }

    /* City portal opens from the selected city */
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

    if (cityContentRef.current) {
      timeline.fromTo(
        cityContentRef.current.children,
        {
          opacity: 0,
          y: 22,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.055,
          ease: "power3.out",
        },
        1.02,
      );
    }

    return () => {
      timeline.kill();
    };
  }, [exploredCity]);

  /* =======================================================
     X / BACK -> RETURN TO INDIA MAP

     FIXED:
     Base India map is already mounted behind the city screen.
     We reveal it first, then zoom OUT from the same city.
     That prevents the empty/black panel shown in your screenshot.
  ======================================================= */

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

    gsap.killTweensOf([
      baseViewRef.current,
      indiaSceneRef.current,
      cityOverlayRef.current,
      contentRef.current,
      transitionFxRef.current,
    ]);

    /* India map is made visible BEFORE city view disappears. */
    gsap.set(baseViewRef.current, {
      opacity: 1,
      pointerEvents: "none",
    });

    gsap.set(indiaSceneRef.current, {
      opacity: 1,
      scale: 11.5,
      transformOrigin: `${originX}% ${originY}%`,
      filter: "blur(4px) brightness(0.55)",
    });

    if (contentRef.current) {
      gsap.set(contentRef.current, {
        opacity: 0,
        x: -28,
        filter: "blur(6px)",
      });
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.set(baseViewRef.current, {
          opacity: 1,
          pointerEvents: "auto",
        });

        gsap.set(indiaSceneRef.current, {
          clearProps: "transform,transformOrigin,filter,opacity,willChange",
        });

        if (contentRef.current) {
          gsap.set(contentRef.current, {
            clearProps: "transform,filter,opacity",
          });
        }

        if (cityOverlayRef.current) {
          gsap.set(cityOverlayRef.current, {
            clearProps: "opacity,transform,filter,clipPath,pointerEvents",
          });
        }

        setFeaturedImage("");
        setFeaturedImageLoading(false);
        setExploredCity(null);
        setIsTransitioning(false);
      },
    });

    /* Close city like going backwards through portal. */
    timeline.to(cityOverlayRef.current, {
      opacity: 0,
      scale: 1.16,
      filter: "blur(12px)",
      clipPath: `circle(0% at ${originX}% ${originY}%)`,
      duration: 0.48,
      ease: "power3.in",
    });

    if (transitionFxRef.current) {
      timeline
        .fromTo(
          transitionFxRef.current,
          {
            opacity: 0,
            scale: 2.4,
          },
          {
            opacity: 0.75,
            scale: 1.1,
            duration: 0.25,
            ease: "power2.out",
          },
          0.22,
        )
        .to(
          transitionFxRef.current,
          {
            opacity: 0,
            scale: 0.55,
            duration: 0.28,
            ease: "power2.in",
          },
          0.46,
        );
    }

    /* Zoom OUT from the city back to full India. */
    timeline
      .to(
        indiaSceneRef.current,
        {
          scale: 3.2,
          filter: "blur(2px) brightness(0.85)",
          duration: 0.36,
          ease: "power3.out",
        },
        0.28,
      )
      .to(
        indiaSceneRef.current,
        {
          scale: 1,
          filter: "blur(0px) brightness(1)",
          duration: 0.62,
          ease: "power4.out",
        },
        0.58,
      );

    if (contentRef.current) {
      timeline.to(
        contentRef.current,
        {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power3.out",
        },
        0.72,
      );
    }
  };

  return (
    <div className="relative w-full min-w-0">
      <div
        ref={glowRef}
        className="absolute right-[5%] top-[15%] w-[320px] h-[320px] rounded-full bg-purple-600/[0.10] blur-[110px] pointer-events-none"
      />

      <div className="relative w-full min-h-[440px] overflow-hidden bg-[#0b0b0f] border border-white/10 rounded-[28px]">
        {/* =================================================
            NORMAL INDIA VIEW
            ALWAYS MOUNTED — THIS FIXES THE BLANK BACK SCREEN
        ================================================= */}

        <div
          ref={baseViewRef}
          className="relative z-10 min-h-[440px] p-5 sm:p-7"
        >
          {/* TOP BAR */}

          <div className="relative z-30 flex items-center justify-between gap-4 pb-5 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 text-purple-400 text-[9px] font-mono tracking-[0.15em] uppercase">
              <Users size={13} />
              OUR COMMUNITY
            </div>

            <div className="flex items-center gap-2 text-[8px] font-mono text-gray-600">
              <span className="relative flex w-2 h-2">
                <span className="absolute w-full h-full rounded-full bg-purple-400 opacity-70 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_14px_rgba(168,85,247,1)]" />
              </span>
              LIVE
            </div>
          </div>

          {/* CITY + MAP */}

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[0.72fr_1.28fr] gap-4 md:gap-6 items-center min-h-[320px]">
            <div
              ref={contentRef}
              className="relative z-20 min-w-0 py-6 md:py-0"
            >
              <p className="text-[8px] sm:text-[9px] font-mono tracking-[0.22em] text-gray-600 uppercase mb-4">
                OUR COMMUNITY IN
              </p>

              <h2 className="text-[clamp(2rem,4vw,3.7rem)] font-black uppercase tracking-[-0.06em] leading-[0.88] break-words">
                {currentCounter.city}
              </h2>

              <span
                ref={numberRef}
                className="block mt-5 text-[clamp(3rem,6vw,5rem)] font-black text-purple-500 tracking-[-0.075em] leading-[0.8] whitespace-nowrap drop-shadow-[0_0_20px_rgba(168,85,247,0.25)]"
              >
                {currentCount}+
              </span>

              <div className="mt-7 flex items-center gap-2 text-[8px] font-mono tracking-[0.1em] text-gray-500 uppercase">
                <MapPinned size={13} className="text-purple-500 shrink-0" />
                {currentCounter.state}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-purple-500/20 bg-purple-500/[0.05]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,1)]" />

                  <span className="text-[7px] font-mono tracking-[0.16em] text-purple-400">
                    ACTIVE CITY
                  </span>
                </div>

                <button
                  type="button"
                  onClick={openCurrentCity}
                  disabled={isTransitioning || Boolean(exploredCity)}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black hover:bg-purple-500 hover:text-white disabled:opacity-50 disabled:cursor-wait transition-all duration-300 text-[7px] font-black tracking-[0.13em]"
                >
                  {isTransitioning ? "ENTERING..." : "MORE"}
                  <ArrowRight
                    size={11}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>

              <p className="mt-3 text-[7px] font-mono tracking-[0.1em] text-gray-700">
                MORE OPENS {currentCounter.city}
              </p>
            </div>

            {/* INDIA MAP SCENE — THIS IS THE PART THAT ZOOMS */}

            <div
              ref={indiaSceneRef}
              className="relative w-full min-h-[310px] flex items-center justify-center"
            >
              <div className="absolute inset-3 opacity-[0.035] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:28px_28px]" />

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[300px] rounded-full bg-purple-500/[0.04] blur-[60px]" />

              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="India community map"
                className="relative z-10 w-full max-w-[430px] h-auto"
              >
                <g>
                  {mapFeatures.map((feature, index) => (
                    <path
                      key={
                        feature.properties?.name ||
                        feature.properties?.NAME_1 ||
                        feature.properties?.st_nm ||
                        index
                      }
                      d={geometryToPath(feature.geometry)}
                      fill="rgba(255,255,255,0.006)"
                      stroke="rgba(255,255,255,0.50)"
                      strokeWidth="0.65"
                      vectorEffect="non-scaling-stroke"
                      fillRule="evenodd"
                    />
                  ))}
                </g>

                <g>
                  {communityCounters.map((city) => {
                    const coordinates = CITY_COORDINATES[city.city];

                    if (!coordinates) return null;

                    const [x, y] = projectCoordinate(coordinates);
                    const isActive = currentCounter.city === city.city;
                    const labelWidth = Math.max(58, city.city.length * 6.2);

                    return (
                      <g key={city.city}>
                        {isActive && (
                          <>
                            <circle
                              cx={x}
                              cy={y}
                              r="8"
                              fill="none"
                              stroke="#a855f7"
                              strokeWidth="1"
                            >
                              <animate
                                attributeName="r"
                                values="6;18;6"
                                dur="1.8s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                values="0.8;0;0.8"
                                dur="1.8s"
                                repeatCount="indefinite"
                              />
                            </circle>

                            <circle
                              cx={x}
                              cy={y}
                              r="11"
                              fill="rgba(168,85,247,0.10)"
                            />
                          </>
                        )}

                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 4.5 : 2.8}
                          fill={isActive ? "#a855f7" : "rgba(255,255,255,0.52)"}
                          stroke={
                            isActive ? "#ffffff" : "rgba(255,255,255,0.30)"
                          }
                          strokeWidth={isActive ? 1.2 : 0.5}
                          style={{
                            filter: isActive
                              ? "drop-shadow(0 0 7px #a855f7)"
                              : "none",
                            transition: "all 0.35s ease",
                          }}
                        />

                        {isActive && (
                          <g pointerEvents="none">
                            <rect
                              x={x + 9}
                              y={y - 14}
                              width={labelWidth}
                              height="21"
                              rx="5"
                              fill="rgba(8,8,10,0.96)"
                              stroke="rgba(168,85,247,0.65)"
                              strokeWidth="0.7"
                            />

                            <text
                              x={x + 15}
                              y={y}
                              fill="#ffffff"
                              fontSize="7"
                              fontWeight="700"
                              fontFamily="monospace"
                              letterSpacing="0.7"
                            >
                              {city.city}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {mapFeatures.length === 0 && !mapError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center text-[8px] font-mono tracking-widest text-gray-600">
                  LOADING INDIA MAP...
                </div>
              )}

              {mapError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-5">
                  <MapPinned size={28} className="text-purple-500 mb-4" />
                  <p className="text-[9px] font-mono text-gray-500 tracking-widest">
                    INDIA MAP COULD NOT LOAD
                  </p>
                </div>
              )}

              <div className="absolute bottom-2 right-2 z-30 flex items-center gap-2 text-[7px] font-mono text-gray-600 tracking-[0.16em]">
                <span className="w-5 h-[1px] bg-white/20" />
                INDIA NETWORK
              </div>
            </div>
          </div>

          {/* BOTTOM GROWTH */}

          <div className="relative z-30 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span className="text-[7px] sm:text-[8px] font-mono tracking-[0.1em] text-gray-600">
                COMMUNITY GROWTH
              </span>
            </div>

            <span className="text-[8px] font-mono text-purple-400 whitespace-nowrap">
              +{todayIncrement} TODAY
            </span>
          </div>
        </div>

        {/* =================================================
            ZOOM / TUNNEL FX
        ================================================= */}

        <div
          ref={transitionFxRef}
          className="absolute z-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] pointer-events-none opacity-0"
        >
          <div className="absolute inset-0 rounded-full border border-purple-300/70 shadow-[0_0_70px_rgba(168,85,247,0.8)]" />
          <div className="absolute inset-[18%] rounded-full border border-purple-500/60" />
          <div className="absolute inset-[36%] rounded-full bg-purple-500/25 blur-md" />
        </div>

        {/* =================================================
            CITY VIEW OVERLAY
            It appears above the still-mounted India map.
        ================================================= */}

        {exploredCity && (
          <div
            ref={cityOverlayRef}
            className="absolute inset-0 z-50 min-h-[440px] p-5 sm:p-7 overflow-hidden bg-[#0b0b0f]"
          >
            {/* CITY MAP BACKGROUND */}

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-[0.055] bg-[linear-gradient(rgba(168,85,247,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.65)_1px,transparent_1px)] bg-[size:34px_34px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(168,85,247,0.16),transparent_48%)]" />
              <div className="absolute -right-20 -bottom-28 w-[360px] h-[360px] rounded-full border border-purple-500/10" />
              <div className="absolute -right-6 -bottom-14 w-[270px] h-[270px] rounded-full border border-purple-500/10" />
              <div className="absolute right-12 bottom-5 w-[180px] h-[180px] rounded-full border border-purple-500/10" />
            </div>

            <div ref={cityContentRef} className="relative z-20">
              {/* TOP */}

              <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-[8px] font-mono tracking-[0.18em] uppercase">
                    <MapPinned size={13} />
                    INSIDE {exploredCityData.city}
                  </div>

                  <p className="mt-1 text-[7px] font-mono tracking-[0.12em] text-gray-600">
                    CITY MAP / FEATURED PLACE
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCity}
                  disabled={isTransitioning}
                  aria-label="Back to India map"
                  className="w-10 h-10 rounded-full border border-white/10 bg-black/40 hover:bg-white hover:text-black disabled:opacity-40 flex items-center justify-center transition"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[0.75fr_1.25fr] gap-6 md:gap-8 pt-6">
                {/* CITY INFO */}

                <div className="min-w-0">
                  <p className="text-[8px] font-mono tracking-[0.2em] text-gray-600 mb-3">
                    YOU ENTERED
                  </p>

                  <h2 className="text-[clamp(2.6rem,5vw,4.8rem)] font-black uppercase tracking-[-0.07em] leading-[0.82] break-words">
                    {exploredCityData.city}
                  </h2>

                  <p className="mt-4 text-[9px] font-mono tracking-[0.14em] text-purple-400 uppercase">
                    {exploredCityData.state}
                  </p>

                  <div className="mt-6 flex items-end gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-purple-500 tracking-[-0.06em]">
                      {exploredCount}+
                    </span>

                    <span className="pb-1 text-[7px] font-mono tracking-[0.13em] text-gray-600">
                      COMMUNITY
                    </span>
                  </div>

                  <div className="mt-8 border-l-2 border-purple-500 pl-4">
                    <p className="text-[7px] font-mono tracking-[0.18em] text-gray-600">
                      ONE FEATURED PLACE
                    </p>

                    <h3 className="mt-2 text-lg sm:text-xl font-black uppercase leading-tight text-white">
                      {featuredPlace.name}
                    </h3>

                    <p className="mt-2 text-[8px] font-mono tracking-[0.13em] text-purple-400 uppercase">
                      {featuredPlace.area}
                    </p>
                  </div>
                </div>

                {/* LOCAL MAP + ONE FAMOUS PLACE */}

                <div className="relative min-h-[340px] rounded-[24px] border border-white/10 bg-black/25 overflow-hidden group">
                  {/* REAL BEST-PLACE PHOTO */}

                  {featuredImage && (
                    <img
                      src={featuredImage}
                      alt={`${featuredPlace.name} - ${exploredCityData.city}`}
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        opacity-80
                        scale-[1.03]
                        transition-transform
                        duration-[1800ms]
                        ease-out
                        group-hover:scale-[1.09]
                      "
                    />
                  )}

                  {/* LOADING PHOTO */}

                  {featuredImageLoading && (
                    <div className="absolute inset-0 z-[1] bg-[#09090d] flex flex-col items-center justify-center">
                      <span className="relative flex w-12 h-12 mb-4">
                        <span className="absolute inset-0 rounded-full border border-purple-400 animate-ping opacity-30" />

                        <span className="relative w-12 h-12 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
                          <MapPin size={18} className="text-purple-400" />
                        </span>
                      </span>

                      <p className="text-[8px] font-mono tracking-[0.15em] text-gray-600 uppercase">
                        Loading {featuredPlace.name}
                      </p>
                    </div>
                  )}

                  {/* PHOTO FALLBACK */}

                  {!featuredImage && !featuredImageLoading && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_42%,rgba(168,85,247,0.22),transparent_45%),linear-gradient(135deg,#14141a,#08080a)]" />
                  )}

                  {/* CINEMATIC OVERLAY */}

                  <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#07070a] via-black/20 to-black/20 pointer-events-none" />
                  <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/25 via-transparent to-purple-950/10 pointer-events-none" />

                  {/* SOURCE BADGE */}

                  {featuredImage && (
                    <div className="absolute top-4 right-4 z-30 rounded-full border border-white/10 bg-black/55 backdrop-blur-md px-3 py-1.5">
                      <span className="text-[6px] sm:text-[7px] font-mono tracking-[0.11em] text-gray-400 uppercase">
                        Photo • Wikipedia / Wikimedia
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 z-[3] opacity-[0.13] bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:31px_31px]" />

                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full opacity-70 pointer-events-none"
                    aria-hidden="true"
                  >
                    <path
                      d="M -5 76 C 12 57, 28 71, 43 52 S 70 33, 108 17"
                      fill="none"
                      stroke="rgba(168,85,247,0.50)"
                      strokeWidth="0.7"
                      strokeDasharray="2 2"
                    />
                    <path
                      d="M 8 17 C 25 35, 44 18, 58 43 S 76 73, 106 81"
                      fill="none"
                      stroke="rgba(255,255,255,0.20)"
                      strokeWidth="0.55"
                      strokeDasharray="2 3"
                    />
                    <path
                      d="M 20 -5 C 34 19, 26 39, 48 54 S 68 75, 73 105"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="0.45"
                    />
                  </svg>

                  <div
                    style={{
                      left: `${featuredPlace.x || 50}%`,
                      top: `${featuredPlace.y || 50}%`,
                    }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  >
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-purple-400 animate-ping opacity-30" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-purple-500/20 blur-md" />
                    <span className="relative w-12 h-12 rounded-full bg-purple-600 text-white border-2 border-purple-300 flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.85)]">
                      <MapPin size={20} />
                    </span>
                  </div>

                  <div className="absolute z-30 left-4 right-4 bottom-4 rounded-2xl border border-purple-500/25 bg-[#09090d]/95 backdrop-blur-xl p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[7px] font-mono tracking-[0.16em] text-purple-400">
                          {exploredCityData.city} / FAMOUS PLACE
                        </p>

                        <h3 className="mt-1 text-base sm:text-lg font-black uppercase leading-tight">
                          {featuredPlace.name}
                        </h3>

                        <p className="mt-1 text-[8px] font-mono tracking-[0.12em] text-gray-600 uppercase">
                          {featuredPlace.area}
                        </p>
                      </div>

                      <span className="shrink-0 w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <MapPin size={14} className="text-purple-400" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK */}

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <span className="text-[7px] sm:text-[8px] font-mono tracking-[0.12em] text-gray-600">
                  FEATURED PLACE IN {exploredCityData.city}
                </span>

                <button
                  type="button"
                  onClick={closeCity}
                  disabled={isTransitioning}
                  className="text-[8px] font-black tracking-[0.14em] text-purple-400 hover:text-purple-300 disabled:opacity-40 transition"
                >
                  ← BACK TO INDIA MAP
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ARTIST CARD
========================================================= */

function ArtistCard({ artist, index, isNew, onClick }) {
  const normalizedArtist = normalizeArtist(artist);
  const plan = normalizedArtist.plan;

  const isVerified = plan === "verified";
  const isPro = plan === "pro";
  const isBasic = plan === "basic";

  const locationText = [normalizedArtist.city, normalizedArtist.state]
    .filter(Boolean)
    .join(", ");

  const updateState = {
    claimArtistId: normalizedArtist.id,

    artist: {
      id: normalizedArtist.id,
      name: normalizedArtist.name || "",
      studio: normalizedArtist.studio || "",
      city: normalizedArtist.city || "",
      state: normalizedArtist.state || "",
      maskedPhone: maskPhone(normalizedArtist.phone),
    },
  };

  return (
    <article
      onClick={onClick}
      className={`
        group
        relative

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

        cursor-pointer

        transition-all
        duration-300

        last:border-b-0

        ${
          isVerified
            ? `
              bg-gradient-to-r
              from-[#f5c451]/[0.11]
              via-[#f5c451]/[0.035]
              to-transparent

              hover:from-[#f5c451]/[0.16]
            `
            : isPro
              ? `
                bg-gradient-to-r
                from-white/[0.065]
                via-white/[0.02]
                to-transparent

                hover:from-white/[0.10]
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
      {/* GOLD / SILVER SHINE */}
      {isVerified && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
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
        </div>
      )}

      {isPro && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
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
        </div>
      )}

      {/* ===============================================
          PROFILE
      =============================================== */}

      <div
        className={`
          relative
          z-10
          mx-auto

          w-11
          h-11
          sm:w-12
          sm:h-12

          rounded-full
          overflow-hidden

          flex
          items-center
          justify-center

          bg-black

          border-2

          ${
            isVerified
              ? `
                border-[#f5c451]
                shadow-[0_0_18px_rgba(245,196,81,0.30)]
              `
              : isPro
                ? `
                  border-slate-300
                `
                : `
                  border-white/10
                `
          }
        `}
      >
        {isVerified && normalizedArtist.profileImage ? (
          <img
            src={normalizedArtist.profileImage}
            alt={normalizedArtist.name || "Artist"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className={`
              font-black
              text-sm

              ${
                isVerified
                  ? "text-[#f5c451]"
                  : isPro
                    ? "text-slate-200"
                    : "text-purple-400"
              }
            `}
          >
            {normalizedArtist.name?.charAt(0)?.toUpperCase() || "A"}
          </span>
        )}

        {(isPro || isVerified) && (
          <span
            className={`
              absolute
              right-0
              top-0

              w-2
              h-2

              rounded-full

              ${isVerified ? "bg-[#ffd86b]" : "bg-white"}

              animate-pulse
            `}
          />
        )}
      </div>

      {/* ===============================================
          ARTIST / STUDIO
      =============================================== */}

      <div className="relative z-10 min-w-0">
        <p
          className={`
            mb-1

            text-[7px]
            font-mono
            font-black
            tracking-[0.13em]
            uppercase

            ${
              isVerified
                ? "text-[#caa33d]"
                : isPro
                  ? "text-slate-400"
                  : "text-purple-400"
            }
          `}
        >
          {isVerified
            ? "VERIFIED SPOTLIGHT"
            : isPro
              ? "PRO LISTING"
              : normalizedArtist.claimed
                ? "UPDATED BASIC"
                : "DIRECTORY LISTING"}
        </p>

        <h3
          className={`
            truncate

            text-[15px]
            font-black
            uppercase

            ${isVerified ? "text-[#fff1bc]" : "text-white"}
          `}
        >
          {normalizedArtist.name || "Tattoo Artist"}
        </h3>

        {normalizedArtist.studio &&
          normalizedArtist.studio !== normalizedArtist.name && (
            <p
              className="
                mt-1
                truncate
                text-[9px]
                text-gray-600
              "
            >
              {normalizedArtist.studio}
            </p>
          )}
      </div>

      {/* ===============================================
          LOCATION
      =============================================== */}

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
          lg:text-[11px]
          text-gray-400
        "
      >
        <MapPin
          size={13}
          className={`
            shrink-0

            ${
              isVerified
                ? "text-[#f5c451]"
                : isPro
                  ? "text-slate-300"
                  : "text-purple-500"
            }
          `}
        />

        <span className="block min-w-0 truncate">
          {isBasic
            ? normalizedArtist.state || "India"
            : locationText || "India"}
        </span>
      </div>

      {/* ===============================================
          PHONE

          BASIC = HIDDEN
          PRO = HIDDEN
          VERIFIED = SHOWN

          This keeps your current logic.
      =============================================== */}

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
        {isVerified ? normalizedArtist.phone || "—" : "—"}
      </div>

      {/* ===============================================
          EMAIL

          BASIC = HIDDEN
          PRO = SHOWN
          VERIFIED = SHOWN

          Same as your current code.
      =============================================== */}

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
        {isVerified || isPro ? normalizedArtist.email || "—" : "—"}
      </div>

      {/* ===============================================
          PLAN
      =============================================== */}

      <div className="relative z-10 flex min-w-0 justify-center">
        {isVerified ? (
          <span
            className="
              inline-flex
              items-center
              justify-center

              rounded-full

              bg-gradient-to-r
              from-[#c8911f]
              via-[#ffe58d]
              to-[#c8911f]

              min-w-[62px]
              px-2
              sm:px-2.5
              py-1.5

              text-[7px]
              font-black
              tracking-[0.11em]

              text-[#211400]

              shadow-[0_0_14px_rgba(245,196,81,0.25)]
            "
          >
            ★ GOLD
          </span>
        ) : isPro ? (
          <span
            className="
              inline-flex
              items-center
              justify-center

              rounded-full

              bg-gradient-to-r
              from-slate-300
              via-white
              to-slate-300

              min-w-[62px]
              px-2
              sm:px-2.5
              py-1.5

              text-[7px]
              font-black
              tracking-[0.11em]

              text-black
            "
          >
            SILVER PRO
          </span>
        ) : (
          <span
            className="
              inline-flex
              items-center
              justify-center

              rounded-full

              border
              border-purple-500/20

              bg-purple-500/[0.07]

              min-w-[62px]
              px-2
              sm:px-2.5
              py-1.5

              text-[7px]
              font-black
              tracking-[0.11em]

              text-purple-400
            "
          >
            BASIC
          </span>
        )}
      </div>

      {/* ===============================================
          ACTION
      =============================================== */}

      <div
        className="
          relative
          z-10

          flex
          min-w-0
          justify-center
        "
      >
        {/* BASIC */}
        {isBasic ? (
          <Link
            to="/Enter"
            state={updateState}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="
              inline-flex
              w-full
              max-w-[86px]
              items-center
              justify-center
              gap-1.5

              rounded-lg

              border
              border-purple-500/30

              bg-purple-500/10

              px-2
              sm:px-2.5
              py-2.5

              text-[6.5px]
              sm:text-[7px]
              font-black
              tracking-[0.08em]
              whitespace-nowrap

              text-purple-300

              transition

              hover:bg-purple-600
              hover:text-white
            "
          >
            UPDATE
            <ArrowRight size={11} />
          </Link>
        ) : (
          /* PRO / VERIFIED */
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className={`
              inline-flex
              w-full
              max-w-[86px]
              items-center
              justify-center
              gap-1.5

              rounded-lg

              px-2
              sm:px-2.5
              py-2.5

              border

              text-[6.5px]
              sm:text-[7px]
              font-black
              tracking-[0.06em]
              sm:tracking-[0.08em]
              whitespace-nowrap

              transition-all

              ${
                isVerified
                  ? `
                    border-[#f5c451]/35
                    text-[#f5c451]
                    bg-[#f5c451]/[0.06]

                    hover:bg-[#f5c451]
                    hover:text-black
                  `
                  : `
                    border-white/20
                    text-slate-300
                    bg-white/[0.04]

                    hover:bg-white
                    hover:text-black
                  `
              }
            `}
          >
            VIEW
            <ArrowRight size={11} />
          </button>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   ARTIST MODAL
========================================================= */

function ArtistModal({ artist, onClose }) {
  const modalRef = React.useRef(null);
  const normalizedArtist = normalizeArtist(artist);
  const plan = normalizedArtist.plan;

  const isVerified = plan === "verified";
  const isPro = plan === "pro";
  const isBasic = plan === "basic";

  React.useEffect(() => {
    if (!modalRef.current) return undefined;

    const tween = gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.9, y: 25 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
      },
    );

    return () => tween.kill();
  }, []);

  const closeModal = () => {
    if (!modalRef.current) {
      onClose();
      return;
    }

    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 15,
      duration: 0.22,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) closeModal();
  };

  const updateState = {
    claimArtistId: normalizedArtist.id,
    artist: {
      id: normalizedArtist.id,
      name: normalizedArtist.name || "",
      studio: normalizedArtist.studio || "",
      city: normalizedArtist.city || "",
      state: normalizedArtist.state || "",
      maskedPhone: maskPhone(normalizedArtist.phone),
    },
  };

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xl p-4 sm:p-8 flex items-center justify-center overflow-y-auto"
    >
      <div
        ref={modalRef}
        className={`
          relative w-full max-w-[1050px] max-h-[92vh] overflow-y-auto rounded-[30px]
          ${
            isVerified
              ? "border-2 border-[#f5c451] bg-[#110d05] shadow-[0_0_90px_rgba(245,196,81,0.24)] ink-gold-card-pulse"
              : isPro
                ? "border-2 border-[#d8dee8] bg-[#0e1015] shadow-[0_0_70px_rgba(226,232,240,0.13)] ink-silver-card-pulse"
                : "border border-white/10 bg-[#0d0d11]"
          }
        `}
      >
        {(isPro || isVerified) && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`absolute -right-20 -top-20 h-72 w-72 rounded-full blur-[90px] ${
                isVerified ? "bg-[#f5c451]/[0.12]" : "bg-white/[0.055]"
              } ink-premium-float`}
            />

            <div
              className={`absolute -left-1/2 top-0 h-full w-[18%] bg-gradient-to-r from-transparent to-transparent ${
                isVerified
                  ? "via-[#fff2a8]/25 ink-gold-shine"
                  : "via-white/15 ink-silver-shine"
              }`}
            />
          </div>
        )}

        <button
          type="button"
          onClick={closeModal}
          aria-label="Close profile"
          className="absolute top-5 right-5 z-30 w-12 h-12 rounded-full bg-black/70 border border-white/15 hover:bg-white hover:text-black flex items-center justify-center transition"
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div className="relative z-10 p-6 sm:p-10 pr-20 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className={`
                relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-full overflow-hidden bg-black border-[3px]
                ${
                  isVerified
                    ? "border-[#f5c451] shadow-[0_0_36px_rgba(245,196,81,0.40)]"
                    : isPro
                      ? "border-[#d8dee8] shadow-[0_0_28px_rgba(226,232,240,0.18)]"
                      : "border-white/10"
                }
              `}
            >
              {isVerified && normalizedArtist.profileImage ? (
                <img
                  src={normalizedArtist.profileImage}
                  alt={normalizedArtist.name || "Artist"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-4xl font-black ${
                    isVerified
                      ? "text-[#f5c451] bg-[#f5c451]/[0.05]"
                      : isPro
                        ? "text-slate-200 bg-white/[0.03]"
                        : "text-gray-400"
                  }`}
                >
                  {normalizedArtist.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}

              {(isPro || isVerified) && (
                <span
                  className={`absolute right-3 top-3 h-3 w-3 rounded-full ${
                    isVerified
                      ? "bg-[#ffe58d] shadow-[0_0_14px_rgba(255,229,141,1)]"
                      : "bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                  } animate-pulse`}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <p
                  className={`text-[9px] font-mono tracking-[0.16em] ${
                    isVerified
                      ? "text-[#d0aa43]"
                      : isPro
                        ? "text-slate-300"
                        : "text-gray-500"
                  }`}
                >
                  {getPlanLabel(normalizedArtist)}
                </p>

                {isPro && (
                  <span className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-slate-200/35 rounded-full px-3 py-1.5 text-[8px] font-black tracking-[0.12em] text-slate-100 shadow-[0_0_16px_rgba(226,232,240,0.12)]">
                    <Sparkles size={11} /> SILVER PRO
                  </span>
                )}

                {isVerified && (
                  <>
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#b47d12] via-[#ffe58d] to-[#b47d12] rounded-full px-3 py-1.5 text-[8px] font-black tracking-[0.12em] text-[#201300] shadow-[0_0_20px_rgba(245,196,81,0.35)]">
                      <Sparkles size={11} /> GOLD VERIFIED
                    </span>

                    <span className="inline-flex items-center gap-1.5 bg-[#f5c451]/10 border border-[#f5c451]/25 rounded-full px-3 py-1.5 text-[8px] font-black tracking-[0.12em] text-[#ffe39a]">
                      ★ HALL OF FAME
                    </span>
                  </>
                )}
              </div>

              <h2
                className={`text-4xl sm:text-6xl font-black uppercase tracking-[-0.05em] leading-none break-words ${
                  isVerified ? "text-[#fff1bc]" : "text-white"
                }`}
              >
                {normalizedArtist.name || "Tattoo Artist"}
              </h2>

              <div className="flex items-center gap-2 mt-5 text-gray-400">
                <MapPin
                  size={14}
                  className={
                    isVerified
                      ? "text-[#f5c451]"
                      : isPro
                        ? "text-slate-300"
                        : "text-gray-600"
                  }
                />

                {isBasic
                  ? normalizedArtist.state || "India"
                  : [normalizedArtist.city, normalizedArtist.state]
                      .filter(Boolean)
                      .join(", ") || "India"}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="relative z-10 p-6 sm:p-10">
          {isBasic && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                <ModalInfo
                  title="ARTIST / STUDIO"
                  value={normalizedArtist.name || normalizedArtist.studio}
                />
                <ModalInfo title="STATE" value={normalizedArtist.state} />
              </div>

              <div className="mt-8 border border-purple-500/20 bg-purple-500/[0.04] rounded-[22px] p-6 sm:p-7">
                <div className="flex items-center gap-3 text-purple-400">
                  <Sparkles size={17} />
                  <h3 className="text-sm font-black tracking-[0.12em]">
                    UPDATE / CLAIM THIS CARD
                  </h3>
                </div>

                <p className="mt-3 max-w-2xl text-sm text-gray-500 leading-relaxed">
                  Ownership is verified using an OTP sent to the phone number
                  already stored for this directory record. The owner cannot
                  replace that number before verification.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <span className="text-[8px] font-mono tracking-widest text-gray-600">
                    REGISTERED NUMBER
                  </span>
                  <span className="text-xs font-black text-white">
                    {maskPhone(normalizedArtist.phone)}
                  </span>
                </div>
              </div>
            </>
          )}

          {isPro && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                <ModalInfo
                  title="NAME"
                  value={normalizedArtist.name}
                  accent="pro"
                />
                <ModalInfo
                  title="EMAIL"
                  value={normalizedArtist.email}
                  accent="pro"
                />
                <ModalInfo
                  title="CITY"
                  value={normalizedArtist.city}
                  accent="pro"
                />
                <ModalInfo
                  title="STATE"
                  value={normalizedArtist.state}
                  accent="pro"
                />
              </div>

              <div className="relative overflow-hidden mt-8 border border-slate-200/25 bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.025] rounded-[22px] p-6">
                <div className="ink-silver-shine pointer-events-none absolute -left-1/2 top-0 h-full w-[18%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-slate-100">
                      SILVER PRO · ₹1,499 / YEAR
                    </p>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                      City-wise search visibility, higher directory visibility
                      and a Recommended profile position are active.
                    </p>
                  </div>

                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-100 opacity-45" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                  </span>
                </div>
              </div>
            </>
          )}

          {isVerified && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                <ModalInfo
                  title="PHONE"
                  value={normalizedArtist.phone}
                  accent="verified"
                />
                <ModalInfo
                  title="EMAIL"
                  value={normalizedArtist.email}
                  accent="verified"
                />
                <ModalInfo
                  title="CITY"
                  value={normalizedArtist.city}
                  accent="verified"
                />
                <ModalInfo
                  title="STATE"
                  value={normalizedArtist.state}
                  accent="verified"
                />
                <ModalInfo
                  title="STUDIO"
                  value={normalizedArtist.studio}
                  accent="verified"
                />
                <ModalInfo
                  title="EXPERIENCE"
                  value={normalizedArtist.experience}
                  accent="verified"
                />
                <ModalInfo
                  title="INSTAGRAM"
                  value={normalizedArtist.instagram}
                  accent="verified"
                />
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative overflow-hidden border border-[#f5c451]/30 bg-gradient-to-br from-[#f5c451]/[0.10] via-[#f5c451]/[0.05] to-transparent rounded-[22px] p-6">
                  <div className="ink-gold-shine pointer-events-none absolute -left-1/2 top-0 h-full w-[22%] bg-gradient-to-r from-transparent via-[#fff2a8]/35 to-transparent" />

                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[#ffe39a]">
                        <Sparkles size={16} />
                        <p className="text-[9px] font-black tracking-[0.15em]">
                          GOLD VERIFIED · ₹2,999 / YEAR
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        Highest directory priority, complete profile visibility
                        and maximum digital visibility.
                      </p>
                    </div>

                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5c451] opacity-50" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ffe58d] shadow-[0_0_14px_rgba(255,229,141,0.95)]" />
                    </span>
                  </div>
                </div>

                <div className="relative overflow-hidden border border-[#f5c451]/22 bg-[#f5c451]/[0.045] rounded-[22px] p-6">
                  <span className="ink-premium-dot absolute right-6 top-6 h-1.5 w-1.5 rounded-full bg-[#ffe58d] shadow-[0_0_10px_rgba(255,229,141,0.9)]" />
                  <span className="ink-premium-dot absolute right-12 top-12 h-1 w-1 rounded-full bg-[#f5c451] [animation-delay:0.7s]" />

                  <p className="text-[9px] font-black tracking-[0.15em] text-[#ffe39a]">
                    ★ HALL OF FAME
                  </p>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    Gold Verified profiles receive Hall of Fame and premium
                    featured placement according to your directory rules.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-7 py-4 text-[10px] font-black tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
            >
              CLOSE
            </button>

            {isBasic ? (
              <Link
                to="/Enter"
                state={updateState}
                onClick={closeModal}
                className="
                  px-7 py-4 text-center text-[10px] font-black tracking-widest transition
                  bg-purple-600 hover:bg-purple-500 text-white
                "
              >
                UPDATE YOUR CARD
              </Link>
            ) : isPro ? (
              <div className="relative overflow-hidden px-7 py-4 text-center text-[10px] font-black tracking-widest bg-gradient-to-r from-slate-300 via-white to-slate-300 text-black border border-white/70 cursor-default">
                <span className="ink-silver-shine pointer-events-none absolute -left-1/2 top-0 h-full w-[20%] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <span className="relative z-10">✓ ALREADY PRO · SILVER</span>
              </div>
            ) : (
              <div className="relative overflow-hidden px-7 py-4 text-center text-[10px] font-black tracking-widest bg-gradient-to-r from-[#b47d12] via-[#ffe58d] to-[#b47d12] text-[#211400] border border-[#ffe7a0]/70 cursor-default shadow-[0_0_22px_rgba(245,196,81,0.26)]">
                <span className="ink-gold-shine pointer-events-none absolute -left-1/2 top-0 h-full w-[20%] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <span className="relative z-10">★ ALREADY VERIFIED · GOLD</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL CARD INFO
========================================================= */

function InfoRow({ title, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[7px] font-mono tracking-[0.16em] text-gray-600 mb-1">
        {title}
      </p>

      <p className="text-[12px] text-gray-300 truncate" title={value || "-"}>
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   MODAL INFO
========================================================= */

function ModalInfo({ title, value, accent = "purple" }) {
  let accentClass = "text-purple-400";

  if (accent === "pro") accentClass = "text-slate-300";
  if (accent === "verified") accentClass = "text-[#f5c451]";

  return (
    <div className="min-w-0 border-b border-white/10 pb-5">
      <p
        className={`text-[8px] font-mono tracking-[0.2em] uppercase mb-2 ${accentClass}`}
      >
        {title}
      </p>

      <p className="text-base sm:text-lg font-semibold text-white break-words">
        {value || "-"}
      </p>
    </div>
  );
}
