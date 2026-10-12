import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  RefreshCcw,
  Search,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";

/* =====================================================
   API CONFIG
===================================================== */

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const STATUSES = ["New", "Contacted", "Confirmed", "Cancelled"];

/* =====================================================
   CITY DATA
===================================================== */

const CITY_NAMES = {
  jaipur: "Jaipur",
  udaipur: "Udaipur",
  kota: "Kota",
};

const CITY_INFO = {
  jaipur: {
    venue: "Jaipur Exhibition & Convention Centre (JECC)",
    address: "Sitapura, Tonk Road, Jaipur",
  },

  udaipur: {
    venue: "Hotel Inder Residency",
    address: "Goverdhan Vilas, Ekling Nagar, Udaipur",
  },

  kota: {
    venue: "Umed Bhawan Palace",
    address: "Station Main Road, Kota",
  },
};

const PASS_PRICES = {
  1: 2999,
  2: 4999,
  3: 5999,
};

/* =====================================================
   HELPERS
===================================================== */

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const niceCity = (value) =>
  CITY_NAMES[String(value || "").toLowerCase()] || value || "—";

const dateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return (
    date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }) + " IST"
  );
};

const prettyDate = (value) => {
  if (!value) return "—";

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return String(value);
  }

  const date = new Date(`${value}T12:00:00+05:30`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

/* =====================================================
   SUPPORT NEW AND OLD ENTRIES

   NEW:
   entry.bookings = [
     { eventCity, passDays, selectedDates, ... }
   ]

   OLD:
   entry.eventCity
   entry.eventDate
===================================================== */

function getCityBookings(entry) {
  if (Array.isArray(entry?.bookings) && entry.bookings.length > 0) {
    return entry.bookings.map((booking) => ({
      ...booking,

      selectedDates: Array.isArray(booking.selectedDates)
        ? booking.selectedDates
        : [],
    }));
  }

  if (!entry?.eventCity) {
    return [];
  }

  return [
    {
      eventCity: entry.eventCity,

      passDays: null,

      selectedDates: [],

      legacyEventDate: entry.eventDate,

      tickets: entry.tickets,

      firstPersonPrice: entry.ticketPrice,

      additionalAmount:
        Math.max(0, Number(entry.tickets || 1) - 1) *
        Number(entry.additionalTicketPrice || 1499),

      totalAmount: entry.totalAmount,
    },
  ];
}

/* =====================================================
   API REQUEST
===================================================== */

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",

    cache: "no-store",

    ...options,

    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  const raw = await response.text();

  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Invalid API response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (HTTP ${response.status}).`,
    );
  }

  return data;
}

/* =====================================================
   STATS CARD
===================================================== */

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0b10] p-5">
      <p className="font-mono text-[9px] font-black uppercase tracking-[0.17em] text-gray-500">
        {label}
      </p>

      <p className={`mt-3 text-3xl font-black ${color}`}>
        {Number(value || 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

/* =====================================================
   INFO BOX
===================================================== */

function Info({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value ?? "—"}
      </p>
    </div>
  );
}

/* =====================================================
   MAIN ADMIN COMPONENT
===================================================== */

export default function AdminGets() {
  const navigate = useNavigate();

  /* ===================================================
     STATES
  =================================================== */

  const [entries, setEntries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const [selectedEntry, setSelectedEntry] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);

  const loadRef = useRef(null);

  /* ===================================================
     FETCH ENTRIES
  =================================================== */

  const loadEntries = useCallback(async () => {
    loadRef.current?.abort();

    const ctrl = new AbortController();

    loadRef.current = ctrl;

    setLoading(true);

    try {
      const data = await api("/api/get", {
        signal: ctrl.signal,
      });

      if (ctrl.signal.aborted) {
        return;
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.entries)
          ? data.entries
          : Array.isArray(data.data)
            ? data.data
            : [];

      setEntries(list);

      setError("");

      setSelectedEntry((current) => {
        if (!current) {
          return null;
        }

        return list.find((entry) => entry._id === current._id) || null;
      });
    } catch (err) {
      if (ctrl.signal.aborted) {
        return;
      }

      setError(err.message || "Unable to load GET entries.");
    } finally {
      if (!ctrl.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    void loadEntries();

    return () => {
      loadRef.current?.abort();
    };
  }, [loadEntries]);

  /* ===================================================
     CLOSE MODAL USING ESC
  =================================================== */

  useEffect(() => {
    if (!selectedEntry) {
      return undefined;
    }

    const onKey = (event) => {
      if (event.key === "Escape") {
        setSelectedEntry(null);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedEntry]);

  /* ===================================================
     STATS
  =================================================== */

  const stats = useMemo(
    () => ({
      total: entries.length,

      new: entries.filter((entry) => (entry.status || "New") === "New").length,

      contacted: entries.filter((entry) => entry.status === "Contacted").length,

      confirmed: entries.filter((entry) => entry.status === "Confirmed").length,

      cancelled: entries.filter((entry) => entry.status === "Cancelled").length,
    }),
    [entries],
  );

  /* ===================================================
     SEARCH AND FILTER
  =================================================== */

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();

    return entries.filter((entry) => {
      if (filter !== "All" && (entry.status || "New") !== filter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const bookings = getCityBookings(entry);

      const text = [
        entry.fullName,
        entry.email,
        entry.mobile,
        entry.state,
        entry.status,
        entry.eventCity,
        entry.eventDate,
        entry.tickets,
        entry.totalAmount,

        ...bookings.flatMap((booking) => [
          booking.eventCity,
          niceCity(booking.eventCity),
          booking.passDays,
          booking.passType,

          ...(booking.selectedDates || []),
        ]),
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [entries, search, filter]);

  /* ===================================================
     UPDATE STATUS
  =================================================== */

  const updateStatus = async (id, status) => {
    if (updatingId) return;

    setUpdatingId(id);

    try {
      const data = await api(`/api/get/${id}/status`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status,
        }),
      });

      const updated = data.entry;

      if (!updated) {
        throw new Error("Server returned no updated entry.");
      }

      setEntries((old) =>
        old.map((entry) =>
          entry._id === id
            ? {
                ...entry,
                ...updated,
              }
            : entry,
        ),
      );

      setSelectedEntry((old) =>
        old?._id === id
          ? {
              ...old,
              ...updated,
            }
          : old,
      );
    } catch (err) {
      window.alert(err.message || "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===================================================
     DELETE ENTRY
  =================================================== */

  const deleteEntry = async (entry) => {
    if (
      !window.confirm(
        `Permanently delete ${entry.fullName || "this visitor"}'s entry?`,
      )
    ) {
      return;
    }

    setDeletingId(entry._id);

    try {
      await api(`/api/get/${entry._id}`, {
        method: "DELETE",
      });

      setEntries((old) => old.filter((item) => item._id !== entry._id));

      setSelectedEntry((old) => (old?._id === entry._id ? null : old));
    } catch (err) {
      window.alert(err.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const displayedBookings = selectedEntry ? getCityBookings(selectedEntry) : [];

  /* ===================================================
     MAIN JSX
  =================================================== */

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* ADMIN SIDEBAR */}

      <AdminSidebar
        onLogout={() => navigate("/admin/login")}
        getCount={stats.total}
      />

      <main className="min-h-screen lg:ml-72">
        <div className="p-5 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            {/* HEADER */}

            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-7">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[10px] font-black tracking-widest text-purple-300">
                  <Ticket size={13} />
                  INK CONVENTION 2026
                </div>

                <h1 className="mt-5 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                  Visitor Entries
                  <span className="text-purple-500">.</span>
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                  Every city, selected date, pass, visitor and submission time.
                </p>
              </div>

              {/* REFRESH */}

              <button
                type="button"
                disabled={loading}
                onClick={() => void loadEntries()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-black hover:border-purple-500/40 disabled:opacity-40"
              >
                <RefreshCcw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />

                {loading ? "REFRESHING" : "REFRESH"}
              </button>
            </div>

            {/* STATS */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Total Entries" value={stats.total} />

              <StatCard label="New" value={stats.new} color="text-purple-400" />

              <StatCard
                label="Contacted"
                value={stats.contacted}
                color="text-blue-400"
              />

              <StatCard
                label="Confirmed"
                value={stats.confirmed}
                color="text-emerald-400"
              />

              <StatCard
                label="Cancelled"
                value={stats.cancelled}
                color="text-red-400"
              />
            </div>

            {/* SEARCH */}

            <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b0b10] p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, mobile, city, date, pass or status..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#07070a] pl-11 pr-4 text-sm outline-none placeholder:text-gray-600 focus:border-purple-500"
                />
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-12 rounded-xl border border-white/10 bg-[#07070a] px-4 text-sm text-white outline-none focus:border-purple-500"
              >
                {["All", ...STATUSES].map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Statuses" : item}
                  </option>
                ))}
              </select>
            </div>

            {/* TABLE */}

            <section className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <h2 className="text-xl font-black uppercase">
                    GET ENTRY REQUESTS
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Showing {filteredEntries.length} of {entries.length}{" "}
                    visitors
                  </p>
                </div>

                <Ticket className="text-purple-400" size={22} />
              </div>

              {/* ERROR */}

              {error && (
                <p
                  role="alert"
                  className="m-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              {/* LOADING */}

              {loading ? (
                <p className="p-12 text-center text-sm text-gray-400">
                  Loading entries...
                </p>
              ) : filteredEntries.length === 0 ? (
                <p className="p-12 text-center text-sm text-gray-500">
                  No matching entries.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1280px] text-left">
                    <thead className="bg-white/[0.025] text-[10px] font-black uppercase tracking-wider text-gray-500">
                      <tr>
                        {[
                          "Visitor",
                          "Mobile / State",
                          "All Cities & Passes",
                          "People",
                          "Grand Total",
                          "Submitted (IST)",
                          "Status",
                          "Actions",
                        ].map((column) => (
                          <th
                            key={column}
                            className="whitespace-nowrap px-5 py-4"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {filteredEntries.map((entry) => {
                        const bookings = getCityBookings(entry);

                        return (
                          <tr
                            key={entry._id}
                            className="text-xs text-gray-400 hover:bg-white/[0.025]"
                          >
                            {/* VISITOR */}

                            <td className="px-5 py-4">
                              <p className="font-black text-white">
                                {entry.fullName || "—"}
                              </p>

                              <p className="mt-1 max-w-[230px] truncate text-[11px] text-gray-500">
                                {entry.email || "—"}
                              </p>
                            </td>

                            {/* CONTACT */}

                            <td className="px-5 py-4">
                              <p className="text-white">
                                {entry.mobile || "—"}
                              </p>

                              <p className="mt-1 text-gray-500">
                                {entry.state || "—"}
                              </p>
                            </td>

                            {/* ALL CITIES */}

                            <td className="min-w-[245px] px-5 py-4">
                              <div className="space-y-2">
                                {bookings.map((booking, index) => (
                                  <div key={`${booking.eventCity}-${index}`}>
                                    <p className="font-black text-white">
                                      {niceCity(booking.eventCity)}

                                      {booking.passDays ? (
                                        <span className="ml-2 text-purple-300">
                                          {booking.passDays}
                                          -Day
                                        </span>
                                      ) : null}
                                    </p>

                                    <p className="mt-1 text-[11px] text-gray-500">
                                      {booking.selectedDates?.length
                                        ? booking.selectedDates
                                            .map(prettyDate)
                                            .join(" · ")
                                        : booking.legacyEventDate || "—"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* PEOPLE */}

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-purple-500/10 px-3 py-2 font-black text-purple-300">
                                {entry.tickets || 1}
                              </span>
                            </td>

                            {/* TOTAL */}

                            <td className="whitespace-nowrap px-5 py-4 font-black text-purple-300">
                              {money(entry.totalAmount)}
                            </td>

                            {/* SUBMITTED */}

                            <td className="min-w-[165px] px-5 py-4 text-[11px]">
                              {dateTime(entry.createdAt)}
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">
                              <select
                                value={entry.status || "New"}
                                disabled={updatingId === entry._id}
                                onChange={(event) =>
                                  void updateStatus(
                                    entry._id,
                                    event.target.value,
                                  )
                                }
                                className="rounded-lg border border-white/10 bg-[#07070a] px-3 py-2 text-xs font-bold text-white outline-none disabled:opacity-50"
                              >
                                {STATUSES.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">
                              <div className="flex gap-2">
                                {/* VIEW */}

                                <button
                                  type="button"
                                  title="View all details"
                                  onClick={() => setSelectedEntry(entry)}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:border-purple-500/50 hover:text-purple-300"
                                >
                                  <Eye size={16} />
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  title="Delete entry"
                                  disabled={deletingId === entry._id}
                                  onClick={() => void deleteEntry(entry)}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ===================================================
         FULL DETAILS MODAL
      =================================================== */}

      {selectedEntry && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Visitor booking details"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-purple-500/25 bg-[#0c0b12] p-5 shadow-2xl sm:p-8"
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple-400">
                  Complete Visitor Booking
                </p>

                <h2 className="mt-2 break-words text-2xl font-black sm:text-3xl">
                  {selectedEntry.fullName || "Visitor"}
                </h2>

                <p className="mt-2 break-all text-xs text-gray-500">
                  Request ID: {selectedEntry._id}
                </p>
              </div>

              <button
                type="button"
                title="Close"
                aria-label="Close"
                onClick={() => setSelectedEntry(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 hover:border-purple-500/50"
              >
                <X size={19} />
              </button>
            </div>

            {/* PERSONAL INFORMATION */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Email" value={selectedEntry.email} />

              <Info label="Mobile" value={selectedEntry.mobile} />

              <Info label="State" value={selectedEntry.state} />

              <Info
                label="Submitted Date & Time"
                value={dateTime(selectedEntry.createdAt)}
              />

              <Info
                label="Total People / City"
                value={selectedEntry.tickets || 1}
              />

              <Info
                label="Contacted At"
                value={
                  selectedEntry.contactedAt
                    ? dateTime(selectedEntry.contactedAt)
                    : "Not contacted yet"
                }
              />
            </div>

            {/* CITY HEADING */}

            <div className="mt-7 flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin size={18} className="text-purple-400" />

              <h3 className="text-lg font-black uppercase">
                All Selected Cities ({displayedBookings.length})
              </h3>
            </div>

            {/* CITY DETAILS */}

            <div className="mt-4 space-y-4">
              {displayedBookings.map((booking, index) => {
                const venue = CITY_INFO[booking.eventCity] || {};

                const firstPrice =
                  booking.firstPersonPrice ??
                  PASS_PRICES[booking.passDays] ??
                  selectedEntry.ticketPrice ??
                  2999;

                return (
                  <article
                    key={`${booking.eventCity}-${index}`}
                    className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] to-transparent p-5"
                  >
                    {/* CITY AND AMOUNT */}

                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xl font-black uppercase text-white">
                          {niceCity(booking.eventCity)}
                        </h4>

                        <p className="mt-1 font-semibold text-purple-300">
                          {booking.passDays
                            ? `${booking.passDays}-Day Entry Pass`
                            : "Legacy Entry Pass"}
                        </p>
                      </div>

                      <p className="text-xl font-black text-purple-300">
                        {money(booking.totalAmount)}
                      </p>
                    </div>

                    {/* DATES AND VENUE */}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="flex gap-2">
                        <CalendarDays
                          size={17}
                          className="mt-0.5 shrink-0 text-amber-400"
                        />

                        <div>
                          <p className="text-xs font-black uppercase text-gray-400">
                            Selected Event Dates
                          </p>

                          {booking.selectedDates?.length ? (
                            booking.selectedDates.map((date) => (
                              <p key={date} className="mt-1 text-sm text-white">
                                {prettyDate(date)}
                              </p>
                            ))
                          ) : (
                            <p className="mt-1 text-sm text-white">
                              {booking.legacyEventDate || "Not recorded"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-amber-400"
                        />

                        <div>
                          <p className="text-xs font-black uppercase text-gray-400">
                            Venue
                          </p>

                          <p className="mt-1 text-sm text-white">
                            {venue.venue || "—"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {venue.address || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PEOPLE AND PRICE */}

                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                      <Info
                        label="People"
                        value={booking.tickets || selectedEntry.tickets || 1}
                      />

                      <Info label="First Person" value={money(firstPrice)} />

                      <Info
                        label="Additional People"
                        value={money(
                          booking.additionalAmount ??
                            Math.max(0, (selectedEntry.tickets || 1) - 1) *
                              (selectedEntry.additionalTicketPrice || 1499),
                        )}
                      />
                    </div>
                  </article>
                );
              })}
            </div>

            {/* GRAND TOTAL */}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
              <p className="text-sm font-black uppercase">
                Grand Total · All Cities
              </p>

              <strong className="text-3xl font-black text-purple-300">
                {money(selectedEntry.totalAmount)}
              </strong>
            </div>

            {/* STATUS AND SUBMISSION TIME */}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Clock3 size={17} className="text-gray-400" />

                <span className="text-xs text-gray-400">
                  Submitted {dateTime(selectedEntry.createdAt)}
                </span>
              </div>

              <select
                value={selectedEntry.status || "New"}
                disabled={updatingId === selectedEntry._id}
                onChange={(event) =>
                  void updateStatus(selectedEntry._id, event.target.value)
                }
                className="rounded-xl border border-purple-500/30 bg-[#140f1d] px-4 py-3 text-xs font-black uppercase text-white outline-none"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* MARK AS CONTACTED */}

            {selectedEntry.status !== "Contacted" && (
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={() =>
                  void updateStatus(selectedEntry._id, "Contacted")
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black uppercase hover:bg-purple-500 disabled:opacity-50"
              >
                <CheckCircle2 size={17} />
                Mark as Contacted
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
