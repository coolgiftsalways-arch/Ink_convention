import { useState } from "react";
import { Trophy, Award, Sparkles, Medal, MapPin } from "lucide-react";

// ======================================================
// FEATURED TATTOO ARTISTS
// ======================================================

const allInductees = [
  // ====================================================
  // GOA — 3 ARTISTS
  // ====================================================

  {
    name: "Vijay",
    studio: "Krish Tattoo",
    category: "REALISTIC BLACK & GREY",
    city: "Calangute",
    state: "Goa",
    badge: "GOA",
    year: "2026",
    metrics: "Tattooing Since 2010",
  },

  {
    name: "Ghanasham",
    studio: "Krish Tattoo",
    category: "FINE ART",
    city: "Calangute",
    state: "Goa",
    badge: "GOA",
    year: "2026",
    metrics: "Tattooing Since 2007",
  },

  {
    name: "Gautam",
    studio: "Krish Tattoo",
    category: "CUSTOM TATTOO ART",
    city: "Calangute",
    state: "Goa",
    badge: "GOA",
    year: "2026",
    metrics: "Tattooing Since 2011",
  },

  // ====================================================
  // HYDERABAD — 7 ARTISTS
  // ====================================================

  {
    name: "Subhojit Chakroborty",
    studio: "Koru Ink",
    category: "REALISM & BLACK & GREY",
    city: "Hyderabad",
    state: "Telangana",
    year: "2026",
    metrics: "Founder • Lead Artist",
  },

  {
    name: "Satya Narayana Posayya",
    studio: "Koru Ink",
    category: "CUSTOM TATTOO ART",
    city: "Hyderabad",
    state: "Telangana",
    year: "2026",
    metrics: "Resident Tattoo Artist",
  },

  {
    name: "Venu Gopal Reddy",
    studio: "Koru Ink",
    category: "CUSTOM TATTOO ART",
    city: "Hyderabad",
    state: "Telangana",
    year: "2026",
    metrics: "Resident Tattoo Artist",
  },

  {
    name: "Vishal Prem",
    studio: "Koru Ink",
    category: "TATTOO ART",
    city: "Hyderabad",
    state: "Telangana",
    year: "2026",
    metrics: "Apprentice / Tattoo Artist",
  },

  {
    name: "Rocky",
    studio: "Koru Ink",
    category: "REALISM",
    city: "Hyderabad",
    state: "Telangana",
    year: "2026",
    metrics: "Koru Realism Artist",
  },

  {
    name: "Tej",
    studio: "Koru Ink",
    category: "DELICATE LINE ART",
    city: "Hyderabad",
    state: "Telangana",
    year: "2026",
    metrics: "Resident Artist",
  },

  {
    name: "Bishal",
    studio: "Koru Ink",
    category: "COLOURFUL REALISM",
    city: "Hyderabad",
    state: "Telangana",
    year: "2026",
    metrics: "Koru Artist",
  },

  // ====================================================
  // CHENNAI — 3 ARTISTS
  // ====================================================

  {
    name: "R. Yamini",
    studio: "Scorpio Tattoo Studio",
    category: "CUSTOM & FINE LINE",
    city: "Medavakkam",
    state: "Tamil Nadu",
    year: "2026",
    metrics: "Founder • Lead Artist",
  },

  {
    name: "Karthik",
    studio: "Scorpio Tattoo Studio",
    category: "REALISM & SLEEVES",
    city: "Medavakkam",
    state: "Tamil Nadu",
    year: "2026",
    metrics: "10+ Years Experience",
  },

  {
    name: "Sarathi",
    studio: "Scorpio Tattoo Studio",
    category: "LINEWORK & MODERN",
    city: "Medavakkam",
    state: "Tamil Nadu",
    year: "2026",
    metrics: "5+ Years Experience",
  },

  // ====================================================
  // DELHI — 2 ARTISTS
  // ====================================================

  {
    name: "Chetan Salhotra",
    studio: "Inkspace Tattoo Studio",
    category: "REALISM & BLACKWORK",
    city: "New Delhi",
    state: "Delhi",
    year: "2026",
    metrics: "Lead Tattoo Artist",
  },

  {
    name: "Bruna Freespirit",
    studio: "Inkspace Tattoo Studio",
    category: "FINE LINE & MINIMAL",
    city: "New Delhi",
    state: "Delhi",
    year: "2026",
    metrics: "Resident Artist",
  },

  // ====================================================
  // BENGALURU — 1 ARTIST
  // ====================================================

  {
    name: "Veer Hegde",
    studio: "Eternal Expression",
    category: "CUSTOM & REALISM",
    city: "Bengaluru",
    state: "Karnataka",
    year: "2026",
    metrics: "Lead Tattoo Artist",
  },

  // ====================================================
  // KOLKATA — 1 ARTIST
  // ====================================================

  {
    name: "Riju Brahma",
    studio: "Shloka Tattoo",
    category: "CUSTOM TATTOO ART",
    city: "Kolkata",
    state: "West Bengal",
    year: "2026",
    metrics: "Founder • Tattoo Artist",
  },

  // ====================================================
  // JAIPUR — 1 ARTIST
  // ====================================================

  {
    name: "Sunil Goyal",
    studio: "Xpose Tattoos",
    category: "REALISM & PORTRAITS",
    city: "Jaipur",
    state: "Rajasthan",
    year: "2026",
    metrics: "Founder • Lead Artist",
  },
];

// ======================================================
// HALL OF FAME
// ======================================================

export default function HallOfFame() {
  const [activeTab, setActiveTab] = useState("Featured Artists");

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none pt-32 pb-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1700px] mx-auto space-y-20">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
              <Trophy size={14} />
              EXPO INK ARTISTS ({allInductees.length} PROFILES)
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white">
              HALL OF FAME
            </h1>

            <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
              A curated showcase of tattoo artists and working tattoo
              professionals from across India, featuring artists from Goa,
              Hyderabad, Chennai, Delhi, Bengaluru, Kolkata and Jaipur.
            </p>
          </div>

          {/* ==================================================
              FILTER
          ================================================== */}

          <div className="flex items-center gap-2 bg-[#0b0b0f] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab("Featured Artists")}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition duration-300 cursor-pointer ${
                activeTab === "Featured Artists"
                  ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Featured Artists
            </button>

            <button
              onClick={() => setActiveTab("Artists")}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition duration-300 cursor-pointer ${
                activeTab === "Artists"
                  ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Artists
            </button>
          </div>
        </div>

        {/* ==================================================
            FEATURED BANNER
        ================================================== */}

        <div className="relative bg-gradient-to-r from-purple-900/40 via-[#0b0b0f] to-[#0b0b0f] border border-purple-500/35 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-xl relative z-10">
            <span className="text-xs font-mono text-[#a855f7] tracking-[0.3em] uppercase font-semibold">
              // FEATURED ARTIST DIRECTORY 2026
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              INDIA INK ARTISTS
            </h2>

            <p className="text-gray-300 text-sm font-light leading-relaxed">
              Meet tattoo artists working across different cities and styles.
              Explore the artists and studios featured in the Expo directory.
            </p>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-[#a855f7]/20 border border-[#a855f7]/45 flex items-center justify-center text-[#a855f7] flex-shrink-0 animate-pulse relative z-10 shadow-lg shadow-purple-900/50">
            <Award size={40} />
          </div>
        </div>

        {/* ==================================================
            ARTIST GRID
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {allInductees.map((inductee, index) => {
            const globalIndex = index + 1;

            const isFirst = globalIndex === 1;
            const isSecond = globalIndex === 2;
            const isThird = globalIndex === 3;

            const badgeStyles = isFirst
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300 shadow-amber-500/20"
              : isSecond
                ? "bg-gradient-to-r from-slate-300 to-slate-400 text-black border-slate-200 shadow-slate-400/20"
                : isThird
                  ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-600 shadow-amber-800/20"
                  : "bg-[#a855f7]/20 border border-[#a855f7]/45 text-[#a855f7]";

            const cardBorder = isFirst
              ? "border-amber-400/60 hover:border-amber-400"
              : isSecond
                ? "border-slate-300/60 hover:border-slate-300"
                : isThird
                  ? "border-amber-700/60 hover:border-amber-600"
                  : "border-white/10 hover:border-[#a855f7]/60";

            return (
              <div
                key={`${inductee.name}-${index}`}
                className={`group relative bg-[#0b0b0f] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border ${cardBorder} transition-all duration-500 shadow-2xl flex flex-col justify-between space-y-6 overflow-hidden`}
              >
                {/* CARD GLOW */}

                <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#a855f7]/10 rounded-full blur-2xl group-hover:bg-[#a855f7]/20 transition-all duration-500 pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* NUMBER + BADGE */}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-8 h-8 rounded-full text-[11px] font-mono font-black flex items-center justify-center shadow-md ${badgeStyles}`}
                      >
                        {isFirst ? <Medal size={14} /> : `#${globalIndex}`}
                      </span>

                      {inductee.badge && (
                        <span className="bg-[#a855f7] text-white text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                          {inductee.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CATEGORY + NAME */}

                  <div className="space-y-2">
                    <p className="text-[10px] sm:text-[11px] font-mono text-[#a855f7] uppercase tracking-wider truncate">
                      {inductee.category}
                    </p>

                    <h3 className="text-base sm:text-xl font-black text-white group-hover:text-[#a855f7] transition duration-300">
                      {inductee.name}
                    </h3>

                    <p className="text-xs text-gray-400 font-medium">
                      {inductee.studio}
                    </p>
                  </div>

                  {/* LOCATION */}

                  <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                    <MapPin size={13} className="text-[#a855f7]" />

                    <span>
                      {inductee.city}, {inductee.state}
                    </span>
                  </div>
                </div>

                {/* ==================================================
                    CARD FOOTER
                ================================================== */}

                <div className="pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-[#a855f7] truncate">
                    <Sparkles
                      size={12}
                      className="hidden sm:inline flex-shrink-0"
                    />

                    <span className="truncate">{inductee.metrics}</span>
                  </div>

                  <div className="font-mono text-[11px] text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-lg flex-shrink-0">
                    {inductee.year}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="pt-12 border-t border-white/10 text-center text-xs font-mono text-gray-500 space-y-2">
          <p>EXPO 2026 • INDIA TATTOO ARTIST DIRECTORY</p>

          <p>
            Featured Artists • Goa • Hyderabad • Chennai • Delhi • Bengaluru •
            Kolkata • Jaipur and More
          </p>

        </div>
      </div>
    </div>
  );
}
