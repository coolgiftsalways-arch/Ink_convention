import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Gift,
  Minus,
  Plus,
  Ticket,
  Trophy,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

// INKCONVENTION — Public GET ENTRY (no artist claim / no OTP).
const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

// Uses the four PNG files already in frontend/src/assets/Gust/.
const guestFiles = import.meta.glob(
  "../assets/Gust/*.{png,jpg,jpeg,webp,avif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);
const guestImage = (prefix) =>
  Object.entries(guestFiles).find(([path]) =>
    path.split("/").pop().toLowerCase().startsWith(prefix.toLowerCase()),
  )?.[1] || "";

const GUESTS = [
  {
    name: "Divinya Chauhan",
    role: "JUDGE",
    subtitle: "Tattoo artist • Judge panel",
    detail: "Evaluating artistry, creativity and technique.",
    photo: guestImage("Divinya"),
    color: "#ff736d",
  },
  {
    name: "Ganesh Gupta",
    role: "JUDGE",
    subtitle: "Tattoo artist • Judge panel",
    detail: "Bringing an artist’s eye to the competition.",
    photo: guestImage("Ganesh"),
    color: "#48cfc6",
  },
  {
    name: "Rapha Lopes",
    role: "CHIEF GUEST",
    subtitle: "International guest tattoo artist",
    detail: "Joining the tour as a special guest.",
    photo: guestImage("Rapha"),
    color: "#f5c56f",
  },
  {
    name: "Satvik Subramaniam",
    role: "EMCEE",
    subtitle: "Host • Emcee • Stage presenter",
    detail: "Guiding introductions and event moments.",
    photo: guestImage("Satvik"),
    color: "#48cfc6",
  },
];

const CITIES = [
  {
    id: "jaipur",
    name: "Jaipur",
    range: "30 Oct – 1 Nov 2026",
    color: "#ff736d",
    venue: "Jaipur Exhibition & Convention Centre (JECC)",
    address: "Sitapura, Tonk Road, Jaipur",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/Jaipur-Hawa_Mahal-Panoramic_view-20131017.jpg",
    dates: [
      { value: "2026-10-30", label: "30 Oct", day: "Friday" },
      { value: "2026-10-31", label: "31 Oct", day: "Saturday" },
      { value: "2026-11-01", label: "1 Nov", day: "Sunday" },
    ],
  },
  {
    id: "udaipur",
    name: "Udaipur",
    range: "13–15 Nov 2026",
    color: "#48cfc6",
    venue: "Hotel Inder Residency",
    address: "Goverdhan Vilas, Ekling Nagar, Udaipur",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d3/City_Palace_Udaipur.jpg",
    dates: [
      { value: "2026-11-13", label: "13 Nov", day: "Friday" },
      { value: "2026-11-14", label: "14 Nov", day: "Saturday" },
      { value: "2026-11-15", label: "15 Nov", day: "Sunday" },
    ],
  },
  {
    id: "kota",
    name: "Kota",
    range: "20–22 Nov 2026",
    color: "#f5c56f",
    venue: "Umed Bhawan Palace",
    address: "Station Main Road, Kota",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/GARH_PALACE_kota_Rajasthan.jpg",
    dates: [
      { value: "2026-11-20", label: "20 Nov", day: "Friday" },
      { value: "2026-11-21", label: "21 Nov", day: "Saturday" },
      { value: "2026-11-22", label: "22 Nov", day: "Sunday" },
    ],
  },
];

const PASS_PRICES = { 1: 2999, 2: 4999, 3: 5999 };
const EXTRA_PERSON = 1499;
const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-white/15 bg-[#080a0e] px-4 text-sm text-white outline-none focus:border-fuchsia-400";

const MAIN_BENEFITS = [
  "Exhibition entry on selected day(s)",
  "Certificate of participation",
  "Complimentary lunch / buffet",
  "INKCONVENTION mini artist kit",
  "Meet sponsors and network with tattoo artists",
  "Witness competitions and their winners",
];
const EXTRA_BENEFITS = [
  "Exhibition entry on selected day(s)",
  "Complimentary lunch / buffet",
  "Meet sponsors and industry guests",
  "Connect with tattoo artists",
  "Watch competitions and winners",
];

// These panels only mount when opened in the popup.
function GuestPanel() {
  return (
    <div className="p-4 sm:p-7">
      <div className="rounded-2xl border border-teal-400/30 bg-teal-400/10 p-4 text-center">
        <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase text-teal-300">
          <Clock3 size={16} /> Guest Appearance Hours
        </p>
        <p className="mt-2 text-base font-black">
          11:00 AM – 7:30 PM • All 3 City Stops
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Individual guest appearance times have not been specified.
        </p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {GUESTS.map((guest) => (
          <article
            key={guest.name}
            className="relative rounded-2xl border bg-[#070a0f] p-4 pt-6"
            style={{ borderColor: guest.color }}
          >
            <div
              className="absolute left-3 right-3 top-2 h-1 rounded-full"
              style={{ backgroundColor: guest.color }}
            />
            <div className="flex items-center gap-3">
              {guest.photo ? (
                <img
                  src={guest.photo}
                  alt={`${guest.name} event illustration`}
                  loading="lazy"
                  className="h-24 w-24 shrink-0 rounded-xl border-[3px] object-cover sm:h-28 sm:w-28"
                  style={{ borderColor: guest.color }}
                />
              ) : (
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border text-center text-xs text-gray-400"
                  style={{ borderColor: guest.color }}
                >
                  Photo not found
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="text-xs font-black"
                  style={{ color: guest.color }}
                >
                  {guest.role}
                </p>
                <h3 className="mt-1 break-words text-base font-black uppercase sm:text-xl">
                  {guest.name}
                </h3>
                <div className="my-2 h-px bg-amber-300/40" />
                <p className="text-xs font-semibold text-amber-100">
                  {guest.subtitle}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-gray-400">
                  {guest.detail}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function BenefitsPanel() {
  const cards = [
    {
      title: "Main Ticket — First Attendee",
      price: "₹2,999",
      caption: "1-day starting price",
      items: MAIN_BENEFITS,
      color: "#f5c56f",
      first: true,
    },
    {
      title: "Additional Attendee",
      price: "₹1,499",
      caption: "each extra person, per city",
      items: EXTRA_BENEFITS,
      color: "#48cfc6",
      first: false,
    },
  ];
  return (
    <div className="p-4 sm:p-7">
      <p className="mb-5 text-center text-sm text-gray-400">
        Attendee access, complimentary lunch, competitions and networking.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border bg-[#070a0f] p-5"
            style={{ borderColor: card.color }}
          >
            <h3
              className="flex items-center gap-2 text-lg font-black uppercase"
              style={{ color: card.color }}
            >
              {card.first ? <Gift size={19} /> : <Users size={19} />}{" "}
              {card.title}
            </h3>
            <p className="mt-2 text-2xl font-black">
              {card.price}{" "}
              <span className="text-xs font-normal text-gray-400">
                {card.caption}
              </span>
            </p>
            <ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
              {card.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-200">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: card.color }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            {card.first ? (
              <div className="mt-5 rounded-xl border border-amber-300/25 bg-amber-400/10 p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase text-amber-300">
                  <Trophy size={17} /> Lucky Draw — Main Ticket Only
                </p>
                <p className="mt-2 text-xs leading-6 text-gray-300">
                  Two lucky winners get a chance to present the winners on stage
                  and be photographed with the judges / panel members.
                </p>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-teal-300/25 bg-teal-400/10 p-4 text-xs leading-6 text-gray-300">
                Certificate, mini artist kit and lucky-draw eligibility are
                exclusive to the first attendee.
              </p>
            )}
          </article>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-black/20 p-4 text-center">
        {[1, 2, 3].map((days) => (
          <div key={days} className="text-xs font-bold">
            {days}-Day Pass{" "}
            <span className="mt-1 block text-sm font-black text-fuchsia-300">
              {money(PASS_PRICES[days])}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">
        Attendee access only; stall bookings are separate. No payment is
        collected at this step.
      </p>
    </div>
  );
}

export default function Get() {
  const navigate = useNavigate();
  const [infoModal, setInfoModal] = useState(null); // null | 'guests' | 'benefits'; closed by default
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    state: "",
  });
  const [citySelections, setCitySelections] = useState({});
  const [expandedCity, setExpandedCity] = useState(null);
  const [people, setPeople] = useState(1);
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");

  // Prevent the background page scrolling when a popup is open; Escape also closes it.
  useEffect(() => {
    if (!infoModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setInfoModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [infoModal]);

  const bookings = useMemo(
    () =>
      CITIES.flatMap((city) => {
        const selection = citySelections[city.id];
        if (!selection || selection.dates.length !== selection.passDays)
          return [];
        const firstPersonPrice = PASS_PRICES[selection.passDays];
        const additionalAmount = (people - 1) * EXTRA_PERSON;
        return [
          {
            eventCity: city.id,
            city: city.name,
            passDays: selection.passDays,
            selectedDates: [...selection.dates].sort(),
            tickets: people,
            firstPersonPrice,
            additionalAmount,
            totalAmount: firstPersonPrice + additionalAmount,
          },
        ];
      }),
    [citySelections, people],
  );

  const incompleteCities = CITIES.filter((city) => {
    const selection = citySelections[city.id];
    return selection && selection.dates.length !== selection.passDays;
  });
  const total = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  function selectPass(city, days) {
    setCitySelections((old) => ({
      ...old,
      [city.id]: {
        passDays: days,
        dates: days === 3 ? city.dates.map((date) => date.value) : [],
      },
    }));
    setError("");
  }

  function toggleDate(cityId, dateValue) {
    const city = CITIES.find((item) => item.id === cityId);
    if (!city?.dates.some((date) => date.value === dateValue)) return;
    setCitySelections((old) => {
      const current = old[cityId];
      if (!current || current.passDays === 3) return old;
      const nextDates = current.dates.includes(dateValue)
        ? current.dates.filter((date) => date !== dateValue)
        : current.dates.length < current.passDays
          ? [...current.dates, dateValue]
          : current.dates;
      return { ...old, [cityId]: { ...current, dates: [...nextDates].sort() } };
    });
    setError("");
  }

  function removeCity(cityId) {
    setCitySelections((old) => {
      const next = { ...old };
      delete next[cityId];
      return next;
    });
    setExpandedCity(null);
    setError("");
  }

  function validate() {
    if (!form.fullName.trim()) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Enter a valid email address.";
    const digits = form.mobile.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15)
      return "Enter a valid mobile number.";
    if (!form.state.trim()) return "Please enter your state.";
    if (incompleteCities.length)
      return `Complete date selection for ${incompleteCities.map((city) => city.name).join(", ")}.`;
    if (!bookings.length)
      return "Select at least one city, pass and required dates.";
    return "";
  }

  function handleReview(event) {
    event.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitResponse() {
    if (submitting || submitted) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      setReviewing(false);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/get/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          state: form.state.trim(),
          tickets: people,
          bookings: bookings.map(({ eventCity, passDays, selectedDates }) => ({
            eventCity,
            passDays,
            selectedDates,
          })),
          source: "rajasthan-entry",
        }),
      });
      const text = await response.text();
      let result;
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid response from server.");
      }
      if (!response.ok)
        throw new Error(
          result.message || `Submission failed (HTTP ${response.status}).`,
        );
      if (result.success !== true || !result.request?._id)
        throw new Error("Server did not confirm that the request was saved.");
      setRequestId(String(result.request._id));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Unable to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07080c] px-4 py-28 text-white">
        <section className="w-full max-w-2xl rounded-3xl border border-emerald-400/35 bg-[#101017] p-6 text-center sm:p-10">
          <CheckCircle2 size={54} className="mx-auto text-emerald-400" />
          <p className="mt-5 text-xs font-black uppercase tracking-widest text-fuchsia-300">
            INKCONVENTION • RAJASTHAN TOUR 2026
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            YOUR RESPONSE HAS BEEN SUBMITTED!
          </h1>
          <p className="mt-4 text-sm text-gray-300">
            Thank you, {form.fullName}.
          </p>
          <div className="mt-6 rounded-2xl border border-fuchsia-400/35 bg-fuchsia-500/10 p-5">
            <Clock3 size={28} className="mx-auto text-fuchsia-300" />
            <h2 className="mt-3 text-xl font-black">
              WE WILL CONTACT YOU WITHIN 24 HOURS
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-300">
              Our INKCONVENTION team will contact you regarding your entry
              confirmation and next steps.
            </p>
          </div>
          <div className="mt-6 space-y-3 rounded-xl border border-white/10 p-4 text-left">
            {bookings.map((booking) => (
              <div
                key={booking.eventCity}
                className="border-b border-white/10 pb-3 text-sm"
              >
                <strong>
                  {booking.city} • {booking.passDays}-Day Pass
                </strong>
                <p className="mt-1 text-xs text-gray-400">
                  {booking.selectedDates.join(" • ")}
                </p>
                <p className="mt-1 text-xs text-fuchsia-300">
                  {money(booking.totalAmount)}
                </p>
              </div>
            ))}
            <p className="text-sm">People per city: {people}</p>
            <p className="font-black text-fuchsia-300">
              Estimated Total: {money(total)}
            </p>
            <p className="break-all text-xs text-gray-500">
              Request ID: {requestId}
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            No payment has been collected. This is an entry request, not a
            confirmed ticket.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-fuchsia-600 px-7 py-3 text-sm font-black"
          >
            BACK TO HOME
          </button>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#07080c] pb-20 text-white">
      <header className="border-b border-amber-400/20 bg-gradient-to-br from-[#201016] via-[#0b0a10] to-[#082124]">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-28 sm:px-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
            INKCONVENTION • RAJASTHAN TOUR 2026
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">
            GET <span className="text-fuchsia-400">ENTRY PASS</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Choose city, pass, dates and people. Want to know the guests or
            ticket benefits? Open the details below.
          </p>
        </div>
      </header>

      {/* Both information panels are CLOSED by default. Buttons open popups, NOT long page sections. */}
      <section className="mx-auto grid max-w-7xl gap-3 px-4 pt-5 sm:grid-cols-2 sm:px-8">
        <button
          type="button"
          onClick={() => setInfoModal("guests")}
          className="flex items-center justify-between gap-3 rounded-2xl border border-teal-400/35 bg-[#0c171a] px-4 py-4 text-left transition hover:border-teal-300"
        >
          <span className="flex items-center gap-3">
            <Users size={22} className="shrink-0 text-teal-300" />
            <span>
              <strong className="block text-sm">MEET OUR SPECIAL GUESTS</strong>
              <span className="mt-0.5 block text-xs text-gray-400">
                4 guests • Appearance hours
              </span>
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-teal-300">
            VIEW <ArrowRight size={15} />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setInfoModal("benefits")}
          className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/35 bg-[#1a140e] px-4 py-4 text-left transition hover:border-amber-300"
        >
          <span className="flex items-center gap-3">
            <Gift size={22} className="shrink-0 text-amber-300" />
            <span>
              <strong className="block text-sm">WHAT YOUR PASS INCLUDES</strong>
              <span className="mt-0.5 block text-xs text-gray-400">
                Lunch • Certificate • Lucky draw & more
              </span>
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
            VIEW <ArrowRight size={15} />
          </span>
        </button>
      </section>

      {/* Booking form appears right below the two buttons. */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {reviewing ? (
            <section className="rounded-3xl border border-fuchsia-400/30 bg-[#110e17] p-5 sm:p-8">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setReviewing(false);
                  setError("");
                }}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <ArrowLeft size={17} /> Edit Selection
              </button>
              <CheckCircle2 size={39} className="mt-7 text-fuchsia-400" />
              <h2 className="mt-4 text-2xl font-black uppercase sm:text-3xl">
                Review Your Response
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Review before submitting. No payment is taken now.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Name", form.fullName],
                  ["Mobile", form.mobile],
                  ["Email", form.email],
                  ["State", form.state],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 p-3"
                  >
                    <p className="text-[10px] uppercase text-gray-500">
                      {label}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {bookings.map((booking) => (
                  <article
                    key={booking.eventCity}
                    className="rounded-xl border border-white/10 p-4"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <strong>
                        {booking.city} • {booking.passDays}-Day Pass
                      </strong>
                      <strong className="text-fuchsia-300">
                        {money(booking.totalAmount)}
                      </strong>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Selected dates: {booking.selectedDates.join(" • ")}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {people} person(s) • First attendee{" "}
                      {money(booking.firstPersonPrice)}
                      {people > 1 ? ` + ${people - 1} × ₹1,499` : ""}
                    </p>
                  </article>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <strong>GRAND TOTAL</strong>
                <strong className="text-3xl text-fuchsia-300">
                  {money(total)}
                </strong>
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={submitResponse}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-4 text-sm font-black disabled:opacity-50"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT YOUR RESPONSE"}
                {!submitting && <ArrowRight size={18} />}
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                Our team will contact you within 24 hours.
              </p>
            </section>
          ) : (
            <form onSubmit={handleReview} className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-[#100e15] p-5 sm:p-7">
                <p className="text-xs font-black uppercase tracking-widest text-fuchsia-300">
                  Step 1
                </p>
                <h2 className="mt-2 text-2xl font-black">Your Details</h2>
                <p className="mt-2 text-sm text-gray-400">
                  No artist-card claim or OTP required.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    ["fullName", "Full Name", "text"],
                    ["email", "Email Address", "email"],
                    ["mobile", "Mobile Number", "tel"],
                    ["state", "State", "text"],
                  ].map(([name, label, type]) => (
                    <label
                      key={name}
                      className="block text-xs font-bold text-gray-200"
                    >
                      {label} *
                      <input
                        required
                        name={name}
                        type={type}
                        value={form[name]}
                        onChange={(event) => {
                          setForm((old) => ({
                            ...old,
                            [name]: event.target.value,
                          }));
                          setError("");
                        }}
                        className={inputClass}
                      />
                    </label>
                  ))}
                </div>
              </section>
              <section className="rounded-3xl border border-white/10 bg-[#100e15] p-5 sm:p-7">
                <p className="text-xs font-black uppercase tracking-widest text-fuchsia-300">
                  Step 2
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Choose City, Pass & Dates
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Choose any 1, 2 or all 3 cities. Each city has its own pass
                  and dates.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {CITIES.map((city) => {
                    const selection = citySelections[city.id];
                    const complete = Boolean(
                      selection &&
                      selection.dates.length === selection.passDays,
                    );
                    const active = expandedCity === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          setExpandedCity(city.id);
                          setError("");
                        }}
                        className={`overflow-hidden rounded-2xl border text-left transition ${active ? "border-fuchsia-400 bg-fuchsia-500/10" : complete ? "border-emerald-400/70" : "border-white/15"}`}
                      >
                        <div className="relative h-28 bg-gradient-to-br from-[#5d2631] via-[#0f2830] to-[#120d13]">
                          <img
                            src={city.image}
                            alt={`${city.name}, Rajasthan`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                          {complete && (
                            <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <strong style={{ color: city.color }}>
                            {city.name.toUpperCase()}
                          </strong>
                          <p className="mt-1 text-[11px] text-gray-400">
                            {city.range}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {expandedCity &&
                  (() => {
                    const city = CITIES.find(
                      (item) => item.id === expandedCity,
                    );
                    if (!city) return null;
                    const selection = citySelections[city.id];
                    const days = selection?.passDays || 0;
                    const dates = selection?.dates || [];
                    const complete = Boolean(days && dates.length === days);
                    return (
                      <div className="mt-5 rounded-2xl border border-fuchsia-500/25 bg-[#15101d] p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black text-fuchsia-300">
                              SELECT YOUR PASS
                            </p>
                            <h3 className="mt-1 text-xl font-black">
                              {city.name.toUpperCase()}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedCity(null)}
                            aria-label="Close city details"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="mt-4 rounded-xl border border-white/10 p-3 text-xs text-gray-300">
                          <p className="font-black text-amber-300">VENUE</p>
                          <p className="mt-1 text-sm font-bold">{city.venue}</p>
                          <p className="mt-1">{city.address}</p>
                          <p className="mt-2 flex items-center gap-1 text-teal-300">
                            <Clock3 size={13} /> Guest window: 11:00 AM – 7:30
                            PM
                          </p>
                        </div>
                        <div className="mt-5 grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => selectPass(city, count)}
                              className={`rounded-xl border px-2 py-3 text-center ${days === count ? "border-fuchsia-400 bg-fuchsia-400/20" : "border-white/15"}`}
                            >
                              <span className="block text-xs font-black">
                                {count}-DAY
                              </span>
                              <span className="mt-1 block text-sm font-black text-fuchsia-300">
                                {money(PASS_PRICES[count])}
                              </span>
                            </button>
                          ))}
                        </div>
                        {days > 0 && (
                          <>
                            <h4 className="mt-5 flex items-center gap-2 text-sm font-black">
                              <CalendarDays size={17} /> SELECT DATES (
                              {dates.length}/{days})
                            </h4>
                            <p className="mt-2 text-xs text-gray-400">
                              {days === 3
                                ? "All three dates included automatically."
                                : `Choose exactly ${days} date(s). To switch, unselect a chosen date first.`}
                            </p>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              {city.dates.map((date) => {
                                const chosen = dates.includes(date.value);
                                const disabled =
                                  days === 3 ||
                                  (!chosen && dates.length >= days);
                                return (
                                  <button
                                    key={date.value}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() =>
                                      toggleDate(city.id, date.value)
                                    }
                                    className={`rounded-xl border px-2 py-3 text-center disabled:cursor-not-allowed ${chosen ? "border-fuchsia-400 bg-fuchsia-400/20" : disabled ? "border-white/5 opacity-35" : "border-white/15"}`}
                                  >
                                    <span className="block text-[10px] text-gray-400">
                                      {date.day}
                                    </span>
                                    <strong className="mt-1 block text-xs sm:text-sm">
                                      {date.label}
                                    </strong>
                                    <span className="mt-1 block text-[10px] text-fuchsia-300">
                                      {chosen
                                        ? "✓ Selected"
                                        : disabled
                                          ? "Unavailable"
                                          : "Select"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                disabled={!complete}
                                onClick={() => setExpandedCity(null)}
                                className="rounded-xl bg-fuchsia-600 px-5 py-3 text-xs font-black disabled:opacity-40"
                              >
                                DONE • ADD ANOTHER CITY
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCity(city.id)}
                                className="rounded-xl border border-white/15 px-4 py-3 text-xs text-gray-300"
                              >
                                Remove City
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                {bookings.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {bookings.map((booking) => (
                      <button
                        key={booking.eventCity}
                        type="button"
                        onClick={() => setExpandedCity(booking.eventCity)}
                        className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-2 text-xs font-bold"
                      >
                        {booking.city} • {booking.passDays}-Day ✓
                      </button>
                    ))}
                  </div>
                )}
              </section>
              <section className="rounded-3xl border border-white/10 bg-[#100e15] p-5 sm:p-7">
                <p className="text-xs font-black uppercase tracking-widest text-fuchsia-300">
                  Step 3
                </p>
                <h2 className="mt-2 text-2xl font-black">How Many People?</h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  The first attendee gets main-pass benefits. Each additional
                  attendee costs {money(EXTRA_PERSON)} per selected city and
                  receives additional-attendee benefits, including complimentary
                  lunch.
                </p>
                <div className="mt-5 flex items-center gap-5">
                  <button
                    type="button"
                    disabled={people <= 1}
                    onClick={() => setPeople((value) => Math.max(1, value - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 disabled:opacity-30"
                  >
                    <Minus size={18} />
                  </button>
                  <strong className="text-3xl">{people}</strong>
                  <button
                    type="button"
                    disabled={people >= 10}
                    onClick={() =>
                      setPeople((value) => Math.min(10, value + 1))
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 disabled:opacity-30"
                  >
                    <Plus size={18} />
                  </button>
                  <span className="text-xs text-gray-400">People per city</span>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-teal-300">
                  <UtensilsCrossed size={15} /> Complimentary lunch / buffet
                  included for all attendees.
                </p>
              </section>
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-xl bg-fuchsia-600 px-5 py-4 font-black"
              >
                <span>REVIEW RESPONSE • {money(total)}</span>
                <ArrowRight size={19} />
              </button>
            </form>
          )}
        </div>
        <aside className="min-w-0">
          <div className="rounded-3xl border border-fuchsia-400/30 bg-[#160e1d] p-5 lg:sticky lg:top-24">
            <Ticket size={25} className="text-fuchsia-300" />
            <h2 className="mt-3 text-xl font-black">YOUR ENTRY SUMMARY</h2>
            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Cities selected</span>
              <strong className="text-white">{bookings.length}/3</strong>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>People per city</span>
              <strong className="text-white">{people}</strong>
            </div>
            {bookings.length ? (
              <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.eventCity}
                    className="border-b border-white/10 pb-4"
                  >
                    <div className="flex justify-between gap-2">
                      <strong>{booking.city}</strong>
                      <strong className="text-fuchsia-300">
                        {money(booking.totalAmount)}
                      </strong>
                    </div>
                    <p className="mt-1 text-xs text-fuchsia-300">
                      {booking.passDays}-Day Pass
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {booking.selectedDates.join(" • ")}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-500">
                      First attendee {money(booking.firstPersonPrice)}
                      {people > 1 ? ` + ${people - 1} × ₹1,499` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-xs text-gray-400">
                Choose a city, pass and dates to begin.
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-5">
              <strong>GRAND TOTAL</strong>
              <strong className="text-2xl text-fuchsia-300">
                {money(total)}
              </strong>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-teal-300">
              <UtensilsCrossed size={14} /> Lunch / buffet included
            </p>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              No payment now. Submit your response and our team will contact you
              within 24 hours.
            </p>
          </div>
        </aside>
      </div>

      {/* Popups render above the form and never push it down the page. */}
      {infoModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setInfoModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              infoModal === "guests" ? "Special guests" : "Pass benefits"
            }
            className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-amber-400/35 bg-[#08090f] shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#141017] px-4 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-black tracking-widest text-amber-300">
                  INKCONVENTION • RAJASTHAN TOUR 2026
                </p>
                <h2 className="mt-1 text-lg font-black uppercase sm:text-xl">
                  {infoModal === "guests"
                    ? "Meet Our Special Guests"
                    : "What Your Pass Includes"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                aria-label="Close details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10"
              >
                <X size={21} />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain">
              {infoModal === "guests" ? <GuestPanel /> : <BenefitsPanel />}
              <div className="px-4 pb-5 text-center">
                <button
                  type="button"
                  onClick={() => setInfoModal(null)}
                  className="rounded-xl bg-fuchsia-600 px-7 py-3 text-xs font-black hover:bg-fuchsia-500"
                >
                  CLOSE & CONTINUE BOOKING
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
