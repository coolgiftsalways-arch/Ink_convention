import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  X,
  Search,
  MapPin,
  Share2,
  Heart,
  Link as LinkIcon,
  User,
  ChevronRight,
  Play,
  Trophy,
  Medal,
} from "lucide-react";
import "../Style/Gallery.css";

// IMAGES
import GAll1 from "../assets/gall1.jpg";
import GAll3 from "../assets/gall3.jpg";
import GAll4 from "../assets/gall4.jpg";
import GAll5 from "../assets/gall5.JPG";
import GAll6 from "../assets/gall6.PNG";
import GAll7 from "../assets/gall7.jpg";
import GAll8 from "../assets/gall8.jpg";
import GAll9 from "../assets/gall9.jpg";
import GAll11 from "../assets/gall11.jpg";
import GAll12 from "../assets/gall12.jpg";
import GAll13 from "../assets/gall13.jpg";
import GAll14 from "../assets/gall14.jpg";
import GAll15 from "../assets/gall15.jpg";
import GAll16 from "../assets/gall16.jpg";
import GAll17 from "../assets/gall17.jpg";
import GAll19 from "../assets/gall19.JPG";
import GAll20 from "../assets/gall20.JPG";
import GAll21 from "../assets/gall21.JPG";
import GAll22 from "../assets/gall22.JPG";
import GAll23 from "../assets/gall23.JPG";
import GAll24 from "../assets/gall24.JPG";
import GAll25 from "../assets/gall25.jpg";
import GAll26 from "../assets/gall26.jpg";
import GAll27 from "../assets/gall27.jpg";
import GAll28 from "../assets/gall28.jpg";
import GAll29 from "../assets/gall29.jpg";
import GAll30 from "../assets/gall30.jpg";
import GAll32 from "../assets/gall32.jpg";
import GAll33 from "../assets/gall33.jpg";
import GAll34 from "../assets/gall34.jpg";
import GAll35 from "../assets/gall35.jpg";
import GAll36 from "../assets/gall36.jpg";
import GAll37 from "../assets/gall37.jpg";
import GAll38 from "../assets/gall38.jpg";
import GAll39 from "../assets/gall39.jpg";
import GAll40 from "../assets/gall40.jpg";
import GAll41 from "../assets/gall41.jpg";
import GAll42 from "../assets/gall42.jpg";
import GAll43 from "../assets/gall43.jpg";
import GAll44 from "../assets/gall44.jpg";
import GAll45 from "../assets/gall45.jpg";
import GAll46 from "../assets/last.jpeg";

// VIDEOS
import VELL1 from "../assets/gall1.mp4";
import VELL2 from "../assets/gall2.mp4";
import VELL3 from "../assets/gall3.mp4";
import VELL4 from "../assets/gall4.mp4";
import VELL5 from "../assets/gall5.mp4";
import VELL6 from "../assets/gall6.mp4";
import VELL7 from "../assets/gall7.mp4";
import VELL8 from "../assets/gall8.mp4";
import VELL9 from "../assets/gall9.mp4";
import VELL10 from "../assets/gall10.mp4";
import VELL11 from "../assets/gall11.mp4";
import VELL12 from "../assets/gall12.mp4";

// ==========================================
// MOCK DATABASE GENERATION
// ==========================================
const photos = [
  { type: "photo", image: GAll1 },
  { type: "photo", image: GAll3 },
  { type: "photo", image: GAll4 },
  { type: "photo", image: GAll5 },
  { type: "photo", image: GAll6 },
  { type: "photo", image: GAll7 },
  { type: "photo", image: GAll8 },
  { type: "photo", image: GAll9 },
  { type: "photo", image: GAll11 },
  { type: "photo", image: GAll12 },
  { type: "photo", image: GAll13 },
  { type: "photo", image: GAll14 },
  { type: "photo", image: GAll15 },
  { type: "photo", image: GAll16 },
  { type: "photo", image: GAll17 },
  { type: "photo", image: GAll19 },
  { type: "photo", image: GAll20 },
  { type: "photo", image: GAll21 },
  { type: "photo", image: GAll22 },
  { type: "photo", image: GAll23 },
  { type: "photo", image: GAll24 },
  { type: "photo", image: GAll25 },
  { type: "photo", image: GAll26 },
  { type: "photo", image: GAll27 },
  { type: "photo", image: GAll28 },
  { type: "photo", image: GAll29 },
  { type: "photo", image: GAll30 },
  { type: "photo", image: GAll32 },
  { type: "photo", image: GAll33 },
  { type: "photo", image: GAll34 },
  { type: "photo", image: GAll35 },
  { type: "photo", image: GAll36 },
  { type: "photo", image: GAll37 },
  { type: "photo", image: GAll38 },
  { type: "photo", image: GAll39 },
  { type: "photo", image: GAll40 },
  { type: "photo", image: GAll41 },
  { type: "photo", image: GAll42 },
  { type: "photo", image: GAll43 },
  { type: "photo", image: GAll44 },
  { type: "photo", image: GAll45 },
  { type: "photo", image: GAll46 },
];

const videos = [
  { type: "video", image: VELL1 },
  { type: "video", image: VELL2 },
  { type: "video", image: VELL3 },
  { type: "video", image: VELL4 },
  { type: "video", image: VELL5 },
  { type: "video", image: VELL6 },
  { type: "video", image: VELL7 },
  { type: "video", image: VELL8 },
  { type: "video", image: VELL9 },
  { type: "video", image: VELL10 },
  { type: "video", image: VELL11 },
  { type: "video", image: VELL12 },
];

// Mock Metadata Arrays for Demonstration
const MOCK_CATEGORIES = [
  "Black & Grey",
  "Realism",
  "Colour",
  "Fine Line",
  "Traditional",
  "Neo-Traditional",
  "Japanese",
  "Ornamental",
];
const MOCK_ARTISTS = [
  "Vikram Singh",
  "Priya Sharma",
  "Rahul Desai",
  "Elena Rodriguez",
  "Amit Patel",
  "Sarah Chen",
  "David O'Connor",
];
const MOCK_CITIES = [
  "Mumbai, India",
  "Delhi, India",
  "Bangalore, India",
  "London, UK",
  "New York, USA",
  "Berlin, Germany",
];
const MOCK_STATUS = [
  "Published",
  "Published",
  "Published",
  "Finalist",
  "Winner",
  "People's Choice",
];
const MOCK_TITLES = [
  "Midnight Lotus",
  "Urban Jungle",
  "Sacred Geometry",
  "Fierce Tiger",
  "Delicate Rose",
  "Cyberpunk Sleeve",
  "Traditional Anchor",
];

const generatePatternedProjects = () => {
  const combined = [];
  let pIdx = 0;
  let vIdx = 0;

  while (pIdx < photos.length || vIdx < videos.length) {
    if (vIdx < videos.length) combined.push(videos[vIdx++]);
    if (pIdx < photos.length) combined.push(photos[pIdx++]);
    if (pIdx < photos.length) combined.push(photos[pIdx++]);
    if (pIdx < photos.length) combined.push(photos[pIdx++]);
  }

  // Inject Mock Metadata into the array to simulate a real database
  return combined.map((item, index) => {
    const status = MOCK_STATUS[index % MOCK_STATUS.length];
    return {
      ...item,
      id: `ART-${1000 + index}`,
      artistName: MOCK_ARTISTS[index % MOCK_ARTISTS.length],
      title: MOCK_TITLES[index % MOCK_TITLES.length],
      category: MOCK_CATEGORIES[index % MOCK_CATEGORIES.length],
      city: MOCK_CITIES[index % MOCK_CITIES.length],
      status: status,
      season: "2026",
      isWinner: status === "Winner" || status === "People's Choice",
      isFinalist: status === "Finalist",
    };
  });
};

const galleryProjects = generatePatternedProjects();
const MAIN_FILTERS = ["ALL", "ARTWORK", "FINALISTS", "WINNERS", "VIDEOS"];

function Gallery() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeCategory, setActiveCategory] = useState("ALL CATEGORIES");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Advanced Filtering Logic
  const filteredProjects = useMemo(() => {
    return galleryProjects.filter((item) => {
      // 1. Primary Tab Filter
      if (activeFilter === "ARTWORK" && item.type === "video") return false;
      if (activeFilter === "VIDEOS" && item.type === "photo") return false;
      if (activeFilter === "FINALISTS" && !item.isFinalist) return false;
      if (activeFilter === "WINNERS" && !item.isWinner) return false;

      // 2. Category Dropdown Filter
      if (
        activeCategory !== "ALL CATEGORIES" &&
        item.category !== activeCategory
      )
        return false;

      // 3. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.artistName.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [activeFilter, activeCategory, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none pt-32 pb-0 overflow-x-hidden font-sans">
      {/* =========================================
          1. HERO & SEARCH SECTION
      ========================================= */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-12 mb-16">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
            <Sparkles size={14} /> CURATED TATTOO ARTISTRY
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[1.05]">
            INK CONVENTION GALLERY
          </h1>
          <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
            Explore exceptional tattoo work from Ink Convention artists,
            competition finalists and recognised winners across multiple styles
            and categories.
          </p>
          <p className="text-[#a855f7] text-xs font-mono tracking-widest uppercase">
            New work is added throughout the competition season.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#0b0b0f] p-4 sm:p-6 rounded-2xl border border-white/5 shadow-2xl">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="SEARCH ARTISTS OR TATTOOS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-[#a855f7] transition"
            />
          </div>

          {/* Primary Filters */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {MAIN_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-widest transition duration-300 cursor-pointer flex-grow sm:flex-grow-0 ${
                  activeFilter === filter
                    ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="w-full lg:w-auto">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full lg:w-48 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-[#a855f7] transition appearance-none cursor-pointer"
            >
              <option value="ALL CATEGORIES">ALL CATEGORIES</option>
              {MOCK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =========================================
          2. GALLERY GRID
      ========================================= */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mb-32">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-[#0b0b0f] border border-dashed border-white/10 rounded-3xl">
            <Search className="mx-auto text-gray-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">
              NO ARTWORK FOUND
            </h3>
            <p className="text-gray-500 font-light mt-2">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedItem(project)}
                className="group relative bg-[#0b0b0f] rounded-2xl overflow-hidden border border-white/5 hover:border-[#a855f7]/50 transition duration-500 shadow-2xl cursor-pointer"
              >
                {/* Media Container */}
                <div className="relative h-[350px] sm:h-[400px] w-full overflow-hidden bg-[#050507]">
                  {project.type === "video" ? (
                    <video
                      src={project.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 ease-out"
                    />
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 ease-out"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                  {project.type === "video" && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                      <Play size={14} className="text-white ml-0.5" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {project.isWinner && (
                      <span className="bg-[#a855f7] text-white text-[10px] font-bold font-mono px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Trophy size={12} /> WINNER
                      </span>
                    )}
                    {project.isFinalist && (
                      <span className="bg-white text-black text-[10px] font-bold font-mono px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Medal size={12} /> FINALIST
                      </span>
                    )}
                  </div>

                  {/* Artwork Metadata (Revealed subtly at bottom) */}
                  <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[#a855f7] text-[10px] font-mono tracking-widest uppercase mb-1">
                      {project.category}
                    </p>
                    <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-light flex items-center gap-1">
                      <User size={12} /> {project.artistName}{" "}
                      <span className="mx-1">•</span> {project.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================
          3. ACQUISITION CTA (Bottom of Gallery)
      ========================================= */}
      <section className="w-full py-32 px-6 sm:px-10 lg:px-12 bg-gradient-to-t from-[#140a24] to-[#08080a] border-t border-[#a855f7]/20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight">
            THINK YOUR WORK BELONGS HERE?
          </h2>
          <p className="text-gray-300 text-lg font-light">
            Submit your best work and compete for recognition, awards and Ink
            Convention ranking points.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              to="/upload"
              className="w-full sm:w-auto bg-[#a855f7] hover:bg-[#9333ea] text-white px-10 py-5 rounded-xl font-bold text-sm font-mono uppercase tracking-widest transition duration-300 shadow-lg shadow-purple-900/50"
            >
              ENTER THE COMPETITION
            </Link>
            <Link
              to="/categories"
              className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-white/60 text-white px-10 py-5 rounded-xl font-bold text-sm font-mono uppercase tracking-widest transition duration-300"
            >
              VIEW CATEGORIES
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          4. DETAILED LIGHTBOX MODAL
      ========================================= */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full max-h-[95vh] bg-[#0b0b0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-[#a855f7] hover:border-[#a855f7] transition duration-300 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Left: Media Area */}
            <div className="w-full lg:w-2/3 h-[40vh] lg:h-[85vh] bg-[#050507] flex items-center justify-center relative">
              {selectedItem.type === "video" ? (
                <video
                  src={selectedItem.image}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Right: Detailed Metadata & Ecosystem Links */}
            <div className="w-full lg:w-1/3 h-full max-h-[50vh] lg:max-h-[85vh] overflow-y-auto p-8 lg:p-10 flex flex-col bg-gradient-to-b from-[#0b0b0f] to-[#120a1f]">
              <div className="space-y-6 flex-grow">
                {/* Header Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#a855f7] text-[10px] font-mono tracking-widest uppercase bg-[#a855f7]/10 px-2 py-1 rounded">
                      SEASON {selectedItem.season}
                    </span>
                    {selectedItem.isWinner && (
                      <span className="text-white text-[10px] font-mono tracking-widest uppercase bg-[#a855f7] px-2 py-1 rounded flex items-center gap-1">
                        <Trophy size={10} /> WINNER
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase leading-tight mb-2">
                    {selectedItem.title}
                  </h2>
                  <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">
                    {selectedItem.category}
                  </p>
                </div>

                <hr className="border-white/5" />

                {/* Artist Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    ARTIST PROFILE
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden">
                      <User className="text-gray-500" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {selectedItem.artistName}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-[#a855f7]" />{" "}
                        {selectedItem.city}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/artists`}
                    className="inline-flex w-full items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl border border-white/10 hover:border-[#a855f7] hover:bg-[#a855f7]/10 text-white text-xs font-mono uppercase tracking-widest transition duration-300"
                  >
                    VIEW ARTIST PROFILE <ChevronRight size={14} />
                  </Link>
                </div>

                <hr className="border-white/5" />

                {/* Social Sharing */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    SHARE THIS ENTRY
                  </h4>
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-3 text-white transition">
                      <Heart size={16} />
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-3 text-white transition">
                      <Share2 size={16} />
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-3 text-white transition"
                      onClick={() =>
                        navigator.clipboard.writeText(window.location.href)
                      }
                    >
                      <LinkIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8 text-center">
                <p className="text-[10px] text-gray-600 font-mono">
                  INK CONVENTION ID: {selectedItem.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
