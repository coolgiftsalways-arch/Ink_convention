import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  RefreshCcw,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const STATUS_OPTIONS = ["New", "Contacted", "Confirmed", "Cancelled"];

export default function AdminGets() {
  const [entries, setEntries] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    confirmed: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const entriesRequestRef = useRef(null);

  /* =========================================================
     LOAD ALL GET ENTRIES
  ========================================================= */

  const loadEntries = useCallback(() => {
    // Cancel an older load so it cannot overwrite newer results.
    entriesRequestRef.current?.abort();
    const controller = new AbortController();
    entriesRequestRef.current = controller;

    return fetch(`${API_URL}/api/get`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then(async (response) => {
        const rawText = await response.text();
        if (controller.signal.aborted) return;

        let data = {};

        if (rawText.trim()) {
          try {
            data = JSON.parse(rawText);
          } catch (parseError) {
            throw new Error(
              `Invalid server response (HTTP ${response.status}): ${rawText.slice(0, 180)}`,
              { cause: parseError },
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `GET /api/get failed with HTTP ${response.status}.`,
          );
        }

        if (!rawText.trim()) {
          throw new Error(
            `GET /api/get returned an empty response (HTTP ${response.status}).`,
          );
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.entries)
            ? data.entries
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setError("");
        setEntries(list);

        setStats({
          total: Number(data?.stats?.total ?? list.length ?? 0),

          new: Number(
            data?.stats?.new ??
              list.filter((item) => item.status === "New").length,
          ),

          contacted: Number(
            data?.stats?.contacted ??
              list.filter((item) => item.status === "Contacted").length,
          ),

          confirmed: Number(
            data?.stats?.confirmed ??
              list.filter((item) => item.status === "Confirmed").length,
          ),

          cancelled: Number(
            data?.stats?.cancelled ??
              list.filter((item) => item.status === "Cancelled").length,
          ),
        });
      })
      .catch((loadError) => {
        if (controller.signal.aborted) return;
        console.error("Admin GET entries load error:", loadError);

        setError(loadError.message || "Unable to load GET ENTRY submissions.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
  }, []);

  // Loading already starts as true on mount. Reset it only for user actions.
  const refreshEntries = () => {
    setLoading(true);
    setError("");
    return loadEntries();
  };

  useEffect(() => {
    void loadEntries();

    return () => {
      entriesRequestRef.current?.abort();
    };
  }, [loadEntries]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return entries;
    }

    return entries.filter((entry) => {
      return [
        entry.fullName,
        entry.email,
        entry.mobile,
        entry.state,
        entry.eventCity,
        entry.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [entries, search]);

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const updateStatus = async (entryId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/get/${entryId}/status`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          status,
        }),
      });

      const rawText = await response.text();
      const data = rawText.trim() ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new Error(
          data?.message || `Status update failed with HTTP ${response.status}.`,
        );
      }

      setEntries((current) =>
        current.map((entry) => (entry._id === entryId ? data.entry : entry)),
      );

      if (selectedEntry?._id === entryId) {
        setSelectedEntry(data.entry);
      }

      await refreshEntries();
    } catch (statusError) {
      console.error("Update GET status error:", statusError);

      window.alert(statusError.message || "Unable to update status.");
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteEntry = async (entry) => {
    if (!entry?._id) {
      return;
    }

    const confirmed = window.confirm(`Delete entry for ${entry.fullName}?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(entry._id);

      const response = await fetch(`${API_URL}/api/get/${entry._id}`, {
        method: "DELETE",

        headers: {
          Accept: "application/json",
        },

        credentials: "include",
      });

      const rawText = await response.text();
      const data = rawText.trim() ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new Error(
          data?.message || `Delete failed with HTTP ${response.status}.`,
        );
      }

      setEntries((current) => current.filter((item) => item._id !== entry._id));

      if (selectedEntry?._id === entry._id) {
        setSelectedEntry(null);
      }

      await refreshEntries();
    } catch (deleteError) {
      console.error("Delete GET entry error:", deleteError);

      window.alert(deleteError.message || "Unable to delete entry.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#050507] p-5 text-white lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5">
              <Ticket size={13} className="text-purple-400" />

              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-purple-300">
                INK CONVENTION 2026
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Visitor Entries
              <span className="text-[#a855f7]">.</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              View visitors who submitted the GET ENTRY form, ticket quantities
              and contact status.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshEntries}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-mono text-[10px] font-black uppercase tracking-wider transition hover:border-purple-500/40 hover:bg-purple-500/10"
          >
            <RefreshCcw size={15} />
            Refresh
          </button>
        </div>

        {/* STATS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Entries" value={stats.total} />

          <StatCard label="New" value={stats.new} accent="text-purple-400" />

          <StatCard
            label="Contacted"
            value={stats.contacted}
            accent="text-blue-400"
          />

          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            accent="text-emerald-400"
          />

          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            accent="text-red-400"
          />
        </div>

        {/* SEARCH */}

        <div className="mt-7 rounded-2xl border border-white/10 bg-[#0b0b10] p-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, mobile, state or city..."
              className="h-12 w-full rounded-xl border border-white/10 bg-[#07070a] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-purple-500"
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="text-xl font-black uppercase">
                GET ENTRY REQUESTS
              </h2>

              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-gray-600">
                Showing {filteredEntries.length} entries
              </p>
            </div>

            <Ticket size={21} className="text-purple-400" />
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center font-mono text-xs uppercase tracking-wider text-gray-500">
              Loading entries...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket size={30} className="mx-auto text-gray-700" />

              <p className="mt-4 font-mono text-xs uppercase tracking-wider text-gray-600">
                No GET ENTRY submissions yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="bg-white/[0.025]">
                  <tr className="text-left font-mono text-[9px] font-black uppercase tracking-wider text-gray-600">
                    <th className="px-5 py-4">Visitor</th>

                    <th className="px-5 py-4">Mobile</th>

                    <th className="px-5 py-4">State</th>

                    <th className="px-5 py-4">Event</th>

                    <th className="px-5 py-4">Tickets</th>

                    <th className="px-5 py-4">Total</th>

                    <th className="px-5 py-4">Submitted</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry._id}
                      className="text-xs text-gray-400 transition hover:bg-white/[0.02]"
                    >
                      {/* VISITOR */}

                      <td className="px-5 py-4">
                        <p className="font-black text-white">
                          {entry.fullName || "—"}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-[10px] text-gray-600">
                          {entry.email || "—"}
                        </p>
                      </td>

                      {/* MOBILE */}

                      <td className="px-5 py-4">{entry.mobile || "—"}</td>

                      {/* STATE */}

                      <td className="px-5 py-4">{entry.state || "—"}</td>

                      {/* EVENT */}

                      <td className="px-5 py-4">
                        <p className="font-black uppercase text-white">
                          {entry.eventCity || "—"}
                        </p>

                        <p className="mt-1 text-[9px] text-gray-600">
                          {entry.eventDate || "—"}
                        </p>
                      </td>

                      {/* TICKETS */}

                      <td className="px-5 py-4">
                        <span className="inline-flex min-w-[36px] items-center justify-center rounded-lg bg-purple-500/10 px-2 py-2 font-black text-purple-300">
                          {entry.tickets || 0}
                        </span>
                      </td>

                      {/* TOTAL */}

                      <td className="px-5 py-4 font-black text-purple-300">
                        ₹
                        {Number(entry.totalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-[10px]">
                        {formatDateTime(entry.createdAt)}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <select
                          value={entry.status || "New"}
                          onChange={(event) =>
                            updateStatus(entry._id, event.target.value)
                          }
                          className="rounded-lg border border-white/10 bg-[#07070a] px-3 py-2 font-mono text-[9px] font-bold uppercase text-white outline-none focus:border-purple-500"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(entry)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300"
                            title="View entry"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === entry._id}
                            onClick={() => deleteEntry(entry)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Delete entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          VIEW ENTRY MODAL
      ===================================================== */}

      {selectedEntry && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0b0b10] p-6 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-500 transition hover:border-white/20 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 pr-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                <Ticket size={22} />
              </div>

              <div>
                <p className="font-mono text-[9px] font-black uppercase tracking-wider text-purple-400">
                  GET ENTRY
                </p>

                <h3 className="mt-1 text-2xl font-black">
                  {selectedEntry.fullName}
                </h3>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Info label="Email" value={selectedEntry.email} />

              <Info label="Mobile" value={selectedEntry.mobile} />

              <Info label="State" value={selectedEntry.state} />

              <Info
                label="Event"
                value={`${selectedEntry.eventCity || "—"} • ${
                  selectedEntry.eventDate || "—"
                }`}
              />

              <Info label="Tickets" value={selectedEntry.tickets} />

              <Info
                label="Price Per Ticket"
                value={`₹${Number(
                  selectedEntry.ticketPrice || 1100,
                ).toLocaleString("en-IN")}`}
              />

              <Info
                label="Total"
                value={`₹${Number(
                  selectedEntry.totalAmount || 0,
                ).toLocaleString("en-IN")}`}
              />

              <Info label="Status" value={selectedEntry.status} />

              <Info
                label="Submitted"
                value={formatDateTime(selectedEntry.createdAt)}
              />

              <Info
                label="Contacted At"
                value={
                  selectedEntry.contactedAt
                    ? formatDateTime(selectedEntry.contactedAt)
                    : "Not contacted yet"
                }
              />
            </div>

            {selectedEntry.status !== "Contacted" && (
              <button
                type="button"
                onClick={() => updateStatus(selectedEntry._id, "Contacted")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-mono text-[10px] font-black uppercase tracking-wider transition hover:bg-purple-500"
              >
                <CheckCircle2 size={16} />
                Mark as Contacted
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0b10] p-5">
      <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-gray-600">
        {label}
      </p>

      <p className={`mt-3 text-3xl font-black ${accent}`}>
        {Number(value || 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="font-mono text-[8px] font-black uppercase tracking-wider text-gray-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value || "—"}
      </p>
    </div>
  );
}
