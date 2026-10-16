import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Crown,
  Clock3,
  Gift,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Ticket,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

/* ===============================================================
   INKCONVENTION — GET ENTRY PASS (ONE FILE ONLY)
   Replace: frontend/src/pages/Get.jsx
   Uses your existing Tailwind CSS. No new stylesheet/component.
   Five real city photographs from Wikimedia Commons (links / credits included).
   VIP has a gold and charcoal premium theme.

   A customer chooses ONE of five cities, then NORMAL or VIP,
   then attendees. On mobile the form opens as a separate step
   to avoid scrolling through long sections.

   IMPORTANT: Your backend must also support these five cities,
   passType and the two pricing rules. The frontend cannot
   enforce payment amounts or ensure passType is saved.
   =============================================================== */

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const EVENTS = [
  {
    id: "gorakhpur",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Ramgarh_Tal_Lake%2C_Gorakhpur%2C_8_Apr_2019.jpg/330px-Ramgarh_Tal_Lake%2C_Gorakhpur%2C_8_Apr_2019.jpg",
    imageAlt: "Ramgarh Tal Lake, Gorakhpur",
    photoAuthor: "Alexey Komarov",
    photoLicense: "CC BY-SA 4.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Ramgarh_Tal_Lake,_Gorakhpur,_8_Apr_2019.jpg",
    name: "GORAKHPUR",
    date: "Sunday, 22 November 2026",
    shortDate: "22 NOV",
    isoDate: "2026-11-22",
    venue: "COURTYARD BY MARRIOTT GORAKHPUR",
    address: "RAMGARH TAL, NAUKA VIHAR ROAD, GORAKHPUR, UP 273001",
    venueConfirmed: false,
  },
  {
    id: "noida",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Noida_Sector_7X_Skyline.jpg/500px-Noida_Sector_7X_Skyline.jpg",
    imageAlt: "Noida skyline",
    photoAuthor: "SeekeroftheCosmos",
    photoLicense: "CC0 1.0",
    photoLicenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Noida_Sector_7X_Skyline.jpg",
    name: "NOIDA",
    date: "Sunday, 29 November 2026",
    shortDate: "29 NOV",
    isoDate: "2026-11-29",
    venue: "RADISSON BLU MBD HOTEL, NOIDA",
    address: "L-2, SECTOR 18, NOIDA, UP 201301",
    venueConfirmed: false,
  },
  {
    id: "varanasi",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/View_of_the_ghats_at_Varanasi.jpg/330px-View_of_the_ghats_at_Varanasi.jpg",
    imageAlt: "Varanasi ghats on the Ganga",
    photoAuthor: "Vimalinarc",
    photoLicense: "CC BY 4.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:View_of_the_ghats_at_Varanasi.jpg",
    name: "VARANASI",
    date: "Sunday, 6 December 2026",
    shortDate: "06 DEC",
    isoDate: "2026-12-06",
    venue: "TAJ GANGES, VARANASI",
    address: "NADESAR GROUNDS, VARANASI, UP 221002",
    venueConfirmed: false,
  },
  {
    id: "agra",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Taj_Mahal%2C_Agra..JPG/330px-Taj_Mahal%2C_Agra..JPG",
    imageAlt: "Taj Mahal, Agra",
    photoAuthor: "Dr. Suchet Chaudhary",
    photoLicense: "CC BY-SA 3.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    photoSource: "https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra..JPG",
    name: "AGRA",
    date: "Sunday, 13 December 2026",
    shortDate: "13 DEC",
    isoDate: "2026-12-13",
    venue: "JAYPEE PALACE HOTEL & CONVENTION CENTRE",
    address: "FATEHABAD ROAD, AGRA, UP 282004",
    venueConfirmed: false,
  },
  {
    id: "lucknow",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Rumi_Darwaja_%28Rumi_Gate%29.jpg/1280px-Rumi_Darwaja_%28Rumi_Gate%29.jpg",
    imageAlt: "Rumi Darwaza, Lucknow",
    photoAuthor: "Aryanmathurphotography",
    photoLicense: "CC BY-SA 4.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Rumi_Darwaja_(Rumi_Gate).jpg",
    name: "LUCKNOW",
    date: "Sunday, 20 December 2026",
    shortDate: "20 DEC",
    isoDate: "2026-12-20",
    venue: "RADIANCE EXHIBITION CENTRE",
    address: "BHOOTNATH MARKET, LUCKNOW",
    venueConfirmed: true,
  },
];

const HOURS = "11:00 AM – 6:00 PM";
const PASSES = {
  normal: { name: "NORMAL", first: 999, extra: 999 },
  vip: { name: "VIP", first: 2999, extra: 2999 },
};
const money = (number) => `₹${number.toLocaleString("en-IN")}`;

/* ===============================================================
   EXPO 2026 — PASS ENTITLEMENTS
   Standard: 1 complimentary competition category.
   VIP: 3 complimentary entries across THREE DISTINCT categories total,
        not 1 standard category plus another 3.
   The VIP 20% benefit applies to products purchased at the expo.
   These are per-pass benefits, including additional VIP attendees.
   =============================================================== */
const PASS_BENEFITS = {
  normal: {
    subtitle: "The essential exhibition experience",
    highlights: [
      "1 FREE competition category",
      "Unlimited complimentary beverages",
      "Exhibition floor & main stage",
    ],
    competitionCount: 1,
    benefits: [
      {
        title: "Full exhibition floor access",
        detail:
          "Explore booths, tattoo artist workstations, brand showcases and equipment displays.",
      },
      {
        title: "1 free competition entry",
        detail:
          "Enter 1 official competition category of your choice with your pass.",
      },
      {
        title: "Complimentary beverages",
        detail:
          "Unlimited drinks from designated event refreshment stations throughout the day.",
      },
      {
        title: "Industry networking",
        detail:
          "Meet tattoo artists, sponsors, suppliers and other industry professionals on the main floor.",
      },
      {
        title: "Main stage access",
        detail:
          "Watch tattoo demonstrations, seminars and awards from general spectator areas.",
      },
      {
        title: "Standard entry",
        detail:
          "Access through standard exhibition registration and entry queues.",
      },
    ],
  },
  vip: {
    subtitle: "An elevated experience for industry insiders",
    highlights: [
      "3 FREE competition categories",
      "20% OFF any expo product purchase",
      "VIP lounge + unlimited food & drinks",
    ],
    competitionCount: 3,
    benefits: [
      {
        title: "Everything in the Standard Pass",
        detail:
          "Full exhibition access, stage viewing, industry networking and unlimited beverages.",
      },
      {
        title: "3 free competition entries",
        detail:
          "Enter THREE DIFFERENT official competition categories at no extra entry charge (3 total, not 3 plus 1).",
      },
      {
        title: "20% off all expo products",
        detail: "Get a 20% discount when purchasing any product at the expo.",
      },
      {
        title: "Exclusive VIP lounge",
        detail:
          "Access a dedicated, air-conditioned lounge with comfortable seating and private networking space.",
      },
      {
        title: "Premium vendor meets",
        detail:
          "Priority access to premium vendors and arranged one-to-one meets with participating brands and featured artists.",
      },
      {
        title: "All-inclusive food & beverages",
        detail:
          "Unlimited complimentary meals and hot/cold beverages at designated VIP hospitality areas.",
      },
      {
        title: "Express priority check-in",
        detail:
          "Skip general entry queues with dedicated VIP registration access.",
      },
      {
        title: "VIP welcome swag bag",
        detail:
          "Exclusive event merchandise, sponsor offers and a souvenir badge.",
      },
      {
        title: "Reserved front-row stage seating",
        detail:
          "Priority seating for live judging, competition finals and stage performances.",
      },
    ],
  },
};

const PASS_COMPARISON = [
  ["Exhibition floor", "Included", "Included"],
  ["Competition entries", "1 category", "3 different categories"],
  ["Unlimited beverages", "Included", "Included"],
  ["Industry networking", "Main floor", "Priority + private meets"],
  ["Meals / catering", "Not included", "Unlimited complimentary"],
  ["VIP lounge", "Not included", "Dedicated access"],
  ["Product discount", "—", "20% off products"],
  ["Entry queue", "Standard", "Express VIP lane"],
  ["Welcome kit", "Not included", "VIP swag bag"],
  ["Stage seating", "General spectator zones", "Reserved front-row"],
];

// The existing special guest photographs stay optional, as before.
const guestFiles = import.meta.glob(
  "../assets/Gust/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, query: "?url", import: "default" },
);
const guestImage = (prefix) =>
  Object.entries(guestFiles).find(([file]) =>
    file.split("/").pop().toLowerCase().startsWith(prefix.toLowerCase()),
  )?.[1] || "";
const GUESTS = [
  { name: "Divinya Chauhan", role: "JUDGE", photo: guestImage("Divinya") },
  { name: "Ganesh Gupta", role: "JUDGE", photo: guestImage("Ganesh") },
  { name: "Rapha Lopes", role: "CHIEF GUEST", photo: guestImage("Rapha") },
  { name: "Satvik Subramaniam", role: "EMCEE", photo: guestImage("Satvik") },
];

function InfoPopup({ kind, event, onClose }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={kind === "guests" ? "Special guests" : "Pass benefits"}
        className="flex max-h-[87dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white text-[#202124] shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#e4e1da] p-4 sm:p-6">
          <div>
            <p className="text-[10px] font-extrabold tracking-[.18em] text-[#777]">
              INKCONVENTION • TOUR 2026
            </p>
            <h2 className="mt-1 text-xl font-black uppercase">
              {kind === "guests" ? "Meet Our Special Guests" : "Pass Benefits"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full border border-[#dad7d2]"
          >
            <X size={20} />
          </button>
        </header>
        <div className="overflow-y-auto p-4 sm:p-6">
          {kind === "guests" ? (
            <>
              <p className="mb-4 rounded-xl bg-[#f3f1ed] p-3 text-xs leading-5 text-[#555]">
                This guest lineup came from the earlier Lucknow event listing.
                Appearances and timings for individual 2026 tour cities have not
                been confirmed here. Please check with the event team.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {GUESTS.map((guest) => (
                  <div
                    key={guest.name}
                    className="flex items-center gap-3 rounded-xl border border-[#e4e1da] p-3"
                  >
                    {guest.photo ? (
                      <img
                        src={guest.photo}
                        alt={guest.name}
                        className="size-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-[#efede8]">
                        <Users size={24} />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-[#777]">
                        {guest.role}
                      </p>
                      <p className="mt-1 text-sm font-extrabold">
                        {guest.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <p className="text-xs leading-5 text-[#666]">
                Full pass benefits for the selected city and date. Every
                attendee receives the benefits of their chosen ticket tier.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(PASSES).map(([key, pass]) => {
                  const vip = key === "vip";
                  const details = PASS_BENEFITS[key];
                  return (
                    <article
                      key={key}
                      className={`overflow-hidden rounded-2xl border ${
                        vip
                          ? "border-[#c89b55] bg-gradient-to-br from-[#332618] via-[#191715] to-[#0f0e0d] text-[#ffedd0] shadow-[0_18px_38px_rgba(81,56,20,.2)]"
                          : "border-[#d9d6d0] bg-[#faf9f6] text-[#252629]"
                      }`}
                    >
                      <div className="border-b border-current/10 p-4 sm:p-5">
                        <p
                          className={`flex items-center gap-2 text-xs font-black tracking-[.13em] ${vip ? "text-[#e9c67e]" : "text-[#737578]"}`}
                        >
                          {vip ? <Crown size={17} /> : <Ticket size={16} />}
                          {vip ? "VIP ACCESS PASS" : "STANDARD PASS"}
                        </p>
                        <p
                          className={`mt-2 text-3xl font-black ${vip ? "text-[#f9d58e]" : "text-[#181818]"}`}
                        >
                          {money(pass.first)}
                          <span className="ml-1 text-xs font-semibold opacity-75">
                            per person
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] opacity-80">
                          Additional attendee: {money(pass.extra)} each
                        </p>
                        <p className="mt-2 text-xs leading-5 opacity-90">
                          {details.subtitle}
                        </p>
                        <p
                          className={`mt-3 rounded-lg px-3 py-2 text-xs font-black ${vip ? "bg-[#d5a85c]/15 text-[#f7d48d]" : "bg-[#e8e5de] text-[#242629]"}`}
                        >
                          {vip
                            ? "3 FREE ENTRIES • 3 DIFFERENT CATEGORIES"
                            : "1 FREE COMPETITION ENTRY"}
                        </p>
                        {vip && (
                          <p className="mt-2 rounded-lg border border-[#d5a85c]/30 bg-[#d5a85c]/10 px-3 py-2 text-xs font-black text-[#ffdda0]">
                            20% OFF ANY PRODUCT PURCHASE AT THE EXPO
                          </p>
                        )}
                      </div>
                      <ul className="space-y-3 p-4 sm:p-5">
                        {details.benefits.map((benefit) => (
                          <li
                            key={benefit.title}
                            className="flex items-start gap-2.5"
                          >
                            <span
                              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${vip ? "bg-[#cfab6e]/20 text-[#f4ce89]" : "bg-[#e9e6e0] text-[#37393b]"}`}
                            >
                              <Check size={12} strokeWidth={3} />
                            </span>
                            <div className="min-w-0">
                              <strong className="block text-xs font-extrabold">
                                {benefit.title}
                              </strong>
                              <p className="mt-0.5 text-[11px] leading-5 opacity-75">
                                {benefit.detail}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>

              <section className="overflow-hidden rounded-xl border border-[#e1ddd4] bg-white">
                <h3 className="border-b border-[#e9e5dd] bg-[#f7f4ef] px-4 py-3 text-sm font-black">
                  QUICK PASS COMPARISON
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[#fbfaf8] text-[#505258]">
                        <th scope="col" className="px-3 py-3">
                          BENEFIT
                        </th>
                        <th scope="col" className="px-3 py-3">
                          STANDARD
                        </th>
                        <th scope="col" className="px-3 py-3 text-[#98703a]">
                          VIP
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {PASS_COMPARISON.map(
                        ([feature, normalValue, vipValue]) => (
                          <tr
                            key={feature}
                            className="border-t border-[#eeeae4]"
                          >
                            <th scope="row" className="px-3 py-3 font-semibold">
                              {feature}
                            </th>
                            <td className="px-3 py-3 text-[#666]">
                              {normalValue}
                            </td>
                            <td className="px-3 py-3 font-bold text-[#8a652d]">
                              {vipValue}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              <p className="rounded-xl bg-[#f5f2ec] p-3 text-[11px] leading-5 text-[#57595c]">
                Competition entries: Standard includes 1 category; VIP includes
                3 entries in 3 different categories (not 4 total). Offers and
                benefits apply to the selected event day. The 20% VIP product
                discount is for purchases made at the expo.
              </p>
              {event && (
                <p className="text-xs text-[#777]">
                  Selected city: {event.name} • {event.date} • {HOURS}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 border-t border-[#e4e1da] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#242528] px-4 py-3 text-xs font-black text-white"
          >
            CLOSE & CONTINUE
          </button>
        </div>
      </section>
    </div>
  );
}

const inputStyle =
  "mt-1.5 h-11 w-full rounded-xl border border-[#d4d0c9] bg-white px-3.5 text-sm text-[#24272b] outline-none focus:border-[#44484d] focus:ring-2 focus:ring-[#44484d]/10";

export default function Get() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("");
  const [passType, setPassType] = useState("");
  const [people, setPeople] = useState(1);
  const [step, setStep] = useState("choose"); // choose → details → review → success
  const [infoModal, setInfoModal] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    state: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");

  const event = EVENTS.find((item) => item.id === selectedCity);
  const pass = PASSES[passType];
  const total = pass ? pass.first + (people - 1) * pass.extra : 0;
  const attendees = useMemo(
    () => ({
      first: pass?.first || 0,
      extras: people - 1,
      extraEach: pass?.extra || 0,
    }),
    [pass, people],
  );

  const moveTo = (next) => {
    setError("");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startDetails = () => {
    if (!event) return setError("Please choose one city first.");
    if (!pass) return setError("Please choose NORMAL or VIP.");
    moveTo("details");
  };

  const validate = () => {
    if (!event || !pass) return "Choose a city and ticket type.";
    if (!form.fullName.trim()) return "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Enter a valid email address.";
    const digits = form.mobile.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15)
      return "Enter a valid mobile number.";
    if (!form.state.trim()) return "Enter your state.";
    return "";
  };

  const review = (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    moveTo("review");
  };

  const submit = async () => {
    if (submitting) return;
    const problem = validate();
    if (problem) return setError(problem);
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
          passType, // Backend must validate and save this field.
          bookings: [
            {
              eventCity: event.id,
              passDays: 1,
              selectedDates: [event.isoDate],
              passType, // Backend must validate and save this field.
              tickets: people,
            },
          ],
          source: "tour-entry",
        }),
      });
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid response from server.");
      }
      if (!response.ok)
        throw new Error(
          data.message || `Submission failed (${response.status}).`,
        );
      if (data.success !== true || !data.request?._id)
        throw new Error(
          "The server did not confirm that your request was saved.",
        );
      setRequestId(String(data.request._id));
      moveTo("success");
    } catch (err) {
      setError(err.message || "Unable to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // All booking screens are kept short on mobile.
  return (
    <main className="min-h-screen bg-[#f6f4f0] pb-24 pt-24 text-[#242629] sm:pt-28 lg:pb-16">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-6">
        {step === "success" ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-[#d9d6d0] bg-white p-6 text-center sm:p-10">
            <CheckCircle2 size={48} className="mx-auto text-[#53685c]" />
            <p className="mt-4 text-xs font-black tracking-widest text-[#666]">
              INKCONVENTION • 2026
            </p>
            <h1 className="mt-3 text-3xl font-black">RESPONSE SUBMITTED</h1>
            <p className="mt-3 text-sm text-[#555]">
              Thank you, {form.fullName}. Our team will contact you about the
              next steps.
            </p>
            <div className="mt-5 space-y-1 rounded-2xl bg-[#f4f2ee] p-4 text-left text-sm">
              <p className="font-extrabold">
                {event?.name} • {pass?.name}
              </p>
              <p>
                {event?.date} • {HOURS}
              </p>
              <p>
                {people} attendee(s) • Estimated total {money(total)}
              </p>
              <p className="text-xs font-semibold text-[#62543b]">
                {passType === "vip"
                  ? "3 free category entries per VIP pass (three different categories), 20% off products"
                  : "1 free competition category entry per Standard pass"}
              </p>
              <p className="break-all text-xs text-[#666]">
                Request ID: {requestId}
              </p>
            </div>
            <p className="mt-4 text-xs text-[#777]">
              No payment has been collected. This is a request, not a confirmed
              ticket.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 rounded-xl bg-[#222] px-6 py-3 font-black text-white"
            >
              BACK TO HOME
            </button>
          </section>
        ) : (
          <>
            <header className="mb-5 sm:mb-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#60636a]">
                INKCONVENTION • FIVE CITY TOUR 2026
              </p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
                  GET ENTRY PASS
                </h1>
                <span className="rounded-full border border-[#dedbd5] bg-white px-3 py-1 text-[10px] font-extrabold text-[#555]">
                  {step === "choose"
                    ? "01 / SELECT"
                    : step === "details"
                      ? "02 / DETAILS"
                      : "03 / REVIEW"}
                </span>
              </div>
              {step === "choose" && (
                <p className="mt-2 text-xs text-[#64666b] sm:text-sm">
                  Choose your city and pass. Standard includes 1 free
                  competition category; VIP includes 3 different categories plus
                  20% off products.
                </p>
              )}
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div className="min-w-0">
                {step === "choose" && (
                  <section className="space-y-4 rounded-2xl border border-[#e1ded8] bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-black sm:text-2xl">
                          01. Choose Your City
                        </h2>
                        <span className="text-[10px] font-bold text-[#777]">
                          5 CITIES • 1 DATE EACH
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#777] sm:hidden">
                        Swipe sideways to see all cities →
                      </p>
                      {/* City photographs and selections — horizontal swipe on phones */}
                      <div className="-mx-3 mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible sm:px-0">
                        {EVENTS.map((city, index) => {
                          const active = city.id === selectedCity;
                          return (
                            <button
                              key={city.id}
                              type="button"
                              aria-label={`Choose ${city.name}, ${city.date}`}
                              aria-pressed={active}
                              onClick={() => {
                                setSelectedCity(city.id);
                                setError("");
                              }}
                              className={`group relative w-[138px] shrink-0 snap-start overflow-hidden rounded-xl border text-left shadow-sm transition-all duration-300 sm:w-auto ${
                                active
                                  ? "border-[#171717] bg-[#181818] text-white shadow-[0_10px_24px_rgba(0,0,0,.15)] ring-2 ring-[#171717]"
                                  : "border-[#ddd8d1] bg-[#fbfaf8] text-[#222] hover:-translate-y-1 hover:border-[#777] hover:shadow-md"
                              }`}
                            >
                              <span className="relative block h-[78px] overflow-hidden bg-gradient-to-br from-[#ad9680] to-[#514437] sm:h-[102px]">
                                <img
                                  src={city.image}
                                  alt={city.imageAlt}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                                <span className="absolute left-2 top-2 rounded-md border border-white/30 bg-black/45 px-2 py-1 text-[9px] font-black tracking-[.08em] text-white backdrop-blur-sm">
                                  {String(index + 1).padStart(2, "0")} / 05
                                </span>
                                {active && (
                                  <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-[#171717]">
                                    <Check size={15} strokeWidth={3} />
                                  </span>
                                )}
                              </span>
                              <span className="block px-2.5 pb-3 pt-2.5 sm:px-3">
                                <strong className="block text-[12px] font-black tracking-tight sm:text-[13px]">
                                  {city.name}
                                </strong>
                                <span
                                  className={`mt-1 block text-[11px] font-extrabold ${active ? "text-[#e9cf93]" : "text-[#82715b]"}`}
                                >
                                  {city.shortDate} • 2026
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {event && (
                        <div className="mt-2 rounded-xl border border-[#e2dfd9] bg-[#f7f5f1] p-3">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              {event.date}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 size={14} />
                              {HOURS}
                            </span>
                          </div>
                          <p className="mt-2 flex gap-1.5 text-xs leading-5 text-[#444]">
                            <MapPin size={15} className="mt-0.5 shrink-0" />
                            <span>
                              <strong>
                                {event.venueConfirmed
                                  ? "VENUE: "
                                  : "PROPOSED VENUE: "}
                                {event.venue}
                              </strong>
                              <br />
                              {event.address}
                            </span>
                          </p>
                          {!event.venueConfirmed && (
                            <p className="mt-1 text-[10px] text-[#8a6951]">
                              Venue is a suggestion, not a confirmed booking.
                            </p>
                          )}
                          <a
                            href={event.photoSource}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-[9px] text-[#797979] underline underline-offset-2 hover:text-[#292929]"
                          >
                            City photo: {event.photoAuthor} / Wikimedia Commons
                            • cropped
                          </a>{" "}
                          <a
                            href={event.photoLicenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1 text-[9px] text-[#797979] underline underline-offset-2 hover:text-[#292929]"
                          >
                            {event.photoLicense}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#eae7e2] pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-black sm:text-2xl">
                          02. Choose Your Pass
                        </h2>
                        <button
                          type="button"
                          onClick={() => setInfoModal("benefits")}
                          className="shrink-0 text-[10px] font-black uppercase tracking-wide text-[#8e6a37] underline underline-offset-4 sm:text-xs"
                        >
                          Compare Benefits
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-4">
                        {Object.entries(PASSES).map(([key, item]) => {
                          const active = key === passType;
                          const isVip = key === "vip";
                          return (
                            <button
                              type="button"
                              key={key}
                              aria-pressed={active}
                              onClick={() => {
                                setPassType(key);
                                setError("");
                              }}
                              className={`relative min-h-[192px] overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 sm:min-h-[200px] sm:p-5 ${
                                isVip
                                  ? active
                                    ? "border-[#edce8d] bg-gradient-to-br from-[#3e3020] via-[#181614] to-[#34271b] text-[#fff0ce] shadow-[0_15px_35px_rgba(88,56,18,.28)] ring-2 ring-[#c6a05d]"
                                    : "border-[#a88651] bg-gradient-to-br from-[#33271d] via-[#171513] to-[#3e2a1b] text-[#fff0ce] shadow-[0_10px_25px_rgba(57,40,21,.20)] hover:-translate-y-1 hover:border-[#f0d08e]"
                                  : active
                                    ? "border-[#222] bg-[#222] text-white shadow-lg ring-2 ring-[#555]"
                                    : "border-[#d9d6d0] bg-[#faf9f7] text-[#222] hover:border-[#888]"
                              }`}
                            >
                              {isVip && (
                                <span className="pointer-events-none absolute -right-6 -top-7 size-28 rounded-full bg-[#e9c176]/[0.09] blur-sm" />
                              )}
                              {active && (
                                <span
                                  className={`absolute right-3 top-3 grid size-6 place-items-center rounded-full ${isVip ? "bg-[#e8c984] text-[#261c12]" : "bg-white text-[#222]"}`}
                                >
                                  <Check size={15} strokeWidth={3} />
                                </span>
                              )}
                              {isVip ? (
                                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#c9a568]/50 bg-[#e7bf7c]/10 px-2 py-1 text-[9px] font-black tracking-[.15em] text-[#f2d195] sm:mb-3">
                                  <Crown size={12} /> PREMIUM PASS
                                </span>
                              ) : (
                                <span
                                  className={`mb-2 block text-[9px] font-extrabold uppercase tracking-[.15em] sm:mb-3 ${active ? "text-white/65" : "text-[#888]"}`}
                                >
                                  STANDARD ENTRY
                                </span>
                              )}
                              <strong
                                className={`block text-xs font-black tracking-[.13em] sm:text-sm ${isVip ? "text-[#f7d995]" : ""}`}
                              >
                                {item.name}
                              </strong>
                              <span
                                className={`mt-1 block text-[25px] font-black leading-tight sm:text-3xl ${isVip ? "text-white" : ""}`}
                              >
                                {money(item.first)}
                              </span>
                              <span
                                className={`mt-1 block text-[10px] leading-[1.5] sm:text-xs ${isVip ? "text-[#e7cda3]" : active ? "text-white/75" : "text-[#707070]"}`}
                              >
                                Extra person {money(item.extra)} each
                              </span>
                              <span
                                className={`mt-3 block border-t pt-2.5 text-[10px] font-black leading-4 sm:text-xs ${
                                  isVip
                                    ? "border-[#d1a65d]/30 text-[#f6d695]"
                                    : active
                                      ? "border-white/20 text-white"
                                      : "border-[#ddd8d1] text-[#292929]"
                                }`}
                              >
                                {isVip
                                  ? "3 FREE CATEGORY ENTRIES"
                                  : "1 FREE CATEGORY ENTRY"}
                              </span>
                              <span
                                className={`mt-1 block text-[10px] leading-4 ${
                                  isVip
                                    ? "text-[#f7d79b]"
                                    : active
                                      ? "text-white/75"
                                      : "text-[#757575]"
                                }`}
                              >
                                {isVip
                                  ? "3 different categories • 20% off products"
                                  : "Unlimited beverages • Main stage access"}
                              </span>
                              {isVip && (
                                <span className="mt-2 inline-flex rounded-md bg-[#e2b56b]/15 px-2 py-1 text-[10px] font-black tracking-wide text-[#f9d797]">
                                  <Crown size={12} className="mr-1" /> VIP
                                  LOUNGE + FOOD INCLUDED
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eae7e2] pt-4">
                      <div>
                        <h2 className="text-base font-black sm:text-xl">
                          03. How Many People?
                        </h2>
                        <p className="mt-1 text-[11px] text-[#777]">
                          1 person included in the first pass price
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={people <= 1}
                          onClick={() => setPeople((n) => Math.max(1, n - 1))}
                          className="grid size-10 place-items-center rounded-xl border border-[#d4d0c9] disabled:opacity-30"
                          aria-label="Remove person"
                        >
                          <Minus size={17} />
                        </button>
                        <span className="w-6 text-center text-xl font-black">
                          {people}
                        </span>
                        <button
                          type="button"
                          disabled={people >= 10}
                          onClick={() => setPeople((n) => Math.min(10, n + 1))}
                          className="grid size-10 place-items-center rounded-xl border border-[#d4d0c9] disabled:opacity-30"
                          aria-label="Add person"
                        >
                          <Plus size={17} />
                        </button>
                      </div>
                    </div>

                    {pass && (
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f1efea] p-3 sm:p-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#777]">
                            Estimated Total
                          </p>
                          <p className="text-xs text-[#666]">
                            {money(attendees.first)}
                            {people > 1
                              ? ` + ${attendees.extras} × ${money(attendees.extraEach)}`
                              : ""}
                          </p>
                        </div>
                        <strong className="text-2xl font-black">
                          {money(total)}
                        </strong>
                      </div>
                    )}
                    {error && (
                      <p
                        role="alert"
                        className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700"
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={startDetails}
                      className="hidden w-full items-center justify-between rounded-xl bg-[#292b2e] p-4 text-sm font-black text-white sm:flex"
                    >
                      CONTINUE TO YOUR DETAILS <ArrowRight size={19} />
                    </button>
                  </section>
                )}

                {step === "details" && (
                  <form
                    onSubmit={review}
                    className="rounded-2xl border border-[#e1ded8] bg-white p-4 sm:rounded-3xl sm:p-7"
                  >
                    <button
                      type="button"
                      onClick={() => moveTo("choose")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#666]"
                    >
                      <ArrowLeft size={15} /> Change city or pass
                    </button>
                    <div className="mt-4 rounded-xl bg-[#f4f2ee] p-3 text-xs">
                      <p
                        className={`font-extrabold ${passType === "vip" ? "text-[#825b22]" : ""}`}
                      >
                        {event.name} • {pass.name} • {people}{" "}
                        {people === 1 ? "person" : "people"}
                      </p>
                      <p className="mt-1 text-[#666]">
                        {event.shortDate} 2026 • {HOURS} • {money(total)}
                      </p>
                    </div>
                    <h2 className="mt-5 text-xl font-black sm:text-2xl">
                      Your Details
                    </h2>
                    <p className="mt-1 text-xs text-[#777]">
                      Only four fields. No artist claim or OTP required.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ["fullName", "Full Name", "text", "name"],
                        ["email", "Email Address", "email", "email"],
                        ["mobile", "Mobile Number", "tel", "tel"],
                        ["state", "State", "text", "address-level1"],
                      ].map(([name, label, type, autoComplete]) => (
                        <label
                          key={name}
                          className="text-xs font-bold text-[#41454a]"
                        >
                          {label} *
                          <input
                            required
                            name={name}
                            type={type}
                            autoComplete={autoComplete}
                            value={form[name]}
                            onChange={(e) => {
                              setForm((old) => ({
                                ...old,
                                [name]: e.target.value,
                              }));
                              setError("");
                            }}
                            className={inputStyle}
                          />
                        </label>
                      ))}
                    </div>
                    {error && (
                      <p
                        role="alert"
                        className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700"
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#292b2e] p-4 text-sm font-black text-white"
                    >
                      REVIEW RESPONSE • {money(total)} <ArrowRight size={18} />
                    </button>
                  </form>
                )}

                {step === "review" && (
                  <section className="rounded-2xl border border-[#e1ded8] bg-white p-4 sm:rounded-3xl sm:p-7">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => moveTo("details")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#666]"
                    >
                      <ArrowLeft size={16} /> Edit details
                    </button>
                    <h2 className="mt-5 text-2xl font-black">
                      Review Your Response
                    </h2>
                    <div className="mt-4 space-y-3 rounded-xl bg-[#f7f5f1] p-4 text-sm">
                      <p>
                        <strong>City:</strong> {event.name} • {event.date}
                      </p>
                      <p>
                        <strong>Timing:</strong> {HOURS}
                      </p>
                      <p>
                        <strong>Venue:</strong> {event.venue}
                        {!event.venueConfirmed && " (proposed, not confirmed)"}
                      </p>
                      <p>
                        <strong>Pass:</strong> {pass.name}
                      </p>
                      <p
                        className={`text-xs font-semibold ${passType === "vip" ? "text-[#936b30]" : "text-[#555]"}`}
                      >
                        {passType === "vip"
                          ? "VIP: 3 free competition entries in 3 different categories, 20% off all expo product purchases, VIP lounge and food."
                          : "STANDARD: 1 free competition category entry, exhibition access and unlimited beverages."}
                      </p>
                      <p>
                        <strong>People:</strong> {people} ({money(pass.first)}
                        {people > 1
                          ? ` + ${people - 1} × ${money(pass.extra)}`
                          : ""}
                        )
                      </p>
                      <p>
                        <strong>Name:</strong> {form.fullName}
                      </p>
                      <p>
                        <strong>Mobile:</strong> {form.mobile}
                      </p>
                      <p className="break-all">
                        <strong>Email:</strong> {form.email}
                      </p>
                      <p>
                        <strong>State:</strong> {form.state}
                      </p>
                      <div className="flex items-center justify-between border-t border-[#dedbd6] pt-3">
                        <strong>ESTIMATED TOTAL</strong>
                        <strong className="text-2xl">{money(total)}</strong>
                      </div>
                    </div>
                    {error && (
                      <p
                        role="alert"
                        className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={submit}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#292b2e] p-4 text-sm font-black text-white disabled:opacity-50"
                    >
                      {submitting ? "SUBMITTING..." : "SUBMIT YOUR RESPONSE"}
                      {!submitting && <ArrowRight size={18} />}
                    </button>
                    <p className="mt-3 text-center text-xs text-[#777]">
                      No payment is collected now. The team will contact you
                      about confirmation.
                    </p>
                  </section>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInfoModal("guests")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#d7d4ce] bg-white px-2 py-3 text-[11px] font-extrabold sm:text-xs"
                  >
                    <Users size={16} /> SPECIAL GUESTS
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoModal("benefits")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#d7d4ce] bg-white px-2 py-3 text-[11px] font-extrabold sm:text-xs"
                  >
                    <Gift size={16} /> PASS BENEFITS
                  </button>
                </div>
              </div>

              {/* Desktop summary. Hidden on phones to reduce scroll. */}
              <aside className="hidden rounded-2xl border border-[#dedad4] bg-white p-5 lg:sticky lg:top-24 lg:block">
                <div className="flex items-center gap-2">
                  <Ticket size={20} />
                  <h2 className="text-lg font-black">YOUR ENTRY SUMMARY</h2>
                </div>
                <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#777]">
                  City
                </p>
                <p className="mt-1 text-sm font-extrabold">
                  {event ? event.name : "Choose a city"}
                </p>
                {event && (
                  <p className="mt-1 text-xs text-[#777]">
                    {event.date}
                    <br />
                    {HOURS}
                  </p>
                )}
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#777]">
                  Pass
                </p>
                <p
                  className={`mt-1 text-sm font-extrabold ${passType === "vip" ? "text-[#a67a3c]" : ""}`}
                >
                  {pass ? pass.name : "Choose a pass"}
                </p>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#777]">
                  Attendees
                </p>
                <p className="mt-1 text-sm font-extrabold">{people}</p>
                <div className="mt-5 flex justify-between border-t border-[#e0ddd7] pt-4">
                  <strong>EST. TOTAL</strong>
                  <strong className="text-xl">
                    {pass ? money(total) : "—"}
                  </strong>
                </div>
                <p className="mt-4 flex gap-2 text-xs text-[#555]">
                  <ShieldCheck size={16} className="shrink-0" /> No payment
                  collected on this form.
                </p>
              </aside>
            </div>

            {/* One compact, sticky mobile action replaces a long scrolling form. */}
            {step === "choose" && (
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ddd8d1] bg-[#f8f7f4]/95 px-3 py-3 backdrop-blur-md sm:hidden">
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                  <div className="min-w-[92px]">
                    <span className="block text-[10px] font-bold text-[#777]">
                      TOTAL PRICE
                    </span>
                    <strong className="text-lg font-black">
                      {pass ? money(total) : "—"}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={startDetails}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black ${passType === "vip" ? "bg-gradient-to-r from-[#715026] to-[#b5894b] text-white" : "bg-[#242629] text-white"}`}
                  >
                    CONTINUE <ArrowRight size={17} />
                  </button>
                </div>
                {error && (
                  <p
                    role="alert"
                    className="mt-1 text-center text-[11px] font-bold text-red-700"
                  >
                    {error}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {infoModal && (
        <InfoPopup
          kind={infoModal}
          event={event}
          onClose={() => setInfoModal(null)}
        />
      )}
    </main>
  );
}
