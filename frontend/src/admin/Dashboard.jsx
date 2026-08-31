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
} from "lucide-react";

import { Link } from "react-router-dom";

import "../Style/AdminClients.css";
import AdminSidebar from "./AdminSidebar";

// =====================================================
// API URL
// =====================================================

const API_URL = "https://api.inkconvention.com";

const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();

  const timeout = window.setTimeout(() => {
    controller.abort();
  }, 15000);

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
// DASHBOARD
// =====================================================

function Dashboard() {
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

  const [membershipError, setMembershipError] = useState("");

  // Directory membership filter:
  // basic = FREE / no paid plan
  // pro = SILVER ₹1,499
  // verified = GOLD ₹2,999
  const [membershipFilter, setMembershipFilter] = useState("basic");

  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);

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

      throw error;
    }
  }, []);

  // ===================================================
  // FETCH CLIENT COUNT
  // ===================================================

  const fetchClientCount = useCallback(async () => {
    try {
      const response = await apiFetch("/api/admin/clients");

      const data = await getJson(response);

      if (response.ok && data.success && Array.isArray(data.clients)) {
        setClientCount(data.clients.length);
      } else {
        setClientCount(0);
      }
    } catch (error) {
      console.error("Client count error:", error);

      setClientCount(0);
    }
  }, []);

  // ===================================================
  // FETCH SILVER / GOLD DIRECTORY MEMBERS
  // ===================================================

  const fetchMemberships = useCallback(async () => {
    setMembershipError("");

    try {
      const response = await apiFetch("/api/artists?limit=500");

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load directory memberships.",
        );
      }

      const members = getDirectoryArtistsArray(data)
        .map((artist) => normalizeDirectoryArtist(artist))
        .filter((artist) => {
          // FREE / BASIC:
          // Anyone who has NOT taken Silver or Gold.
          if (artist.plan === "basic") {
            return true;
          }

          // SILVER / GOLD:
          // Only activated paid memberships.
          if (artist.plan === "pro" || artist.plan === "verified") {
            return hasValidPaidStatus(artist);
          }

          return false;
        })
        .sort((first, second) => {
          const firstTime = new Date(first.updatedAt || 0).getTime();
          const secondTime = new Date(second.updatedAt || 0).getTime();
          return secondTime - firstTime;
        });

      setDirectoryArtists(members);
    } catch (error) {
      console.error("Membership fetch error:", error);
      setDirectoryArtists([]);
      setMembershipError(
        error.message || "Could not load Free, Silver and Gold artists.",
      );
    }
  }, []);

  // ===================================================
  // REFRESH DASHBOARD
  // ===================================================

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setDashboardError("");

    try {
      await Promise.all([fetchUsers(), fetchClientCount(), fetchMemberships()]);
    } catch (error) {
      setDashboardError(error.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchClientCount, fetchMemberships]);

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
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 rounded-full border-2 border-white/10 border-t-[#a855f7] animate-spin mx-auto" />

          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

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

  const freeMembers = directoryArtists.filter(
    (artist) => artist.plan === "basic",
  );

  const silverMembers = directoryArtists.filter(
    (artist) => artist.plan === "pro",
  );

  const goldMembers = directoryArtists.filter(
    (artist) => artist.plan === "verified",
  );

  const selectedMembership =
    membershipFilter === "verified"
      ? {
          title: "Gold Verified",
          price: "₹2,999",
          members: goldMembers,
          tone: "gold",
          icon: <Trophy size={18} />,
          description: "Artists who have taken the ₹2,999 Gold Verified plan.",
        }
      : membershipFilter === "pro"
        ? {
            title: "Silver Pro",
            price: "₹1,499",
            members: silverMembers,
            tone: "silver",
            icon: <Award size={18} />,
            description:
              "Artists who have taken only the ₹1,499 Silver Pro plan.",
          }
        : {
            title: "Free / Basic",
            price: "₹0",
            members: freeMembers,
            tone: "basic",
            icon: <Sparkles size={18} />,
            description: "Artists who have not taken Silver or Gold.",
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
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono uppercase tracking-wider"
              >
                Refresh
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

          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <DashboardStat label="Tattoo Entries" value={submissions.length} />

            <DashboardStat label="Media Files" value={totalMedia} highlight />

            <DashboardStat label="Clients" value={clientCount} />

            <DashboardStat
              label="Free / Basic"
              value={freeMembers.length}
              tone="basic"
            />

            <DashboardStat
              label="Silver Pro ₹1,499"
              value={silverMembers.length}
              tone="silver"
            />

            <DashboardStat
              label="Gold Verified ₹2,999"
              value={goldMembers.length}
              tone="gold"
            />

            <DashboardStat label="Server" value="LIVE" />
          </div>

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
                  Free, Silver & Gold Artists
                </h2>

                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Free = no Silver/Gold plan • Silver = ₹1,499 only • Gold =
                  ₹2,999
                </p>
              </div>

              <p className="text-xs font-mono text-gray-600">
                {directoryArtists.length} TOTAL DIRECTORY ARTISTS
              </p>
            </div>

            {membershipError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {membershipError}
              </div>
            )}

            {/* ==========================================
                3 FILTER BUTTONS
            ========================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MembershipFilterButton
                active={membershipFilter === "basic"}
                onClick={() => setMembershipFilter("basic")}
                title="FREE / BASIC"
                subtitle="No Silver or Gold"
                count={freeMembers.length}
                tone="basic"
              />

              <MembershipFilterButton
                active={membershipFilter === "pro"}
                onClick={() => setMembershipFilter("pro")}
                title="SILVER PRO"
                subtitle="₹1,499 Plan"
                count={silverMembers.length}
                tone="silver"
              />

              <MembershipFilterButton
                active={membershipFilter === "verified"}
                onClick={() => setMembershipFilter("verified")}
                title="GOLD VERIFIED"
                subtitle="₹2,999 Plan"
                count={goldMembers.length}
                tone="gold"
              />
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
    </div>
  );
}

// =====================================================
// DASHBOARD STAT
// =====================================================

function DashboardStat({ label, value, highlight = false, tone = "default" }) {
  const borderClass =
    tone === "basic"
      ? "border-purple-400/15 bg-purple-500/[0.02]"
      : tone === "silver"
        ? "border-slate-300/20 bg-slate-300/[0.025]"
        : tone === "gold"
          ? "border-amber-300/20 bg-amber-400/[0.025]"
          : "border-white/10 bg-[#0b0b0f]";

  const valueClass =
    tone === "basic"
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
        : active
          ? "border-purple-400/50 bg-purple-500/10 text-purple-200 shadow-[0_0_30px_rgba(168,85,247,0.08)]"
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
}) {
  const isGold = tone === "gold";
  const isSilver = tone === "silver";
  const isBasic = tone === "basic";

  const outerClass = isGold
    ? "border-amber-300/25 bg-amber-400/[0.025]"
    : isSilver
      ? "border-slate-300/20 bg-slate-300/[0.02]"
      : "border-purple-400/20 bg-purple-500/[0.02]";

  const accentClass = isGold
    ? "text-amber-300"
    : isSilver
      ? "text-slate-200"
      : "text-purple-300";

  const badgeClass = isGold
    ? "border-amber-300/20 bg-amber-400/10 text-amber-300"
    : isSilver
      ? "border-slate-300/20 bg-slate-300/10 text-slate-200"
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
            {isBasic
              ? "Artists without Silver or Gold will appear here."
              : "Paid members will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
          {members.map((artist, index) => (
            <MembershipMemberRow
              key={artist.id || `${artist.name}-${index}`}
              artist={artist}
              tone={tone}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MembershipMemberRow({ artist, tone }) {
  const isGold = tone === "gold";
  const isSilver = tone === "silver";

  const accentClass = isGold
    ? "text-amber-300"
    : isSilver
      ? "text-slate-200"
      : "text-purple-300";

  const dotClass = isGold
    ? "bg-amber-400"
    : isSilver
      ? "bg-slate-300"
      : "bg-purple-400";

  const planLabel = isGold ? "GOLD" : isSilver ? "SILVER" : "FREE";

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-4">
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

        <span
          className={`shrink-0 text-[8px] font-black uppercase tracking-widest ${accentClass}`}
        >
          {planLabel}
        </span>
      </div>

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

        <span
          className={`text-[9px] font-bold uppercase ${
            isGold
              ? "text-amber-300"
              : isSilver
                ? "text-slate-200"
                : "text-purple-300"
          }`}
        >
          {isGold
            ? artist.paymentStatus || "GOLD ACTIVE"
            : isSilver
              ? artist.paymentStatus || "SILVER ACTIVE"
              : "FREE / BASIC"}
        </span>
      </div>
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

export default Dashboard;
