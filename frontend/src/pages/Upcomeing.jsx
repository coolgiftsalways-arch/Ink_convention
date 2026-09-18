import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Check,
  MapPin,
  Mic,
  PenTool,
  Store,
  Trophy,
  Users,
  Share2,
  MessageCircle,
} from "lucide-react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import mumbai from "../assets/mumbai.png";
import pune from "../assets/pune.png";
import expoPageBg from "../assets/expo-page-bg.png";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   INK CONVENTION — UPCOMING / PAST EVENTS
   Mumbai + Pune = completed (date hidden)
   Jaipur + Udaipur + Kota = confirmed upcoming (date TBA)
========================================================= */

const completedEvents = [
  {
    id: "mumbai",
    city: "MUMBAI",
    state: "Maharashtra",
    date: "",
    image: mumbai,
  },
  {
    id: "pune",
    city: "PUNE",
    state: "Maharashtra",
    date: "",
    image: pune,
  },
];

const upcomingEvents = [
  {
    id: "jaipur",
    city: "JAIPUR",
    state: "Rajasthan",
    eventStatus: "upcoming",
    date: "DATE TO BE ANNOUNCED",
    venue: "Venue to be announced",
    desc: "Ink Convention is coming to Jaipur. Dates, venue, artist registrations and stall booking details will be announced soon.",
    image:
      "https://images.unsplash.com/photo-1636788988342-bc124fcfd953?auto=format&fit=crop&q=88&w=1400",
  },
  {
    id: "udaipur",
    city: "UDAIPUR",
    state: "Rajasthan",
    eventStatus: "upcoming",
    date: "DATE TO BE ANNOUNCED",
    venue: "Venue to be announced",
    desc: "Ink Convention is coming to Udaipur. Dates, venue, artist registrations and stall booking details will be announced soon.",
    image:
      "https://images.unsplash.com/photo-1742924400583-8937604db85a?auto=format&fit=crop&q=88&w=1400",
  },
  {
    id: "kota",
    city: "KOTA",
    state: "Rajasthan",
    eventStatus: "upcoming",
    date: "DATE TO BE ANNOUNCED",
    venue: "Venue to be announced",
    desc: "Ink Convention is coming to Kota. Dates, venue, artist registrations and stall booking details will be announced soon.",
    image:
      "https://images.unsplash.com/photo-1634673203448-367b0c78f4ab?auto=format&fit=crop&q=88&w=1400",
  },
  {
    id: "hyderabad",
    eventStatus: "planned",
    city: "HYDERABAD",
    state: "Telangana",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Ink Convention is coming to Hyderabad. Event dates, venue, registrations and stall availability will be announced soon.",
    image:
      "https://images.unsplash.com/photo-1575994532957-773da2f83eb1?auto=format&fit=crop&q=85&w=900",
  },
  {
    id: "ahmedabad",
    eventStatus: "planned",
    city: "AHMEDABAD",
    state: "Gujarat",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Ahmedabad is part of the Ink Convention expansion plan. Official dates and venue details will be announced soon.",
    image: expoPageBg,
  },
  {
    id: "chennai",
    eventStatus: "planned",
    city: "CHENNAI",
    state: "Tamil Nadu",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Chennai is on our upcoming-city list. More details about the event will be announced soon.",
    image: expoPageBg,
  },
  {
    id: "kolkata",
    eventStatus: "planned",
    city: "KOLKATA",
    state: "West Bengal",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Ink Convention plans to bring its tattoo, art and culture experience to Kolkata. Stay tuned for updates.",
    image: expoPageBg,
  },
  {
    id: "lucknow",
    eventStatus: "planned",
    city: "LUCKNOW",
    state: "Uttar Pradesh",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Lucknow is part of the upcoming Ink Convention city list. Dates and venue details will be shared when confirmed.",
    image: expoPageBg,
  },
  {
    id: "indore",
    eventStatus: "planned",
    city: "INDORE",
    state: "Madhya Pradesh",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Indore is on the Ink Convention roadmap. Follow the event page for confirmed dates and registration details.",
    image: expoPageBg,
  },
  {
    id: "surat",
    eventStatus: "planned",
    city: "SURAT",
    state: "Gujarat",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Ink Convention is planning to reach Surat. Event dates, venue and stall information will be announced soon.",
    image: expoPageBg,
  },
  {
    id: "chandigarh",
    eventStatus: "planned",
    city: "CHANDIGARH",
    state: "Chandigarh",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Chandigarh is included in our upcoming-city expansion. Stay tuned for official details.",
    image: expoPageBg,
  },
  {
    id: "kochi",
    eventStatus: "planned",
    city: "KOCHI",
    state: "Kerala",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Kochi is on our list of future Ink Convention destinations. More information will be announced soon.",
    image: expoPageBg,
  },
  {
    id: "nagpur",
    eventStatus: "planned",
    city: "NAGPUR",
    state: "Maharashtra",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Nagpur is planned as an upcoming Ink Convention destination. Follow us for dates, venue and booking details.",
    image: expoPageBg,
  },
  {
    id: "vadodara",
    eventStatus: "planned",
    city: "VADODARA",
    state: "Gujarat",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Vadodara is on the Ink Convention future-city list. Official dates and venue details will be announced later.",
    image: expoPageBg,
  },
  {
    id: "nashik",
    eventStatus: "planned",
    city: "NASHIK",
    state: "Maharashtra",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Ink Convention is planning to reach Nashik. More event information will be announced soon.",
    image: expoPageBg,
  },
  {
    id: "bhopal",
    eventStatus: "planned",
    city: "BHOPAL",
    state: "Madhya Pradesh",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Bhopal is part of the Ink Convention expansion plan. Dates, venue and booking details will be shared later.",
    image: expoPageBg,
  },
  {
    id: "raipur",
    eventStatus: "planned",
    city: "RAIPUR",
    state: "Chhattisgarh",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Raipur is on our future destination list. Stay tuned for official Ink Convention announcements.",
    image: expoPageBg,
  },
  {
    id: "guwahati",
    eventStatus: "planned",
    city: "GUWAHATI",
    state: "Assam",
    date: "COMING SOON",
    venue: "Venue to be announced",
    desc: "Ink Convention is planning to bring the experience to Guwahati. Event details will be announced soon.",
    image: expoPageBg,
  },
];

const eventHighlights = [
  { icon: Trophy, label: "Tattoo\nCompetitions" },
  { icon: Mic, label: "Live\nPerformances" },
  { icon: Users, label: "100+\nArtists" },
  { icon: Store, label: "Exhibitors\n& Vendors" },
  { icon: PenTool, label: "Artist\nWorkshops" },
];

export default function Upcomeing() {
  const [selectedEvent, setSelectedEvent] = useState(upcomingEvents[0]);
  const [citySearch, setCitySearch] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const isRealUpcomingEvent = selectedEvent?.eventStatus === "upcoming";

  const confirmedUpcomingEvents = upcomingEvents.filter(
    (event) => event.eventStatus === "upcoming",
  );

  const plannedUpcomingEvents = upcomingEvents.filter(
    (event) => event.eventStatus !== "upcoming",
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".expo-reveal",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: "power3.out",
        },
      );

      gsap.utils.toArray(".event-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=40",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/upcoming`;
  };

  const getShareText = () => {
    const dateText =
      selectedEvent.date && selectedEvent.date !== "DATE TO BE ANNOUNCED"
        ? `Date: ${selectedEvent.date}`
        : "Date: To be announced";

    return `Ink Convention is coming to ${selectedEvent.city}, ${selectedEvent.state}! ${dateText}. Check event details here:`;
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = `${getShareText()} ${url}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );

    setShareOpen(false);
  };

  const handleInstagramShare = async () => {
    const url = getShareUrl();
    const text = getShareText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Ink Convention — ${selectedEvent.city}`,
          text,
          url,
        });

        setShareOpen(false);
        return;
      }

      await navigator.clipboard.writeText(`${text} ${url}`);

      window.open(
        "https://www.instagram.com/",
        "_blank",
        "noopener,noreferrer",
      );

      alert(
        "Event link copied. Open Instagram and paste it into your Story, DM or post.",
      );

      setShareOpen(false);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Instagram share failed:", error);
      }
    }
  };

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#060608]
        text-white
        selection:bg-[#a855f7]/30
      "
    >
      {/* =====================================================
          PAGE BACKGROUND
      ===================================================== */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={expoPageBg}
          alt=""
          aria-hidden="true"
          className="
            h-full
            w-full
            object-cover
            object-center
            opacity-45
            scale-[1.03]
          "
        />

        <div className="absolute inset-0 bg-black/50" />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#050507]/95
            via-[#08080a]/62
            to-[#08080a]/78
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/20
            via-transparent
            to-[#050507]/92
          "
        />
      </div>

      {/* =====================================================
          MAIN DESKTOP / TABLET CONTENT
      ===================================================== */}
      <section
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1700px]
          px-4
          sm:px-6
          lg:px-8
          xl:px-12
          pt-28
          lg:pt-32
          pb-6
        "
      >
        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-[minmax(0,1fr)_500px]
            gap-7
            xl:gap-10
            items-start
          "
        >
          {/* =================================================
              LEFT SIDE
          ================================================= */}
          <div className="min-w-0">
            {/* HERO COPY */}
            <div className="expo-reveal">
              <p
                className="
                  mb-4
                  text-xs
                  sm:text-sm
                  font-black
                  tracking-[0.16em]
                  uppercase
                  text-[#b24cff]
                "
              >
                // EVENTS
              </p>

              <h1
                className="
                  max-w-[1030px]
                  text-[2.45rem]
                  sm:text-[3.2rem]
                  lg:text-[4rem]
                  2xl:text-[4.45rem]
                  font-black
                  uppercase
                  leading-[0.98]
                  tracking-[-0.035em]
                "
              >
                See where Ink Convention
                <br className="hidden sm:block" />
                <span className="sm:ml-0"> has been and where it&apos;s </span>
                <span
                  className="
                    text-[#a855f7]
                    drop-shadow-[0_0_24px_rgba(168,85,247,0.34)]
                  "
                >
                  going next.
                </span>
              </h1>

              <p
                className="
                  mt-4
                  text-[10px]
                  sm:text-xs
                  tracking-[0.24em]
                  uppercase
                  text-gray-400
                "
              >
                Past cities. Upcoming cities. A bigger community.
              </p>
            </div>

            {/* =================================================
                COMPLETED
            ================================================= */}
            <div className="expo-reveal mt-6 lg:mt-5">
              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >
                {completedEvents.map((event) => (
                  <Link
                    key={event.id}
                    to="/gallery"
                    aria-label={`Open ${event.city} event gallery`}
                    className="
                      event-card
                      group
                      relative
                      block
                      min-h-[155px]
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[#a855f7]/45
                      bg-[#151218]/85
                      shadow-[0_18px_50px_rgba(0,0,0,0.28)]
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-[#a855f7]
                    "
                  >
                    <img
                      src={event.image}
                      alt={event.city}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        object-center
                        opacity-42
                        grayscale
                        transition-transform
                        duration-700
                        group-hover:scale-105
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-[#17121c]/95
                        via-[#17121c]/70
                        to-[#17121c]/35
                      "
                    />

                    <div className="relative z-10 flex h-full min-h-[155px] flex-col justify-between p-5">
                      <div
                        className="
                          inline-flex
                          w-fit
                          items-center
                          gap-2
                          text-[10px]
                          sm:text-xs
                          font-bold
                          uppercase
                          tracking-[0.16em]
                          text-gray-200
                        "
                      >
                        <span
                          className="
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            bg-[#a855f7]
                            shadow-[0_0_18px_rgba(168,85,247,0.55)]
                          "
                        >
                          <Check size={15} strokeWidth={3} />
                        </span>
                        Completed
                      </div>

                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase">
                          {event.city}
                        </h2>

                        <p className="mt-1 text-xs uppercase tracking-[0.08em] text-gray-400">
                          {event.state}
                        </p>

                        {event.date && (
                          <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wide text-gray-200">
                            {event.date}
                          </p>
                        )}
                      </div>

                      <div
                        className="
                          absolute
                          right-4
                          bottom-4
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/50
                          bg-black/35
                          transition
                          group-hover:border-[#a855f7]
                          group-hover:bg-[#a855f7]/15
                        "
                      >
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* =================================================
                UPCOMING CITIES
                TOP ROW = ONLY 3 CONFIRMED CITIES
            ================================================= */}
            <div className="expo-reveal mt-6">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-[#d4af37]
                    shadow-[0_0_14px_rgba(212,175,55,0.75)]
                  "
                />

                <h3
                  className="
                    text-xs
                    sm:text-sm
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-[#f4dc8a]
                  "
                >
                  Confirmed Upcoming Cities
                </h3>

                <span
                  className="
                    hidden
                    sm:block
                    h-px
                    flex-1
                    bg-gradient-to-r
                    from-[#d4af37]/45
                    to-transparent
                  "
                />
              </div>

              {/* =================================================
                  BIG TOP ROW — JAIPUR / UDAIPUR / KOTA ONLY
              ================================================= */}
              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-4
                  lg:gap-5
                "
              >
                {confirmedUpcomingEvents.map((event, index) => {
                  const isSelected = selectedEvent.id === event.id;

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShareOpen(false);
                      }}
                      className={`
                        event-card
                        group
                        relative
                        min-h-[210px]
                        sm:min-h-[225px]
                        lg:min-h-[245px]
                        overflow-hidden
                        rounded-[20px]
                        border
                        text-left
                        transition-all
                        duration-300

                        ${
                          isSelected
                            ? "border-[#f0d36f] ring-1 ring-[#d4af37]/35 shadow-[0_20px_55px_rgba(212,175,55,0.18)]"
                            : "border-[#d4af37]/65 hover:border-[#f4dc8a] hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(212,175,55,0.12)]"
                        }
                      `}
                    >
                      {/* CITY IMAGE */}
                      <img
                        src={event.image}
                        alt={event.city}
                        className={`
                          absolute
                          inset-0
                          h-full
                          w-full
                          object-cover
                          ${
                            event.id === "jaipur"
                              ? "object-[center_44%]"
                              : event.id === "udaipur"
                                ? "object-[center_48%]"
                                : event.id === "kota"
                                  ? "object-[center_52%]"
                                  : "object-center"
                          }
                          opacity-90
                          grayscale-0
                          brightness-90
                          contrast-105
                          saturate-110
                          transition-transform
                          duration-700
                          group-hover:scale-105
                        `}
                      />

                      {/* GOLD/PURPLE OVERLAY */}
                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-[#08070a]/82
                          via-[#120d16]/35
                          to-transparent
                        "
                      />

                      {/* SOFT GOLD GLOW */}
                      <div
                        className="
                          absolute
                          -right-10
                          -top-10
                          h-36
                          w-36
                          rounded-full
                          bg-[#d4af37]/7
                          blur-[55px]
                          pointer-events-none
                        "
                      />

                      {/* TEXT READABILITY — keeps image visible */}
                      <div
                        className="
                          absolute
                          inset-x-0
                          bottom-0
                          h-[48%]
                          bg-gradient-to-t
                          from-black/60
                          via-black/20
                          to-transparent
                          pointer-events-none
                        "
                      />

                      {/* CARD NUMBER */}
                      <div
                        className="
                          absolute
                          right-4
                          top-4
                          text-[10px]
                          font-mono
                          font-black
                          tracking-[0.18em]
                          text-[#f4dc8a]/70
                        "
                      >
                        0{index + 1}
                      </div>

                      <div
                        className="
                          relative
                          z-10
                          flex
                          min-h-[210px]
                          sm:min-h-[225px]
                          lg:min-h-[245px]
                          flex-col
                          justify-between
                          p-5
                          sm:p-6
                        "
                      >
                        {/* CONFIRMED CHIP */}
                        <div>
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-[#d4af37]/45
                              bg-black/35
                              px-3
                              py-1.5
                              text-[8px]
                              sm:text-[9px]
                              font-black
                              uppercase
                              tracking-[0.16em]
                              text-[#f4dc8a]
                              backdrop-blur-md
                            "
                          >
                            <span
                              className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-[#d4af37]
                                shadow-[0_0_10px_rgba(212,175,55,0.9)]
                              "
                            />
                            Confirmed
                          </span>
                        </div>

                        {/* CITY INFO */}
                        <div className="pr-14">
                          <h4
                            className="
                              text-2xl
                              sm:text-3xl
                              lg:text-[2rem]
                              xl:text-[2.25rem]
                              font-black
                              uppercase
                              leading-none
                              tracking-[-0.03em]
                              text-white
                            "
                          >
                            {event.city}
                          </h4>

                          <p
                            className="
                              mt-2
                              text-[10px]
                              sm:text-xs
                              uppercase
                              tracking-[0.14em]
                              text-[#d6c99a]
                            "
                          >
                            {event.state}
                          </p>

                          {event.date !== "DATE TO BE ANNOUNCED" && (
                            <p
                              className="
                                mt-3
                                text-[11px]
                                sm:text-xs
                                font-black
                                uppercase
                                tracking-[0.08em]
                                text-[#f4dc8a]
                              "
                            >
                              {event.date}
                            </p>
                          )}
                        </div>

                        {/* ARROW */}
                        <span
                          className="
                            absolute
                            right-5
                            bottom-5
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#d4af37]/55
                            bg-[#d4af37]/10
                            text-[#f4dc8a]
                            backdrop-blur-md
                            transition-all
                            duration-300
                            group-hover:bg-[#d4af37]
                            group-hover:text-black
                            group-hover:scale-105
                          "
                        >
                          <ArrowRight size={20} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* =================================================
                  OTHER FUTURE CITIES
              ================================================= */}
              <div className="mt-7">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />

                  <h3
                    className="
                      text-[10px]
                      sm:text-xs
                      font-black
                      uppercase
                      tracking-[0.16em]
                      text-gray-400
                    "
                  >
                    More Cities Coming Soon
                  </h3>
                </div>

                <div
                  className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                    gap-3
                  "
                >
                  {plannedUpcomingEvents.map((event) => {
                    const isSelected = selectedEvent.id === event.id;

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShareOpen(false);
                        }}
                        className={`
                          event-card
                          group
                          relative
                          min-h-[112px]
                          overflow-hidden
                          rounded-xl
                          border
                          text-left
                          transition-all
                          duration-300

                          ${
                            isSelected
                              ? "border-white/25 bg-[#101014] ring-1 ring-white/10"
                              : "border-white/10 bg-[#0d0d11] hover:border-white/20"
                          }
                        `}
                      >
                        <img
                          src={event.image}
                          alt=""
                          className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                            opacity-20
                            grayscale
                            contrast-125
                            transition-transform
                            duration-500
                            group-hover:scale-105
                          "
                        />

                        <div
                          className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-[#0b0b0e]
                            via-[#0d0d11]/90
                            to-black/50
                          "
                        />

                        <div
                          className="
                            relative
                            z-10
                            flex
                            min-h-[112px]
                            flex-col
                            justify-end
                            p-3.5
                          "
                        >
                          <span
                            className="
                              absolute
                              left-3.5
                              top-3.5
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              border-white/10
                              bg-black/25
                              px-2
                              py-1
                              text-[6px]
                              font-bold
                              uppercase
                              tracking-[0.14em]
                              text-gray-500
                            "
                          >
                            <span className="h-1 w-1 rounded-full bg-gray-600" />
                            Coming Soon
                          </span>

                          <h4
                            className="
                              pr-10
                              text-sm
                              sm:text-base
                              font-black
                              uppercase
                              text-gray-300
                            "
                          >
                            {event.city}
                          </h4>

                          <p
                            className="
                              mt-1
                              text-[8px]
                              uppercase
                              tracking-[0.10em]
                              text-gray-500
                            "
                          >
                            {event.state}
                          </p>

                          <span
                            className="
                              absolute
                              right-3
                              bottom-3
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-white/15
                              bg-black/30
                              text-gray-500
                              transition
                              group-hover:border-white/30
                              group-hover:text-gray-300
                            "
                          >
                            <ArrowRight size={15} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE — NEXT EVENT
          ================================================= */}
          <aside
            className="
              expo-reveal
              xl:sticky
              xl:top-28
              rounded-[26px]
              border
              border-white/10
              bg-[#100d14]/90
              backdrop-blur-xl
              shadow-[0_25px_90px_rgba(0,0,0,0.42)]
              overflow-hidden
            "
          >
            <div className="relative p-5 sm:p-6">
              <div
                className="
                  absolute
                  -right-24
                  -top-24
                  h-72
                  w-72
                  rounded-full
                  bg-[#a855f7]/10
                  blur-[90px]
                  pointer-events-none
                "
              />

              <div
                className="
                  relative
                  z-10
                  flex
                  items-center
                  gap-3
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-[#b24cff]
                "
              >
                <span
                  className="
                    h-3
                    w-3
                    rounded-full
                    bg-[#a855f7]
                    shadow-[0_0_16px_rgba(168,85,247,0.8)]
                  "
                />
                {isRealUpcomingEvent ? "Next Event" : "Coming Soon"}
              </div>

              {isRealUpcomingEvent ? (
                <>
                  <div className="relative z-10 mt-5 flex flex-col sm:flex-row gap-5">
                    <div
                      className="
                        h-44
                        w-full
                        sm:h-44
                        sm:w-36
                        shrink-0
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-black
                      "
                    >
                      <img
                        src={selectedEvent.image}
                        alt={selectedEvent.city}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 pt-1">
                      <h2 className="text-3xl font-black uppercase">
                        {selectedEvent.city}
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        {selectedEvent.state}
                      </p>

                      {selectedEvent.date !== "DATE TO BE ANNOUNCED" && (
                        <div className="mt-5 flex items-start gap-3">
                          <Calendar
                            size={18}
                            className="mt-0.5 shrink-0 text-gray-300"
                          />

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500">
                              Date
                            </p>

                            <p className="mt-1 text-xs sm:text-sm">
                              {selectedEvent.date}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-start gap-3">
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-gray-300"
                        />

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-500">
                            Venue
                          </p>

                          <p className="mt-1 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                            {selectedEvent.venue}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 border-t border-white/10 pt-5">
                    <h3
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.14em]
                        text-[#b24cff]
                      "
                    >
                      About The Event
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      {selectedEvent.desc}
                    </p>
                  </div>

                  <div className="relative z-10 mt-6">
                    <h3
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.14em]
                        text-[#b24cff]
                      "
                    >
                      Event Highlights
                    </h3>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {eventHighlights.map((item) => (
                        <div
                          key={item.label}
                          className="
                            min-h-[76px]
                            rounded-xl
                            border
                            border-white/10
                            bg-black/25
                            px-2
                            py-3
                            text-center
                          "
                        >
                          <item.icon
                            size={18}
                            className="mx-auto mb-2 text-[#a855f7]"
                          />

                          <p className="whitespace-pre-line text-[9px] leading-tight text-gray-400">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* BOOK YOUR STALL — directly below event highlights */}
                    <Link
                      to="/stall-booking"
                      className="
                        mt-5
                        w-full
                        min-h-[58px]
                        rounded-xl
                        bg-gradient-to-r
                        from-[#8b2be2]
                        via-[#9d36ef]
                        to-[#b24cff]
                        px-5
                        flex
                        items-center
                        justify-center
                        gap-3
                        text-center
                        text-xs
                        sm:text-sm
                        font-black
                        uppercase
                        tracking-[0.13em]
                        text-white
                        shadow-[0_14px_36px_rgba(168,85,247,0.24)]
                        transition
                        duration-300
                        hover:-translate-y-0.5
                        hover:brightness-110
                      "
                    >
                      <Store size={18} />
                      Book Your Stall Now
                      <ArrowRight size={18} />
                    </Link>

                    {/* SHARE EVENT */}
                    <div className="relative mt-3">
                      <button
                        type="button"
                        onClick={() => setShareOpen((open) => !open)}
                        className="
                          w-full
                          min-h-[52px]
                          rounded-xl
                          border
                          border-[#a855f7]/40
                          bg-[#a855f7]/[0.07]
                          px-5
                          flex
                          items-center
                          justify-center
                          gap-3
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.13em]
                          text-white
                          transition-all
                          duration-300
                          hover:bg-[#a855f7]/15
                          hover:border-[#a855f7]/70
                        "
                      >
                        <Share2 size={17} />
                        Share This Event
                      </button>

                      {shareOpen && (
                        <div
                          className="
                            mt-3
                            grid
                            grid-cols-2
                            gap-3
                            rounded-2xl
                            border
                            border-white/10
                            bg-[#09090d]/95
                            p-3
                            shadow-[0_18px_55px_rgba(0,0,0,0.45)]
                            backdrop-blur-xl
                          "
                        >
                          <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="
                              min-h-[48px]
                              rounded-xl
                              border
                              border-white/10
                              bg-white/[0.04]
                              px-3
                              flex
                              items-center
                              justify-center
                              gap-2
                              text-[10px]
                              sm:text-xs
                              font-bold
                              uppercase
                              tracking-[0.10em]
                              text-white
                              transition
                              hover:border-[#25D366]/45
                              hover:bg-[#25D366]/10
                            "
                          >
                            <MessageCircle size={17} />
                            WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={handleInstagramShare}
                            className="
                              min-h-[48px]
                              rounded-xl
                              border
                              border-white/10
                              bg-white/[0.04]
                              px-3
                              flex
                              items-center
                              justify-center
                              gap-2
                              text-[10px]
                              sm:text-xs
                              font-bold
                              uppercase
                              tracking-[0.10em]
                              text-white
                              transition
                              hover:border-[#c084fc]/55
                              hover:bg-[#a855f7]/10
                            "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="5"
                                ry="5"
                              />
                              <circle cx="12" cy="12" r="4" />
                              <circle
                                cx="17.5"
                                cy="6.5"
                                r="1"
                                fill="currentColor"
                                stroke="none"
                              />
                            </svg>
                            Instagram
                          </button>

                          <p
                            className="
                              col-span-2
                              px-1
                              text-center
                              text-[9px]
                              leading-relaxed
                              text-gray-500
                            "
                          >
                            On mobile, Instagram can appear in your phone&apos;s
                            share sheet. On desktop, the event link is copied so
                            you can paste it into Instagram.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="
                    relative
                    z-10
                    min-h-[500px]
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    px-3
                  "
                >
                  <div
                    className="
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#a855f7]/30
                      bg-[#a855f7]/10
                      shadow-[0_0_40px_rgba(168,85,247,0.12)]
                    "
                  >
                    <MapPin size={34} className="text-[#a855f7]" />
                  </div>

                  <p
                    className="
                      mt-6
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.22em]
                      text-[#b24cff]
                    "
                  >
                    Future Location
                  </p>

                  <h2 className="mt-2 text-4xl font-black uppercase">
                    {selectedEvent.city}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedEvent.state}
                  </p>

                  <div
                    className="
                      mt-6
                      rounded-full
                      border
                      border-[#a855f7]/35
                      bg-[#a855f7]/10
                      px-5
                      py-2
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.18em]
                      text-[#c084fc]
                    "
                  >
                    Coming Soon
                  </div>

                  <p className="mt-6 max-w-[330px] text-sm leading-relaxed text-gray-400">
                    Ink Convention is planning to come to{" "}
                    <span className="font-semibold text-white">
                      {selectedEvent.city}
                    </span>
                    , but the event is not confirmed yet. Date, venue, artist
                    registrations and stall bookings will be announced later.
                  </p>

                  <button
                    type="button"
                    onClick={() => setCitySearch(selectedEvent.city)}
                    className="
                      mt-8
                      w-full
                      rounded-xl
                      border
                      border-[#a855f7]/45
                      bg-[#a855f7]/10
                      px-5
                      py-3
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-white
                      transition
                      hover:bg-[#a855f7]/20
                    "
                  >
                    Notify Me For {selectedEvent.city}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
