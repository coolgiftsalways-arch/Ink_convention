import { Link, useLocation } from "react-router-dom";

import {
  Lock,
  LayoutDashboard,
  Store,
  Users,
  Trophy,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

/* =========================================================
   API BASE

   LOCAL / TEST DOMAIN:
   /api goes through Vite proxy -> 127.0.0.1:5000

   PRODUCTION:
   VITE_API_URL or api.inkconvention.com
========================================================= */

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

/* =========================================================
   SAFE ARRAY HELPERS
========================================================= */

const getClientsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.clients)) return data.clients;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getBookingsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.stalls)) return data.stalls;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/* =========================================================
   NAV ITEM COMPONENT

   IMPORTANT:
   This component MUST stay outside AdminSidebar().
   React's static-components ESLint rule does not allow
   components to be created during another component render.
========================================================= */

function NavItem({ to, active, icon, title, subtitle, count, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`
        group
        flex
        items-center
        justify-between
        px-4
        py-4
        rounded-xl
        border
        transition-all
        duration-300
        ${
          active
            ? `
                bg-purple-500/10
                border-purple-500/30
                text-[#a855f7]
                shadow-[0_0_25px_rgba(168,85,247,0.08)]
              `
            : `
                border-transparent
                text-gray-400
                hover:text-white
                hover:bg-white/5
                hover:border-white/10
              `
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-9
            h-9
            rounded-lg
            flex
            items-center
            justify-center
            ${active ? "bg-purple-500/15" : "bg-white/[0.04]"}
          `}
        >
          {icon}
        </div>

        <div>
          <p
            className="
              font-mono
              text-[11px]
              font-black
              uppercase
              tracking-widest
            "
          >
            {title}
          </p>

          <p
            className="
              text-[7px]
              font-mono
              text-gray-600
              mt-1
              tracking-wider
            "
          >
            {subtitle}
          </p>
        </div>
      </div>

      <CountBadge count={count} active={active} />
    </Link>
  );
}

export default function AdminSidebar({
  onLogout,

  // Parent pages may pass these.
  tattooCount,
  clientCount,
  stallCount,
  artistCount,
  bookingCount,
}) {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fallback live counts.
  const [liveClientCount, setLiveClientCount] = useState(0);
  const [liveStallCount, setLiveStallCount] = useState(0);
  const [liveArtistCount, setLiveArtistCount] = useState(0);
  const [liveBookingCount, setLiveBookingCount] = useState(0);

  /* =========================================================
     ACTIVE ROUTES

     IMPORTANT:
     Each page is now completely separate.
  ========================================================= */

  const isDashboardActive = location.pathname === "/admin/dashboard";

  const isStallActive =
    location.pathname === "/admin/stalls" ||
    location.pathname.startsWith("/admin/stalls/");

  const isClientsActive =
    location.pathname === "/admin/clients" ||
    location.pathname.startsWith("/admin/clients/");

  const isArtistActive =
    location.pathname === "/admin/artists" ||
    location.pathname.startsWith("/admin/artists/");

  const isBookingActive =
    location.pathname === "/admin/artist-bookings" ||
    location.pathname.startsWith("/admin/artist-bookings/");

  /* =========================================================
     LOAD SIDEBAR COUNTS

     This prevents:
     CLIENT COUNT being used as STALL COUNT.
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      try {
        const results = await Promise.allSettled([
          fetch(`${API_URL}/api/stall-bookings`, {
            headers: { Accept: "application/json" },
            credentials: "include",
          }),

          fetch(`${API_URL}/api/clients`, {
            headers: { Accept: "application/json" },
            credentials: "include",
          }),

          fetch(`${API_URL}/api/admin/tattoo-studios/stats`, {
            headers: { Accept: "application/json" },
            credentials: "include",
          }),

          fetch(`${API_URL}/api/artist-bookings`, {
            headers: { Accept: "application/json" },
            credentials: "include",
          }),
        ]);

        if (cancelled) return;

        // STALL BOOKINGS
        if (results[0].status === "fulfilled" && results[0].value.ok) {
          const data = await results[0].value.json().catch(() => ({}));

          if (!cancelled) {
            setLiveStallCount(getBookingsArray(data).length);
          }
        }

        // CLIENTS
        if (results[1].status === "fulfilled" && results[1].value.ok) {
          const data = await results[1].value.json().catch(() => ({}));

          if (!cancelled) {
            setLiveClientCount(getClientsArray(data).length);
          }
        }

        // DIRECTORY ARTISTS
        if (results[2].status === "fulfilled" && results[2].value.ok) {
          const data = await results[2].value.json().catch(() => ({}));

          const total = Number(
            data?.stats?.total ?? data?.total ?? data?.count ?? 0,
          );

          if (!cancelled) {
            setLiveArtistCount(Number.isFinite(total) ? total : 0);
          }
        }

        // ARTIST BOOKINGS
        if (results[3].status === "fulfilled" && results[3].value.ok) {
          const data = await results[3].value.json().catch(() => ({}));

          const bookings = Array.isArray(data)
            ? data
            : Array.isArray(data?.bookings)
              ? data.bookings
              : Array.isArray(data?.data)
                ? data.data
                : [];

          if (!cancelled) {
            setLiveBookingCount(bookings.length);
          }
        }
      } catch (error) {
        console.error("Admin sidebar count error:", error);
      }
    };

    void loadCounts();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  /* =========================================================
     FINAL COUNTS
  ========================================================= */

  const finalTattooCount = tattooCount ?? 0;

  const finalClientCount = clientCount ?? liveClientCount;

  const finalStallCount = stallCount ?? liveStallCount;

  const finalArtistCount = artistCount ?? liveArtistCount;

  const finalBookingCount = bookingCount ?? liveBookingCount;

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setSidebarOpen((previous) => !previous)}
        className="
          fixed
          top-5
          left-4
          z-[60]
          lg:hidden
          p-3
          rounded-xl
          bg-[#0b0b0f]
          border
          border-white/10
          text-[#a855f7]
          shadow-2xl
        "
        aria-label="Toggle admin sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* =====================================================
          MOBILE BACKDROP
      ===================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="
            fixed
            inset-0
            z-40
            bg-black/70
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-72
          bg-[#0b0b0f]
          border-r
          border-white/10
          p-6
          flex
          flex-col
          overflow-y-auto
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0 pt-20"
              : "-translate-x-full pt-6 lg:pt-6"
          }
        `}
      >
        <div className="space-y-9">
          {/* ===============================================
              BRAND
          =============================================== */}

          <div className="space-y-3">
            <div
              className="
                inline-flex
                items-center
                gap-1.5
                px-2.5
                py-1
                rounded-full
                bg-red-500/10
                border
                border-red-500/20
                text-red-400
                text-[10px]
                font-mono
                uppercase
                tracking-widest
              "
            >
              <Lock size={10} />
              Private Control
            </div>

            <h2
              className="
                text-xl
                font-black
                tracking-tighter
                text-white
              "
            >
              ADMIN PANEL
              <span className="text-[#a855f7]">.</span>
            </h2>

            <p
              className="
                text-[9px]
                font-mono
                tracking-[0.16em]
                text-gray-600
              "
            >
              INK CONVENTION CONTROL
            </p>
          </div>

          {/* ===============================================
              NAVIGATION
          =============================================== */}

          <nav className="space-y-3">
            {/* 01 DASHBOARD */}

            <NavItem
              to="/admin/dashboard"
              active={isDashboardActive}
              icon={
                <LayoutDashboard
                  size={17}
                  className={
                    isDashboardActive
                      ? "text-[#a855f7]"
                      : "text-gray-500 group-hover:text-[#a855f7]"
                  }
                />
              }
              title="Dashboard"
              subtitle="OVERVIEW"
              count={finalTattooCount}
              onNavigate={closeMobileSidebar}
            />

            {/* 02 BOOK STALL */}

            <NavItem
              to="/admin/stalls"
              active={isStallActive}
              icon={
                <Store
                  size={17}
                  className={
                    isStallActive
                      ? "text-[#a855f7]"
                      : "text-gray-500 group-hover:text-[#a855f7]"
                  }
                />
              }
              title=" Stall Bookings"
              subtitle="STALL BOOKINGS"
              count={finalStallCount}
              onNavigate={closeMobileSidebar}
            />

            {/* 03 CLIENTS */}

            <NavItem
              to="/admin/clients"
              active={isClientsActive}
              icon={
                <Users
                  size={17}
                  className={
                    isClientsActive
                      ? "text-[#a855f7]"
                      : "text-gray-500 group-hover:text-[#a855f7]"
                  }
                />
              }
              title="COmptetition"
              subtitle="CLIENT REGISTRY"
              count={finalClientCount}
              onNavigate={closeMobileSidebar}
            />

            {/* 04 ARTIST ENTER */}

            <NavItem
              to="/admin/artists"
              active={isArtistActive}
              icon={
                <Trophy
                  size={17}
                  className={
                    isArtistActive
                      ? "text-[#a855f7]"
                      : "text-gray-500 group-hover:text-[#a855f7]"
                  }
                />
              }
              title="Artist"
              subtitle="DIRECTORY ARTISTS"
              count={finalArtistCount}
              onNavigate={closeMobileSidebar}
            />

            {/* 05 ARTIST BOOKINGS */}

            <NavItem
              to="/admin/artist-bookings"
              active={isBookingActive}
              icon={
                <CalendarDays
                  size={17}
                  className={
                    isBookingActive
                      ? "text-[#a855f7]"
                      : "text-gray-500 group-hover:text-[#a855f7]"
                  }
                />
              }
              title="Client Bookings"
              subtitle="BOOKING REQUESTS"
              count={finalBookingCount}
              onNavigate={closeMobileSidebar}
            />
          </nav>
        </div>

        {/* =================================================
            BOTTOM STATUS
        ================================================= */}

        <div className="space-y-4 mt-10">
          <div
            className="
              p-4
              rounded-2xl
              bg-black/40
              border
              border-white/5
              space-y-3
              font-mono
              text-[9px]
              text-gray-500
            "
          >
            <div className="flex items-center justify-between gap-3">
              <span>SYSTEM</span>

              <span className="flex items-center gap-1.5 text-emerald-400">
                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-emerald-400
                    animate-pulse
                  "
                />
                ONLINE
              </span>
            </div>

            <StatusRow label="STALL BOOKINGS" count={finalStallCount} />

            <StatusRow label="CLIENTS" count={finalClientCount} />

            <StatusRow label="ARTIST ENTER" count={finalArtistCount} />

            <StatusRow label="ARTIST BOOKINGS" count={finalBookingCount} />
          </div>

          {/* ===============================================
              LOGOUT
          =============================================== */}

          <button
            type="button"
            onClick={onLogout}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-3.5
              rounded-xl
              bg-red-500/10
              border
              border-red-500/20
              text-red-400
              font-mono
              text-xs
              uppercase
              tracking-widest
              hover:bg-red-500
              hover:text-white
              transition
              cursor-pointer
            "
          >
            <LogOut size={14} />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   COUNT BADGE
========================================================= */

function CountBadge({ count, active }) {
  return (
    <span
      className={`
        min-w-[26px]
        h-6
        px-1.5
        rounded-lg
        flex
        items-center
        justify-center
        text-[10px]
        font-mono
        font-bold
        ${
          active ? "bg-[#a855f7]/15 text-[#a855f7]" : "bg-white/5 text-gray-500"
        }
      `}
    >
      {Number(count || 0).toLocaleString("en-IN")}
    </span>
  );
}

/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({ label, count }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>

      <span className="text-[#a855f7]">
        {Number(count || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}
