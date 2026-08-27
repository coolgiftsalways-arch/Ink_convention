import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  Calendar,
  MapPin,
  Trophy,
  Mic,
  PenTool,
  Store,
  Users,
  Share2,
  Clock,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import mumbai from "../assets/mumbai.png";
import pune from "../assets/pune.png";

gsap.registerPlugin(ScrollTrigger);

// ======================================================
// EVENTS
// ======================================================

const eventsData = [
  {
    id: 1,
    city: "MUMBAI",
    state: "Maharashtra",
    status: "active",
    date: "15 - 17 Nov, 2025",
    venue: "NESCO Center,\nGoregaon, Mumbai",
    desc: "The biggest tattoo convention is hitting Mumbai! Join us for an incredible weekend of art, music, and tattoo culture.",
    image: mumbai,
  },
  {
    id: 2,
    city: "PUNE",
    state: "Maharashtra",
    status: "active",
    date: "05 - 07 Dec, 2025",
    venue: "Deccan College Ground,\nPune, Maharashtra",
    desc: "Pune gets ready to be inked! Discover top artists from around the country in a massive 3-day showdown.",
    image: pune,
  },
  {
    id: 3,
    city: "AJMER",
    state: "Rajasthan",
    status: "upcoming",
    date: "10 - 12 Oct, 2025",
    venue: "Pushkar Mela Ground,\nAjmer, Rajasthan",
    desc: "Ink Convention is coming to Ajmer! Get ready for an unforgettable experience filled with incredible tattoo artists, live performances, workshops, and more.",
    image:
      "https://images.unsplash.com/photo-1599818815197-f5d60914e69b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    city: "DELHI",
    state: "Delhi",
    status: "upcoming",
  },
  {
    id: 5,
    city: "BENGALURU",
    state: "Karnataka",
    status: "upcoming",
  },
  {
    id: 6,
    city: "HYDERABAD",
    state: "Telangana",
    status: "upcoming",
  },
  {
    id: 7,
    city: "AHMEDABAD",
    state: "Gujarat",
    status: "upcoming",
  },
  {
    id: 8,
    city: "JAIPUR",
    state: "Rajasthan",
    status: "upcoming",
  },
  {
    id: 9,
    city: "CHENNAI",
    state: "Tamil Nadu",
    status: "upcoming",
  },
  {
    id: 10,
    city: "KOLKATA",
    state: "West Bengal",
    status: "upcoming",
  },
  {
    id: 11,
    city: "LUCKNOW",
    state: "Uttar Pradesh",
    status: "upcoming",
  },
  {
    id: 12,
    city: "INDORE",
    state: "Madhya Pradesh",
    status: "upcoming",
  },
  {
    id: 13,
    city: "SURAT",
    state: "Gujarat",
    status: "upcoming",
  },
  {
    id: 14,
    city: "CHANDIGARH",
    state: "Chandigarh",
    status: "upcoming",
  },
  {
    id: 15,
    city: "KOCHI",
    state: "Kerala",
    status: "upcoming",
  },
  {
    id: 16,
    city: "NAGPUR",
    state: "Maharashtra",
    status: "upcoming",
  },
];

// ======================================================
// COMPONENT
// ======================================================

export default function Upcomeing() {
  const [selectedEvent, setSelectedEvent] = useState(eventsData[0]);

  // false = normal heading
  // true = book your stall heading
  const [showBookText, setShowBookText] = useState(false);

  const headingRef = useRef(null);
  const bookingRef = useRef(null);
  const arrowRef = useRef(null);
  const glowRef = useRef(null);
  const bookCalloutRef = useRef(null);

  // ======================================================
  // EVENT CARD ANIMATION
  // ======================================================

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".event-card");

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=50",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      if (bookCalloutRef.current) {
        gsap.to(bookCalloutRef.current, {
          y: -6,
          scale: 1.02,
          repeat: -1,
          yoyo: true,
          duration: 1.2,
          ease: "power1.inOut",
        });
      }
    });

    return () => {
      ctx.revert();
    };
  }, []);

  // ======================================================
  // TEXT TIMER
  //
  // Normal heading: 2 seconds
  // Book heading:   5 seconds
  // ======================================================

  useEffect(() => {
    const time = showBookText ? 5000 : 2000;

    const timer = setTimeout(() => {
      if (!headingRef.current) {
        setShowBookText((prev) => !prev);
        return;
      }

      gsap.killTweensOf(headingRef.current);

      gsap.to(headingRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.96,
        filter: "blur(8px)",
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          setShowBookText((prev) => !prev);
        },
      });
    }, time);

    return () => clearTimeout(timer);
  }, [showBookText]);

  // ======================================================
  // NEW TEXT ENTRANCE
  // ======================================================

  useEffect(() => {
    if (!headingRef.current) return;

    gsap.killTweensOf(headingRef.current);

    gsap.fromTo(
      headingRef.current,
      {
        opacity: 0,
        y: 35,
        scale: 0.94,
        filter: "blur(8px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.65,
        ease: "back.out(1.6)",
      },
    );
  }, [showBookText]);

  // ======================================================
  // BOOK YOUR STALL ATTENTION ANIMATION
  // ======================================================

  useEffect(() => {
    if (!showBookText) return;

    const animations = [];

    if (bookingRef.current) {
      animations.push(
        gsap.to(bookingRef.current, {
          scale: 1.025,
          duration: 0.7,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        }),
      );
    }

    if (arrowRef.current) {
      animations.push(
        gsap.to(arrowRef.current, {
          x: 12,
          duration: 0.55,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        }),
      );
    }

    if (glowRef.current) {
      animations.push(
        gsap.fromTo(
          glowRef.current,
          {
            opacity: 0.15,
            scale: 0.85,
          },
          {
            opacity: 0.7,
            scale: 1.15,
            duration: 0.9,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          },
        ),
      );
    }

    return () => {
      animations.forEach((animation) => animation.kill());
    };
  }, [showBookText]);

  // ======================================================
  // SHARE
  // ======================================================

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ink Convention 2026 - ${selectedEvent.city}`,
          text: selectedEvent.desc || `Ink Convention ${selectedEvent.city}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      alert("Sharing is not supported on this browser. Copy the URL instead!");
    }
  };

  // ======================================================
  // JSX
  // ======================================================

  return (
    <div className="bg-[#0a0a0c] text-white font-sans selection:bg-purple-500/30">
      <div
        className="
          min-h-screen
          px-4
          sm:px-6
          lg:px-8
          pb-20
          mb-24
          pt-24
          lg:pt-32
          flex
          gap-12
          relative
          max-w-7xl
          mx-auto
          items-start
        "
      >
        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="flex-1 min-w-0">
          {/* ================================================= */}
          {/* TOP */}
          {/* ================================================= */}

          <div className="mb-10">
            <p className="text-purple-500 font-semibold tracking-widest text-sm mb-4">
              // UPCOMING EVENTS
            </p>

            {/* ================================================= */}
            {/* ANIMATED HEADING */}
            {/* ================================================= */}

            <div
              className="
                relative
                mb-8
                min-h-[145px]
                sm:min-h-[155px]
                flex
                items-center
              "
            >
              <div ref={headingRef} className="relative w-full">
                {showBookText ? (
                  <Link
                    to="/client-login"
                    className="relative block group cursor-pointer"
                  >
                    {/* Purple background glow */}

                    <div
                      ref={glowRef}
                      className="
                        absolute
                        left-0
                        top-1/2
                        -translate-y-1/2
                        w-[80%]
                        h-[130%]
                        bg-purple-600/20
                        blur-[60px]
                        rounded-full
                        pointer-events-none
                      "
                    />

                    <div ref={bookingRef} className="relative z-10">
                      <h1
                        className="
                          text-4xl
                          sm:text-5xl
                          lg:text-5xl
                          font-black
                          uppercase
                          leading-[1.05]
                          tracking-tight
                        "
                      >
                        <span className="block text-white">
                          BOOK YOUR STALL
                        </span>

                        <span className="flex items-center gap-3 mt-1">
                          <span
                            className="
                              text-purple-500
                              drop-shadow-[0_0_25px_rgba(168,85,247,1)]
                            "
                          >
                            NOW
                          </span>

                          <ArrowRight
                            ref={arrowRef}
                            className="
                              w-10
                              h-10
                              sm:w-12
                              sm:h-12
                              text-purple-500
                              drop-shadow-[0_0_18px_rgba(168,85,247,1)]
                            "
                          />

                          {/* Pulsing dot */}

                          <span className="relative flex h-4 w-4 ml-2">
                            <span
                              className="
                                animate-ping
                                absolute
                                inline-flex
                                h-full
                                w-full
                                rounded-full
                                bg-purple-400
                                opacity-75
                              "
                            />

                            <span
                              className="
                                relative
                                inline-flex
                                rounded-full
                                h-4
                                w-4
                                bg-purple-500
                                shadow-[0_0_20px_#a855f7]
                              "
                            />
                          </span>
                        </span>
                      </h1>

                      {/* Shimmer line */}

                      <div
                        className="
                          relative
                          mt-5
                          w-full
                          max-w-[430px]
                          h-[2px]
                          overflow-hidden
                          bg-purple-500/20
                        "
                      >
                        <div
                          className="
                            absolute
                            top-0
                            left-0
                            h-full
                            w-[35%]
                            bg-gradient-to-r
                            from-transparent
                            via-purple-400
                            to-transparent
                            animate-[bookingShimmer_1.3s_linear_infinite]
                          "
                        />
                      </div>

                      <p
                        className="
                          text-[10px]
                          sm:text-xs
                          text-purple-300
                          mt-3
                          font-bold
                          tracking-[0.25em]
                          uppercase
                        "
                      >
                        Click to reserve your space
                      </p>
                    </div>
                  </Link>
                ) : (
                  <h1
                    className="
                      text-4xl
                      sm:text-5xl
                      lg:text-5xl
                      font-black
                      uppercase
                      leading-[1.05]
                      tracking-tight
                    "
                  >
                    See where Ink Convention
                    <br />
                    is headed{" "}
                    <span
                      className="
                        text-purple-500
                        drop-shadow-[0_0_18px_rgba(168,85,247,0.45)]
                      "
                    >
                      next.
                    </span>
                  </h1>
                )}
              </div>
            </div>

            {/* ================================================= */}
            {/* SCROLL INDICATOR */}
            {/* ================================================= */}

            <div className="flex items-center gap-4 text-gray-400 mb-8">
              <div
                className="
                  w-6
                  h-10
                  border-2
                  border-gray-700
                  rounded-full
                  flex
                  justify-center
                  pt-2
                  bg-[#121215]
                "
              >
                <div className="w-1 h-2 bg-purple-500 rounded-full animate-bounce" />
              </div>

              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500">
                Scroll down to explore
              </span>
            </div>
          </div>

          {/* ================================================= */}
          {/* EVENT CARDS */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-4
              mb-4
            "
          >
            {eventsData.map((event) => {
              const isActive = event.status === "active";
              const isSelected = selectedEvent?.id === event.id;

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`
                    event-card
                    p-5
                    rounded-xl
                    cursor-pointer
                    transition-all
                    duration-300
                    border

                    ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                        : "border-gray-800 bg-[#121215] hover:border-gray-600 hover:bg-[#161619]"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`
                        w-2
                        h-2
                        rounded-full
                        ${
                          isActive
                            ? "bg-purple-500 shadow-[0_0_8px_#a855f7]"
                            : "bg-gray-600"
                        }
                      `}
                    />

                    <h3
                      className={`
                        font-bold
                        tracking-wide
                        ${isActive ? "text-purple-400" : "text-gray-200"}
                      `}
                    >
                      {event.city}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 pl-5 uppercase tracking-wider">
                    {event.state}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div
          className="
            w-[450px]
            shrink-0
            hidden
            lg:block
            sticky
            top-32
            h-[calc(100vh-10rem)]
            z-10
          "
        >
          <div
            className="
              bg-[#121215]
              border
              border-gray-800
              rounded-2xl
              p-6
              h-full
              flex
              flex-col
              shadow-2xl
              relative
            "
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-purple-500 text-xs font-bold tracking-widest uppercase">
                {selectedEvent?.status === "active"
                  ? "Active Event"
                  : "Upcoming Location"}
              </h4>
            </div>

            {selectedEvent ? (
              selectedEvent.status === "active" ? (
                // =================================================
                // ACTIVE EVENT
                // =================================================

                <div className="flex flex-col h-full fade-in-panel">
                  {/* IMAGE + INFO */}

                  <div className="flex gap-6 mb-8">
                    <div
                      className="
                        w-32
                        h-40
                        bg-gray-900
                        rounded-xl
                        overflow-hidden
                        shrink-0
                        relative
                      "
                    >
                      {selectedEvent.image && (
                        <img
                          src={selectedEvent.image}
                          alt={selectedEvent.city}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="pt-2 min-w-0">
                      <h2 className="text-3xl font-black mb-1">
                        {selectedEvent.city}
                      </h2>

                      <p className="text-gray-400 mb-6">
                        {selectedEvent.state}
                      </p>

                      {/* DATE */}

                      <div className="flex items-start gap-3 mb-4 text-sm">
                        <Calendar
                          size={16}
                          className="text-gray-400 mt-1 shrink-0"
                        />

                        <div>
                          <p className="text-gray-500 text-xs mb-1">DATE</p>

                          <p>{selectedEvent.date || "TBD"}</p>
                        </div>
                      </div>

                      {/* VENUE */}

                      <div className="flex items-start gap-3 text-sm">
                        <MapPin
                          size={16}
                          className="text-gray-400 mt-1 shrink-0"
                        />

                        <div>
                          <p className="text-gray-500 text-xs mb-1">VENUE</p>

                          <p className="whitespace-pre-line">
                            {selectedEvent.venue || "Venue to be announced"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-800 mb-6" />

                  {/* ================================================= */}
                  {/* ABOUT */}
                  {/* ================================================= */}

                  <div className="mb-8">
                    <h4 className="text-purple-500 text-xs font-bold tracking-widest mb-3">
                      ABOUT THE EVENT
                    </h4>

                    <p className="text-gray-400 text-sm leading-relaxed">
                      {selectedEvent.desc ||
                        `Stay tuned for more details regarding the upcoming Ink Convention in ${selectedEvent.city}.`}
                    </p>
                  </div>

                  {/* ================================================= */}
                  {/* EVENT HIGHLIGHTS */}
                  {/* ================================================= */}

                  <div className="mb-auto">
                    <h4 className="text-purple-500 text-xs font-bold tracking-widest mb-4">
                      EVENT HIGHLIGHTS
                    </h4>

                    <div className="flex justify-between gap-1">
                      {[
                        {
                          icon: Trophy,
                          label: "Tattoo\nCompetitions",
                        },
                        {
                          icon: Mic,
                          label: "Live\nPerformances",
                        },
                        {
                          icon: PenTool,
                          label: "Artist\nWorkshops",
                        },
                        {
                          icon: Store,
                          label: "Exhibitions\n& Vendors",
                        },
                        {
                          icon: Users,
                          label: "Networking\nOpportunities",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="
                            flex
                            flex-col
                            items-center
                            text-center
                            p-2
                            border
                            border-gray-800
                            rounded-xl
                            bg-[#0a0a0c]/50
                            flex-1
                          "
                        >
                          <item.icon
                            size={16}
                            className="text-purple-500 mb-2"
                          />

                          <span className="text-[9px] text-gray-400 whitespace-pre-line leading-tight">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* BOOKING AREA */}
                  {/* ================================================= */}

                  <div className="flex flex-col gap-3 mt-6 pt-2 relative">
                    <div ref={bookCalloutRef} className="text-center py-1">
                      <div
                        className="
                          inline-flex
                          items-center
                          gap-2
                          text-amber-300
                          text-xs
                          font-black
                          tracking-widest
                          uppercase
                          drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]
                        "
                      >
                        <ArrowDown size={16} className="text-amber-400" />

                        <span>🚀 BOOK YOUR STALL NOW 🚀</span>

                        <ArrowDown size={16} className="text-amber-400" />
                      </div>
                    </div>

                    {/* MAIN BUTTON */}

                    <Link
                      to="/client-login"
                      className="
                        relative
                        overflow-hidden
                        group
                        w-full
                        bg-gradient-to-r
                        from-[#a855f7]
                        via-purple-600
                        to-[#9333ea]
                        hover:opacity-95
                        text-white
                        font-black
                        py-4
                        px-4
                        rounded-xl
                        transition-all
                        text-sm
                        text-center
                        flex
                        items-center
                        justify-center
                        gap-2
                        shadow-xl
                        shadow-purple-500/40
                        ring-4
                        ring-purple-500/40
                        hover:scale-[1.02]
                      "
                    >
                      <div
                        className="
                          absolute
                          inset-0
                          w-1/2
                          h-full
                          bg-white/20
                          skew-x-12
                          -translate-x-full
                          group-hover:translate-x-[300%]
                          transition-transform
                          duration-1000
                        "
                      />

                      <Store size={18} className="animate-pulse" />

                      <span>BOOK YOUR STALL</span>

                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>

                    {/* SECONDARY BUTTONS */}

                    <div className="flex gap-3 mt-1">
                      <Link
                        to="/Upload"
                        className="
                          flex-1
                          bg-white/5
                          hover:bg-white/10
                          border
                          border-gray-800
                          text-gray-300
                          hover:text-white
                          font-bold
                          py-2.5
                          px-2
                          rounded-xl
                          transition-colors
                          text-xs
                          text-center
                          flex
                          items-center
                          justify-center
                        "
                      >
                        EXPO 2026 FORM
                      </Link>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="
                          flex-1
                          border
                          border-gray-800
                          hover:border-gray-600
                          bg-transparent
                          text-gray-400
                          hover:text-white
                          font-bold
                          py-2.5
                          px-2
                          rounded-xl
                          transition-colors
                          text-xs
                          flex
                          items-center
                          justify-center
                          gap-1.5
                          cursor-pointer
                        "
                      >
                        <Share2 size={14} />
                        SHARE EVENT
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // =================================================
                // UPCOMING EVENT
                // =================================================

                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    h-full
                    text-center
                    fade-in-panel
                  "
                >
                  <div
                    className="
                      w-20
                      h-20
                      rounded-full
                      border
                      border-purple-500/20
                      flex
                      items-center
                      justify-center
                      mb-6
                      bg-purple-500/5
                      shadow-inner
                      relative
                      overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 bg-purple-500/10 animate-pulse" />

                    <Clock
                      className="text-purple-500 relative z-10"
                      size={32}
                    />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-2">
                    {selectedEvent.city}
                  </h3>

                  <p className="text-gray-400 mb-6">{selectedEvent.state}</p>

                  <p
                    className="
                      text-purple-400
                      text-[10px]
                      font-bold
                      tracking-[0.2em]
                      mb-6
                      uppercase
                      border
                      border-purple-500/30
                      bg-purple-500/10
                      rounded-full
                      px-4
                      py-1.5
                    "
                  >
                    Coming Soon
                  </p>

                  <p
                    className="
                      text-gray-400
                      text-sm
                      leading-relaxed
                      max-w-[280px]
                      mb-8
                    "
                  >
                    The ink is still drying on our plans. We are gearing up to
                    bring the ultimate tattoo experience to{" "}
                    <span className="text-gray-200 font-semibold">
                      {selectedEvent.city}
                    </span>
                    . Stay tuned!
                  </p>

                  <button
                    type="button"
                    className="
                      w-full
                      border
                      border-gray-700
                      hover:border-purple-500
                      hover:text-purple-400
                      text-gray-300
                      font-bold
                      py-3
                      px-6
                      rounded-xl
                      transition-colors
                      text-sm
                    "
                  >
                    NOTIFY ME WHEN LIVE
                  </button>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select an event to see details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* SHIMMER KEYFRAME */}
      {/* ================================================= */}

      <style>
        {`
          @keyframes bookingShimmer {
            0% {
              transform: translateX(-150%);
            }

            100% {
              transform: translateX(400%);
            }
          }
        `}
      </style>
    </div>
  );
}
