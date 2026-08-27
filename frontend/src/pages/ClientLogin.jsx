import axios from "axios";
import { useState } from "react";

import {
  User,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function ClientLogin() {
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    phone: "",
    state: "",
    city: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (submitted) {
      setSubmitted(false);
    }
  };

  // =====================================================
  // HANDLE PHONE
  // =====================================================

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData({
      ...formData,
      phone: value,
    });

    if (submitted) {
      setSubmitted(false);
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Sending client data:", formData);

    try {
      const response = await axios({
        method: "POST",
        url: "http://localhost:5000/api/clients",
        data: formData,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log("✅ Client registered successfully:", response.data);

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("❌ FULL ERROR:", error);
      console.error("❌ ERROR MESSAGE:", error.message);
      console.error("❌ ERROR RESPONSE:", error.response);
      console.error("❌ ERROR REQUEST:", error.request);

      alert(
        error.response?.data?.message ||
          "Unable to connect to the server. Please try again.",
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080a] text-white overflow-hidden">
      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main Purple Glow */}
        <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#a855f7]/10 blur-[150px]" />

        {/* Left Glow */}
        <div className="absolute top-[35%] -left-72 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[140px]" />

        {/* Right Glow */}
        <div className="absolute bottom-0 -right-72 w-[500px] h-[500px] rounded-full bg-[#a855f7]/10 blur-[140px]" />

        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#08080a_85%)]" />
      </div>

      {/* =====================================================
          MAIN PAGE
      ===================================================== */}

      <main className="relative z-10 min-h-screen pt-32 pb-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* =================================================
              TOP META
          ================================================= */}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-16">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#a855f7] shadow-[0_0_12px_#a855f7]" />

              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gray-400">
                Ink Convention 2026
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <ShieldCheck size={13} className="text-emerald-400" />

              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400">
                Secure Registration
              </span>
            </div>
          </div>

          {/* =================================================
              HERO + FORM
          ================================================= */}

          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-14 lg:gap-24 items-center">
            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <section>
              <div className="flex items-center gap-3 mb-7">
                <span className="w-12 h-px bg-[#a855f7]" />

                <span className="font-mono text-[#a855f7] text-[10px] sm:text-xs uppercase tracking-[0.35em]">
                  Client Access
                </span>
              </div>

              <h1 className="text-[clamp(3rem,7vw,6.5rem)] font-black uppercase leading-[0.88] tracking-[-0.055em]">
                JOIN
                <br />
                THE
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#a855f7]">
                  EXPERIENCE
                </span>
                <span className="text-[#a855f7]">.</span>
              </h1>

              <p className="mt-8 max-w-lg text-gray-400 text-sm sm:text-base leading-7">
                Tell us a little about yourself and become part of the Ink
                Convention 2026 experience. Your details help us connect you
                with the right people, events and opportunities.
              </p>

              {/* Stats */}

              <div className="grid grid-cols-3 max-w-lg mt-12 border-y border-white/10 py-6">
                <div className="pr-4 border-r border-white/10">
                  <p className="font-black text-xl sm:text-2xl">2026</p>

                  <p className="font-mono text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                    Edition
                  </p>
                </div>

                <div className="px-4 border-r border-white/10">
                  <p className="font-black text-xl sm:text-2xl">01</p>

                  <p className="font-mono text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                    Registration
                  </p>
                </div>

                <div className="pl-4">
                  <p className="font-black text-xl sm:text-2xl">∞</p>

                  <p className="font-mono text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                    Possibilities
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3 mt-8 text-gray-600">
                <Sparkles size={13} />

                <span className="font-mono text-[9px] uppercase tracking-[0.25em]">
                  Where creativity meets culture
                </span>
              </div>
            </section>

            {/* =================================================
                RIGHT SIDE FORM
            ================================================= */}

            <section>
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-b from-[#a855f7]/30 via-transparent to-transparent blur-sm" />

                <div className="relative rounded-[2rem] border border-white/10 bg-[#0b0b0f]/90 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.55)] overflow-hidden">
                  {/* =================================================
                      CARD HEADER
                  ================================================= */}

                  <div className="px-6 sm:px-9 pt-7 pb-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-[9px] text-[#a855f7] uppercase tracking-[0.3em] mb-2">
                          Registration 01
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                          Your Details
                          <span className="text-[#a855f7]">.</span>
                        </h2>
                      </div>

                      <div className="w-11 h-11 rounded-xl border border-[#a855f7]/20 bg-[#a855f7]/5 flex items-center justify-center">
                        <User size={18} className="text-[#a855f7]" />
                      </div>
                    </div>

                    {/* ---> EDITED PROGRESS BAR (1 Single Line) <--- */}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="h-1 flex-1 rounded-full bg-[#a855f7]" />
                    </div>
                  </div>

                  {/* =================================================
                      FORM
                  ================================================= */}

                  {!submitted ? (
                    <form
                      onSubmit={handleSubmit}
                      className="p-6 sm:p-9 space-y-6"
                    >
                      {/* =================================================
                          NAME
                      ================================================= */}

                      <div className="group">
                        <label className="flex items-center justify-between mb-2.5">
                          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-[#a855f7] transition">
                            <span className="text-[#a855f7]">01</span>
                            Full Name
                          </span>

                          <span className="text-[9px] text-gray-700 font-mono">
                            REQUIRED
                          </span>
                        </label>

                        <div className="relative">
                          <User
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7] transition"
                          />

                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                            autoComplete="name"
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-700 text-sm outline-none transition-all duration-300 focus:border-[#a855f7]/60 focus:bg-[#a855f7]/[0.03] focus:shadow-[0_0_25px_rgba(168,85,247,0.08)]"
                          />
                        </div>
                      </div>

                      {/* =================================================
                          GMAIL
                      ================================================= */}

                      <div className="group">
                        <label className="flex items-center justify-between mb-2.5">
                          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-[#a855f7] transition">
                            <span className="text-[#a855f7]">02</span>
                            Gmail Address
                          </span>

                          <span className="text-[9px] text-gray-700 font-mono">
                            REQUIRED
                          </span>
                        </label>

                        <div className="relative">
                          <Mail
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7] transition"
                          />

                          <input
                            type="email"
                            name="gmail"
                            value={formData.gmail}
                            onChange={handleChange}
                            placeholder="yourname@gmail.com"
                            required
                            autoComplete="email"
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-700 text-sm outline-none transition-all duration-300 focus:border-[#a855f7]/60 focus:bg-[#a855f7]/[0.03] focus:shadow-[0_0_25px_rgba(168,85,247,0.08)]"
                          />
                        </div>
                      </div>

                      {/* =================================================
                          PHONE
                      ================================================= */}

                      <div className="group">
                        <label className="flex items-center justify-between mb-2.5">
                          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-[#a855f7] transition">
                            <span className="text-[#a855f7]">03</span>
                            Phone Number
                          </span>

                          <span className="text-[9px] text-gray-700 font-mono">
                            REQUIRED
                          </span>
                        </label>

                        <div className="flex gap-2">
                          <div className="w-[74px] h-14 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center font-mono text-xs text-gray-400 flex-shrink-0">
                            +91
                          </div>

                          <div className="relative flex-1">
                            <Phone
                              size={16}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7] transition"
                            />

                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              placeholder="98765 43210"
                              required
                              inputMode="numeric"
                              autoComplete="tel"
                              minLength={10}
                              maxLength={10}
                              className="w-full h-14 pl-12 pr-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-700 text-sm outline-none transition-all duration-300 focus:border-[#a855f7]/60 focus:bg-[#a855f7]/[0.03] focus:shadow-[0_0_25px_rgba(168,85,247,0.08)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          STATE
                      ================================================= */}

                      <div className="group">
                        <label className="flex items-center justify-between mb-2.5">
                          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-[#a855f7] transition">
                            <span className="text-[#a855f7]">04</span>
                            State
                          </span>

                          <span className="text-[9px] text-gray-700 font-mono">
                            REQUIRED
                          </span>
                        </label>

                        <div className="relative">
                          <MapPin
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7] transition"
                          />

                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Maharashtra"
                            required
                            autoComplete="address-level1"
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-700 text-sm outline-none transition-all duration-300 focus:border-[#a855f7]/60 focus:bg-[#a855f7]/[0.03] focus:shadow-[0_0_25px_rgba(168,85,247,0.08)]"
                          />
                        </div>
                      </div>

                      {/* =================================================
                          CITY
                      ================================================= */}

                      <div className="group">
                        <label className="flex items-center justify-between mb-2.5">
                          <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-[#a855f7] transition">
                            <span className="text-[#a855f7]">05</span>
                            City
                          </span>

                          <span className="text-[9px] text-gray-700 font-mono">
                            REQUIRED
                          </span>
                        </label>

                        <div className="relative">
                          <MapPin
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7] transition"
                          />

                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Mumbai"
                            required
                            autoComplete="address-level2"
                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-700 text-sm outline-none transition-all duration-300 focus:border-[#a855f7]/60 focus:bg-[#a855f7]/[0.03] focus:shadow-[0_0_25px_rgba(168,85,247,0.08)]"
                          />
                        </div>
                      </div>

                      {/* =================================================
                          SUBMIT BUTTON
                      ================================================= */}

                      <button
                        type="submit"
                        className="group relative w-full h-14 mt-2 overflow-hidden rounded-xl bg-[#a855f7] text-white font-mono text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 hover:bg-[#9333ea] hover:shadow-[0_15px_40px_rgba(168,85,247,0.25)] active:scale-[0.98]"
                      >
                        <span className="absolute inset-0 -translate-x-full bg-white/10 skew-x-[-20deg] transition-transform duration-700 group-hover:translate-x-full" />

                        <span className="relative flex items-center justify-center gap-3">
                          Submit Details
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </span>
                      </button>

                      {/* Privacy */}

                      <div className="flex items-start gap-2.5 pt-1">
                        <ShieldCheck
                          size={13}
                          className="text-gray-600 mt-0.5 flex-shrink-0"
                        />

                        <p className="font-mono text-[8px] leading-4 text-gray-600 uppercase tracking-wider">
                          Your information is collected solely for Ink
                          Convention communication and event-related purposes.
                        </p>
                      </div>
                    </form>
                  ) : (
                    /* =================================================
                       SUCCESS STATE
                    ================================================= */

                    <div className="p-8 sm:p-12 min-h-[520px] flex flex-col items-center justify-center text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 rounded-full bg-[#a855f7]/20 blur-2xl" />

                        <div className="relative w-20 h-20 rounded-full border border-[#a855f7]/40 bg-[#a855f7]/10 flex items-center justify-center">
                          <CheckCircle2 size={38} className="text-[#a855f7]" />
                        </div>
                      </div>

                      <p className="font-mono text-[9px] text-[#a855f7] uppercase tracking-[0.3em] mb-4">
                        Registration Complete
                      </p>

                      <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                        Welcome
                        <span className="text-[#a855f7]">.</span>
                      </h3>

                      <p className="mt-4 max-w-sm text-gray-500 text-sm leading-6">
                        Thank you,{" "}
                        <span className="text-white font-medium">
                          {formData.name}
                        </span>
                        . Your details have been recorded for Ink Convention
                        2026.
                      </p>

                      <div className="mt-8 w-full max-w-sm p-4 rounded-xl bg-black/40 border border-white/10 text-left">
                        <div className="flex items-center gap-3 mb-3">
                          <Circle
                            size={7}
                            className="fill-emerald-400 text-emerald-400"
                          />

                          <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest">
                            Registration Received
                          </span>
                        </div>

                        <p className="font-mono text-[10px] text-gray-600">
                          We will contact you using the information provided.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="mt-7 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#a855f7] transition cursor-pointer"
                      >
                        Submit another registration →
                      </button>
                    </div>
                  )}

                  {/* =================================================
                      CARD FOOTER
                  ================================================= */}

                  <div className="px-6 sm:px-9 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <span className="font-mono text-[8px] text-gray-700 uppercase tracking-widest">
                      INK // CLIENT
                    </span>

                    <span className="font-mono text-[8px] text-gray-700 uppercase tracking-widest">
                      2026
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
