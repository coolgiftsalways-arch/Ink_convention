import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  Globe,
  Award,
  Target,
  Scale,
  Trophy,
  Medal,
  PenTool,
  Star,
  Search,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  Building2,
  ChevronDown,
  ShieldCheck,
  ArrowUpRight,
  Play,
  Eye,
  Crown,
  Handshake,
  Camera,
  BarChart3,
  X,
  ArrowRight,
} from "lucide-react";

import "../Style/About.css";

/* =========================================================
   ABOUT IMAGES
========================================================= */

import heroImage from "../assets/about-ecosystem-bg.png";

import missionImage from "../assets/purple_noir_tattoo_studio.png";

import toolsImage from "../assets/neon_lit_tattoo_artist_workstation.png";

import artistImage from "../assets/purple_backstage_tattoo_portrait.png";

import expoImage from "../assets/neon_tattoo_expo_after_dark.png";

/* =========================================================
   ABOUT
========================================================= */

function About() {
  const beliefCards = [
    {
      icon: PenTool,
      title: "ART FIRST",
      desc: "The quality, creativity and execution of the tattoo should remain at the centre of the competition.",
    },

    {
      icon: Scale,
      title: "FAIR COMPETITION",
      desc: "Artists should understand how their work is evaluated and what standards they are competing against.",
    },

    {
      icon: Medal,
      title: "RECOGNITION MATTERS",
      desc: "Awards, rankings and documented achievements can help artists build long-term professional credibility.",
    },

    {
      icon: Search,
      title: "TALENT SHOULD BE DISCOVERABLE",
      desc: "Great artists should be easier to discover regardless of their location, follower count or studio size.",
    },
  ];

  const journey = [
    {
      step: "COMPETITION",
      desc: "Artists submit their work.",
    },

    {
      step: "JUDGING",
      desc: "Entries evaluated by criteria.",
    },

    {
      step: "RESULTS",
      desc: "Finalists & winners recognised.",
    },

    {
      step: "RANKING",
      desc: "Results build artist rankings.",
    },

    {
      step: "DISCOVERY",
      desc: "Artists build profiles.",
    },

    {
      step: "NEXT COMPETITION",
      desc: "Artists return to compete.",
    },
  ];

  const ecosystemCards = [
    {
      icon: PenTool,
      title: "ARTISTS",
      desc: "Compete, build profiles and earn recognition.",
    },

    {
      icon: ShieldCheck,
      title: "JUDGES",
      desc: "Provide professional evaluation and industry credibility.",
    },

    {
      icon: Users,
      title: "AUDIENCE",
      desc: "Discover artists, follow competitions and participate in People’s Choice activities where applicable.",
    },

    {
      icon: Briefcase,
      title: "BRANDS",
      desc: "Connect with the tattoo-art community through partnerships and sponsorship opportunities.",
    },
  ];

  const audienceCards = [
    {
      icon: PenTool,
      title: "TATTOO ARTISTS",
      desc: "For artists who want to compete, build recognition and showcase their work.",
    },

    {
      icon: Building2,
      title: "STUDIOS",
      desc: "For studios looking to highlight their artists and achievements.",
    },

    {
      icon: Heart,
      title: "TATTOO ENTHUSIASTS",
      desc: "For people who want to discover exceptional tattoo work and artists.",
    },

    {
      icon: Briefcase,
      title: "INDUSTRY BRANDS",
      desc: "For companies looking to connect with tattoo professionals and the wider tattoo community.",
    },
  ];

  const exhibitBenefits = [
    {
      number: "01",
      icon: Eye,
      title: "VISIBILITY",
      text: "Put your art in front of thousands of real tattoo lovers.",
      tone: "purple",
      modalTitle: "PUT YOUR ART WHERE PEOPLE CAN SEE IT.",
      modalIntro:
        "A stall gives your work a real-world stage. Instead of depending only on social-media reach, you can show your portfolio directly to people who already care about tattoo culture.",
      details: [
        "Showcase your strongest tattoo work and signature style.",
        "Meet tattoo enthusiasts and potential clients face-to-face.",
        "Make your artist or studio name easier to remember.",
        "Turn Expo attention into profile visits, enquiries and future bookings.",
      ],
    },
    {
      number: "02",
      icon: Users,
      title: "GET CLIENTS",
      text: "Meet potential clients, get enquiries and build future bookings.",
      tone: "pink",
      modalTitle: "TURN VISITORS INTO FUTURE CLIENTS.",
      modalIntro:
        "People can see your portfolio, understand your style and speak with you directly. That personal interaction can make it easier for an interested visitor to become a genuine enquiry or future appointment.",
      details: [
        "Speak directly with people already interested in tattoos.",
        "Take enquiries and promote future appointment slots.",
        "Use booking or Instagram QR codes at your stall.",
        "Offer Expo-only packages where your event rules allow it.",
      ],
    },
    {
      number: "03",
      icon: Crown,
      title: "BUILD YOUR BRAND",
      text: "Showcase your studio, style and story as a professional brand.",
      tone: "orange",
      modalTitle: "BUILD MORE THAN A PORTFOLIO. BUILD A BRAND.",
      modalIntro:
        "Your stall can communicate who you are before you even start a conversation. Present your studio professionally and give visitors a clear reason to remember your work after the Expo.",
      details: [
        "Display your studio branding, artist profile and specialisations.",
        "Show awards, certifications and selected client testimonials.",
        "Add Instagram, website and booking QR codes.",
        "Create a stronger professional identity beyond individual posts.",
      ],
    },
    {
      number: "04",
      icon: Handshake,
      title: "NETWORKING",
      text: "Connect with artists, studios, brands and industry professionals from across India.",
      tone: "green",
      modalTitle: "MEET THE PEOPLE SHAPING THE TATTOO INDUSTRY.",
      modalIntro:
        "The Expo brings the tattoo ecosystem into one place. A conversation at your stall can lead to a guest spot, collaboration, supplier relationship, brand connection or long-term professional friendship.",
      details: [
        "Meet tattoo artists and studio owners from different cities.",
        "Connect with ink, equipment and aftercare brands.",
        "Meet photographers, creators and potential collaborators.",
        "Build relationships that continue after the event.",
      ],
    },
    {
      number: "05",
      icon: Trophy,
      title: "COMPETE",
      text: "Participate in tattoo competitions, showcase your craft and earn recognition.",
      tone: "blue",
      modalTitle: "PUT YOUR SKILLS TO THE TEST.",
      modalIntro:
        "Competition gives artists another way to present their craft. Enter eligible categories, have your work evaluated and use strong results as part of your professional portfolio.",
      details: [
        "Enter specialist tattoo competition categories.",
        "Show your work in a structured judging environment.",
        "Earn trophies, certificates or recognition where applicable.",
        "Use results and event content to strengthen your portfolio.",
      ],
    },
    {
      number: "06",
      icon: Camera,
      title: "CONTENT",
      text: "Create photos, Reels and videos that keep working for your brand after the Expo.",
      tone: "violet",
      modalTitle: "ONE STALL. DAYS OF CONTENT.",
      modalIntro:
        "Your Expo presence can create much more than one post. Capture your setup, artwork, live moments, collaborations and conversations, then reuse that content across your social channels.",
      details: [
        "Create Reels, photos and behind-the-scenes videos.",
        "Capture live demonstrations and artist interactions.",
        "Collaborate with other artists and content creators.",
        "Keep using Expo content long after the event ends.",
      ],
    },
    {
      number: "07",
      icon: BarChart3,
      title: "BUSINESS",
      text: "Launch new work, promote your studio and generate real business opportunities.",
      tone: "gold",
      modalTitle: "GROW YOUR STUDIO BEYOND INSTAGRAM.",
      modalIntro:
        "Use your stall as a business touchpoint. Introduce new work, generate leads and show visitors what they can book or buy from you, subject to the Expo and venue rules.",
      details: [
        "Promote future studio bookings and tattoo packages.",
        "Launch new flash sheets, styles or collaborations.",
        "Show artwork, prints or permitted merchandise.",
        "Create new professional and commercial opportunities.",
      ],
    },
    {
      number: "08",
      icon: Heart,
      title: "BE PART OF IT",
      text: "Join Rajasthan's tattoo community, meet the industry and help grow the culture.",
      tone: "rose",
      modalTitle: "DON'T JUST WATCH THE INDUSTRY GROW — BE PART OF IT.",
      modalIntro:
        "An Expo is also about community. Being present puts you inside the conversations, collaborations and creative energy that help the tattoo scene grow.",
      details: [
        "Meet artists and tattoo lovers in a shared creative space.",
        "Take part in the culture instead of only following it online.",
        "Create memorable real-world connections.",
        "Represent your city, studio and artistic style at the Expo.",
      ],
    },
  ];

  const [pageIntroReady, setPageIntroReady] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [modalPhase, setModalPhase] = useState("closed");
  const [smokeGeometry, setSmokeGeometry] = useState(null);
  const [smokeSource, setSmokeSource] = useState({ x: 0, y: 0 });

  const readCursorRef = useRef(null);
  const modalRef = useRef(null);
  const closeTimerRef = useRef(null);

  const makeSmokePath = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.max(Math.hypot(dx, dy), 1);

    // Perpendicular vector for a gentle S-shaped "genie smoke" curve.
    const nx = -dy / distance;
    const ny = dx / distance;
    const bend = Math.min(90, Math.max(34, distance * 0.14));

    const c1 = {
      x: start.x + dx * 0.32 + nx * bend,
      y: start.y + dy * 0.32 + ny * bend,
    };

    const c2 = {
      x: start.x + dx * 0.68 - nx * bend,
      y: start.y + dy * 0.68 - ny * bend,
    };

    return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
  };

  const getModalAnchor = (rect, start) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = start.x - centerX;
    const dy = start.y - centerY;

    const horizontal = Math.abs(dx) / Math.max(rect.width, 1);
    const vertical = Math.abs(dy) / Math.max(rect.height, 1);

    if (horizontal > vertical) {
      return {
        x: dx < 0 ? rect.left + 10 : rect.right - 10,
        y: Math.max(rect.top + 70, Math.min(rect.bottom - 70, start.y)),
      };
    }

    return {
      x: Math.max(rect.left + 80, Math.min(rect.right - 80, start.x)),
      y: dy < 0 ? rect.top + 10 : rect.bottom - 10,
    };
  };

  const measureSmoke = () => {
    const modal = modalRef.current;
    if (!modal || !selectedBenefit) return;

    const rect = modal.getBoundingClientRect();
    const end = getModalAnchor(rect, smokeSource);

    setSmokeGeometry({
      width: window.innerWidth,
      height: window.innerHeight,
      path: makeSmokePath(smokeSource, end),
      startX: smokeSource.x,
      startY: smokeSource.y,
      endX: end.x,
      endY: end.y,
    });
  };

  const openBenefit = (item, event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const source = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setSmokeGeometry(null);
    setSmokeSource(source);
    setSelectedBenefit(item);
    setModalPhase("opening");
    hideReadCursor();
  };

  const closeBenefit = () => {
    if (!selectedBenefit || modalPhase === "closing") return;

    setModalPhase("closing");

    closeTimerRef.current = window.setTimeout(() => {
      setSelectedBenefit(null);
      setSmokeGeometry(null);
      setModalPhase("closed");
      closeTimerRef.current = null;
    }, 520);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPageIntroReady(true);
    }, 850);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useLayoutEffect(() => {
    if (!selectedBenefit) return undefined;

    const measure = () => {
      const modal = modalRef.current;
      if (!modal) return;

      const rect = modal.getBoundingClientRect();
      const end = getModalAnchor(rect, smokeSource);

      setSmokeGeometry({
        width: window.innerWidth,
        height: window.innerHeight,
        path: makeSmokePath(smokeSource, end),
        startX: smokeSource.x,
        startY: smokeSource.y,
        endX: end.x,
        endY: end.y,
      });
    };

    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [selectedBenefit, smokeSource.x, smokeSource.y]);

  useEffect(() => {
    if (!selectedBenefit || modalPhase !== "opening") return undefined;

    const timer = window.setTimeout(() => {
      setModalPhase("open");
    }, 430);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedBenefit, modalPhase]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && selectedBenefit) {
        closeBenefit();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    if (selectedBenefit) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedBenefit, modalPhase]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const moveReadCursor = (event) => {
    const cursor = readCursorRef.current;
    if (!cursor) return;

    cursor.style.left = `${event.clientX + 16}px`;
    cursor.style.top = `${event.clientY + 16}px`;
    cursor.classList.add("is-visible");
  };

  const hideReadCursor = () => {
    readCursorRef.current?.classList.remove("is-visible");
  };

  return (
    <div className="about-container w-full bg-[#08080a] text-white select-none overflow-x-hidden font-sans">
      {/* =====================================================
          1. EXPO HERO
      ====================================================== */}

      <section
        className={`expo-showcase ${pageIntroReady ? "intro-ready" : "intro-start"}`}
      >
        {/* IMAGE FIRST IN THE DOM — on mobile it appears first */}
        <div className="expo-showcase__media">
          <img
            src={expoImage}
            alt="Ink Convention tattoo expo"
            className="expo-showcase__image"
          />

          <div className="expo-showcase__overlay expo-showcase__overlay--left" />
          <div className="expo-showcase__overlay expo-showcase__overlay--bottom" />
          <div className="expo-showcase__overlay expo-showcase__overlay--top" />

          <div className="expo-showcase__stamp">
            <span>INKCONVENTION</span>
            <small>RAJASTHAN 2026</small>
          </div>
        </div>

        <div className="expo-showcase__content">
          <p className="expo-showcase__kicker">
            RAJASTHAN&apos;S BIGGEST
            <br />
            TATTOO EXPO
          </p>

          <h1 className="expo-showcase__title">
            <span>YOUR STALL.</span>
            <span className="expo-showcase__title-purple">YOUR ART.</span>
            <span className="expo-showcase__title-small">
              REAL OPPORTUNITIES.
            </span>
          </h1>

          <p className="expo-showcase__intro">
            Don&apos;t just attend the Expo. Put your art, brand and business in
            front of thousands of potential clients, fellow artists and industry
            professionals.
          </p>

          <div className="expo-showcase__stats">
            <div className="expo-showcase__stat">
              <Users size={25} />
              <div>
                <strong>10,000+</strong>
                <span>EXPECTED VISITORS</span>
              </div>
            </div>

            <div className="expo-showcase__stat">
              <Award size={25} />
              <div>
                <strong>500+</strong>
                <span>TATTOO ARTISTS</span>
              </div>
            </div>

            <div className="expo-showcase__stat">
              <Globe size={25} />
              <div>
                <strong>INDIA&apos;S BIGGEST</strong>
                <span>TATTOO EXPO IN RAJASTHAN</span>
              </div>
            </div>
          </div>

          <div className="expo-showcase__actions">
            <Link to="/stall-booking" className="expo-showcase__primary">
              BOOK YOUR STALL
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. WHY EXHIBIT
      ====================================================== */}

      <section
        className={`why-exhibit ${pageIntroReady ? "intro-ready" : "intro-wait"}`}
      >
        <div className="why-exhibit__heading">
          <p className="why-exhibit__eyebrow">
            <span />
            WHY EXHIBIT?
            <span />
          </p>

          <h2>GROW YOUR ART. GROW YOUR BUSINESS.</h2>

          <p className="why-exhibit__sub">
            8 powerful reasons to book your stall at Ink Convention.
          </p>
        </div>

        <div className="why-exhibit__grid">
          {exhibitBenefits.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.number}
                className={`why-card why-card--${item.tone}`}
                onClick={(event) => openBenefit(item, event)}
                onMouseMove={moveReadCursor}
                onMouseEnter={moveReadCursor}
                onMouseLeave={hideReadCursor}
                aria-label={`Read more about ${item.title}`}
              >
                <Icon className="why-card__icon" strokeWidth={2.1} />

                <span className="why-card__number">{item.number}</span>

                <h3>{item.title}</h3>

                <p>{item.text}</p>

                <span className="why-card__mobile-hint">
                  TAP TO READ MORE <ArrowRight size={12} />
                </span>

                <span className="why-card__line" />
              </button>
            );
          })}
        </div>

        <div ref={readCursorRef} className="why-read-cursor" aria-hidden="true">
          CLICK TO READ MORE
          <ArrowRight size={13} />
        </div>
      </section>

      {selectedBenefit && (
        <div
          className={`why-modal-backdrop is-${modalPhase}`}
          role="presentation"
          onMouseDown={closeBenefit}
        >
          {smokeGeometry && (
            <svg
              className={`genie-tail genie-tail--${selectedBenefit.tone} is-${modalPhase}`}
              viewBox={`0 0 ${smokeGeometry.width} ${smokeGeometry.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d={smokeGeometry.path}
                pathLength="1"
                className="genie-tail__path genie-tail__path--soft"
              />

              <path
                d={smokeGeometry.path}
                pathLength="1"
                className="genie-tail__path genie-tail__path--core"
              />

              <circle
                cx={smokeGeometry.startX}
                cy={smokeGeometry.startY}
                r="12"
                className="genie-tail__source"
              />

              <circle
                cx={smokeGeometry.endX}
                cy={smokeGeometry.endY}
                r="8"
                className="genie-tail__anchor"
              />
            </svg>
          )}

          <div
            ref={modalRef}
            className={`why-modal why-modal--${selectedBenefit.tone} is-${modalPhase}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="why-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="why-modal__close"
              onClick={closeBenefit}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="why-modal__topline">
              <span>{selectedBenefit.number}</span>
              <p>WHY EXHIBIT • {selectedBenefit.title}</p>
            </div>

            <div className="why-modal__body">
              <div className="why-modal__headline">
                {React.createElement(selectedBenefit.icon, {
                  className: "why-modal__icon",
                  strokeWidth: 2,
                })}

                <h2 id="why-modal-title">{selectedBenefit.modalTitle}</h2>
                <p>{selectedBenefit.modalIntro}</p>
              </div>

              <div className="why-modal__points">
                {selectedBenefit.details.map((detail, index) => (
                  <div className="why-modal__point" key={detail}>
                    <span>0{index + 1}</span>
                    <p>{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="why-modal__footer">
              <span>INK CONVENTION • RAJASTHAN 2026</span>

              <button
                type="button"
                className="why-modal__cancel"
                onClick={closeBenefit}
              >
                CLOSE
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          3. WHY WE EXIST + OUR MISSION
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* WHY */}

          <div className="space-y-6">
            <h4 className="text-[#a855f7] font-mono text-xs tracking-[0.3em] uppercase font-semibold">
              // WHY INK CONVENTION EXISTS
            </h4>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
              GREAT TATTOO ART DESERVES MORE THAN A LIKE.
            </h2>

            <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
              Social media can give artists visibility, but visibility does not
              always equal recognition. A tattoo may receive thousands of views
              without being evaluated for its technical execution, composition,
              originality or artistic quality.
            </p>

            <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
              Ink Convention was created to build a more meaningful system — one
              where tattoo artists can submit their work, compete within defined
              categories, be evaluated by experienced professionals and build a
              measurable record of achievement.
            </p>

            {/* IMAGE 2 */}

            <div className="relative mt-10 h-[380px] overflow-hidden border border-white/10">
              <img
                src={missionImage}
                alt="Tattoo artist working close-up"
                className="w-full h-full object-cover grayscale-[30%]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          </div>

          {/* MISSION */}

          <div className="space-y-7 bg-[#0b0b0f] p-8 sm:p-12 border border-white/5 shadow-2xl">
            <h4 className="text-[#a855f7] font-mono text-xs tracking-[0.3em] uppercase font-semibold">
              // OUR MISSION
            </h4>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
              BUILD A PLATFORM WHERE TALENT CAN BE MEASURED, RECOGNISED &
              REMEMBERED.
            </h2>

            <p className="text-gray-400 text-base font-light leading-relaxed">
              Our mission is to create a credible and accessible competition
              platform for tattoo artists while building a long-term ecosystem
              around artist recognition, rankings, discovery and creative
              excellence. We want the quality of an artist’s work to matter —
              not simply the size of their audience.
            </p>

            {/* IMAGE 3 */}

            <div className="relative h-[280px] overflow-hidden border border-white/10">
              <img
                src={toolsImage}
                alt="Tattoo machine and equipment"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. WHAT WE BELIEVE
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#050507] border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              WHAT WE BELIEVE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beliefCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={index}
                  className="glass-card bg-[#0b0b0f] border border-white/5 p-8 space-y-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 uppercase">
                      {card.title}
                    </h3>

                    <p className="text-sm text-gray-400 leading-relaxed font-light">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          5. MORE THAN A ONE-TIME CONTEST
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
          {/* IMAGE 4 */}

          <div className="relative min-h-[600px] overflow-hidden border border-white/10">
            <img
              src={artistImage}
              alt="Tattoo artist backstage"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

            <div className="absolute left-7 bottom-7 z-10">
              <span className="text-[#a855f7] font-mono text-[10px] tracking-[0.3em]">
                THE JOURNEY
              </span>
            </div>
          </div>

          {/* CONTENT */}

          <div className="space-y-12">
            <div className="space-y-5">
              <h4 className="text-[#a855f7] font-mono text-xs tracking-[0.3em] uppercase">
                // MORE THAN A CONTEST
              </h4>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
                MORE THAN A ONE-TIME CONTEST.
              </h2>

              <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
                Ink Convention is designed to become an ongoing platform rather
                than a single competition that disappears after the winners are
                announced.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {journey.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="min-h-[140px] border border-white/10 p-5 flex flex-col justify-between bg-white/[0.01]">
                    <span className="text-[9px] text-[#a855f7] font-mono">
                      0{index + 1}
                    </span>

                    <div>
                      <h3 className="text-xs font-bold text-[#a855f7] tracking-widest uppercase">
                        {item.step}
                      </h3>

                      <p className="mt-2 text-[10px] text-gray-500 font-mono">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          6. ECOSYSTEM
      ====================================================== */}

      <section className="relative w-full py-24 px-6 sm:px-10 lg:px-12 border-y border-white/5 overflow-hidden bg-[#07070a]">
        {/* IMAGE 5 BACKGROUND */}

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={expoImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/95 via-[#050507]/80 to-[#050507]/55" />

          <div className="absolute inset-0 bg-gradient-to-b from-[#08080a]/60 via-transparent to-[#08080a]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* LEFT */}

          <div className="space-y-6 max-w-xl">
            <p className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">
              // THE INK CONVENTION ECOSYSTEM
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.04] uppercase">
              BUILDING AN ECOSYSTEM AROUND TATTOO ART
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light max-w-lg">
              Ink Convention brings artists, judges, audiences and industry
              brands into one connected platform built around tattoo culture,
              professional recognition and long-term creative growth.
            </p>

            <div className="w-20 h-[2px] bg-gradient-to-r from-[#a855f7] to-transparent" />
          </div>

          {/* CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ecosystemCards.map((block, index) => {
              const Icon = block.icon;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden min-h-[175px] border border-white/10 bg-black/55 backdrop-blur-md p-6 space-y-4 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#a855f7]/50 hover:bg-black/70"
                >
                  <div className="relative z-10 w-11 h-11 border border-[#a855f7]/20 bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                    <Icon size={22} />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-sm font-black tracking-widest uppercase">
                      {block.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-[13px] text-gray-400 font-light leading-relaxed">
                      {block.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          7. COMPETITION STRUCTURE
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            COMPETITION WITH STRUCTURE, NOT JUST POPULARITY.
          </h2>

          <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
            Ink Convention is designed around defined categories, published
            rules and transparent judging criteria. Popularity can create
            attention, but it should not be the only measure of artistic
            quality. Our competition system is intended to give artists a
            structured environment in which technical ability, creativity,
            execution and artistic decisions can be evaluated.
          </p>
        </div>
      </section>

      {/* =====================================================
          8. WHO IS INK CONVENTION FOR
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#050507] border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              WHO IS INK CONVENTION FOR?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audienceCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={index}
                  className="glass-card bg-[#0b0b0f] border border-white/5 p-8 space-y-4 text-center"
                >
                  <Icon size={28} className="text-[#a855f7] mx-auto mb-2" />

                  <h3 className="text-base font-bold uppercase">
                    {card.title}
                  </h3>

                  <p className="text-sm text-gray-400 font-light leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          9. CREDIBILITY + LONG TERM VISION
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* CREDIBILITY */}

          <div className="bg-[#0b0b0f] border border-white/10 p-10 sm:p-12 space-y-6">
            <ShieldCheck size={32} className="text-[#a855f7]" />

            <h3 className="text-2xl font-black uppercase tracking-tight">
              BUILT FOR CREDIBILITY
            </h3>

            <p className="text-gray-400 font-light leading-relaxed">
              Competition rules, submission requirements and judging methodology
              should be clearly communicated before artists enter. We believe
              participants should know what they are submitting, how their work
              will be evaluated and what recognition they are competing for.
            </p>

            <div className="pt-4">
              <Link
                to="/rules"
                className="text-xs font-mono tracking-widest text-[#a855f7] hover:text-white uppercase"
              >
                VIEW COMPETITION RULES ↗
              </Link>
            </div>
          </div>

          {/* VISION */}

          <div className="bg-gradient-to-br from-[#120a1f] to-[#0b0b0f] border border-[#a855f7]/20 p-10 sm:p-12 space-y-6 shadow-2xl shadow-purple-900/10">
            <Star size={32} className="text-[#a855f7]" />

            <h3 className="text-2xl font-black uppercase tracking-tight">
              FROM COMPETITION TO RECOGNITION.
            </h3>

            <p className="text-gray-300 font-light leading-relaxed">
              Our long-term vision is to build a trusted digital home for tattoo
              competitions, artist discovery and professional recognition. We
              want Ink Convention to become a platform where an artist can
              compete, build a track record, earn recognition and be discovered
              over time — rather than being defined by a single post, one
              contest or the number of followers they have.
            </p>

            <p className="text-[#a855f7] text-sm font-mono tracking-widest uppercase pt-2">
              The 2026 championship is the beginning of that journey.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
