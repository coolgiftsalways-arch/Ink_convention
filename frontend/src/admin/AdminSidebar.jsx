import { Link, useLocation } from "react-router-dom";
import {
  Lock,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar({ onLogout, tattooCount = 0, clientCount = 0 }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isTattooActive = location.pathname === "/admin/dashboard";
  const isClientActive = location.pathname === "/admin/clients";

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* ================= MOBILE MENU BUTTON ================= */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-5 left-4 z-[60] lg:hidden p-3 rounded-xl bg-[#0b0b0f] border border-white/10 text-[#a855f7] shadow-2xl"
        aria-label="Toggle admin sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ================= MOBILE BACKDROP ================= */}
      {sidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72
          bg-[#0b0b0f]
          border-r border-white/10
          p-6
          flex flex-col justify-between
          transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0 pt-20"
              : "-translate-x-full pt-6 lg:pt-6"
          }
        `}
      >
        {/* ================= TOP ================= */}
        <div className="space-y-8">

          {/* BRAND */}
          <div className="space-y-3">
            <div
              className="
                inline-flex items-center gap-1.5
                px-2.5 py-1
                rounded-full
                bg-red-500/10
                border border-red-500/20
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

            <h2 className="text-xl font-black tracking-tighter text-white">
              ADMIN PANEL
              <span className="text-[#a855f7]">.</span>
            </h2>
          </div>

          {/* ================= NAVIGATION ================= */}
          <nav className="space-y-7">

            {/* TATTOO SECTION */}
            <div>
              <p className="px-3 mb-3 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600">
                Tattoo
              </p>

              <Link
                to="/admin/dashboard"
                onClick={closeMobileSidebar}
                className={`
                  group
                  flex items-center justify-between
                  px-4 py-3.5
                  rounded-xl
                  border
                  transition-all duration-300
                  ${
                    isTattooActive
                      ? "bg-purple-500/10 border-purple-500/20 text-[#a855f7]"
                      : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard
                    size={17}
                    className={
                      isTattooActive
                        ? "text-[#a855f7]"
                        : "text-gray-500 group-hover:text-[#a855f7]"
                    }
                  />

                  <span className="font-mono text-xs uppercase tracking-widest">
                    Submissions
                  </span>
                </div>

                <span
                  className={`
                    min-w-[24px]
                    h-6
                    px-1.5
                    rounded-lg
                    flex items-center justify-center
                    text-[10px]
                    font-mono
                    font-bold
                    ${
                      isTattooActive
                        ? "bg-[#a855f7]/15 text-[#a855f7]"
                        : "bg-white/5 text-gray-500"
                    }
                  `}
                >
                  {tattooCount}
                </span>
              </Link>
            </div>

            {/* CLIENT SECTION */}
            <div>
              <p className="px-3 mb-3 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600">
                Clients
              </p>

              <Link
                to="/admin/clients"
                onClick={closeMobileSidebar}
                className={`
                  group
                  flex items-center justify-between
                  px-4 py-3.5
                  rounded-xl
                  border
                  transition-all duration-300
                  ${
                    isClientActive
                      ? "bg-purple-500/10 border-purple-500/20 text-[#a855f7]"
                      : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Users
                    size={17}
                    className={
                      isClientActive
                        ? "text-[#a855f7]"
                        : "text-gray-500 group-hover:text-[#a855f7]"
                    }
                  />

                  <span className="font-mono text-xs uppercase tracking-widest">
                    Clients
                  </span>
                </div>

                <span
                  className={`
                    min-w-[24px]
                    h-6
                    px-1.5
                    rounded-lg
                    flex items-center justify-center
                    text-[10px]
                    font-mono
                    font-bold
                    ${
                      isClientActive
                        ? "bg-[#a855f7]/15 text-[#a855f7]"
                        : "bg-white/5 text-gray-500"
                    }
                  `}
                >
                  {clientCount}
                </span>
              </Link>
            </div>
          </nav>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="space-y-4">

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="
              w-full
              flex items-center justify-center gap-2
              px-4 py-3
              rounded-xl
              bg-red-500/10
              border border-red-500/20
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

          {/* SYSTEM STATUS */}
          <div
            className="
              p-4
              rounded-2xl
              bg-black/40
              border border-white/5
              space-y-3
              font-mono
              text-[10px]
              text-gray-400
            "
          >
            <div className="flex items-center justify-between">
              <span>SYSTEM STATUS:</span>

              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>TATTOO ENTRIES:</span>

              <span className="text-[#a855f7]">
                {tattooCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>CLIENTS:</span>

              <span className="text-[#a855f7]">
                {clientCount}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}