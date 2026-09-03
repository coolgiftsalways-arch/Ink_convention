import React from "react";

import {
  Search,
  Eye,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Sparkles,
  Palette,
  Clock3,
  RefreshCw,
  UserRoundCheck,
  Trash2,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";

export default function ArtistBookings() {
  /* =========================================================
     API
  ========================================================= */

  const API_URL = import.meta.env.DEV
    ? ""
    : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
        .trim()
        .replace(/\/$/, "");

  /* =========================================================
     STATES
  ========================================================= */

  const [bookings, setBookings] = React.useState([]);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState("");

  const [search, setSearch] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState("all");

  const [selectedBooking, setSelectedBooking] = React.useState(null);

  const [deletingId, setDeletingId] = React.useState("");

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    localStorage.removeItem("admin");

    sessionStorage.removeItem("adminToken");

    window.location.href = "/admin/login";
  };

  /* =========================================================
     FETCH BOOKINGS
  ========================================================= */

  const fetchBookings = React.useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(`${API_URL}/api/artist-bookings`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load artist bookings.");
      }

      /* =====================================================
         SUPPORT MULTIPLE API RESPONSE FORMATS
      ===================================================== */

      const bookingList = Array.isArray(data)
        ? data
        : Array.isArray(data?.bookings)
          ? data.bookings
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setBookings(bookingList);
    } catch (fetchError) {
      console.error("Artist bookings fetch error:", fetchError);

      setError(
        fetchError.message || "Something went wrong while loading bookings.",
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  /* =========================================================
     LOAD BOOKINGS
  ========================================================= */

  React.useEffect(() => {
    /*
      Defer the initial request by one tick.

      This avoids react-hooks/set-state-in-effect because
      fetchBookings updates loading/error/bookings state.
    */
    const timer = window.setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchBookings]);

  /* =========================================================
     DELETE ARTIST BOOKING

     Backend route:
     DELETE /api/artist-bookings/:id
  ========================================================= */

  const deleteBooking = async (booking) => {
    const bookingId = String(booking?._id || booking?.id || "").trim();

    if (!bookingId) {
      window.alert("Booking ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete the artist booking for ${booking?.name || "this customer"}?\n\nThis will permanently remove it from MongoDB.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(bookingId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/artist-bookings/${bookingId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || `Delete failed with HTTP ${response.status}`,
        );
      }

      setBookings((previous) =>
        previous.filter(
          (item) => String(item?._id || item?.id || "") !== bookingId,
        ),
      );

      setSelectedBooking((previous) => {
        const selectedId = String(previous?._id || previous?.id || "");

        return selectedId === bookingId ? null : previous;
      });
    } catch (deleteError) {
      console.error("Artist booking delete error:", deleteError);

      window.alert(deleteError?.message || "Unable to delete artist booking.");
    } finally {
      setDeletingId("");
    }
  };

  /* =========================================================
     SELECTED ARTIST NAME
  ========================================================= */

  const getSelectedArtistName = (booking) => {
    return (
      booking?.selectedArtist?.name ||
      booking?.artist?.name ||
      booking?.selectedArtistName ||
      booking?.artistName ||
      ""
    );
  };

  /* =========================================================
     BOOKING STATUS
  ========================================================= */

  const getStatus = (booking) => {
    if (booking?.status) {
      return String(booking.status).toLowerCase();
    }

    if (
      booking?.selectedArtist ||
      booking?.artist ||
      booking?.selectedArtistId ||
      booking?.artistId
    ) {
      return "artist selected";
    }

    return "pending";
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "Not selected";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     FORMAT DATE + TIME
  ========================================================= */

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     FILTER BOOKINGS
  ========================================================= */

  const filteredBookings = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = getStatus(booking);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      const searchableText = [
        booking?.name,
        booking?.phone,
        booking?.email,
        booking?.city,
        booking?.category,
        booking?.preferredArtist,
        booking?.tattooIdea,
        getSelectedArtistName(booking),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const pendingCount = bookings.filter(
    (booking) => getStatus(booking) === "pending",
  ).length;

  const selectedCount = bookings.filter(
    (booking) => getStatus(booking) === "artist selected",
  ).length;

  const acceptedCount = bookings.filter((booking) => {
    const status = getStatus(booking);

    return status === "accepted" || status === "confirmed";
  }).length;

  /* =========================================================
     STATUS COLORS
  ========================================================= */

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "accepted" ||
      value === "confirmed" ||
      value === "completed"
    ) {
      return `
        border-emerald-500/30
        bg-emerald-500/10
        text-emerald-400
      `;
    }

    if (value === "rejected" || value === "cancelled" || value === "canceled") {
      return `
        border-red-500/30
        bg-red-500/10
        text-red-400
      `;
    }

    if (value === "artist selected") {
      return `
        border-purple-500/30
        bg-purple-500/10
        text-purple-400
      `;
    }

    return `
      border-yellow-500/30
      bg-yellow-500/10
      text-yellow-400
    `;
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-[#08080a]
        text-white
      "
    >
      {/* =====================================================
          LEFT ADMIN SIDEBAR
      ===================================================== */}

      <AdminSidebar onLogout={handleLogout} bookingCount={bookings.length} />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        className="
          min-h-screen

          lg:ml-72

          p-4
          sm:p-6
          lg:p-8

          pt-20
          lg:pt-8
        "
      >
        <div
          className="
            max-w-[1500px]
            mx-auto
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              flex-col

              lg:flex-row
              lg:items-end
              lg:justify-between

              gap-6

              mb-8
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-purple-400

                  mb-3
                "
              >
                <Sparkles size={15} />

                <p
                  className="
                    text-[9px]
                    font-black
                    tracking-[0.18em]
                  "
                >
                  INK CONVENTION DASHBOARD
                </p>
              </div>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  lg:text-5xl

                  font-black
                  uppercase

                  tracking-[-0.04em]
                "
              >
                Artist <span className="text-purple-500">Bookings</span>
              </h1>

              <p
                className="
                  text-sm
                  text-gray-500

                  mt-3
                "
              >
                View and manage all customer tattoo artist booking requests.
              </p>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchBookings}
              disabled={loading}
              className="
                inline-flex
                items-center
                justify-center
                gap-2

                border
                border-white/10

                bg-white/[0.04]
                hover:bg-white/[0.08]

                rounded-xl

                px-5
                py-3

                text-[9px]
                font-black
                tracking-[0.10em]

                transition

                disabled:opacity-50
              "
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              REFRESH
            </button>
          </div>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4

              gap-4

              mb-7
            "
          >
            <StatCard
              label="TOTAL BOOKINGS"
              value={bookings.length}
              icon={<CalendarDays size={19} />}
            />

            <StatCard
              label="PENDING"
              value={pendingCount}
              icon={<Clock3 size={19} />}
            />

            <StatCard
              label="ARTIST SELECTED"
              value={selectedCount}
              icon={<UserRoundCheck size={19} />}
            />

            <StatCard
              label="ACCEPTED"
              value={acceptedCount}
              icon={<Sparkles size={19} />}
            />
          </div>

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <div
            className="
              border
              border-white/10

              bg-[#0d0d11]

              rounded-2xl

              p-4

              mb-6
            "
          >
            <div
              className="
                flex
                flex-col

                md:flex-row

                gap-3
              "
            >
              {/* SEARCH */}

              <div
                className="
                  relative
                  flex-1
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
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, phone, email, city, tattoo style or artist..."
                  className="
                    w-full

                    rounded-xl

                    border
                    border-white/10

                    bg-black/30

                    pl-11
                    pr-4
                    py-3.5

                    text-sm
                    text-white

                    placeholder:text-gray-700

                    focus:border-purple-500

                    outline-none

                    transition
                  "
                />
              </div>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="
                  min-w-[190px]

                  rounded-xl

                  border
                  border-white/10

                  bg-[#09090b]

                  px-4
                  py-3.5

                  text-xs
                  text-white

                  outline-none

                  focus:border-purple-500

                  [color-scheme:dark]
                "
              >
                <option value="all">All Status</option>

                <option value="pending">Pending</option>

                <option value="artist selected">Artist Selected</option>

                <option value="accepted">Accepted</option>

                <option value="confirmed">Confirmed</option>

                <option value="rejected">Rejected</option>

                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                mb-6

                rounded-xl

                border
                border-red-500/30

                bg-red-500/[0.07]

                px-5
                py-4

                text-sm
                text-red-300
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div
              className="
                py-24
                text-center
              "
            >
              <div
                className="
                  w-8
                  h-8

                  mx-auto

                  rounded-full

                  border-2
                  border-purple-500/20
                  border-t-purple-500

                  animate-spin
                "
              />

              <p
                className="
                  mt-4

                  text-xs
                  text-gray-600
                "
              >
                Loading bookings...
              </p>
            </div>
          ) : filteredBookings.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================= */

            <div
              className="
                border
                border-white/10

                bg-[#0d0d11]

                rounded-2xl

                py-20
                px-5

                text-center
              "
            >
              <CalendarDays
                size={35}
                className="
                  mx-auto

                  text-gray-700

                  mb-4
                "
              />

              <h3
                className="
                  font-black
                  uppercase
                "
              >
                No Bookings Found
              </h3>

              <p
                className="
                  text-xs
                  text-gray-600

                  mt-2
                "
              >
                Customer artist booking requests will appear here.
              </p>
            </div>
          ) : (
            /* =================================================
               BOOKINGS TABLE
            ================================================= */

            <div
              className="
                border
                border-white/10

                bg-[#0d0d11]

                rounded-2xl

                overflow-hidden
              "
            >
              <div className="overflow-x-auto">
                <table
                  className="
                    w-full

                    min-w-[1180px]
                  "
                >
                  <thead>
                    <tr
                      className="
                        border-b
                        border-white/10

                        bg-white/[0.025]
                      "
                    >
                      <TableHead>CUSTOMER</TableHead>

                      <TableHead>PHONE</TableHead>

                      <TableHead>CITY</TableHead>

                      <TableHead>TATTOO STYLE</TableHead>

                      <TableHead>PREFERRED DATE</TableHead>

                      <TableHead>SELECTED ARTIST</TableHead>

                      <TableHead>STATUS</TableHead>

                      <TableHead>RECEIVED</TableHead>

                      <TableHead>ACTIONS</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking, index) => {
                      const status = getStatus(booking);

                      return (
                        <tr
                          key={booking?._id || booking?.id || index}
                          className="
                              border-b
                              border-white/[0.06]

                              last:border-b-0

                              hover:bg-white/[0.025]

                              transition
                            "
                        >
                          {/* CUSTOMER */}

                          <TableCell>
                            <div>
                              <p
                                className="
                                    font-black
                                    text-sm

                                    text-white
                                  "
                              >
                                {booking?.name || "—"}
                              </p>

                              <p
                                className="
                                    text-[10px]
                                    text-gray-600

                                    mt-1
                                  "
                              >
                                {booking?.email || "No email"}
                              </p>
                            </div>
                          </TableCell>

                          {/* PHONE */}

                          <TableCell>{booking?.phone || "—"}</TableCell>

                          {/* CITY */}

                          <TableCell>
                            <div
                              className="
                                  flex
                                  items-center
                                  gap-1.5
                                "
                            >
                              <MapPin size={12} className="text-purple-400" />

                              {booking?.city || "—"}
                            </div>
                          </TableCell>

                          {/* STYLE */}

                          <TableCell>
                            <span
                              className="
                                  inline-flex

                                  rounded-full

                                  border
                                  border-purple-500/20

                                  bg-purple-500/10

                                  px-3
                                  py-1.5

                                  text-[8px]
                                  font-black

                                  text-purple-400
                                "
                            >
                              {booking?.category || "—"}
                            </span>
                          </TableCell>

                          {/* DATE */}

                          <TableCell>
                            {formatDate(booking?.preferredDate)}
                          </TableCell>

                          {/* SELECTED ARTIST */}

                          <TableCell>
                            {getSelectedArtistName(booking) || (
                              <span className="text-gray-700">
                                Not selected
                              </span>
                            )}
                          </TableCell>

                          {/* STATUS */}

                          <TableCell>
                            <span
                              className={`
                                  inline-flex

                                  rounded-full

                                  border

                                  px-3
                                  py-1.5

                                  text-[8px]
                                  font-black
                                  uppercase

                                  ${getStatusStyle(status)}
                                `}
                            >
                              {status}
                            </span>
                          </TableCell>

                          {/* CREATED */}

                          <TableCell>
                            {formatDateTime(booking?.createdAt)}
                          </TableCell>

                          {/* VIEW */}

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedBooking(booking)}
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-lg
                                  bg-purple-600
                                  hover:bg-purple-500
                                  px-4
                                  py-2.5
                                  text-[8px]
                                  font-black
                                  text-white
                                  transition
                                "
                              >
                                <Eye size={13} />
                                VIEW
                              </button>

                              <button
                                type="button"
                                onClick={() => void deleteBooking(booking)}
                                disabled={
                                  deletingId ===
                                  String(booking?._id || booking?.id || "")
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-lg
                                  border
                                  border-red-500/25
                                  bg-red-500/10
                                  hover:bg-red-500/20
                                  px-4
                                  py-2.5
                                  text-[8px]
                                  font-black
                                  text-red-400
                                  transition
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                <Trash2 size={13} />
                                {deletingId ===
                                String(booking?._id || booking?.id || "")
                                  ? "DELETING..."
                                  : "DELETE"}
                              </button>
                            </div>
                          </TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================
          BOOKING DETAILS MODAL
      ========================================================= */}

      {selectedBooking && (
        <div
          className="
            fixed
            inset-0
            z-[9999]

            bg-black/80
            backdrop-blur-sm

            flex
            items-center
            justify-center

            p-4
          "
        >
          <div
            className="
              w-full
              max-w-[750px]

              max-h-[90vh]
              overflow-y-auto

              rounded-[28px]

              border
              border-purple-500/30

              bg-[#0d0d11]

              p-5
              sm:p-8
            "
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              className="
                flex
                items-start
                justify-between

                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    font-black
                    tracking-[0.16em]

                    text-purple-400
                  "
                >
                  BOOKING DETAILS
                </p>

                <h2
                  className="
                    mt-2

                    text-2xl
                    sm:text-3xl

                    font-black
                    uppercase
                  "
                >
                  {selectedBooking?.name || "Customer"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="
                  w-10
                  h-10

                  rounded-full

                  flex
                  items-center
                  justify-center

                  border
                  border-white/10

                  bg-white/[0.04]

                  hover:bg-white/10

                  transition
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="mt-5">
              <span
                className={`
                  inline-flex

                  rounded-full

                  border

                  px-3
                  py-1.5

                  text-[8px]
                  font-black
                  uppercase

                  ${getStatusStyle(getStatus(selectedBooking))}
                `}
              >
                {getStatus(selectedBooking)}
              </span>
            </div>

            {/* =================================================
                CUSTOMER INFORMATION
            ================================================= */}

            <SectionTitle title="CUSTOMER INFORMATION" />

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2

                gap-3
              "
            >
              <Detail
                icon={<User size={15} />}
                label="Customer Name"
                value={selectedBooking?.name}
              />

              <Detail
                icon={<Phone size={15} />}
                label="Phone Number"
                value={selectedBooking?.phone}
              />

              <Detail
                icon={<Mail size={15} />}
                label="Email Address"
                value={selectedBooking?.email}
              />

              <Detail
                icon={<MapPin size={15} />}
                label="City"
                value={selectedBooking?.city}
              />
            </div>

            {/* =================================================
                TATTOO REQUIREMENT
            ================================================= */}

            <SectionTitle title="TATTOO REQUIREMENT" />

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2

                gap-3
              "
            >
              <Detail
                icon={<Palette size={15} />}
                label="Tattoo Style"
                value={selectedBooking?.category}
              />

              <Detail
                icon={<CalendarDays size={15} />}
                label="Preferred Date"
                value={formatDate(selectedBooking?.preferredDate)}
              />

              <Detail
                icon={<Sparkles size={15} />}
                label="Preferred Artist / Studio"
                value={
                  selectedBooking?.preferredArtist || "No preferred artist"
                }
              />

              <Detail
                icon={<UserRoundCheck size={15} />}
                label="Selected Artist"
                value={
                  getSelectedArtistName(selectedBooking) ||
                  "Artist not selected"
                }
              />
            </div>

            {/* =================================================
                TATTOO IDEA
            ================================================= */}

            <div
              className="
                mt-3

                rounded-2xl

                border
                border-white/10

                bg-black/30

                p-5
              "
            >
              <p
                className="
                  text-[8px]
                  font-black
                  tracking-[0.12em]

                  text-gray-600

                  uppercase
                "
              >
                Tattoo Idea / Customer Message
              </p>

              <p
                className="
                  mt-3

                  text-sm
                  text-gray-300

                  leading-relaxed

                  whitespace-pre-wrap
                "
              >
                {selectedBooking?.tattooIdea || "No tattoo details provided."}
              </p>
            </div>

            {/* =================================================
                BOOKING INFO
            ================================================= */}

            <SectionTitle title="BOOKING INFORMATION" />

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2

                gap-3
              "
            >
              <Detail
                icon={<Clock3 size={15} />}
                label="Request Received"
                value={formatDateTime(selectedBooking?.createdAt)}
              />

              <Detail
                icon={<Sparkles size={15} />}
                label="Booking ID"
                value={selectedBooking?._id || selectedBooking?.id || "—"}
              />
            </div>

            {/* =================================================
                CLOSE
            ================================================= */}

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void deleteBooking(selectedBooking)}
                disabled={
                  deletingId ===
                  String(selectedBooking?._id || selectedBooking?.id || "")
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-red-500/25
                  bg-red-500/10
                  hover:bg-red-500/20
                  py-4
                  text-[9px]
                  font-black
                  tracking-[0.12em]
                  text-red-400
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {deletingId ===
                String(selectedBooking?._id || selectedBooking?.id || "")
                  ? "DELETING..."
                  : "DELETE BOOKING"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="
                  w-full
                  rounded-xl
                  bg-purple-600
                hover:bg-purple-500

                py-4

                text-[9px]
                font-black
                tracking-[0.12em]

                transition
              "
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ label, value, icon }) {
  return (
    <div
      className="
        rounded-2xl

        border
        border-white/10

        bg-[#0d0d11]

        p-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between

          gap-3
        "
      >
        <div>
          <p
            className="
              text-[8px]
              font-black
              tracking-[0.12em]

              text-gray-600
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2

              text-3xl
              font-black
            "
          >
            {value}
          </p>
        </div>

        <div
          className="
            w-11
            h-11

            rounded-xl

            flex
            items-center
            justify-center

            border
            border-purple-500/20

            bg-purple-500/10

            text-purple-400
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ title }) {
  return (
    <div
      className="
        mt-7
        mb-3
      "
    >
      <p
        className="
          text-[8px]
          font-black
          tracking-[0.15em]

          text-purple-400
        "
      >
        {title}
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function Detail({ icon, label, value }) {
  return (
    <div
      className="
        rounded-xl

        border
        border-white/10

        bg-black/30

        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-2

          text-purple-400
        "
      >
        {icon}

        <p
          className="
            text-[7px]
            font-black
            tracking-[0.10em]

            text-gray-600

            uppercase
          "
        >
          {label}
        </p>
      </div>

      <p
        className="
          mt-2

          text-sm

          break-words
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({ children }) {
  return (
    <th
      className="
        px-5
        py-4

        text-left

        text-[8px]
        font-black
        tracking-[0.12em]

        text-gray-600

        whitespace-nowrap
      "
    >
      {children}
    </th>
  );
}

/* =========================================================
   TABLE CELL
========================================================= */

function TableCell({ children }) {
  return (
    <td
      className="
        px-5
        py-4

        text-xs
        text-gray-400

        whitespace-nowrap
      "
    >
      {children}
    </td>
  );
}
