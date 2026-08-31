import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react"; // <-- Added ChevronDown here
import gsap from "gsap";
import "../Style/Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ---> NEW STATE FOR MOBILE EXPO DROPDOWN <---
  const [isMobileExpoOpen, setIsMobileExpoOpen] = useState(false);

  const mobileMenuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close menu and reset the mobile dropdown state
  const closeMenu = () => {
    setIsOpen(false);
    setIsMobileExpoOpen(false);
  };

  // Handle scroll detection to toggle navbar background state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP animation for mobile overlay opening
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" },
      );
    }
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#000000]/90 backdrop-blur-md border-b border-white/10 text-white shadow-2xl py-3"
          : "bg-transparent border-b border-transparent text-white py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-10">
          {/* Left Side: Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-lg font-black tracking-tighter uppercase text-white hover:opacity-70 transition"
            >
              INKCONVENTION<span className="text-[#a855f7]">.</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 font-medium text-xs uppercase tracking-widest">
            <Link
              to="/"
              className="nav-link-hover text-gray-300 hover:text-white transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="nav-link-hover text-gray-300 hover:text-white transition"
            >
              About
            </Link>

            {/* ==============================================
                DESKTOP EXPO 2026 DROPDOWN
            ============================================== */}
            <div className="relative group py-4">
              <button className="nav-link-hover flex items-center gap-1 text-gray-300 hover:text-white transition cursor-pointer">
                Expo 2026{" "}
                <ChevronDown
                  size={14}
                  className="group-hover:rotate-180 transition-transform duration-300"
                />
              </button>

              {/* Dropdown Menu Container */}
              <div className="absolute top-[80%] left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-48">
                <div className="bg-[#0b0b0f] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                  <Link
                    to="/upcoming"
                    className="px-5 py-3 text-gray-400 hover:text-white hover:bg-white/5 border-b border-white/5 transition"
                  >
                    Upcoming
                  </Link>
                 
                
                </div>
              </div>
            </div>

            <Link
              to="/gallery"
              className="nav-link-hover text-gray-300 hover:text-white transition"
            >
              Gallery
            </Link>
            <Link
              to="/artists"
              className="nav-link-hover text-gray-300 hover:text-white transition"
            >
              Artists
            </Link>
            <Link
              to="/hall-of-fame"
              className="nav-link-hover text-gray-300 hover:text-white transition"
            >
              Hall Of Fame
            </Link>
          </div>

          {/* Desktop Right Social Icons */}
          <div className="hidden md:flex items-center space-x-3 pt-2">
            {/* WhatsApp SVG */}
            <a
              href="https://wa.me/message/U536VCYKIRWMA1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
              aria-label="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
            </a>
            {/* Instagram SVG */}
            <a
              href="https://www.instagram.com/ink.convention__?igsi=MXV1bDZ1NXNqcXhxMQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            {/* Gmail / Mail SVG */}
            <a
              href="mailto:ink.convention.expo@gmail.com"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
              aria-label="Email"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center ml-auto">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none p-2 rounded-full bg-white/10 hover:bg-white/20 transition duration-300 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ==============================================
          MOBILE SCREEN DROPDOWN MENU
      ============================================== */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute inset-x-0 top-full bg-[#000000] border-b border-white/10 px-6 py-6 space-y-4 shadow-2xl z-50 flex flex-col text-white max-h-[85vh] overflow-y-auto"
        >
          <div className="flex flex-col space-y-4 text-xl font-bold tracking-tight">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-white hover:text-[#a855f7] transition flex items-center justify-between"
            >
              <span>Home</span>
              <span className="text-xs font-mono text-gray-500">01</span>
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="text-white hover:text-[#a855f7] transition flex items-center justify-between"
            >
              <span>About</span>
              <span className="text-xs font-mono text-gray-500">02</span>
            </Link>

            {/* ---> MOBILE EXPO 2026 ACCORDION <--- */}
            <div className="flex flex-col">
              <button
                onClick={() => setIsMobileExpoOpen(!isMobileExpoOpen)}
                className="text-white hover:text-[#a855f7] transition flex items-center justify-between w-full text-left"
              >
                <span className="flex items-center gap-2">
                  Expo 2026
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      isMobileExpoOpen
                        ? "rotate-180 text-[#a855f7]"
                        : "text-gray-500"
                    }`}
                  />
                </span>
                <span className="text-xs font-mono text-gray-500">03</span>
              </button>

              {/* Nested Mobile Links */}
              <div
                className={`flex flex-col ml-2 pl-4 border-l border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${
                  isMobileExpoOpen
                    ? "max-h-48 mt-4 space-y-4 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  to="/upcoming"
                  onClick={closeMenu}
                  className="text-gray-400 hover:text-[#a855f7] transition text-lg"
                >
                  Upcoming
                </Link>
               
                
              </div>
            </div>

            <Link
              to="/gallery"
              onClick={closeMenu}
              className="text-white hover:text-[#a855f7] transition flex items-center justify-between"
            >
              <span>Gallery</span>
              <span className="text-xs font-mono text-gray-500">04</span>
            </Link>
            <Link
              to="/artists"
              onClick={closeMenu}
              className="text-white hover:text-[#a855f7] transition flex items-center justify-between"
            >
              <span>Artists</span>
              <span className="text-xs font-mono text-gray-500">05</span>
            </Link>
            <Link
              to="/hall-of-fame"
              onClick={closeMenu}
              className="text-white hover:text-[#a855f7] transition flex items-center justify-between"
            >
              <span>Hall Of Fame</span>
              <span className="text-xs font-mono text-gray-500">06</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Connect
            </span>
            <div className="flex items-center space-x-3 pt-2">
              {/* WhatsApp SVG */}
              <a
                href="https://wa.me/message/U536VCYKIRWMA1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </a>

              {/* Instagram SVG */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Gmail / Mail SVG */}
              <a
                href="mailto:info@inkconvention.com"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
                aria-label="Email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
