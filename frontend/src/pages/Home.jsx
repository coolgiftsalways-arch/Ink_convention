import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Users, Coins, Zap } from "lucide-react"; // Changed Globe to Coins
import { Link } from "react-router-dom";
import "../Style/Home.css";

// IMAGES
import HEROONE from "../assets/heroone.PNG";
import HEROTWO from "../assets/herotwo.jpg";
import HEROTHREE from "../assets/herothree.jpg";
import HEROFOUR from "../assets/herofour.jpg";

const slides = [
  {
    title: "TATTOO EXPO 2026:\nCALL FOR INK MASTERS",
    subtitle: "UNITED BY ART. DEFINED BY INK.",
    description:
      "Showcase your masterpiece to the world. Submit your best designs for a chance to qualify for the grand stage of Expo 2026.",
    image: HEROONE,
  },
  {
    title: "GLOBAL STAGE FOR\nMASTER TATTOO ARTISTS",
    subtitle: "EXPO 2026 HIGHLIGHTS",
    description:
      "Connect with international icons, compete live, and elevate your artistry in front of a global audience.",
    image: HEROTWO,
  },
  {
    title: "CULTURE, ARTISTRY &\nCAREER LAUNCHPAD",
    subtitle: "MORE THAN AN EVENT",
    description:
      "Expo 2026 is a curated showcase designed to push the boundaries of modern ink artistry and elevate careers.",
    image: HEROTHREE,
  },
  {
    title: "SHOWCASE YOUR\nBEST DESIGNS",
    subtitle: "QUALIFY NOW",
    description:
      "Flawless presentation across all devices, ensuring your portfolio gets maximum visibility by top judges and fans.",
    image: HEROFOUR,
  },
];

function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Slider auto-play every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  // Hero text entrance animation on slide change
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 60, skewY: 7 },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
        },
      );
    });
    return () => ctx.revert();
  }, [currentIndex]);

  return (
    <div className="w-full bg-[#08080a] text-white select-none overflow-x-hidden">
      {/* SECTION 1: Full-screen Hero Slider matching the reference layout */}
      <div className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
        {/* Background Images with smooth transitions */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent z-10 w-full lg:w-[70%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-right transform transition-transform duration-[6000ms] ease-out ${
                  index === currentIndex ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Main Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 pt-28 sm:pt-20 lg:pt-20 flex flex-col items-center md:items-start justify-center flex-grow">
          <div
            ref={contentRef}
            className="max-w-2xl space-y-6 text-center md:text-left flex flex-col items-center md:items-start"
          >
            <div className="overflow-hidden">
              <h4 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold">
                {slides[currentIndex].subtitle}
              </h4>
            </div>

            <div className="overflow-hidden">
              <h1 className="text-3xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] whitespace-pre-line text-white">
                {slides[currentIndex].title}
              </h1>
            </div>

            <div className="overflow-hidden">
              <p className="text-gray-400 text-sm sm:text-base font-light max-w-lg leading-relaxed">
                {slides[currentIndex].description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                to="/Upload"
                className="bg-[#a855f7] hover:opacity-90 text-white px-6 py-3.5 rounded-xl font-medium text-xs font-mono uppercase tracking-widest flex items-center gap-3 transition duration-300 shadow-lg shadow-purple-900/40 cursor-pointer"
              >
                SUBMIT YOUR PORTFOLIO
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 py-9 grid grid-cols-3 gap-4 sm:gap-6 border-t border-white/10 mt-12">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                1000+
              </h3>
              <p className="text-[10px] sm:text-xs font-mono text-gray-400 tracking-wider uppercase">
                TATTOO ARTISTS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
              <Coins size={22} /> {/* Changed to Money Icon */}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                5L+
              </h3>
              <p className="text-[10px] sm:text-xs font-mono text-gray-400 tracking-wider uppercase">
                TOTAL CASHBACK {/* Changed from COUNTRIES */}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                10K+
              </h3>
              <p className="text-[10px] sm:text-xs font-mono text-gray-400 tracking-wider uppercase">
                ARTWORKS
              </p>
            </div>
          </div>
        </div>

        {/* Featured In Press Logos Bar */}
        <div className="relative z-20 w-full bg-[#050507] py-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-5">
            <span className="text-[11px] font-mono tracking-[0.3em] text-gray-500 uppercase">
              FEATURED IN
            </span>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition duration-500">
              <span className="font-serif tracking-tighter text-lg sm:text-xl font-bold">
                TATTOOlfe
              </span>
              <span className="font-serif italic text-lg sm:text-xl tracking-wider">
                Inked
              </span>
              <span className="font-sans font-black tracking-widest text-sm sm:text-base">
                TATTOO
              </span>
              <span className="font-mono tracking-tight text-sm sm:text-base">
                SkinDeep
              </span>
              <span className="font-serif text-lg sm:text-xl tracking-tight">
                InkSpired
              </span>
            </div>
          </div>
        </div>

        {/* Numeric Slide Counter Indicator */}
        <div className="absolute bottom-8 right-8 lg:right-12 z-30 hidden sm:flex items-center space-x-3 text-white font-mono text-xs">
          <span className="text-[#a855f7] font-bold">0{currentIndex + 1}</span>
          <div className="w-16 h-[2px] bg-white/20 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#a855f7] transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / slides.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-white/40">0{slides.length}</span>
        </div>
      </div>

      {/* VISION SECTION UPDATED */}
      <section className="w-full py-28 px-6 sm:px-10 lg:px-12 bg-[#08080a] border-t border-white/10 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto space-y-6 flex flex-col items-center">
          <h3 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">
            // OUR VISION & MISSION
          </h3>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white">
            OUR VISION & MISSION: ELEVATING TATTOO ART
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg md:text-xl font-light max-w-2xl leading-relaxed">
            {/* Updated to focus on India instead of Global/World */}
            We connect India's best tattoo artists with an audience across
            India. Expo 2026 is more than an event; it's a launchpad for
            careers, a celebration of culture, and a curated showcase of ink
            artistry.
          </p>
        </div>
      </section>

      {/* THREE CARDS SECTION (TOP TO DOWN) */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#0b0b0f] border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h4 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">
              // COMPETITION STEPS
            </h4>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              How To Join Expo 2026
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-[#08080a] border border-white/10 rounded-3xl p-8 space-y-4 shadow-xl hover:border-[#a855f7]/50 transition duration-500">
              <span className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // 01
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                SUBMIT YOUR WORK
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                {/* Changed 10th to 14th */}
                Upload 5 high-resolution photos and 3 videos of your best
                artwork before September 14th.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#08080a] border border-white/10 rounded-3xl p-8 space-y-4 shadow-xl hover:border-[#a855f7]/50 transition duration-500">
              <span className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // 02
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                GET SHORTLISTED
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                {/* Changed 11th to 20th */}
                Our elite panel of judges will review all entries and select the
                top 300 artists on September 20th.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#08080a] border border-white/10 rounded-3xl p-8 space-y-4 shadow-xl hover:border-[#a855f7]/50 transition duration-500">
              <span className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // 03
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                CLAIM YOUR STAGE
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                Qualified artists earn an exclusive invitation to attend our
                October mega event, network with thousands of clients, and
                compete for cash prizes and Hall of Fame.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
