import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight, MessageCircle, Mail } from "lucide-react";
import gsap from "gsap";

import "../Style/Navbar.css";

// =====================================================
// NAVIGATION LINKS
// =====================================================

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

// =====================================================
// SOCIAL LINKS
// =====================================================

const socialLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/message/U536VCYKIRWMA1",
    icon: MessageCircle,
    external: true,
  },
  {
    label: "Email",
    href: "mailto:ink.convention.expo@gmail.com",
    icon: Mail,
    external: false,
  },
];

// =====================================================
// LOGO
// =====================================================

function NavbarLogo({ onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="inkNav-logo"
      aria-label="Ink Convention Home"
    >
      <span className="inkNav-logoMain">
        INKCONVENTION<span>.</span>
      </span>

      <span className="inkNav-logoSub">
        REAL ART
        <i />
        REAL ARTISTS
        <i />
        ONE COMMUNITY
      </span>
    </Link>
  );
}

// =====================================================
// NAVBAR
// =====================================================

function NavbarContent() {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 24,
  );

  const mobileMenuRef = useRef(null);

  // ===================================================
  // EXPO ACTIVE ROUTE
  // ===================================================

  const isExpoRoute =
    location.pathname === "/upcoming" ||
    location.pathname.startsWith("/upcoming/") ||
    location.pathname === "/competition" ||
    location.pathname.startsWith("/competition/");

  // ===================================================
  // SCROLL DETECTION
  // ===================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ===================================================
  // MOBILE MENU ANIMATION
  // ===================================================

  useEffect(() => {
    if (!isOpen || !mobileMenuRef.current) return;

    const animation = gsap.fromTo(
      mobileMenuRef.current,
      {
        opacity: 0,
        y: -12,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power3.out",
      },
    );

    return () => {
      animation.kill();
    };
  }, [isOpen]);

  // ===================================================
  // ESCAPE KEY / BACKGROUND SCROLL
  // ===================================================

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ===================================================
  // MENU ACTIONS
  // ===================================================

  const closeMenu = () => setIsOpen(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // ===================================================
  // CHECK ACTIVE LINK
  // ===================================================

  const checkActive = (path, isActive) => {
    if (path === "/upcoming") {
      return isExpoRoute;
    }

    return isActive;
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <>
      <header className={`inkNav ${scrolled ? "inkNav--scrolled" : ""}`}>
        <div className="inkNav-container">
          {/* =======================================
              WEBSITE LOGO
          ======================================= */}

          <NavbarLogo onClick={closeMenu} />

          {/* =======================================
              DESKTOP NAVIGATION
          ======================================= */}

          <nav className="inkNav-desktopLinks" aria-label="Main navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `inkNav-link ${
                    checkActive(item.path, isActive)
                      ? "inkNav-link--active"
                      : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* =======================================
              DESKTOP RIGHT ACTIONS
          ======================================= */}

          <div className="inkNav-actions">
            <div className="inkNav-socials">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="inkNav-socialBtn"
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                  </a>
                );
              })}
            </div>

            {/* JOIN FREE */}

            <Link to="/Enter" className="inkNav-joinBtn">
              <span>JOIN FREE</span>

              <ArrowUpRight size={16} strokeWidth={1.8} />
            </Link>

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              className={`inkNav-menuBtn ${
                isOpen ? "inkNav-menuBtn--active" : ""
              }`}
              onClick={toggleMenu}
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
              aria-controls="inkconvention-mobile-menu"
            >
              {isOpen ? (
                <X size={23} strokeWidth={1.8} />
              ) : (
                <Menu size={23} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* =======================================
            MOBILE DROPDOWN
        ======================================= */}

        {isOpen && (
          <div
            id="inkconvention-mobile-menu"
            ref={mobileMenuRef}
            className="inkNav-mobileMenu"
          >
            <div className="inkNav-mobileInner">
              <div className="inkNav-mobileHeading">
                <span>EXPLORE INK CONVENTION</span>
                <span>MENU / 2026</span>
              </div>

              <nav
                className="inkNav-mobileLinks"
                aria-label="Mobile navigation"
              >
                {navLinks.map((item, index) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `inkNav-mobileLink ${
                        checkActive(item.path, isActive)
                          ? "inkNav-mobileLink--active"
                          : ""
                      }`
                    }
                  >
                    <span className="inkNav-mobileLinkIndex">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="inkNav-mobileLinkName">{item.label}</span>

                    <ArrowUpRight size={18} strokeWidth={1.7} />
                  </NavLink>
                ))}
              </nav>

              {/* MOBILE JOIN FREE */}

              <Link
                to="/Enter"
                onClick={closeMenu}
                className="inkNav-mobileJoin"
              >
                <span>JOIN DIRECTORY FREE</span>

                <ArrowUpRight size={19} />
              </Link>

              {/* MOBILE SOCIALS */}

              <div className="inkNav-mobileFooter">
                <div className="inkNav-mobileFooterText">
                  <strong>INK CONVENTION</strong>
                  <span>TATTOO • ART • CULTURE</span>
                </div>

                <div className="inkNav-mobileSocials">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        aria-label={item.label}
                      >
                        <Icon size={19} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =======================================
          MOBILE OVERLAY
      ======================================= */}

      {isOpen && (
        <button
          type="button"
          className="inkNav-overlay"
          onClick={closeMenu}
          aria-label="Close mobile navigation"
        />
      )}
    </>
  );
}

// =====================================================
// RESET MOBILE MENU WHEN ROUTE CHANGES
// =====================================================

export default function Navbar() {
  const location = useLocation();

  return <NavbarContent key={location.pathname} />;
}
