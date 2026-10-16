import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Crown,
  MapPin,
  MessageCircle,
  Mic2,
  PenTool,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "../Style/Upcomeing.css";

gsap.registerPlugin(ScrollTrigger);

/* ==============================================================
   INKCONVENTION / INDIA TOUR 2026 — FIVE CITIES
   Existing file: frontend/src/pages/Upcomeing.jsx
   Navbar and Footer are provided by your app (not duplicated).
   City photographs are of the cities, not event photographs.
   Non-Lucknow venues are proposed and must be confirmed.
   ============================================================== */

const EVENTS = [
  {
    id: "gorakhpur",
    city: "GORAKHPUR",
    stop: "01",
    date: "Sunday, 22 November 2026",
    shortDate: "22 NOV 2026",
    time: "11:00 AM – 6:00 PM",
    venue: "COURTYARD BY MARRIOTT GORAKHPUR",
    address: "RAMGARH TAL, NAUKA VIHAR ROAD, GORAKHPUR",
    confirmed: false,
    landmark: "RAMGARH TAL",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ramgarh_Tal_Lake%2C_Gorakhpur%2C_8_Apr_2019.jpg?width=1400",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Ramgarh_Tal_Lake,_Gorakhpur,_8_Apr_2019.jpg",
    photoCredit: "Alexey Komarov (CC BY-SA 4.0)",
  },
  {
    id: "noida",
    city: "NOIDA",
    stop: "02",
    date: "Sunday, 29 November 2026",
    shortDate: "29 NOV 2026",
    time: "11:00 AM – 6:00 PM",
    venue: "RADISSON BLU MBD HOTEL, NOIDA",
    address: "L-2, SECTOR 18, NOIDA",
    confirmed: false,
    landmark: "NOIDA SKYLINE",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Noida_Sector_7X_Skyline.jpg?width=1400",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Noida_Sector_7X_Skyline.jpg",
    photoCredit: "SeekeroftheCosmos (CC0)",
  },
  {
    id: "varanasi",
    city: "VARANASI",
    stop: "03",
    date: "Sunday, 6 December 2026",
    shortDate: "06 DEC 2026",
    time: "11:00 AM – 6:00 PM",
    venue: "TAJ GANGES, VARANASI",
    address: "NADESAR GROUNDS, VARANASI",
    confirmed: false,
    landmark: "GANGA GHATS",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/View_of_the_ghats_at_Varanasi.jpg?width=1400",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:View_of_the_ghats_at_Varanasi.jpg",
    photoCredit: "Vimalinarc (CC BY 4.0)",
  },
  {
    id: "agra",
    city: "AGRA",
    stop: "04",
    date: "Sunday, 13 December 2026",
    shortDate: "13 DEC 2026",
    time: "11:00 AM – 6:00 PM",
    venue: "JAYPEE PALACE HOTEL & CONVENTION CENTRE",
    address: "FATEHABAD ROAD, AGRA",
    confirmed: false,
    landmark: "TAJ MAHAL",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal%2C_Agra..JPG?width=1400",
    photoSource: "https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra..JPG",
    photoCredit: "Dr. Suchet Chaudhary (CC BY-SA 3.0)",
  },
  {
    id: "lucknow",
    city: "LUCKNOW",
    stop: "05",
    date: "Sunday, 20 December 2026",
    shortDate: "20 DEC 2026",
    time: "11:00 AM – 6:00 PM",
    venue: "RADIANCE EXHIBITION CENTRE",
    address: "BHOOTNATH MARKET, LUCKNOW",
    confirmed: true,
    landmark: "RUMI DARWAZA",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rumi_Darwaja_%28Rumi_Gate%29.jpg?width=1400",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Rumi_Darwaja_(Rumi_Gate).jpg",
    photoCredit: "Aryanmathurphotography (CC BY-SA 4.0)",
  },
];

const HIGHLIGHTS = [
  { Icon: PenTool, title: "TATTOO ART", detail: "ARTISTS & LIVE DEMOS" },
  { Icon: Trophy, title: "COMPETITIONS", detail: "CREATIVITY & SKILL" },
  { Icon: Users, title: "ARTIST COMMUNITY", detail: "MEET & CONNECT" },
  { Icon: Mic2, title: "MUSIC & CULTURE", detail: "SHARED EXPERIENCES" },
];

const NORMAL_FEATURES = [
  "Full exhibition floor & main stage access",
  "1 FREE entry into 1 competition category",
  "Unlimited complimentary beverages",
  "Main-floor artist, brand & industry networking",
  "Standard exhibition entry",
];

const VIP_FEATURES = [
  "ALL Standard Pass access & networking",
  "3 FREE competition entries in 3 DIFFERENT categories",
  "20% OFF any product purchased at the expo",
  "Private VIP lounge & premium vendor meetings",
  "Unlimited complimentary meals & beverages",
  "Dedicated express VIP check-in lane",
  "VIP swag bag & reserved front-row stage seats",
];

function InstagramIcon() {
  return (
    <svg
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
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function money(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function CityPhoto({ event, className, eager = false }) {
  return (
    <img
      className={className}
      src={event.image}
      alt={`${event.landmark}, ${event.city}`}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      onError={(e) => {
        e.currentTarget.style.opacity = "0";
      }}
    />
  );
}

export default function Upcomeing() {
  const pageRef = useRef(null);
  const toastTimer = useRef(null);
  const [selected, setSelected] = useState(() => {
    if (typeof window === "undefined") return 4;
    const requested = new URLSearchParams(window.location.search).get("city");
    const index = EVENTS.findIndex((item) => item.id === requested);
    return index >= 0 ? index : 4; // 05 / 05 = Lucknow by default
  });
  const [paused, setPaused] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState("");
  const event = EVENTS[selected];

  // Tour slideshow: one city every five seconds; pauses during interaction.
  useEffect(() => {
    if (
      paused ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setSelected((current) => (current + 1) % EVENTS.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const context = gsap.context(() => {
      gsap.fromTo(
        ".tour26-reveal",
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
        },
      );
      gsap.utils.toArray(".tour26-scrollReveal").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          },
        );
      });
    }, pageRef);
    return () => context.revert();
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function notify(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3500);
  }

  function chooseCity(index) {
    setSelected((index + EVENTS.length) % EVENTS.length);
  }

  function eventUrl() {
    const pathname = "/upcoming";
    if (typeof window === "undefined") return `${pathname}?city=${event.id}`;
    return `${window.location.origin}${pathname}?city=${event.id}`;
  }

  function shareWhatsApp() {
    const message = `INKCONVENTION India Tour 2026 — ${event.city}, ${event.date}. ${event.time}. ${event.confirmed ? event.venue : "Venue proposed; pending confirmation"}. ${eventUrl()}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setShareOpen(false);
  }

  async function shareInstagram() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `INKCONVENTION — ${event.city}`,
          text: `India Tour 2026 · ${event.date}`,
          url: eventUrl(),
        });
      } else {
        await copyLink();
        window.open(
          "https://www.instagram.com/",
          "_blank",
          "noopener,noreferrer",
        );
      }
      setShareOpen(false);
    } catch (error) {
      if (error?.name !== "AbortError")
        notify("Sharing is unavailable. Use Copy Link.");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(eventUrl());
      notify("Event link copied");
    } catch {
      notify("Could not copy. Please copy the page URL.");
    }
    setShareOpen(false);
  }

  return (
    <main className="tour26" ref={pageRef}>
      {/* ==================== HERO ==================== */}
      <section className="tour26-hero" aria-label="India Tour 2026">
        <div className="tour26-heroPhotos" aria-hidden="true">
          {EVENTS.map((city, index) => (
            <CityPhoto
              key={city.id}
              event={city}
              eager={index === 4}
              className={`tour26-heroPhoto ${selected === index ? "is-active" : ""}`}
            />
          ))}
        </div>
        <div className="tour26-heroWash" />
        <div className="tour26-container tour26-heroInner">
          <div className="tour26-heroCopy tour26-reveal">
            <p className="tour26-overline">
              INDIA TOUR <span>2026</span>
            </p>
            <h1>
              <span>5 CITIES.</span>
              <em>ONE PASSION.</em>
            </h1>
            <h2>TATTOO. ART. CULTURE. MUSIC.</h2>
            <p className="tour26-heroDescription">
              Five iconic cities. A growing tattoo-art community. Meet artists,
              discover creative work and experience the culture behind the ink.
            </p>
            <div className="tour26-heroButtons">
              <Link className="tour26-btn tour26-btnDark" to="/entry">
                GET ENTRY PASS <ArrowUpRight size={18} />
              </Link>
              <a className="tour26-textBtn" href="#tour26-cities">
                EXPLORE CITIES <ArrowRight size={17} />
              </a>
            </div>
          </div>

          <div className="tour26-nextStop tour26-reveal" aria-live="polite">
            <span className="tour26-nextStopLabel">
              NEXT STOP {event.stop} / 05
            </span>
            <h2 key={event.id}>{event.city}</h2>
            <p>
              <CalendarDays size={18} /> {event.date}
            </p>
            <p>
              <Clock3 size={18} /> {event.time}
            </p>
            <p>
              <MapPin size={18} />
              <span>
                <strong>{event.venue}</strong>
                <small>{event.address}</small>
                {!event.confirmed && (
                  <small className="tour26-notFinal">
                    Proposed venue · not confirmed
                  </small>
                )}
              </span>
            </p>
            <Link to="/entry" className="tour26-nextCta">
              <span className="tour26-nextCircle">
                <ArrowUpRight size={20} />
              </span>
              GET ENTRY PASS
            </Link>
          </div>
        </div>
        <div className="tour26-heroBottom">
          <span>REAL ART / REAL ARTISTS / ONE COMMUNITY</span>
          <span>01 — 05 / 2026</span>
        </div>
      </section>

      {/* ==================== FIVE CITY CARDS ==================== */}
      <section
        id="tour26-cities"
        className="tour26-section tour26-citiesSection"
      >
        <div className="tour26-container">
          <div className="tour26-sectionHeader tour26-scrollReveal">
            <div>
              <p className="tour26-overline">THE 2026 INDIA TOUR</p>
              <h2>
                FIVE CITIES. <span>FIVE EXPERIENCES.</span>
              </h2>
            </div>
            <p>
              FIVE STOPS.
              <br />
              ONE COMMUNITY.
              <br />A MOVEMENT FOR ART.
            </p>
          </div>
          <div
            className="tour26-cityTrack"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
            }}
          >
            {EVENTS.map((city, index) => (
              <button
                type="button"
                key={city.id}
                className={`tour26-cityCard ${selected === index ? "is-active" : ""}`}
                onClick={() => chooseCity(index)}
                aria-label={`View ${city.city} event, ${city.date}`}
                aria-pressed={selected === index}
              >
                <CityPhoto event={city} className="tour26-cityImg" />
                <span className="tour26-cityShade" />
                <span className="tour26-cityTop">{city.stop} / 05</span>
                <span className="tour26-cityCopy">
                  <small>{city.landmark}</small>
                  <strong>{city.city}</strong>
                  <span>{city.date}</span>
                </span>
                <span className="tour26-cityArrow">
                  <ArrowUpRight size={16} />
                </span>
              </button>
            ))}
          </div>
          <div className="tour26-cityTools">
            <div
              className="tour26-pagination"
              aria-label="City slideshow position"
            >
              {EVENTS.map((city, index) => (
                <button
                  type="button"
                  key={city.id}
                  aria-label={`Select ${city.city}`}
                  aria-current={index === selected ? "true" : undefined}
                  className={index === selected ? "is-active" : ""}
                  onClick={() => chooseCity(index)}
                />
              ))}
            </div>
            <div className="tour26-cityNav">
              <button
                type="button"
                aria-label="Previous city"
                onClick={() => chooseCity(selected - 1)}
              >
                <ArrowLeft size={19} />
              </button>
              <span>{event.stop} / 05</span>
              <button
                type="button"
                aria-label="Next city"
                onClick={() => chooseCity(selected + 1)}
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
          <div className="tour26-cityVenue tour26-scrollReveal">
            <div>
              <span>SELECTED DESTINATION</span>
              <strong>{event.city}</strong>
              <small>
                {event.date} · {event.time}
              </small>
            </div>
            <p>
              {event.venue} — {event.address}
              {!event.confirmed && (
                <em> • Proposed location; final venue pending confirmation.</em>
              )}
            </p>
            <div className="tour26-cityVenueActions">
              <button type="button" onClick={() => setShareOpen((v) => !v)}>
                <Share2 size={16} /> SHARE
              </button>
              <Link to="/stall-booking">
                STALL ENQUIRIES <ArrowUpRight size={17} />
              </Link>
              <Link to="/entry">
                VIEW PASSES <ArrowUpRight size={17} />
              </Link>
            </div>
            {shareOpen && (
              <div className="tour26-sharePanel">
                <button type="button" onClick={shareWhatsApp}>
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button type="button" onClick={copyLink}>
                  <Copy size={16} /> Copy Link
                </button>
                <button type="button" onClick={shareInstagram}>
                  <InstagramIcon /> Instagram
                </button>
              </div>
            )}
            {toast && (
              <span className="tour26-toast" role="status">
                {toast}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ==================== COMMUNITY ==================== */}
      <section className="tour26-section tour26-experience">
        <div className="tour26-container">
          <div className="tour26-sectionHeader tour26-scrollReveal">
            <div>
              <p className="tour26-overline">MORE THAN AN EVENT</p>
              <h2>
                BUILT FOR THE PEOPLE
                <br />
                <span>BEHIND THE INK.</span>
              </h2>
            </div>
            <p>
              Authentic tattoo art, competitions, creative experiences, and the
              artists who bring them to life.
            </p>
          </div>
          <div className="tour26-highlights tour26-scrollReveal">
            {HIGHLIGHTS.map(({ Icon, title, detail }, index) => (
              <article className="tour26-highlight" key={title}>
                <Icon size={28} strokeWidth={1.5} />
                <span className="tour26-highlightNumber">0{index + 1}</span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </article>
            ))}
          </div>
          <Link to="/artists" className="tour26-artistsLink">
            EXPLORE ARTISTS <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* ==================== ENTRY PASSES ==================== */}
      <section className="tour26-section tour26-passes" id="tour26-passes">
        <div className="tour26-container">
          <div className="tour26-sectionHeader tour26-scrollReveal">
            <div>
              <p className="tour26-overline">GET ENTRY PASS</p>
              <h2>
                CHOOSE YOUR <span>PASS.</span>
              </h2>
            </div>
            <p>
              SAME COMMUNITY.
              <br />
              TWO TICKET CATEGORIES.
            </p>
          </div>
          <div className="tour26-passGrid tour26-scrollReveal">
            <article className="tour26-pass tour26-passNormal">
              <div className="tour26-passHead">
                <p>NORMAL PASS</p>
                <span>01 / STANDARD</span>
              </div>
              <h3>{money(999)}</h3>
              <p className="tour26-passCaption">
                Per person · each additional person {money(999)}
              </p>
              <div className="tour26-passTicket" aria-hidden="true">
                <span>INKCONVENTION</span>
                <b>NORMAL</b>
              </div>
              <ul>
                {NORMAL_FEATURES.map((item) => (
                  <li key={item}>
                    <Check size={16} /> {item}
                  </li>
                ))}
              </ul>
              <Link className="tour26-passButton" to="/entry">
                CHOOSE NORMAL PASS <ArrowRight size={19} />
              </Link>
            </article>
            <article className="tour26-pass tour26-passVip">
              <div className="tour26-passHead">
                <p>
                  VIP PASS <Crown size={20} />
                </p>
                <span>02 / PREMIUM</span>
              </div>
              <h3>{money(2999)}</h3>
              <p className="tour26-passCaption">
                Per person · each additional person {money(2999)}
              </p>
              <div className="tour26-passTicket" aria-hidden="true">
                <span>INKCONVENTION</span>
                <b>VIP</b>
              </div>
              <ul>
                {VIP_FEATURES.map((item) => (
                  <li key={item}>
                    <Check size={16} /> {item}
                  </li>
                ))}
              </ul>
              <Link className="tour26-passButton" to="/entry">
                CHOOSE VIP PASS <ArrowRight size={19} />
              </Link>
            </article>
          </div>
          <p className="tour26-passNotice">
            Prices shown are booking-request estimates. No payment is taken on
            this page. Venues marked as proposed are not confirmed. Passes are
            requests until confirmed.
          </p>
        </div>
      </section>

      {/* ==================== CLOSING CTA ==================== */}
      <section className="tour26-final">
        <div className="tour26-container tour26-finalInner tour26-scrollReveal">
          <div>
            <p className="tour26-overline">BE PART OF SOMETHING BIG</p>
            <h2>
              MORE THAN INK.
              <br />
              <span>MORE THAN A MOMENT.</span>
            </h2>
          </div>
          <div>
            <p>
              Five cities. One growing community. Join the movement and become
              part of the culture.
            </p>
            <Link to="/Enter" className="tour26-btn tour26-btnDark">
              JOIN DIRECTORY FREE <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <div className="tour26-credits">
        <div className="tour26-container">
          City photography:
          {EVENTS.map((city) => (
            <span key={city.id}>
              {" · "}
              <a
                href={city.photoSource}
                target="_blank"
                rel="noopener noreferrer"
              >
                {city.city.toLowerCase()} — {city.photoCredit}
              </a>
            </span>
          ))}
          . Images show landmarks, not Ink Convention events.
        </div>
      </div>
    </main>
  );
}
