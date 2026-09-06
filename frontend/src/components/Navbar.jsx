import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import gsap from "gsap";
import "../Style/Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expoOpen, setExpoOpen] = useState(false);
  const [mobileExpoOpen, setMobileExpoOpen] = useState(false);

  const mobileMenuRef = useRef(null);

  /* =========================================================
     MENU
  ========================================================= */

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setExpoOpen(false);
    setMobileExpoOpen(false);
  };

  /* =========================================================
     ACTIVE DESKTOP LINK STYLE
  ========================================================= */

  const desktopNavClass = ({ isActive }) =>
    `
      relative
      py-2
      transition-all
      duration-300

      after:content-['']
      after:absolute
      after:left-0
      after:-bottom-1
      after:h-[2px]
      after:rounded-full
      after:bg-[#a855f7]
      after:transition-all
      after:duration-300

      hover:text-white
      hover:after:w-full

      ${isActive ? "text-white after:w-full" : "text-gray-300 after:w-0"}
    `;

  /* =========================================================
     ACTIVE MOBILE LINK STYLE
  ========================================================= */

  const mobileNavClass = ({ isActive }) =>
    `
      relative
      py-2
      transition-all
      duration-300
      flex
      items-center
      justify-between

      after:content-['']
      after:absolute
      after:left-0
      after:bottom-0
      after:h-[2px]
      after:bg-[#a855f7]
      after:transition-all
      after:duration-300

      ${
        isActive
          ? "text-[#a855f7] after:w-full"
          : "text-white after:w-0 hover:text-[#a855f7]"
      }
    `;

  /* =========================================================
     SCROLL NAVBAR
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     MOBILE MENU GSAP
  ========================================================= */

  useEffect(() => {
    if (!isOpen || !mobileMenuRef.current) {
      return;
    }

    gsap.fromTo(
      mobileMenuRef.current,
      {
        opacity: 0,
        y: -10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power3.out",
      },
    );
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
          {/* =================================================
              LOGO
          ================================================= */}

          <div className="flex-shrink-0">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-lg font-black tracking-tighter uppercase text-white hover:opacity-70 transition"
            >
              INKCONVENTION
              <span className="text-[#a855f7]">.</span>
            </Link>
          </div>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="hidden md:flex items-center space-x-8 font-medium text-xs uppercase tracking-widest">
            {/* HOME */}

            <NavLink to="/" end className={desktopNavClass}>
              Home
            </NavLink>

            {/* ABOUT */}

            <NavLink to="/about" className={desktopNavClass}>
              About
            </NavLink>

            {/* EXPO 2026 DROPDOWN */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setExpoOpen((prev) => !prev)}
                className={`
                  relative
                  py-2
                  flex
                  items-center
                  gap-1.5
                  text-gray-300
                  hover:text-white
                  transition-all
                  duration-300

                  after:content-['']
                  after:absolute
                  after:left-0
                  after:-bottom-1
                  after:h-[2px]
                  after:rounded-full
                  after:bg-[#a855f7]
                  after:transition-all
                  after:duration-300
                  ${expoOpen ? "text-white after:w-full" : "after:w-0 hover:after:w-full"}
                `}
                aria-expanded={expoOpen}
                aria-haspopup="menu"
              >
                <span>Expo 2026</span>

                <ChevronDown
                  size={14}
                  className={`
                    transition-transform
                    duration-300
                    ${expoOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {expoOpen && (
                <div
                  className="
                    absolute
                    top-[calc(100%+14px)]
                    left-1/2
                    -translate-x-1/2
                    w-64
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#08080a]/95
                    backdrop-blur-xl
                    shadow-2xl
                    shadow-black/50
                    p-2
                    z-[70]
                  "
                  role="menu"
                >
                  <NavLink
                    to="/upcoming"
                    onClick={() => setExpoOpen(false)}
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-3
                      text-[11px]
                      font-mono
                      uppercase
                      tracking-wider
                      text-gray-300
                      hover:text-white
                      hover:bg-white/[0.06]
                      transition
                    "
                  >
                    <span>Upcoming Expo</span>
                    <span className="text-[#a855f7]">01</span>
                  </NavLink>

                  <NavLink
                    to="/stall-booking"
                    onClick={() => setExpoOpen(false)}
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-3
                      text-[11px]
                      font-mono
                      uppercase
                      tracking-wider
                      text-gray-300
                      hover:text-white
                      hover:bg-white/[0.06]
                      transition
                    "
                  >
                    <span>Book Your Stall</span>
                    <span className="text-[#a855f7]">02</span>
                  </NavLink>

                  <NavLink
                    to="/competition"
                    onClick={() => setExpoOpen(false)}
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-3
                      text-[11px]
                      font-mono
                      uppercase
                      tracking-wider
                      text-gray-300
                      hover:text-white
                      hover:bg-white/[0.06]
                      transition
                    "
                  >
                    <span>Competition</span>
                    <span className="text-[#a855f7]">03</span>
                  </NavLink>

                 
                </div>
              )}
            </div>

            {/* GALLERY */}

            <NavLink to="/gallery" className={desktopNavClass}>
              Gallery
            </NavLink>

            {/* ARTISTS */}

            <NavLink to="/artists" className={desktopNavClass}>
              Artists
            </NavLink>

            {/* HALL OF FAME */}

            <NavLink to="/hall-of-fame" className={desktopNavClass}>
              Hall Of Fame
            </NavLink>
          </div>

          {/* =================================================
              DESKTOP SOCIAL ICONS
          ================================================= */}

          <div className="hidden md:flex items-center space-x-3 pt-2">
            {/* WHATSAPP */}

            <a
              href="https://wa.me/message/U536VCYKIRWMA1"
              target="_blank"
              rel="noopener noreferrer"
              className="
                w-8
                h-8
                rounded-full
                bg-white/5
                border
                border-white/10
                flex
                items-center
                justify-center
                text-gray-300
                hover:bg-[#a855f7]
                hover:border-[#a855f7]
                hover:text-white
                transition
                duration-300
              "
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

            {/* EMAIL */}

            <a
              href="mailto:ink.convention.expo@gmail.com"
              className="
                w-8
                h-8
                rounded-full
                bg-white/5
                border
                border-white/10
                flex
                items-center
                justify-center
                text-gray-300
                hover:bg-[#a855f7]
                hover:border-[#a855f7]
                hover:text-white
                transition
                duration-300
              "
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

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <div className="flex md:hidden items-center ml-auto">
            <button
              type="button"
              onClick={toggleMenu}
              className="
                text-white
                focus:outline-none
                p-2
                rounded-full
                bg-white/10
                hover:bg-white/20
                transition
                duration-300
                cursor-pointer
              "
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="
            md:hidden
            absolute
            inset-x-0
            top-full
            bg-[#000000]
            border-b
            border-white/10
            px-6
            py-6
            space-y-4
            shadow-2xl
            z-50
            flex
            flex-col
            text-white
            max-h-[85vh]
            overflow-y-auto
          "
        >
          {/* ===============================================
              MOBILE LINKS
          =============================================== */}

          <div className="flex flex-col space-y-3 text-xl font-bold tracking-tight">
            {/* HOME */}

            <NavLink to="/" end onClick={closeMenu} className={mobileNavClass}>
              <span>Home</span>

              <span className="text-xs font-mono text-gray-500">01</span>
            </NavLink>

            {/* ABOUT */}

            <NavLink to="/about" onClick={closeMenu} className={mobileNavClass}>
              <span>About</span>

              <span className="text-xs font-mono text-gray-500">02</span>
            </NavLink>

            {/* EXPO 2026 MOBILE DROPDOWN */}

            <div className="border-b border-white/5 pb-2">
              <button
                type="button"
                onClick={() => setMobileExpoOpen((prev) => !prev)}
                className="
                  w-full
                  relative
                  py-2
                  flex
                  items-center
                  justify-between
                  text-white
                  hover:text-[#a855f7]
                  transition-all
                  duration-300
                "
              >
                <span className="flex items-center gap-2">
                  Expo 2026
                  <ChevronDown
                    size={18}
                    className={`
                      transition-transform
                      duration-300
                      ${mobileExpoOpen ? "rotate-180 text-[#a855f7]" : ""}
                    `}
                  />
                </span>

                <span className="text-xs font-mono text-gray-500">03</span>
              </button>

              {mobileExpoOpen && (
                <div className="mt-2 ml-3 pl-4 border-l border-[#a855f7]/30 space-y-1">
                  <NavLink
                    to="/upcoming"
                    onClick={closeMenu}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-mono
                      uppercase
                      tracking-wider
                      text-gray-400
                      hover:text-white
                      hover:bg-white/[0.05]
                      transition
                    "
                  >
                    <span>Upcoming Expo</span>
                    <span className="text-[#a855f7] text-[10px]">01</span>
                  </NavLink>

                  <NavLink
                    to="/stall-booking"
                    onClick={closeMenu}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-mono
                      uppercase
                      tracking-wider
                      text-gray-400
                      hover:text-white
                      hover:bg-white/[0.05]
                      transition
                    "
                  >
                    <span>Book Your Stall</span>
                    <span className="text-[#a855f7] text-[10px]">02</span>
                  </NavLink>

                  <NavLink
                    to="/competition"
                    onClick={closeMenu}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-mono
                      uppercase
                      tracking-wider
                      text-gray-400
                      hover:text-white
                      hover:bg-white/[0.05]
                      transition
                    "
                  >
                    <span>Competition</span>
                    <span className="text-[#a855f7] text-[10px]">03</span>
                  </NavLink>

                  <NavLink
                    to="/book-artist"
                    onClick={closeMenu}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      font-mono
                      uppercase
                      tracking-wider
                      text-gray-400
                      hover:text-white
                      hover:bg-white/[0.05]
                      transition
                    "
                  >
                    <span>Book Artist</span>
                    <span className="text-[#a855f7] text-[10px]">04</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* GALLERY */}

            <NavLink
              to="/gallery"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              <span>Gallery</span>

              <span className="text-xs font-mono text-gray-500">04</span>
            </NavLink>

            {/* ARTISTS */}

            <NavLink
              to="/artists"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              <span>Artists</span>

              <span className="text-xs font-mono text-gray-500">05</span>
            </NavLink>

            {/* HALL OF FAME */}

            <NavLink
              to="/hall-of-fame"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              <span>Hall Of Fame</span>

              <span className="text-xs font-mono text-gray-500">06</span>
            </NavLink>
          </div>

          {/* ===============================================
              MOBILE SOCIALS
          =============================================== */}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Connect
            </span>

            <div className="flex items-center space-x-3 pt-2">
              {/* WHATSAPP */}

              <a
                href="https://wa.me/message/U536VCYKIRWMA1"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-white/5
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  text-gray-300
                  hover:bg-[#a855f7]
                  hover:border-[#a855f7]
                  hover:text-white
                  transition
                  duration-300
                "
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

              {/* EMAIL */}

              <a
                href="mailto:ink.convention.expo@gmail.com"
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-white/5
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  text-gray-300
                  hover:bg-[#a855f7]
                  hover:border-[#a855f7]
                  hover:text-white
                  transition
                  duration-300
                "
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
