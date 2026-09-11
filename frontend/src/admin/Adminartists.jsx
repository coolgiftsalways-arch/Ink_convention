import { useCallback, useEffect, useState } from "react";

import {
  Trash2,
  Image as ImageIcon,
  Video,
  Clock,
  X,
  FileSpreadsheet,
  Mail,
  KeyRound,
  Trophy,
  CreditCard,
  LayoutDashboard,
  Maximize2,
  Award,
  Sparkles,
  BadgeCheck,
  CircleDashed,
  Search,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../Style/AdminClients.css";
import AdminSidebar from "./AdminSidebar";

// =====================================================
// API URL
// =====================================================

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, 120000);

  try {
    return await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

// =====================================================
// PACKAGE LABELS
// =====================================================

const PACKAGE_NAMES = {
  single: "Single Entry",
  pro: "Professional Bundle",
  multi: "Multi-Entry Bundle",
};

// =====================================================
// SAFE JSON
// =====================================================

const getJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

// =====================================================
// MEDIA ARRAY NORMALIZER
// =====================================================

const normalizeMedia = (media) => {
  if (!media) {
    return [];
  }

  if (Array.isArray(media)) {
    return media;
  }

  if (typeof media === "string") {
    const value = media.trim();

    if (!value) {
      return [];
    }

    // Sometimes MongoDB/API may return:
    // '["uploads/a.jpg","uploads/b.jpg"]'
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return [value];
      }
    }

    return [value];
  }

  return [media];
};

// =====================================================
// GET MEDIA PATH
// =====================================================

const getMediaPath = (media) => {
  if (!media) {
    return "";
  }

  if (typeof media === "string") {
    return media;
  }

  if (typeof media === "object") {
    return (
      media.url ||
      media.path ||
      media.secure_url ||
      media.filePath ||
      media.location ||
      media.src ||
      media.file ||
      media.filename ||
      ""
    );
  }

  return "";
};

// =====================================================
// CREATE CORRECT IMAGE / VIDEO URL
// =====================================================

const getMediaUrl = (media) => {
  let path = getMediaPath(media);

  if (!path) {
    return "";
  }

  path = String(path).trim().replace(/\\/g, "/");

  // Already full URL
  if (
    path.startsWith("https://") ||
    path.startsWith("http://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  // /uploads/file.jpg
  if (path.startsWith("/")) {
    return `${API_URL}${path}`;
  }

  // uploads/file.jpg
  if (path.includes("/")) {
    return `${API_URL}/${path}`;
  }

  // Only filename received
  return `${API_URL}/uploads/${path}`;
};

// =====================================================
// DISPLAY PACKAGE NAME
// =====================================================

const getPackageName = (packageId) => {
  if (!packageId) {
    return "N/A";
  }

  return PACKAGE_NAMES[packageId] || packageId;
};

// =====================================================
// DIRECTORY MEMBERSHIP HELPERS
// =====================================================

const normalizeDirectoryPlan = (value) => {
  const plan = String(value || "basic")
    .trim()
    .toLowerCase();

  if (
    plan === "verified" ||
    plan === "gold" ||
    plan === "spotlight" ||
    plan === "verified spotlight"
  ) {
    return "verified";
  }

  if (plan === "pro" || plan === "silver") {
    return "pro";
  }

  return "basic";
};

const normalizeDirectoryArtist = (source = {}) => ({
  id: source._id || source.id || source.profileId || "",
  name:
    source.name ||
    source.artistName ||
    source.professionalName ||
    "Tattoo Artist",
  studio: source.studio || source.studioName || "",
  email: source.email || source.gmail || "",
  phone: source.phone || "",
  city: source.city || "",
  state: source.state || "",
  plan: normalizeDirectoryPlan(
    source.plan || source.membershipPlan || source.tier,
  ),
  paymentStatus: String(source.paymentStatus || source.payment?.status || "")
    .trim()
    .toLowerCase(),
  profileImage: source.profileImage || source.image || source.photo || "",
  experience: source.experience || "",
  instagram: source.instagram || "",
  bio: source.bio || "",
  website: source.website || source.websiteUrl || "",
  profileLinks: Array.isArray(source.profileLinks) ? source.profileLinks : [],
  claimedAt: source.claimedAt || null,
  tattooStyles: Array.isArray(source.tattooStyles) ? source.tattooStyles : [],
  portfolioImages: Array.isArray(source.portfolioImages)
    ? source.portfolioImages
    : [],

  // A FREE profile is considered claimed if the owner has completed
  // the claim / OTP ownership flow.
  claimed: Boolean(
    source.claimed ||
    source.phoneVerified ||
    source.updatedByOwner ||
    source.ownerVerified,
  ),

  phoneVerified: Boolean(source.phoneVerified),
  updatedByOwner: Boolean(source.updatedByOwner),
  ownerVerified: Boolean(source.ownerVerified),

  planStartedAt: source.planStartedAt || null,
  planExpiresAt: source.planExpiresAt || null,
  paidAt: source.paidAt || null,

  updatedAt: source.updatedAt || source.createdAt || "",
});

const getDirectoryArtistsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.artists)) return data.artists;
  if (Array.isArray(data?.profiles)) return data.profiles;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const hasValidPaidStatus = (artist) => {
  const status = artist.paymentStatus;

  // Some older records may not have paymentStatus.
  // In that case the activated plan remains the source of truth.
  if (!status) return true;

  return ["paid", "success", "successful", "completed", "verified"].includes(
    status,
  );
};

const normalizeMembershipRequest = (source = {}) => ({
  id: source._id || source.id || "",
  profileId:
    typeof source.profileId === "object"
      ? source.profileId?._id || source.profileId?.id || ""
      : source.profileId || "",
  name: source.name || "Tattoo Artist",
  email: source.email || "",
  phone: source.phone || "",
  city: source.city || "",
  state: source.state || "",
  studio: source.studio || "",
  currentPlan: normalizeDirectoryPlan(source.currentPlan),
  requestedPlan: normalizeDirectoryPlan(source.requestedPlan),
  requestedPlanName:
    source.requestedPlanName ||
    (normalizeDirectoryPlan(source.requestedPlan) === "verified"
      ? "GOLD / VERIFIED"
      : "SILVER / PRO"),
  requestedAmount:
    normalizeDirectoryPlan(source.requestedPlan) === "verified" ? 5999 : 2999,
  pricingType: source.pricingType || "standard-membership",
  requestStatus: String(source.requestStatus || "new")
    .trim()
    .toLowerCase(),
  paymentStatus: String(source.paymentStatus || "pending")
    .trim()
    .toLowerCase(),
  createdAt: source.createdAt || "",
  contactedAt: source.contactedAt || "",
  activatedAt: source.activatedAt || "",
});

const membershipRequestDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeCallPhone = (value) =>
  String(value || "")
    .replace(/[^\d+]/g, "")
    .trim();

// =====================================================
// IMAGE COMPONENT
// =====================================================

function MediaImage({ media, alt = "Tattoo image", className = "" }) {
  const [hasError, setHasError] = useState(false);

  const imageUrl = getMediaUrl(media);

  if (!imageUrl || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#111116] text-gray-600 ${className}`}
      >
        <ImageIcon size={32} />

        <span className="mt-2 text-[10px] font-mono uppercase">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      onError={() => {
        console.error("Image failed to load:", imageUrl);

        setHasError(true);
      }}
      className={className}
    />
  );
}

// =====================================================
// MEMBERSHIP DATE / COUNTDOWN HELPERS
// =====================================================

const formatMembershipDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMembershipTimeLeft = (expiresAt, nowMs) => {
  if (!expiresAt) {
    return "Expiry date unavailable";
  }

  const expiryMs = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiryMs)) {
    return "Expiry date unavailable";
  }

  const diff = expiryMs - nowMs;

  if (diff <= 0) {
    return "Expired — changing to Free";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const getArtistTone = (artist = {}) => {
  const plan = normalizeDirectoryPlan(artist.plan);

  if (plan === "verified") {
    return "gold";
  }

  if (plan === "pro") {
    return "silver";
  }

  return artist.claimed ? "claimed" : "unclaimed";
};

const normalizeRequestStatus = (value) =>
  String(value || "new")
    .trim()
    .toLowerCase();

const normalizePaymentStatus = (value) =>
  String(value || "pending")
    .trim()
    .toLowerCase();

const ARTIST_STATUS_STORAGE_KEY = "inkConventionArtistAdminStatuses";

const ARTIST_STATUS_OPTIONS = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "PAID",
  "CANCELLED",
];

const normalizeArtistAdminStatus = (value) => {
  const normalized = String(value || "NEW")
    .trim()
    .toUpperCase();

  return ARTIST_STATUS_OPTIONS.includes(normalized) ? normalized : "NEW";
};

const loadArtistAdminStatuses = () => {
  try {
    const raw = localStorage.getItem(ARTIST_STATUS_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Unable to read artist admin statuses:", error);
    return {};
  }
};

const saveArtistAdminStatuses = (statuses) => {
  try {
    localStorage.setItem(ARTIST_STATUS_STORAGE_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.error("Unable to save artist admin statuses:", error);
  }
};

const getArtistStatusClasses = (status) => {
  const normalized = normalizeArtistAdminStatus(status);

  if (normalized === "PAID") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (normalized === "CONFIRMED") {
    return "border-blue-400/30 bg-blue-400/10 text-blue-300";
  }

  if (normalized === "CONTACTED") {
    return "border-sky-400/30 bg-sky-400/10 text-sky-300";
  }

  if (normalized === "CANCELLED") {
    return "border-red-400/30 bg-red-400/10 text-red-300";
  }

  return "border-purple-400/30 bg-purple-400/10 text-purple-300";
};

const isMembershipRequestPaid = (request = {}) => {
  const requestStatus = normalizeRequestStatus(request.requestStatus);
  const paymentStatus = normalizePaymentStatus(request.paymentStatus);

  return (
    requestStatus === "paid" ||
    ["paid", "success", "successful", "completed"].includes(paymentStatus)
  );
};

const getRequestStatusTone = (status) => {
  const normalized = normalizeRequestStatus(status);

  if (normalized === "contacted") {
    return "border-sky-400/25 bg-sky-400/10 text-sky-300";
  }

  if (normalized === "paid") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (normalized === "completed") {
    return "border-violet-400/25 bg-violet-400/10 text-violet-300";
  }

  if (normalized === "cancelled") {
    return "border-red-400/25 bg-red-400/10 text-red-300";
  }

  return "border-purple-400/25 bg-purple-400/10 text-purple-300";
};

// =====================================================
// DASHBOARD
// =====================================================

function AdminArtists() {
  // ===================================================
  // AUTH
  // ===================================================

  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isLoggedIn") === "true",
  );

  const [loginEmail, setLoginEmail] = useState("");

  const [loginPassword, setLoginPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loginError, setLoginError] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);

  // ===================================================
  // DASHBOARD DATA
  // ===================================================

  const [submissions, setSubmissions] = useState([]);

  const [clientCount, setClientCount] = useState(0);

  const [directoryArtists, setDirectoryArtists] = useState([]);

  // Fast server-side counts. These come from /stats and do NOT wait
  // for all 18k+ directory artists to be downloaded.
  const [directoryStats, setDirectoryStats] = useState({
    total: 0,
    basic: 0,
    silver: 0,
    gold: 0,
    paidSilver: 0,
    paidGold: 0,
    freeClaimed: 0,
    freeUnclaimed: 0,
  });

  const [membershipError, setMembershipError] = useState("");

  // Free artists are intentionally NOT downloaded on page load.
  // They are loaded only when needed.
  const [freeDirectoryArtists, setFreeDirectoryArtists] = useState([]);
  const [freeDirectoryLoaded, setFreeDirectoryLoaded] = useState(false);
  const [freeDirectoryLoading, setFreeDirectoryLoading] = useState(false);

  // Directory membership filter:
  // basic-claimed   = FREE profile claimed by owner
  // basic-unclaimed = imported FREE profile not claimed yet
  // pro             = SILVER ₹2,999
  // verified        = GOLD ₹5,999
  const [membershipFilter, setMembershipFilter] = useState("all");

  // Unified artist status filter, similar to the Stall Booking dashboard.
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState("ALL");

  const [artistAdminStatuses, setArtistAdminStatuses] = useState(() =>
    loadArtistAdminStatuses(),
  );

  // State filter for the directory membership overview.
  const [directoryStateFilter, setDirectoryStateFilter] = useState("ALL");

  // Silver / Gold requests waiting for manual team follow-up.
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [membershipRequestFilter, setMembershipRequestFilter] = useState("all");
  const [membershipRequestAgeFilter, setMembershipRequestAgeFilter] =
    useState("all");
  const [membershipRequestError, setMembershipRequestError] = useState("");
  const [membershipRequestBusyId, setMembershipRequestBusyId] = useState("");
  const [directPlanBusyArtistId, setDirectPlanBusyArtistId] = useState("");

  // Search the real MongoDB directory by artist name, email or phone.
  const [directorySearchQuery, setDirectorySearchQuery] = useState("");
  const [directorySearchResults, setDirectorySearchResults] = useState([]);
  const [directorySearchLoading, setDirectorySearchLoading] = useState(false);
  const [directorySearchError, setDirectorySearchError] = useState("");

  // Live countdown shown on active Silver / Gold memberships.
  const [membershipClock, setMembershipClock] = useState(0);

  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedDirectoryArtist, setSelectedDirectoryArtist] = useState(null);

  const [dashboardError, setDashboardError] = useState("");

  // ===================================================
  // LOGIN
  // ===================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await apiFetch("/api/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          gmail: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      sessionStorage.setItem("isLoggedIn", "true");

      sessionStorage.setItem("userEmail", loginEmail.trim());

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Admin login error:", error);

      if (error?.name === "AbortError") {
        setLoginError("The API server took too long to respond.");
      } else if (error instanceof TypeError) {
        setLoginError(
          "Cannot connect to https://api.inkconvention.com. Check that your live backend is running and CORS allows this frontend.",
        );
      } else {
        setLoginError(error.message || "Unable to connect to server.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");

    sessionStorage.removeItem("userEmail");

    setIsAuthenticated(false);
    setSelectedUser(null);
  };

  // ===================================================
  // FETCH SUBMISSIONS
  // ===================================================

  const fetchUsers = useCallback(async () => {
    try {
      const response = await apiFetch("/api/admin/users");

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tattoo entries.");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to load tattoo entries.");
      }

      const users = Array.isArray(data.users) ? data.users : [];

      console.log("✅ TATTOO USERS:", users);

      users.forEach((user, index) => {
        console.log(`USER ${index + 1} IMAGES:`, user.images);

        console.log(`USER ${index + 1} VIDEOS:`, user.videos);
      });

      setSubmissions(users);
    } catch (error) {
      console.error("❌ User fetch error:", error);

      if (error?.name === "AbortError") {
        throw new Error(
          "Tattoo entries took too long to load from the server.",
        );
      }

      throw error;
    }
  }, []);

  // ===================================================
  // FETCH CLIENT COUNT
  // ===================================================

  const fetchClientCount = useCallback(async () => {
    try {
      const response = await apiFetch("/api/clients");

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load clients.",
        );
      }

      const clients = Array.isArray(data)
        ? data
        : Array.isArray(data.clients)
          ? data.clients
          : Array.isArray(data.users)
            ? data.users
            : [];

      setClientCount(clients.length);

      console.log("✅ CLIENTS LOADED:", clients.length);
    } catch (error) {
      console.error("Client count error:", error);

      setClientCount(0);
    }
  }, []);

  // ===================================================
  // FETCH FAST DIRECTORY STATS
  // Uses MongoDB countDocuments on the backend.
  // Gold/Silver counters update immediately without loading
  // all directory records first.
  // ===================================================

  const fetchDirectoryStats = useCallback(async () => {
    try {
      const response = await apiFetch("/api/admin/tattoo-studios/stats");
      const data = await getJson(response);

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || data.error || "Failed to load directory statistics.",
        );
      }

      const stats = data?.stats || {};

      setDirectoryStats({
        total: Number(stats.total || 0),
        basic: Number(stats.basic ?? stats.free ?? 0),
        silver: Number(stats.silver ?? stats.pro ?? 0),
        gold: Number(stats.gold ?? stats.verified ?? 0),
        paidSilver: Number(stats.paidSilver || 0),
        paidGold: Number(stats.paidGold || 0),
        freeClaimed: Number(stats.freeClaimed ?? stats.claimedFree ?? 0),
        freeUnclaimed: Number(
          stats.freeUnclaimed ??
            stats.unclaimedFree ??
            Math.max(
              Number(stats.basic ?? stats.free ?? 0) -
                Number(stats.freeClaimed ?? stats.claimedFree ?? 0),
              0,
            ),
        ),
      });

      console.log("✅ DIRECTORY STATS:", stats);
    } catch (error) {
      console.error("Directory stats fetch error:", error);
    }
  }, []);

  // ===================================================
  // FETCH SILVER / GOLD DIRECTORY MEMBERS
  // ===================================================

  const fetchMemberships = useCallback(async () => {
    setMembershipError("");

    try {
      // IMPORTANT PERFORMANCE FIX:
      // Do NOT download all 18k+ directory artists.
      // This admin page only needs the active Silver / Gold members
      // for membership cards. Free artists are loaded on demand
      // through search/filter API calls.
      const response = await apiFetch(
        "/api/admin/tattoo-studios?paidOnly=true&page=1&limit=1000",
      );

      const data = await getJson(response);

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load Silver / Gold directory members.",
        );
      }

      const rows = getDirectoryArtistsArray(data)
        .map((artist) => normalizeDirectoryArtist(artist))
        .filter(
          (artist) =>
            (artist.plan === "pro" || artist.plan === "verified") &&
            hasValidPaidStatus(artist),
        )
        .sort((first, second) => {
          const firstTime = new Date(first.updatedAt || 0).getTime();
          const secondTime = new Date(second.updatedAt || 0).getTime();

          return secondTime - firstTime;
        });

      setDirectoryArtists(rows);

      console.log("✅ PAID SILVER/GOLD MEMBERS LOADED:", rows.length);
    } catch (error) {
      console.error("Membership fetch error:", error);

      if (error?.name === "AbortError") {
        setMembershipError(
          "Silver / Gold members took too long to load. Please refresh and try again.",
        );
      } else if (error instanceof TypeError) {
        setMembershipError(
          "Cannot connect to the artist directory API. Check that the backend is online.",
        );
      } else {
        setMembershipError(
          error.message || "Could not load Silver / Gold directory members.",
        );
      }
    }
  }, []);

  const fetchFreeDirectoryPage = useCallback(
    async (force = false) => {
      if (freeDirectoryLoading || (freeDirectoryLoaded && !force)) {
        return;
      }

      setFreeDirectoryLoading(true);
      setMembershipError("");

      try {
        // IMPORTANT:
        // Load claimed Free artists separately so a newly claimed artist is not
        // lost somewhere inside 18k+ imported Free profiles.
        // Unclaimed profiles stay limited to a small preview for performance.
        const [claimedResponse, unclaimedResponse] = await Promise.all([
          apiFetch(
            "/api/admin/tattoo-studios?plan=basic&claimed=true&page=1&limit=1000",
          ),
          apiFetch(
            "/api/admin/tattoo-studios?plan=basic&claimed=false&page=1&limit=100",
          ),
        ]);

        const [claimedData, unclaimedData] = await Promise.all([
          getJson(claimedResponse),
          getJson(unclaimedResponse),
        ]);

        if (!claimedResponse.ok || claimedData.success === false) {
          throw new Error(
            claimedData.message ||
              claimedData.error ||
              "Failed to load Free Claimed artists.",
          );
        }

        if (!unclaimedResponse.ok || unclaimedData.success === false) {
          throw new Error(
            unclaimedData.message ||
              unclaimedData.error ||
              "Failed to load Free Unclaimed artists.",
          );
        }

        const claimedRows = getDirectoryArtistsArray(claimedData)
          .map((artist) => normalizeDirectoryArtist(artist))
          .map((artist) => ({ ...artist, claimed: true }));

        const unclaimedRows = getDirectoryArtistsArray(unclaimedData)
          .map((artist) => normalizeDirectoryArtist(artist))
          .map((artist) => ({ ...artist, claimed: false }));

        const uniqueRows = Array.from(
          new Map(
            [...claimedRows, ...unclaimedRows].map((artist) => [
              String(artist.id),
              artist,
            ]),
          ).values(),
        );

        setFreeDirectoryArtists(uniqueRows);
        setFreeDirectoryLoaded(true);

        console.log(
          "✅ FREE ARTISTS LOADED:",
          `claimed=${claimedRows.length}, unclaimed-preview=${unclaimedRows.length}`,
        );
      } catch (error) {
        console.error("Free artist fetch error:", error);
        setMembershipError(error.message || "Could not load Free artists.");
      } finally {
        setFreeDirectoryLoading(false);
      }
    },
    [freeDirectoryLoaded, freeDirectoryLoading],
  );

  // ===================================================
  // SEARCH DIRECTORY BY NAME / EMAIL / PHONE
  // Searches MongoDB on the backend, so this works even when
  // an email or phone is hidden from the public artist card.
  // ===================================================

  const searchDirectory = useCallback(async (rawQuery) => {
    const query = String(rawQuery || "").trim();

    if (!query) {
      setDirectorySearchResults([]);
      setDirectorySearchError("");
      setDirectorySearchLoading(false);
      return;
    }

    setDirectorySearchLoading(true);
    setDirectorySearchError("");

    try {
      const response = await apiFetch(
        `/api/admin/tattoo-studios?search=${encodeURIComponent(query)}&page=1&limit=100`,
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to search directory artists.",
        );
      }

      const rows = getDirectoryArtistsArray(data).map((artist) =>
        normalizeDirectoryArtist(artist),
      );

      setDirectorySearchResults(rows);
    } catch (error) {
      console.error("Directory search error:", error);
      setDirectorySearchResults([]);
      setDirectorySearchError(
        error.message || "Unable to search artist directory.",
      );
    } finally {
      setDirectorySearchLoading(false);
    }
  }, []);

  // ===================================================
  // FETCH SILVER / GOLD MEMBERSHIP REQUESTS
  // ===================================================

  const fetchMembershipRequests = useCallback(async () => {
    setMembershipRequestError("");

    try {
      const response = await apiFetch("/api/membership-requests");
      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load Silver / Gold membership requests.",
        );
      }

      // Silver / Gold Requests should contain ONLY requests that still
      // need admin action. Completed/cancelled history is intentionally
      // hidden from this section.
      const requests = Array.isArray(data?.requests)
        ? data.requests
            .map(normalizeMembershipRequest)
            .filter((request) =>
              ["new", "contacted"].includes(request.requestStatus),
            )
        : [];

      setMembershipRequests(requests);
    } catch (error) {
      console.error("Membership request fetch error:", error);

      setMembershipRequests([]);

      if (error?.name === "AbortError") {
        setMembershipRequestError(
          "The server is taking too long to load membership requests. Please refresh and try again.",
        );
      } else if (error instanceof TypeError) {
        setMembershipRequestError(
          "Cannot connect to the membership API. Check that the backend is online and CORS is configured correctly.",
        );
      } else {
        setMembershipRequestError(
          error.message || "Could not load membership requests.",
        );
      }
    }
  }, []);

  // ===================================================
  // MEMBERSHIP REQUEST ACTIONS
  // ===================================================

  const handleMembershipRequestAction = useCallback(
    async (request, action) => {
      if (!request?.id || !action) {
        return;
      }

      if (action === "paid") {
        const confirmed = window.confirm(
          `Mark ${request.name}'s membership request as PAID?`,
        );

        if (!confirmed) {
          return;
        }
      }

      if (action === "activate") {
        const planLabel =
          request.requestedPlan === "verified" ? "Gold" : "Silver";

        const confirmed = window.confirm(
          `Mark this request DONE and activate ${planLabel} for ${request.name}?`,
        );

        if (!confirmed) {
          return;
        }
      }

      if (action === "cancel") {
        const confirmed = window.confirm(
          `Cancel the membership request from ${request.name}?`,
        );

        if (!confirmed) {
          return;
        }
      }

      setMembershipRequestBusyId(request.id);
      setMembershipRequestError("");

      try {
        const response = await apiFetch(
          `/api/membership-requests/${request.id}/${action}`,
          {
            method: "PATCH",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        );

        const data = await getJson(response);

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message ||
              data.error ||
              "Unable to update membership request.",
          );
        }

        // After activation, immediately remove the request card and make
        // the artist appear under Artist Status Filter -> PAID.
        if (action === "activate") {
          setMembershipRequests((previous) =>
            previous.filter((item) => item.id !== request.id),
          );

          if (request.profileId) {
            setArtistAdminStatuses((previous) => {
              const updated = {
                ...previous,
                [String(request.profileId)]: "PAID",
              };

              saveArtistAdminStatuses(updated);
              return updated;
            });
          }
        }

        // Cancelled requests should also disappear from the pending request area.
        if (action === "cancel") {
          setMembershipRequests((previous) =>
            previous.filter((item) => item.id !== request.id),
          );
        }

        // Do NOT reload the complete 18k+ artist directory here.
        // Update the changed artist locally, then refresh only the small
        // request list + fast stats endpoint.
        if (data?.artist) {
          const updatedArtist = normalizeDirectoryArtist(data.artist);

          setDirectoryArtists((previous) => {
            const exists = previous.some(
              (item) => String(item.id) === String(updatedArtist.id),
            );

            if (exists) {
              return previous.map((item) =>
                String(item.id) === String(updatedArtist.id)
                  ? { ...item, ...updatedArtist }
                  : item,
              );
            }

            return [updatedArtist, ...previous];
          });
        }

        await Promise.all([fetchMembershipRequests(), fetchDirectoryStats()]);
      } catch (error) {
        console.error("Membership request action error:", error);
        setMembershipRequestError(
          error.message || "Unable to update membership request.",
        );
      } finally {
        setMembershipRequestBusyId("");
      }
    },
    [fetchMembershipRequests, fetchDirectoryStats],
  );

  // ===================================================
  // DELETE SILVER / GOLD MEMBERSHIP REQUEST
  // ===================================================

  const handleDeleteMembershipRequest = useCallback(async (request) => {
    if (!request?.id) {
      setMembershipRequestError(
        "Cannot delete this membership request because its ID is missing.",
      );
      return;
    }

    const planLabel = request.requestedPlan === "verified" ? "Gold" : "Silver";

    const confirmed = window.confirm(
      `Delete ${request.name}'s ${planLabel} membership request permanently?`,
    );

    if (!confirmed) {
      return;
    }

    setMembershipRequestBusyId(request.id);
    setMembershipRequestError("");

    try {
      const response = await apiFetch(
        `/api/membership-requests/${request.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      const data = await getJson(response);

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || data.error || "Unable to delete membership request.",
        );
      }

      // Remove only this card immediately from the dashboard.
      setMembershipRequests((previous) =>
        previous.filter((item) => item.id !== request.id),
      );
    } catch (error) {
      console.error("Delete membership request error:", error);

      if (error?.name === "AbortError") {
        setMembershipRequestError(
          "The server took too long to delete the membership request.",
        );
      } else if (error instanceof TypeError) {
        setMembershipRequestError(
          "Cannot connect to the membership API. Check that the backend is online.",
        );
      } else {
        setMembershipRequestError(
          error.message || "Unable to delete membership request.",
        );
      }
    } finally {
      setMembershipRequestBusyId("");
    }
  }, []);

  // ===================================================
  // DIRECT ADMIN PLAN CHANGE
  // FREE -> SILVER / GOLD
  // SILVER -> FREE / GOLD
  // GOLD -> SILVER / FREE
  // DASHBOARD ONLY
  // ===================================================

  const handleDirectPlanActivation = useCallback(
    async (artist, targetPlan) => {
      if (!artist?.id || !["basic", "pro", "verified"].includes(targetPlan)) {
        return;
      }

      const planLabel =
        targetPlan === "verified"
          ? "Gold"
          : targetPlan === "pro"
            ? "Silver"
            : "Free";

      const currentArtistPlan = normalizeDirectoryPlan(artist.plan);

      const isDowngradeToSilver =
        currentArtistPlan === "verified" && targetPlan === "pro";

      const confirmed = window.confirm(
        targetPlan === "basic"
          ? `Make ${artist.name} Free? This will immediately remove the active Silver/Gold public benefits.`
          : isDowngradeToSilver
            ? `Make ${artist.name} Silver? This will downgrade the current Gold membership to Silver.`
            : `Make ${artist.name} ${planLabel}? Only continue after you have manually confirmed the payment.`,
      );

      if (!confirmed) {
        return;
      }

      setDirectPlanBusyArtistId(artist.id);
      setMembershipError("");

      try {
        const response = await apiFetch(
          "/api/membership-requests/admin/activate-profile",
          {
            method: "PATCH",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profileId: artist.id,
              plan: targetPlan,
            }),
          },
        );

        const data = await getJson(response);

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || data.error || "Unable to activate membership.",
          );
        }

        const updatedArtist = data?.artist
          ? normalizeDirectoryArtist(data.artist)
          : {
              ...artist,
              plan: targetPlan,
              paymentStatus: targetPlan === "basic" ? "unpaid" : "paid",
            };

        // Update this artist immediately in the UI.
        setDirectoryArtists((previous) => {
          // directoryArtists stores paid Silver/Gold only.
          if (updatedArtist.plan === "basic") {
            return previous.filter(
              (item) => String(item.id) !== String(updatedArtist.id),
            );
          }

          const exists = previous.some(
            (item) => String(item.id) === String(updatedArtist.id),
          );

          if (exists) {
            return previous.map((item) =>
              String(item.id) === String(updatedArtist.id)
                ? { ...item, ...updatedArtist }
                : item,
            );
          }

          return [updatedArtist, ...previous];
        });

        setFreeDirectoryArtists((previous) => {
          if (updatedArtist.plan !== "basic") {
            return previous.filter(
              (item) => String(item.id) !== String(updatedArtist.id),
            );
          }

          const exists = previous.some(
            (item) => String(item.id) === String(updatedArtist.id),
          );

          if (exists) {
            return previous.map((item) =>
              String(item.id) === String(updatedArtist.id)
                ? { ...item, ...updatedArtist }
                : item,
            );
          }

          return [updatedArtist, ...previous];
        });

        // If a pending membership request existed for this artist,
        // the backend completes it. Remove it immediately from the queue.
        setMembershipRequests((previous) =>
          previous.filter(
            (request) =>
              String(request.profileId || "") !== String(artist.id || ""),
          ),
        );

        // Only refresh lightweight endpoints.
        // This makes Free / Silver / Gold changes feel immediate.
        await Promise.all([fetchDirectoryStats(), fetchMembershipRequests()]);
      } catch (error) {
        console.error("Direct membership activation error:", error);
        setMembershipError(
          error.message || "Unable to activate membership from dashboard.",
        );
      } finally {
        setDirectPlanBusyArtistId("");
      }
    },
    [fetchMembershipRequests, fetchDirectoryStats],
  );

  // ===================================================
  // ARTIST CARD STATUS
  // Same workflow as Stall Booking dashboard
  // ===================================================

  const handleArtistStatusChange = useCallback((artistId, nextStatus) => {
    const id = String(artistId || "").trim();

    if (!id) {
      return;
    }

    const normalizedStatus = normalizeArtistAdminStatus(nextStatus);

    setArtistAdminStatuses((previous) => {
      const updated = {
        ...previous,
        [id]: normalizedStatus,
      };

      saveArtistAdminStatuses(updated);

      return updated;
    });
  }, []);

  // ===================================================
  // REFRESH DASHBOARD
  // ===================================================

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setDashboardError("");

    try {
      // FAST data only. These requests should finish quickly.
      const results = await Promise.allSettled([
        fetchUsers(),
        fetchClientCount(),
        fetchDirectoryStats(),
        fetchMembershipRequests(),
      ]);

      const failed = results.filter((result) => result.status === "rejected");

      if (failed.length > 0) {
        console.warn(
          `⚠️ ${failed.length} admin artist request(s) failed.`,
          failed,
        );
      }

      // Load only active Silver / Gold members.
      // This is a small request and does not scan/download all 18k+ artists.
      void fetchMemberships();
      void fetchFreeDirectoryPage(true);
    } catch (error) {
      console.error("Admin artists refresh error:", error);

      setDashboardError(
        error.message || "Could not load some artist dashboard data.",
      );

      // Still allow paid Silver / Gold members to attempt loading.
      void fetchMemberships();
    } finally {
      // Refresh button becomes available as soon as the fast dashboard
      // data has returned. It does not wait for 18k+ artist records.
      setLoading(false);
    }
  }, [
    fetchUsers,
    fetchClientCount,
    fetchDirectoryStats,
    fetchMembershipRequests,
    fetchMemberships,
    fetchFreeDirectoryPage,
  ]);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, refreshDashboard]);

  // Search after the admin stops typing for a moment.
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const query = directorySearchQuery.trim();

    // Search only after at least 3 characters.
    // Example: "Ahm" -> Ahmed, Ahmad, Ahmer...
    if (query.length < 3) {
      const clearTimer = window.setTimeout(() => {
        setDirectorySearchResults([]);
        setDirectorySearchError("");
        setDirectorySearchLoading(false);
      }, 0);

      return () => {
        window.clearTimeout(clearTimer);
      };
    }

    const timer = window.setTimeout(() => {
      void searchDirectory(query);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [directorySearchQuery, isAuthenticated, searchDirectory]);

  // Live Silver / Gold expiry countdown.
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const updateClock = () => {
      setMembershipClock(Date.now());
    };

    const initialTimer = window.setTimeout(updateClock, 0);
    const timer = window.setInterval(updateClock, 60000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [isAuthenticated]);

  // ===================================================
  // DELETE SUBMISSION
  // ===================================================

  const handleDelete = async (event, id) => {
    if (event) {
      event.stopPropagation();
    }

    if (!id) {
      alert("Cannot delete because the entry ID is missing.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this tattoo submission?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiFetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await getJson(response);

      if (response.ok && data.success) {
        setSubmissions((previous) =>
          previous.filter((item) => item._id !== id),
        );

        if (selectedUser?._id === id) {
          setSelectedUser(null);
        }

        return;
      }

      alert(data.message || "Unable to delete entry.");
    } catch (error) {
      console.error("Delete error:", error);

      alert("Network error while deleting entry.");
    }
  };

  // ===================================================
  // EXPORT CSV
  // ===================================================

  const handleExportToExcel = () => {
    if (submissions.length === 0) {
      alert("There are no entries to export.");

      return;
    }

    const escapeCsv = (value) => {
      const text = value === undefined || value === null ? "" : String(value);

      return `"${text.replace(/"/g, '""')}"`;
    };

    const headings = [
      "Entry ID",
      "First Name",
      "Last Name",
      "Professional Name",
      "Email",
      "Phone",
      "City",
      "State",
      "Country",
      "Category",
      "Package",
      "Tattoo Title",
      "Tattoo Description",
      "Images",
      "Videos",
      "Razorpay Order ID",
      "Razorpay Payment ID",
      "Created At",
    ];

    const rows = submissions.map((item) => {
      const images = normalizeMedia(item.images);

      const videos = normalizeMedia(item.videos);

      return [
        item.entryId,
        item.firstName,
        item.lastName,
        item.professionalName,
        item.gmail,
        item.phone,
        item.city,
        item.state,
        item.country,
        item.category,
        getPackageName(item.entryPackage),
        item.tattooTitle,
        item.description,
        images.length,
        videos.length,
        item.razorpay_order_id,
        item.razorpay_payment_id,
        item.createdAt,
      ]
        .map(escapeCsv)
        .join(",");
    });

    const csv = [headings.join(","), ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = `ink_convention_entries_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  };

  // ===================================================
  // LOGIN PAGE
  // ===================================================

  if (!isAuthenticated) {
    return (
      <div className="relative w-full min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-[#0b0b0f] border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest mb-4">
              <KeyRound size={11} />
              Restricted Access
            </div>

            <h1 className="text-4xl font-black tracking-tight">
              Admin Dashboard
              <span className="text-[#a855f7]">.</span>
            </h1>

            <p className="text-gray-500 text-xs font-mono mt-3">
              Ink Convention 2026
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono text-gray-400">
                <Mail size={13} />
                Email Address
              </label>

              <input
                type="email"
                autoComplete="username"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="admin@inkconvention.com"
                className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono text-gray-400">
                <KeyRound size={13} />
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-20 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#a855f7]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-mono bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest transition"
            >
              {loginLoading ? "Logging In..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===================================================
  // NON-BLOCKING LOADING
  // ===================================================
  // Do not return a full-screen loading page here.
  // The Admin Artists page renders immediately while APIs load
  // and each section updates as soon as its own data arrives.

  // ===================================================
  // MEDIA COUNT
  // ===================================================

  const totalMedia = submissions.reduce(
    (total, user) =>
      total +
      normalizeMedia(user.images).length +
      normalizeMedia(user.videos).length,
    0,
  );

  const paidDirectoryArtists = directoryArtists;

  const combinedDirectoryArtists = [
    ...paidDirectoryArtists,
    ...freeDirectoryArtists.filter(
      (freeArtist) =>
        !paidDirectoryArtists.some(
          (paidArtist) => String(paidArtist.id) === String(freeArtist.id),
        ),
    ),
  ];

  const freeClaimedMembers = freeDirectoryArtists.filter(
    (artist) => artist.plan === "basic" && artist.claimed,
  );

  const freeUnclaimedMembers = freeDirectoryArtists.filter(
    (artist) => artist.plan === "basic" && !artist.claimed,
  );

  const silverMembers = paidDirectoryArtists.filter(
    (artist) => artist.plan === "pro",
  );

  const goldMembers = paidDirectoryArtists.filter(
    (artist) => artist.plan === "verified",
  );

  // ===================================================
  // DIRECTORY STATE FILTER + COUNTS
  // ===================================================

  const directoryStateOptions = [
    "ALL",
    ...Array.from(
      new Set(
        combinedDirectoryArtists
          .map((artist) =>
            String(artist.state || "")
              .trim()
              .toUpperCase(),
          )
          .filter(Boolean),
      ),
    ).sort((first, second) => first.localeCompare(second)),
  ];

  const stateFilteredDirectoryArtists =
    directoryStateFilter === "ALL"
      ? combinedDirectoryArtists
      : combinedDirectoryArtists.filter(
          (artist) =>
            String(artist.state || "")
              .trim()
              .toUpperCase() === directoryStateFilter,
        );

  const stateFreeArtists = stateFilteredDirectoryArtists.filter(
    (artist) => artist.plan === "basic",
  );

  const stateSilverArtists = stateFilteredDirectoryArtists.filter(
    (artist) => artist.plan === "pro",
  );

  const stateGoldArtists = stateFilteredDirectoryArtists.filter(
    (artist) => artist.plan === "verified",
  );

  const selectedStateLabel =
    directoryStateFilter === "ALL" ? "ALL STATES" : directoryStateFilter;

  const membershipRequestCounts = {
    all: membershipRequests.length,
    new: membershipRequests.filter((request) => request.requestStatus === "new")
      .length,
    contacted: membershipRequests.filter(
      (request) => request.requestStatus === "contacted",
    ).length,
    paid: membershipRequests.filter((request) =>
      isMembershipRequestPaid(request),
    ).length,
  };

  const requestAgeMatches = (request) => {
    if (membershipRequestAgeFilter === "all") {
      return true;
    }

    const created = new Date(request.createdAt).getTime();

    if (!Number.isFinite(created)) {
      return false;
    }

    const age = membershipClock - created;
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;

    if (membershipRequestAgeFilter === "48h") {
      return age <= 48 * HOUR;
    }

    if (membershipRequestAgeFilter === "1w") {
      return age <= 7 * DAY;
    }

    if (membershipRequestAgeFilter === "2w") {
      return age <= 14 * DAY;
    }

    return true;
  };

  const filteredMembershipRequests = membershipRequests.filter((request) => {
    if (!requestAgeMatches(request)) {
      return false;
    }

    if (membershipRequestFilter === "all") {
      return true;
    }

    if (membershipRequestFilter === "paid") {
      return isMembershipRequestPaid(request);
    }

    return request.requestStatus === membershipRequestFilter;
  });

  const filterMembersByState = (members) =>
    directoryStateFilter === "ALL"
      ? members
      : members.filter(
          (artist) =>
            String(artist.state || "")
              .trim()
              .toUpperCase() === directoryStateFilter,
        );

  const latestMembershipRequestByProfile = membershipRequests.reduce(
    (accumulator, request) => {
      const key = String(request.profileId || "").trim();

      if (!key) {
        return accumulator;
      }

      const previous = accumulator[key];
      const currentTime = new Date(request.createdAt || 0).getTime() || 0;
      const previousTime = new Date(previous?.createdAt || 0).getTime() || 0;

      if (!previous || currentTime >= previousTime) {
        accumulator[key] = request;
      }

      return accumulator;
    },
    {},
  );

  const getDirectoryArtistStatus = (artist) => {
    const artistId = String(artist?.id || "").trim();
    const artistPlan = normalizeDirectoryPlan(artist?.plan);

    // IMPORTANT:
    // Once an artist has an active Silver or Gold membership,
    // the real membership plan is the source of truth.
    // This prevents an old localStorage status such as NEW/CONTACTED
    // from hiding an activated Silver/Gold artist from the PAID filter.
    if (artistPlan === "pro" || artistPlan === "verified") {
      return "PAID";
    }

    const request = latestMembershipRequestByProfile[artistId];

    const requestStatus = String(request?.requestStatus || "")
      .trim()
      .toUpperCase();

    const paymentStatus = String(
      request?.paymentStatus || artist?.paymentStatus || "",
    )
      .trim()
      .toUpperCase();

    if (
      requestStatus === "PAID" ||
      ["PAID", "SUCCESS", "SUCCESSFUL", "COMPLETED", "VERIFIED"].includes(
        paymentStatus,
      )
    ) {
      return "PAID";
    }

    if (requestStatus === "CONTACTED") {
      return "CONTACTED";
    }

    if (requestStatus === "CONFIRMED") {
      return "CONFIRMED";
    }

    if (requestStatus === "CANCELLED") {
      return "CANCELLED";
    }

    if (artistId && artistAdminStatuses[artistId]) {
      return normalizeArtistAdminStatus(artistAdminStatuses[artistId]);
    }

    return "NEW";
  };

  const planFilteredDirectoryArtists = filterMembersByState(
    combinedDirectoryArtists,
  ).filter((artist) => {
    if (membershipFilter === "all") {
      return true;
    }

    if (membershipFilter === "free-claimed") {
      return artist.plan === "basic" && artist.claimed;
    }

    if (membershipFilter === "free-unclaimed") {
      return artist.plan === "basic" && !artist.claimed;
    }

    if (membershipFilter === "pro") {
      return artist.plan === "pro";
    }

    if (membershipFilter === "verified") {
      return artist.plan === "verified";
    }

    return true;
  });

  const visibleDirectoryMembers = planFilteredDirectoryArtists.filter(
    (artist) => {
      if (directoryStatusFilter === "ALL") {
        return true;
      }

      return getDirectoryArtistStatus(artist) === directoryStatusFilter;
    },
  );

  const selectedMembership =
    membershipFilter === "verified"
      ? {
          title: "Gold Verified",
          price: "₹5,999",
          members: visibleDirectoryMembers,
          tone: "gold",
          icon: <Trophy size={18} />,
          description:
            "Gold artists matching the selected state and status filters.",
        }
      : membershipFilter === "pro"
        ? {
            title: "Silver Pro",
            price: "₹2,999",
            members: visibleDirectoryMembers,
            tone: "silver",
            icon: <Award size={18} />,
            description:
              "Silver artists matching the selected state and status filters.",
          }
        : membershipFilter === "free-claimed"
          ? {
              title: "Free Claimed",
              price: "₹0",
              members: visibleDirectoryMembers,
              tone: "claimed",
              icon: <BadgeCheck size={18} />,
              description:
                "Free profiles whose owners completed the OTP claim flow.",
            }
          : membershipFilter === "free-unclaimed"
            ? {
                title: "Free Unclaimed",
                price: "₹0",
                members: visibleDirectoryMembers,
                tone: "unclaimed",
                icon: <CircleDashed size={18} />,
                description:
                  "Imported Free profiles that have not been claimed by their owners yet.",
              }
            : {
                title: "All Directory Artists",
                price: "",
                members: visibleDirectoryMembers,
                tone: "all",
                icon: <LayoutDashboard size={18} />,
                description:
                  "Free, Silver and Gold artists matching the selected filters.",
              };

  const directoryStatusCounts = {
    ALL: planFilteredDirectoryArtists.length,
    NEW: planFilteredDirectoryArtists.filter(
      (artist) => getDirectoryArtistStatus(artist) === "NEW",
    ).length,
    CONTACTED: planFilteredDirectoryArtists.filter(
      (artist) => getDirectoryArtistStatus(artist) === "CONTACTED",
    ).length,
    CONFIRMED: planFilteredDirectoryArtists.filter(
      (artist) => getDirectoryArtistStatus(artist) === "CONFIRMED",
    ).length,
    PAID: planFilteredDirectoryArtists.filter(
      (artist) => getDirectoryArtistStatus(artist) === "PAID",
    ).length,
    CANCELLED: planFilteredDirectoryArtists.filter(
      (artist) => getDirectoryArtistStatus(artist) === "CANCELLED",
    ).length,
  };

  // ===================================================
  // DASHBOARD
  // ===================================================

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white flex">
      <AdminSidebar
        onLogout={handleLogout}
        tattooCount={submissions.length}
        clientCount={clientCount}
      />

      <main className="flex-1 lg:pl-72 py-10 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-[10px] font-mono uppercase tracking-widest mb-4">
                <Trophy size={13} />
                Ink Convention 2026
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter">
                Tattoo Submissions
                <span className="text-[#a855f7]">.</span>
              </h1>

              <p className="text-gray-500 mt-3 max-w-2xl text-sm sm:text-base">
                View tattoo artists, uploaded images, videos, competition
                packages and payment information.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refreshDashboard}
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono uppercase tracking-wider"
              >
                {loading ? "Updating..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={handleExportToExcel}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider"
              >
                <FileSpreadsheet size={15} />
                Export CSV
              </button>
            </div>
          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {dashboardError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {dashboardError}
            </div>
          )}

          {/* ==========================================
              STATS
          ========================================== */}

          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            <DashboardStat label="Tattoo Entries" value={submissions.length} />

            <DashboardStat label="Media Files" value={totalMedia} highlight />

            <DashboardStat label="Clients" value={clientCount} />

            <DashboardStat
              label="Free Claimed"
              value={
                directoryStateFilter === "ALL"
                  ? directoryStats.freeClaimed
                  : filterMembersByState(freeClaimedMembers).length
              }
              tone="claimed"
            />

            <DashboardStat
              label="Free Unclaimed"
              value={
                directoryStateFilter === "ALL"
                  ? directoryStats.freeUnclaimed
                  : filterMembersByState(freeUnclaimedMembers).length
              }
              tone="unclaimed"
            />

            <DashboardStat
              label="Silver Pro ₹2,999"
              value={
                directoryStateFilter === "ALL"
                  ? directoryStats.paidSilver
                  : filterMembersByState(silverMembers).length
              }
              tone="silver"
            />

            <DashboardStat
              label="Gold Verified ₹5,999"
              value={
                directoryStateFilter === "ALL"
                  ? directoryStats.paidGold
                  : filterMembersByState(goldMembers).length
              }
              tone="gold"
            />

            <DashboardStat label="Server" value="LIVE" />
          </div>

          {/* ==========================================
              SILVER / GOLD MEMBERSHIP REQUESTS
          ========================================== */}

          <section className="space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a855f7]">
                  Membership Requests
                </p>

                <h2 className="text-2xl sm:text-3xl font-black mt-2">
                  Silver / Gold Requests
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Only pending Silver / Gold requests are shown here. Contact
                  the artist, confirm payment, then activate the membership.
                </p>
              </div>

              <p className="text-xs font-mono text-gray-600">
                {membershipRequests.length} ACTIVE REQUESTS
              </p>
            </div>

            {membershipRequestError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {membershipRequestError}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ["all", "ALL", membershipRequestCounts.all],
                ["new", "NEW", membershipRequestCounts.new],
                ["contacted", "CONTACTED", membershipRequestCounts.contacted],
                ["paid", "PAID", membershipRequestCounts.paid],
              ].map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMembershipRequestFilter(value)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    membershipRequestFilter === value
                      ? "border-[#a855f7]/80 bg-[#a855f7]/10"
                      : "border-white/10 bg-[#0b0b0f] hover:border-white/20"
                  }`}
                >
                  <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {label}
                  </span>
                  <span className="block mt-1 text-xl font-black">{count}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Request Time Filter
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Use the status buttons above to filter requests. ALL TIME is
                    selected by default.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ["48h", "48 HOURS"],
                    ["1w", "1 WEEK"],
                    ["2w", "2 WEEKS"],
                    ["all", "ALL TIME"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMembershipRequestAgeFilter(value)}
                      className={`rounded-lg border px-3 py-2 text-[9px] font-black uppercase tracking-wider transition ${
                        membershipRequestAgeFilter === value
                          ? "border-[#a855f7]/80 bg-[#a855f7]/10 text-white"
                          : "border-white/10 bg-black/20 text-gray-500 hover:border-white/20"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredMembershipRequests.length === 0 ? (
              <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl px-5 py-14 text-center">
                <CreditCard size={36} className="mx-auto text-gray-700" />

                <h3 className="text-lg font-bold mt-4">
                  No Membership Requests
                </h3>

                <p className="text-gray-500 text-sm mt-2">
                  Requests matching this filter will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredMembershipRequests.map((request) => {
                  const isGoldRequest = request.requestedPlan === "verified";
                  const isCompleted = request.requestStatus === "completed";
                  const isCancelled = request.requestStatus === "cancelled";
                  const isPaid = isMembershipRequestPaid(request);
                  const isPending = !isPaid && !isCompleted && !isCancelled;
                  const busy = membershipRequestBusyId === request.id;
                  const callPhone = normalizeCallPhone(request.phone);

                  return (
                    <div
                      key={request.id}
                      className="rounded-3xl border border-white/10 bg-[#0b0b0f] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xl font-black truncate">
                            {request.name}
                          </p>

                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {request.studio || "Studio not provided"}
                          </p>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                              isGoldRequest
                                ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                                : "border-slate-300/20 bg-slate-300/10 text-slate-200"
                            }`}
                          >
                            {isGoldRequest
                              ? "APPLIED FOR GOLD"
                              : "APPLIED FOR SILVER"}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${getRequestStatusTone(
                              request.requestStatus,
                            )}`}
                          >
                            {normalizeRequestStatus(request.requestStatus)}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${
                              isMembershipRequestPaid(request)
                                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                                : "border-orange-400/20 bg-orange-400/10 text-orange-300"
                            }`}
                          >
                            PAYMENT:{" "}
                            {isMembershipRequestPaid(request)
                              ? "PAID"
                              : normalizePaymentStatus(request.paymentStatus)}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`mt-4 rounded-xl border px-4 py-3 ${
                          isGoldRequest
                            ? "border-amber-400/30 bg-amber-400/[0.08]"
                            : "border-slate-300/25 bg-slate-300/[0.07]"
                        }`}
                      >
                        <p className="text-[8px] font-mono uppercase tracking-[0.16em] text-gray-500">
                          User Membership Choice
                        </p>
                        <p
                          className={`mt-1 text-sm font-black uppercase tracking-wide ${
                            isGoldRequest ? "text-amber-300" : "text-slate-100"
                          }`}
                        >
                          {isCompleted
                            ? isGoldRequest
                              ? "APPLIED FOR GOLD • NOW ACTIVE"
                              : "APPLIED FOR SILVER • NOW ACTIVE"
                            : isGoldRequest
                              ? "APPLIED FOR GOLD"
                              : "APPLIED FOR SILVER"}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <MembershipInfo
                          label="Amount"
                          value={`₹${(normalizeDirectoryPlan(
                            request.requestedPlan,
                          ) === "verified"
                            ? 5999
                            : 2999
                          ).toLocaleString("en-IN")}`}
                        />
                        <MembershipInfo
                          label="Request Status"
                          value={normalizeRequestStatus(
                            request.requestStatus,
                          ).toUpperCase()}
                        />

                        <MembershipInfo
                          label="Payment Status"
                          value={
                            isMembershipRequestPaid(request)
                              ? "PAID"
                              : normalizePaymentStatus(
                                  request.paymentStatus,
                                ).toUpperCase()
                          }
                        />
                        <MembershipInfo
                          label="Phone"
                          value={request.phone || "N/A"}
                        />
                        <MembershipInfo
                          label="Email"
                          value={request.email || "N/A"}
                        />
                        <MembershipInfo
                          label="City"
                          value={request.city || "N/A"}
                        />
                        <MembershipInfo
                          label="Submitted"
                          value={membershipRequestDate(request.createdAt)}
                        />
                      </div>

                      {request.pricingType === "silver-to-gold-upgrade" && (
                        <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          One-time Silver → Gold upgrade
                        </div>
                      )}

                      <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <p className="mb-2 text-[8px] font-mono font-black uppercase tracking-[0.16em] text-gray-600">
                          CHANGE MEMBERSHIP
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void handleDirectPlanActivation(
                                {
                                  id: request.profileId,
                                  name: request.name,
                                  plan: request.currentPlan,
                                },
                                "basic",
                              )
                            }
                            className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-3 text-[8px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-400/15 disabled:opacity-40"
                          >
                            MAKE FREE
                          </button>

                          <button
                            type="button"
                            disabled={
                              busy ||
                              normalizeDirectoryPlan(request.currentPlan) ===
                                "pro"
                            }
                            onClick={() =>
                              void handleDirectPlanActivation(
                                {
                                  id: request.profileId,
                                  name: request.name,
                                  plan: request.currentPlan,
                                },
                                "pro",
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-[8px] font-black uppercase tracking-wider transition ${
                              normalizeDirectoryPlan(request.currentPlan) ===
                              "pro"
                                ? "cursor-default border-slate-200/40 bg-slate-200/15 text-slate-100"
                                : "border-slate-300/25 bg-slate-300/[0.07] text-slate-100 hover:bg-slate-300/15"
                            } disabled:opacity-70`}
                          >
                            {normalizeDirectoryPlan(request.currentPlan) ===
                            "pro"
                              ? "SILVER • CURRENT"
                              : "MAKE SILVER"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              busy ||
                              normalizeDirectoryPlan(request.currentPlan) ===
                                "verified"
                            }
                            onClick={() =>
                              void handleDirectPlanActivation(
                                {
                                  id: request.profileId,
                                  name: request.name,
                                  plan: request.currentPlan,
                                },
                                "verified",
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-[8px] font-black uppercase tracking-wider transition ${
                              normalizeDirectoryPlan(request.currentPlan) ===
                              "verified"
                                ? "cursor-default border-amber-400/40 bg-amber-400/15 text-amber-300"
                                : "border-amber-400/25 bg-amber-400/[0.07] text-amber-300 hover:bg-amber-400/15"
                            } disabled:opacity-70`}
                          >
                            {normalizeDirectoryPlan(request.currentPlan) ===
                            "verified"
                              ? "GOLD • CURRENT"
                              : "MAKE GOLD"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <div className="mb-3">
                          <p className="text-[8px] font-mono font-black uppercase tracking-[0.16em] text-gray-600">
                            REQUEST WORKFLOW
                          </p>
                          <p className="mt-1 text-[10px] text-gray-500">
                            Pending → Paid → Done
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div
                            className={`rounded-xl border px-3 py-3 text-center ${
                              isPending
                                ? "border-orange-400/40 bg-orange-400/10 text-orange-300"
                                : "border-white/10 bg-white/[0.02] text-gray-600"
                            }`}
                          >
                            <span className="block text-[8px] font-black uppercase tracking-wider">
                              {isPending ? "● PENDING" : "PENDING"}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={
                              busy || isPaid || isCompleted || isCancelled
                            }
                            onClick={() =>
                              void handleMembershipRequestAction(
                                request,
                                "paid",
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-center transition ${
                              isPaid && !isCompleted
                                ? "border-emerald-400/45 bg-emerald-400/12 text-emerald-300"
                                : isCompleted
                                  ? "border-emerald-400/15 bg-emerald-400/[0.03] text-emerald-700"
                                  : "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300 hover:bg-emerald-400/15"
                            } disabled:cursor-default disabled:opacity-70`}
                          >
                            <span className="block text-[8px] font-black uppercase tracking-wider">
                              {busy
                                ? "WORKING..."
                                : isPaid && !isCompleted
                                  ? "● PAID"
                                  : isCompleted
                                    ? "PAID ✓"
                                    : "MARK PAID"}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={
                              busy || isCompleted || isCancelled || !isPaid
                            }
                            onClick={() =>
                              void handleMembershipRequestAction(
                                request,
                                "activate",
                              )
                            }
                            className={`rounded-xl border px-3 py-3 text-center transition ${
                              isCompleted
                                ? "border-violet-400/45 bg-violet-400/12 text-violet-300"
                                : isPaid
                                  ? "border-violet-400/25 bg-violet-400/[0.07] text-violet-300 hover:bg-violet-400/15"
                                  : "border-white/10 bg-white/[0.02] text-gray-600"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            <span className="block text-[8px] font-black uppercase tracking-wider">
                              {busy
                                ? "WORKING..."
                                : isCompleted
                                  ? "● DONE"
                                  : "DONE / ACTIVATE"}
                            </span>
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {callPhone && (
                            <a
                              href={`tel:${callPhone}`}
                              className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-sky-300"
                            >
                              Call User
                            </a>
                          )}

                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void handleMembershipRequestAction(
                                  request,
                                  "contacted",
                                )
                              }
                              className="rounded-lg border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-blue-300 disabled:opacity-40"
                            >
                              Mark Contacted
                            </button>
                          )}

                          {!isCompleted && !isCancelled && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void handleMembershipRequestAction(
                                  request,
                                  "cancel",
                                )
                              }
                              className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-red-300 disabled:opacity-40"
                            >
                              Cancel Request
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void handleDeleteMembershipRequest(request)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={12} />
                            {busy ? "Saving..." : "Delete"}
                          </button>

                          {isCompleted && (
                            <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                              Membership Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ==========================================
              DIRECTORY MEMBERSHIPS
          ========================================== */}

          <section className="space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a855f7]">
                  Directory Memberships
                </p>

                <h2 className="text-2xl sm:text-3xl font-black mt-2">
                  Free Claimed, Free Unclaimed, Silver & Gold Artists
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Free profiles are separated by ownership claim status • Silver
                  = ₹2,999 • Gold = ₹5,999
                </p>
              </div>

              <p className="text-xs font-mono text-gray-600">
                {directoryArtists.length} TOTAL DIRECTORY ARTISTS
              </p>
            </div>

            {/* ==========================================
                STATE FILTER + PLAN COUNTS
            ========================================== */}

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-mono font-black uppercase tracking-[0.16em] text-gray-500">
                    State Filter
                  </p>

                  <h3 className="mt-1 text-lg font-black uppercase text-white">
                    {selectedStateLabel}
                  </h3>

                  <p className="mt-1 text-[10px] text-gray-600">
                    Select a state to see exactly how many Free, Silver and Gold
                    artists are registered there.
                  </p>
                </div>

                <div className="w-full lg:w-[320px]">
                  <select
                    value={directoryStateFilter}
                    onChange={(event) =>
                      setDirectoryStateFilter(event.target.value)
                    }
                    className="
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-white/10
                      bg-black/40
                      px-4
                      py-3.5
                      text-[10px]
                      font-black
                      uppercase
                      tracking-widest
                      text-white
                      outline-none
                      transition
                      focus:border-[#a855f7]/60
                    "
                  >
                    {directoryStateOptions.map((state) => (
                      <option key={state} value={state}>
                        {state === "ALL" ? "ALL STATES" : state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-purple-300">
                    Total Artists
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {stateFilteredDirectoryArtists.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                    Free
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {stateFreeArtists.length}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-300/25 bg-slate-300/[0.07] p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">
                    Silver
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-100">
                    {stateSilverArtists.length}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-amber-300">
                    Gold
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-200">
                    {stateGoldArtists.length}
                  </p>
                </div>
              </div>
            </div>

            {membershipError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {membershipError}
              </div>
            )}

            {/* ==========================================
                PLAN FILTERS
            ========================================== */}

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              <MembershipFilterButton
                active={membershipFilter === "all"}
                onClick={() => {
                  setMembershipFilter("all");
                  void fetchFreeDirectoryPage();
                }}
                title="ALL"
                subtitle="Free + Silver + Gold"
                count={
                  directoryStateFilter === "ALL"
                    ? directoryStats.total
                    : stateFilteredDirectoryArtists.length
                }
                tone="all"
              />

              <MembershipFilterButton
                active={membershipFilter === "free-claimed"}
                onClick={() => {
                  setMembershipFilter("free-claimed");
                  void fetchFreeDirectoryPage();
                }}
                title="FREE CLAIMED"
                subtitle="Owner OTP verified"
                count={
                  directoryStateFilter === "ALL"
                    ? directoryStats.freeClaimed
                    : filterMembersByState(freeClaimedMembers).length
                }
                tone="claimed"
              />

              <MembershipFilterButton
                active={membershipFilter === "free-unclaimed"}
                onClick={() => {
                  setMembershipFilter("free-unclaimed");
                  void fetchFreeDirectoryPage();
                }}
                title="FREE UNCLAIMED"
                subtitle="Not claimed yet"
                count={
                  directoryStateFilter === "ALL"
                    ? directoryStats.freeUnclaimed
                    : filterMembersByState(freeUnclaimedMembers).length
                }
                tone="unclaimed"
              />

              <MembershipFilterButton
                active={membershipFilter === "pro"}
                onClick={() => setMembershipFilter("pro")}
                title="SILVER"
                subtitle="₹2,999 Plan"
                count={stateSilverArtists.length}
                tone="silver"
              />

              <MembershipFilterButton
                active={membershipFilter === "verified"}
                onClick={() => setMembershipFilter("verified")}
                title="GOLD"
                subtitle="₹5,999 Plan"
                count={stateGoldArtists.length}
                tone="gold"
              />
            </div>

            {/* ==========================================
                ARTIST STATUS FILTER + SEARCH
            ========================================== */}

            <div className="rounded-2xl border border-white/10 bg-[#0b0b0f] p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                {/* HEADER + STATUS DROPDOWN */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-mono font-black uppercase tracking-[0.16em] text-gray-500">
                      Artist Status Filter
                    </p>

                    <p className="mt-1 text-[10px] text-gray-600">
                      Search by artist name, Gmail/email or mobile number and
                      combine it with the selected status.
                    </p>
                  </div>

                  <select
                    value={directoryStatusFilter}
                    onChange={(event) =>
                      setDirectoryStatusFilter(event.target.value)
                    }
                    className="
                      min-w-[210px]
                      appearance-none
                      rounded-xl
                      border
                      border-white/10
                      bg-black/40
                      px-4
                      py-3
                      text-[9px]
                      font-black
                      uppercase
                      tracking-widest
                      text-white
                      outline-none
                      transition
                      focus:border-[#a855f7]/60
                    "
                  >
                    <option value="ALL">
                      ALL STATUS ({directoryStatusCounts.ALL})
                    </option>

                    <option value="NEW">
                      NEW ({directoryStatusCounts.NEW})
                    </option>

                    <option value="CONTACTED">
                      CONTACTED ({directoryStatusCounts.CONTACTED})
                    </option>

                    <option value="CONFIRMED">
                      CONFIRMED ({directoryStatusCounts.CONFIRMED})
                    </option>

                    <option value="PAID">
                      PAID ({directoryStatusCounts.PAID})
                    </option>

                    <option value="CANCELLED">
                      CANCELLED ({directoryStatusCounts.CANCELLED})
                    </option>
                  </select>
                </div>

                {/* SEARCH */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                    />

                    <input
                      type="text"
                      value={directorySearchQuery}
                      onChange={(event) =>
                        setDirectorySearchQuery(event.target.value)
                      }
                      placeholder="Type at least 3 characters — e.g. Ahm..."
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-black/40
                        py-3.5
                        pl-11
                        pr-28
                        text-sm
                        text-white
                        placeholder:text-gray-700
                        outline-none
                        transition
                        focus:border-[#a855f7]/60
                      "
                    />

                    {directorySearchLoading && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono font-black uppercase tracking-wider text-[#a855f7]">
                        Searching...
                      </span>
                    )}
                  </div>

                  {directorySearchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setDirectorySearchQuery("");
                        setDirectorySearchResults([]);
                        setDirectorySearchError("");
                      }}
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        px-5
                        py-3
                        text-[10px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                        transition
                        hover:border-red-400/30
                        hover:bg-red-500/10
                        hover:text-red-300
                      "
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-gray-700">
                    Type 3+ characters • Prefix search by name, Gmail/email or
                    mobile number
                  </p>

                  {directorySearchQuery.trim() && (
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[#a855f7]">
                      {directorySearchLoading
                        ? "Searching..."
                        : `${
                            directorySearchResults.filter((artist) => {
                              if (directoryStatusFilter === "ALL") {
                                return true;
                              }

                              return (
                                getDirectoryArtistStatus(artist) ===
                                directoryStatusFilter
                              );
                            }).length
                          } Result${
                            directorySearchResults.filter((artist) => {
                              if (directoryStatusFilter === "ALL") {
                                return true;
                              }

                              return (
                                getDirectoryArtistStatus(artist) ===
                                directoryStatusFilter
                              );
                            }).length === 1
                              ? ""
                              : "s"
                          } Found`}
                    </p>
                  )}
                </div>

                {directorySearchError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    {directorySearchError}
                  </div>
                )}

                {directorySearchQuery.trim().length > 0 &&
                  directorySearchQuery.trim().length < 3 && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      Type {3 - directorySearchQuery.trim().length} more
                      character
                      {3 - directorySearchQuery.trim().length === 1
                        ? ""
                        : "s"}{" "}
                      to search
                    </div>
                  )}

                {/* SEARCH RESULTS INSIDE STATUS FILTER */}
                {directorySearchQuery.trim().length >= 3 &&
                  !directorySearchLoading &&
                  !directorySearchError && (
                    <div className="border-t border-white/10 pt-4">
                      {directorySearchResults.filter((artist) => {
                        if (directoryStatusFilter === "ALL") {
                          return true;
                        }

                        return (
                          getDirectoryArtistStatus(artist) ===
                          directoryStatusFilter
                        );
                      }).length === 0 ? (
                        <div className="py-8 text-center">
                          <Search size={24} className="mx-auto text-gray-700" />

                          <p className="mt-3 text-xs font-bold text-gray-500">
                            No matching artist found
                          </p>

                          <p className="mt-1 text-[10px] text-gray-700">
                            Try another name, Gmail/email, mobile number or
                            status.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                          {directorySearchResults
                            .filter((artist) => {
                              if (directoryStatusFilter === "ALL") {
                                return true;
                              }

                              return (
                                getDirectoryArtistStatus(artist) ===
                                directoryStatusFilter
                              );
                            })
                            .map((artist, index) => (
                              <MembershipMemberRow
                                key={artist.id || `${artist.name}-${index}`}
                                artist={artist}
                                tone={getArtistTone(artist)}
                                onAdminPlanChange={handleDirectPlanActivation}
                                busy={directPlanBusyArtistId === artist.id}
                                nowMs={membershipClock}
                                status={getDirectoryArtistStatus(artist)}
                                membershipRequest={
                                  latestMembershipRequestByProfile?.[
                                    String(artist.id || "")
                                  ] || null
                                }
                                onStatusChange={handleArtistStatusChange}
                                onOpenArtist={setSelectedDirectoryArtist}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* ==========================================
                SELECTED FILTER RESULTS
            ========================================== */}

            <MembershipTierPanel
              title={selectedMembership.title}
              price={selectedMembership.price}
              members={selectedMembership.members}
              tone={selectedMembership.tone}
              icon={selectedMembership.icon}
              description={selectedMembership.description}
              onAdminPlanChange={handleDirectPlanActivation}
              busyArtistId={directPlanBusyArtistId}
              nowMs={membershipClock}
              getArtistStatus={getDirectoryArtistStatus}
              latestRequestByProfile={latestMembershipRequestByProfile}
              onStatusChange={handleArtistStatusChange}
              onOpenArtist={setSelectedDirectoryArtist}
            />
          </section>

          {/* ==========================================
              SUBMISSIONS
          ========================================== */}

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">
                Tattoo Submissions ({submissions.length})
              </h2>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl px-5 py-20 text-center">
                <LayoutDashboard size={42} className="mx-auto text-gray-700" />

                <h3 className="text-xl font-bold mt-5">No Entries Found</h3>

                <p className="text-gray-500 text-sm mt-2">
                  No tattoo competition entries have been submitted yet.
                </p>

                <Link
                  to="/upload"
                  className="inline-block mt-6 px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] rounded-xl text-xs font-bold uppercase tracking-widest"
                >
                  Submission Form
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {submissions.map((user, index) => {
                  const images = normalizeMedia(user.images);

                  const videos = normalizeMedia(user.videos);

                  const mainImage = images[0];

                  const displayName =
                    user.professionalName ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "Unnamed Artist";

                  return (
                    <div
                      key={user._id || user.entryId || index}
                      onClick={() => setSelectedUser(user)}
                      className="group bg-[#0b0b0f] border border-white/10 hover:border-[#a855f7]/70 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
                    >
                      {/* ===============================
                            IMAGE
                        =============================== */}

                      <div className="relative h-56 overflow-hidden bg-[#111116]">
                        {mainImage ? (
                          <MediaImage
                            media={mainImage}
                            alt={user.tattooTitle || "Tattoo"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                            <ImageIcon size={40} />

                            <span className="mt-2 text-[10px] font-mono uppercase tracking-widest">
                              No Image
                            </span>
                          </div>
                        )}

                        {/* ENTRY ID */}

                        <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-white/10 text-[#a855f7] text-[10px] font-mono px-3 py-1.5 rounded-full">
                          {user.entryId || "INK-ENTRY"}
                        </div>

                        {/* DELETE */}

                        <button
                          type="button"
                          title="Delete Entry"
                          onClick={(event) => handleDelete(event, user._id)}
                          className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/75 border border-white/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* ===============================
                            INFORMATION
                        =============================== */}

                      <div className="p-5 space-y-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#a855f7]">
                            {user.category || "No Category"}
                          </span>

                          <h3 className="text-xl font-black mt-1 truncate">
                            {displayName}
                          </h3>

                          <p className="text-sm text-gray-500 truncate mt-1">
                            {user.tattooTitle || "No tattoo title"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <CardInfo
                            label="Package"
                            value={getPackageName(user.entryPackage)}
                          />

                          <CardInfo label="City" value={user.city || "N/A"} />
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[11px] font-mono text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon size={13} />
                            {images.length} Images
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Video size={13} />
                            {videos.length} Videos
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 group-hover:text-[#a855f7] group-hover:border-[#a855f7]/20 transition">
                          <Maximize2 size={14} />
                          VIEW FULL DETAILS
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ==========================================
          DETAILS MODAL
      ========================================== */}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDelete={handleDelete}
        />
      )}

      {selectedDirectoryArtist && (
        <DirectoryArtistDetailsModal
          artist={selectedDirectoryArtist}
          status={getDirectoryArtistStatus(selectedDirectoryArtist)}
          membershipRequest={
            latestMembershipRequestByProfile?.[
              String(selectedDirectoryArtist.id || "")
            ] || null
          }
          onStatusChange={handleArtistStatusChange}
          onAdminPlanChange={handleDirectPlanActivation}
          busy={directPlanBusyArtistId === selectedDirectoryArtist.id}
          nowMs={membershipClock}
          onClose={() => setSelectedDirectoryArtist(null)}
        />
      )}
    </div>
  );
}

// =====================================================
// DASHBOARD STAT
// =====================================================

function DashboardStat({ label, value, highlight = false, tone = "default" }) {
  const borderClass =
    tone === "claimed"
      ? "border-emerald-400/20 bg-emerald-500/[0.025]"
      : tone === "unclaimed"
        ? "border-purple-400/15 bg-purple-500/[0.02]"
        : tone === "basic"
          ? "border-purple-400/15 bg-purple-500/[0.02]"
          : tone === "silver"
            ? "border-slate-300/20 bg-slate-300/[0.025]"
            : tone === "gold"
              ? "border-amber-300/20 bg-amber-400/[0.025]"
              : "border-white/10 bg-[#0b0b0f]";

  const valueClass =
    tone === "claimed"
      ? "text-emerald-300"
      : tone === "unclaimed"
        ? "text-purple-300"
        : tone === "basic"
          ? "text-purple-300"
          : tone === "silver"
            ? "text-slate-200"
            : tone === "gold"
              ? "text-amber-300"
              : highlight
                ? "text-[#a855f7]"
                : "text-white";

  return (
    <div className={`border rounded-2xl p-5 sm:p-6 ${borderClass}`}>
      <span className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest">
        {label}
      </span>

      <p className={`text-2xl sm:text-3xl font-black mt-2 ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

// =====================================================
// SILVER / GOLD MEMBERSHIP PANEL
// =====================================================

function MembershipFilterButton({
  active,
  onClick,
  title,
  subtitle,
  count,
  tone,
}) {
  const toneClass =
    tone === "gold"
      ? active
        ? "border-amber-300/50 bg-amber-400/10 text-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.08)]"
        : "border-amber-300/15 bg-amber-400/[0.02] text-amber-300"
      : tone === "silver"
        ? active
          ? "border-slate-200/50 bg-slate-200/10 text-white shadow-[0_0_30px_rgba(226,232,240,0.06)]"
          : "border-slate-300/15 bg-slate-300/[0.02] text-slate-300"
        : tone === "claimed"
          ? active
            ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-200"
            : "border-emerald-300/15 bg-emerald-400/[0.02] text-emerald-300"
          : active
            ? "border-purple-400/50 bg-purple-500/10 text-purple-200"
            : "border-purple-400/15 bg-purple-500/[0.02] text-purple-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 sm:p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em]">
            {title}
          </p>

          <p className="text-[10px] font-mono text-gray-500 mt-1">{subtitle}</p>
        </div>

        <span className="min-w-11 h-11 px-3 rounded-xl border border-current/20 flex items-center justify-center text-xl font-black">
          {count}
        </span>
      </div>
    </button>
  );
}

// =====================================================
// FREE / SILVER / GOLD MEMBERSHIP PANEL
// =====================================================

function MembershipTierPanel({
  title,
  price,
  members,
  tone,
  icon,
  description,
  onAdminPlanChange,
  busyArtistId,
  nowMs,
  getArtistStatus,
  latestRequestByProfile,
  onStatusChange,
  onOpenArtist,
}) {
  const isGold = tone === "gold";
  const isSilver = tone === "silver";
  const isClaimed = tone === "claimed";
  const isUnclaimed = tone === "unclaimed";
  const isBasic = tone === "basic" || isClaimed || isUnclaimed;

  const MEMBERS_PER_PAGE = 24;
  const [memberPage, setMemberPage] = useState(0);

  const totalMemberPages = Math.max(
    1,
    Math.ceil(members.length / MEMBERS_PER_PAGE),
  );

  const safeMemberPage = Math.min(memberPage, totalMemberPages - 1);
  const memberStart = safeMemberPage * MEMBERS_PER_PAGE;
  const visibleMembers = members.slice(
    memberStart,
    memberStart + MEMBERS_PER_PAGE,
  );

  useEffect(() => {
    setMemberPage(0);
  }, [members]);

  const outerClass = isGold
    ? "border-amber-300/25 bg-amber-400/[0.025]"
    : isSilver
      ? "border-slate-300/20 bg-slate-300/[0.02]"
      : isClaimed
        ? "border-emerald-300/20 bg-emerald-400/[0.02]"
        : "border-purple-400/20 bg-purple-500/[0.02]";

  const accentClass = isGold
    ? "text-amber-300"
    : isSilver
      ? "text-slate-200"
      : isClaimed
        ? "text-emerald-300"
        : "text-purple-300";

  const badgeClass = isGold
    ? "border-amber-300/20 bg-amber-400/10 text-amber-300"
    : isSilver
      ? "border-slate-300/20 bg-slate-300/10 text-slate-200"
      : isClaimed
        ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-300"
        : "border-purple-400/20 bg-purple-500/10 text-purple-300";

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 ${outerClass}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className={`flex items-center gap-2 ${accentClass}`}>
            {icon}

            <span className="text-[10px] font-mono uppercase tracking-[0.16em]">
              {price} PLAN
            </span>
          </div>

          <h3 className="text-2xl font-black mt-2 uppercase">{title}</h3>

          {description && (
            <p className="text-xs text-gray-600 mt-2 max-w-xl">{description}</p>
          )}
        </div>

        <div
          className={`min-w-14 h-14 px-3 rounded-xl border flex items-center justify-center text-2xl font-black ${badgeClass}`}
        >
          {members.length}
        </div>
      </div>

      {members.length === 0 ? (
        <div className="py-12 text-center">
          <Sparkles size={25} className={`mx-auto ${accentClass} opacity-40`} />

          <p className="text-sm font-bold text-gray-400 mt-4">
            No {title} artists yet
          </p>

          <p className="text-xs text-gray-600 mt-1">
            {isClaimed
              ? "Claimed Free artists will appear here automatically."
              : isUnclaimed
                ? "Unclaimed imported Free profiles will appear here."
                : isBasic
                  ? "Free artists will appear here."
                  : "Paid members will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
          {visibleMembers.map((artist, index) => (
            <MembershipMemberRow
              key={artist.id || `${artist.name}-${index}`}
              artist={artist}
              tone={tone}
              onAdminPlanChange={onAdminPlanChange}
              busy={busyArtistId === artist.id}
              nowMs={nowMs}
              status={getArtistStatus ? getArtistStatus(artist) : "new"}
              membershipRequest={
                latestRequestByProfile?.[String(artist.id || "")] || null
              }
              onStatusChange={onStatusChange}
              onOpenArtist={onOpenArtist}
            />
          ))}
        </div>
      )}

      {members.length > MEMBERS_PER_PAGE && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">
            Showing {memberStart + 1}-
            {Math.min(memberStart + MEMBERS_PER_PAGE, members.length)} of{" "}
            {members.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeMemberPage === 0}
              onClick={() =>
                setMemberPage((current) => Math.max(0, current - 1))
              }
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-[9px] font-black uppercase tracking-wider text-gray-300 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>

            <span className="min-w-[76px] text-center text-[9px] font-mono text-purple-300">
              {safeMemberPage + 1} / {totalMemberPages}
            </span>

            <button
              type="button"
              disabled={safeMemberPage >= totalMemberPages - 1}
              onClick={() =>
                setMemberPage((current) =>
                  Math.min(totalMemberPages - 1, current + 1),
                )
              }
              className="rounded-lg border border-purple-500/25 bg-purple-500/[0.07] px-4 py-2 text-[9px] font-black uppercase tracking-wider text-purple-300 transition hover:bg-purple-500/[0.13] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MembershipMemberRow({
  artist,
  tone,
  onAdminPlanChange,
  busy,
  nowMs = 0,
  status = "new",
  membershipRequest = null,
  onStatusChange,
  onOpenArtist,
}) {
  const isGold = tone === "gold";
  const isSilver = tone === "silver";
  const isClaimed = tone === "claimed";
  const isUnclaimed = tone === "unclaimed";
  const isBasic = tone === "basic" || isClaimed || isUnclaimed;

  const accentClass = isGold
    ? "text-amber-300"
    : isSilver
      ? "text-slate-200"
      : isClaimed
        ? "text-emerald-300"
        : "text-purple-300";

  const dotClass = isGold
    ? "bg-amber-400"
    : isSilver
      ? "bg-slate-300"
      : isClaimed
        ? "bg-emerald-400"
        : "bg-purple-400";

  const planLabel = isGold
    ? "GOLD"
    : isSilver
      ? "SILVER"
      : isClaimed
        ? "FREE CLAIMED"
        : "FREE UNCLAIMED";

  // Show clearly what membership this artist has requested.
  // "verified" = Gold, "pro" = Silver.
  const requestedPlan = membershipRequest?.requestedPlan
    ? normalizeDirectoryPlan(membershipRequest.requestedPlan)
    : "";

  const requestStatus = normalizeRequestStatus(
    membershipRequest?.requestStatus || "",
  );

  const hasMembershipApplication =
    Boolean(membershipRequest) &&
    ["pro", "verified"].includes(requestedPlan) &&
    !["cancelled"].includes(requestStatus);

  const appliedPlanLabel =
    requestedPlan === "verified"
      ? "GOLD"
      : requestedPlan === "pro"
        ? "SILVER"
        : "";

  const applicationIsActivated =
    requestStatus === "completed" ||
    (requestedPlan === "verified" && artist.plan === "verified") ||
    (requestedPlan === "pro" && artist.plan === "pro");

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-black/25 p-4"
      style={{ contentVisibility: "auto", containIntrinsicSize: "260px" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`relative block w-2 h-2 rounded-full ${dotClass}`}>
              <span
                className={`absolute inset-0 rounded-full animate-ping opacity-40 ${dotClass}`}
              />
            </span>

            <p className="font-black truncate">{artist.name}</p>
          </div>

          {artist.studio && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {artist.studio}
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span
            className={`text-[8px] font-black uppercase tracking-widest ${accentClass}`}
          >
            {planLabel}
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 text-[7px] font-black uppercase tracking-widest ${getArtistStatusClasses(
              status,
            )}`}
          >
            {normalizeArtistAdminStatus(status)}
          </span>
        </div>
      </div>

      {hasMembershipApplication && (
        <div
          className={`mt-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
            requestedPlan === "verified"
              ? "border-amber-400/30 bg-amber-400/10"
              : "border-slate-300/25 bg-slate-300/10"
          }`}
        >
          <div className="min-w-0">
            <p className="text-[7px] font-mono uppercase tracking-[0.16em] text-gray-500">
              Membership Request
            </p>

            <p
              className={`mt-0.5 text-[10px] font-black uppercase tracking-wider ${
                requestedPlan === "verified"
                  ? "text-amber-300"
                  : "text-slate-100"
              }`}
            >
              {applicationIsActivated
                ? `${appliedPlanLabel} ACTIVATED`
                : `APPLIED FOR ${appliedPlanLabel}`}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[7px] font-black uppercase tracking-widest ${
              requestedPlan === "verified"
                ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                : "border-slate-300/25 bg-slate-300/10 text-slate-200"
            }`}
          >
            {requestStatus === "new"
              ? "NEW REQUEST"
              : requestStatus === "contacted"
                ? "CONTACTED"
                : requestStatus === "paid"
                  ? "PAID"
                  : requestStatus === "completed"
                    ? "COMPLETED"
                    : requestStatus.toUpperCase() || "REQUESTED"}
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <MembershipInfo label="City" value={artist.city || "N/A"} />
        <MembershipInfo label="State" value={artist.state || "N/A"} />
        <MembershipInfo label="Email" value={artist.email || "N/A"} />
        <MembershipInfo label="Phone" value={artist.phone || "N/A"} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        <span className="text-[8px] font-mono uppercase tracking-widest text-gray-600">
          Membership
        </span>

        <div className="flex flex-col items-end gap-1 text-right">
          <span
            className={`text-[9px] font-bold uppercase ${
              normalizeArtistAdminStatus(status) === "PAID"
                ? "text-emerald-300"
                : normalizeArtistAdminStatus(status) === "CONFIRMED"
                  ? "text-blue-300"
                  : normalizeArtistAdminStatus(status) === "CONTACTED"
                    ? "text-sky-300"
                    : normalizeArtistAdminStatus(status) === "CANCELLED"
                      ? "text-red-300"
                      : "text-purple-300"
            }`}
          >
            {normalizeArtistAdminStatus(status)}
          </span>

          <span className="text-[7px] font-mono uppercase tracking-wider text-gray-600">
            Payment:{" "}
            {normalizeArtistAdminStatus(status) === "PAID"
              ? "PAID"
              : normalizePaymentStatus(
                  membershipRequest?.paymentStatus || artist.paymentStatus,
                ).toUpperCase()}
          </span>
        </div>
      </div>

      {(isSilver || isGold) && (
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <MembershipInfo
              label="Started"
              value={formatMembershipDateTime(
                artist.planStartedAt || artist.paidAt,
              )}
            />

            <MembershipInfo
              label="Auto Free On"
              value={formatMembershipDateTime(artist.planExpiresAt)}
            />
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2">
            <Clock size={13} className={accentClass} />

            <span className="text-[8px] font-mono uppercase tracking-widest text-gray-600">
              Time left
            </span>

            <span className={`ml-auto text-[10px] font-black ${accentClass}`}>
              {getMembershipTimeLeft(artist.planExpiresAt, nowMs)}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpenArtist?.(artist)}
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-300 transition hover:border-[#a855f7]/35 hover:bg-[#a855f7]/[0.07] hover:text-white"
      >
        VIEW DETAILS
      </button>

      <div className="mt-3 border-t border-white/[0.06] pt-3">
        <p className="mb-2 text-[8px] font-mono font-black uppercase tracking-[0.14em] text-gray-600">
          STATUS
        </p>

        <select
          value={normalizeArtistAdminStatus(status)}
          onChange={(event) => onStatusChange?.(artist.id, event.target.value)}
          className={`
            w-full
            appearance-none
            rounded-xl
            border
            bg-black/40
            px-4
            py-3
            text-[9px]
            font-black
            uppercase
            tracking-widest
            outline-none
            transition
            ${getArtistStatusClasses(status)}
          `}
        >
          {ARTIST_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {onAdminPlanChange && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="mb-2 text-[8px] font-mono font-black uppercase tracking-[0.14em] text-gray-600">
            CHANGE MEMBERSHIP
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={busy || isBasic}
              onClick={() => void onAdminPlanChange(artist, "basic")}
              className={`rounded-lg border px-2 py-2.5 text-[8px] font-black uppercase tracking-wider transition ${
                isBasic
                  ? "cursor-default border-emerald-400/40 bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20"
                  : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300 hover:bg-emerald-400/12"
              } disabled:opacity-70`}
            >
              {busy && !isBasic
                ? "Working..."
                : isBasic
                  ? "FREE • CURRENT"
                  : "MAKE FREE"}
            </button>

            <button
              type="button"
              disabled={busy || isSilver}
              onClick={() => void onAdminPlanChange(artist, "pro")}
              className={`rounded-lg border px-2 py-2.5 text-[8px] font-black uppercase tracking-wider transition ${
                isSilver
                  ? "cursor-default border-slate-200/40 bg-slate-200/15 text-slate-100 ring-1 ring-slate-200/20"
                  : "border-slate-300/20 bg-slate-300/[0.06] text-slate-100 hover:bg-slate-300/12"
              } disabled:opacity-70`}
            >
              {busy && !isSilver
                ? "Working..."
                : isSilver
                  ? "SILVER • CURRENT"
                  : "MAKE SILVER"}
            </button>

            <button
              type="button"
              disabled={busy || isGold}
              onClick={() => void onAdminPlanChange(artist, "verified")}
              className={`rounded-lg border px-2 py-2.5 text-[8px] font-black uppercase tracking-wider transition ${
                isGold
                  ? "cursor-default border-amber-400/40 bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/20"
                  : "border-amber-400/20 bg-amber-400/[0.06] text-amber-300 hover:bg-amber-400/12"
              } disabled:opacity-70`}
            >
              {busy && !isGold
                ? "Working..."
                : isGold
                  ? "GOLD • CURRENT"
                  : "MAKE GOLD"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MembershipInfo({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-white/[0.025] px-3 py-2">
      <span className="block text-[8px] font-mono uppercase tracking-widest text-gray-700">
        {label}
      </span>

      <span className="block text-gray-400 mt-1 truncate" title={String(value)}>
        {value}
      </span>
    </div>
  );
}

// =====================================================
// CARD INFO
// =====================================================

function CardInfo({ label, value }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-3 min-w-0">
      <span className="block text-[9px] font-mono uppercase tracking-widest text-gray-600">
        {label}
      </span>

      <span className="block mt-1 text-xs font-bold text-gray-300 truncate">
        {value}
      </span>
    </div>
  );
}

// =====================================================
// DETAILS FIELD
// =====================================================

function DetailsField({ label, value, fullWidth = false }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <div
      className={`bg-black/30 border border-white/5 rounded-xl p-4 ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <span className="block text-[9px] font-mono uppercase tracking-widest text-gray-500 mb-2">
        {label}
      </span>

      <span className="block text-sm text-gray-200 whitespace-pre-wrap break-words">
        {String(value)}
      </span>
    </div>
  );
}

// =====================================================
// SECTION HEADING
// =====================================================

function SectionHeading({ children }) {
  return (
    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#a855f7] mb-4">
      {children}
    </h3>
  );
}

// =====================================================
// NO MEDIA
// =====================================================

function NoMedia({ message }) {
  return (
    <div className="py-10 px-5 rounded-2xl bg-black/20 border border-dashed border-white/10 text-center">
      <ImageIcon size={30} className="mx-auto text-gray-700" />

      <p className="text-xs text-gray-600 font-mono mt-3">{message}</p>
    </div>
  );
}

// =====================================================
// DIRECTORY ARTIST DETAILS MODAL
// =====================================================

function DirectoryArtistDetailsModal({
  artist,
  status,
  membershipRequest,
  onStatusChange,
  onAdminPlanChange,
  busy,
  nowMs = 0,
  onClose,
}) {
  const plan = normalizeDirectoryPlan(artist?.plan);
  const isGold = plan === "verified";
  const isSilver = plan === "pro";
  const isFree = plan === "basic";

  const planLabel = isGold ? "GOLD" : isSilver ? "SILVER" : "FREE";

  const planTone = isGold
    ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
    : isSilver
      ? "border-slate-300/25 bg-slate-300/10 text-slate-100"
      : "border-purple-400/25 bg-purple-400/10 text-purple-300";

  const paymentLabel =
    normalizeArtistAdminStatus(status) === "PAID"
      ? "PAID"
      : normalizePaymentStatus(
          membershipRequest?.paymentStatus || artist?.paymentStatus,
        ).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b0f] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0b0b0f]/95 p-5 backdrop-blur-xl sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${planTone}`}
              >
                {planLabel}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${getArtistStatusClasses(status)}`}
              >
                {normalizeArtistAdminStatus(status)}
              </span>
            </div>

            <h2 className="mt-3 truncate text-2xl font-black sm:text-3xl">
              {artist?.name || "Tattoo Artist"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {artist?.studio || "Studio not provided"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MembershipInfo label="City" value={artist?.city || "N/A"} />
            <MembershipInfo label="State" value={artist?.state || "N/A"} />
            <MembershipInfo label="Phone" value={artist?.phone || "N/A"} />
            <MembershipInfo label="Email" value={artist?.email || "N/A"} />
            <MembershipInfo label="Studio" value={artist?.studio || "N/A"} />
            <MembershipInfo
              label="Experience"
              value={artist?.experience || "N/A"}
            />
            <MembershipInfo
              label="Instagram"
              value={artist?.instagram || "N/A"}
            />
            <MembershipInfo label="Website" value={artist?.website || "N/A"} />
            <MembershipInfo
              label="Claim Status"
              value={
                artist?.claimed ? "FREE CLAIMED / OWNER VERIFIED" : "UNCLAIMED"
              }
            />
            <MembershipInfo
              label="Claimed At"
              value={formatMembershipDateTime(artist?.claimedAt)}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="mb-3 text-[8px] font-mono font-black uppercase tracking-widest text-gray-500">
              FULL PROFILE DATA — ADMIN VIEW
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailsField
                label="Tattoo Styles"
                value={
                  artist?.tattooStyles?.length
                    ? artist.tattooStyles.join(", ")
                    : "N/A"
                }
                fullWidth
              />
              <DetailsField
                label="Bio / About"
                value={artist?.bio || "N/A"}
                fullWidth
              />
              <DetailsField
                label="Profile Links"
                value={
                  Array.isArray(artist?.profileLinks) &&
                  artist.profileLinks.length
                    ? artist.profileLinks.join(" | ")
                    : "N/A"
                }
                fullWidth
              />
              <DetailsField
                label="Portfolio Images Saved"
                value={
                  Array.isArray(artist?.portfolioImages)
                    ? artist.portfolioImages.length
                    : 0
                }
              />
              <DetailsField
                label="Public Visibility"
                value={
                  isGold
                    ? "All profile fields visible"
                    : isSilver
                      ? "Silver public fields only"
                      : "Name and state only"
                }
              />
              <DetailsField
                label="Gold Directory Boost"
                value={
                  isGold
                    ? "Eligible / Active when backend enables boost"
                    : "Not included"
                }
              />
              <DetailsField
                label="Gold Gallery Feature"
                value={
                  isGold ? "1 image OR 1 video entitlement" : "Not included"
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              className={`rounded-2xl border p-4 ${getArtistStatusClasses(status)}`}
            >
              <p className="text-[8px] font-mono font-black uppercase tracking-widest opacity-70">
                CURRENT STATUS
              </p>
              <p className="mt-2 text-xl font-black uppercase">
                {normalizeArtistAdminStatus(status)}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${paymentLabel === "PAID" ? "border-emerald-400/25 bg-emerald-400/10" : "border-orange-400/20 bg-orange-400/10"}`}
            >
              <p className="text-[8px] font-mono font-black uppercase tracking-widest text-gray-400">
                PAYMENT STATUS
              </p>
              <p
                className={`mt-2 text-xl font-black uppercase ${paymentLabel === "PAID" ? "text-emerald-300" : "text-orange-300"}`}
              >
                {paymentLabel || "PENDING"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="mb-2 text-[8px] font-mono font-black uppercase tracking-[0.14em] text-gray-500">
              CHANGE STATUS
            </p>

            <select
              value={normalizeArtistAdminStatus(status)}
              onChange={(event) =>
                onStatusChange?.(artist?.id, event.target.value)
              }
              className={`w-full appearance-none rounded-xl border bg-black/40 px-4 py-3 text-[9px] font-black uppercase tracking-widest outline-none transition ${getArtistStatusClasses(status)}`}
            >
              {ARTIST_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {(isSilver || isGold) && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="mb-3 text-[8px] font-mono font-black uppercase tracking-widest text-gray-500">
                MEMBERSHIP
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <MembershipInfo
                  label="Started"
                  value={formatMembershipDateTime(
                    artist?.planStartedAt || artist?.paidAt,
                  )}
                />
                <MembershipInfo
                  label="Expires"
                  value={formatMembershipDateTime(artist?.planExpiresAt)}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2">
                <Clock
                  size={13}
                  className={isGold ? "text-amber-300" : "text-slate-200"}
                />
                <span className="text-[8px] font-mono uppercase tracking-widest text-gray-600">
                  Time left
                </span>
                <span
                  className={`ml-auto text-[10px] font-black ${isGold ? "text-amber-300" : "text-slate-200"}`}
                >
                  {getMembershipTimeLeft(artist?.planExpiresAt, nowMs)}
                </span>
              </div>
            </div>
          )}

          {onAdminPlanChange && (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="mb-3 text-[8px] font-mono font-black uppercase tracking-widest text-gray-500">
                CHANGE PLAN
              </p>

              <div className="flex flex-wrap gap-2">
                {!isFree && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onAdminPlanChange(artist, "basic")}
                    className="rounded-lg border border-purple-400/25 bg-purple-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-purple-300 disabled:opacity-40"
                  >
                    {busy ? "Saving..." : "Make Free"}
                  </button>
                )}

                {!isSilver && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onAdminPlanChange(artist, "pro")}
                    className="rounded-lg border border-slate-300/20 bg-slate-300/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-slate-100 disabled:opacity-40"
                  >
                    {busy ? "Saving..." : "Make Silver"}
                  </button>
                )}

                {!isGold && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onAdminPlanChange(artist, "verified")}
                    className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-amber-300 disabled:opacity-40"
                  >
                    {busy ? "Saving..." : "Make Gold"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// USER DETAILS MODAL
// =====================================================

function UserDetailsModal({ user, onClose, onDelete }) {
  const images = normalizeMedia(user.images);

  const videos = normalizeMedia(user.videos);

  const fullName =
    user.professionalName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Unnamed Artist";

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-6xl max-h-[94vh] bg-[#0b0b0f] border border-[#a855f7]/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ==========================================
            MODAL HEADER
        ========================================== */}

        <div className="flex items-start justify-between gap-5 p-5 sm:p-8 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-[10px] font-mono uppercase tracking-widest">
              {user.entryId || "INK CONVENTION ENTRY"}
            </div>

            <h2 className="text-2xl sm:text-4xl font-black mt-3">{fullName}</h2>

            {user.createdAt && (
              <p className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 mt-2">
                <Clock size={12} />

                {new Date(user.createdAt).toLocaleString()}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* ==========================================
            SCROLL CONTENT
        ========================================== */}

        <div className="overflow-y-auto p-5 sm:p-8 space-y-9">
          {/* ========================================
              PACKAGE
          ======================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#160927] to-[#0d0d12] border border-[#a855f7]/30 rounded-2xl p-5">
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <CreditCard size={13} />
                Package Purchased
              </span>

              <p className="text-xl sm:text-2xl font-black text-[#a855f7] mt-2 uppercase">
                {getPackageName(user.entryPackage)}
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                Competition Category
              </span>

              <p className="text-xl font-bold mt-2">{user.category || "N/A"}</p>
            </div>
          </div>

          {/* ========================================
              IMAGES
          ======================================== */}

          <section>
            <SectionHeading>
              Uploaded Tattoo Images ({images.length})
            </SectionHeading>

            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => {
                  const imageUrl = getMediaUrl(image);

                  return (
                    <a
                      key={`${imageUrl}-${index}`}
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group h-64 rounded-2xl overflow-hidden bg-black border border-white/10"
                    >
                      <MediaImage
                        media={image}
                        alt={`Tattoo image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </a>
                  );
                })}
              </div>
            ) : (
              <NoMedia message="No tattoo images were uploaded." />
            )}
          </section>

          {/* ========================================
              VIDEOS
          ======================================== */}

          <section>
            <SectionHeading>Uploaded Videos ({videos.length})</SectionHeading>

            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video, index) => {
                  const videoUrl = getMediaUrl(video);

                  return (
                    <video
                      key={`${videoUrl}-${index}`}
                      src={videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-72 object-contain bg-black border border-white/10 rounded-2xl"
                    />
                  );
                })}
              </div>
            ) : (
              <NoMedia message="No videos were uploaded." />
            )}
          </section>

          {/* ========================================
              ARTIST INFORMATION
          ======================================== */}

          <section>
            <SectionHeading>Artist Information</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailsField label="First Name" value={user.firstName} />

              <DetailsField label="Last Name" value={user.lastName} />

              <DetailsField
                label="Professional Name"
                value={user.professionalName}
              />

              <DetailsField label="Email Address" value={user.gmail} />

              <DetailsField label="Phone / WhatsApp" value={user.phone} />

              <DetailsField label="Instagram" value={user.instagram} />

              <DetailsField label="Studio" value={user.studio} />

              <DetailsField label="City" value={user.city} />

              <DetailsField label="State" value={user.state} />

              <DetailsField label="Country" value={user.country || "India"} />

              <DetailsField label="Primary Style" value={user.primaryStyle} />

              <DetailsField label="Experience" value={user.experience} />
            </div>
          </section>

          {/* ========================================
              TATTOO INFORMATION
          ======================================== */}

          <section>
            <SectionHeading>Tattoo Information</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailsField
                label="Tattoo Title"
                value={user.tattooTitle}
                fullWidth
              />

              <DetailsField
                label="Tattoo Description"
                value={user.description}
                fullWidth
              />

              <DetailsField label="Placement" value={user.placement} />

              <DetailsField label="Size" value={user.size} />

              <DetailsField label="Original Work" value={user.isOriginal} />
            </div>
          </section>

          {/* ========================================
              PAYMENT
          ======================================== */}

          <section>
            <SectionHeading>Payment Information</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailsField
                label="Razorpay Order ID"
                value={user.razorpay_order_id}
              />

              <DetailsField
                label="Razorpay Payment ID"
                value={user.razorpay_payment_id}
              />
            </div>
          </section>
        </div>

        {/* ==========================================
            MODAL FOOTER
        ========================================== */}

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 p-5 sm:px-8 border-t border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={(event) => onDelete(event, user._id)}
            className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-widest transition"
          >
            Delete Entry
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-7 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminArtists;
