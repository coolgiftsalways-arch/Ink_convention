import { useEffect, useMemo, useRef, useState } from "react";

import { Sparkles, X, User, ChevronRight, Play } from "lucide-react";

import { Link } from "react-router-dom";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import "../Style/Gallery.css";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   PHOTOS
========================================================= */

import GAll1 from "../assets/gall1.jpg";
import GAll3 from "../assets/gall3.jpg";
import GAll4 from "../assets/gall4.jpg";
import GAll5 from "../assets/gall5.JPG";
import GAll6 from "../assets/gall6.PNG";
import GAll7 from "../assets/gall7.jpg";
import GAll8 from "../assets/gall8.jpg";
import GAll9 from "../assets/gall9.jpg";
import GAll11 from "../assets/gall11.jpg";
import GAll12 from "../assets/gall12.jpg";
import GAll13 from "../assets/gall13.jpg";
import GAll14 from "../assets/gall14.jpg";
import GAll15 from "../assets/gall15.jpg";
import GAll16 from "../assets/gall16.jpg";
import GAll17 from "../assets/gall17.jpg";
import GAll19 from "../assets/gall19.JPG";
import GAll20 from "../assets/gall20.JPG";
import GAll21 from "../assets/gall21.JPG";
import GAll22 from "../assets/gall22.JPG";
import GAll23 from "../assets/gall23.JPG";
import GAll24 from "../assets/gall24.JPG";
import GAll25 from "../assets/gall25.jpg";
import GAll26 from "../assets/gall26.jpg";
import GAll27 from "../assets/gall27.jpg";
import GAll28 from "../assets/gall28.jpg";
import GAll29 from "../assets/gall29.jpg";
import GAll30 from "../assets/gall30.jpg";
import GAll32 from "../assets/gall32.jpg";
import GAll33 from "../assets/gall33.jpg";
import GAll34 from "../assets/gall34.jpg";
import GAll35 from "../assets/gall35.jpg";
import GAll36 from "../assets/gall36.jpg";
import GAll37 from "../assets/gall37.jpg";
import GAll38 from "../assets/gall38.jpg";
import GAll39 from "../assets/gall39.jpg";
import GAll40 from "../assets/gall40.jpg";
import GAll41 from "../assets/gall41.jpg";
import GAll42 from "../assets/gall42.jpg";
import GAll43 from "../assets/gall43.jpg";
import GAll44 from "../assets/gall44.jpg";
import GAll45 from "../assets/gall45.jpg";
import GAll46 from "../assets/last.jpeg";

/* =========================================================
   VIDEOS
========================================================= */

import VELL1 from "../assets/gall1.mp4";
import VELL2 from "../assets/gall2.mp4";
import VELL3 from "../assets/gall3.mp4";
import VELL4 from "../assets/gall4.mp4";
import VELL5 from "../assets/gall5.mp4";
import VELL6 from "../assets/gall6.mp4";
import VELL7 from "../assets/gall7.mp4";
import VELL8 from "../assets/gall8.mp4";
import VELL9 from "../assets/gall9.mp4";
import VELL10 from "../assets/gall10.mp4";
import VELL11 from "../assets/gall11.mp4";
import VELL12 from "../assets/gall12.mp4";

/* =========================================================
   PHOTO DATA
========================================================= */

const photos = [
  { type: "photo", image: GAll1 },
  { type: "photo", image: GAll3 },
  { type: "photo", image: GAll4 },
  { type: "photo", image: GAll5 },
  { type: "photo", image: GAll6 },
  { type: "photo", image: GAll7 },
  { type: "photo", image: GAll8 },
  { type: "photo", image: GAll9 },
  { type: "photo", image: GAll11 },
  { type: "photo", image: GAll12 },
  { type: "photo", image: GAll13 },
  { type: "photo", image: GAll14 },
  { type: "photo", image: GAll15 },
  { type: "photo", image: GAll16 },
  { type: "photo", image: GAll17 },
  { type: "photo", image: GAll19 },
  { type: "photo", image: GAll20 },
  { type: "photo", image: GAll21 },
  { type: "photo", image: GAll22 },
  { type: "photo", image: GAll23 },
  { type: "photo", image: GAll24 },
  { type: "photo", image: GAll25 },
  { type: "photo", image: GAll26 },
  { type: "photo", image: GAll27 },
  { type: "photo", image: GAll28 },
  { type: "photo", image: GAll29 },
  { type: "photo", image: GAll30 },
  { type: "photo", image: GAll32 },
  { type: "photo", image: GAll33 },
  { type: "photo", image: GAll34 },
  { type: "photo", image: GAll35 },
  { type: "photo", image: GAll36 },
  { type: "photo", image: GAll37 },
  { type: "photo", image: GAll38 },
  { type: "photo", image: GAll39 },
  { type: "photo", image: GAll40 },
  { type: "photo", image: GAll41 },
  { type: "photo", image: GAll42 },
  { type: "photo", image: GAll43 },
  { type: "photo", image: GAll44 },
  { type: "photo", image: GAll45 },
  { type: "photo", image: GAll46 },
];

/* =========================================================
   VIDEO DATA
========================================================= */

const videos = [
  { type: "video", image: VELL1 },
  { type: "video", image: VELL2 },
  { type: "video", image: VELL3 },
  { type: "video", image: VELL4 },
  { type: "video", image: VELL5 },
  { type: "video", image: VELL6 },
  { type: "video", image: VELL7 },
  { type: "video", image: VELL8 },
  { type: "video", image: VELL9 },
  { type: "video", image: VELL10 },
  { type: "video", image: VELL11 },
  { type: "video", image: VELL12 },
];

/* =========================================================
   META DATA
========================================================= */

const ARTISTS = [
  "Vikram Singh",
  "Priya Sharma",
  "Rahul Desai",
  "Elena Rodriguez",
  "Amit Patel",
  "Sarah Chen",
  "David O'Connor",
];

const CITIES = [
  "Mumbai, India",
  "Delhi, India",
  "Bangalore, India",
  "London, UK",
  "New York, USA",
  "Berlin, Germany",
];

const TITLES = [
  "Midnight Lotus",
  "Urban Jungle",
  "Sacred Geometry",
  "Fierce Tiger",
  "Delicate Rose",
  "Cyberpunk Sleeve",
  "Traditional Anchor",
];

const CATEGORIES = [
  "Black & Grey",
  "Realism",
  "Colour",
  "Fine Line",
  "Traditional",
  "Neo-Traditional",
  "Japanese",
  "Ornamental",
];

/* =========================================================
   CREATE GALLERY
========================================================= */

function createGallery() {
  const result = [];

  let photoIndex = 0;
  let videoIndex = 0;

  while (photoIndex < photos.length || videoIndex < videos.length) {
    if (videoIndex < videos.length) {
      result.push(videos[videoIndex]);

      videoIndex += 1;
    }

    for (let count = 0; count < 3; count += 1) {
      if (photoIndex < photos.length) {
        result.push(photos[photoIndex]);

        photoIndex += 1;
      }
    }
  }

  return result.map((item, index) => ({
    ...item,

    id: `INK-${1000 + index}`,

    artistName: ARTISTS[index % ARTISTS.length],

    title: TITLES[index % TITLES.length],

    category: CATEGORIES[index % CATEGORIES.length],

    city: CITIES[index % CITIES.length],

    season: "2026",
  }));
}

const galleryProjects = createGallery();

/* =========================================================
   FILTERS
========================================================= */

const FILTERS = ["ALL", "PHOTOS", "VIDEOS"];

/* =========================================================
   GALLERY
========================================================= */

function Gallery() {
  const galleryHeroRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState("ALL");

  const [selectedItem, setSelectedItem] = useState(null);

  /* =========================================================
     GALLERY HERO — GSAP + MOBILE SCROLL TRIGGER

     DESKTOP / TABLET:
     - 3 collage images fall immediately when page opens.

     MOBILE:
     - collage stays hidden while it is below the screen.
     - when user scrolls down to the collage, the images
       fall from the top ONE BY ONE.
     - animation happens only once for that page visit.
  ========================================================= */

  useEffect(() => {
    if (!galleryHeroRef.current) return undefined;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* =====================================================
         LEFT HERO — ALWAYS STARTS IMMEDIATELY
      ===================================================== */

      const heroTl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      heroTl
        .fromTo(
          ".galleryHero__badge",
          {
            opacity: 0,
            y: 10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
          },
        )
        .fromTo(
          ".galleryHero__titleLine",
          {
            opacity: 0,
            y: 34,
            clipPath: "inset(100% 0 0 0)",
          },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0 0 0)",
            duration: 0.55,
            stagger: 0.08,
          },
          "-=0.12",
        )
        .fromTo(
          ".galleryHero__copy",
          {
            opacity: 0,
            y: 10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
          },
          "-=0.28",
        )
        .fromTo(
          ".galleryHero__stallCta",
          {
            opacity: 0,
            y: 10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
          },
          "-=0.18",
        );

      /* =====================================================
         FUNCTION — FALL 3 IMAGES ONE BY ONE
      ===================================================== */

      const playGalleryFall = () => {
        const fallTl = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        fallTl
          .fromTo(
            [".gallerySvg__fall1", ".gallerySvg__fall2", ".gallerySvg__fall3"],
            {
              opacity: 0,
              y: -260,
              scale: 0.94,
              rotation: (index) => [-5, 4, -3][index % 3],
              transformOrigin: "50% 50%",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.72,
              stagger: 0.28,
              ease: "back.out(1.25)",
              clearProps: "transform",
            },
          )
          .fromTo(
            ".gallerySvg__line",
            {
              strokeDasharray: 900,
              strokeDashoffset: 900,
              opacity: 0,
            },
            {
              strokeDashoffset: 0,
              opacity: 0.85,
              duration: 0.65,
              stagger: 0.06,
              ease: "power2.inOut",
            },
            "-=0.35",
          )
          .fromTo(
            ".gallerySvg__label",
            {
              opacity: 0,
              y: 8,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.05,
            },
            "-=0.22",
          );

        return fallTl;
      };

      /* =====================================================
         DESKTOP / TABLET
         Play immediately when page opens.
      ===================================================== */

      mm.add("(min-width: 768px)", () => {
        playGalleryFall();
      });

      /* =====================================================
         MOBILE ONLY
         Wait until user scrolls to the collage.
      ===================================================== */

      mm.add("(max-width: 767px)", () => {
        const fallCards = [
          ".gallerySvg__fall1",
          ".gallerySvg__fall2",
          ".gallerySvg__fall3",
        ];

        /*
          Start the cards above their final position.
          User will not see them frozen before reaching this section.
        */
        gsap.set(fallCards, {
          opacity: 0,
          y: -220,
          scale: 0.95,
        });

        gsap.set(".gallerySvg__line", {
          strokeDasharray: 900,
          strokeDashoffset: 900,
          opacity: 0,
        });

        gsap.set(".gallerySvg__label", {
          opacity: 0,
          y: 8,
        });

        const mobileTrigger = ScrollTrigger.create({
          trigger: ".gallerySvg__trigger",

          /*
            Animation starts when the top of the collage reaches
            around 82% of the phone viewport.
          */
          start: "top 82%",

          /*
            IMPORTANT:
            only once while this Gallery page is open.
          */
          once: true,

          onEnter: () => {
            playGalleryFall();
          },
        });

        return () => {
          mobileTrigger.kill();
        };
      });

      /* =====================================================
         SMALL PARTICLE MOTION
         Cards themselves remain still after landing.
      ===================================================== */

      gsap.to(".gallerySvg__dot", {
        opacity: 0.25,
        scale: 0.8,
        transformOrigin: "50% 50%",
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        stagger: 0.18,
        ease: "sine.inOut",
      });
    }, galleryHeroRef);

    /*
      Refresh after DOM/layout is ready.
      Helpful on phone after navbar / images determine height.
    */
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredProjects = useMemo(() => {
    return galleryProjects.filter((item) => {
      if (activeFilter === "PHOTOS" && item.type !== "photo") {
        return false;
      }

      if (activeFilter === "VIDEOS" && item.type !== "video") {
        return false;
      }

      return true;
    });
  }, [activeFilter]);

  return (
    <div
      className="
        w-full

        min-h-screen

        bg-[#08080a]

        text-white

        pt-28
        sm:pt-32

        overflow-x-hidden

        font-sans
      "
    >
      {/* =====================================================
          TOP HERO — CINEMATIC TATTOO POSTER
      ===================================================== */}

      <section
        ref={galleryHeroRef}
        className="
          relative
          max-w-[1500px]
          mx-auto
          px-5
          sm:px-8
          lg:px-12
          pb-16
        "
      >
        {/* BIG AMBIENT LIGHT */}
        <div
          className="
            absolute
            -top-32
            right-[-8%]
            w-[720px]
            h-[720px]
            rounded-full
            bg-[#7e22ce]/10
            blur-[150px]
            pointer-events-none
          "
        />

        <div
          className="
            relative
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.06]
            bg-[#070709]
            min-h-[650px]
            lg:min-h-[680px]
            shadow-[0_40px_140px_rgba(0,0,0,0.42)]
          "
        >
          {/* subtle grid / texture */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.055]
              pointer-events-none
              [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)]
              [background-size:44px_44px]
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-[#060608]
              via-[#08080a]/92
              to-[#12091b]/86
              pointer-events-none
            "
          />

          {/* =================================================
              LEFT FADED TATTOO COLLAGE
          ================================================= */}

          <div
            className="
              absolute
              left-0
              top-0
              bottom-0
              w-[16%]
              hidden
              lg:block
              overflow-hidden
              pointer-events-none
              opacity-30
            "
          >
            <img
              src={GAll6}
              alt=""
              className="
                absolute
                inset-0
                w-full
                h-[56%]
                object-cover
                grayscale
                contrast-125
                brightness-50
                [mask-image:linear-gradient(to_right,black,transparent)]
              "
            />

            <img
              src={GAll20}
              alt=""
              className="
                absolute
                left-0
                bottom-0
                w-full
                h-[52%]
                object-cover
                grayscale
                contrast-125
                brightness-45
                [mask-image:linear-gradient(to_right,black,transparent)]
              "
            />
          </div>

          {/* =================================================
              MAIN LAYOUT
          ================================================= */}

          <div
            className="
              relative
              z-10
              grid
              grid-cols-1
              lg:grid-cols-[minmax(0,1.03fr)_minmax(440px,0.97fr)]
              min-h-[650px]
              lg:min-h-[680px]
            "
          >
            {/* =================================================
                LEFT COPY
            ================================================= */}

            <div
              className="
                relative
                flex
                flex-col
                justify-center
                px-6
                sm:px-10
                lg:pl-16
                lg:pr-4
                py-12
                lg:py-14
              "
            >
              <div
                className="
                  galleryHero__badge
                  inline-flex
                  self-start
                  items-center
                  gap-2
                  px-3.5
                  py-1.5
                  rounded-full
                  border
                  border-[#a855f7]/30
                  bg-[#a855f7]/10
                  text-[#c084fc]
                  text-[9px]
                  sm:text-[10px]
                  font-mono
                  uppercase
                  tracking-[0.18em]
                "
              >
                <Sparkles size={13} />
                INK CONVENTION GALLERY
              </div>

              <h1
                className="
                  mt-8
                  uppercase
                  font-black
                  tracking-[-0.07em]
                  leading-[0.78]
                  text-white
                "
              >
                <span
                  className="
                    galleryHero__titleLine
                    block
                    text-[clamp(4.4rem,7.2vw,7.8rem)]
                  "
                >
                  ART.
                </span>

                <span
                  className="
                    galleryHero__titleLine
                    block
                    mt-2
                    text-[clamp(4.0rem,6.8vw,7.1rem)]
                    text-[#a855f7]
                    drop-shadow-[0_0_32px_rgba(168,85,247,0.12)]
                  "
                >
                  IN MOTION.
                </span>
              </h1>

              <p
                className="
                  galleryHero__copy
                  mt-8
                  max-w-xl
                  text-sm
                  sm:text-base
                  lg:text-[17px]
                  text-gray-400
                  font-light
                  leading-relaxed
                "
              >
                Explore photos and videos from Ink Convention artists, tattoo
                work and moments from the community.
              </p>

              <p
                className="
                  galleryHero__copy
                  mt-5
                  text-[#a855f7]
                  text-[8px]
                  sm:text-[9px]
                  font-mono
                  tracking-[0.20em]
                  uppercase
                "
              >
                PHOTOS • VIDEOS • ARTISTS • INK CONVENTION 2026
              </p>

              {/* STALL CTA */}
              <Link
                to="/stall-booking"
                className="
                  galleryHero__stallCta
                  group
                  relative
                  mt-8
                  w-full
                  max-w-[760px]
                  min-h-[74px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#a855f7]/60
                  bg-gradient-to-r
                  from-[#111116]
                  via-[#15101d]
                  to-[#241039]
                  px-5
                  sm:px-6
                  flex
                  items-center
                  justify-between
                  gap-4
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#c084fc]
                  shadow-[0_16px_45px_rgba(168,85,247,0.10)]
                  hover:shadow-[0_20px_60px_rgba(168,85,247,0.20)]
                "
              >
                <span
                  className="
                    absolute
                    inset-y-0
                    left-[-50%]
                    w-[24%]
                    bg-gradient-to-r
                    from-transparent
                    via-white/15
                    to-transparent
                    skew-x-[-20deg]
                    group-hover:left-[130%]
                    transition-all
                    duration-700
                    pointer-events-none
                  "
                />

                <div className="relative z-10 flex items-center gap-4 min-w-0">
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-[#a855f7]
                      shadow-[0_0_14px_rgba(168,85,247,1)]
                      shrink-0
                    "
                  />

                  <div>
                    <p
                      className="
                        text-[7px]
                        sm:text-[8px]
                        font-mono
                        tracking-[0.18em]
                        text-[#c084fc]
                        uppercase
                        mb-1
                      "
                    >
                      01 / EXHIBIT AT INK CONVENTION
                    </p>

                    <p
                      className="
                        text-[11px]
                        sm:text-[13px]
                        font-black
                        font-mono
                        tracking-[0.07em]
                        uppercase
                        text-white
                        whitespace-nowrap
                      "
                    >
                      BOOK YOUR STALL NOW
                    </p>
                  </div>
                </div>

                <div
                  className="
                    relative
                    z-10
                    w-11
                    h-11
                    shrink-0
                    rounded-full
                    bg-[#a855f7]
                    text-white
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-300
                    group-hover:translate-x-1
                    group-hover:scale-105
                    shadow-[0_10px_28px_rgba(168,85,247,0.28)]
                  "
                >
                  <ChevronRight size={18} />
                </div>
              </Link>

              <p
                className="
                  galleryHero__copy
                  mt-3
                  max-w-[760px]
                  text-[10px]
                  sm:text-[11px]
                  text-gray-500
                  leading-relaxed
                "
              >
                Reserve your space at an upcoming Ink Convention expo and
                showcase your work to artists, clients and the tattoo community.
              </p>
            </div>

            {/* =================================================
                RIGHT — SVG TATTOO ASSEMBLY
                Snake-like ink lines join and become an ornate clock tattoo.
            ================================================= */}

            <div
              className="
                gallerySvg__trigger
                relative
                min-h-[390px]
                sm:min-h-[450px]
                lg:min-h-full
                overflow-hidden
                border-t
                lg:border-t-0
                lg:border-l
                border-white/[0.05]
                bg-[#030304]
              "
            >
              <GalleryCollageSvg />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-5
          sm:px-8
          lg:px-12
          mb-12
        "
      >
        {/* FILTER BUTTONS — ALWAYS ONE HORIZONTAL ROW */}
        <div
          className="
            grid
            grid-cols-3
            gap-2
            sm:gap-3
            w-full
          "
        >
          {FILTERS.map((filter) => {
            const active = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`
                  w-full
                  min-w-0
                  px-2
                  sm:px-5
                  py-3.5
                  sm:py-4
                  rounded-xl
                  text-[9px]
                  sm:text-xs
                  font-black
                  font-mono
                  uppercase
                  tracking-[0.10em]
                  sm:tracking-[0.12em]
                  whitespace-nowrap
                  transition-all
                  duration-300

                  ${
                    active
                      ? `
                          bg-[#a855f7]
                          text-white
                          border
                          border-[#a855f7]
                          shadow-[0_0_25px_rgba(168,85,247,0.28)]
                        `
                      : `
                          bg-white/[0.04]
                          border
                          border-white/[0.08]
                          text-gray-500
                          hover:text-white
                          hover:border-[#a855f7]/35
                          hover:bg-white/[0.08]
                        `
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div
          className="
            flex
            items-center
            justify-between
            mt-5
            px-1
          "
        >
          <p
            className="
              text-[9px]
              font-mono
              text-gray-600
              tracking-[0.15em]
              uppercase
            "
          >
            {activeFilter}
          </p>

          <p
            className="
              text-[9px]
              font-mono
              text-[#a855f7]
              tracking-[0.15em]
              uppercase
            "
          >
            {filteredProjects.length} ITEMS
          </p>
        </div>
      </section>

      {/* =====================================================
          GALLERY GRID
      ===================================================== */}

      <section
        className="
          max-w-7xl

          mx-auto

          px-5
          sm:px-8
          lg:px-12

          pb-32
        "
      >
        {filteredProjects.length === 0 ? (
          <div
            className="
              min-h-[350px]

              bg-[#0b0b0f]

              border
              border-dashed
              border-white/10

              rounded-3xl

              flex

              flex-col

              items-center

              justify-center

              text-center
            "
          >
            <Sparkles
              size={40}
              className="
                text-gray-700
                mb-5
              "
            />

            <h3
              className="
                text-xl

                font-black

                uppercase

                tracking-widest
              "
            >
              NOTHING FOUND
            </h3>
          </div>
        ) : (
          <div
            className="
              grid

              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3

              gap-5
              sm:gap-7
            "
          >
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                onClick={() => setSelectedItem(project)}
                className="
                    group

                    relative

                    bg-[#0b0b0f]

                    rounded-[22px]

                    overflow-hidden

                    border
                    border-white/[0.06]

                    hover:border-[#a855f7]/50

                    transition-all

                    duration-500

                    cursor-pointer

                    hover:-translate-y-1
                  "
              >
                <div
                  className="
                      relative

                      w-full

                      h-[380px]
                      sm:h-[420px]

                      overflow-hidden

                      bg-[#050507]
                    "
                >
                  {/* VIDEO */}

                  {project.type === "video" ? (
                    <video
                      src={project.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="
                          w-full
                          h-full

                          object-cover

                          transition-transform

                          duration-700

                          group-hover:scale-105
                        "
                    />
                  ) : (
                    /* PHOTO */

                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="
                          w-full
                          h-full

                          object-cover

                          transition-transform

                          duration-700

                          group-hover:scale-105
                        "
                    />
                  )}

                  {/* DARK GRADIENT */}

                  <div
                    className="
                        absolute

                        inset-0

                        bg-gradient-to-t

                        from-black/95

                        via-black/10

                        to-transparent

                        pointer-events-none
                      "
                  />

                  {/* TYPE */}

                  <div
                    className="
                        absolute

                        top-4
                        right-4

                        z-10

                        bg-black/60

                        backdrop-blur-md

                        border
                        border-white/10

                        rounded-full

                        px-3
                        py-2

                        flex

                        items-center

                        gap-2

                        text-[9px]

                        font-mono

                        tracking-widest

                        uppercase
                      "
                  >
                    {project.type === "video" ? (
                      <>
                        <Play size={11} />
                        VIDEO
                      </>
                    ) : (
                      <>
                        <span
                          className="
                              w-1.5
                              h-1.5

                              rounded-full

                              bg-[#a855f7]
                            "
                        />
                        PHOTO
                      </>
                    )}
                  </div>

                  {/* INFO */}

                  <div
                    className="
                        absolute

                        left-0
                        right-0
                        bottom-0

                        p-6

                        z-10
                      "
                  >
                    <p
                      className="
                          text-[#a855f7]

                          text-[9px]

                          font-mono

                          tracking-widest

                          uppercase

                          mb-2
                        "
                    >
                      {project.category}
                    </p>

                    <h3
                      className="
                          text-xl

                          font-black

                          uppercase

                          truncate
                        "
                    >
                      {project.title}
                    </h3>

                    <div
                      className="
                          mt-3

                          flex

                          items-center

                          text-[11px]

                          text-gray-400
                        "
                    >
                      <User
                        size={12}
                        className="
                            mr-1.5

                            text-[#a855f7]
                          "
                      />

                      <span
                        className="
                            truncate
                          "
                      >
                        {project.artistName}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          MEDIA VIEWER POPUP
      ===================================================== */}

      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="
            fixed
            inset-0
            z-[9999]
            bg-black/95
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-3
            sm:p-6
          "
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="
              relative
              w-full
              h-full
              max-w-[1400px]
              max-h-[94vh]
              flex
              items-center
              justify-center
              overflow-hidden
              rounded-[24px]
              bg-black
              border
              border-white/10
              shadow-2xl
            "
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close media"
              className="
                absolute
                top-4
                right-4
                z-50
                w-12
                h-12
                rounded-full
                bg-black/75
                border
                border-white/25
                text-white
                flex
                items-center
                justify-center
                hover:bg-[#a855f7]
                hover:border-[#a855f7]
                transition
                backdrop-blur-md
              "
            >
              <X size={22} />
            </button>

            {selectedItem.type === "video" ? (
              <video
                src={selectedItem.image}
                controls
                autoPlay
                playsInline
                className="
                  w-full
                  h-full
                  object-contain
                  bg-black
                "
              />
            ) : (
              <img
                src={selectedItem.image}
                alt={selectedItem.title || "Gallery"}
                className="
                  w-full
                  h-full
                  object-contain
                  bg-black
                "
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   GALLERY COLLAGE SVG
   Real gallery images inside animated SVG frames.
   No video file required.
========================================================= */

function GalleryCollageSvg() {
  return (
    <div
      className="
        absolute
        inset-0
        overflow-hidden
        bg-[#030304]
        flex
        items-center
        justify-center
      "
    >
      {/* subtle ambient purple */}
      <div
        className="
          absolute
          right-[8%]
          top-[14%]
          w-[68%]
          aspect-square
          rounded-full
          bg-[#a855f7]/10
          blur-[120px]
          pointer-events-none
        "
      />

      <svg
        viewBox="0 0 760 680"
        className="
          relative
          z-20
          w-[92%]
          h-[92%]
          max-w-[720px]
          overflow-visible
        "
        aria-label="Animated Ink Convention gallery collage"
      >
        <defs>
          <clipPath id="galleryClipMain">
            <rect x="235" y="125" width="290" height="380" rx="26" />
          </clipPath>

          <clipPath id="galleryClipLeft">
            <rect x="85" y="255" width="190" height="250" rx="20" />
          </clipPath>

          <clipPath id="galleryClipRight">
            <rect x="500" y="220" width="175" height="230" rx="20" />
          </clipPath>

          <linearGradient id="galleryFrameStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="38%" stopColor="#c084fc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.35" />
          </linearGradient>

          <filter id="galleryGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* =====================================================
            DECORATIVE DRAWING LINES
        ===================================================== */}

        <path
          className="gallerySvg__line"
          d="M58 154
             C167 88 270 82 360 117
             C464 158 548 145 694 76"
          fill="none"
          stroke="#a855f7"
          strokeOpacity="0.38"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          className="gallerySvg__line"
          d="M74 580
             C196 628 314 619 401 580
             C500 536 598 538 696 592"
          fill="none"
          stroke="url(#galleryFrameStroke)"
          strokeOpacity="0.50"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* =====================================================
            LEFT SMALL FRAME
        ===================================================== */}

        <g
          className="
            gallerySvg__frame
            gallerySvg__sideFrameA
            gallerySvg__fall1
          "
        >
          <rect
            x="76"
            y="246"
            width="208"
            height="268"
            rx="24"
            fill="#08080b"
            stroke="#a855f7"
            strokeOpacity="0.42"
            strokeWidth="2"
          />

          <image
            href={GAll20}
            x="85"
            y="255"
            width="190"
            height="250"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#galleryClipLeft)"
            opacity="0.72"
          />

          <rect
            x="85"
            y="255"
            width="190"
            height="250"
            rx="20"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.10"
          />

          <text
            x="98"
            y="493"
            fill="#c084fc"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="2"
          >
            02 / TATTOO
          </text>
        </g>

        {/* =====================================================
            MAIN FRAME
        ===================================================== */}

        <g
          className="
            gallerySvg__frame
            gallerySvg__mainFrame
            gallerySvg__fall2
          "
        >
          <rect
            x="222"
            y="111"
            width="316"
            height="408"
            rx="31"
            fill="#08080b"
            stroke="url(#galleryFrameStroke)"
            strokeWidth="2.2"
            filter="url(#galleryGlow)"
          />

          <image
            href={GAll44}
            x="235"
            y="125"
            width="290"
            height="380"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#galleryClipMain)"
            opacity="0.90"
          />

          <rect
            x="235"
            y="125"
            width="290"
            height="380"
            rx="26"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.14"
          />

          {/* subtle dark lower gradient effect */}
          <rect
            x="235"
            y="388"
            width="290"
            height="117"
            rx="0"
            fill="#050507"
            fillOpacity="0.28"
          />

          <text
            x="252"
            y="485"
            fill="#ffffff"
            fillOpacity="0.88"
            fontSize="15"
            fontWeight="700"
            fontFamily="monospace"
            letterSpacing="2"
          >
            INK IN MOTION
          </text>

          <text
            x="252"
            y="503"
            fill="#a855f7"
            fontSize="7"
            fontFamily="monospace"
            letterSpacing="3"
          >
            INK CONVENTION 2026
          </text>
        </g>

        {/* =====================================================
            RIGHT SMALL FRAME
        ===================================================== */}

        <g
          className="
            gallerySvg__frame
            gallerySvg__sideFrameB
            gallerySvg__fall3
          "
        >
          <rect
            x="490"
            y="210"
            width="195"
            height="250"
            rx="24"
            fill="#08080b"
            stroke="#a855f7"
            strokeOpacity="0.48"
            strokeWidth="2"
          />

          <image
            href={GAll33}
            x="500"
            y="220"
            width="175"
            height="230"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#galleryClipRight)"
            opacity="0.72"
          />

          <rect
            x="500"
            y="220"
            width="175"
            height="230"
            rx="20"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.10"
          />

          <text
            x="515"
            y="438"
            fill="#c084fc"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="2"
          >
            03 / ARTIST
          </text>
        </g>

        {/* =====================================================
            SMALL GALLERY DETAILS
        ===================================================== */}

        <g className="gallerySvg__label">
          <text
            x="70"
            y="112"
            fill="#ffffff"
            fillOpacity="0.42"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="4"
          >
            CURATED MOMENTS
          </text>

          <text
            x="550"
            y="552"
            fill="#ffffff"
            fillOpacity="0.38"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="3"
          >
            ART • PEOPLE • INK
          </text>

          <text
            x="338"
            y="590"
            textAnchor="middle"
            fill="#a855f7"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="5"
          >
            GALLERY
          </text>
        </g>

        {/* dots / particles */}
        <g fill="#c084fc" filter="url(#galleryGlow)">
          <circle className="gallerySvg__dot" cx="114" cy="183" r="3" />
          <circle className="gallerySvg__dot" cx="174" cy="111" r="2" />
          <circle className="gallerySvg__dot" cx="609" cy="121" r="3.2" />
          <circle className="gallerySvg__dot" cx="678" cy="176" r="2.2" />
          <circle className="gallerySvg__dot" cx="612" cy="524" r="2.8" />
          <circle className="gallerySvg__dot" cx="160" cy="556" r="2.5" />
        </g>
      </svg>

      {/* top-right micro copy */}
      <div
        className="
          absolute
          z-30
          top-7
          right-7
          text-right
          pointer-events-none
        "
      >
        <p
          className="
            text-[7px]
            font-mono
            tracking-[0.30em]
            text-white/35
            uppercase
          "
        >
          STORIES IN INK
        </p>

        <div
          className="
            mt-3
            ml-auto
            w-10
            h-px
            bg-[#a855f7]/60
          "
        />
      </div>
    </div>
  );
}

export default Gallery;
