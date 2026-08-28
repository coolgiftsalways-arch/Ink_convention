import { useEffect, useRef, useState } from "react";

import gsap from "gsap";

import {
  Trophy,
  Medal,
  Globe,
  Target,
  PenTool,
  LayoutGrid,
  Award,
  Star,
  ChevronDown,
  Crown,
  ArrowRight,
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
                THE GLOBAL ONLINE
                <br />
                TATTOO CHAMPIONSHIP
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
                Compete with tattoo artists from around the world. Submit your
                best work, get judged by experienced professionals, earn
                recognition and build your Ink Convention ranking.
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
                PROFESSIONAL JUDGING • MULTIPLE CATEGORIES • GLOBAL
                PARTICIPATION • ANNUAL RANKINGS
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
                to="/upcoming"
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
                to="/upload"
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
                  GO TO THE COMPETITION
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
                  3. GET A FREE ENTRY
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
                  GET A FREE ENTRY
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
                20+
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
                3+
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
                JUDGES / CATEGORY
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
                <Medal size={24} className="text-white" />
                AWARDS
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
                MULTIPLE CATEGORIES
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
                100%
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
                ONLINE CHAMPIONSHIP
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
            A NEW WAY TO COMPETE, GET RECOGNISED & GET DISCOVERED
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
            Ink Convention is a global online tattoo competition and
            artist-ranking platform created to give tattoo artists professional
            recognition beyond their local studio or social-media following.
            Artists can compete across specialist categories, submit their work
            for professional evaluation, earn rankings and awards, and build a
            lasting presence within the Ink Convention community.
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
            DISCOVER THE COMPETITION
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          3. WHY INK CONVENTION
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
        <div
          className="
            max-w-7xl
            mx-auto
            space-y-16
          "
        >
          <div
            className="
              text-center
              max-w-2xl
              mx-auto
              space-y-3
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
              "
            >
              MORE THAN A TATTOO COMPETITION
            </h2>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-4
              gap-6
            "
          >
            {[
              {
                icon: Target,
                title: "PROFESSIONAL JUDGING",
                desc: "Every entry is evaluated against published competition criteria by experienced judges.",
              },
              {
                icon: Award,
                title: "RECOGNITION",
                desc: "Win category awards, finalist positions, special awards and professional recognition.",
              },
              {
                icon: Trophy,
                title: "ARTIST RANKINGS",
                desc: "Build points through competitions and work toward the Ink Convention annual rankings.",
              },
              {
                icon: Globe,
                title: "GLOBAL EXPOSURE",
                desc: "Showcase your work to artists, tattoo enthusiasts, industry professionals and clients.",
              },
            ].map((card, index) => (
              <div
                key={index}
                className="
                    bg-[#08080a]
                    border
                    border-white/5
                    rounded-2xl
                    p-8
                    space-y-6
                    hover:border-[#a855f7]/40
                    transition
                    duration-500
                  "
              >
                <div
                  className="
                      w-12
                      h-12
                      rounded-xl
                      bg-purple-500/10
                      flex
                      items-center
                      justify-center
                      text-[#a855f7]
                    "
                >
                  <card.icon size={24} />
                </div>

                <div>
                  <h3
                    className="
                        text-lg
                        font-bold
                        text-white
                        mb-2
                      "
                  >
                    {card.title}
                  </h3>

                  <p
                    className="
                        text-sm
                        text-gray-400
                        leading-relaxed
                        font-light
                      "
                  >
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          4. HOW IT WORKS
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
            space-y-16
          "
        >
          <div
            className="
              text-center
              max-w-2xl
              mx-auto
              space-y-3
            "
          >
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
              // THE PROCESS
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
              HOW IT WORKS
            </h2>

            <p
              className="
                text-gray-400
                font-light
              "
            >
              From submission to final ranking — the process is simple.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-4
              gap-8
            "
          >
            {[
              {
                step: "01",
                title: "CHOOSE YOUR CATEGORY",
                desc: "Select the competition category that best matches your tattoo and review the category requirements.",
              },
              {
                step: "02",
                title: "SUBMIT YOUR WORK",
                desc: "Upload your required tattoo images and entry information before the submission deadline.",
              },
              {
                step: "03",
                title: "GET JUDGED",
                desc: "Your work is evaluated by the assigned judging panel using the published scoring criteria.",
              },
              {
                step: "04",
                title: "GET RANKED & RECOGNISED",
                desc: "Finalists and winners are announced, awards are issued and eligible results contribute to your ranking.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
                    relative
                    p-6
                    space-y-4
                  "
              >
                <span
                  className="
                      text-4xl
                      font-black
                      text-[#a855f7]/20
                      absolute
                      -top-2
                      left-6
                    "
                >
                  {item.step}
                </span>

                <div
                  className="
                      relative
                      z-10
                      pt-4
                    "
                >
                  <h3
                    className="
                        text-lg
                        font-bold
                        text-white
                        mb-2
                      "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                        text-sm
                        text-gray-400
                        leading-relaxed
                        font-light
                      "
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/rules"
              className="
                text-sm
                font-mono
                tracking-widest
                text-[#a855f7]
                hover:text-white
                uppercase
                transition-colors
                underline
                underline-offset-8
                decoration-white/20
              "
            >
              SEE FULL COMPETITION RULES
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          5. CATEGORIES
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
                COMPETE IN YOUR STYLE
              </h2>

              <p
                className="
                  text-gray-400
                  font-light
                "
              >
                Choose the category that best represents your work.
              </p>
            </div>

            <Link
              to="/categories"
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
              VIEW ALL CATEGORIES
              <ArrowRight size={14} />
            </Link>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-4
            "
          >
            {[
              "Black & Grey",
              "Realism",
              "Colour",
              "Fine Line",
              "Traditional",
              "Neo-Traditional",
              "Japanese",
              "Ornamental",
            ].map((category, index) => (
              <div
                key={index}
                className="
                    bg-[#0b0b0f]
                    border
                    border-white/5
                    p-6
                    rounded-xl
                    hover:bg-[#a855f7]/10
                    transition-colors
                    group
                    cursor-pointer
                  "
              >
                <div
                  className="
                      flex
                      justify-between
                      items-center
                      mb-4
                    "
                >
                  <PenTool
                    size={20}
                    className="
                        text-[#a855f7]
                      "
                  />

                  <span
                    className="
                        text-[10px]
                        font-mono
                        tracking-wider
                        text-green-400
                        bg-green-400/10
                        px-2
                        py-1
                        rounded
                      "
                  >
                    OPEN
                  </span>
                </div>

                <h3
                  className="
                      text-lg
                      font-bold
                      text-white
                      mb-1
                    "
                >
                  {category}
                </h3>

                <p
                  className="
                      text-xs
                      text-gray-500
                      mb-6
                    "
                >
                  Professional {category} Category
                </p>

                <div
                  className="
                      flex
                      justify-between
                      items-center
                      text-xs
                      font-mono
                    "
                >
                  <span
                    className="
                        text-gray-400
                      "
                  >
                    ENTRY FEE REQUIRED
                  </span>

                  <span
                    className="
                        text-[#a855f7]
                        group-hover:translate-x-1
                        transition-transform
                      "
                  >
                    VIEW →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          6. PRIZE POOL
      ===================================================== */}

      <section
        className="
          w-full
          py-32
          px-6
          sm:px-10
          lg:px-12
          bg-gradient-to-b
          from-[#08080a]
          to-[#0b0b0f]
          border-t
          border-white/5
          text-center
        "
      >
        <div
          className="
            max-w-4xl
            mx-auto
            space-y-8
          "
        >
          <Crown
            size={48}
            className="
              mx-auto
              text-[#a855f7]
              mb-4
            "
          />

          <h2
            className="
              text-3xl
              sm:text-5xl
              font-black
              tracking-tight
              text-white
              uppercase
            "
          >
            YOUR WORK DESERVES MORE THAN A LIKE.
          </h2>

          <p
            className="
              text-gray-400
              text-lg
              font-light
            "
          >
            Compete for awards, recognition, prizes and a place in Ink
            Convention history.
          </p>

          <div
            className="
              flex
              flex-wrap
              justify-center
              gap-4
              py-8
            "
          >
            {[
              "CATEGORY WINNERS",
              "OVERALL CHAMPION",
              "PEOPLE'S CHOICE",
              "SPECIAL AWARDS",
            ].map((award, index) => (
              <span
                key={index}
                className="
                    px-6
                    py-3
                    bg-[#08080a]
                    border
                    border-white/10
                    rounded-full
                    text-xs
                    font-mono
                    tracking-widest
                    text-white
                  "
              >
                {award}
              </span>
            ))}
          </div>

          <h3
            className="
              text-2xl
              sm:text-3xl
              font-black
              text-[#a855f7]
              tracking-widest
            "
          >
            MULTIPLE CATEGORIES & AWARDS
          </h3>

          <div className="pt-8">
            <Link
              to="/prizes"
              className="
                inline-block
                bg-white
                text-black
                px-8
                py-4
                rounded-xl
                font-bold
                text-xs
                font-mono
                uppercase
                tracking-widest
                hover:bg-gray-200
                transition
                duration-300
              "
            >
              VIEW PRIZES & AWARDS
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          7. JUDGES
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
            space-y-16
          "
        >
          <div
            className="
              text-center
              max-w-2xl
              mx-auto
              space-y-3
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
              "
            >
              JUDGED BY THE INDUSTRY
            </h2>

            <p
              className="
                text-gray-400
                font-light
              "
            >
              Your work deserves to be evaluated by experienced tattoo
              professionals.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-4
              gap-6
            "
          >
            {[1, 2, 3, 4].map((judge) => (
              <div
                key={judge}
                className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    bg-[#050507]
                    border
                    border-white/5
                  "
              >
                <div
                  className="
                      aspect-[4/5]
                      bg-gray-900
                      w-full
                      relative
                    "
                >
                  <img
                    src="https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=600&h=800"
                    alt="Judge"
                    className="
                        w-full
                        h-full
                        object-cover
                        opacity-60
                        group-hover:opacity-100
                        transition
                        duration-500
                        grayscale
                        group-hover:grayscale-0
                      "
                  />

                  <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black
                        via-black/50
                        to-transparent
                      "
                  />

                  <div
                    className="
                        absolute
                        bottom-0
                        left-0
                        p-6
                        w-full
                      "
                  >
                    <p
                      className="
                          text-[#a855f7]
                          text-[10px]
                          font-mono
                          tracking-widest
                          uppercase
                          mb-1
                        "
                    >
                      Black & Grey
                    </p>

                    <h3
                      className="
                          text-lg
                          font-bold
                          text-white
                        "
                    >
                      Confirmed Judge
                    </h3>

                    <p
                      className="
                          text-xs
                          text-gray-400
                          mt-1
                        "
                    >
                      Location, Country
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="
              bg-[#0b0b0f]
              border
              border-white/10
              rounded-2xl
              p-8
              md:p-12
              text-center
              max-w-4xl
              mx-auto
            "
          >
            <h4
              className="
                text-lg
                font-bold
                text-white
                mb-4
              "
            >
              PROFESSIONAL JUDGING SYSTEM
            </h4>

            <p
              className="
                text-gray-400
                font-light
                mb-8
              "
            >
              Ink Convention judging is based on published competition criteria
              designed to evaluate technical execution, composition, originality
              and artistic quality.
            </p>

            <Link
              to="/judging-criteria"
              className="
                text-xs
                font-mono
                tracking-widest
                text-[#a855f7]
                hover:text-white
                uppercase
                underline
                underline-offset-8
                decoration-white/20
              "
            >
              VIEW JUDGING CRITERIA
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          8. ARTIST RANKINGS
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
          9. ARTIST DISCOVERY
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
          10. HALL OF FAME
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
          11. SPONSORS
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
          12. FAQ
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
                q: "Who can enter Ink Convention?",
                a: "The competition is open to professional tattoo artists worldwide.",
              },
              {
                q: "Is the competition completely online?",
                a: "Yes, Ink Convention is a 100% digital-first competition platform.",
              },
              {
                q: "Can I enter multiple categories?",
                a: "Yes, you may submit entries into as many categories as you wish, provided each entry meets the category requirements.",
              },
              {
                q: "How are tattoos judged?",
                a: "Entries are evaluated by a panel of experienced industry professionals based on a published set of technical and artistic criteria.",
              },
              {
                q: "What do winners receive?",
                a: "Winners receive official awards, global recognition on the platform, leaderboard points, and prizes determined by the final prize pool.",
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

      {/* =====================================================
          13. FINAL CONVERSION
      ===================================================== */}

      <section
        className="
          w-full
          py-32
          px-6
          sm:px-10
          lg:px-12

          bg-gradient-to-t
          from-[#140a24]
          to-[#08080a]

          border-t
          border-[#a855f7]/20

          text-center
        "
      >
        <div
          className="
            max-w-4xl
            mx-auto
            space-y-8
          "
        >
          <h2
            className="
              text-4xl
              sm:text-5xl
              font-black
              tracking-tight
              text-white
              uppercase
              leading-tight
            "
          >
            READY TO PUT YOUR WORK ON THE WORLD STAGE?
          </h2>

          <p
            className="
              text-gray-300
              text-lg
              font-light
            "
          >
            Choose how you want to participate in Ink Convention 2026.
          </p>

          {/* =================================================
              SAME 3 ACTIONS
          ================================================= */}

          <div
            className="
              flex
              flex-col
              lg:flex-row

              items-stretch
              lg:items-center

              justify-center

              gap-4

              pt-6
            "
          >
            {/* 1 BOOK STALL */}

            <Link
              to="/contact"
              className="
                group

                w-full
                lg:w-auto

                bg-white
                hover:bg-gray-200

                text-black

                px-8
                py-5

                rounded-xl

                font-black

                text-xs
                font-mono

                uppercase

                tracking-widest

                flex
                items-center
                justify-center
                gap-3

                transition-all
                duration-300

                hover:-translate-y-1
              "
            >
              BOOK YOUR STALL
              <ArrowRight
                size={14}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>

            {/* 2 COMPETITION */}

            <Link
              to="/upload"
              className="
                group

                w-full
                lg:w-auto

                bg-[#a855f7]
                hover:bg-[#9333ea]

                text-white

                px-8
                py-5

                rounded-xl

                font-black

                text-xs
                font-mono

                uppercase

                tracking-widest

                flex
                items-center
                justify-center
                gap-3

                transition-all
                duration-300

                hover:-translate-y-1

                shadow-lg
                shadow-purple-900/50
              "
            >
              GO TO THE COMPETITION
              <ArrowRight
                size={14}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>

            {/* 3 FREE ENTRY */}

            <Link
              to="/Enter"
              className="
                group

                w-full
                lg:w-auto

                bg-transparent

                border
                border-[#a855f7]

                hover:bg-[#a855f7]/10

                text-white

                px-8
                py-5

                rounded-xl

                font-black

                text-xs
                font-mono

                uppercase

                tracking-widest

                flex
                items-center
                justify-center
                gap-3

                transition-all
                duration-300

                hover:-translate-y-1
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
              GET A FREE ENTRY
              <ArrowRight
                size={14}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {/* ROUTE EXPLANATION */}

          <div
            className="
              pt-8

              grid
              grid-cols-1
              sm:grid-cols-3

              gap-4

              text-left
            "
          >
            <div
              className="
                border-t
                border-white/10
                pt-4
              "
            >
              <p
                className="
                  text-[9px]
                  font-mono
                  text-gray-600
                  tracking-widest
                "
              >
                01 / EXHIBIT
              </p>

              <p
                className="
                  text-sm
                  text-gray-400
                  mt-2
                "
              >
                Reserve a stall for your studio, brand or business.
              </p>
            </div>

            <div
              className="
                border-t
                border-white/10
                pt-4
              "
            >
              <p
                className="
                  text-[9px]
                  font-mono
                  text-[#a855f7]
                  tracking-widest
                "
              >
                02 / COMPETE
              </p>

              <p
                className="
                  text-sm
                  text-gray-400
                  mt-2
                "
              >
                Submit your tattoo work and enter the competition.
              </p>
            </div>

            <div
              className="
                border-t
                border-white/10
                pt-4
              "
            >
              <p
                className="
                  text-[9px]
                  font-mono
                  text-[#a855f7]
                  tracking-widest
                "
              >
                03 / JOIN
              </p>

              <p
                className="
                  text-sm
                  text-gray-400
                  mt-2
                "
              >
                Create your artist profile and start with a free directory
                entry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
