import { useState, useEffect } from "react";
import "../Style/AdminClients.css";

import {

  Trash2,

  Image,
  Video,
  Clock,

  X,

  FileSpreadsheet,
  
  Mail,
  KeyRound,
  Maximize2,
  Trophy,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";

import { Link } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";

function Dashboard() {
  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isLoggedIn") === "true"
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [submissions, setSubmissions] = useState([]);
  const [clientCount, setClientCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // =====================================================
  // API
  // =====================================================

  const API_URL = "https://api.inkconvention.com";

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gmail: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userEmail", loginEmail);

        setIsAuthenticated(true);
      } else {
        setLoginError(
          data.message || "Invalid email or password."
        );
      }
    } catch (err) {
      console.error("Login connection error:", err);

      setLoginError(
        "Network error: Could not connect to server."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userEmail");

    setIsAuthenticated(false);
  };

  // =====================================================
  // FETCH TATTOO SUBMISSIONS
  // =====================================================

  async function fetchUsers() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/users`
      );

      const data = await response.json();

      if (data.success) {
        setSubmissions(data.users || []);
      } else {
        console.error(
          "Failed to fetch users:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch admin users:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FETCH CLIENT COUNT
  // =====================================================

  async function fetchClientCount() {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/clients`
      );

      const data = await response.json();

      if (data.success) {
        setClientCount(
          data.clients?.length || 0
        );
      } else {
        console.error(
          "Failed to fetch clients:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch client count:",
        error
      );
    }
  }

  // =====================================================
  // INITIAL DATA LOAD
  // =====================================================

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchClientCount();
    }
  }, [isAuthenticated]);

  // =====================================================
  // DELETE TATTOO SUBMISSION
  // =====================================================

  const handleDelete = async (e, id) => {
    if (e) {
      e.stopPropagation();
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this tattoo entry?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmissions((prev) =>
          prev.filter((item) => item._id !== id)
        );

        if (
          selectedUser &&
          selectedUser._id === id
        ) {
          setSelectedUser(null);
        }
      } else {
        alert(
          data.message ||
            "Failed to delete user."
        );
      }
    } catch (error) {
      console.error(
        "Error deleting user:",
        error
      );

      alert(
        "Network error: Could not connect to server."
      );
    }
  };

  // =====================================================
  // EXPORT TATTOO ENTRIES TO CSV
  // =====================================================

  const handleExportToExcel = () => {
    if (submissions.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvContent =
      "Entry ID,First Name,Last Name,Professional Name,Category,Package,Gmail,Phone,City,State,Images Count,Videos Count,Timestamp\n";

    submissions.forEach((item) => {
      const row = [
        item.entryId || "",
        `"${item.firstName || ""}"`,
        `"${item.lastName || ""}"`,
        `"${item.professionalName || ""}"`,
        `"${item.category || ""}"`,
        `"${item.entryPackage || ""}"`,
        `"${item.gmail || ""}"`,
        `"${item.phone || ""}"`,
        `"${item.city || ""}"`,
        `"${item.state || ""}"`,
        item.images?.length || 0,
        item.videos?.length || 0,
        `"${item.createdAt || ""}"`,
      ];

      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.setAttribute("href", url);

    link.setAttribute(
      "download",
      `competition_entries_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4 select-none">

        {/* BACKGROUND GLOWS */}

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* LOGIN CARD */}

        <div className="relative z-10 w-full max-w-md bg-[#0b0b0f] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">

          {/* HEADER */}

          <div className="space-y-2 text-center">

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest mx-auto">
              <KeyRound size={10} />
              Restricted Access
            </div>

            <h1 className="text-3xl font-black tracking-tighter text-white">
              Dashboard Login
              <span className="text-[#a855f7]">
                .
              </span>
            </h1>

            <p className="text-gray-400 text-xs font-mono">
              Enter your credentials to access
              competition telemetry.
            </p>

          </div>

          {/* LOGIN FORM */}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            {/* EMAIL */}

            <div className="space-y-1.5">

              <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Mail
                  size={12}
                  className="text-[#a855f7]"
                />
                Email Address
              </label>

              <input
                type="email"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(e.target.value)
                }
                placeholder="admin@inkconvention.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#a855f7] transition"
              />

            </div>

            {/* PASSWORD */}

            <div className="space-y-1.5">

              <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <KeyRound
                  size={12}
                  className="text-[#a855f7]"
                />
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-20 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#a855f7] transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition cursor-pointer"
                >
                  {showPassword
                    ? "🙈 Hide"
                    : "👁️ Show"}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
                {loginError}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-[#a855f7] text-white font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
            >
              {loginLoading
                ? "Authenticating..."
                : "Authorize Access"}
            </button>

          </form>

        </div>
      </div>
    );
  }

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#08080a] text-white flex items-center justify-center font-mono text-sm">
        Loading competition telemetry nodes...
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none flex">

      {/* =================================================
          SHARED ADMIN SIDEBAR
      ================================================= */}

      <AdminSidebar
        onLogout={handleLogout}
        tattooCount={submissions.length}
        clientCount={clientCount}
      />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="flex-1 lg:pl-72 py-12 px-4 sm:px-8 lg:px-12">

        <div className="max-w-7xl mx-auto space-y-12">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">

            <div className="space-y-3">

              {/* BADGE */}

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">

                <Trophy size={14} />

                Ink Convention 2026 Registry

              </div>

              {/* TITLE */}

              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">

                Tattoo Submissions

                <span className="text-[#a855f7]">
                  .
                </span>

              </h1>

              {/* DESCRIPTION */}

              <p className="text-gray-400 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
                Review competition submissions,
                inspect purchased packages, and
                manage participant media files.
              </p>

            </div>

            {/* EXPORT */}

            <div>

              <button
                onClick={
                  handleExportToExcel
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/40 cursor-pointer"
              >
                <FileSpreadsheet
                  size={16}
                />

                Export to CSV
              </button>

            </div>

          </div>

          {/* =================================================
              METRICS
          ================================================= */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* TOTAL */}

            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">

              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Total Entries
              </p>

              <p className="text-3xl font-black text-white">
                {submissions.length}
              </p>

            </div>

            {/* MEDIA */}

            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">

              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Media Assets
              </p>

              <p className="text-3xl font-black text-[#a855f7]">

                {submissions.reduce(
                  (acc, curr) =>
                    acc +
                    (curr.images
                      ?.length || 0) +
                    (curr.videos
                      ?.length || 0),
                  0
                )}

                <span className="text-xl ml-1">
                  Files
                </span>

              </p>

            </div>

            {/* SECURITY */}

            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">

              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Security
              </p>

              <p className="text-3xl font-black text-red-400">
                SECURE
              </p>

            </div>

            {/* SERVER */}

            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">

              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Server Link
              </p>

              <p className="text-3xl font-black text-white">
                LIVE
              </p>

            </div>

          </div>

          {/* =================================================
              SUBMISSIONS
          ================================================= */}

          <div className="space-y-6">

            {/* SECTION TITLE */}

            <div className="flex items-center justify-between px-2 font-mono text-xs text-gray-500 uppercase tracking-widest">

              <span>
                Tattoo Submissions (
                {submissions.length}
                )
              </span>

              <span className="hidden sm:block">
                Click card to inspect package details
              </span>

            </div>

            {/* =================================================
                EMPTY
            ================================================= */}

            {submissions.length === 0 ? (

              <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-16 text-center space-y-4 shadow-2xl">

                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mx-auto">

                  <LayoutDashboard
                    size={32}
                  />

                </div>

                <h3 className="text-xl font-bold text-white">
                  No Entries Found
                </h3>

                <p className="text-gray-500 text-sm font-mono">
                  No tattoo registrations have
                  been submitted yet.
                </p>

                <Link
                  to="/upload"
                  className="inline-block px-6 py-2.5 rounded-xl bg-[#a855f7] text-white font-mono text-xs uppercase tracking-widest hover:opacity-90 transition"
                >
                  Go to Submission Form
                </Link>

              </div>

            ) : (

              /* =================================================
                 CARDS
              ================================================= */

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {submissions.map(
                  (item) => (

                    <div
                      key={item._id}
                      onClick={() =>
                        setSelectedUser(
                          item
                        )
                      }
                      className="group relative bg-[#0b0b0f] border border-white/10 hover:border-[#a855f7] transition-all duration-300 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between cursor-pointer overflow-hidden"
                    >

                      {/* GLOW */}

                      <div className="absolute -right-20 -top-20 w-36 h-36 bg-[#a855f7]/10 rounded-full blur-3xl group-hover:bg-[#a855f7]/25 transition-all duration-500 pointer-events-none" />

                      {/* HEADER */}

                      <div className="flex items-start justify-between gap-3 relative z-10">

                        <div className="space-y-1 min-w-0">

                          <div className="flex items-center gap-2">

                            <span className="text-[#a855f7] text-[10px] font-mono font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                              {item.entryId ||
                                "INK-ENTRY"}
                            </span>

                          </div>

                          <h3 className="text-xl font-black text-white group-hover:text-[#a855f7] transition duration-300 truncate">

                            {item.professionalName ||
                              `${item.firstName || ""} ${
                                item.lastName || ""
                              }`}

                          </h3>

                        </div>

                        {/* DELETE */}

                        <button
                          onClick={(e) =>
                            handleDelete(
                              e,
                              item._id
                            )
                          }
                          className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition duration-300 cursor-pointer flex-shrink-0"
                          title="Delete Entry"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                      {/* PACKAGE INFO */}

                      <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 rounded-2xl p-3 text-[11px] font-mono relative z-10">

                        <div className="truncate">

                          <span className="text-gray-500 uppercase text-[9px] block">
                            Category
                          </span>

                          <span className="text-gray-200 truncate font-bold">
                            {item.category ||
                              "N/A"}
                          </span>

                        </div>

                        <div className="truncate">

                          <span className="text-gray-500 uppercase text-[9px] block flex items-center gap-1">
                            <CreditCard
                              size={10}
                              className="text-[#a855f7]"
                            />

                            Package Taken
                          </span>

                          <span className="text-[#a855f7] font-black uppercase truncate text-xs">
                            {item.entryPackage ||
                              "N/A"}
                          </span>

                        </div>

                      </div>

                      {/* FOOTER */}

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-purple-400">

                        <span className="flex items-center gap-1">
                          <Maximize2
                            size={12}
                          />

                          View full details
                        </span>

                        <span className="text-gray-500">
                          {item.images
                            ?.length || 0}{" "}
                          imgs /{" "}
                          {item.videos
                            ?.length || 0}{" "}
                          vids
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </main>

      {/* =================================================
          FULL SCREEN DETAIL MODAL
      ================================================= */}

      {selectedUser && (

        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">

          <div className="relative w-full max-w-4xl bg-[#0b0b0f] border border-[#a855f7]/50 rounded-3xl p-6 sm:p-10 space-y-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] my-auto max-h-[85vh] flex flex-col">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-white/10 pb-6 pr-12 flex-shrink-0">

              <div className="space-y-2">

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">

                  {selectedUser.entryId ||
                    "INK CONVENTION ENTRY"}

                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white">

                  {selectedUser.professionalName ||
                    `${selectedUser.firstName || ""} ${
                      selectedUser.lastName || ""
                    }`}

                </h2>

                <p className="text-xs font-mono text-gray-500 flex items-center gap-1">

                  <Clock size={12} />

                  Submitted on:

                  {" "}

                  {selectedUser.createdAt
                    ? new Date(
                        selectedUser.createdAt
                      ).toLocaleString()
                    : "Unknown"}

                </p>

              </div>

              {/* CLOSE */}

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="absolute top-6 right-6 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>

            </div>

            {/* SCROLLABLE CONTENT */}

            <div className="space-y-8 overflow-y-auto pr-2">

              {/* PACKAGE BANNER */}

              <div className="bg-gradient-to-r from-[#140a24] to-[#0b0b0f] border border-[#a855f7]/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">

                <div className="space-y-1">

                  <span className="text-xs text-gray-400 uppercase tracking-widest block flex items-center gap-1.5">

                    <CreditCard
                      size={14}
                      className="text-[#a855f7]"
                    />

                    Package Purchased
                  </span>

                  <span className="text-2xl font-black text-[#a855f7] uppercase">
                    {selectedUser.entryPackage ||
                      "Standard Entry"}
                  </span>

                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl text-xs text-purple-300">

                  Category:{" "}

                  <strong className="text-white">
                    {selectedUser.category ||
                      "N/A"}
                  </strong>

                </div>

              </div>

              {/* GENERAL DETAILS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-sm">

                {/* NAME */}

                <div className="space-y-1">

                  <span className="text-gray-500 text-xs uppercase tracking-wider block">
                    Full Name
                  </span>

                  <span className="text-gray-200">
                    {selectedUser.firstName ||
                      ""}{" "}
                    {selectedUser.lastName ||
                      ""}
                  </span>

                </div>

                {/* EMAIL */}

                <div className="space-y-1">

                  <span className="text-gray-500 text-xs uppercase tracking-wider block">
                    Email Address
                  </span>

                  <span className="text-gray-200 break-all">
                    {selectedUser.gmail ||
                      "N/A"}
                  </span>

                </div>

                {/* PHONE */}

                <div className="space-y-1">

                  <span className="text-gray-500 text-xs uppercase tracking-wider block">
                    Phone Number
                  </span>

                  <span className="text-gray-200">
                    {selectedUser.phone ||
                      "N/A"}
                  </span>

                </div>

                {/* LOCATION */}

                <div className="space-y-1">

                  <span className="text-gray-500 text-xs uppercase tracking-wider block">
                    Location
                  </span>

                  <span className="text-gray-200">
                    {selectedUser.city ||
                      "N/A"}

                    {selectedUser.state
                      ? `, ${selectedUser.state}`
                      : ""}

                    {" "}

                    (
                    {selectedUser.country ||
                      "India"}
                    )
                  </span>

                </div>

                {/* INSTAGRAM */}

                {selectedUser.instagram && (

                  <div className="space-y-1">

                    <span className="text-gray-500 text-xs uppercase tracking-wider block">
                      Instagram
                    </span>

                    <span className="text-gray-200">
                      {selectedUser.instagram}
                    </span>

                  </div>

                )}

                {/* STUDIO */}

                {selectedUser.studio && (

                  <div className="space-y-1">

                    <span className="text-gray-500 text-xs uppercase tracking-wider block">
                      Studio
                    </span>

                    <span className="text-gray-200">
                      {selectedUser.studio}
                    </span>

                  </div>

                )}

                {/* TATTOO TITLE */}

                {selectedUser.tattooTitle && (

                  <div className="space-y-1 sm:col-span-2">

                    <span className="text-gray-500 text-xs uppercase tracking-wider block">
                      Tattoo Title
                    </span>

                    <span className="text-white font-bold">
                      {selectedUser.tattooTitle}
                    </span>

                  </div>

                )}

                {/* DESCRIPTION */}

                {selectedUser.description && (

                  <div className="space-y-1 sm:col-span-2">

                    <span className="text-gray-500 text-xs uppercase tracking-wider block">
                      Tattoo Description /
                      Concept
                    </span>

                    <span className="text-gray-300 text-xs leading-relaxed block bg-white/5 p-3 rounded-xl border border-white/5">
                      {selectedUser.description}
                    </span>

                  </div>

                )}

              </div>

              {/* =================================================
                  MEDIA
              ================================================= */}

              <div className="space-y-6 pt-2">

                {/* IMAGES */}

                <div className="space-y-3">

                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#a855f7] flex items-center gap-2">

                    <Image size={16} />

                    Uploaded Images (
                    {selectedUser.images
                      ?.length || 0}
                    )

                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

                    {selectedUser.images &&
                    selectedUser.images.length >
                      0 ? (

                      selectedUser.images.map(
                        (
                          imgPath,
                          imgIdx
                        ) => {

                          const imageUrl = `${API_URL}/${imgPath.replace(
                            /\\/g,
                            "/"
                          )}`;

                          return (
                            <a
                              key={imgIdx}
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-32 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 block group relative"
                            >

                              <img
                                src={imageUrl}
                                alt="Tattoo Entry"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />

                            </a>
                          );
                        }
                      )

                    ) : (

                      <p className="text-xs text-gray-500 font-mono">
                        No images uploaded.
                      </p>

                    )}

                  </div>

                </div>

                {/* VIDEOS */}

                <div className="space-y-3 pt-2">

                  <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 flex items-center gap-2">

                    <Video size={16} />

                    Uploaded Videos (
                    {selectedUser.videos
                      ?.length || 0}
                    )

                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {selectedUser.videos &&
                    selectedUser.videos.length >
                      0 ? (

                      selectedUser.videos.map(
                        (
                          vidPath,
                          vidIdx
                        ) => (

                          <video
                            key={vidIdx}
                            src={`${API_URL}/${vidPath.replace(
                              /\\/g,
                              "/"
                            )}`}
                            controls
                            className="w-full h-48 rounded-2xl bg-black object-cover border border-white/10"
                          />

                        )
                      )

                    ) : (

                      <p className="text-xs text-gray-500 font-mono">
                        No process videos uploaded
                        for this entry.
                      </p>

                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">

              <button
                onClick={(e) =>
                  handleDelete(
                    e,
                    selectedUser._id
                  )
                }
                className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-mono text-xs uppercase tracking-widest transition cursor-pointer"
              >
                Delete Entry
              </button>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-widest transition cursor-pointer"
              >
                Close View
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;
