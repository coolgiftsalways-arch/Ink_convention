import { Link, useLocation } from "react-router-dom";
import {
  Lock,
  Store,
  Trophy,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar({
  onLogout,

  // OLD COUNTS - keeps your existing dashboard working
  tattooCount = 0,
  clientCount = 0,

  // NEW COUNTS
  stallCount,
  competitionCount,
  artistCount = 0,
}) {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================================================
     COUNTS

     Existing:
     clientCount -> Book Stall
     tattooCount -> Competition

     Later you can directly pass:
     stallCount
     competitionCount
     artistCount
  ========================================================= */

  const finalStallCount = stallCount ?? clientCount;

  const finalCompetitionCount =
    competitionCount ?? tattooCount;

  /* =========================================================
     ACTIVE ROUTES
  ========================================================= */

  const isStallActive =
    location.pathname === "/admin/clients" ||
    location.pathname.startsWith("/admin/stalls");

  const isCompetitionActive =
    location.pathname === "/admin/dashboard" ||
    location.pathname.startsWith("/admin/competition");

  const isArtistActive =
    location.pathname === "/admin/artists" ||
    location.pathname.startsWith("/admin/artists/");

  /* =========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================= */

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
        {sidebarOpen ? (
          <X size={20} />
        ) : (
          <Menu size={20} />
        )}
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
          justify-between

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
        {/* =================================================
            TOP
        ================================================= */}

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
              <span className="text-[#a855f7]">
                .
              </span>
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
            {/* =============================================
                01 BOOK STALL
            ============================================= */}

            <Link
              to="/admin/clients"
              onClick={closeMobileSidebar}
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
                  isStallActive
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

                    ${
                      isStallActive
                        ? "bg-purple-500/15"
                        : "bg-white/[0.04]"
                    }
                  `}
                >
                  <Store
                    size={17}
                    className={
                      isStallActive
                        ? "text-[#a855f7]"
                        : "text-gray-500 group-hover:text-[#a855f7]"
                    }
                  />
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
                    Book Stall
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
                    STALL BOOKINGS
                  </p>
                </div>
              </div>

              <CountBadge
                count={finalStallCount}
                active={isStallActive}
              />
            </Link>

            {/* =============================================
                02 COMPETITION
            ============================================= */}

            <Link
              to="/admin/dashboard"
              onClick={closeMobileSidebar}
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
                  isCompetitionActive
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

                    ${
                      isCompetitionActive
                        ? "bg-purple-500/15"
                        : "bg-white/[0.04]"
                    }
                  `}
                >
                  <Trophy
                    size={17}
                    className={
                      isCompetitionActive
                        ? "text-[#a855f7]"
                        : "text-gray-500 group-hover:text-[#a855f7]"
                    }
                  />
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
                    Competition
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
                    ARTIST ENTRIES
                  </p>
                </div>
              </div>

              <CountBadge
                count={finalCompetitionCount}
                active={isCompetitionActive}
              />
            </Link>

            {/* =============================================
                03 ARTIST ENTER
            ============================================= */}

            <Link
              to="/admin/artists"
              onClick={closeMobileSidebar}
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
                  isArtistActive
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

                    ${
                      isArtistActive
                        ? "bg-purple-500/15"
                        : "bg-white/[0.04]"
                    }
                  `}
                >
                  <Users
                    size={17}
                    className={
                      isArtistActive
                        ? "text-[#a855f7]"
                        : "text-gray-500 group-hover:text-[#a855f7]"
                    }
                  />
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
                    Artist Enter
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
                    DIRECTORY ARTISTS
                  </p>
                </div>
              </div>

              <CountBadge
                count={artistCount}
                active={isArtistActive}
              />
            </Link>
          </nav>
        </div>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="space-y-4">
          {/* ===============================================
              STATUS
          =============================================== */}

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

            <StatusRow
              label="STALL BOOKINGS"
              count={finalStallCount}
            />

            <StatusRow
              label="COMPETITION"
              count={finalCompetitionCount}
            />

            <StatusRow
              label="ARTIST ENTER"
              count={artistCount}
            />
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
          active
            ? "bg-[#a855f7]/15 text-[#a855f7]"
            : "bg-white/5 text-gray-500"
        }
      `}
    >
      {count}
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
        {count}
      </span>
    </div>
  );
}