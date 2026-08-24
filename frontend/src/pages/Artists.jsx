import { useState, useEffect, useMemo } from "react";
import { Sparkles, MapPin, Search } from "lucide-react";

// ======================================================
// ARTIST DATABASE (STATIC + DYNAMIC FETCH)
// ======================================================
const staticDirectoryArtists = [
 
];

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicArtists, setDynamicArtists] = useState([]);

  // Fetch registered users/artists from backend database
  useEffect(() => {
    fetch("https://api.inkconvention.com/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          // Map backend submissions to match artist card structure
          const formattedUsers = data.users.map((user) => ({
            name:
              user.professionalName ||
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              "Participant Artist",
            studio: user.studio || "Independent / Convention Participant",
            category: user.category || "CONVENTION COMPETITOR",
            city: user.city || "India",
            state: user.state || "",
            badge: "NEW ENTRY",
            year: "2026",
            metrics: user.experience
              ? `Experience: ${user.experience}`
              : "Convention Competitor",
          }));
          setDynamicArtists(formattedUsers);
        }
      })
      .catch((err) => {
        console.error("Failed to load registered artists:", err);
      });
  }, []);

  // Combine static artists and newly submitted users from database
  const allDirectoryArtists = useMemo(() => {
    return [...dynamicArtists, ...staticDirectoryArtists];
  }, [dynamicArtists]);

  const filteredArtists = useMemo(() => {
    if (!searchQuery) return allDirectoryArtists;
    const q = searchQuery.toLowerCase();
    return allDirectoryArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(q) ||
        artist.studio.toLowerCase().includes(q) ||
        artist.city.toLowerCase().includes(q) ||
        artist.category.toLowerCase().includes(q) ||
        artist.state.toLowerCase().includes(q),
    );
  }, [searchQuery, allDirectoryArtists]);

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none pt-32 pb-24 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
            <Sparkles size={14} /> COMMUNITY NETWORK
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white uppercase">
            ARTIST DIRECTORY
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed max-w-2xl">
            Discover tattoo artists, studios and creative professionals
            participating in or featured by the Ink Convention community.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0b0b0f] p-4 sm:p-6 rounded-2xl border border-white/5 shadow-xl">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="SEARCH ARTISTS, STUDIOS, CITIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-[#a855f7] transition"
            />
          </div>

          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">
            SHOWING{" "}
            <span className="text-[#a855f7] font-bold">
              {filteredArtists.length}
            </span>{" "}
            ARTISTS
          </div>
        </div>

        {/* Grid */}
        {filteredArtists.length === 0 ? (
          <div className="text-center py-20 bg-[#0b0b0f] border border-dashed border-white/10 rounded-3xl">
            <Search className="mx-auto text-gray-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">
              NO ARTISTS FOUND
            </h3>
            <p className="text-gray-500 font-light mt-2">
              Try searching by a different name, city, or style.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist, index) => {
              const globalIndex = index + 1;
              return (
                <div
                  key={`${artist.name}-${index}`}
                  className="group relative bg-[#0b0b0f] rounded-3xl p-6 border border-white/5 hover:border-[#a855f7]/50 transition-all duration-500 shadow-2xl flex flex-col justify-between space-y-6 overflow-hidden"
                >
                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#a855f7]/10 rounded-full blur-2xl group-hover:bg-[#a855f7]/20 transition-all duration-500 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-8 h-8 rounded-full text-[11px] font-mono font-black flex items-center justify-center bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#a855f7]">
                        #{globalIndex}
                      </span>
                      {artist.badge && (
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full shadow-lg ${
                            artist.badge === "NEW ENTRY"
                              ? "bg-purple-600 text-white animate-pulse"
                              : "bg-[#a855f7] text-white"
                          }`}
                        >
                          {artist.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-mono text-[#a855f7] uppercase tracking-wider truncate">
                        {artist.category}
                      </p>
                      <h3 className="text-xl font-black text-white group-hover:text-[#a855f7] transition duration-300">
                        {artist.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">
                        {artist.studio}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <MapPin size={13} className="text-[#a855f7]" />
                      <span>
                        {artist.city}
                        {artist.state ? `, ${artist.state}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400 truncate">
                      <Sparkles
                        size={12}
                        className="text-[#a855f7] flex-shrink-0"
                      />
                      <span className="truncate">{artist.metrics}</span>
                    </div>
                    <div className="font-mono text-[11px] text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-lg flex-shrink-0">
                      {artist.year}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
