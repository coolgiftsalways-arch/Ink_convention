import React from "react";
import {
  Search,
  Store,
  X,
  User,
  Sparkles,
  RefreshCw,
  Trash2,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

// =====================================================
// API
// =====================================================

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

// =====================================================
// STATUS
// =====================================================

const STATUS_OPTIONS = ["NEW", "CONTACTED", "CONFIRMED", "PAID", "CANCELLED"];

// =====================================================
// HELPERS
// =====================================================

function safeText(value) {
  return String(value || "").toLowerCase();
}

function formatPrice(value) {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFallbackPackagePrice(duration) {
  const value = String(duration || "1");

  if (value === "2") {
    return 8999;
  }

  if (value === "3") {
    return 12499;
  }

  return 4999;
}

// =====================================================
// NORMALIZE MONGODB BOOKING
// =====================================================

function normalizeBooking(booking, index) {
  const duration = String(
    booking.duration || booking.days || booking.stallDuration || "1",
  );

  const fallbackPrice = getFallbackPackagePrice(duration);

  const packagePrice =
    Number(
      booking.packagePrice ||
        booking.totalAmount ||
        booking.price ||
        booking.totalPrice,
    ) || fallbackPrice;

  const advanceAmount =
    Number(booking.advanceAmount || booking.paidAmount || booking.amount) ||
    1499;

  const rawStatus = booking.status || booking.bookingStatus || "CONFIRMED";

  const rawPaymentStatus =
    booking.paymentStatus || booking.payment?.status || "PENDING";

  return {
    id: booking._id || booking.id || booking.bookingId || `stall-${index + 1}`,

    bookingId:
      booking.bookingId ||
      booking._id ||
      booking.id ||
      `STALL-${String(index + 1).padStart(4, "0")}`,

    studioName:
      booking.studioName ||
      booking.brandName ||
      booking.company ||
      booking.studio ||
      "-",

    ownerName:
      booking.ownerName ||
      booking.fullName ||
      booking.owner ||
      booking.name ||
      "-",

    phone: booking.phone || booking.phoneNumber || booking.mobile || "-",

    email: booking.email || booking.gmail || booking.customerEmail || "-",

    city: booking.city || booking.userCity || "-",

    expoCity:
      booking.expoCity ||
      booking.preferredExpoCity ||
      booking.eventCity ||
      booking.city ||
      "-",

    duration,

    packageId:
      booking.packageId ||
      booking.package ||
      booking.stallPackage ||
      `${duration}-day`,

    packageName:
      booking.packageName ||
      booking.stallType ||
      booking.stallName ||
      `${duration} Day${duration === "1" ? "" : "s"} Stall`,

    packagePrice,

    advanceAmount,

    paymentStatus: String(rawPaymentStatus).toUpperCase(),

    status: String(rawStatus).toUpperCase(),

    paymentId:
      booking.paymentId ||
      booking.razorpayPaymentId ||
      booking.razorpay_payment_id ||
      "-",

    orderId:
      booking.orderId ||
      booking.razorpayOrderId ||
      booking.razorpay_order_id ||
      "-",

    instagram: booking.instagram || booking.instagramId || "-",

    message: booking.message || booking.note || booking.notes || "-",

    createdAt:
      booking.createdAt || booking.bookingDate || booking.updatedAt || "",
  };
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AdminStalls() {
  const [bookings, setBookings] = React.useState([]);

  const [searchQuery, setSearchQuery] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const [selectedBooking, setSelectedBooking] = React.useState(null);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState("");

  const [successMessage, setSuccessMessage] = React.useState("");

  const [deletingId, setDeletingId] = React.useState("");

  // ===================================================
  // LOAD BOOKINGS FROM MONGODB
  // ===================================================

  const loadBookings = React.useCallback(async () => {
    try {
      setError("");

      const url = `${API_URL}/api/stall-bookings`;

      console.log("======================================");
      console.log("🏪 ADMIN STALL REQUEST");
      console.log("URL:", url);
      console.log("======================================");

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",
        },

        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      console.log("✅ ADMIN GET HTTP STATUS:", response.status);
      console.log("✅ ADMIN GET BODY:", data);

      console.log("======================================");
      console.log("📦 STALL API RESPONSE");
      console.log(data);
      console.log("======================================");

      if (!response.ok) {
        throw new Error(
          data.message || `Backend returned HTTP ${response.status}`,
        );
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.bookings)
          ? data.bookings
          : Array.isArray(data.stalls)
            ? data.stalls
            : [];

      console.log("✅ TOTAL BOOKINGS FOUND:", list.length);

      const normalizedBookings = list.map((booking, index) =>
        normalizeBooking(booking, index),
      );

      console.log("✅ NORMALIZED BOOKINGS:", normalizedBookings);

      setBookings(normalizedBookings);
    } catch (fetchError) {
      console.error("❌ ADMIN STALL FETCH ERROR:", fetchError);

      setBookings([]);

      setError(fetchError.message || "Unable to load stall bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================================================
  // INITIAL LOAD
  // FIXES react-hooks/set-state-in-effect
  // ===================================================

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBookings();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadBookings]);

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = () => {
    setLoading(true);

    void loadBookings();
  };

  // ===================================================
  // FILTER BOOKINGS
  // ===================================================

  const filteredBookings = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        [
          booking.bookingId,
          booking.studioName,
          booking.ownerName,
          booking.phone,
          booking.email,
          booking.city,
          booking.expoCity,
          booking.packageName,
          booking.paymentId,
          booking.orderId,
        ].some((value) => safeText(value).includes(query));

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // ===================================================
  // STATS
  // ===================================================

  const stats = React.useMemo(() => {
    const total = bookings.length;

    const confirmed = bookings.filter(
      (booking) => booking.status === "CONFIRMED",
    ).length;

    const paid = bookings.filter(
      (booking) =>
        booking.paymentStatus === "PAID" || booking.status === "PAID",
    ).length;

    const pending = bookings.filter(
      (booking) => booking.paymentStatus !== "PAID",
    ).length;

    const cancelled = bookings.filter(
      (booking) => booking.status === "CANCELLED",
    ).length;

    const advanceCollected = bookings.reduce((totalAmount, booking) => {
      const isPaid =
        booking.paymentStatus === "PAID" || booking.status === "PAID";

      if (!isPaid) {
        return totalAmount;
      }

      return totalAmount + Number(booking.advanceAmount || 0);
    }, 0);

    return {
      total,
      confirmed,
      paid,
      pending,
      cancelled,
      advanceCollected,
    };
  }, [bookings]);

  // ===================================================
  // UPDATE STATUS
  // ===================================================

  const updateStatus = async (bookingId, nextStatus) => {
    try {
      console.log("🔄 UPDATING STATUS:", bookingId, nextStatus);

      const response = await fetch(
        `${API_URL}/api/stall-bookings/${bookingId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            bookingStatus: nextStatus.toLowerCase(),

            status: nextStatus,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      console.log("📦 STATUS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      setBookings((previous) =>
        previous.map((booking) => {
          if (String(booking.id) !== String(bookingId)) {
            return booking;
          }

          return {
            ...booking,

            status: nextStatus,

            paymentStatus:
              nextStatus === "PAID" ? "PAID" : booking.paymentStatus,
          };
        }),
      );

      setSelectedBooking((previous) => {
        if (!previous || String(previous.id) !== String(bookingId)) {
          return previous;
        }

        return {
          ...previous,

          status: nextStatus,

          paymentStatus:
            nextStatus === "PAID" ? "PAID" : previous.paymentStatus,
        };
      });
    } catch (updateError) {
      console.error("❌ STATUS UPDATE ERROR:", updateError);

      window.alert(updateError.message || "Unable to update booking status.");
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("adminToken");

    window.location.href = "/admin/login";
  };

  // ===================================================
  // DELETE BOOKING
  // ===================================================

  const deleteBooking = async (booking) => {
    const bookingId = booking?.id;

    if (!bookingId) {
      window.alert("Booking ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the stall booking for ${
        booking?.studioName || "this studio"
      }?\n\nThis will permanently remove it from MongoDB.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(String(bookingId));
      setError("");
      setSuccessMessage("");

      console.log("🗑️ DELETING STALL BOOKING:", bookingId);

      const response = await fetch(
        `${API_URL}/api/stall-bookings/${bookingId}`,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      console.log("🗑️ DELETE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `Delete failed with HTTP ${response.status}`,
        );
      }

      setBookings((previous) =>
        previous.filter((item) => String(item.id) !== String(bookingId)),
      );

      setSelectedBooking((previous) => {
        if (previous && String(previous.id) === String(bookingId)) {
          return null;
        }

        return previous;
      });

      setSuccessMessage(
        `${booking?.studioName || "Booking"} deleted successfully.`,
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3500);
    } catch (deleteError) {
      console.error("❌ DELETE STALL BOOKING ERROR:", deleteError);

      setError(deleteError.message || "Unable to delete stall booking.");

      window.alert(deleteError.message || "Unable to delete stall booking.");
    } finally {
      setDeletingId("");
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <>
      <AdminSidebar onLogout={handleLogout} stallCount={bookings.length} />

      <main
        className="
          min-h-screen
          bg-[#08080a]
          text-white
          lg:ml-72
          px-4
          sm:px-6
          lg:px-10
          pt-24
          lg:pt-10
          pb-24
        "
      >
        <div className="max-w-[1700px] mx-auto">
          {/* HEADER */}

          <section className="border-b border-white/10 pb-10">
            <div className="flex items-center gap-2 text-purple-400">
              <Store size={14} />

              <span className="text-[9px] font-mono tracking-[0.2em]">
                STALL MANAGEMENT
              </span>
            </div>

            <h1
              className="
                mt-5
                text-[clamp(3rem,6vw,6rem)]
                font-black
                uppercase
                tracking-[-0.065em]
                leading-[0.85]
              "
            >
              BOOK
              <br />
              <span className="text-purple-500">STALL.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm text-gray-500 leading-relaxed">
              Stall bookings saved in MongoDB will automatically appear here.
            </p>

            <div className="mt-4">
              <p className="text-[9px] font-mono text-gray-700">API</p>

              <p className="mt-1 text-[10px] font-mono text-purple-400 break-all">
                {API_URL || "VITE PROXY"}/api/stall-bookings
              </p>
            </div>
          </section>

          {/* STATS */}

          <section className="grid grid-cols-2 lg:grid-cols-6 gap-3 mt-8">
            <StatCard label="TOTAL" value={stats.total} />

            <StatCard label="CONFIRMED" value={stats.confirmed} />

            <StatCard label="PAID" value={stats.paid} />

            <StatCard label="PENDING" value={stats.pending} />

            <StatCard label="CANCELLED" value={stats.cancelled} />

            <StatCard
              label="ADVANCE"
              value={formatPrice(stats.advanceCollected)}
              highlight
            />
          </section>

          {/* SEARCH */}

          <section
            className="
              mt-8
              bg-[#0d0d11]
              border
              border-white/10
              rounded-2xl
              p-4
              flex
              flex-col
              md:flex-row
              gap-3
            "
          >
            <div className="relative flex-1">
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
                placeholder="SEARCH STUDIO, OWNER, PHONE, EMAIL OR CITY..."
                className="
                  w-full
                  bg-black/30
                  border
                  border-white/10
                  focus:border-purple-500
                  rounded-xl
                  pl-11
                  pr-4
                  py-4
                  outline-none
                  text-xs
                  placeholder:text-gray-700
                "
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="
                bg-black/30
                border
                border-white/10
                rounded-xl
                px-4
                py-4
                outline-none
                text-[9px]
                font-mono
              "
            >
              <option value="ALL">ALL STATUS</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              className="
                border
                border-purple-500/30
                bg-purple-500/10
                hover:bg-purple-500
                hover:text-white
                rounded-xl
                px-5
                py-4
                text-[9px]
                font-black
                tracking-widest
                transition
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              REFRESH
            </button>
          </section>

          {/* SUCCESS */}

          {successMessage && (
            <section
              className="
                mt-5
                border
                border-emerald-500/30
                bg-emerald-500/10
                rounded-2xl
                p-5
              "
            >
              <p className="text-xs font-black text-emerald-400">
                {successMessage}
              </p>
            </section>
          )}

          {/* ERROR */}

          {error && (
            <section
              className="
                mt-5
                border
                border-red-500/30
                bg-red-500/10
                rounded-2xl
                p-5
              "
            >
              <p className="text-xs font-black text-red-400">
                ERROR LOADING BOOKINGS
              </p>

              <p className="mt-2 text-xs text-red-300">{error}</p>

              <p className="mt-3 text-[10px] text-gray-500">
                Make sure your backend is running on {API_URL}
              </p>
            </section>
          )}

          {/* BOOKINGS */}

          <section className="mt-7">
            {loading ? (
              <div
                className="
                  min-h-[320px]
                  border
                  border-white/10
                  rounded-3xl
                  flex
                  flex-col
                  items-center
                  justify-center
                "
              >
                <RefreshCw
                  size={28}
                  className="
                    animate-spin
                    text-purple-500
                  "
                />

                <p className="mt-4 text-[9px] font-mono text-gray-600 tracking-widest">
                  LOADING STALL BOOKINGS...
                </p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div
                className="
                  min-h-[320px]
                  border
                  border-dashed
                  border-white/10
                  rounded-3xl
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  p-6
                "
              >
                <Store size={36} className="text-gray-700" />

                <h2 className="mt-5 text-xl font-black uppercase">
                  NO STALL BOOKINGS
                </h2>

                <p className="mt-2 text-xs text-gray-600">
                  API returned {bookings.length} booking(s) from
                  /api/stall-bookings.
                </p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="
                    mt-5
                    bg-purple-600
                    hover:bg-purple-500
                    px-5
                    py-3
                    rounded-xl
                    text-xs
                    font-black
                  "
                >
                  REFRESH AGAIN
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onOpen={() => setSelectedBooking(booking)}
                    onStatusChange={(status) => {
                      void updateStatus(booking.id, status);
                    }}
                    onDelete={() => {
                      void deleteBooking(booking);
                    }}
                    deleting={String(deletingId) === String(booking.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL */}

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={(status) => {
            void updateStatus(selectedBooking.id, status);
          }}
          onDelete={() => {
            void deleteBooking(selectedBooking);
          }}
          deleting={String(deletingId) === String(selectedBooking.id)}
        />
      )}
    </>
  );
}

// =====================================================
// BOOKING CARD
// =====================================================

function BookingCard({ booking, onOpen, onStatusChange, onDelete, deleting }) {
  const isPaid = booking.paymentStatus === "PAID" || booking.status === "PAID";

  return (
    <article
      className="
        bg-[#0d0d11]
        border
        border-white/10
        hover:border-purple-500/30
        rounded-[24px]
        p-5
        sm:p-6
        transition
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[8px] font-mono tracking-widest text-purple-400 break-all">
            {booking.bookingId}
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase truncate">
            {booking.studioName}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <User size={12} />

            <span>{booking.ownerName}</span>
          </div>
        </div>

        <span
          className={`
            shrink-0
            rounded-full
            border
            px-3
            py-2
            text-[7px]
            font-black
            tracking-widest
            ${
              isPaid
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-orange-500/20 bg-orange-500/10 text-orange-400"
            }
          `}
        >
          {isPaid ? "PAID" : booking.paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <SmallInfo label="CUSTOMER CITY" value={booking.city} />

        <SmallInfo label="EXPO CITY" value={booking.expoCity} />

        <SmallInfo label="PACKAGE" value={booking.packageName} />

        <SmallInfo
          label="TOTAL PRICE"
          value={formatPrice(booking.packagePrice)}
        />

        <SmallInfo
          label="ADVANCE"
          value={formatPrice(booking.advanceAmount)}
          highlight
        />

        <SmallInfo label="STATUS" value={booking.status} />
      </div>

      <div
        className="
          mt-5
          pt-5
          border-t
          border-white/10
          flex
          flex-col
          sm:flex-row
          gap-3
        "
      >
        <select
          value={booking.status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="
            flex-1
            bg-black/30
            border
            border-white/10
            rounded-xl
            px-4
            py-3
            outline-none
            text-[9px]
            font-mono
          "
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onOpen}
          className="
            bg-purple-600
            hover:bg-purple-500
            rounded-xl
            px-5
            py-3
            text-[9px]
            font-black
            tracking-widest
            transition
          "
        >
          VIEW DETAILS
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="
            bg-red-500/10
            hover:bg-red-500
            border
            border-red-500/30
            text-red-400
            hover:text-white
            rounded-xl
            px-5
            py-3
            text-[9px]
            font-black
            tracking-widest
            transition
            flex
            items-center
            justify-center
            gap-2
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {deleting ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              DELETING
            </>
          ) : (
            <>
              <Trash2 size={13} />
              DELETE
            </>
          )}
        </button>
      </div>
    </article>
  );
}

// =====================================================
// BOOKING MODAL
// =====================================================

function BookingModal({
  booking,
  onClose,
  onStatusChange,
  onDelete,
  deleting,
}) {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="
        fixed
        inset-0
        z-[9999]
        h-[100dvh]
        bg-black/85
        backdrop-blur-xl
        p-4
        flex
        items-center
        justify-center
        overflow-y-auto
      "
    >
      <div
        className="
          relative
          w-full
          max-w-[950px]
          max-h-[90vh]
          overflow-y-auto
          bg-[#0d0d11]
          border
          border-purple-500/20
          rounded-[30px]
          p-6
          sm:p-9
        "
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking details"
          className="
            absolute
            top-5
            right-5
            w-11
            h-11
            rounded-full
            border
            border-white/10
            bg-black/40
            hover:bg-white
            hover:text-black
            flex
            items-center
            justify-center
            transition
          "
        >
          <X size={17} />
        </button>

        <div className="pr-14">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles size={13} />

            <span className="text-[8px] font-mono tracking-widest">
              STALL BOOKING DETAILS
            </span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-5xl font-black uppercase">
            {booking.studioName}
          </h2>

          <p className="mt-2 text-[9px] font-mono text-gray-600 break-all">
            {booking.bookingId}
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-x-8
            gap-y-7
            mt-9
            pt-8
            border-t
            border-white/10
          "
        >
          <Detail label="OWNER NAME" value={booking.ownerName} />

          <Detail label="PHONE" value={booking.phone} />

          <Detail label="EMAIL" value={booking.email} />

          <Detail label="CUSTOMER CITY" value={booking.city} />

          <Detail label="EXPO CITY" value={booking.expoCity} highlight />

          <Detail
            label="DURATION"
            value={`${booking.duration} Day${
              booking.duration === "1" ? "" : "s"
            }`}
          />

          <Detail label="STALL PACKAGE" value={booking.packageName} />

          <Detail
            label="PACKAGE PRICE"
            value={formatPrice(booking.packagePrice)}
          />

          <Detail
            label="ADVANCE"
            value={formatPrice(booking.advanceAmount)}
            highlight
          />

          <Detail label="PAYMENT STATUS" value={booking.paymentStatus} />

          <Detail label="BOOKING STATUS" value={booking.status} />

          <Detail label="PAYMENT ID" value={booking.paymentId} />

          <Detail label="ORDER ID" value={booking.orderId} />

          <Detail label="INSTAGRAM" value={booking.instagram} />

          <Detail label="BOOKING DATE" value={formatDate(booking.createdAt)} />
        </div>

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-white/10
            bg-black/20
            p-5
          "
        >
          <p className="text-[8px] font-mono tracking-widest text-gray-600">
            MESSAGE
          </p>

          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            {booking.message}
          </p>
        </div>

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-purple-500/20
            bg-purple-500/[0.04]
            p-5
          "
        >
          <p className="text-[8px] font-mono tracking-widest text-purple-400">
            UPDATE STATUS
          </p>

          <select
            value={booking.status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="
              mt-3
              w-full
              bg-[#08080a]
              border
              border-purple-500/20
              rounded-xl
              px-4
              py-4
              outline-none
              text-sm
            "
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="
              flex-1
              border
              border-red-500/30
              bg-red-500/10
              hover:bg-red-500
              text-red-400
              hover:text-white
              rounded-xl
              px-5
              py-4
              text-[9px]
              font-black
              tracking-widest
              transition
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {deleting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                DELETING BOOKING
              </>
            ) : (
              <>
                <Trash2 size={14} />
                DELETE BOOKING
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              flex-1
              border
              border-white/10
              bg-white/[0.04]
              hover:bg-white
              hover:text-black
              rounded-xl
              px-5
              py-4
              text-[9px]
              font-black
              tracking-widest
              transition
            "
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// SMALL INFO
// =====================================================

function SmallInfo({ label, value, highlight = false }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-black/20
        p-4
      "
    >
      <p className="text-[7px] font-mono tracking-wider text-gray-700">
        {label}
      </p>

      <p
        className={`
          mt-2
          text-xs
          font-black
          uppercase
          break-words
          ${highlight ? "text-purple-400" : "text-gray-300"}
        `}
      >
        {value || "-"}
      </p>
    </div>
  );
}

// =====================================================
// DETAIL
// =====================================================

function Detail({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-[8px] font-mono tracking-wider text-gray-600">
        {label}
      </p>

      <p
        className={`
          mt-2
          text-sm
          break-words
          ${highlight ? "text-purple-400 font-black" : "text-gray-300"}
        `}
      >
        {value || "-"}
      </p>
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ label, value, highlight = false }) {
  return (
    <article
      className={`
        min-h-[125px]
        rounded-2xl
        border
        p-5
        flex
        flex-col
        justify-between
        ${
          highlight
            ? "border-purple-500/30 bg-purple-500/[0.05]"
            : "border-white/10 bg-[#0d0d11]"
        }
      `}
    >
      <p className="text-[7px] sm:text-[8px] font-mono tracking-[0.13em] text-gray-600">
        {label}
      </p>

      <p
        className={`
          text-2xl
          sm:text-3xl
          font-black
          ${highlight ? "text-purple-400" : "text-white"}
        `}
      >
        {value}
      </p>
    </article>
  );
}
