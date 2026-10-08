import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import "../Style/Navbar.css";

/* =========================================================
   NAVIGATION LINKS
========================================================= */

const navLinks = [
  {
    label: "Home",
    path: "/",
    end: true,
  },

  {
    label: "About",
    path: "/about",
  },

  {
    label: "Expo 2026",
    path: "/upcoming",
  },

  {
    label: "Event 2026",
    path: "/enter",

    // IMPORTANT:
    // Same state used by the existing GET ENTRY flow.
    // After claiming and editing their profile,
    // visitors return to the GET ENTRY form at /entry.
    state: {
      entryMode: true,
      returnTo: "/entry",
      claimSource: "get-entry",
    },
  },

  {
    label: "Gallery",
    path: "/gallery",
  },

  {
    label: "Artists",
    path: "/artists",
  },

  {
    label: "Hall Of Fame",
    path: "/hall-of-fame",
  },

  {
    label: "Sponsors",
    path: "/sponsors",
  },
];

/* =========================================================
   NAVBAR COMPONENT
========================================================= */

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const mobileMenuRef = useRef(null);

  /* =========================================================
     EXPO 2026 ACTIVE ROUTE
  ========================================================= */

  const isExpoRoute =
    location.pathname === "/upcoming" ||
    location.pathname.startsWith("/upcoming/") ||
    location.pathname === "/competition" ||
    location.pathname.startsWith("/competition/");

  /* =========================================================
     EVENT 2026 ACTIVE ROUTE
  ========================================================= */

  const isEventRoute =
    location.pathname === "/enter" ||
    location.pathname.startsWith("/enter/") ||
    location.pathname === "/entry" ||
    location.pathname.startsWith("/entry/");

  /* =========================================================
     MENU FUNCTIONS
  ========================================================= */

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  /* =========================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ========================================================= */

  useEffect(() => {
    setIsOpen(false); 
  }, [location.pathname]);

  /* =========================================================
     ACTIVE LINK CHECK
  ========================================================= */

  const checkActive = (path, isActive) => {
    if (path === "/upcoming") {
      return isExpoRoute;
    }

    if (path === "/enter") {
      // Only highlight Event 2026 while using the
      // GET ENTRY claim flow, not the Artist Directory flow.
      if (
        location.pathname.toLowerCase() === "/enter" ||
        location.pathname.toLowerCase().startsWith("/enter/")
      ) {
        return (
          location.state?.entryMode === true ||
          location.state?.returnTo === "/entry"
        );
      }

      return isEventRoute;
    }

    return isActive;
  };

  /* =========================================================
     DESKTOP NAV LINK STYLE
  ========================================================= */

  const desktopNavClass = (isActive) => `
    relative
    shrink-0
    whitespace-nowrap
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
     MOBILE NAV LINK STYLE
  ========================================================= */

  const mobileNavClass = (isActive) => `
    relative
    py-3

    flex
    items-center
    justify-between

    transition-all
    duration-300

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
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     MOBILE MENU GSAP ANIMATION
  ========================================================= */

  useEffect(() => {
    if (!isOpen || !mobileMenuRef.current) {
      return;
    }

    gsap.fromTo(
      mobileMenuRef.current,
      {
        opacity: 0,
        y: -15,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power3.out",
      },
    );
  }, [isOpen]);

  /* =========================================================
     NAVBAR JSX
  ========================================================= */

  return (
    <nav
      className={`
        fixed
        top-0
        left-0
        w-full
        z-50

        transition-all
        duration-500

        ${
          scrolled
            ? `
              bg-black/90
              backdrop-blur-md
              border-b
              border-white/10
              text-white
              shadow-2xl
              py-3
            `
            : `
              bg-transparent
              border-b
              border-transparent
              text-white
              py-5
            `
        }
      `}
    >
      {/* =====================================================
          NAVBAR CONTAINER
      ===================================================== */}

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between gap-3 min-h-10">
          {/* =================================================
              WEBSITE LOGO
          ================================================= */}

          <div className="shrink-0">
            <Link
              to="/"
              onClick={closeMenu}
              className="
                text-base
                lg:text-lg
                font-black
                tracking-tighter
                uppercase
                text-white
                hover:opacity-70
                transition
                whitespace-nowrap
              "
            >
              INKCONVENTION
              <span className="text-[#a855f7]">.</span>
            </Link>
          </div>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div
            className="
              hidden
              lg:flex

              min-w-0
              flex-1

              items-center
              justify-center

              gap-2
              xl:gap-4
              2xl:gap-6

              font-medium

              text-[9px]
              xl:text-[10px]
              2xl:text-xs

              uppercase

              tracking-normal
              xl:tracking-wider
              2xl:tracking-widest

              whitespace-nowrap
            "
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                state={item.state}
                end={item.end}
                className={({ isActive }) =>
                  desktopNavClass(checkActive(item.path, isActive))
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* =================================================
              DESKTOP SOCIAL ICONS
          ================================================= */}

          <div className="hidden 2xl:flex shrink-0 items-center gap-3">
            {/* WHATSAPP */}

            <a
              href="https://wa.me/message/U536VCYKIRWMA1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
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
              aria-label="Email"
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
              MOBILE / TABLET MENU BUTTON
          ================================================= */}

          <div className="flex lg:hidden items-center ml-auto">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isOpen}
              aria-controls="inkconvention-mobile-menu"
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
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE / TABLET MENU
      ===================================================== */}

      {isOpen && (
        <div
          id="inkconvention-mobile-menu"
          ref={mobileMenuRef}
          className="
            lg:hidden
            absolute
            inset-x-0
            top-full

            bg-black/95
            backdrop-blur-xl

            border-b
            border-white/10

            px-6
            py-6

            shadow-2xl
            z-50

            flex
            flex-col
            text-white

            max-h-[85vh]
            overflow-y-auto
          "
        >
          {/* =================================================
              MOBILE NAVIGATION LINKS
          ================================================= */}

          <div className="flex flex-col gap-2 text-xl font-bold tracking-tight">
            {navLinks.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                state={item.state}
                end={item.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  mobileNavClass(checkActive(item.path, isActive))
                }
              >
                <span>{item.label}</span>

                <span className="text-xs font-mono text-gray-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </NavLink>
            ))}
          </div>

          {/* =================================================
              MOBILE SOCIAL LINKS
          ================================================= */}

          <div
            className="
              pt-5
              mt-5

              border-t
              border-white/10

              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-xs
                font-mono
                text-gray-400
                uppercase
                tracking-widest
              "
            >
              Connect
            </span>

            <div className="flex items-center gap-3">
              {/* WHATSAPP */}

              <a
                href="https://wa.me/message/U536VCYKIRWMA1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="
                  w-9
                  h-9
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
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
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
                aria-label="Email"
                className="
                  w-9
                  h-9
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
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
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
