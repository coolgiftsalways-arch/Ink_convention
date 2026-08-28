import { useEffect, useMemo, useRef, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import {
  Sparkles,
  MapPin,
  Search,
  ArrowRight,
  Users,
  MapPinned,
} from "lucide-react";

import gsap from "gsap";

/* =========================================================
   CONSTANTS
========================================================= */

const ONE_DAY = 24 * 60 * 60 * 1000;

const CITY_COUNTER_KEY = "inkConventionCityCounters";

const ARTISTS_PER_PAGE = 20;

const ARTIST_ROTATE_MS = 4000;

/* =========================================================
   COMMUNITY CITIES
========================================================= */

const communityCounters = [
  {
    city: "MUMBAI",
    count: 2003,
    state: "MAHARASHTRA",
  },
  {
    city: "DELHI",
    count: 1820,
    state: "DELHI",
  },
  {
    city: "BENGALURU",
    count: 1745,
    state: "KARNATAKA",
  },
  {
    city: "HYDERABAD",
    count: 1410,
    state: "TELANGANA",
  },
  {
    city: "CHENNAI",
    count: 1336,
    state: "TAMIL NADU",
  },
  {
    city: "KOLKATA",
    count: 1251,
    state: "WEST BENGAL",
  },
  {
    city: "AHMEDABAD",
    count: 1290,
    state: "GUJARAT",
  },
  {
    city: "PUNE",
    count: 1550,
    state: "MAHARASHTRA",
  },
  {
    city: "SURAT",
    count: 1050,
    state: "GUJARAT",
  },
  {
    city: "JAIPUR",
    count: 1100,
    state: "RAJASTHAN",
  },
  {
    city: "LUCKNOW",
    count: 980,
    state: "UTTAR PRADESH",
  },
  {
    city: "KANPUR",
    count: 850,
    state: "UTTAR PRADESH",
  },
  {
    city: "NAGPUR",
    count: 950,
    state: "MAHARASHTRA",
  },
  {
    city: "INDORE",
    count: 900,
    state: "MADHYA PRADESH",
  },
  {
    city: "PATNA",
    count: 820,
    state: "BIHAR",
  },
  {
    city: "KOCHI",
    count: 780,
    state: "KERALA",
  },
  {
    city: "CHANDIGARH",
    count: 740,
    state: "CHANDIGARH",
  },
  {
    city: "VISAKHAPATNAM",
    count: 720,
    state: "ANDHRA PRADESH",
  },
  {
    city: "BHUBANESWAR",
    count: 690,
    state: "ODISHA",
  },
  {
    city: "GUWAHATI",
    count: 650,
    state: "ASSAM",
  },
];

/* =========================================================
   CITY COORDINATES

   [longitude, latitude]
========================================================= */

const CITY_COORDINATES = {
  MUMBAI: [72.8777, 19.076],

  DELHI: [77.209, 28.6139],

  BENGALURU: [77.5946, 12.9716],

  HYDERABAD: [78.4867, 17.385],

  CHENNAI: [80.2707, 13.0827],

  KOLKATA: [88.3639, 22.5726],

  AHMEDABAD: [72.5714, 23.0225],

  PUNE: [73.8567, 18.5204],

  SURAT: [72.8311, 21.1702],

  JAIPUR: [75.7873, 26.9124],

  LUCKNOW: [80.9462, 26.8467],

  KANPUR: [80.3319, 26.4499],

  NAGPUR: [79.0882, 21.1458],

  INDORE: [75.8577, 22.7196],

  PATNA: [85.1376, 25.5941],

  KOCHI: [76.2673, 9.9312],

  CHANDIGARH: [76.7794, 30.7333],

  VISAKHAPATNAM: [83.2185, 17.6868],

  BHUBANESWAR: [85.8245, 20.2961],

  GUWAHATI: [91.7362, 26.1445],
};

/* =========================================================
   INDIA MAP

   PURE GEOJSON + SVG
   NO react-simple-maps
========================================================= */

const INDIA_GEOJSON_URL =
  "https://raw.githubusercontent.com/AbhinavSwami28/india-official-geojson/main/india-states-simplified.geojson";

const MAP_WIDTH = 430;

const MAP_HEIGHT = 430;

const INDIA_BOUNDS = {
  minLon: 68,
  maxLon: 98,
  minLat: 6,
  maxLat: 38,
};

/* =========================================================
   MAP PROJECTION
========================================================= */

function projectCoordinate(coordinates) {
  const [longitude, latitude] = coordinates;

  const paddingX = 28;
  const paddingY = 12;

  const usableWidth = MAP_WIDTH - paddingX * 2;

  const usableHeight = MAP_HEIGHT - paddingY * 2;

  const x =
    paddingX +
    ((longitude - INDIA_BOUNDS.minLon) /
      (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon)) *
      usableWidth;

  const y =
    paddingY +
    ((INDIA_BOUNDS.maxLat - latitude) /
      (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) *
      usableHeight;

  return [x, y];
}

/* =========================================================
   CONVERT GEOJSON RING TO SVG
========================================================= */

function ringToPath(ring) {
  if (!Array.isArray(ring) || ring.length === 0) {
    return "";
  }

  const result = ring
    .map((coordinate, index) => {
      const [x, y] = projectCoordinate(coordinate);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return `${result} Z`;
}

/* =========================================================
   CONVERT GEOJSON GEOMETRY TO SVG
========================================================= */

function geometryToPath(geometry) {
  if (!geometry) {
    return "";
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringToPath(ring)).join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((polygon) => polygon.map((ring) => ringToPath(ring)).join(" "))
      .join(" ");
  }

  return "";
}

/* =========================================================
   GENERAL HELPERS
========================================================= */

const safeText = (value) => String(value || "").toLowerCase();

const planPriority = {
  gold: 1,
  silver: 2,
  free: 3,
};

/* =========================================================
   DAILY INCREASE

   +3 TO +8
========================================================= */

function getDailyIncrement(city, dayNumber) {
  const text = `${city}-${dayNumber}`;

  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }

  return 3 + (Math.abs(hash) % 6);
}

/* =========================================================
   DEFAULT CITY COUNTS
========================================================= */

function getDefaultCounts() {
  const result = {};

  communityCounters.forEach((city) => {
    result[city.city] = city.count;
  });

  return result;
}

/* =========================================================
   24 HOUR AUTO COUNTER
========================================================= */

function getUpdatedCounterData() {
  const now = Date.now();

  let savedData = null;

  try {
    const stored = localStorage.getItem(CITY_COUNTER_KEY);

    if (stored) {
      savedData = JSON.parse(stored);
    }
  } catch (error) {
    console.error("Counter error:", error);
  }

  /* FIRST VISIT */

  if (!savedData || !savedData.counts || !savedData.lastUpdated) {
    const firstData = {
      counts: getDefaultCounts(),

      lastUpdated: now,
    };

    localStorage.setItem(CITY_COUNTER_KEY, JSON.stringify(firstData));

    return firstData;
  }

  const difference = now - Number(savedData.lastUpdated);

  const daysPassed = Math.floor(difference / ONE_DAY);

  if (daysPassed <= 0) {
    return savedData;
  }

  const newCounts = {
    ...savedData.counts,
  };

  /* ADD EVERY MISSED DAY */

  for (let day = 1; day <= daysPassed; day += 1) {
    const dayTime = Number(savedData.lastUpdated) + day * ONE_DAY;

    const dayNumber = Math.floor(dayTime / ONE_DAY);

    communityCounters.forEach((city) => {
      const current = Number(newCounts[city.city]) || city.count;

      const increase = getDailyIncrement(city.city, dayNumber);

      newCounts[city.city] = current + increase;
    });
  }

  const updatedData = {
    counts: newCounts,

    lastUpdated: Number(savedData.lastUpdated) + daysPassed * ONE_DAY,
  };

  localStorage.setItem(CITY_COUNTER_KEY, JSON.stringify(updatedData));

  return updatedData;
}

/* =========================================================
   MAIN ARTISTS PAGE
========================================================= */

export default function Artists() {
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");

  const [localArtists, setLocalArtists] = useState([]);

  const [backendArtists, setBackendArtists] = useState([]);

  const [counterIndex, setCounterIndex] = useState(0);

  const [selectedArtist, setSelectedArtist] = useState(null);

  const [artistPage, setArtistPage] = useState(0);

  const [cityCounts, setCityCounts] = useState(() => {
    const data = getUpdatedCounterData();

    return data.counts;
  });

  const artistSectionRef = useRef(null);

  const artistGridRef = useRef(null);

  const entryButtonRef = useRef(null);

  /* =========================================================
     FREE ENTRY BUTTON ANIMATION
  ========================================================= */

  useEffect(() => {
    const button = entryButtonRef.current;

    if (!button) {
      return;
    }

    const arrow = button.querySelector(".entry-arrow");

    const shine = button.querySelector(".entry-shine");

    const entrance = gsap.fromTo(
      button,
      {
        opacity: 0,
        scale: 0.88,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,

        duration: 0.8,

        delay: 0.5,

        ease: "back.out(1.7)",
      },
    );

    const pulse = gsap.to(button, {
      scale: 1.025,

      boxShadow: "0 0 35px rgba(168,85,247,0.42)",

      duration: 1.2,

      repeat: -1,

      yoyo: true,

      ease: "sine.inOut",

      delay: 1.2,
    });

    let arrowTween = null;

    let shineTween = null;

    if (arrow) {
      arrowTween = gsap.to(arrow, {
        x: 5,

        duration: 0.65,

        repeat: -1,

        yoyo: true,

        ease: "sine.inOut",
      });
    }

    if (shine) {
      shineTween = gsap.fromTo(
        shine,
        {
          xPercent: -200,
        },
        {
          xPercent: 300,

          duration: 1.2,

          repeat: -1,

          repeatDelay: 1.4,

          ease: "power2.inOut",
        },
      );
    }

    return () => {
      entrance.kill();
      pulse.kill();

      arrowTween?.kill();
      shineTween?.kill();
    };
  }, []);

  /* =========================================================
     CHECK 24H COUNTER
  ========================================================= */

  useEffect(() => {
    const checkCounter = () => {
      const data = getUpdatedCounterData();

      setCityCounts(data.counts);
    };

    const interval = setInterval(checkCounter, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     ROTATE CITY

     EVERY 2.8 SECONDS
  ========================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setCounterIndex((previous) => (previous + 1) % communityCounters.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     LOAD LOCAL ARTISTS
  ========================================================= */

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("inkConventionDirectoryArtists") || "[]",
      );

      setLocalArtists(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error("Local artist error:", error);

      setLocalArtists([]);
    }
  }, []);

  /* =========================================================
     LOAD BACKEND ARTISTS
  ========================================================= */

  useEffect(() => {
    fetch("https://api.inkconvention.com/api/admin/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })

      .then((data) => {
        if (!data.success || !Array.isArray(data.users)) {
          return;
        }

        const artists = data.users.map((user, index) => ({
          id: user._id || user.id || `backend-${index}`,

          plan: user.plan || "free",

          name:
            user.professionalName ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Participant Artist",

          profileImage: user.profileImage || "",

          phone: user.phone || user.phoneNumber || "",

          email: user.email || "",

          city: user.city || "",

          state: user.state || "",

          studio: user.studio || "",

          experience: user.experience || "",

          instagram: user.instagram || "",

          createdAt: user.createdAt || "",

          year: "2026",
        }));

        setBackendArtists(artists);
      })

      .catch((error) => {
        console.error("Backend artist error:", error);
      });
  }, []);

  /* =========================================================
     NEW ARTIST SCROLL
  ========================================================= */

  useEffect(() => {
    if (!location.state?.newArtistId) {
      return;
    }

    const timer = setTimeout(() => {
      artistSectionRef.current?.scrollIntoView({
        behavior: "smooth",

        block: "start",
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [location.state]);

  /* =========================================================
     MODAL ESC + BODY LOCK
  ========================================================= */

  useEffect(() => {
    if (!selectedArtist) {
      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow = "hidden";

    const closeWithEsc = (event) => {
      if (event.key === "Escape") {
        setSelectedArtist(null);
      }
    };

    window.addEventListener("keydown", closeWithEsc);

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener("keydown", closeWithEsc);
    };
  }, [selectedArtist]);

  /* =========================================================
     COMBINE ARTISTS
  ========================================================= */

  const allArtists = useMemo(() => {
    return [...localArtists, ...backendArtists];
  }, [localArtists, backendArtists]);

  /* =========================================================
     SEARCH + SORT

     GOLD
     SILVER
     FREE
  ========================================================= */

  const filteredArtists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let results = allArtists;

    if (query) {
      results = allArtists.filter(
        (artist) =>
          safeText(artist.name).includes(query) ||
          safeText(artist.city).includes(query) ||
          safeText(artist.state).includes(query) ||
          safeText(artist.studio).includes(query) ||
          safeText(artist.phone).includes(query) ||
          safeText(artist.email).includes(query) ||
          safeText(artist.instagram).includes(query),
      );
    }

    return [...results].sort((a, b) => {
      const planA = safeText(a.plan) || "free";

      const planB = safeText(b.plan) || "free";

      const priorityA = planPriority[planA] || 3;

      const priorityB = planPriority[planB] || 3;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;

      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    });
  }, [allArtists, searchQuery]);

  /* =========================================================
     ARTIST CARD ROTATION
========================================================= */

  const totalArtistPages = Math.max(
    1,
    Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE),
  );

  /* SAFE PAGE DERIVED DIRECTLY WITHOUT USEEFFECT LINT ERRORS */
  const safeArtistPage = Math.min(
    artistPage,
    Math.max(totalArtistPages - 1, 0),
  );

  const artistPageStart = safeArtistPage * ARTISTS_PER_PAGE;

  const visibleArtists = useMemo(() => {
    const start = safeArtistPage * ARTISTS_PER_PAGE;

    return filteredArtists.slice(start, start + ARTISTS_PER_PAGE);
  }, [filteredArtists, safeArtistPage]);

  const firstVisibleArtistNumber =
    filteredArtists.length === 0 ? 0 : artistPageStart + 1;

  const lastVisibleArtistNumber = Math.min(
    artistPageStart + ARTISTS_PER_PAGE,
    filteredArtists.length,
  );

  /* RESET TO FIRST GROUP WHEN SEARCH CHANGES */

  useEffect(() => {
    setArtistPage(0);
  }, [searchQuery]);

  /* AUTO CHANGE TO NEXT 20 EVERY 4 SECONDS */

  useEffect(() => {
    if (totalArtistPages <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setArtistPage((previous) => (previous + 1) % totalArtistPages);
    }, ARTIST_ROTATE_MS);

    return () => clearInterval(interval);
  }, [totalArtistPages]);

  /* CARD CHANGE ANIMATION */

  useEffect(() => {
    if (!artistGridRef.current) {
      return undefined;
    }

    const cards = Array.from(artistGridRef.current.children);

    if (cards.length === 0) {
      return undefined;
    }

    gsap.killTweensOf(cards);

    const tween = gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 20,
        scale: 0.97,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.025,
        ease: "power3.out",
      },
    );

    return () => tween.kill();
  }, [safeArtistPage, filteredArtists.length]);

  /* =========================================================
     CURRENT CITY
  ========================================================= */

  const currentCounter = communityCounters[counterIndex];

  const currentCount = cityCounts[currentCounter.city] ?? currentCounter.count;

  const todayIncrement = getDailyIncrement(
    currentCounter.city,

    Math.floor(Date.now() / ONE_DAY),
  );

  return (
    <>
      <main
        className="
          min-h-screen

          bg-[#08080a]

          text-white

          pt-32
          pb-24

          px-4
          sm:px-6
          lg:px-10
        "
      >
        <div
          className="
            max-w-[1700px]

            mx-auto

            space-y-12
          "
        >
          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="
              grid

              grid-cols-1

              xl:grid-cols-[minmax(0,0.75fr)_minmax(650px,1.25fr)]

              gap-12
              xl:gap-16

              items-center

              border-b
              border-white/10

              pb-12
            "
          >
            {/* LEFT */}

            <div>
              <div
                className="
                  flex

                  items-center

                  gap-2

                  text-purple-400

                  text-[10px]

                  font-mono

                  tracking-[0.2em]

                  mb-5
                "
              >
                <Sparkles size={13} />
                COMMUNITY NETWORK
              </div>

              <h1
                className="
                  text-[clamp(3.5rem,7vw,7rem)]

                  font-black

                  uppercase

                  tracking-[-0.065em]

                  leading-[0.85]
                "
              >
                ARTIST
                <br />
                DIRECTORY
              </h1>

              <p
                className="
                  max-w-xl

                  mt-6

                  text-gray-500

                  text-sm

                  leading-relaxed
                "
              >
                Discover artists and studios from the Ink Convention community.
              </p>
            </div>

            {/* REAL INDIA MAP BOX */}

            <CommunityMapBox
              currentCounter={currentCounter}
              currentCount={currentCount}
              todayIncrement={todayIncrement}
            />
          </section>

          {/* =================================================
              SEARCH + FREE ENTRY
          ================================================= */}

          <section
            className="
              flex

              flex-col
              sm:flex-row

              sm:items-center

              justify-between

              gap-4

              bg-[#0d0d11]

              border
              border-white/10

              rounded-2xl

              p-4
            "
          >
            {/* SEARCH */}

            <div
              className="
                relative

                w-full

                sm:max-w-[520px]
              "
            >
              <Search
                size={16}
                className="
                  absolute

                  left-4

                  top-1/2

                  -translate-y-1/2

                  text-gray-600
                "
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="SEARCH NAME, CITY, STATE, STUDIO..."
                className="
                  w-full

                  bg-black/40

                  border
                  border-white/10

                  focus:border-purple-500

                  rounded-xl

                  pl-11
                  pr-4

                  py-4

                  text-xs

                  text-white

                  outline-none

                  placeholder:text-gray-700

                  transition
                "
              />
            </div>

            {/* FREE ENTRY */}

            <Link
              ref={entryButtonRef}
              to="/Enter"
              className="
                group

                relative

                overflow-hidden

                bg-purple-600

                hover:bg-purple-500

                border
                border-purple-400/40

                rounded-xl

                px-7
                py-4

                flex

                items-center
                justify-center

                gap-3

                text-[10px]

                font-black

                tracking-[0.14em]

                whitespace-nowrap

                shadow-[0_0_20px_rgba(168,85,247,0.20)]

                transition-all

                duration-300

                hover:-translate-y-1
              "
            >
              <span
                className="
                  entry-shine

                  absolute

                  top-0
                  bottom-0

                  left-[-40%]

                  w-[30%]

                  bg-gradient-to-r

                  from-transparent
                  via-white/30
                  to-transparent

                  skew-x-[-20deg]

                  pointer-events-none
                "
              />

              <span
                className="
                  relative

                  z-10

                  w-2
                  h-2

                  rounded-full

                  bg-white

                  animate-pulse

                  shadow-[0_0_12px_rgba(255,255,255,0.95)]
                "
              />

              <span
                className="
                  relative
                  z-10
                "
              >
                GET FREE ENTRY
              </span>

              <ArrowRight
                size={14}
                className="
                  entry-arrow

                  relative

                  z-10
                "
              />
            </Link>
          </section>

          {/* =================================================
              ARTISTS
          ================================================= */}

          <section
            ref={artistSectionRef}
            className="
              scroll-mt-32
            "
          >
            <div
              className="
                flex

                flex-col
                sm:flex-row

                sm:items-end

                justify-between

                gap-4

                mb-8
              "
            >
              <div>
                <p
                  className="
                    text-purple-400

                    text-[9px]

                    font-mono

                    tracking-widest

                    mb-2
                  "
                >
                  ARTIST NETWORK
                </p>

                <h2
                  className="
                    text-3xl
                    sm:text-5xl

                    font-black

                    uppercase
                  "
                >
                  {searchQuery ? "SEARCH RESULTS" : "OUR ARTISTS"}
                </h2>
              </div>

              <div
                className="
                flex
                flex-col
                sm:items-end
                gap-1.5
              "
              >
                <span
                  className="
                  text-[9px]
                  font-mono
                  text-gray-600
                "
                >
                  {filteredArtists.length} ARTISTS
                </span>

                {filteredArtists.length > ARTISTS_PER_PAGE && (
                  <span
                    className="
                    text-[8px]
                    font-mono
                    tracking-[0.12em]
                    text-purple-400
                    uppercase
                  "
                  >
                    SHOWING {firstVisibleArtistNumber}-{lastVisibleArtistNumber}
                    {" / "}
                    PAGE {safeArtistPage + 1} OF {totalArtistPages}
                    {" / AUTO 4S"}
                  </span>
                )}
              </div>
            </div>

            {filteredArtists.length === 0 ? (
              <div
                className="
                min-h-[280px]

                flex
                flex-col

                items-center
                justify-center

                border
                border-dashed
                border-white/10

                rounded-[28px]
              "
              >
                <Search
                  size={35}
                  className="
                  text-gray-700

                  mb-4
                "
                />

                <h3
                  className="
                  font-black
                "
                >
                  NO ARTISTS FOUND
                </h3>
              </div>
            ) : (
              <div
                ref={artistGridRef}
                className="
                grid

                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4

                gap-5

                items-stretch
              "
              >
                {visibleArtists.map((artist, index) => {
                  const globalIndex = artistPageStart + index;

                  return (
                    <ArtistCard
                      key={artist.id || `${artist.name}-${globalIndex}`}
                      artist={artist}
                      index={globalIndex}
                      isNew={location.state?.newArtistId === artist.id}
                      onClick={() => setSelectedArtist(artist)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL */}

      {selectedArtist && (
        <ArtistModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </>
  );
}

/* =========================================================
   COMMUNITY MAP BOX
========================================================= */

function CommunityMapBox({ currentCounter, currentCount, todayIncrement }) {
  const [mapFeatures, setMapFeatures] = useState([]);

  const [mapError, setMapError] = useState(false);

  const contentRef = useRef(null);

  const numberRef = useRef(null);

  const glowRef = useRef(null);

  /* =========================================================
     LOAD GEOJSON
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    fetch(INDIA_GEOJSON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Map HTTP ${response.status}`);
        }

        return response.json();
      })

      .then((data) => {
        if (cancelled) {
          return;
        }

        if (!Array.isArray(data.features)) {
          throw new Error("Invalid map data");
        }

        setMapFeatures(data.features);

        setMapError(false);
      })

      .catch((error) => {
        console.error("India map error:", error);

        if (!cancelled) {
          setMapError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     CITY CHANGE ANIMATION
  ========================================================= */

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    gsap.killTweensOf(contentRef.current);

    gsap.fromTo(
      contentRef.current,

      {
        opacity: 0,

        y: 14,

        filter: "blur(3px)",
      },

      {
        opacity: 1,

        y: 0,

        filter: "blur(0px)",

        duration: 0.55,

        ease: "power3.out",
      },
    );
  }, [currentCounter.city]);

  /* NUMBER */

  useEffect(() => {
    if (!numberRef.current) {
      return;
    }

    gsap.killTweensOf(numberRef.current);

    gsap.fromTo(
      numberRef.current,

      {
        opacity: 0,

        scale: 0.86,

        y: 8,
      },

      {
        opacity: 1,

        scale: 1,

        y: 0,

        duration: 0.55,

        ease: "back.out(1.5)",
      },
    );
  }, [currentCounter.city, currentCount]);

  /* GLOW */

  useEffect(() => {
    if (!glowRef.current) {
      return;
    }

    const tween = gsap.to(glowRef.current, {
      scale: 1.12,

      opacity: 0.65,

      duration: 1.5,

      repeat: -1,

      yoyo: true,

      ease: "sine.inOut",
    });

    return () => tween.kill();
  }, []);

  return (
    <div
      className="
        relative

        w-full

        min-w-0
      "
    >
      {/* PURPLE BACKGROUND GLOW */}

      <div
        ref={glowRef}
        className="
          absolute

          right-[5%]
          top-[15%]

          w-[320px]
          h-[320px]

          rounded-full

          bg-purple-600/[0.10]

          blur-[110px]

          pointer-events-none
        "
      />

      {/* BOX */}

      <div
        className="
          relative

          w-full

          min-h-[440px]

          overflow-hidden

          bg-[#0b0b0f]

          border
          border-white/10

          rounded-[28px]

          p-5
          sm:p-7
        "
      >
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div
          className="
            relative
            z-30

            flex

            items-center
            justify-between

            gap-4

            pb-5

            border-b
            border-white/[0.07]
          "
        >
          <div
            className="
              flex

              items-center

              gap-2

              text-purple-400

              text-[9px]

              font-mono

              tracking-[0.15em]

              uppercase
            "
          >
            <Users size={13} />
            OUR COMMUNITY
          </div>

          <div
            className="
              flex

              items-center

              gap-2

              text-[8px]

              font-mono

              text-gray-600
            "
          >
            <span
              className="
                relative

                flex

                w-2
                h-2
              "
            >
              <span
                className="
                  absolute

                  w-full
                  h-full

                  rounded-full

                  bg-purple-400

                  opacity-70

                  animate-ping
                "
              />

              <span
                className="
                  relative

                  w-2
                  h-2

                  rounded-full

                  bg-purple-500

                  shadow-[0_0_14px_rgba(168,85,247,1)]
                "
              />
            </span>
            LIVE
          </div>
        </div>

        {/* =================================================
            CITY + MAP
        ================================================= */}

        <div
          className="
            relative
            z-10

            grid

            grid-cols-1

            md:grid-cols-[0.72fr_1.28fr]

            gap-4
            md:gap-6

            items-center

            min-h-[320px]
          "
        >
          {/* =================================================
              LEFT INFO
          ================================================= */}

          <div
            ref={contentRef}
            className="
              relative

              z-20

              min-w-0

              py-6
              md:py-0
            "
          >
            <p
              className="
                text-[8px]
                sm:text-[9px]

                font-mono

                tracking-[0.22em]

                text-gray-600

                uppercase

                mb-4
              "
            >
              OUR COMMUNITY IN
            </p>

            <h2
              className="
                text-[clamp(2rem,4vw,3.7rem)]

                font-black

                uppercase

                tracking-[-0.06em]

                leading-[0.88]

                break-words
              "
            >
              {currentCounter.city}
            </h2>

            <span
              ref={numberRef}
              className="
                block

                mt-5

                text-[clamp(3rem,6vw,5rem)]

                font-black

                text-purple-500

                tracking-[-0.075em]

                leading-[0.8]

                whitespace-nowrap

                drop-shadow-[0_0_20px_rgba(168,85,247,0.25)]
              "
            >
              {currentCount}+
            </span>

            <div
              className="
                mt-7

                flex

                items-center

                gap-2

                text-[8px]

                font-mono

                tracking-[0.1em]

                text-gray-500

                uppercase
              "
            >
              <MapPinned
                size={13}
                className="
                  text-purple-500

                  shrink-0
                "
              />

              {currentCounter.state}
            </div>

            <div
              className="
                mt-5

                inline-flex

                items-center

                gap-2

                px-3
                py-2

                rounded-full

                border
                border-purple-500/20

                bg-purple-500/[0.05]
              "
            >
              <span
                className="
                  w-1.5
                  h-1.5

                  rounded-full

                  bg-purple-500

                  animate-pulse

                  shadow-[0_0_10px_rgba(168,85,247,1)]
                "
              />

              <span
                className="
                  text-[7px]

                  font-mono

                  tracking-[0.16em]

                  text-purple-400
                "
              >
                ACTIVE CITY
              </span>
            </div>
          </div>

          {/* =================================================
              RIGHT INDIA MAP
          ================================================= */}

          <div
            className="
              relative

              w-full

              min-h-[310px]

              flex

              items-center
              justify-center

              overflow-hidden
            "
          >
            {/* BACKGROUND GRID */}

            <div
              className="
                absolute

                inset-3

                opacity-[0.035]

                pointer-events-none

                bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)]

                bg-[size:28px_28px]
              "
            />

            {/* MAP GLOW */}

            <div
              className="
                absolute

                left-1/2
                top-1/2

                -translate-x-1/2
                -translate-y-1/2

                w-[260px]
                h-[300px]

                rounded-full

                bg-purple-500/[0.04]

                blur-[60px]
              "
            />

            {/* =================================================
                REAL INDIA SVG
            ================================================= */}

            <svg
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="India community map"
              className="
                relative

                z-10

                w-full

                max-w-[430px]

                h-auto
              "
            >
              {/* =============================================
                  REAL STATE BORDERS
              ============================================= */}

              <g>
                {mapFeatures.map((feature, index) => (
                  <path
                    key={
                      feature.properties?.name ||
                      feature.properties?.NAME_1 ||
                      feature.properties?.st_nm ||
                      index
                    }
                    d={geometryToPath(feature.geometry)}
                    fill="rgba(255,255,255,0.006)"
                    stroke="rgba(255,255,255,0.50)"
                    strokeWidth="0.65"
                    vectorEffect="non-scaling-stroke"
                    fillRule="evenodd"
                  />
                ))}
              </g>

              {/* =============================================
                  CITY LIGHTS
              ============================================= */}

              <g>
                {communityCounters.map((city) => {
                  const coordinates = CITY_COORDINATES[city.city];

                  if (!coordinates) {
                    return null;
                  }

                  const [x, y] = projectCoordinate(coordinates);

                  const isActive = currentCounter.city === city.city;

                  const labelWidth = Math.max(
                    58,

                    city.city.length * 6.2,
                  );

                  return (
                    <g key={city.city}>
                      {/* ACTIVE PULSE */}

                      {isActive && (
                        <>
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="1"
                          >
                            <animate
                              attributeName="r"
                              values="6;18;6"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />

                            <animate
                              attributeName="opacity"
                              values="0.8;0;0.8"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>

                          <circle
                            cx={x}
                            cy={y}
                            r="11"
                            fill="rgba(168,85,247,0.10)"
                          />
                        </>
                      )}

                      {/* CITY POINT */}

                      <circle
                        cx={x}
                        cy={y}
                        r={isActive ? 4.5 : 2.3}
                        fill={isActive ? "#a855f7" : "rgba(255,255,255,0.48)"}
                        stroke={isActive ? "#ffffff" : "rgba(255,255,255,0.25)"}
                        strokeWidth={isActive ? 1.2 : 0.5}
                        style={{
                          filter: isActive
                            ? "drop-shadow(0 0 7px #a855f7)"
                            : "none",

                          transition: "all 0.35s ease",
                        }}
                      />

                      {/* ACTIVE CITY NAME */}

                      {isActive && (
                        <g>
                          <rect
                            x={x + 9}
                            y={y - 14}
                            width={labelWidth}
                            height="21"
                            rx="5"
                            fill="rgba(8,8,10,0.96)"
                            stroke="rgba(168,85,247,0.65)"
                            strokeWidth="0.7"
                          />

                          <text
                            x={x + 15}
                            y={y}
                            fill="#ffffff"
                            fontSize="7"
                            fontWeight="700"
                            fontFamily="monospace"
                            letterSpacing="0.7"
                          >
                            {city.city}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* LOADING */}

            {mapFeatures.length === 0 && !mapError && (
              <div
                className="
                  absolute

                  inset-0

                  z-20

                  flex

                  items-center
                  justify-center

                  text-[8px]

                  font-mono

                  tracking-widest

                  text-gray-600
                "
              >
                LOADING INDIA MAP...
              </div>
            )}

            {/* ERROR */}

            {mapError && (
              <div
                className="
                  absolute

                  inset-0

                  z-20

                  flex
                  flex-col

                  items-center
                  justify-center

                  text-center

                  px-5
                "
              >
                <MapPinned
                  size={28}
                  className="
                    text-purple-500

                    mb-4
                  "
                />

                <p
                  className="
                    text-[9px]

                    font-mono

                    text-gray-500

                    tracking-widest
                  "
                >
                  INDIA MAP COULD NOT LOAD
                </p>
              </div>
            )}

            {/* LABEL */}

            <div
              className="
                absolute

                bottom-2
                right-2

                z-30

                flex

                items-center

                gap-2

                text-[7px]

                font-mono

                text-gray-600

                tracking-[0.16em]
              "
            >
              <span
                className="
                  w-5

                  h-[1px]

                  bg-white/20
                "
              />
              INDIA NETWORK
            </div>
          </div>
        </div>

        {/* =================================================
            BOTTOM GROWTH
        ================================================= */}

        <div
          className="
            relative
            z-30

            flex

            items-center
            justify-between

            gap-4

            border-t
            border-white/10

            pt-4
          "
        >
          <div
            className="
              flex

              items-center

              gap-2
            "
          >
            <span
              className="
                w-1.5
                h-1.5

                rounded-full

                bg-white/30
              "
            />

            <span
              className="
                text-[7px]
                sm:text-[8px]

                font-mono

                tracking-[0.1em]

                text-gray-600
              "
            >
              COMMUNITY GROWTH
            </span>
          </div>

          <span
            className="
              text-[8px]

              font-mono

              text-purple-400

              whitespace-nowrap
            "
          >
            +{todayIncrement} TODAY
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ARTIST CARD
========================================================= */

function ArtistCard({ artist, index, isNew, onClick }) {
  const plan = safeText(artist.plan) || "free";

  const isGold = plan === "gold";

  const isSilver = plan === "silver";

  const isFree = !isGold && !isSilver;

  const locationText = [artist.city, artist.state].filter(Boolean).join(", ");

  return (
    <article
      onClick={onClick}
      className={`
        group

        relative

        w-full

        h-[500px]

        rounded-[24px]

        overflow-hidden

        flex
        flex-col

        cursor-pointer

        transition-all

        duration-500

        hover:-translate-y-2

        ${
          isGold
            ? `
              border-2

              border-yellow-400

              bg-gradient-to-br

              from-yellow-400/[0.07]

              via-[#111008]

              to-[#0d0d11]

              shadow-[0_0_30px_rgba(250,204,21,0.10)]
            `
            : isSilver
              ? `
              border-2

              border-slate-300

              bg-gradient-to-br

              from-white/[0.05]

              via-[#101116]

              to-[#0d0d11]
            `
              : `
              border

              border-white/10

              bg-[#0d0d11]

              hover:border-purple-500/50
            `
        }

        ${
          isNew
            ? `
              ring-2

              ring-purple-500

              ring-offset-4

              ring-offset-[#08080a]
            `
            : ""
        }
      `}
    >
      {/* =================================================
          GOLD / SILVER HEADER
      ================================================= */}

      {(isGold || isSilver) && (
        <div
          className="
            flex

            items-center

            gap-4

            p-5

            border-b
            border-white/10
          "
        >
          <div
            className={`
              w-16
              h-16

              rounded-full

              overflow-hidden

              shrink-0

              bg-black

              border-2

              ${isGold ? "border-yellow-400" : "border-slate-300"}
            `}
          >
            {artist.profileImage ? (
              <img
                src={artist.profileImage}
                alt={artist.name || "Artist"}
                className="
                  w-full
                  h-full

                  object-cover
                "
              />
            ) : (
              <div
                className="
                  w-full
                  h-full

                  flex

                  items-center
                  justify-center

                  font-black

                  text-xl
                "
              >
                {artist.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
          </div>

          <div
            className="
              flex-1

              min-w-0
            "
          >
            <p
              className={`
                text-[8px]

                font-mono

                tracking-widest

                mb-1

                ${isGold ? "text-yellow-400" : "text-slate-300"}
              `}
            >
              INK CONVENTION ARTIST
            </p>

            <h3
              className="
                text-xl

                font-black

                uppercase

                truncate
              "
            >
              {artist.name || "Participant Artist"}
            </h3>

            <div
              className="
                flex

                items-center

                gap-1.5

                mt-2

                text-[11px]

                text-gray-400
              "
            >
              <MapPin size={11} />

              <span
                className="
                  truncate
                "
              >
                {locationText || "India"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          FREE HEADER
      ================================================= */}

      {isFree && (
        <div
          className="
            p-5
          "
        >
          <div
            className="
              flex

              items-center
              justify-between

              mb-6
            "
          >
            <span
              className="
                w-9
                h-9

                rounded-full

                bg-purple-500/10

                border
                border-purple-500/20

                flex

                items-center
                justify-center

                text-purple-400

                text-[8px]

                font-mono
              "
            >
              #{String(index + 1).padStart(2, "0")}
            </span>

            <span
              className="
                w-2.5
                h-2.5

                rounded-full

                bg-purple-500

                shadow-[0_0_12px_rgba(168,85,247,0.8)]
              "
            />
          </div>

          <p
            className="
              text-purple-400

              text-[8px]

              font-mono

              tracking-widest

              mb-2
            "
          >
            INK CONVENTION ARTIST
          </p>

          <h3
            className="
              text-2xl

              font-black

              uppercase

              truncate
            "
          >
            {artist.name || "Participant Artist"}
          </h3>
        </div>
      )}

      {/* =================================================
          DETAILS
      ================================================= */}

      <div
        className="
          px-5
          pt-4
          pb-5

          flex
          flex-col
          flex-1

          min-h-0
        "
      >
        {/* FREE */}

        {isFree && (
          <div
            className="
              flex

              items-center

              gap-2

              text-sm

              text-gray-400
            "
          >
            <MapPin
              size={13}
              className="
                text-purple-500
              "
            />

            {artist.state || "India"}
          </div>
        )}

        {/* SILVER */}

        {isSilver && (
          <div
            className="
              space-y-4
            "
          >
            <InfoRow title="CITY" value={artist.city} />

            <InfoRow title="STATE" value={artist.state} />

            <InfoRow title="PHONE" value={artist.phone} />
          </div>
        )}

        {/* GOLD */}

        {isGold && (
          <div
            className="
              space-y-2.5
            "
          >
            <InfoRow title="PHONE" value={artist.phone} />

            <InfoRow title="EMAIL" value={artist.email} />

            <InfoRow title="CITY" value={artist.city} />

            <InfoRow title="STATE" value={artist.state} />

            <InfoRow title="STUDIO" value={artist.studio} />

            <InfoRow title="EXPERIENCE" value={artist.experience} />

            <InfoRow title="INSTAGRAM" value={artist.instagram} />
          </div>
        )}

        {/* FOOTER */}

        <div
          className="
            mt-auto
          "
        >
          <p
            className="
              py-3

              text-[8px]

              font-mono

              tracking-widest

              text-gray-600

              group-hover:text-gray-400
            "
          >
            CLICK TO VIEW FULL PROFILE
          </p>

          <div
            className="
              border-t
              border-white/10

              pt-3

              flex

              items-center
              justify-between
            "
          >
            <div
              className="
                flex

                items-center

                gap-2

                text-[8px]

                font-mono

                text-gray-600
              "
            >
              <Sparkles
                size={10}
                className={
                  isGold
                    ? "text-yellow-400"
                    : isSilver
                      ? "text-slate-300"
                      : "text-purple-500"
                }
              />
              INK CONVENTION
            </div>

            <span
              className="
                text-[8px]

                font-mono

                text-gray-600
              "
            >
              {artist.year || "2026"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   ARTIST MODAL
========================================================= */

function ArtistModal({ artist, onClose }) {
  const modalRef = useRef(null);

  const plan = safeText(artist.plan) || "free";

  const isGold = plan === "gold";

  const isSilver = plan === "silver";

  const isFree = !isGold && !isSilver;

  /* OPEN */

  useEffect(() => {
    if (!modalRef.current) {
      return;
    }

    gsap.fromTo(
      modalRef.current,

      {
        opacity: 0,

        scale: 0.9,

        y: 25,
      },

      {
        opacity: 1,

        scale: 1,

        y: 0,

        duration: 0.4,

        ease: "power3.out",
      },
    );
  }, []);

  /* CLOSE */

  const closeModal = () => {
    if (!modalRef.current) {
      onClose();

      return;
    }

    gsap.to(modalRef.current, {
      opacity: 0,

      scale: 0.95,

      y: 15,

      duration: 0.22,

      ease: "power2.in",

      onComplete: onClose,
    });
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="
        fixed

        inset-0

        z-[9999]

        bg-black/85

        backdrop-blur-xl

        p-4
        sm:p-8

        flex

        items-center
        justify-center

        overflow-y-auto
      "
    >
      <div
        ref={modalRef}
        className={`
          relative

          w-full

          max-w-[1000px]

          max-h-[90vh]

          overflow-y-auto

          rounded-[30px]

          bg-[#0c0c0f]

          text-white

          ${
            isGold
              ? `
                border-2
                border-yellow-400

                shadow-[0_0_80px_rgba(250,204,21,0.18)]
              `
              : isSilver
                ? `
                border-2
                border-slate-300
              `
                : `
                border

                border-purple-500/40
              `
          }
        `}
      >
        {/* X */}

        <button
          type="button"
          onClick={closeModal}
          aria-label="Close profile"
          className="
            absolute

            top-5
            right-5

            z-30

            w-12
            h-12

            rounded-full

            bg-black/70

            border
            border-white/15

            hover:bg-white
            hover:text-black

            flex

            items-center
            justify-center

            text-3xl

            transition
          "
        >
          ×
        </button>

        {/* =================================================
            GOLD / SILVER HEADER
        ================================================= */}

        {(isGold || isSilver) && (
          <div
            className="
              p-6
              sm:p-10

              pr-20

              border-b
              border-white/10
            "
          >
            <div
              className="
                flex

                flex-col
                sm:flex-row

                sm:items-center

                gap-6
              "
            >
              <div
                className={`
                  w-28
                  h-28

                  sm:w-36
                  sm:h-36

                  shrink-0

                  rounded-full

                  overflow-hidden

                  bg-black

                  border-[3px]

                  ${isGold ? "border-yellow-400" : "border-slate-300"}
                `}
              >
                {artist.profileImage ? (
                  <img
                    src={artist.profileImage}
                    alt={artist.name || "Artist"}
                    className="
                      w-full
                      h-full

                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      w-full
                      h-full

                      flex

                      items-center
                      justify-center

                      text-4xl

                      font-black
                    "
                  >
                    {artist.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className={`
                    text-[10px]

                    font-mono

                    tracking-[0.2em]

                    mb-3

                    ${isGold ? "text-yellow-400" : "text-slate-300"}
                  `}
                >
                  INK CONVENTION ARTIST
                </p>

                <h2
                  className="
                    text-4xl
                    sm:text-6xl

                    font-black

                    uppercase

                    tracking-[-0.05em]

                    leading-none

                    break-words
                  "
                >
                  {artist.name || "Participant Artist"}
                </h2>

                <div
                  className="
                    flex

                    items-center

                    gap-2

                    mt-5

                    text-gray-400
                  "
                >
                  <MapPin
                    size={14}
                    className={isGold ? "text-yellow-400" : "text-slate-300"}
                  />

                  {[artist.city, artist.state].filter(Boolean).join(", ") ||
                    "India"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            FREE HEADER
        ================================================= */}

        {isFree && (
          <div
            className="
              p-8
              sm:p-12

              pr-20

              border-b
              border-white/10
            "
          >
            <p
              className="
                text-purple-400

                text-[10px]

                font-mono

                tracking-[0.2em]

                mb-4
              "
            >
              INK CONVENTION ARTIST
            </p>

            <h2
              className="
                text-4xl
                sm:text-6xl

                font-black

                uppercase
              "
            >
              {artist.name || "Participant Artist"}
            </h2>
          </div>
        )}

        {/* =================================================
            MODAL BODY
        ================================================= */}

        <div
          className="
            p-6
            sm:p-10
          "
        >
          {/* FREE */}

          {isFree && (
            <ModalInfo title="STATE" value={artist.state} accent="purple" />
          )}

          {/* SILVER */}

          {isSilver && (
            <div
              className="
                grid

                grid-cols-1
                sm:grid-cols-2

                gap-8
              "
            >
              <ModalInfo title="CITY" value={artist.city} accent="silver" />

              <ModalInfo title="STATE" value={artist.state} accent="silver" />

              <ModalInfo title="PHONE" value={artist.phone} accent="silver" />
            </div>
          )}

          {/* GOLD */}

          {isGold && (
            <div
              className="
                grid

                grid-cols-1
                sm:grid-cols-2

                gap-x-12
                gap-y-8
              "
            >
              <ModalInfo title="PHONE" value={artist.phone} accent="gold" />

              <ModalInfo title="EMAIL" value={artist.email} accent="gold" />

              <ModalInfo title="CITY" value={artist.city} accent="gold" />

              <ModalInfo title="STATE" value={artist.state} accent="gold" />

              <ModalInfo title="STUDIO" value={artist.studio} accent="gold" />

              <ModalInfo
                title="EXPERIENCE"
                value={artist.experience}
                accent="gold"
              />

              <ModalInfo
                title="INSTAGRAM"
                value={artist.instagram}
                accent="gold"
              />
            </div>
          )}

          <div
            className="
              mt-10

              pt-6

              border-t
              border-white/10

              flex

              justify-end
            "
          >
            <button
              type="button"
              onClick={closeModal}
              className={`
                px-7
                py-4

                text-[10px]

                font-black

                tracking-widest

                ${
                  isGold
                    ? `
                      bg-yellow-400

                      hover:bg-yellow-300

                      text-black
                    `
                    : isSilver
                      ? `
                      bg-slate-100

                      hover:bg-white

                      text-black
                    `
                      : `
                      bg-purple-600

                      hover:bg-purple-500

                      text-white
                    `
                }
              `}
            >
              CLOSE PROFILE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL CARD INFO
========================================================= */

function InfoRow({ title, value }) {
  return (
    <div
      className="
        min-w-0
      "
    >
      <p
        className="
          text-[7px]

          font-mono

          tracking-[0.16em]

          text-gray-600

          mb-1
        "
      >
        {title}
      </p>

      <p
        className="
          text-[12px]

          text-gray-300

          truncate
        "
        title={value || "-"}
      >
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   MODAL INFO
========================================================= */

function ModalInfo({ title, value, accent = "purple" }) {
  let accentClass = "text-purple-400";

  if (accent === "gold") {
    accentClass = "text-yellow-400";
  }

  if (accent === "silver") {
    accentClass = "text-slate-300";
  }

  return (
    <div
      className="
        min-w-0

        border-b
        border-white/10

        pb-5
      "
    >
      <p
        className={`
          text-[8px]

          font-mono

          tracking-[0.2em]

          uppercase

          mb-2

          ${accentClass}
        `}
      >
        {title}
      </p>

      <p
        className="
          text-base
          sm:text-lg

          font-semibold

          text-white

          break-words
        "
      >
        {value || "-"}
      </p>
    </div>
  );
}
