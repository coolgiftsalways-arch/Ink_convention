import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, KeyRound } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://api.inkconvention.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userEmail", email);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#08080a] text-white flex items-center justify-center p-4 select-none overflow-hidden m-0">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a855f7]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Centered Login Card */}
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

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          {/* Hidden decoys to trap browser autofill maps */}
          <input
            type="text"
            name="random_fake_user"
            style={{ display: "none" }}
          />
          <input
            type="password"
            name="random_fake_pass"
            style={{ display: "none" }}
          />

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <Mail size={12} className="text-[#a855f7]" /> Email Address
            </label>
            <input
              type="text"
              name="no_autofill_email_field"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
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
                name="no_autofill_password_field"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-24 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#a855f7] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                {showPassword ? "🙈 Hide" : "👁️ Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#a855f7] text-white font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Authorize Access"}
          </button>
        </form>
      </div>
    </div>
  );
}

