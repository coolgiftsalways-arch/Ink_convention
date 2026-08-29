import React from "react";
import { Search, Store, X, User, Sparkles } from "lucide-react";

const STALL_STORAGE_KEY = "inkConventionStallBookings";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "CONFIRMED", "PAID", "CANCELLED"];

const PACKAGE_PRICES = {
  essential: 4999,
  pro: 7499,
  spotlight: 12499,
};

function safeText(value) {
  return String(value || "").toLowerCase();
}

function formatPrice(value) {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN");
}

function readLocalBookings() {
  try {
    const value = JSON.parse(localStorage.getItem(STALL_STORAGE_KEY) || "[]");

    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error("Unable to read stall bookings:", error);
    return [];
  }
}

function normalizeBooking(booking, index) {
  const packageId = safeText(
    booking.packageId || booking.package || booking.stallPackage || "essential",
  );

  const packagePrice =
    Number(booking.packagePrice || booking.totalAmount || booking.price) ||
    PACKAGE_PRICES[packageId] ||
    4999;

  return {
    id: booking._id || booking.id || booking.bookingId || `stall-${index + 1}`,
    bookingId:
      booking.bookingId ||
      booking._id ||
      booking.id ||
      `STALL-${String(index + 1).padStart(4, "0")}`,
    studioName:
      booking.studioName || booking.brandName || booking.studio || "-",
    ownerName: booking.ownerName || booking.owner || booking.name || "-",
    phone: booking.phone || booking.phoneNumber || "-",
    email: booking.email || booking.gmail || "-",
    city: booking.city || booking.userCity || "-",
    expoCity:
      booking.expoCity || booking.preferredExpoCity || booking.eventCity || "-",
    packageId,
    packageName:
      booking.packageName || String(packageId || "essential").toUpperCase(),
    packagePrice,
    advanceAmount:
      Number(booking.advanceAmount || booking.paidAmount || 1499) || 1499,
    paymentStatus: String(
      booking.paymentStatus || booking.payment?.status || "PENDING",
    ).toUpperCase(),
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
    status: String(
      booking.status || booking.bookingStatus || "NEW",
    ).toUpperCase(),
    createdAt:
      booking.createdAt || booking.bookingDate || new Date().toISOString(),
  };
}

export default function AdminStalls() {
  const [bookings, setBookings] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const loadBookings = React.useCallback(async () => {
    try {
      const response = await fetch("https://api.inkconvention.com/api/stalls");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.bookings)
          ? data.bookings
          : Array.isArray(data.stalls)
            ? data.stalls
            : [];

      setBookings(list.map((item, index) => normalizeBooking(item, index)));
    } catch (error) {
      console.warn(
        "Backend stall route unavailable. Using local storage.",
        error,
      );

      const localBookings = readLocalBookings();

      setBookings(
        localBookings.map((item, index) => normalizeBooking(item, index)),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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
        ].some((value) => safeText(value).includes(query));

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

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
      (booking) =>
        booking.paymentStatus !== "PAID" && booking.status !== "PAID",
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
      advanceCollected,
    };
  }, [bookings]);

  const updateStatus = (bookingId, nextStatus) => {
    setBookings((previous) =>
      previous.map((booking) =>
        String(booking.id) === String(bookingId)
          ? {
              ...booking,
              status: nextStatus,
            }
          : booking,
      ),
    );

    setSelectedBooking((previous) => {
      if (!previous || String(previous.id) !== String(bookingId)) {
        return previous;
      }

      return {
        ...previous,
        status: nextStatus,
      };
    });

    try {
      const localBookings = readLocalBookings();

      const updatedLocal = localBookings.map((booking) => {
        const id = booking._id || booking.id || booking.bookingId;

        if (String(id) !== String(bookingId)) {
          return booking;
        }

        return {
          ...booking,
          status: nextStatus,
        };
      });

      localStorage.setItem(STALL_STORAGE_KEY, JSON.stringify(updatedLocal));
    } catch (error) {
      console.error("Unable to save booking status:", error);
    }
  };

  return (
    <>
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
          <section className="border-b border-white/10 pb-10">
            <div className="flex items-center gap-2 text-purple-400">
              <Store size={14} />

              <span className="text-[9px] font-mono tracking-[0.2em]">
                STALL MANAGEMENT
              </span>
            </div>

            <h1 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase tracking-[-0.065em] leading-[0.85]">
              BOOK
              <br />
              <span className="text-purple-500">STALL.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm text-gray-500 leading-relaxed">
              Every stall booking will appear here with customer, package,
              payment and expo-city details.
            </p>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
            <StatCard label="TOTAL BOOKINGS" value={stats.total} />
            <StatCard label="CONFIRMED" value={stats.confirmed} />
            <StatCard label="PAID" value={stats.paid} />
            <StatCard label="PENDING" value={stats.pending} />
            <StatCard
              label="ADVANCE COLLECTED"
              value={formatPrice(stats.advanceCollected)}
              highlight
            />
          </section>

          <section className="mt-8 bg-[#0d0d11] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="SEARCH STUDIO, OWNER, PHONE, EMAIL OR CITY..."
                className="w-full bg-black/30 border border-white/10 focus:border-purple-500 rounded-xl pl-11 pr-4 py-4 outline-none text-xs placeholder:text-gray-700"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-4 py-4 outline-none text-[9px] font-mono"
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
              onClick={() => {
                setLoading(true);
                loadBookings();
              }}
              className="border border-white/10 hover:border-purple-500/40 rounded-xl px-5 py-4 text-[9px] font-black tracking-widest transition"
            >
              REFRESH
            </button>
          </section>

          <section className="mt-7">
            {loading ? (
              <div className="min-h-[320px] border border-white/10 rounded-3xl flex items-center justify-center">
                <p className="text-[9px] font-mono text-gray-600 tracking-widest">
                  LOADING STALL BOOKINGS...
                </p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="min-h-[320px] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-6">
                <Store size={36} className="text-gray-700" />

                <h2 className="mt-5 text-xl font-black uppercase">
                  NO STALL BOOKINGS
                </h2>

                <p className="mt-2 text-xs text-gray-600">
                  New user stall bookings will show here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onOpen={() => setSelectedBooking(booking)}
                    onStatusChange={(status) =>
                      updateStatus(booking.id, status)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={(status) => updateStatus(selectedBooking.id, status)}
        />
      )}
    </>
  );
}

function BookingCard({ booking, onOpen, onStatusChange }) {
  const isPaid = booking.paymentStatus === "PAID" || booking.status === "PAID";

  return (
    <article className="bg-[#0d0d11] border border-white/10 hover:border-purple-500/30 rounded-[24px] p-5 sm:p-6 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[8px] font-mono tracking-widest text-purple-400">
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
          {isPaid ? "PAID" : "PENDING"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
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
      </div>

      <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3">
        <select
          value={booking.status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none text-[9px] font-mono"
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
          className="bg-purple-600 hover:bg-purple-500 rounded-xl px-5 py-3 text-[9px] font-black tracking-widest transition"
        >
          VIEW DETAILS
        </button>
      </div>
    </article>
  );
}

function BookingModal({ booking, onClose, onStatusChange }) {
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xl p-4 flex items-center justify-center overflow-y-auto"
    >
      <div className="relative w-full max-w-[950px] max-h-[90vh] overflow-y-auto bg-[#0d0d11] border border-purple-500/20 rounded-[30px] p-6 sm:p-9">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking details"
          className="absolute top-5 right-5 w-11 h-11 rounded-full border border-white/10 bg-black/40 hover:bg-white hover:text-black flex items-center justify-center transition"
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

          <p className="mt-2 text-[9px] font-mono text-gray-600">
            {booking.bookingId}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7 mt-9 pt-8 border-t border-white/10">
          <Detail label="OWNER NAME" value={booking.ownerName} />
          <Detail label="PHONE" value={booking.phone} />
          <Detail label="EMAIL" value={booking.email} />
          <Detail label="CUSTOMER CITY" value={booking.city} />
          <Detail label="EXPO CITY" value={booking.expoCity} highlight />
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
          <Detail label="PAYMENT ID" value={booking.paymentId} />
          <Detail label="ORDER ID" value={booking.orderId} />
          <Detail label="INSTAGRAM" value={booking.instagram} />
          <Detail label="BOOKING DATE" value={formatDate(booking.createdAt)} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-[8px] font-mono tracking-widest text-gray-600">
            MESSAGE
          </p>

          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            {booking.message}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-5">
          <p className="text-[8px] font-mono tracking-widest text-purple-400">
            UPDATE STATUS
          </p>

          <select
            value={booking.status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="mt-3 w-full bg-[#08080a] border border-purple-500/20 rounded-xl px-4 py-4 outline-none text-sm"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function SmallInfo({ label, value, highlight = false }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
      <p className="text-[7px] font-mono tracking-wider text-gray-700">
        {label}
      </p>

      <p
        className={`
          mt-2
          text-xs
          font-black
          uppercase
          ${highlight ? "text-purple-400" : "text-gray-300"}
        `}
      >
        {value || "-"}
      </p>
    </div>
  );
}

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
