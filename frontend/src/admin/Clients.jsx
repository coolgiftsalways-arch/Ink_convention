import { useCallback, useEffect, useState } from "react";

import {
  Trophy,
  Mail,
  Phone,
  MapPin,
  Clock,
  Trash2,
  RefreshCw,
  UserRound,
  Search,
  X,
  Image as ImageIcon,
  Video,
  ChevronRight,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import "../Style/AdminClients.css";

/* =========================================================
   API
========================================================= */

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */

const getCompetitionArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.entries)) {
    return data.entries;
  }

  if (Array.isArray(data?.competitions)) {
    return data.competitions;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getMediaUrl = (value) => {
  if (!value) return "";

  const cleanValue = String(value).trim().replace(/\\/g, "/");

  if (
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://") ||
    cleanValue.startsWith("blob:") ||
    cleanValue.startsWith("data:")
  ) {
    return cleanValue;
  }

  if (cleanValue.startsWith("/")) {
    return `${API_URL}${cleanValue}`;
  }

  return `${API_URL}/${cleanValue}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";

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

const getPackageName = (value) => {
  if (value === "single") {
    return "Single Entry";
  }

  if (value === "pro") {
    return "Professional Bundle";
  }

  if (value === "multi") {
    return "Multi Entry Bundle";
  }

  return value || "N/A";
};

/* =========================================================
   CLIENTS / COMPETITION PAGE
========================================================= */

export default function Clients() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isLoggedIn") === "true",
  );

  const [competitions, setCompetitions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [timeFilter, setTimeFilter] = useState("all");

  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const [error, setError] = useState("");

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userEmail");

    setIsAuthenticated(false);
  };

  /* =======================================================
     FETCH COMPETITIONS
  ======================================================= */

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🏆 Fetching competition entries...");

      const response = await fetch(`${API_URL}/api/competitions`, {
        method: "GET",

        credentials: "include",

        headers: {
          Accept: "application/json",
        },

        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || `Server returned ${response.status}`);
      }

      const entries = getCompetitionArray(data);

      const loadedAt = Date.now();

      const preparedEntries = entries.map((entry) => {
        const createdTime = new Date(entry.createdAt || 0).getTime();

        return {
          ...entry,

          _ageMs: Number.isFinite(createdTime)
            ? Math.max(0, loadedAt - createdTime)
            : null,
        };
      });

      console.log("✅ Competition entries:", preparedEntries);

      setCompetitions(preparedEntries);
    } catch (fetchError) {
      console.error("❌ Competition fetch error:", fetchError);

      setError(fetchError.message || "Unable to load competition entries.");

      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      void fetchCompetitions();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, fetchCompetitions]);

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (event, id) => {
    event?.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this competition entry?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/competitions/${id}`, {
        method: "DELETE",

        credentials: "include",

        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete competition entry.");
      }

      setCompetitions((previous) =>
        previous.filter((entry) => entry._id !== id),
      );

      if (selectedCompetition?._id === id) {
        setSelectedCompetition(null);
      }
    } catch (deleteError) {
      console.error("❌ Competition delete error:", deleteError);

      alert(deleteError.message || "Unable to delete competition entry.");
    }
  };

  /* =======================================================
     TIME FILTER
  ======================================================= */

  const HOUR = 60 * 60 * 1000;

  const DAY = 24 * HOUR;

  const matchesTimeFilter = (entry, filter) => {
    if (filter === "all") {
      return true;
    }

    if (entry._ageMs === null || entry._ageMs === undefined) {
      return false;
    }

    if (filter === "48h") {
      return entry._ageMs <= 48 * HOUR;
    }

    if (filter === "1w") {
      return entry._ageMs <= 7 * DAY;
    }

    if (filter === "2w") {
      return entry._ageMs <= 14 * DAY;
    }

    if (filter === "1m") {
      return entry._ageMs <= 30 * DAY;
    }

    return true;
  };

  const getTimeCount = (filter) => {
    return competitions.filter((entry) => matchesTimeFilter(entry, filter))
      .length;
  };

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const searchText = search.trim().toLowerCase();

  const filteredCompetitions = competitions.filter((entry) => {
    if (!matchesTimeFilter(entry, timeFilter)) {
      return false;
    }

    if (!searchText) {
      return true;
    }

    const artistName = `${entry.firstName || ""} ${entry.lastName || ""}`
      .trim()
      .toLowerCase();

    return (
      artistName.includes(searchText) ||
      String(entry.professionalName || "")
        .toLowerCase()
        .includes(searchText) ||
      String(entry.gmail || "")
        .toLowerCase()
        .includes(searchText) ||
      String(entry.phone || "")
        .toLowerCase()
        .includes(searchText) ||
      String(entry.city || "")
        .toLowerCase()
        .includes(searchText) ||
      String(entry.state || "")
        .toLowerCase()
        .includes(searchText) ||
      String(entry.country || "")
        .toLowerCase()
        .includes(searchText) ||
      String(entry.category || "")
        .toLowerCase()
        .includes(searchText) ||
      String(entry.tattooTitle || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  /* =======================================================
     LOGIN REQUIRED
  ======================================================= */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="text-center">
          <Trophy size={40} className="text-[#a855f7] mx-auto mb-5" />

          <h1 className="text-2xl font-black">
            Admin Authentication Required
            <span className="text-[#a855f7]">.</span>
          </h1>

          <p className="mt-2 text-gray-500 font-mono text-xs">
            Please login to access competition entries.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="admin-clients-page">
      <AdminSidebar
        onLogout={handleLogout}
        tattooCount={0}
        clientCount={competitions.length}
      />

      <main className="flex-1 lg:pl-72">
        <div className="admin-clients-content">
          {/* ==========================================
              HEADER
          ========================================== */}

          <header className="clients-header">
            <div className="clients-header-left">
              <div className="clients-eyebrow">
                <Trophy size={13} />
                Competition Registry
              </div>

              <h1 className="clients-title">
                Competition
                <span>.</span>
              </h1>

              <p className="clients-description">
                Manage Ink Convention competition entries, review artist
                information, tattoo submissions and uploaded artwork.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchCompetitions()}
              className="clients-refresh"
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />

              {loading ? "Loading" : "Refresh"}
            </button>
          </header>

          {/* ==========================================
              TOP STATS
          ========================================== */}

          <div className="clients-stats">
            <div className="clients-stat-card">
              <p className="clients-stat-label">Total Entries</p>

              <p className="clients-stat-number">{competitions.length}</p>
            </div>

            <div className="clients-stat-card">
              <p className="clients-stat-label">Last 48 Hours</p>

              <p className="clients-stat-number">{getTimeCount("48h")}</p>
            </div>

            <div className="clients-stat-card">
              <p className="clients-stat-label">Server</p>

              <p className="clients-stat-online">ONLINE</p>
            </div>
          </div>

          {/* ==========================================
              TIME FILTER CARDS
          ========================================== */}

          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                value: "48h",
                label: "48 HOURS",
              },

              {
                value: "1w",
                label: "1 WEEK",
              },

              {
                value: "2w",
                label: "2 WEEKS",
              },

              {
                value: "1m",
                label: "1 MONTH",
              },

              {
                value: "all",
                label: "ALL TIME",
              },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setTimeFilter(filter.value)}
                className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                  timeFilter === filter.value
                    ? "border-[#a855f7]/60 bg-[#a855f7]/10 shadow-[0_0_25px_rgba(168,85,247,0.08)]"
                    : "border-white/10 bg-[#0b0b0f] hover:border-white/20"
                }`}
              >
                <p className="text-[9px] font-mono tracking-[0.15em] text-gray-500">
                  {filter.label}
                </p>

                <p className="mt-2 text-2xl font-black text-white">
                  {getTimeCount(filter.value)}
                </p>
              </button>
            ))}
          </div>

          {/* ==========================================
              SEARCH
          ========================================== */}

          <div className="clients-toolbar">
            <div className="clients-search">
              <Search size={17} className="clients-search-icon" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search artist, email, phone, city, category..."
                className="clients-search-input"
              />
            </div>
          </div>

          {/* ==========================================
              ERROR
          ========================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ==========================================
              COMPETITION LIST
          ========================================== */}

          <section>
            <div className="clients-section-header">
              <div className="clients-section-title">
                <Trophy size={15} />
                Competition Entries ({filteredCompetitions.length})
              </div>

              <span className="clients-live">Live Registry</span>
            </div>

            {loading ? (
              <div className="clients-loading">
                <RefreshCw
                  size={30}
                  className="mx-auto text-[#a855f7] animate-spin"
                />

                <p className="clients-loading-text">
                  Loading competition entries...
                </p>
              </div>
            ) : filteredCompetitions.length === 0 ? (
              <div className="clients-empty">
                <div className="clients-empty-icon">
                  <Trophy size={28} />
                </div>

                <h3 className="clients-empty-title">
                  No Competition Entries
                  <span>.</span>
                </h3>

                <p className="clients-empty-text">
                  {search
                    ? "No entry matches your search."
                    : "No entries match the selected time period."}
                </p>
              </div>
            ) : (
              <div className="clients-grid">
                {filteredCompetitions.map((entry) => {
                  const artistName =
                    `${entry.firstName || ""} ${entry.lastName || ""}`.trim() ||
                    "Unnamed Artist";

                  return (
                    <div
                      key={entry._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedCompetition(entry)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          setSelectedCompetition(entry);
                        }
                      }}
                      className="client-card group cursor-pointer"
                    >
                      <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#a855f7]/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

                      {/* HEADER */}

                      <div className="client-card-header">
                        <div className="client-profile">
                          <div className="client-avatar">
                            <UserRound size={20} />
                          </div>

                          <div className="client-name-wrapper">
                            <h3 className="client-name">{artistName}</h3>

                            <p className="client-type">
                              {entry.professionalName || "Competition Artist"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(event) =>
                            void handleDelete(event, entry._id)
                          }
                          className="client-delete"
                          title="Delete competition entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* DETAILS */}

                      <div className="client-details">
                        <div className="client-detail">
                          <Trophy size={14} />

                          <span>{entry.category || "No category"}</span>
                        </div>

                        <div className="client-detail">
                          <Mail size={14} />

                          <span>{entry.gmail || "No email"}</span>
                        </div>

                        <div className="client-detail">
                          <Phone size={14} />

                          <span>{entry.phone || "No phone"}</span>
                        </div>

                        <div className="client-detail">
                          <MapPin size={14} />

                          <span>
                            {entry.city || "No city"}

                            {entry.state ? `, ${entry.state}` : ""}
                          </span>
                        </div>
                      </div>

                      {/* FOOTER */}

                      <div className="client-card-footer">
                        <span className="client-date">
                          <Clock size={11} />

                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Unknown"}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#a855f7]">
                          View Details
                          <ChevronRight size={11} />
                        </span>
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

      {selectedCompetition && (
        <CompetitionModal
          entry={selectedCompetition}
          onClose={() => setSelectedCompetition(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   COMPETITION MODAL
========================================================= */

function CompetitionModal({ entry, onClose }) {
  const artistName =
    `${entry.firstName || ""} ${entry.lastName || ""}`.trim() ||
    "Unnamed Artist";

  const images = Array.isArray(entry.images) ? entry.images : [];

  const videos = Array.isArray(entry.videos) ? entry.videos : [];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="min-h-full flex justify-center items-start p-4 sm:p-8">
        <div
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0f] shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {/* HEADER */}

          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0b0b0f]/95 px-5 py-5 backdrop-blur-xl sm:px-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a855f7]">
                Competition Entry
              </p>

              <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {artistName}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-9 p-5 sm:p-8">
            {/* ARTIST */}

            <ModalSection title="Artist Details">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailBox
                  label="First Name"
                  value={entry.firstName || "N/A"}
                />

                <DetailBox label="Last Name" value={entry.lastName || "N/A"} />

                <DetailBox
                  label="Professional Name"
                  value={entry.professionalName || "N/A"}
                />

                <DetailBox label="Email" value={entry.gmail || "N/A"} />

                <DetailBox
                  label="Phone / WhatsApp"
                  value={entry.phone || "N/A"}
                />

                <DetailBox label="Instagram" value={entry.instagram || "N/A"} />

                <DetailBox label="Studio" value={entry.studio || "N/A"} />

                <DetailBox label="City" value={entry.city || "N/A"} />

                <DetailBox label="State" value={entry.state || "N/A"} />

                <DetailBox label="Country" value={entry.country || "India"} />

                <DetailBox
                  label="Primary Style"
                  value={entry.primaryStyle || "N/A"}
                />

                <DetailBox
                  label="Experience"
                  value={entry.experience || "N/A"}
                />
              </div>
            </ModalSection>

            {/* COMPETITION */}

            <ModalSection title="Competition Details">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailBox label="Category" value={entry.category || "N/A"} />

                <DetailBox
                  label="Entry Package"
                  value={getPackageName(entry.entryPackage)}
                />

                <DetailBox
                  label="Status"
                  value={entry.status || "Pending Review"}
                />

                <DetailBox
                  label="Submitted"
                  value={formatDate(entry.createdAt)}
                />

                <DetailBox
                  label="48 Hour Review Due"
                  value={formatDate(entry.reviewDueAt)}
                />

                <DetailBox
                  label="Reviewed At"
                  value={formatDate(entry.reviewedAt)}
                />
              </div>
            </ModalSection>

            {/* TATTOO */}

            <ModalSection title="Tattoo Details">
              <div className="space-y-3">
                <DetailBox
                  label="Tattoo Title"
                  value={entry.tattooTitle || "N/A"}
                />

                <DetailBox
                  label="Description"
                  value={entry.description || "N/A"}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailBox
                    label="Placement"
                    value={entry.placement || "N/A"}
                  />

                  <DetailBox label="Size" value={entry.size || "N/A"} />
                </div>
              </div>
            </ModalSection>

            {/* IMAGES */}

            <ModalSection title={`Images (${images.length})`}>
              {images.length === 0 ? (
                <EmptyMedia icon={<ImageIcon size={28} />} text="No Images" />
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {images.map((image, index) => (
                    <a
                      key={`${image}-${index}`}
                      href={getMediaUrl(image)}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-2xl border border-white/10 bg-black"
                    >
                      <img
                        src={getMediaUrl(image)}
                        alt={`Tattoo ${index + 1}`}
                        className="aspect-square w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              )}
            </ModalSection>

            {/* VIDEOS */}

            <ModalSection title={`Videos (${videos.length})`}>
              {videos.length === 0 ? (
                <EmptyMedia icon={<Video size={28} />} text="No Videos" />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {videos.map((video, index) => (
                    <video
                      key={`${video}-${index}`}
                      controls
                      src={getMediaUrl(video)}
                      className="w-full rounded-2xl border border-white/10 bg-black"
                    />
                  ))}
                </div>
              )}
            </ModalSection>

            {/* DECLARATIONS */}

            <ModalSection title="Declarations">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <DetailBox
                  label="Original Work"
                  value={entry.declarationOriginal ? "Yes" : "No"}
                />

                <DetailBox
                  label="Photo Consent"
                  value={entry.declarationConsent ? "Yes" : "No"}
                />

                <DetailBox
                  label="Terms Accepted"
                  value={entry.termsAccepted ? "Yes" : "No"}
                />
              </div>
            </ModalSection>

            {entry.reviewResult && (
              <ModalSection title="Review Result">
                <DetailBox label="Team Review" value={entry.reviewResult} />
              </ModalSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL SECTION
========================================================= */

function ModalSection({ title, children }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7]" />

        <h3 className="text-sm font-black uppercase tracking-widest text-white">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3">
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-gray-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold leading-relaxed text-gray-200">
        {value || "N/A"}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY MEDIA
========================================================= */

function EmptyMedia({ icon, text }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-black/30 text-gray-700">
      {icon}

      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest">
        {text}
      </p>
    </div>
  );
}
