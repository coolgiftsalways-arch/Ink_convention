import { useMemo, useState } from "react";

import {
  Sparkles,
  X,
  MapPin,
  Share2,
  Heart,
  Link as LinkIcon,
  User,
  ChevronRight,
  Play,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../Style/Gallery.css";

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
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [selectedItem, setSelectedItem] = useState(null);

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
          TOP HERO
          LEFT = GALLERY
          RIGHT = 3 BUTTONS
      ===================================================== */}

      <section
        className="
          relative

          max-w-7xl

          mx-auto

          px-5
          sm:px-8
          lg:px-12

          pb-16
        "
      >
        {/* PURPLE GLOW */}

        <div
          className="
            absolute

            top-[-100px]
            right-[-100px]

            w-[500px]
            h-[500px]

            bg-[#a855f7]/10

            blur-[150px]

            rounded-full

            pointer-events-none
          "
        />

        <div
          className="
            relative
            z-10

            grid

            grid-cols-1

            lg:grid-cols-[minmax(0,1fr)_430px]

            xl:grid-cols-[minmax(0,1fr)_480px]

            gap-12
            lg:gap-16

            items-start
          "
        >
          {/* =================================================
              LEFT HERO
          ================================================= */}

          <div
            className="
              max-w-3xl

              lg:pt-6
            "
          >
            {/* BADGE */}

            <div
              className="
                inline-flex

                items-center

                gap-2

                px-3.5
                py-1.5

                rounded-full

                bg-purple-500/10

                border
                border-purple-500/20

                text-[#a855f7]

                text-[10px]
                sm:text-xs

                font-mono

                uppercase

                tracking-widest
              "
            >
              <Sparkles size={13} />
              INK CONVENTION GALLERY
            </div>

            {/* TITLE */}

            <h1
              className="
                mt-7

                text-[clamp(3.8rem,8vw,7.5rem)]

                font-black

                tracking-[-0.075em]

                text-white

                uppercase

                leading-[0.78]
              "
            >
              ART.
              <br />
              <span
                className="
                  text-[#a855f7]
                "
              >
                IN MOTION.
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-8

                max-w-xl

                text-gray-400

                text-sm
                sm:text-lg

                font-light

                leading-relaxed
              "
            >
              Explore photos and videos from Ink Convention artists, tattoo work
              and moments from the community.
            </p>

            <p
              className="
                mt-5

                text-[#a855f7]

                text-[9px]

                font-mono

                tracking-[0.2em]

                uppercase
              "
            >
              PHOTOS • VIDEOS • ARTISTS • INK CONVENTION 2026
            </p>
          </div>

          {/* =================================================
              RIGHT SIDE CTA
          ================================================= */}

          <div
            className="
              relative

              w-full

              bg-[#0c0c11]/80

              backdrop-blur-xl

              border
              border-white/10

              rounded-[26px]

              p-5
              sm:p-6

              shadow-[0_30px_100px_rgba(0,0,0,0.35)]
            "
          >
            {/* TOP */}

            <div
              className="
                mb-6

                pb-5

                border-b
                border-white/10
              "
            >
              <p
                className="
                  text-[#a855f7]

                  text-[8px]

                  font-mono

                  tracking-[0.22em]

                  uppercase
                "
              >
                INK CONVENTION 2026
              </p>

              <h2
                className="
                  mt-3

                  text-2xl
                  sm:text-3xl

                  font-black

                  tracking-[-0.04em]

                  uppercase

                  leading-[0.95]
                "
              >
                BE PART OF THE
                <br />
                CONVENTION.
              </h2>

              <p
                className="
                  mt-4

                  text-xs

                  text-gray-500

                  leading-relaxed
                "
              >
                Choose how you want to participate.
              </p>
            </div>

            {/* =================================================
                BUTTON 1
                BOOK STALL
            ================================================= */}

            <Link
              to="/upcoming"
              className="
                group

                relative

                w-full

                min-h-[78px]

                bg-white

                hover:bg-gray-200

                text-black

                rounded-2xl

                px-5
                py-4

                flex

                items-center

                justify-between

                gap-4

                transition-all

                duration-300

                hover:-translate-y-1
              "
            >
              <div
                className="
                  text-left
                "
              >
                <p
                  className="
                    text-[7px]

                    font-mono

                    tracking-[0.16em]

                    text-black/40

                    uppercase

                    mb-1
                  "
                >
                  01 / EXHIBIT
                </p>

                <p
                  className="
                    text-[11px]

                    font-black

                    font-mono

                    tracking-[0.1em]

                    uppercase
                  "
                >
                  BOOK YOUR STALL
                </p>
              </div>

              <div
                className="
                  w-10
                  h-10

                  shrink-0

                  bg-black

                  text-white

                  rounded-full

                  flex

                  items-center

                  justify-center

                  transition-transform

                  duration-300

                  group-hover:translate-x-1
                "
              >
                <ChevronRight size={17} />
              </div>
            </Link>

            {/* DESCRIPTION */}

            <div
              className="
                py-4
                px-1

                border-b
                border-white/[0.06]
              "
            >
              <p
                className="
                  text-[9px]

                  font-mono

                  tracking-widest

                  text-gray-600

                  uppercase
                "
              >
                BOOK A STALL
              </p>

              <p
                className="
                  mt-1.5

                  text-[11px]

                  text-gray-500

                  leading-relaxed
                "
              >
                Reserve a place for your tattoo studio, brand or business.
              </p>
            </div>

            {/* =================================================
                BUTTON 2
                BOOK ARTISTS
            ================================================= */}

            <Link
              to="/artists"
              className="
                group

                relative

                overflow-hidden

                mt-4

                w-full

                min-h-[78px]

                bg-[#a855f7]

                hover:bg-[#9333ea]

                text-white

                rounded-2xl

                px-5
                py-4

                flex

                items-center

                justify-between

                gap-4

                transition-all

                duration-300

                hover:-translate-y-1

                shadow-[0_15px_45px_rgba(168,85,247,0.22)]
              "
            >
              {/* SHINE */}

              <span
                className="
                  absolute

                  inset-y-0

                  left-[-50%]

                  w-[30%]

                  bg-gradient-to-r

                  from-transparent

                  via-white/20

                  to-transparent

                  skew-x-[-20deg]

                  group-hover:left-[130%]

                  transition-all

                  duration-700

                  pointer-events-none
                "
              />

              <div
                className="
                  relative
                  z-10

                  text-left
                "
              >
                <p
                  className="
                    text-[7px]

                    font-mono

                    tracking-[0.16em]

                    text-white/60

                    uppercase

                    mb-1
                  "
                >
                  02 / DISCOVER
                </p>

                <p
                  className="
                    text-[11px]

                    font-black

                    font-mono

                    tracking-[0.08em]

                    uppercase
                  "
                >
                  BOOK ARTISTS
                </p>
              </div>

              <div
                className="
                  relative
                  z-10

                  w-10
                  h-10

                  shrink-0

                  bg-white

                  text-[#a855f7]

                  rounded-full

                  flex

                  items-center

                  justify-center

                  transition-transform

                  duration-300

                  group-hover:translate-x-1
                "
              >
                <ChevronRight size={17} />
              </div>
            </Link>

            {/* DESCRIPTION */}

            <div
              className="
                py-4
                px-1

                border-b
                border-white/[0.06]
              "
            >
              <p
                className="
                  text-[9px]

                  font-mono

                  tracking-widest

                  text-[#a855f7]

                  uppercase
                "
              >
                BOOK ARTISTS
              </p>

              <p
                className="
                  mt-1.5

                  text-[11px]

                  text-gray-500

                  leading-relaxed
                "
              >
                Discover tattoo artists and book the right artist for your next
                tattoo.
              </p>
            </div>

            {/* =================================================
                BUTTON 3
                FREE ENTRY
            ================================================= */}

            <Link
              to="/Enter"
              className="
                group

                relative

                mt-4

                w-full

                min-h-[78px]

                bg-[#111116]

                hover:bg-[#a855f7]/10

                border
                border-[#a855f7]/60

                hover:border-[#a855f7]

                text-white

                rounded-2xl

                px-5
                py-4

                flex

                items-center

                justify-between

                gap-4

                transition-all

                duration-300

                hover:-translate-y-1
              "
            >
              <div
                className="
                  text-left
                "
              >
                <div
                  className="
                    flex

                    items-center

                    gap-2

                    mb-1
                  "
                >
                  <span
                    className="
                      w-1.5
                      h-1.5

                      rounded-full

                      bg-[#a855f7]

                      animate-pulse

                      shadow-[0_0_10px_rgba(168,85,247,1)]
                    "
                  />

                  <p
                    className="
                      text-[7px]

                      font-mono

                      tracking-[0.16em]

                      text-[#a855f7]

                      uppercase
                    "
                  >
                    03 / JOIN
                  </p>
                </div>

                <p
                  className="
                    text-[11px]

                    font-black

                    font-mono

                    tracking-[0.1em]

                    uppercase
                  "
                >
                  GET A FREE ENTRY
                </p>
              </div>

              <div
                className="
                  w-10
                  h-10

                  shrink-0

                  bg-[#a855f7]

                  text-white

                  rounded-full

                  flex

                  items-center

                  justify-center

                  transition-transform

                  duration-300

                  group-hover:translate-x-1
                "
              >
                <ChevronRight size={17} />
              </div>
            </Link>

            {/* DESCRIPTION */}

            <div
              className="
                pt-4
                px-1
              "
            >
              <p
                className="
                  text-[9px]

                  font-mono

                  tracking-widest

                  text-[#a855f7]

                  uppercase
                "
              >
                FREE ARTIST ENTRY
              </p>

              <p
                className="
                  mt-1.5

                  text-[11px]

                  text-gray-500

                  leading-relaxed
                "
              >
                Create your artist profile and start with the free plan.
              </p>
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
        <div
          className="
            flex
            items-center
            justify-end
            gap-2
            flex-wrap
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
                  min-w-[105px]
                  lg:min-w-[125px]
                  px-3
                  sm:px-6
                  py-3.5
                  rounded-xl
                  text-[9px]
                  sm:text-xs
                  font-black
                  font-mono
                  uppercase
                  tracking-[0.12em]
                  transition-all
                  duration-300
                  ${
                    active
                      ? `
                          bg-[#a855f7]
                          text-white
                          shadow-[0_0_25px_rgba(168,85,247,0.28)]
                        `
                      : `
                          bg-white/[0.04]
                          border
                          border-white/[0.06]
                          text-gray-500
                          hover:text-white
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
          POPUP
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

            p-4
            sm:p-6
          "
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="
              relative

              max-w-6xl

              w-full

              max-h-[94vh]

              bg-[#0b0b0f]

              border
              border-white/10

              rounded-[28px]

              overflow-hidden

              shadow-2xl

              flex

              flex-col
              lg:flex-row
            "
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="
                absolute

                top-4
                right-4

                z-50

                w-11
                h-11

                rounded-full

                bg-black/70

                border
                border-white/20

                text-white

                flex

                items-center

                justify-center

                hover:bg-[#a855f7]

                hover:border-[#a855f7]

                transition
              "
            >
              <X size={20} />
            </button>

            {/* MEDIA */}

            <div
              className="
                w-full

                lg:w-[70%]

                h-[52vh]

                lg:h-[85vh]

                bg-[#050507]

                flex

                items-center

                justify-center
              "
            >
              {selectedItem.type === "video" ? (
                <video
                  src={selectedItem.image}
                  controls
                  autoPlay
                  playsInline
                  className="
                    max-w-full

                    max-h-full

                    object-contain
                  "
                />
              ) : (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="
                    max-w-full

                    max-h-full

                    object-contain
                  "
                />
              )}
            </div>

            {/* INFO */}

            <div
              className="
                w-full

                lg:w-[30%]

                max-h-[42vh]

                lg:max-h-[85vh]

                overflow-y-auto

                p-7
                lg:p-8

                bg-gradient-to-b

                from-[#0b0b0f]

                to-[#120a1f]
              "
            >
              {/* TYPE */}

              <div
                className="
                  flex

                  items-center

                  gap-2

                  mb-5
                "
              >
                <span
                  className="
                    text-[#a855f7]

                    text-[9px]

                    font-mono

                    tracking-widest

                    uppercase

                    bg-[#a855f7]/10

                    px-3
                    py-1.5

                    rounded-lg
                  "
                >
                  {selectedItem.type}
                </span>

                <span
                  className="
                    text-gray-600

                    text-[9px]

                    font-mono
                  "
                >
                  {selectedItem.season}
                </span>
              </div>

              {/* TITLE */}

              <h2
                className="
                  text-3xl

                  font-black

                  uppercase

                  leading-[0.95]
                "
              >
                {selectedItem.title}
              </h2>

              <p
                className="
                  mt-3

                  text-[#a855f7]

                  text-[10px]

                  font-mono

                  tracking-widest

                  uppercase
                "
              >
                {selectedItem.category}
              </p>

              <div
                className="
                  border-t

                  border-white/10

                  my-7
                "
              />

              {/* ARTIST */}

              <p
                className="
                  text-[9px]

                  font-mono

                  text-gray-600

                  tracking-widest

                  uppercase

                  mb-4
                "
              >
                ARTIST
              </p>

              <div
                className="
                  flex

                  items-center

                  gap-4
                "
              >
                <div
                  className="
                    w-12
                    h-12

                    rounded-full

                    bg-white/5

                    border
                    border-white/10

                    flex

                    items-center

                    justify-center
                  "
                >
                  <User
                    size={19}
                    className="
                      text-gray-500
                    "
                  />
                </div>

                <div
                  className="
                    min-w-0
                  "
                >
                  <h3
                    className="
                      text-sm

                      font-bold

                      truncate
                    "
                  >
                    {selectedItem.artistName}
                  </h3>

                  <p
                    className="
                      mt-1

                      text-[11px]

                      text-gray-500

                      flex

                      items-center

                      gap-1
                    "
                  >
                    <MapPin
                      size={11}
                      className="
                        text-[#a855f7]
                      "
                    />

                    {selectedItem.city}
                  </p>
                </div>
              </div>

              {/* ARTIST PAGE */}

              <Link
                to="/artists"
                className="
                  mt-6

                  w-full

                  flex

                  items-center

                  justify-center

                  gap-2

                  border

                  border-white/10

                  hover:border-[#a855f7]

                  hover:bg-[#a855f7]/10

                  rounded-xl

                  px-4

                  py-3

                  text-[10px]

                  font-mono

                  uppercase

                  tracking-widest

                  transition
                "
              >
                VIEW ARTIST
                <ChevronRight size={13} />
              </Link>

              <div
                className="
                  border-t

                  border-white/10

                  my-7
                "
              />

              {/* SHARE */}

              <p
                className="
                  text-[9px]

                  font-mono

                  text-gray-600

                  tracking-widest

                  uppercase

                  mb-4
                "
              >
                SHARE
              </p>

              <div
                className="
                  grid

                  grid-cols-3

                  gap-2
                "
              >
                <button
                  type="button"
                  className="
                    bg-white/5

                    hover:bg-white/10

                    border

                    border-white/5

                    rounded-xl

                    py-3

                    flex

                    items-center

                    justify-center

                    transition
                  "
                >
                  <Heart size={16} />
                </button>

                <button
                  type="button"
                  className="
                    bg-white/5

                    hover:bg-white/10

                    border

                    border-white/5

                    rounded-xl

                    py-3

                    flex

                    items-center

                    justify-center

                    transition
                  "
                >
                  <Share2 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="
                    bg-white/5

                    hover:bg-white/10

                    border

                    border-white/5

                    rounded-xl

                    py-3

                    flex

                    items-center

                    justify-center

                    transition
                  "
                >
                  <LinkIcon size={16} />
                </button>
              </div>

              <p
                className="
                  pt-8

                  text-[9px]

                  text-gray-700

                  font-mono

                  text-center
                "
              >
                INK ID: {selectedItem.id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
