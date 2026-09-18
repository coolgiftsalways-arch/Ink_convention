import { ArrowDown, ArrowUpRight, MapPin, Sparkles } from "lucide-react";

/* =========================================================
   SPONSOR DATA
========================================================= */

const sponsors = [
  {
    id: "01",
    name: "Tattoo Gizmo",
    category: "Equipment, inks, needles",
    location: "Delhi / India",
    priority: 3,
  },
  {
    id: "02",
    name: "Kings Tattoo Supply",
    category: "Machines, inks, needles",
    location: "Mumbai / India",
    priority: 3,
  },
  {
    id: "03",
    name: "Mumbai Tattoo",
    category: "Ink, machines, needles, kits",
    location: "Mumbai",
    priority: 3,
  },
  {
    id: "04",
    name: "Tattoo Machine India",
    category: "Machines & supplies",
    location: "Mumbai / Delhi",
    priority: 3,
  },
  {
    id: "05",
    name: "Avon Tattoo Supply",
    category: "Machines, inks, cartridges",
    location: "India",
    priority: 3,
  },
  {
    id: "06",
    name: "AIR Tattoo Supply",
    category: "Machines, inks, equipment",
    location: "Hyderabad",
    priority: 2,
  },
  {
    id: "07",
    name: "Inktribe",
    category: "Needles, inks, machines",
    location: "Mumbai",
    priority: 2,
  },
  {
    id: "08",
    name: "Shiva Tattoo Supply",
    category: "Ink, machines, kits",
    location: "Nagpur",
    priority: 2,
  },
  {
    id: "09",
    name: "Element Tattoo Supply",
    category: "Needles, ink, machines, aftercare",
    location: "India",
    priority: 2,
  },
  {
    id: "10",
    name: "Tattoos Inc.",
    category: "Tattoo ink & supplies",
    location: "Mumbai",
    priority: 2,
  },
  {
    id: "11",
    name: "Needle Arts",
    category: "Tattoo needles",
    location: "Mumbai",
    priority: 2,
  },
  {
    id: "12",
    name: "Tattoo Zone",
    category: "Tattoo ink / body art",
    location: "Delhi",
    priority: 1,
  },
  {
    id: "13",
    name: "Jack Tattoo Supply",
    category: "Tattoo needles & supplies",
    location: "Nagpur",
    priority: 1,
  },
  {
    id: "14",
    name: "Tattoo Gizmo",
    category: "Needles / equipment / international brands",
    location: "Delhi",
    priority: 3,
  },
  {
    id: "15",
    name: "Bishop India Tattoo Supply",
    category: "Premium tattoo machines / equipment",
    location: "Mumbai",
    priority: 3,
  },
  {
    id: "16",
    name: "Cheyenne India",
    category: "Premium tattoo machines",
    location: "India",
    priority: 3,
  },
  {
    id: "17",
    name: "Eternal Ink",
    category: "Tattoo ink",
    location: "International / India distribution",
    priority: 3,
  },
  {
    id: "18",
    name: "Intenze Tattoo Ink",
    category: "Tattoo ink",
    location: "International / India distribution",
    priority: 3,
  },
  {
    id: "19",
    name: "Kwadron",
    category: "Needles / cartridges",
    location: "International / India distribution",
    priority: 2,
  },
  {
    id: "20",
    name: "World Famous Tattoo Ink",
    category: "Tattoo ink",
    location: "International / India distribution",
    priority: 3,
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Sponsors() {
  const scrollToSponsors = () => {
    document.getElementById("potential-sponsors")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050506] text-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[95vh] overflow-hidden border-b border-white/10">
        {/* HERO IMAGE */}

        <img
          src="/images/sponsor-hero.png"
          alt="Ink Convention Sponsors"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
          "
        />

        {/* BLACK OVERLAY */}

        <div className="absolute inset-0 bg-black/30" />

        {/* LEFT DARK GRADIENT */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black
            via-black/80
            to-black/10
          "
        />

        {/* BOTTOM FADE */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#050506]
            via-transparent
            to-black/30
          "
        />

        {/* PURPLE GLOW */}

        <div
          className="
            absolute
            -left-40
            top-1/3
            h-[500px]
            w-[500px]
            rounded-full
            bg-purple-600/10
            blur-[150px]
          "
        />

        {/* CONTENT */}

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-[95vh]
            max-w-[1500px]
            flex-col
            justify-end
            px-5
            pb-12
            pt-36

            sm:px-8

            md:px-12

            lg:px-16
            lg:pb-16
          "
        >
          <div className="max-w-[950px]">
            {/* SMALL LABEL */}

            <div className="mb-6 flex items-center gap-4">
              <span className="h-[2px] w-12 bg-purple-500" />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.4em]
                  text-purple-400
                "
              >
                Sponsors / Ink Convention
              </span>
            </div>

            {/* TITLE */}

            <h1
              className="
                text-[clamp(3.5rem,9vw,9rem)]
                font-black
                uppercase
                leading-[0.78]
                tracking-[-0.075em]
              "
            >
              GOOD BRANDS
              <br />
              <span className="text-purple-500">BETTER TATTOOS.</span>
            </h1>

            {/* TEXT */}

            <p
              className="
                mt-8
                max-w-[700px]
                text-sm
                leading-7
                text-white/60

                sm:text-base

                md:text-lg
              "
            >
              Where tattoo culture meets the brands that power it. Partner with
              India&apos;s growing tattoo community and put your brand directly
              in front of artists, studios and serious tattoo enthusiasts.
            </p>

            {/* BUTTONS */}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToSponsors}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-purple-600
                  px-7
                  py-4
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  transition-all
                  duration-300

                  hover:bg-purple-500
                  hover:shadow-[0_0_35px_rgba(168,85,247,0.35)]
                "
              >
                Explore Sponsors
                <ArrowDown
                  size={14}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-y-1
                  "
                />
              </button>

            </div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div
            className="
              mt-14
              grid
              grid-cols-2
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-black/35
              backdrop-blur-xl

              md:grid-cols-4
            "
          >
            <Stat number="20" label="Potential Sponsors" />

            <Stat number="5+" label="Categories" />

            <Stat number="10+" label="Cities & Global Reach" />

            <Stat number="∞" label="Opportunities" />
          </div>
        </div>
      </section>

      {/* =====================================================
          SPONSORS SECTION
      ===================================================== */}

      <section
        id="potential-sponsors"
        className="
          mx-auto
          max-w-[1500px]
          px-5
          py-20

          sm:px-8

          md:px-12

          lg:px-16
          lg:py-28
        "
      >
        {/* TOP */}

        <div
          className="
            grid
            gap-10

            lg:grid-cols-[1fr_0.7fr]
            lg:items-end
          "
        >
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="text-[9px] font-black tracking-[0.3em] text-purple-400">
                [ 02 ]
              </span>

              <span className="h-[1px] w-10 bg-purple-500" />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-white/35
                "
              >
                Potential Partners
              </span>
            </div>

            <h2
              className="
                text-5xl
                font-black
                uppercase
                leading-[0.85]
                tracking-[-0.055em]

                sm:text-6xl

                lg:text-8xl
              "
            >
              THE BRANDS
              <br />
              <span className="text-purple-500">SHAPING OUR</span>
              <br />
              INDUSTRY
            </h2>
          </div>

          <div>
            <p
              className="
                max-w-xl
                text-sm
                leading-7
                text-white/45

                md:text-base
              "
            >
              From premium tattoo machines and inks to needles, equipment and
              aftercare — these brands are key players in the tattoo industry
              and potential partners for Ink Convention.
            </p>

            {/* CATEGORIES */}

            <div className="mt-6 flex flex-wrap gap-2">
              {["EQUIPMENT", "INKS", "NEEDLES", "MACHINES", "AFTERCARE"].map(
                (item) => (
                  <span
                    key={item}
                    className="
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.025]
                    px-3
                    py-2
                    text-[7px]
                    font-black
                    tracking-[0.18em]
                    text-white/40
                  "
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            20 SPONSORS
        ================================================= */}

        <div
          className="
            mt-14
            grid
            grid-cols-1
            gap-[1px]
            overflow-hidden
            rounded-[24px]
            border
            border-white/10
            bg-white/10

            sm:grid-cols-2

            lg:grid-cols-4

            xl:grid-cols-5
          "
        >
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={`${sponsor.id}-${sponsor.name}`}
              sponsor={sponsor}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="border-y border-white/10 bg-[#08080a]">
        <div
          className="
            mx-auto
            grid
            max-w-[1500px]
            gap-12
            px-5
            py-20

            sm:px-8

            md:px-12

            lg:grid-cols-2
            lg:px-16
            lg:py-28
          "
        >
          {/* LEFT */}

          <div>
            <div className="mb-6 flex items-center gap-3">
              <Sparkles size={15} className="text-purple-500" />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-purple-400
                "
              >
                Become A Sponsor
              </span>
            </div>

            <h3
              className="
                text-5xl
                font-black
                uppercase
                leading-[0.88]
                tracking-[-0.055em]

                sm:text-6xl

                lg:text-7xl
              "
            >
              NOT JUST
              <br />
              A SPONSOR.
              <br />
              <span className="text-purple-500">
                BE PART OF
                <br />
                THE MOVEMENT.
              </span>
            </h3>
          </div>

          {/* RIGHT */}

          <div className="flex flex-col justify-end">
            <p
              className="
                max-w-lg
                text-sm
                leading-7
                text-white/45

                md:text-base
              "
            >
              Support the artists. Empower the community. Build meaningful
              visibility inside India&apos;s tattoo culture.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SPONSOR CARD
========================================================= */

function SponsorCard({ sponsor }) {
  return (
    <article
      className="
        group
        relative
        min-h-[245px]
        overflow-hidden
        bg-[#09090b]
        p-6
        transition-all
        duration-500

        hover:bg-[#100b15]

        sm:p-7
      "
    >
      {/* HUGE NUMBER */}

      <span
        className="
          absolute
          -right-1
          top-2
          text-7xl
          font-black
          tracking-[-0.1em]
          text-white/[0.025]
          transition-all
          duration-500

          group-hover:text-purple-500/[0.07]
        "
      >
        {sponsor.id}
      </span>

      <div className="relative z-10 flex min-h-[195px] flex-col">
        {/* TOP */}

        <div className="flex items-center justify-between">
          <span
            className="
              text-[9px]
              font-black
              tracking-[0.22em]
              text-purple-400
            "
          >
            {sponsor.id}
          </span>

          {/* PRIORITY DOTS */}

          <div className="flex gap-1">
            {Array.from({
              length: sponsor.priority,
            }).map((_, index) => (
              <span
                key={index}
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-purple-500
                  shadow-[0_0_10px_rgba(168,85,247,0.8)]
                "
              />
            ))}
          </div>
        </div>

        {/* BOTTOM */}

        <div className="mt-auto">
          <h3
            className="
              max-w-[230px]
              text-lg
              font-black
              uppercase
              leading-tight
              tracking-[-0.025em]
              transition-colors
              duration-300

              group-hover:text-purple-300
            "
          >
            {sponsor.name}
          </h3>

          <p
            className="
              mt-3
              min-h-[38px]
              text-xs
              leading-5
              text-white/40
            "
          >
            {sponsor.category}
          </p>

          <div
            className="
              mt-5
              flex
              items-start
              gap-2
              text-[10px]
              leading-5
              text-white/50
            "
          >
            <MapPin
              size={12}
              className="
                mt-1
                shrink-0
                text-purple-500
              "
            />

            <span>{sponsor.location}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM PURPLE LINE */}

      <div
        className="
          absolute
          bottom-0
          left-0
          h-[2px]
          w-0
          bg-purple-500
          transition-all
          duration-500

          group-hover:w-full
        "
      />

      {/* HOVER GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-28
          -right-28
          h-56
          w-56
          rounded-full
          bg-purple-600/0
          blur-[70px]
          transition-all
          duration-500

          group-hover:bg-purple-600/10
        "
      />
    </article>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({ number, label }) {
  return (
    <div
      className="
        border-r
        border-b
        border-white/10
        p-5
        text-center

        even:border-r-0

        md:border-b-0
        md:even:border-r
        md:last:border-r-0

        sm:p-7
      "
    >
      <div
        className="
          text-3xl
          font-black
          tracking-[-0.04em]

          sm:text-4xl
        "
      >
        {number}
      </div>

      <div
        className="
          mt-2
          text-[7px]
          font-black
          uppercase
          tracking-[0.17em]
          text-white/35

          sm:text-[8px]
        "
      >
        {label}
      </div>
    </div>
  );
}
