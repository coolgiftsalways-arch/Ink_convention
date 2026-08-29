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
    if (!contentRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current.children,
        {
          opacity: 0,
          y: 40,
          skewY: 2,
        },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power4.out",
          delay: 0.2,
        },
      );
    });

    return () => {
      ctx.revert();
    };
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
          1. HERO SECTION
      ===================================================== */}

      <div
        className="
          relative
          w-full
          min-h-[calc(100vh-5rem)]
          flex
          flex-col
          justify-between
          overflow-hidden
          border-b
          border-white/10
        "
      >
        {/* BACKGROUND */}

        <div
          className="
            absolute
            inset-0
            w-full
            h-full
            overflow-hidden
            pointer-events-none
            z-0
          "
        >
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              md:bg-gradient-to-r
              from-[#08080a]
              via-[#08080a]/90
              to-transparent
              z-10
              w-full
              lg:w-[75%]
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-[#08080a]
              via-transparent
              to-transparent
              z-10
            "
          />

          <img
            src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80&w=2000"
            alt="Tattoo Artist Working"
            className="
              w-full
              h-full
              object-cover
              object-center
              md:object-right
              scale-105
            "
          />
        </div>

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div
          className="
            relative
            z-20
            max-w-7xl
            mx-auto
            w-full
            px-6
            sm:px-10
            lg:px-12
            pt-32
            pb-16
            flex
            flex-col
            justify-center
            flex-grow
          "
        >
          <div
            ref={contentRef}
            className="
              max-w-4xl
              space-y-8
              flex
              flex-col
              items-start
              text-left
            "
          >
            {/* LABEL */}

            <div className="overflow-hidden">
              <h4
                className="
                  text-[#a855f7]
                  font-mono
                  text-xs
                  sm:text-sm
                  tracking-[0.25em]
                  uppercase
                  font-semibold
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    w-8
                    h-[1px]
                    bg-[#a855f7]
                  "
                />
                INK CONVENTION 2026
              </h4>
            </div>

            {/* TITLE */}

            <div className="overflow-hidden">
              <h1
                className="
                  text-4xl
                  sm:text-6xl
                  md:text-7xl
                  font-black
                  tracking-tighter
                  leading-[1.05]
                  text-white
                "
              >
                INDIA&apos;S TATTOO
                <br />
                ARTIST NETWORK
              </h1>
            </div>

            {/* DESCRIPTION */}

            <div className="overflow-hidden">
              <p
                className="
                  text-gray-400
                  text-base
                  sm:text-lg
                  font-light
                  max-w-xl
                  leading-relaxed
                "
              >
                Discover tattoo artists and studios, join the directory, book
                regional expo stalls and enter the Ink Convention competition
                across India.
              </p>
            </div>

            {/* FEATURES */}

            <div className="overflow-hidden">
              <p
                className="
                  text-xs
                  sm:text-sm
                  font-mono
                  tracking-widest
                  text-gray-300
                  border-l-2
                  border-[#a855f7]
                  pl-4
                  py-1
                "
              >
                ARTIST DIRECTORY • REGIONAL EXPO TOUR • COMPETITION • VERIFIED
                PROFILES
              </p>
            </div>

            {/* =================================================
                3 MAIN HERO BUTTONS
            ================================================= */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                flex-wrap
                items-stretch
                sm:items-center
                gap-3
                pt-4
                w-full
                sm:w-auto
              "
            >
              {/* =============================================
                  1. BOOK YOUR STALL
              ============================================= */}

              <Link
                to="/client-login"
                state={{ redirectTo: "/stall" }}
                className="
                  group
                  relative
                  overflow-hidden

                  bg-white
                  hover:bg-gray-200

                  text-black

                  px-7
                  py-4

                  rounded-xl

                  font-black
                  text-[10px]
                  sm:text-xs
                  font-mono
                  uppercase
                  tracking-[0.12em]

                  flex
                  items-center
                  justify-center
                  gap-3

                  transition-all
                  duration-300

                  hover:-translate-y-1

                  shadow-[0_10px_35px_rgba(255,255,255,0.08)]
                "
              >
                <span
                  className="
                    relative
                    z-10
                    whitespace-nowrap
                  "
                >
                  BOOK YOUR STALL
                </span>

                <ArrowRight
                  size={14}
                  className="
                    relative
                    z-10
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              {/* =============================================
                  2. GO TO COMPETITION
              ============================================= */}

              <Link
                to="/Upload"
                className="
                  group
                  relative
                  overflow-hidden

                  bg-[#a855f7]
                  hover:bg-[#9333ea]

                  text-white

                  px-7
                  py-4

                  rounded-xl

                  font-black
                  text-[10px]
                  sm:text-xs
                  font-mono
                  uppercase
                  tracking-[0.12em]

                  flex
                  items-center
                  justify-center
                  gap-3

                  transition-all
                  duration-300

                  hover:-translate-y-1

                  shadow-lg
                  shadow-purple-900/40
                "
              >
                {/* SHINE */}

                <span
                  className="
                    absolute
                    inset-0

                    bg-gradient-to-r
                    from-transparent
                    via-white/10
                    to-transparent

                    -translate-x-full
                    group-hover:translate-x-full

                    transition-transform
                    duration-700

                    pointer-events-none
                  "
                />

                <span
                  className="
                    relative
                    z-10
                    whitespace-nowrap
                  "
                >
                  ENTER COMPETITION
                </span>

                <ArrowRight
                  size={14}
                  className="
                    relative
                    z-10
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              {/* =============================================
                  3. JOIN DIRECTORY FREE
              ============================================= */}

              <Link
                to="/Enter"
                className="
                  group
                  relative
                  overflow-hidden

                  bg-transparent

                  border
                  border-[#a855f7]/60

                  hover:border-[#a855f7]
                  hover:bg-[#a855f7]/10

                  text-white

                  px-7
                  py-4

                  rounded-xl

                  font-black
                  text-[10px]
                  sm:text-xs
                  font-mono
                  uppercase
                  tracking-[0.12em]

                  flex
                  items-center
                  justify-center
                  gap-3

                  transition-all
                  duration-300

                  hover:-translate-y-1

                  shadow-[0_0_25px_rgba(168,85,247,0.10)]
                "
              >
                <span
                  className="
                    w-2
                    h-2

                    rounded-full

                    bg-[#a855f7]

                    animate-pulse

                    shadow-[0_0_12px_rgba(168,85,247,0.9)]
                  "
                />

                <span
                  className="
                    relative
                    z-10
                    whitespace-nowrap
                  "
                >
                  JOIN DIRECTORY FREE
                </span>

                <ArrowRight
                  size={14}
                  className="
                    relative
                    z-10
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div
          className="
            relative
            z-20
            w-full
            bg-[#050507]/80
            backdrop-blur-md
            border-t
            border-white/5
            py-8
          "
        >
          <div
            className="
              max-w-7xl
              mx-auto
              px-6
              sm:px-10
              lg:px-12
              grid
              grid-cols-2
              md:grid-cols-4
              gap-8
            "
          >
            <div className="space-y-1">
              <h3
                className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                6
              </h3>

              <p
                className="
                  text-[10px]
                  sm:text-xs
                  font-mono
                  text-[#a855f7]
                  tracking-wider
                  uppercase
                "
              >
                REGIONAL EXPO HUBS
              </p>
            </div>

            <div className="space-y-1">
              <h3
                className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                50–80
              </h3>

              <p
                className="
                  text-[10px]
                  sm:text-xs
                  font-mono
                  text-[#a855f7]
                  tracking-wider
                  uppercase
                "
              >
                STALLS / EVENT
              </p>
            </div>

            <div className="space-y-1">
              <h3
                className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-white
                  flex
                  items-center
                  gap-2
                "
              >
                <Medal size={24} className="text-white" />7
              </h3>

              <p
                className="
                  text-[10px]
                  sm:text-xs
                  font-mono
                  text-[#a855f7]
                  tracking-wider
                  uppercase
                "
              >
                COMPETITION CATEGORIES
              </p>
            </div>

            <div className="space-y-1">
              <h3
                className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                ₹0
              </h3>

              <p
                className="
                  text-[10px]
                  sm:text-xs
                  font-mono
                  text-[#a855f7]
                  tracking-wider
                  uppercase
                "
              >
                LIFETIME FREE LISTING
              </p>
            </div>
          </div>
        </div>
      </div>

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
          3. THREE WAYS TO JOIN
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
        "
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-14">
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
                sm:text-5xl
                font-black
                tracking-tight
                text-white
                uppercase
                mt-4
              "
            >
              THREE WAYS TO BE PART OF INK CONVENTION
            </h2>

            <p
              className="
                text-gray-400
                text-sm
                sm:text-base
                leading-relaxed
                max-w-2xl
                mx-auto
                mt-5
              "
            >
              Book an expo stall, enter the tattoo competition, or create your
              artist directory profile for free.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-6
            "
          >
            {/* 01 / BOOK STALL */}

            <article
              className="
                group
                relative
                overflow-hidden
                min-h-[460px]
                rounded-3xl
                border
                border-white/10
                bg-[#08080a]
                p-7
                sm:p-8
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
                  w-14
                  h-14
                  rounded-2xl
                  bg-white
                  text-black
                  flex
                  items-center
                  justify-center
                "
              >
                <Store size={24} />
              </div>

              <p
                className="
                  mt-8
                  text-[9px]
                  font-mono
                  tracking-[0.18em]
                  text-gray-600
                "
              >
                01 / EXHIBIT
              </p>

              <h3
                className="
                  text-3xl
                  font-black
                  uppercase
                  mt-3
                "
              >
                BOOK YOUR STALL
              </h3>

              <p
                className="
                  text-sm
                  text-gray-400
                  leading-relaxed
                  mt-5
                "
              >
                Reserve space for your tattoo studio, artist setup, supplier or
                brand at a three-day regional Ink Convention expo.
              </p>

              <div className="space-y-3 mt-7">
                <StepLine text="Choose your regional expo city" />
                <StepLine text="Login to your booking account" />
                <StepLine text="Select a stall package from ₹4,999" />
                <StepLine text="Pay ₹1,499 advance to reserve" />
              </div>

              <Link
                to="/client-login"
                state={{ redirectTo: "/stall" }}
                className="
                  mt-8
                  w-full
                  bg-white
                  hover:bg-gray-200
                  text-black
                  px-6
                  py-4
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
                BOOK A STALL
                <ArrowRight
                  size={15}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </article>

            {/* 02 / COMPETITION */}

            <article
              className="
                group
                relative
                overflow-hidden
                min-h-[460px]
                rounded-3xl
                border
                border-[#a855f7]/40
                bg-gradient-to-b
                from-[#a855f7]/10
                to-[#08080a]
                p-7
                sm:p-8
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
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#a855f7]
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_30px_rgba(168,85,247,0.25)]
                "
              >
                <Trophy size={24} />
              </div>

              <p
                className="
                  mt-8
                  text-[9px]
                  font-mono
                  tracking-[0.18em]
                  text-[#a855f7]
                "
              >
                02 / COMPETE
              </p>

              <h3
                className="
                  text-3xl
                  font-black
                  uppercase
                  mt-3
                "
              >
                ENTER THE COMPETITION
              </h3>

              <p
                className="
                  text-sm
                  text-gray-400
                  leading-relaxed
                  mt-5
                "
              >
                Submit your tattoo work across seven competition categories and
                compete for recognition, awards and Ink Convention rankings.
              </p>

              <div className="space-y-3 mt-7">
                <StepLine text="Choose from 7 competition categories" accent />
                <StepLine text="1 entry ₹999" accent />
                <StepLine text="3 entries ₹1,499" accent />
                <StepLine text="5 entries ₹1,999" accent />
              </div>

              <Link
                to="/Upload"
                className="
                  mt-8
                  w-full
                  bg-[#a855f7]
                  hover:bg-[#9333ea]
                  text-white
                  px-6
                  py-4
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

            {/* 03 / FREE DIRECTORY */}

            <article
              className="
                group
                relative
                overflow-hidden
                min-h-[460px]
                rounded-3xl
                border
                border-purple-500/20
                bg-[#08080a]
                p-7
                sm:p-8
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
                  w-14
                  h-14
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
                <Users size={24} />
              </div>

              <p
                className="
                  mt-8
                  text-[9px]
                  font-mono
                  tracking-[0.18em]
                  text-purple-400
                "
              >
                03 / JOIN FREE
              </p>

              <h3
                className="
                  text-3xl
                  font-black
                  uppercase
                  mt-3
                "
              >
                FREE ARTIST ENTRY
              </h3>

              <p
                className="
                  text-sm
                  text-gray-400
                  leading-relaxed
                  mt-5
                "
              >
                Create a lifetime free artist or studio listing and become
                discoverable inside the Ink Convention directory.
              </p>

              <div className="space-y-3 mt-7">
                <StepLine text="Lifetime Free directory listing" />
                <StepLine text="Artist / studio name, city and state" />
                <StepLine text="Contact information stays masked on Free" />
                <StepLine text="Upgrade to Pro or Verified anytime" />
              </div>

              <Link
                to="/Enter"
                className="
                  mt-8
                  w-full
                  border
                  border-[#a855f7]
                  hover:bg-[#a855f7]/10
                  text-white
                  px-6
                  py-4
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
                JOIN DIRECTORY FREE
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

            <div className="pt-4">
              <Link
                to="/rankings"
                className="
                  inline-flex
                  items-center
                  gap-3
                  bg-white/5
                  hover:bg-white/10
                  border
                  border-white/10
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-medium
                  text-xs
                  font-mono
                  uppercase
                  tracking-widest
                  transition
                  duration-300
                "
              >
                VIEW LIVE RANKINGS
                <ArrowRight size={16} />
              </Link>
            </div>
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
                TOP ARTISTS (DEMO)
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
                  name: "Artist Name",
                  pts: 984,
                },
                {
                  name: "Artist Name",
                  pts: 921,
                },
                {
                  name: "Artist Name",
                  pts: 895,
                },
                {
                  name: "Artist Name",
                  pts: 861,
                },
                {
                  name: "Artist Name",
                  pts: 832,
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
          5. ARTIST DISCOVERY
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
            max-w-7xl
            mx-auto
            space-y-12
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              justify-between
              items-start
              md:items-end
              gap-6
            "
          >
            <div className="space-y-3">
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
                DISCOVER THE ARTISTS
              </h2>

              <p
                className="
                  text-gray-400
                  font-light
                "
              >
                Explore participating tattoo artists, their styles, and
                achievements.
              </p>
            </div>

            <Link
              to="/artists"
              className="
                text-xs
                font-mono
                tracking-widest
                text-[#a855f7]
                hover:text-white
                uppercase
                flex
                items-center
                gap-2
              "
            >
              EXPLORE ALL ARTISTS
              <ArrowRight size={14} />
            </Link>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-6
            "
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="
                  bg-[#0b0b0f]
                  border
                  border-white/5
                  rounded-2xl
                  overflow-hidden
                  hover:border-white/20
                  transition-colors
                  cursor-pointer
                  group
                "
              >
                <div
                  className="
                    h-40
                    bg-gray-800
                    relative
                  "
                >
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-[#0b0b0f]
                      to-transparent
                      z-10
                    "
                  />
                </div>

                <div
                  className="
                    p-5
                    relative
                    z-20
                    -mt-12
                    flex
                    flex-col
                    items-center
                    text-center
                  "
                >
                  <div
                    className="
                      w-16
                      h-16
                      rounded-full
                      bg-[#1a1a24]
                      border-2
                      border-[#0b0b0f]
                      mb-3
                      overflow-hidden
                    "
                  >
                    <img
                      src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"
                      alt="Artist"
                      className="
                        w-full
                        h-full
                        object-cover
                        grayscale
                        opacity-80
                      "
                    />
                  </div>

                  <h3
                    className="
                      text-sm
                      font-bold
                      text-white
                      mb-1
                    "
                  >
                    Artist Name
                  </h3>

                  <p
                    className="
                      text-[10px]
                      text-gray-500
                      mb-3
                    "
                  >
                    City, Country
                  </p>

                  <span
                    className="
                      text-[10px]
                      font-mono
                      tracking-wider
                      text-[#a855f7]
                      bg-[#a855f7]/10
                      px-3
                      py-1
                      rounded-full
                    "
                  >
                    Style / Category
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          6. HALL OF FAME
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

          <div className="pt-6">
            <Link
              to="/hall-of-fame"
              className="
                text-xs
                font-mono
                tracking-widest
                text-gray-400
                hover:text-white
                uppercase
                underline
                decoration-white/20
              "
            >
              VIEW HALL OF FAME
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          7. SPONSORS
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

          <Link
            to="/sponsors"
            className="
              inline-block
              bg-transparent
              border
              border-[#a855f7]
              text-[#a855f7]
              hover:bg-[#a855f7]
              hover:text-white
              px-8
              py-3
              rounded-xl
              font-bold
              text-xs
              font-mono
              uppercase
              tracking-widest
              transition
              duration-300
            "
          >
            BECOME A SPONSOR
          </Link>
        </div>
      </section>

      {/* =====================================================
          8. FAQ
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
                q: "How does stall booking work?",
                a: "Choose Book Your Stall, login to your account, select your expo city and stall package, then reserve your space with the ₹1,499 advance.",
              },
              {
                q: "How much does a stall cost?",
                a: "The planned stall packages are ₹4,999, ₹7,499 and ₹12,499, depending on the package and visibility level.",
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

          <div className="text-center">
            <Link
              to="/faq"
              className="
                text-xs
                font-mono
                tracking-widest
                text-[#a855f7]
                hover:text-white
                uppercase
                underline
                decoration-white/20
              "
            >
              VIEW ALL FAQ
            </Link>
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
          w-2
          h-2
          rounded-full
          shrink-0
          ${accent ? "bg-[#a855f7]" : "bg-white/30"}
        `}
      />

      <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">
        {text}
      </span>
    </div>
  );
}

export default Home;
