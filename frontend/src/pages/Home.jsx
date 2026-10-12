import { useEffect, useRef, useState } from "react";

import gsap from "gsap";

import {
  Trophy,
  Medal,
  LayoutGrid,
  Star,
  ChevronDown,
  ArrowRight,
  Store,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../Style/Home.css";

import HOME from "../assets/tattoo-cards-bg.png";
import HERO_GIRL from "../assets/hero-girl.png";
import HERO_TATTOO from "../assets/hero-tattoo.png";
import HERO_EXPO from "../assets/hero-expo.png";
import HERO_GRUNGE from "../assets/hero-grunge.png";
import HERO_WALL from "../assets/hero-tattoo-wall.png";
import HERO_TITLE from "../assets/hero-title.png";
import HERO_MORE_THAN_INK from "../assets/hero-more-than-ink.png";

/* =========================================================
   INLINE SVG ICONS — HERO ACTIONS
   No extra image files or icon packages are required.
========================================================= */

function StallSvgIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="30"
      height="30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 13 9 5.5h14L25.5 13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 13v2.2a3.1 3.1 0 0 0 6.2 0 3.3 3.3 0 0 0 6.6 0 3.1 3.1 0 0 0 6.2 0V13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 18.1V27h14v-8.9M13.7 27v-6.9h4.6V27"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 13h19"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TicketSvgIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="30"
      height="30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 8h18v5.2a2.8 2.8 0 0 0 0 5.6V24H7v-5.2a2.8 2.8 0 0 0 0-5.6V8Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M17.2 9.5v3.2m0 3.1v2.5m0 3.1v1.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="1.1 1.8"
      />
      <path
        d="m10.2 13.3 3 2.7-3 2.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DirectorySvgIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="30"
      height="30"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="10" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M7.8 25.5v-2.4a8.2 8.2 0 0 1 16.4 0v2.4H7.8Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 11.9a3.2 3.2 0 1 0-1.1 6.3M24.4 11.9a3.2 3.2 0 1 1 1.1 6.3M6.3 20.7a5.7 5.7 0 0 0-3.6 4.8h3M25.7 20.7a5.7 5.7 0 0 1 3.6 4.8h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeroArrowSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 12h14m-5.7-5.7 5.7 5.7-5.7 5.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home() {
  const contentRef = useRef(null);

  const [activeFaq, setActiveFaq] = useState(null);

  /* =========================================================
     HERO ANIMATION
  ========================================================= */

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      tl.fromTo(
        ".inkHero__expo",
        { opacity: 0, y: 90, scale: 1.08 },
        { opacity: 1, y: 0, scale: 1, duration: 1.55 },
      )
        .fromTo(
          ".inkHero__wall",
          { opacity: 0, scale: 1.08 },
          { opacity: 0.5, scale: 1, duration: 1.25 },
          "-=1.2",
        )
        .fromTo(
          ".inkHero__tattooArtist",
          { opacity: 0, x: 145, scale: 1.05 },
          { opacity: 0.86, x: 0, scale: 1, duration: 1.35 },
          "-=1.05",
        )
        .fromTo(
          ".inkHero__girl",
          { opacity: 0, x: 90, scale: 1.06 },
          { opacity: 1, x: 0, scale: 1, duration: 1.45 },
          "-=1.18",
        )
        .fromTo(
          ".inkHero__grunge",
          { opacity: 0 },
          { opacity: 0.16, duration: 0.85 },
          "-=0.8",
        )
        .fromTo(
          ".inkHero__eyebrow > *",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.48 },
          "-=0.5",
        )
        .fromTo(
          ".inkHero__titleImage",
          { opacity: 0, x: -65, scale: 0.965 },
          { opacity: 1, x: 0, scale: 1, duration: 0.95 },
          "-=0.3",
        )
        .fromTo(
          ".inkHero__categories > *",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.055, duration: 0.42 },
          "-=0.4",
        )
        .fromTo(
          ".inkActionCard, .inkHero__artistTextLink",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.55 },
          "-=0.2",
        )
        .fromTo(
          ".inkHero__ticket",
          { opacity: 0, y: 18, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6 },
          "-=0.28",
        )
        .fromTo(
          ".inkHero__moreInk",
          { opacity: 0, x: 28, rotate: -4 },
          { opacity: 1, x: 0, rotate: -4, duration: 0.72 },
          "-=0.55",
        )
        .fromTo(
          ".inkHero__scroll",
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.28",
        );
    });

    return () => ctx.revert();
  }, []);

  /* =========================================================
     FAQ
  ========================================================= */

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div
      className="
        w-full
        bg-[#08080a]
        text-white
        select-none
        overflow-x-hidden
        font-sans
      "
    >
      {/* =====================================================
          1. HERO SECTION — REFERENCE-MATCHED / NO NAVBAR
      ===================================================== */}

      <section className="inkHero inkHero--desktop inkHero--repositionedActions">
        {/* Hero-only overrides. Existing Home.css and all other page sections stay intact. */}
        <style>{`
          /* ----------------------------------------------------
             DESKTOP: find-artists text ABOVE 3 equal-sized CTAs
          ---------------------------------------------------- */
          .inkHero--repositionedActions { position: relative; }

          .inkHero--repositionedActions .inkHero__categoryActionRow {
            display: flex;
            align-items: center;
            width: max-content;
            max-width: calc(100vw - 160px);
            margin-top: 20px;
          }
          .inkHero--repositionedActions .inkHero__categoryActionRow .inkHero__categories {
            display: flex;
            align-items: center;
            gap: clamp(16px, 1.8vw, 34px);
            width: auto;
            margin: 0;
            white-space: nowrap;
          }

          .inkHero--repositionedActions .inkHero__actionArea {
            position: absolute;
            z-index: 25;
            bottom: clamp(24px, 4.3vh, 52px);
            left: clamp(24px, 4.3vw, 90px);
            right: clamp(24px, 4.3vw, 90px);
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 22px;
            pointer-events: none;
          }

          /* A TEXT LINK, never a rectangular button. */
          .inkHero--repositionedActions .inkHero__artistTextLink,
          .inkMobileHero .inkMobileHero__artistTextLink {
            position: relative;
            display: inline-flex;
            align-items: center;
            align-self: flex-start;
            gap: 18px;
            width: fit-content;
            max-width: 100%;
            padding: 0 0 12px 22px;
            border: 0;
            background: transparent;
            color: #fff;
            font-weight: 900;
            font-size: clamp(16px, 1.28vw, 22px);
            letter-spacing: .14em;
            line-height: 1.3;
            text-decoration: none;
            text-transform: uppercase;
            white-space: normal;
            cursor: pointer;
            pointer-events: auto;
            transition: color .25s ease;
          }
          .inkHero--repositionedActions .inkHero__artistTextLink::before,
          .inkMobileHero .inkMobileHero__artistTextLink::before {
            content: "";
            position: absolute;
            top: .55em;
            left: 0;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: #cb42ff;
            box-shadow: 0 0 12px rgba(203,66,255,.8);
          }
          .inkHero--repositionedActions .inkHero__artistTextLink::after,
          .inkMobileHero .inkMobileHero__artistTextLink::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 2px;
            background: linear-gradient(90deg, #ce35ff, #aa35f8 60%, transparent);
            box-shadow: 0 0 10px rgba(185,50,252,.38);
          }
          .inkHero--repositionedActions .inkHero__artistTextLink:hover,
          .inkMobileHero .inkMobileHero__artistTextLink:hover {
            color: #e8c9ff;
          }
          .inkHero--repositionedActions .inkHero__artistTextLink svg,
          .inkMobileHero .inkMobileHero__artistTextLink svg { flex-shrink: 0; }

          /* Three columns, precisely identical button dimensions. */
          .inkHero--repositionedActions .inkHero__bottomActions {
            position: relative;
            inset: auto;
            width: 100%;
            margin: 0;
            padding: 0;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: clamp(12px, 1.4vw, 24px);
            align-items: stretch;
            pointer-events: auto;
          }

          /* ----------------------------------------------------
             SHARED ACTION CARDS: desktop AND mobile
             Icons are hand-written SVG components.
          ---------------------------------------------------- */
          .inkActionCard {
            position: relative;
            inset: auto;
            display: flex;
            align-items: center;
            gap: clamp(9px, 1vw, 17px);
            width: 100%;
            min-width: 0;
            max-width: none;
            height: 88px;
            min-height: 88px;
            margin: 0;
            padding: 14px clamp(13px, 1.5vw, 24px);
            box-sizing: border-box;
            border: 1.5px solid #b72cee;
            border-radius: 0;
            background: linear-gradient(110deg, rgba(48,7,67,.9), rgba(15,8,27,.89) 85%);
            color: #fff;
            text-decoration: none;
            text-align: left;
            white-space: normal;
            box-shadow: inset 0 0 23px rgba(190,39,242,.1), 0 0 16px rgba(178,45,245,.12);
            cursor: pointer;
            pointer-events: auto;
            transition: background .25s ease, border-color .25s ease,
                        box-shadow .25s ease, transform .25s ease;
          }
          .inkActionCard:hover {
            transform: translateY(-3px);
            border-color: #e085ff;
            background: linear-gradient(110deg, rgba(91,18,111,.96), rgba(31,9,48,.96));
            box-shadow: 0 0 24px rgba(198,46,255,.35);
          }
          .inkActionCard:focus-visible,
          .inkHero__artistTextLink:focus-visible,
          .inkMobileHero__artistTextLink:focus-visible {
            outline: 2px solid #f4d7ff;
            outline-offset: 4px;
          }
          .inkActionCard__icon {
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            width: 38px;
            height: 38px;
            color: #d94fff;
          }
          .inkActionCard__icon svg { width: 32px; height: 32px; }
          .inkActionCard__copy {
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            min-width: 0;
            line-height: 1.24;
          }
          .inkActionCard__title {
            display: block;
            font-size: clamp(10px, .92vw, 14px);
            font-weight: 900;
            letter-spacing: .055em;
            text-transform: uppercase;
            overflow-wrap: break-word;
          }
          .inkActionCard__subtitle {
            display: block;
            font-size: clamp(9px, .78vw, 12px);
            font-weight: 500;
            letter-spacing: .08em;
            color: #efe2f4;
            text-transform: uppercase;
          }
          .inkActionCard__arrow {
            display: grid;
            place-items: center;
            margin-left: auto;
            flex: 0 0 auto;
            color: white;
          }
          .inkActionCard__arrow svg { width: 20px; height: 20px; }

          /* ----------------------------------------------------
             MOBILE: text first, then THREE same-width cards.
             Fits into the existing separate mobile hero.
          ---------------------------------------------------- */
          .inkMobileHero .inkMobileHero__buttons--three {
            position: relative;
            inset: auto;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            width: calc(100% - 36px);
            max-width: 540px;
            margin: 16px auto 0;
            padding: 0;
            gap: 9px;
            box-sizing: border-box;
            z-index: 25;
          }
          .inkMobileHero .inkMobileHero__artistTextLink {
            margin: 0 0 8px;
            font-size: clamp(15px, 4.2vw, 20px);
            letter-spacing: .1em;
          }
          .inkMobileHero .inkActionCard {
            width: 100%;
            height: 72px;
            min-height: 72px;
            padding: 11px 15px;
            gap: 13px;
          }
          .inkMobileHero .inkActionCard__icon { width: 35px; height: 35px; }
          .inkMobileHero .inkActionCard__icon svg { width: 30px; height: 30px; }
          .inkMobileHero .inkActionCard__title { font-size: clamp(10px, 3vw, 13px); }
          .inkMobileHero .inkActionCard__subtitle { font-size: clamp(9px, 2.65vw, 11px); }
          .inkMobileHero .inkActionCard__arrow svg { width: 19px; height: 19px; }

          @media (max-width: 1199px) {
            .inkHero--repositionedActions .inkHero__categoryActionRow {
              max-width: calc(100vw - 80px);
            }
            .inkHero--repositionedActions .inkHero__categoryActionRow .inkHero__categories { gap: 14px; }
            .inkHero--repositionedActions .inkHero__actionArea { gap: 17px; }
          }
          @media (max-width: 390px) {
            .inkMobileHero .inkMobileHero__buttons--three { width: calc(100% - 26px); }
            .inkMobileHero .inkActionCard { padding: 10px 12px; gap: 8px; }
            .inkMobileHero .inkActionCard__icon { width: 29px; }
            .inkMobileHero .inkActionCard__icon svg { width: 26px; height: 26px; }
            .inkMobileHero .inkActionCard__title { font-size: 10px; }
            .inkMobileHero .inkActionCard__subtitle { font-size: 9px; }
          }
        `}</style>
        {/* IMAGE 5 — TATTOO WALL / EXPO BOOTHS */}
        <div className="inkHero__wall" aria-hidden="true">
          <img src={HERO_WALL} alt="" />
        </div>

        {/* IMAGE 3 — EXPO CROWD / STAGE */}
        <div className="inkHero__expo" aria-hidden="true">
          <img src={HERO_EXPO} alt="" />
        </div>

        {/* IMAGE 4 — PURPLE / BLACK GRUNGE */}
        <div className="inkHero__grunge" aria-hidden="true">
          <img src={HERO_GRUNGE} alt="" />
        </div>

        {/* CINEMATIC COLOR / DEPTH */}
        <div className="inkHero__purpleGlow" aria-hidden="true" />
        <div className="inkHero__stageGlow" aria-hidden="true" />
        <div className="inkHero__darkOverlay" aria-hidden="true" />
        <div className="inkHero__noise" aria-hidden="true" />

        {/* IMAGE 2 — TATTOO ARTIST BEHIND MAIN GIRL */}
        <div className="inkHero__tattooArtist" aria-hidden="true">
          <img src={HERO_TATTOO} alt="" />
        </div>

        {/* IMAGE 1 — MAIN GIRL */}
        <div className="inkHero__girl">
          <img src={HERO_GIRL} alt="Tattoo artist" />
        </div>

        {/* LEFT CONTENT */}
        <div ref={contentRef} className="inkHero__content">
          <div className="inkHero__eyebrow">
            <span>REAL ART</span>
            <span>REAL ARTISTS</span>
            <span>ONE COMMUNITY</span>
            <i />
          </div>

          <img
            src={HERO_TITLE}
            alt="INKCONVENTION"
            className="inkHero__titleImage"
          />

          <div className="inkHero__categoryActionRow">
            <div className="inkHero__categories">
              <span>TATTOO</span>
              <b>/</b>
              <span>ART</span>
              <b>/</b>
              <span>CULTURE</span>
              <b>/</b>
              <span>MUSIC</span>
            </div>
          </div>
        </div>

        {/* STYLISH ARTISTS TEXT ABOVE THREE EQUAL HERO BUTTONS */}
        <div className="inkHero__actionArea">
          <Link to="/artists" className="inkHero__artistTextLink">
            FIND YOUR ARTISTS
            <HeroArrowSvg />
          </Link>

          <div className="inkHero__bottomActions">
            <Link
              to="/stall-booking"
              className="inkActionCard inkActionCard--stall"
            >
              <span className="inkActionCard__icon">
                <StallSvgIcon />
              </span>
              <span className="inkActionCard__copy">
                <span className="inkActionCard__title">
                  BOOK YOUR STALL NOW
                </span>
                <span className="inkActionCard__subtitle">FOR RAJASTHAN</span>
              </span>
              <span className="inkActionCard__arrow">
                <HeroArrowSvg />
              </span>
            </Link>

            <Link to="/entry" className="inkActionCard inkActionCard--entry">
              <span className="inkActionCard__icon">
                <TicketSvgIcon />
              </span>
              <span className="inkActionCard__copy">
                <span className="inkActionCard__title">GET ENTRY PASS</span>
                <span className="inkActionCard__subtitle">RAJASTHAN</span>
              </span>
              <span className="inkActionCard__arrow">
                <HeroArrowSvg />
              </span>
            </Link>

            <Link
              to="/Enter"
              className="inkActionCard inkActionCard--directory"
            >
              <span className="inkActionCard__icon">
                <DirectorySvgIcon />
              </span>
              <span className="inkActionCard__copy">
                <span className="inkActionCard__title">
                  JOIN DIRECTORY FREE
                </span>
                <span className="inkActionCard__subtitle">
                  FOR ARTISTS ONLY
                </span>
              </span>
              <span className="inkActionCard__arrow">
                <HeroArrowSvg />
              </span>
            </Link>
          </div>
        </div>

        <img
          src={HERO_MORE_THAN_INK}
          alt="More Than Ink"
          className="inkHero__moreInk"
        />

        <div className="inkHero__scroll" aria-hidden="true">
          <span>SCROLL DOWN</span>
          <div className="inkHero__scrollLine">
            <i />
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE HERO — SEPARATE COMPOSITION
          The navbar stays outside Home.jsx.
      ===================================================== */}

      <section className="inkMobileHero">
        {/* BACKGROUND / WALL */}
        <div className="inkMobileHero__wall" aria-hidden="true">
          <img src={HERO_WALL} alt="" />
        </div>

        {/* GRUNGE */}
        <div className="inkMobileHero__grunge" aria-hidden="true">
          <img src={HERO_GRUNGE} alt="" />
        </div>

        <div className="inkMobileHero__glow" aria-hidden="true" />
        <div className="inkMobileHero__overlay" aria-hidden="true" />

        {/* BRUSH TITLE FIRST */}
        <img
          src={HERO_TITLE}
          alt="INKCONVENTION"
          className="inkMobileHero__title"
        />

        {/* MAIN VISUAL SCENE — mobile woman right + tattoo copy left */}
        <div className="inkMobileHero__scene">
          <div className="inkMobileHero__tattooArtist" aria-hidden="true">
            <img src={HERO_TATTOO} alt="" />
          </div>

          <div className="inkMobileHero__girl">
            <img src={HERO_GIRL} alt="Tattoo artist" />
          </div>

          {/* MOBILE ONLY — tattoo-focused copy on the left */}
          <div className="inkMobileHero__sideText">
            <span className="inkMobileHero__sideKicker">
              INDIA'S TATTOO CULTURE
            </span>

            <h2 className="inkMobileHero__sideHeading">
              REAL ART.
              <br />
              REAL ARTISTS.
              <br />
              <em>ONE COMMUNITY.</em>
            </h2>

            <div className="inkMobileHero__sideDivider" aria-hidden="true" />

            {/* MOBILE ONLY — upcoming event text link (not a button) */}
            <Link
              to="/upcoming"
              className="inkMobileHero__eventLink"
              aria-label="View upcoming Ink Convention event in Rajasthan"
            >
              <span className="inkMobileHero__eventLabel">UPCOMING EVENT</span>

              <strong className="inkMobileHero__eventState">RAJASTHAN</strong>

              <span className="inkMobileHero__eventDetails">
                FIND ALL DETAILS • CLICK HERE
                <ArrowRight size={13} strokeWidth={2} />
              </span>
            </Link>
          </div>

          <div className="inkMobileHero__expo" aria-hidden="true">
            <img src={HERO_EXPO} alt="" />
          </div>
        </div>

        {/* CATEGORIES BELOW THE IMAGE COMPOSITION */}
        <div className="inkMobileHero__categories">
          <span>TATTOO</span>
          <b>/</b>
          <span>ART</span>
          <b>/</b>
          <span>CULTURE</span>
          <b>/</b>
          <span>MUSIC</span>
        </div>

        {/* MOBILE: ARTISTS TEXT ABOVE THREE IDENTICAL-SIZE SVG BUTTONS */}
        <div className="inkMobileHero__buttons inkMobileHero__buttons--three">
          <Link to="/artists" className="inkMobileHero__artistTextLink">
            FIND YOUR ARTISTS
            <HeroArrowSvg />
          </Link>

          <Link
            to="/stall-booking"
            className="inkActionCard inkActionCard--stall"
          >
            <span className="inkActionCard__icon">
              <StallSvgIcon />
            </span>
            <span className="inkActionCard__copy">
              <span className="inkActionCard__title">BOOK YOUR STALL NOW</span>
              <span className="inkActionCard__subtitle">FOR RAJASTHAN</span>
            </span>
            <span className="inkActionCard__arrow">
              <HeroArrowSvg />
            </span>
          </Link>

          <Link to="/entry" className="inkActionCard inkActionCard--entry">
            <span className="inkActionCard__icon">
              <TicketSvgIcon />
            </span>
            <span className="inkActionCard__copy">
              <span className="inkActionCard__title">GET ENTRY PASS</span>
              <span className="inkActionCard__subtitle">RAJASTHAN</span>
            </span>
            <span className="inkActionCard__arrow">
              <HeroArrowSvg />
            </span>
          </Link>

          <Link to="/Enter" className="inkActionCard inkActionCard--directory">
            <span className="inkActionCard__icon">
              <DirectorySvgIcon />
            </span>
            <span className="inkActionCard__copy">
              <span className="inkActionCard__title">JOIN DIRECTORY FREE</span>
              <span className="inkActionCard__subtitle">FOR ARTISTS ONLY</span>
            </span>
            <span className="inkActionCard__arrow">
              <HeroArrowSvg />
            </span>
          </Link>
        </div>

        <div className="inkMobileHero__scroll" aria-hidden="true">
          <div className="inkMobileHero__mouse">
            <i />
          </div>
          <span>SCROLL DOWN</span>
        </div>
      </section>

      {/* =====================================================
          2. VISION
      ===================================================== */}

      <section
        className="
          w-full
          py-28
          px-6
          sm:px-10
          lg:px-12
          bg-[#08080a]
          flex
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        <div
          className="
            max-w-4xl
            mx-auto
            space-y-6
            flex
            flex-col
            items-center
          "
        >
          <h3
            className="
              text-[#a855f7]
              font-mono
              text-xs
              sm:text-sm
              tracking-[0.3em]
              uppercase
              font-semibold
            "
          >
            // BUILT FOR TATTOO ARTISTS
          </h3>

          <h2
            className="
              text-3xl
              sm:text-5xl
              font-black
              tracking-tight
              leading-tight
              text-white
            "
          >
            ONE NETWORK FOR ARTISTS, STUDIOS, EXPO & COMPETITION
          </h2>

          <p
            className="
              text-gray-400
              text-sm
              sm:text-lg
              font-light
              max-w-3xl
              leading-relaxed
            "
          >
            Ink Convention connects tattoo artists, studios, clients and
            industry brands through one growing ecosystem. Artists can create a
            directory listing, improve their local visibility, join regional
            three-day expos, book stalls and enter the tattoo competition.
          </p>

          <Link
            to="/about"
            className="
              mt-4
              text-[#a855f7]
              hover:text-white
              flex
              items-center
              gap-2
              font-mono
              text-xs
              tracking-widest
              uppercase
              transition-colors
            "
          >
            DISCOVER INK CONVENTION
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          3. FOUR WAYS TO JOIN
      ===================================================== */}

      <section
        className="
          relative
          w-full
          py-12
          lg:py-10
          px-5
          sm:px-8
          lg:px-10
          bg-[#0b0b0f]
          border-t
          border-white/5
          overflow-hidden
        "
      >
        {/* BACKGROUND IMAGE BEHIND THE 4 CARDS */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={HOME}
            alt=""
            aria-hidden="true"
            className="
              w-full
              h-full
              object-cover
              object-center
              opacity-75
              scale-105
            "
          />

          {/* DARK OVERLAY - keeps all card text readable */}
          <div className="absolute inset-0 bg-black/30" />

          {/* SOFT GRADIENT OVERLAY */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-b
              from-[#08080a]/35
              via-transparent
              to-[#08080a]/55
            "
          />
        </div>

        <div className="relative z-10 max-w-[1560px] mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-8 lg:mb-7">
            <h4
              className="
                text-[#a855f7]
                font-mono
                text-xs
                sm:text-sm
                tracking-[0.3em]
                uppercase
                font-semibold
              "
            >
              // CHOOSE HOW YOU WANT TO JOIN
            </h4>

            <h2
              className="
                text-3xl
                sm:text-4xl
                font-black
                tracking-tight
                text-white
                uppercase
                mt-3
              "
            >
              FOUR WAYS TO BE PART OF INK CONVENTION
            </h2>

            <p
              className="
                text-gray-400
                text-sm
                sm:text-sm
                leading-relaxed
                max-w-2xl
                mx-auto
                mt-3
              "
            >
              Explore upcoming expo stall opportunities, book a tattoo artist,
              enter the Ink Convention competition, or claim your artist
              profile.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-4
              2xl:gap-5
            "
          >
            {/* 01 / BOOK STALL */}

            <article
              className="
                group
                flex
                flex-col
                relative
                overflow-hidden
                min-h-[360px]
                rounded-3xl
                border
                border-white/10
                bg-[#08080a]/78
                backdrop-blur-[2px]
                p-4
                sm:p-5
                hover:border-white/20
                transition-all
                duration-500
                hover:-translate-y-2
              "
            >
              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  w-48
                  h-48
                  rounded-full
                  bg-white/[0.04]
                  blur-3xl
                  pointer-events-none
                "
              />

              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-white
                  text-black
                  flex
                  items-center
                  justify-center
                "
              >
                <Store size={19} />
              </div>

              <p
                className="
                  mt-4
                  text-[8px]
                  font-mono
                  tracking-[0.18em]
                  text-gray-600
                "
              >
                01 / EXHIBIT
              </p>

              <h3
                className="
                  text-xl
                  2xl:text-2xl
                  font-black
                  uppercase
                  mt-1.5
                  leading-tight
                "
              >
                BOOK YOUR STALL
              </h3>

              <p
                className="
                  text-[11px]
                  2xl:text-xs
                  text-gray-400
                  leading-[1.55]
                  mt-2
                "
              >
                Stall booking is available through your verified artist profile.
                Follow the steps below to access your artist account securely.
              </p>

              <div
                className="
                  mt-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.035]
                  p-3
                  sm:p-3.5
                "
              >
                <p
                  className="
                    text-[8px]
                    font-mono
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-white
                  "
                >
                  HOW TO ACCESS STALL BOOKING
                </p>

                <div className="mt-3 space-y-2.5">
                  {[
                    {
                      number: "01",
                      title: "OPEN ARTISTS",
                      text: "Go to the Artists page from the website.",
                    },
                    {
                      number: "02",
                      title: "FIND YOUR PROFILE",
                      text: "Search your name or city and find your artist profile.",
                    },
                    {
                      number: "03",
                      title: "CLICK VIEW",
                      text: "Open your full artist profile by clicking View.",
                    },
                    {
                      number: "04",
                      title: "MANAGE PROFILE",
                      text: "Click Manage Profile and continue with owner verification.",
                    },
                    {
                      number: "05",
                      title: "VERIFY WITH OTP",
                      text: "Enter the OTP sent to your registered mobile number.",
                    },
                    {
                      number: "06",
                      title: "BOOK YOUR STALL",
                      text: "After verification, open your artist dashboard and choose Book Your Stall.",
                    },
                  ].map((step) => (
                    <div
                      key={step.number}
                      className="
                        grid
                        grid-cols-[30px_minmax(0,1fr)]
                        gap-2.5
                        items-start
                      "
                    >
                      <span
                        className="
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-white/15
                          bg-white/[0.05]
                          text-[8px]
                          font-black
                          font-mono
                          text-white
                        "
                      >
                        {step.number}
                      </span>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[8px]
                            font-black
                            font-mono
                            tracking-wider
                            text-white
                          "
                        >
                          {step.title}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            2xl:text-[11px]
                            leading-[1.4]
                            text-gray-500
                          "
                        >
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p
                className="
                  mt-auto
                  pt-3
                  text-[8px]
                  font-mono
                  uppercase
                  tracking-[0.12em]
                  text-gray-600
                "
              >
                Your profile must be verified by OTP before owner-only options
                are shown.
              </p>
            </article>

            {/* 02 / BOOK ARTISTS */}

            <article
              className="
                group
                flex
                flex-col
                relative
                overflow-hidden
                min-h-[360px]
                rounded-3xl
                border
                border-[#a855f7]/40
                bg-gradient-to-b
                from-[#a855f7]/15
                to-[#08080a]/78
                backdrop-blur-[2px]
                p-4
                sm:p-5
                hover:border-[#a855f7]
                transition-all
                duration-500
                hover:-translate-y-2
              "
            >
              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  w-48
                  h-48
                  rounded-full
                  bg-[#a855f7]/15
                  blur-3xl
                  pointer-events-none
                "
              />

              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-[#a855f7]
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_30px_rgba(168,85,247,0.25)]
                "
              >
                <Trophy size={19} />
              </div>

              <p
                className="
                  mt-4
                  text-[8px]
                  font-mono
                  tracking-[0.18em]
                  text-[#a855f7]
                "
              >
                02 / DISCOVER
              </p>

              <h3
                className="
                  text-xl
                  2xl:text-2xl
                  font-black
                  uppercase
                  mt-1.5
                  leading-tight
                "
              >
                BOOK TATTOO ARTISTS
              </h3>

              <p
                className="
                  text-[11px]
                  2xl:text-xs
                  text-gray-400
                  leading-[1.55]
                  mt-2
                "
              >
                Browse artists by city and tattoo style, compare profiles and
                send a booking request directly. Booking through Ink Convention
                can also unlock exclusive client benefits.
              </p>
              {/* ARTIST BOOKING BENEFIT */}

              <div
                className="
                  mt-2.5
                  rounded-xl
                  border
                  border-[#a855f7]/30
                  bg-[#a855f7]/10
                  px-3
                  py-2.5
                "
              >
                <p
                  className="
                    text-[8px]
                    font-mono
                    font-black
                    uppercase
                    tracking-widest
                    text-[#c084fc]
                  "
                >
                  EXCLUSIVE BOOKING BENEFITS
                </p>

                <p
                  className="
                    mt-1.5
                    text-[10px]
                    2xl:text-[11px]
                    text-gray-500
                    leading-relaxed
                  "
                >
                  Discover artists now and access more booking tools and client
                  benefits as Ink Convention grows.
                </p>
              </div>

              <div className="space-y-1 mt-2.5">
                <StepLine text="Choose your tattoo style" accent />
                <StepLine text="Find artists in your city" accent />
                <StepLine text="Send your booking request" accent />
              </div>

              <Link
                to="/artists"
                className="
                  mt-auto
                  w-full
                  bg-[#a855f7]
                  hover:bg-[#9333ea]
                  text-white
                  px-4
                  py-2.5
                  rounded-xl
                  font-black
                  text-[10px]
                  font-mono
                  tracking-widest
                  uppercase
                  flex
                  items-center
                  justify-between
                  transition-all
                "
              >
                BOOK ARTISTS
                <ArrowRight
                  size={15}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </article>

            {/* 03 / COMPETITION */}

            <article
              className="
                group
                flex
                flex-col
                relative
                overflow-hidden
                min-h-[360px]
                rounded-3xl
                border
                border-amber-400/30
                bg-gradient-to-b
                from-amber-400/[0.10]
                to-[#08080a]/78
                backdrop-blur-[2px]
                p-4
                sm:p-5
                hover:border-amber-300/70
                transition-all
                duration-500
                hover:-translate-y-2
              "
            >
              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  w-48
                  h-48
                  rounded-full
                  bg-amber-400/10
                  blur-3xl
                  pointer-events-none
                "
              />

              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-amber-400/10
                  border
                  border-amber-300/20
                  text-amber-300
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_30px_rgba(251,191,36,0.10)]
                "
              >
                <Medal size={19} />
              </div>

              <p
                className="
                  mt-4
                  text-[8px]
                  font-mono
                  tracking-[0.18em]
                  text-amber-300
                "
              >
                03 / COMPETE
              </p>

              <h3
                className="
                  text-xl
                  2xl:text-2xl
                  font-black
                  uppercase
                  mt-1.5
                  leading-tight
                "
              >
                ENTER THE COMPETITION
              </h3>

              <p
                className="
                  text-[11px]
                  2xl:text-xs
                  text-gray-400
                  leading-[1.55]
                  mt-2
                "
              >
                Enter your strongest tattoo work across seven categories, earn
                ranking points and compete for Ink Convention recognition and
                Hall of Fame placement.
              </p>

              <div
                className="
                  mt-2.5
                  rounded-xl
                  border
                  border-amber-300/20
                  bg-amber-400/[0.06]
                  px-3
                  py-2.5
                "
              >
                <p
                  className="
                    text-[8px]
                    font-mono
                    font-black
                    uppercase
                    tracking-widest
                    text-amber-300
                  "
                >
                  7 CATEGORIES • FLEXIBLE ENTRY PACKAGES
                </p>

                <p
                  className="
                    mt-1.5
                    text-[10px]
                    2xl:text-[11px]
                    text-gray-500
                    leading-relaxed
                  "
                >
                  1 entry ₹999 • 3 entries ₹1,499 • 5 entries ₹1,999. Choose the
                  categories that match your best work and build ranking points.
                </p>
              </div>

              <div className="space-y-1 mt-2.5">
                <StepLine text="Choose from seven competition categories" />
                <StepLine text="Select your entry package and submit your work" />
                <StepLine text="Earn points and climb the artist rankings" />
              </div>

              <Link
                to="/competition"
                className="
                  mt-auto
                  w-full
                  border
                  border-amber-300/50
                  hover:bg-amber-300/10
                  text-white
                  px-4
                  py-2.5
                  rounded-xl
                  font-black
                  text-[10px]
                  font-mono
                  tracking-widest
                  uppercase
                  flex
                  items-center
                  justify-between
                  transition-all
                "
              >
                ENTER COMPETITION
                <ArrowRight
                  size={15}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </article>

            {/* 04 / FREE DIRECTORY */}

            <article
              className="
                group
                flex
                flex-col
                relative
                overflow-hidden
                min-h-[360px]
                rounded-3xl
                border
                border-purple-500/20
                bg-[#08080a]/78
                backdrop-blur-[2px]
                p-4
                sm:p-5
                hover:border-purple-500/60
                transition-all
                duration-500
                hover:-translate-y-2
              "
            >
              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  w-48
                  h-48
                  rounded-full
                  bg-purple-500/10
                  blur-3xl
                  pointer-events-none
                "
              />

              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-purple-500/10
                  border
                  border-purple-500/20
                  text-purple-400
                  flex
                  items-center
                  justify-center
                "
              >
                <Users size={19} />
              </div>

              <p
                className="
                  mt-4
                  text-[8px]
                  font-mono
                  tracking-[0.18em]
                  text-purple-400
                "
              >
                04 / JOIN FREE
              </p>

              <h3
                className="
                  text-xl
                  2xl:text-2xl
                  font-black
                  uppercase
                  mt-1.5
                  leading-tight
                "
              >
                CLAIM YOUR PROFILE
              </h3>

              <p
                className="
                  text-[11px]
                  2xl:text-xs
                  text-gray-400
                  leading-[1.55]
                  mt-2
                "
              >
                Claim your artist or studio profile and keep your basic Ink
                Convention directory listing free for life.
              </p>
              {/* DIRECTORY MESSAGE */}

              <div
                className="
                  mt-2.5
                  rounded-xl
                  border
                  border-purple-500/30
                  bg-purple-500/10
                  px-3
                  py-2.5
                "
              >
                <p
                  className="
                    text-[8px]
                    font-mono
                    font-black
                    uppercase
                    tracking-widest
                    text-purple-300
                  "
                >
                  BUILD YOUR PROFILE TODAY
                </p>

                <p
                  className="
                    mt-1.5
                    text-[10px]
                    2xl:text-[11px]
                    text-gray-500
                    leading-relaxed
                  "
                >
                  Build your profile, improve visibility and unlock more artist
                  opportunities as Ink Convention grows.
                </p>
              </div>

              <div className="space-y-1 mt-2.5">
                <StepLine text="Find and claim your existing profile" />
                <StepLine text="Verify ownership with OTP" />
                <StepLine text="Keep your basic listing free for life" />
              </div>

              <Link
                to="/Enter"
                className="
                  mt-auto
                  w-full
                  border
                  border-[#a855f7]
                  hover:bg-[#a855f7]/10
                  text-white
                  px-4
                  py-2.5
                  rounded-xl
                  font-black
                  text-[10px]
                  font-mono
                  tracking-widest
                  uppercase
                  flex
                  items-center
                  justify-between
                  transition-all
                "
              >
                CLAIM YOUR PROFILE
                <ArrowRight
                  size={15}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. ARTIST RANKINGS
      ===================================================== */}

      <section
        className="
          w-full
          py-24
          px-6
          sm:px-10
          lg:px-12
          bg-[#050507]
          border-t
          border-white/5
        "
      >
        <div
          className="
            max-w-7xl
            mx-auto
            grid
            grid-cols-1
            md:grid-cols-2
            gap-16
            items-center
          "
        >
          <div className="space-y-6">
            <h4
              className="
                text-[#a855f7]
                font-mono
                text-xs
                sm:text-sm
                tracking-[0.3em]
                uppercase
                font-semibold
              "
            >
              // THE LEADERBOARD
            </h4>

            <h2
              className="
                text-3xl
                sm:text-4xl
                font-black
                tracking-tight
                text-white
                uppercase
              "
            >
              BUILD YOUR INK CONVENTION RANKING
            </h2>

            <p
              className="
                text-gray-400
                font-light
                leading-relaxed
              "
            >
              Your journey doesn’t end when one competition ends. Eligible
              results contribute toward your Ink Convention ranking and annual
              recognition. Compete, score points, and climb the global ladder.
            </p>

            <div className="pt-4"></div>
          </div>

          <div
            className="
              bg-[#08080a]
              border
              border-white/10
              rounded-2xl
              p-6
              shadow-2xl
            "
          >
            <div
              className="
                flex
                justify-between
                items-center
                mb-6
                pb-4
                border-b
                border-white/10
              "
            >
              <h3
                className="
                  font-bold
                  text-white
                  tracking-widest
                  text-sm
                "
              >
                TOP ARTISTS • PREVIEW
              </h3>

              <Star
                size={16}
                className="
                  text-[#a855f7]
                "
              />
            </div>

            <div className="space-y-4">
              {[
                {
                  name: "Ayaan Mirza",
                  pts: 984,
                },
                {
                  name: "Rhea D'Souza",
                  pts: 947,
                },
                {
                  name: "Kabir Sethi",
                  pts: 918,
                },
                {
                  name: "Meher Khan",
                  pts: 889,
                },
                {
                  name: "Arjun Rao",
                  pts: 864,
                },
              ].map((artist, index) => (
                <div
                  key={index}
                  className="
                      flex
                      justify-between
                      items-center
                      bg-[#050507]
                      p-4
                      rounded-lg
                      border
                      border-white/5
                    "
                >
                  <div
                    className="
                        flex
                        items-center
                        gap-4
                      "
                  >
                    <span
                      className={`
                          text-sm
                          font-black
                          font-mono
                          w-6

                          ${index < 3 ? "text-[#a855f7]" : "text-gray-600"}
                        `}
                    >
                      {index + 1}.
                    </span>

                    <span
                      className="
                          text-sm
                          font-medium
                          text-white
                        "
                    >
                      {artist.name}
                    </span>
                  </div>

                  <span
                    className="
                        text-xs
                        font-mono
                        text-gray-400
                      "
                  >
                    {artist.pts} PTS
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          5. HALL OF FAME
      ===================================================== */}

      <section
        className="
          w-full
          py-32
          px-6
          sm:px-10
          lg:px-12
          bg-gradient-to-b
          from-[#050507]
          to-[#08080a]
          border-t
          border-white/5
          text-center
        "
      >
        <div
          className="
            max-w-3xl
            mx-auto
            space-y-6
          "
        >
          <LayoutGrid
            size={40}
            className="
              mx-auto
              text-gray-600
              mb-4
            "
          />

          <h2
            className="
              text-3xl
              sm:text-4xl
              font-black
              tracking-tight
              text-white
              uppercase
            "
          >
            INK CONVENTION HALL OF FAME
          </h2>

          <p
            className="
              text-gray-400
              font-light
              mb-8
            "
          >
            Celebrating the artists who reached the top.
          </p>

          <div
            className="
              py-12
              border
              border-dashed
              border-white/10
              rounded-2xl
              bg-white/5
            "
          >
            <h3
              className="
                text-xl
                font-bold
                tracking-widest
                text-gray-400
              "
            >
              THE FIRST CHAMPIONS WILL BE HERE
            </h3>

            <p
              className="
                text-sm
                text-gray-500
                mt-2
                font-light
              "
            >
              Results will be published after the judging phase concludes.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          6. SPONSORS
      ===================================================== */}

      <section
        className="
          w-full
          py-24
          px-6
          sm:px-10
          lg:px-12
          bg-[#0b0b0f]
          border-t
          border-white/5
          text-center
        "
      >
        <div
          className="
            max-w-3xl
            mx-auto
            space-y-8
          "
        >
          <h2
            className="
              text-2xl
              sm:text-3xl
              font-black
              tracking-tight
              text-white
              uppercase
            "
          >
            PARTNER WITH INK CONVENTION
          </h2>

          <p
            className="
              text-gray-400
              font-light
              leading-relaxed
            "
          >
            Connect your brand with tattoo artists, studios, tattoo enthusiasts
            and the rapidly growing global tattoo industry.
          </p>
        </div>
      </section>

      {/* =====================================================
          7. FAQ
      ===================================================== */}

      <section
        className="
          w-full
          py-24
          px-6
          sm:px-10
          lg:px-12
          bg-[#08080a]
          border-t
          border-white/5
        "
      >
        <div
          className="
            max-w-4xl
            mx-auto
            space-y-12
          "
        >
          <h2
            className="
              text-3xl
              sm:text-4xl
              font-black
              tracking-tight
              text-white
              uppercase
              text-center
            "
          >
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "How do I join the artist directory?",
                a: "Create your artist or studio profile and choose the Lifetime Free listing. You can upgrade to Pro or Verified Spotlight later.",
              },
              {
                q: "When will stall booking be available?",
                a: "Stall booking is being prepared. Soon you will be able to choose an expo city, explore stall options and reserve your space directly through Ink Convention.",
              },
              {
                q: "What stall options will be available?",
                a: "Different stall options and visibility levels are planned. Full booking details will be announced when stall bookings open.",
              },
              {
                q: "How do I enter the tattoo competition?",
                a: "Open the competition form, choose from the seven categories and select 1 entry for ₹999, 3 entries for ₹1,499 or 5 entries for ₹1,999.",
              },
              {
                q: "What is included in the Free directory listing?",
                a: "The Lifetime Free listing includes your basic artist or studio profile. Public contact information stays masked until you upgrade.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="
                    border
                    border-white/10
                    rounded-xl
                    bg-[#050507]
                    overflow-hidden
                  "
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="
                      w-full
                      flex
                      justify-between
                      items-center
                      p-6
                      text-left
                      focus:outline-none
                    "
                >
                  <span
                    className="
                        font-bold
                        text-white
                        text-sm
                        sm:text-base
                      "
                  >
                    {faq.q}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`
                        text-[#a855f7]
                        transition-transform
                        duration-300

                        ${activeFaq === index ? "rotate-180" : ""}
                      `}
                  />
                </button>

                {activeFaq === index && (
                  <div
                    className="
                        px-6
                        pb-6
                        text-gray-400
                        text-sm
                        font-light
                        leading-relaxed
                      "
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StepLine({ text, accent = false }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`
          mt-1
          w-1.5
          h-1.5
          rounded-full
          shrink-0
          ${accent ? "bg-[#a855f7]" : "bg-white/30"}
        `}
      />

      <span className="text-[11px] sm:text-xs text-gray-400 leading-[1.45]">
        {text}
      </span>
    </div>
  );
}

export default Home;
