import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import "../Style/Gallery.css";

// images
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

// VIDEO
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

// Pattern: 1 Video, then 3 Photos, then repeat
const generatePatternedProjects = () => {
  const combined = [];
  let pIdx = 0;
  let vIdx = 0;

  while (pIdx < photos.length || vIdx < videos.length) {
    if (vIdx < videos.length) {
      combined.push(videos[vIdx++]);
    }
    if (pIdx < photos.length) {
      combined.push(photos[pIdx++]);
    }
    if (pIdx < photos.length) {
      combined.push(photos[pIdx++]);
    }
    if (pIdx < photos.length) {
      combined.push(photos[pIdx++]);
    }
  }
  return combined;
};

const galleryProjects = generatePatternedProjects();
const categories = ["All", "Photos", "Videos"];

function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredProjects = galleryProjects.filter((item) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Photos") return item.type === "photo";
    if (activeCategory === "Videos") return item.type === "video";
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none pt-32 pb-24 px-6 sm:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* HEADER SECTION UPDATED FOR EXPO 2026 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
              <Sparkles size={14} /> Curated Ink Masterpieces
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white gallery-title">
              EXPO 2026 GALLERY.
            </h1>
            <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
              Explore a world-class showcase of incredible tattoo artworks, live
              artist sessions, and custom master designs submitted for Expo
              2026.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#a855f7] text-white shadow-lg shadow-purple-900/40"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GALLERY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              onClick={() => setSelectedItem(project)}
              className="group relative bg-[#0b0b0f] rounded-3xl overflow-hidden border border-white/10 hover:border-[#a855f7]/50 transition duration-700 shadow-2xl cursor-pointer"
            >
              <div className="relative h-[320px] sm:h-[380px] w-full overflow-hidden bg-gray-900">
                {project.type === "video" ? (
                  <video
                    src={project.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 ease-out"
                  />
                ) : (
                  <img
                    src={project.image}
                    alt="Expo 2026 Tattoo Showcase"
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 ease-out"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR EXPANDED VIEW */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] bg-[#0b0b0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-[#a855f7] hover:border-[#a855f7] transition duration-300 cursor-pointer"
              aria-label="Close Modal"
            >
              <X size={20} />
            </button>

            {/* Expanded Media Content */}
            {selectedItem.type === "video" ? (
              <video
                src={selectedItem.image}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            ) : (
              <img
                src={selectedItem.image}
                alt="Expanded view"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
