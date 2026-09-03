import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Sparkles,
  MapPin,
  ArrowRight,
  Users,
  Award,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://api.inkconvention.com"
).replace(/\/$/, "");

/* =========================================================
   NORMALIZE PLAN
========================================================= */

function normalizePlan(value) {
  const plan = String(value || "")
    .trim()
    .toLowerCase();

  if (
    plan === "verified" ||
    plan === "gold" ||
    plan === "spotlight" ||
    plan === "verified spotlight"
  ) {
    return "verified";
  }

  if (plan === "pro" || plan === "silver") {
    return "pro";
  }

  return "basic";
}

/* =========================================================
   NORMALIZE ARTIST
========================================================= */

function normalizeArtist(source = {}) {
  const normalizedPlan = normalizePlan(
    source.plan || source.membershipPlan || source.tier,
  );

  return {
    id: source._id || source.id || source.profileId || "",

    name:
      source.name ||
      source.artistName ||
      source.professionalName ||
      "Tattoo Artist",

    studio: source.studio || source.studioName || "",

    city: source.city || "",

    state: source.state || "",

    phone: source.phone || "",

    email: source.email || "",

    instagram: source.instagram || "",

    experience: source.experience || "",

    profileImage: source.profileImage || source.image || source.photo || "",

    plan: normalizedPlan,

    paymentStatus: String(source.paymentStatus || source.payment?.status || "")
      .trim()
      .toLowerCase(),

    verified: Boolean(source.verified) || normalizedPlan === "verified",

    hallOfFameEligible: source.hallOfFameEligible !== false,

    standaloneProfileUrl:
      source.standaloneProfileUrl || source.profileUrl || "",

    createdAt: source.createdAt || "",

    updatedAt: source.updatedAt || "",
  };
}

/* =========================================================
   GET ARTIST ARRAY
========================================================= */

function getArtistsArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.artists)) {
    return data.artists;
  }

  if (Array.isArray(data?.profiles)) {
    return data.profiles;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(path) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",

    credentials: "include",

    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`,
    );
  }

  return data;
}

/* =========================================================
   HALL OF FAME
========================================================= */

export default function HallOfFame() {
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD GOLD VERIFIED ARTISTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadHallOfFame = async () => {
      setLoading(true);
      setError("");

      try {
        const PAGE_SIZE = 1000;

        let page = 1;

        let totalPages = 1;

        const allDirectoryArtists = [];

        do {
          const data = await apiRequest(
            `/api/admin/tattoo-studios?page=${page}&limit=${PAGE_SIZE}`,
          );

          if (cancelled) {
            return;
          }

          const pageArtists = getArtistsArray(data);

          allDirectoryArtists.push(...pageArtists);

          totalPages = Math.max(
            1,

            Number(data?.pagination?.totalPages || data?.totalPages || 1),
          );

          page += 1;
        } while (page <= totalPages && !cancelled);

        if (cancelled) {
          return;
        }

        const verifiedArtists = allDirectoryArtists
          .map((artist) => normalizeArtist(artist))
          .filter(
            (artist) => artist.plan === "verified" && artist.hallOfFameEligible,
          )
          .sort((first, second) => {
            const firstTime = new Date(
              first.updatedAt || first.createdAt || 0,
            ).getTime();

            const secondTime = new Date(
              second.updatedAt || second.createdAt || 0,
            ).getTime();

            return secondTime - firstTime;
          });

        setArtists(verifiedArtists);
      } catch (loadError) {
        console.error("Hall Of Fame loading error:", loadError);

        if (!cancelled) {
          setArtists([]);

          setError(loadError.message || "Unable to load Hall of Fame.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadHallOfFame();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     OPEN ARTIST
  ======================================================= */

  const handleArtistClick = (artist) => {
    if (artist.standaloneProfileUrl) {
      navigate(artist.standaloneProfileUrl);

      return;
    }

    navigate("/artists", {
      state: {
        selectedArtistId: artist.id,
      },
    });
  };

  return (
    <main
      className="
        relative
        w-full
        min-h-screen
        overflow-hidden
        bg-[#08080a]
        text-white
        pt-32
        pb-24
        px-4
        sm:px-6
        lg:px-12
      "
    >
      {/* GOLD BACKGROUND GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          top-[-180px]
          left-1/2
          -translate-x-1/2
          w-[950px]
          h-[600px]
          rounded-full
          bg-yellow-400/[0.045]
          blur-[150px]
        "
      />

      <div
        className="
          relative
          z-10
          max-w-[1700px]
          mx-auto
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className="
            border-b
            border-white/10
            pb-12
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-yellow-300/20
              bg-yellow-400/[0.06]
              px-4
              py-2
              text-[9px]
              font-mono
              font-black
              tracking-[0.16em]
              text-yellow-300
              uppercase
            "
          >
            <Trophy size={14} />
            VERIFIED SPOTLIGHT MEMBERS
          </div>

          <div
            className="
              mt-8
              flex
              flex-col
              xl:flex-row
              xl:items-end
              justify-between
              gap-10
            "
          >
            <div>
              <h1
                className="
                  text-[clamp(4rem,9vw,9rem)]
                  font-black
                  uppercase
                  tracking-[-0.075em]
                  leading-[0.78]
                "
              >
                HALL OF
                <br />
                <span
                  className="
                    text-transparent
                    bg-clip-text
                    bg-gradient-to-r
                    from-yellow-100
                    via-yellow-400
                    to-amber-600
                  "
                >
                  FAME.
                </span>
              </h1>

              <p
                className="
                  mt-8
                  max-w-2xl
                  text-sm
                  sm:text-base
                  text-gray-500
                  leading-relaxed
                "
              >
                Every tattoo artist or studio with an active  Verified
                Spotlight membership appears here automatically while still
                remaining visible inside the main Artists directory.
              </p>
            </div>

            {/* VERIFIED COUNT */}

            <div
              className="
                min-w-[220px]
                rounded-[22px]
                border
                border-yellow-300/20
                bg-yellow-400/[0.035]
                p-6
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-yellow-400
                "
              >
                <Sparkles size={13} />

                <p
                  className="
                    text-[8px]
                    font-mono
                    tracking-[0.16em]
                  "
                >
                  
                </p>
              </div>

              <div
                className="
                  mt-3
                  flex
                  items-end
                  gap-3
                "
              >
                <span
                  className="
                    text-5xl
                    font-black
                  "
                >
                  {loading ? "..." : artists.length}
                </span>

                <span
                  className="
                    mb-1
                    text-[8px]
                    font-mono
                    text-gray-600
                  "
                >
                  MEMBERS
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FEATURES
        ================================================= */}

        <section
          className="
            mt-8
            grid
            grid-cols-1
            md:grid-cols-3
            gap-3
          "
        >
          <InfoBox
            icon={<Award size={17} />}
            title="₹2,999 VERIFIED"
            text="Active Verified Spotlight membership"
          />

          <InfoBox
            icon={<Trophy size={17} />}
            title="HALL OF FAME"
            text="Automatically appears on this page"
          />

          <InfoBox
            icon={<Sparkles size={17} />}
            title="ARTISTS DIRECTORY"
            text="The same profile remains visible in Artists"
          />
        </section>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <section
            className="
              mt-12
              min-h-[300px]
              rounded-[26px]
              border
              border-white/[0.06]
              bg-[#0b0b0f]
              flex
              items-center
              justify-center
            "
          >
            <div className="text-center">
              <div
                className="
                  w-12
                  h-12
                  mx-auto
                  rounded-full
                  border-2
                  border-yellow-400/10
                  border-t-yellow-400
                  animate-spin
                "
              />

              <p
                className="
                  mt-5
                  text-[9px]
                  font-mono
                  tracking-[0.16em]
                  text-gray-600
                "
              >
                LOADING VERIFIED MEMBERS
              </p>
            </div>
          </section>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <section
            className="
                mt-12
                max-w-3xl
                mx-auto
                rounded-[24px]
                border
                border-red-500/20
                bg-red-500/[0.035]
                p-8
                text-center
              "
          >
            <p
              className="
                  text-lg
                  font-black
                  text-red-400
                  uppercase
                "
            >
              Unable To Load Hall Of Fame
            </p>

            <p
              className="
                  mt-3
                  text-sm
                  text-gray-500
                "
            >
              {error}
            </p>
          </section>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && !error && artists.length === 0 && (
          <section
            className="
                relative
                mt-12
                max-w-4xl
                mx-auto
                overflow-hidden
                rounded-[26px]
                border
                border-yellow-300/10
                bg-[#0b0b0f]
                p-10
                sm:p-14
                text-center
              "
          >
            <div
              className="
                  pointer-events-none
                  absolute
                  top-[-80px]
                  left-1/2
                  -translate-x-1/2
                  w-80
                  h-80
                  rounded-full
                  bg-yellow-400/[0.08]
                  blur-[90px]
                "
            />

            <div
              className="
                  relative
                  w-16
                  h-16
                  mx-auto
                  rounded-[18px]
                  border
                  border-yellow-300/20
                  bg-yellow-400/[0.07]
                  flex
                  items-center
                  justify-center
                  text-yellow-400
                "
            >
              <Trophy size={30} />
            </div>

            <h2
              className="
                  relative
                  mt-6
                  text-2xl
                  sm:text-4xl
                  font-black
                  uppercase
                "
            >
              NO VERIFIED MEMBERS YET
            </h2>

            <p
              className="
                  relative
                  mt-4
                  max-w-xl
                  mx-auto
                  text-sm
                  text-gray-500
                  leading-relaxed
                "
            >
              When the first artist successfully purchases and activates the
              ₹2,999 Verified Spotlight membership, their profile will
              automatically appear here.
            </p>
          </section>
        )}

        {/* =================================================
            VERIFIED MEMBERS
        ================================================= */}

        {!loading && !error && artists.length > 0 && (
          <section className="mt-12">
            <div
              className="
                  mb-7
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-end
                  justify-between
                  gap-5
                "
            >
              <div>
                <p
                  className="
                      text-[9px]
                      font-mono
                      text-yellow-400
                      tracking-[0.16em]
                    "
                >
                  GOLD VERIFIED DIRECTORY
                </p>

                <h2
                  className="
                      mt-2
                      text-3xl
                      sm:text-5xl
                      font-black
                      uppercase
                      tracking-[-0.05em]
                    "
                >
                  VERIFIED ARTISTS
                </h2>
              </div>

              <span
                className="
                    text-[9px]
                    font-mono
                    tracking-[0.12em]
                    text-gray-600
                  "
              >
                {artists.length} PROFILE
                {artists.length === 1 ? "" : "S"}
              </span>
            </div>

            {/* SMALL CARD GRID */}

            <div
              className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                  gap-4
                  items-stretch
                "
            >
              {artists.map((artist, index) => (
                <VerifiedArtistCard
                  key={artist.id || `${artist.name}-${index}`}
                  artist={artist}
                  index={index}
                  onClick={() => handleArtistClick(artist)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   SMALL GOLD ARTIST CARD
========================================================= */

function VerifiedArtistCard({ artist, index, onClick }) {
  return (
    <article
      className="
        group
        relative
        rounded-[22px]
        p-[1px]
        overflow-hidden

        bg-gradient-to-br
        from-yellow-100
        via-yellow-400
        to-amber-800

        transition-all
        duration-500

        hover:-translate-y-1

        shadow-[0_0_22px_rgba(250,204,21,0.07)]
        hover:shadow-[0_0_38px_rgba(250,204,21,0.16)]
      "
    >
      {/* MOVING GOLD SHINE */}

      <div
        className="
          pointer-events-none
          absolute
          -top-[120%]
          -left-[100%]
          w-[70%]
          h-[350%]
          rotate-[25deg]
          bg-gradient-to-r
          from-transparent
          via-white/25
          to-transparent
          transition-transform
          duration-[1300ms]
          group-hover:translate-x-[500%]
        "
      />

      <div
        className="
          relative
          min-h-[455px]
          rounded-[21px]
          overflow-hidden
          bg-[#0b0b0f]
          flex
          flex-col
        "
      >
        {/* GOLD GLOW */}

        <div
          className="
            pointer-events-none
            absolute
            top-[-80px]
            left-1/2
            -translate-x-1/2
            w-[85%]
            h-[180px]
            rounded-full
            bg-yellow-400/[0.08]
            blur-[65px]
          "
        />

        {/* HEADER */}

        <div
          className="
            relative
            z-10
            flex
            items-center
            justify-between
            gap-2
            border-b
            border-yellow-300/10
            px-4
            py-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                relative
                w-2
                h-2
              "
            >
              <span
                className="
                  absolute
                  inset-0
                  rounded-full
                  bg-yellow-400
                  animate-ping
                  opacity-50
                "
              />

              <span
                className="
                  relative
                  block
                  w-2
                  h-2
                  rounded-full
                  bg-yellow-400
                "
              />
            </div>

            <span
              className="
                text-[7px]
                font-black
                tracking-[0.12em]
                text-yellow-300
              "
            >
              GOLD VERIFIED
            </span>
          </div>

          <div
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              border
              border-yellow-300/20
              bg-yellow-400/10
              px-2.5
              py-1
              text-[6px]
              font-black
              tracking-widest
              text-yellow-300
            "
          >
            <Trophy size={9} />
            HALL OF FAME
          </div>
        </div>

        {/* IMAGE */}

        <div
          className="
            relative
            h-[185px]
            overflow-hidden
            bg-[#101014]
          "
        >
          {artist.profileImage ? (
            <img
              src={artist.profileImage}
              alt={artist.name}
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
          ) : (
            <div
              className="
                w-full
                h-full
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-yellow-400/[0.08]
                via-[#101014]
                to-[#08080a]
              "
            >
              <Users
                size={40}
                className="
                  text-yellow-300/25
                "
              />
            </div>
          )}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-[#0b0b0f]
              via-transparent
              to-transparent
            "
          />

          <span
            className="
              absolute
              bottom-3
              right-4
              text-4xl
              font-black
              text-white/[0.10]
            "
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* CONTENT */}

        <div
          className="
            relative
            z-10
            flex-1
            p-4
            flex
            flex-col
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-yellow-400
            "
          >
            <Sparkles size={10} />

            <span
              className="
                text-[7px]
                font-mono
                tracking-[0.12em]
              "
            >
              ₹2,999 VERIFIED SPOTLIGHT
            </span>
          </div>

          {/* NAME */}

          <h3
            className="
              mt-3
              text-[22px]
              sm:text-2xl
              font-black
              uppercase
              tracking-[-0.04em]
              leading-[0.9]
              break-words
            "
          >
            {artist.name}
          </h3>

          {/* STUDIO */}

          {artist.studio && (
            <p
              className="
                mt-2
                text-xs
                text-gray-400
                truncate
              "
            >
              {artist.studio}
            </p>
          )}

          {/* LOCATION */}

          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              text-[11px]
              text-gray-500
            "
          >
            <MapPin
              size={11}
              className="
                text-yellow-400
                shrink-0
              "
            />

            <span
              className="
                truncate
              "
            >
              {[artist.city, artist.state].filter(Boolean).join(", ") ||
                "India"}
            </span>
          </div>

          {/* DETAILS */}

          <div
            className="
              mt-4
              pt-3
              border-t
              border-white/[0.07]
              space-y-1.5
            "
          >
            {artist.experience && (
              <ProfileInfo label="EXPERIENCE" value={artist.experience} />
            )}

            {artist.instagram && (
              <ProfileInfo label="INSTAGRAM" value={artist.instagram} />
            )}

            {artist.email && <ProfileInfo label="EMAIL" value={artist.email} />}

            {artist.phone && <ProfileInfo label="PHONE" value={artist.phone} />}
          </div>

          {/* VIEW PROFILE */}

          <button
            type="button"
            onClick={onClick}
            className="
              group/button
              mt-auto
              pt-5
              flex
              items-center
              justify-between
              gap-3
              text-left
            "
          >
            <span
              className="
                text-[8px]
                font-black
                tracking-[0.12em]
                text-yellow-300
              "
            >
              VIEW VERIFIED PROFILE
            </span>

            <span
              className="
                w-9
                h-9
                shrink-0
                rounded-full
                bg-yellow-400
                text-black
                flex
                items-center
                justify-center
                transition-transform
                group-hover/button:translate-x-1
              "
            >
              <ArrowRight size={13} />
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({ icon, title, text }) {
  return (
    <div
      className="
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-white/[0.07]
        bg-white/[0.02]
        p-5
      "
    >
      <div
        className="
          w-11
          h-11
          shrink-0
          rounded-xl
          border
          border-yellow-300/10
          bg-yellow-400/[0.07]
          text-yellow-400
          flex
          items-center
          justify-center
        "
      >
        {icon}
      </div>

      <div>
        <p
          className="
            text-[9px]
            font-black
            tracking-[0.12em]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-[11px]
            text-gray-600
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE INFO
========================================================= */

function ProfileInfo({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-3
      "
    >
      <span
        className="
          text-[6px]
          font-mono
          tracking-[0.10em]
          text-gray-700
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[68%]
          text-right
          text-[9px]
          text-gray-400
          break-words
        "
      >
        {value}
      </span>
    </div>
  );
}
