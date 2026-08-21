import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Trash2,
  AtSign,
  Image,
  Video,
  Clock,
  Menu,
  X,
  Lock,
  FileSpreadsheet,
  LogOut,
  Mail,
  KeyRound,
  Home,
  MapPin,
  Compass,
  Maximize2,
} from "lucide-react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isLoggedIn") === "true",
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("https://api.inkconvention.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userEmail", loginEmail);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login connection error:", err);
      setLoginError("Network error: Could not connect to server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userEmail");
    setIsAuthenticated(false);
  };

  async function fetchUsers() {
    try {
      const response = await fetch(
        "https://api.inkconvention.com/api/admin/users",
      );
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this user record?"))
      return;

    try {
      const response = await fetch(
        `https://api.inkconvention.com/api/admin/users/${id}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();

      if (response.ok) {
        setSubmissions(submissions.filter((item) => item._id !== id));
        if (selectedUser && selectedUser._id === id) {
          setSelectedUser(null);
        }
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Network error: Could not connect to server.");
    }
  };

  const handleExportToExcel = () => {
    if (submissions.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvContent =
      "ID,First Name,Last Name,Username,Phone Number,Gmail,Address 1,Address 2,City,State,Images Count,Videos Count,Timestamp\n";

    submissions.forEach((item) => {
      const row = [
        item._id,
        `"${item.firstName || ""}"`,
        `"${item.lastName || ""}"`,
        `"${item.username || ""}"`,
        `"${item.delayNumber || ""}"`,
        `"${item.gmail || ""}"`,
        `"${item.address1 || ""}"`,
        `"${item.address2 || ""}"`,
        `"${item.city || ""}"`,
        `"${item.state || ""}"`,
        item.images?.length || 0,
        item.videos?.length || 0,
        `"${item.createdAt || ""}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `client_registry_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4 select-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-[#0b0b0f] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest mx-auto">
              <Lock size={10} /> Restricted Access
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Dashboard Login<span className="text-[#a855f7]">.</span>
            </h1>
            <p className="text-gray-400 text-xs font-mono">
              Enter your credentials to access live telemetry.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Mail size={12} className="text-[#a855f7]" /> Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@inkconvention.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#a855f7] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <KeyRound size={12} className="text-[#a855f7]" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-20 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#a855f7] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  {showPassword ? "🙈 Hide" : "👁️ Show"}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-[#a855f7] text-white font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? "Authenticating..." : "Authorize Access"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#08080a] text-white flex items-center justify-center font-mono text-sm">
        Loading live telemetry nodes...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none flex">
      {/* MOBILE SIDEBAR TOGGLE */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-4 z-50 lg:hidden p-3 rounded-xl bg-[#0b0b0f] border border-white/10 text-[#a855f7] shadow-2xl cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0b0b0f] border-r border-white/10 p-6 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 pt-20" : "-translate-x-full pt-6 lg:pt-6"
        }`}
      >
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest">
              <Lock size={10} /> Private Access Only
            </div>
            <h2 className="text-xl font-black tracking-tighter text-white">
              ADMIN CONTROL<span className="text-[#a855f7]">.</span>
            </h2>
          </div>

          <nav className="space-y-2 font-mono text-xs uppercase tracking-widest">
            <a
              href="#dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#a855f7] font-bold"
            >
              <LayoutDashboard size={16} /> Dashboard
            </a>
          </nav>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition cursor-pointer"
          >
            <LogOut size={14} /> Logout Session
          </button>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 font-mono text-[10px] text-gray-400">
            <div className="flex items-center justify-between">
              <span>CLIENT SECURITY:</span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span>TOTAL RECORDS:</span>
              <span className="text-[#a855f7]">{submissions.length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:pl-72 py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
                <LayoutDashboard size={14} /> Client & Admin Registry
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">
                Secure Dashboard.
              </h1>
              <p className="text-gray-400 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
                Live database management view. Click on any user card to inspect
                full details and media assets.
              </p>
            </div>

            <div>
              <button
                onClick={handleExportToExcel}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/40 cursor-pointer"
              >
                <FileSpreadsheet size={16} /> Convert to Excel (CSV)
              </button>
            </div>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">
              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Total Profiles
              </p>
              <p className="text-3xl font-black text-white">
                {submissions.length}
              </p>
            </div>
            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">
              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Media Nodes
              </p>
              <p className="text-3xl font-black text-[#a855f7]">
                {submissions.reduce(
                  (acc, curr) =>
                    acc +
                    (curr.images?.length || 0) +
                    (curr.videos?.length || 0),
                  0,
                )}{" "}
                Files
              </p>
            </div>
            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">
              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                Visibility
              </p>
              <p className="text-3xl font-black text-red-400">PRIVATE</p>
            </div>
            <div className="bg-[#0b0b0f] border border-white/10 rounded-2xl p-6 space-y-1">
              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                System Sync
              </p>
              <p className="text-3xl font-black text-white">100% LIVE</p>
            </div>
          </div>

          {/* CARDS GRID */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2 font-mono text-xs text-gray-500 uppercase tracking-widest">
              <span>Client Records ({submissions.length})</span>
              <span>Click card to view details</span>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-16 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mx-auto">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  No Client Records Found
                </h3>
                <Link
                  to="/Upload"
                  className="inline-block px-6 py-2.5 rounded-xl bg-[#a855f7] text-white font-mono text-xs uppercase tracking-widest hover:opacity-90 transition"
                >
                  Go to Upload Form
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {submissions.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedUser(item)}
                    className="group relative bg-[#0b0b0f] border border-white/10 hover:border-[#a855f7] transition-all duration-300 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between cursor-pointer overflow-hidden"
                  >
                    <div className="absolute -right-20 -top-20 w-36 h-36 bg-[#a855f7]/10 rounded-full blur-3xl group-hover:bg-[#a855f7]/25 transition-all duration-500 pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[#a855f7] text-[10px] font-mono font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AtSign size={10} /> {item.username}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-[#a855f7] transition duration-300 truncate">
                          {item.firstName} {item.lastName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDelete(e, item._id)}
                          className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition duration-300 cursor-pointer flex-shrink-0"
                          title="Delete Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Brief Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 rounded-2xl p-3 text-[11px] font-mono relative z-10">
                      <div className="truncate">
                        <span className="text-gray-500 uppercase text-[9px] block">
                          Gmail
                        </span>
                        <span className="text-gray-200 truncate">
                          {item.gmail}
                        </span>
                      </div>
                      <div className="truncate">
                        <span className="text-gray-500 uppercase text-[9px] block">
                          City
                        </span>
                        <span className="text-gray-200 truncate">
                          {item.city}
                        </span>
                      </div>
                    </div>

                    {/* Footer cue */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-purple-400">
                      <span className="flex items-center gap-1">
                        <Maximize2 size={12} /> Click to expand details
                      </span>
                      <span className="text-gray-500">
                        {item.images?.length || 0} imgs /{" "}
                        {item.videos?.length || 0} vids
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================== */}
      {/* EXPANDED FULL-SCREEN USER DETAIL MODAL     */}
      {/* ========================================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0b0b0f] border border-[#a855f7]/50 rounded-3xl p-6 sm:p-10 space-y-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] my-auto max-h-[85vh] flex flex-col">
            {/* Modal Header (Sticky on scroll) */}
            <div className="flex items-start justify-between border-b border-white/10 pb-6 pr-12 flex-shrink-0">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
                  <AtSign size={12} /> {selectedUser.username}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-xs font-mono text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> Registered on:{" "}
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 right-6 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar">
              {/* Detailed Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-sm">
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="text-gray-200">{selectedUser.gmail}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wider block">
                    Phone / WhatsApp Number
                  </span>
                  <span className="text-gray-200">
                    {selectedUser.delayNumber}
                  </span>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-gray-500 text-xs uppercase tracking-wider block flex items-center gap-1">
                    <Home size={14} className="text-[#a855f7]" /> Address
                    Information
                  </span>
                  <span className="text-gray-200 block">
                    {selectedUser.address1}
                  </span>
                  {selectedUser.address2 && (
                    <span className="text-gray-400 block text-xs">
                      {selectedUser.address2}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wider block flex items-center gap-1">
                    <MapPin size={14} className="text-[#a855f7]" /> City
                  </span>
                  <span className="text-gray-200">{selectedUser.city}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs uppercase tracking-wider block flex items-center gap-1">
                    <Compass size={14} className="text-[#a855f7]" /> State
                  </span>
                  <span className="text-gray-200">{selectedUser.state}</span>
                </div>
              </div>

              {/* Expanded Media Assets Section */}
              <div className="space-y-6 pt-2">
                {/* Images Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#a855f7] flex items-center gap-2">
                    <Image size={16} /> Uploaded Images (
                    {selectedUser.images?.length || 0})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {selectedUser.images && selectedUser.images.length > 0 ? (
                      selectedUser.images.map((imgPath, imgIdx) => (
                        <a
                          key={imgIdx}
                          href={`https://api.inkconvention.com/${imgPath.replace(/\\/g, "/")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-32 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 block group relative"
                        >
                          <img
                            src={`https://api.inkconvention.com/${imgPath.replace(/\\/g, "/")}`}
                            alt="Expanded View"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 font-mono">
                        No images uploaded.
                      </p>
                    )}
                  </div>
                </div>

                {/* Videos Section */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 flex items-center gap-2">
                    <Video size={16} /> Uploaded Videos (
                    {selectedUser.videos?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedUser.videos && selectedUser.videos.length > 0 ? (
                      selectedUser.videos.map((vidPath, vidIdx) => (
                        <video
                          key={vidIdx}
                          src={`https://api.inkconvention.com/${vidPath.replace(/\\/g, "/")}`}
                          controls
                          className="w-full h-48 rounded-2xl bg-black object-cover border border-white/10"
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 font-mono">
                        No videos uploaded for this entry.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls (Sticky on bottom) */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
              <button
                onClick={(e) => handleDelete(e, selectedUser._id)}
                className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-mono text-xs uppercase tracking-widest transition cursor-pointer"
              >
                Delete User Record
              </button>
              <button
                onClick={() => setSelectedUser(null)}
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
