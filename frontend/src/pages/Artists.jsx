import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  Sparkles,
  MapPin,
  Search,
  ArrowRight,
  Users,
  MapPinned,
} from "lucide-react";

import gsap from "gsap";

// ======================================================
// STATIC ARTISTS
// ======================================================

const staticDirectoryArtists = [];

// ======================================================
// CITY / COMMUNITY COUNTERS
// Changes every 2 seconds
// ======================================================

const communityCounters = [
  {
    city: "MUMBAI",
    count: "2000+",
    state: "MAHARASHTRA",
  },
  {
    city: "PUNE",
    count: "1500+",
    state: "MAHARASHTRA",
  },
  {
    city: "DELHI",
    count: "1800+",
    state: "DELHI",
  },
  {
    city: "BENGALURU",
    count: "1700+",
    state: "KARNATAKA",
  },
  {
    city: "HYDERABAD",
    count: "1400+",
    state: "TELANGANA",
  },
  {
    city: "AHMEDABAD",
    count: "1200+",
    state: "GUJARAT",
  },
  {
    city: "JAIPUR",
    count: "1100+",
    state: "RAJASTHAN",
  },
  {
    city: "CHENNAI",
    count: "1300+",
    state: "TAMIL NADU",
  },
  {
    city: "KOLKATA",
    count: "1250+",
    state: "WEST BENGAL",
  },
  {
    city: "LUCKNOW",
    count: "950+",
    state: "UTTAR PRADESH",
  },
  {
    city: "INDORE",
    count: "850+",
    state: "MADHYA PRADESH",
  },
  {
    city: "SURAT",
    count: "900+",
    state: "GUJARAT",
  },
  {
    city: "CHANDIGARH",
    count: "750+",
    state: "CHANDIGARH",
  },
  {
    city: "KOCHI",
    count: "820+",
    state: "KERALA",
  },
  {
    city: "NAGPUR",
    count: "780+",
    state: "MAHARASHTRA",
  },
  {
    city: "AJMER",
    count: "650+",
    state: "RAJASTHAN",
  },
  {
    city: "GOA",
    count: "700+",
    state: "GOA",
  },
  {
    city: "BHOPAL",
    count: "620+",
    state: "MADHYA PRADESH",
  },
  {
    city: "PATNA",
    count: "600+",
    state: "BIHAR",
  },
  {
    city: "GUWAHATI",
    count: "550+",
    state: "ASSAM",
  },
];

// ======================================================
// COMPONENT
// ======================================================

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("");

  const [dynamicArtists, setDynamicArtists] = useState([]);

  // Counter
  const [counterIndex, setCounterIndex] = useState(0);

  const counterRef = useRef(null);
  const numberRef = useRef(null);
  const glowRef = useRef(null);

  // ======================================================
  // FETCH REGISTERED ARTISTS
  // ======================================================

  useEffect(() => {
    fetch("https://api.inkconvention.com/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          const formattedUsers = data.users.map((user) => ({
            name:
              user.professionalName ||
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              "Participant Artist",

            studio: user.studio || "Independent / Convention Participant",

            category: user.category || "CONVENTION COMPETITOR",

            city: user.city || "India",

            state: user.state || "",

            badge: "NEW ENTRY",

            year: "2026",

            metrics: user.experience
              ? `Experience: ${user.experience}`
              : "Convention Competitor",
          }));

          setDynamicArtists(formattedUsers);
        }
      })
      .catch((err) => {
        console.error("Failed to load registered artists:", err);
      });
  }, []);

  // ======================================================
  // CITY COUNTER - EVERY 2 SECONDS
  // ======================================================

  useEffect(() => {
    const timer = setInterval(() => {
      if (!counterRef.current) return;

      // Current city leaves
      gsap.to(counterRef.current, {
        opacity: 0,
        y: -25,
        filter: "blur(6px)",
        scale: 0.96,
        duration: 0.35,
        ease: "power2.in",

        onComplete: () => {
          setCounterIndex(
            (previous) => (previous + 1) % communityCounters.length,
          );
        },
      });
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ======================================================
  // NEW CITY ENTRANCE
  // ======================================================

  useEffect(() => {
    if (!counterRef.current) return;

    gsap.fromTo(
      counterRef.current,
      {
        opacity: 0,
        y: 30,
        filter: "blur(7px)",
        scale: 0.94,
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        scale: 1,
        duration: 0.65,
        ease: "back.out(1.7)",
      },
    );
  }, [counterIndex]);

  // ======================================================
  // NUMBER ATTENTION ANIMATION
  // ======================================================

  useEffect(() => {
    if (!numberRef.current) return;

    const numberAnimation = gsap.fromTo(
      numberRef.current,
      {
        scale: 0.85,
      },
      {
        scale: 1,
        duration: 0.6,
        ease: "back.out(2)",
      },
    );

    return () => {
      numberAnimation.kill();
    };
  }, [counterIndex]);

  // ======================================================
  // BACKGROUND GLOW
  // ======================================================

  useEffect(() => {
    if (!glowRef.current) return;

    const glowAnimation = gsap.to(glowRef.current, {
      scale: 1.15,
      opacity: 0.7,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "sine.inOut",
    });

    return () => {
      glowAnimation.kill();
    };
  }, []);

  // ======================================================
  // COMBINE ARTISTS
  // ======================================================

  const allDirectoryArtists = useMemo(() => {
    return [...dynamicArtists, ...staticDirectoryArtists];
  }, [dynamicArtists]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredArtists = useMemo(() => {
    if (!searchQuery) {
      return allDirectoryArtists;
    }

    const q = searchQuery.toLowerCase();

    return allDirectoryArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(q) ||
        artist.studio.toLowerCase().includes(q) ||
        artist.city.toLowerCase().includes(q) ||
        artist.category.toLowerCase().includes(q) ||
        artist.state.toLowerCase().includes(q),
    );
  }, [searchQuery, allDirectoryArtists]);

  const currentCounter = communityCounters[counterIndex];

  // ======================================================
  // JSX
  // ======================================================

  return (
    <div
      className="
        w-full
        min-h-screen
        bg-[#08080a]
        text-white
        select-none
        pt-32
        pb-24
        px-4
        sm:px-6
        lg:px-12
        font-sans
      "
    >
      <div
        className="
          max-w-[1700px]
          mx-auto
          space-y-12
        "
      >
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1fr_500px]
            gap-10
            xl:gap-20
            items-center
            border-b
            border-white/10
            pb-12
          "
        >
          {/* ================================================= */}
          {/* LEFT HERO */}
          {/* ================================================= */}

          <div className="space-y-4">
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
                text-xs
                font-mono
                uppercase
                tracking-widest
              "
            >
              <Sparkles size={14} />
              COMMUNITY NETWORK
            </div>

            <h1
              className="
                text-4xl
                sm:text-6xl
                md:text-7xl
                font-black
                tracking-tighter
                text-white
                uppercase
                leading-none
              "
            >
              ARTIST DIRECTORY
            </h1>

            <p
              className="
                text-gray-400
                text-sm
                sm:text-base
                font-light
                leading-relaxed
                max-w-2xl
              "
            >
              Discover tattoo artists, studios and creative professionals
              participating in or featured by the Ink Convention community.
            </p>
          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE ROTATING COUNTER */}
          {/* ================================================= */}

          <div
            className="
              relative
              w-full
              lg:max-w-[500px]
              lg:ml-auto
            "
          >
            {/* PURPLE GLOW */}

            <div
              ref={glowRef}
              className="
                absolute
                inset-0
                bg-purple-600/10
                blur-[70px]
                rounded-full
                pointer-events-none
              "
            />

            {/* CARD */}

            <div
              className="
                relative
                overflow-hidden
                bg-[#0b0b0f]
                border
                border-white/10
                rounded-3xl
                min-h-[230px]
                p-7
                sm:p-8
                flex
                flex-col
                justify-between
                group
              "
            >
              {/* TOP */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    sm:text-xs
                    font-mono
                    text-purple-400
                    tracking-[0.2em]
                    uppercase
                  "
                >
                  <Users size={15} />
                  OUR COMMUNITY
                </div>

                {/* LIVE */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-mono
                    text-gray-400
                    tracking-widest
                  "
                >
                  <span className="relative flex h-2.5 w-2.5">
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
                        h-2.5
                        w-2.5
                        bg-purple-500
                      "
                    />
                  </span>
                  LIVE
                </div>
              </div>

              {/* CHANGING CONTENT */}

              <div
                ref={counterRef}
                className="
                  relative
                  py-5
                "
              >
                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >
                  {/* CITY */}

                  <div>
                    <p
                      className="
                        text-gray-500
                        text-[10px]
                        sm:text-xs
                        font-mono
                        tracking-[0.25em]
                        uppercase
                        mb-2
                      "
                    >
                      OUR COMMUNITY IN
                    </p>

                    <h2
                      className="
                        text-3xl
                        sm:text-4xl
                        xl:text-5xl
                        font-black
                        tracking-tight
                        text-white
                        uppercase
                        leading-none
                      "
                    >
                      {currentCounter.city}
                    </h2>
                  </div>

                  {/* NUMBER */}

                  <div
                    ref={numberRef}
                    className="
                      text-right
                    "
                  >
                    <h3
                      className="
                        text-4xl
                        sm:text-5xl
                        xl:text-6xl
                        font-black
                        text-[#a855f7]
                        leading-none
                        drop-shadow-[0_0_25px_rgba(168,85,247,0.45)]
                      "
                    >
                      {currentCounter.count}
                    </h3>
                  </div>
                </div>

                {/* STATE */}

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    mt-4
                    text-gray-500
                    text-[10px]
                    sm:text-xs
                    font-mono
                    uppercase
                    tracking-widest
                  "
                >
                  <MapPinned size={13} className="text-purple-500" />

                  {currentCounter.state}
                </div>
              </div>

              {/* BOTTOM */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-white/10
                  pt-4
                "
              >
                <span
                  className="
                    text-[9px]
                    sm:text-[10px]
                    font-mono
                    text-gray-500
                    uppercase
                    tracking-[0.15em]
                  "
                >
                  Artists • Studios • Creators
                </span>

                {/* 01 / 20 */}

                <span
                  className="
                    text-[10px]
                    font-mono
                    text-purple-400
                  "
                >
                  {String(counterIndex + 1).padStart(2, "0")}/
                  {String(communityCounters.length).padStart(2, "0")}
                </span>
              </div>

              {/* DECORATIVE NUMBER */}

              <div
                className="
                  absolute
                  -right-4
                  -bottom-14
                  text-[130px]
                  leading-none
                  font-black
                  text-white/[0.015]
                  pointer-events-none
                "
              >
                {String(counterIndex + 1).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* SEARCH + FREE ENTRY */}
        {/* ================================================= */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            justify-between
            items-stretch
            sm:items-center
            gap-4
            bg-[#0b0b0f]
            p-4
            sm:p-6
            rounded-2xl
            border
            border-white/5
            shadow-xl
          "
        >
          {/* SEARCH */}

          <div
            className="
              relative
              w-full
              sm:w-[430px]
            "
          >
            <Search
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
              size={18}
            />

            <input
              type="text"
              placeholder="SEARCH ARTISTS, STUDIOS, CITIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                bg-black/50
                border
                border-white/10
                rounded-xl
                pl-12
                pr-4
                py-3.5
                text-white
                text-xs
                font-mono
                placeholder:text-gray-600
                focus:outline-none
                focus:border-[#a855f7]
                focus:shadow-[0_0_20px_rgba(168,85,247,0.12)]
                transition-all
                duration-300
              "
            />
          </div>

          {/* ================================================= */}
          {/* GET FREE ENTRY */}
          {/* ================================================= */}

          <Link
            to="/Enter"
            className="
              relative
              overflow-hidden
              group
              min-w-[190px]
              bg-[#a855f7]
              hover:bg-[#9333ea]
              text-white
              rounded-xl
              px-6
              py-3.5
              flex
              items-center
              justify-center
              gap-3
              font-black
              text-xs
              tracking-[0.14em]
              uppercase
              transition-all
              duration-300
              hover:scale-[1.03]
              shadow-[0_0_25px_rgba(168,85,247,0.25)]
              hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]
            "
          >
            {/* SHIMMER */}

            <span
              className="
                absolute
                top-0
                -left-[100%]
                w-[70%]
                h-full
                bg-gradient-to-r
                from-transparent
                via-white/25
                to-transparent
                skew-x-[-20deg]
                group-hover:left-[150%]
                transition-all
                duration-700
              "
            />

            <span className="relative z-10">GET FREE ENTRY</span>

            <ArrowRight
              size={17}
              className="
                relative
                z-10
                transition-transform
                duration-300
                group-hover:translate-x-1.5
              "
            />
          </Link>
        </div>

        {/* ================================================= */}
        {/* ARTIST GRID / EMPTY */}
        {/* ================================================= */}

        {filteredArtists.length === 0 ? (
          <div
            className="
              text-center
              py-20
              bg-[#0b0b0f]
              border
              border-dashed
              border-white/10
              rounded-3xl
            "
          >
            <Search
              className="
                mx-auto
                text-gray-600
                mb-4
              "
              size={40}
            />

            <h3
              className="
                text-xl
                font-bold
                text-white
                uppercase
                tracking-widest
              "
            >
              NO ARTISTS FOUND
            </h3>

            <p
              className="
                text-gray-500
                font-light
                mt-2
              "
            >
              Try searching by a different name, city, or style.
            </p>

            {/* ALSO FREE ENTRY HERE */}

            <Link
              to="/Enter"
              className="
                inline-flex
                items-center
                gap-2
                mt-7
                text-xs
                font-black
                tracking-widest
                uppercase
                text-purple-400
                hover:text-purple-300
                transition
              "
            >
              Become part of the community
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-6
            "
          >
            {filteredArtists.map((artist, index) => {
              const globalIndex = index + 1;

              return (
                <div
                  key={`${artist.name}-${index}`}
                  className="
                      group
                      relative
                      bg-[#0b0b0f]
                      rounded-3xl
                      p-6
                      border
                      border-white/5
                      hover:border-[#a855f7]/50
                      transition-all
                      duration-500
                      shadow-2xl
                      flex
                      flex-col
                      justify-between
                      space-y-6
                      overflow-hidden
                    "
                >
                  {/* GLOW */}

                  <div
                    className="
                        absolute
                        -right-20
                        -top-20
                        w-48
                        h-48
                        bg-[#a855f7]/10
                        rounded-full
                        blur-2xl
                        group-hover:bg-[#a855f7]/20
                        transition-all
                        duration-500
                        pointer-events-none
                      "
                  />

                  <div className="space-y-4 relative z-10">
                    {/* NUMBER + BADGE */}

                    <div
                      className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                    >
                      <span
                        className="
                            w-8
                            h-8
                            rounded-full
                            text-[11px]
                            font-mono
                            font-black
                            flex
                            items-center
                            justify-center
                            bg-[#a855f7]/20
                            border
                            border-[#a855f7]/40
                            text-[#a855f7]
                          "
                      >
                        #{globalIndex}
                      </span>

                      {artist.badge && (
                        <span
                          className={`
                              text-[10px]
                              font-mono
                              uppercase
                              tracking-wider
                              px-3
                              py-1
                              rounded-full
                              shadow-lg

                              ${
                                artist.badge === "NEW ENTRY"
                                  ? "bg-purple-600 text-white animate-pulse"
                                  : "bg-[#a855f7] text-white"
                              }
                            `}
                        >
                          {artist.badge}
                        </span>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div className="space-y-2">
                      <p
                        className="
                            text-[11px]
                            font-mono
                            text-[#a855f7]
                            uppercase
                            tracking-wider
                            truncate
                          "
                      >
                        {artist.category}
                      </p>

                      <h3
                        className="
                            text-xl
                            font-black
                            text-white
                            group-hover:text-[#a855f7]
                            transition
                            duration-300
                          "
                      >
                        {artist.name}
                      </h3>

                      <p
                        className="
                            text-xs
                            text-gray-400
                            font-medium
                          "
                      >
                        {artist.studio}
                      </p>
                    </div>

                    {/* LOCATION */}

                    <div
                      className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          font-medium
                          text-gray-300
                        "
                    >
                      <MapPin size={13} className="text-[#a855f7]" />

                      <span>
                        {artist.city}

                        {artist.state ? `, ${artist.state}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM */}

                  <div
                    className="
                        pt-4
                        border-t
                        border-white/10
                        flex
                        items-center
                        justify-between
                        gap-3
                        relative
                        z-10
                      "
                  >
                    <div
                      className="
                          flex
                          items-center
                          gap-1
                          text-[11px]
                          font-mono
                          text-gray-400
                          truncate
                        "
                    >
                      <Sparkles
                        size={12}
                        className="
                            text-[#a855f7]
                            flex-shrink-0
                          "
                      />

                      <span className="truncate">{artist.metrics}</span>
                    </div>

                    <div
                      className="
                          font-mono
                          text-[11px]
                          text-gray-400
                          bg-white/5
                          border
                          border-white/10
                          px-3
                          py-1
                          rounded-lg
                          flex-shrink-0
                        "
                    >
                      {artist.year}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
