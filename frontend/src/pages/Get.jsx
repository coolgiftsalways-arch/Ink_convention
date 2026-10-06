import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Ticket,
  User,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

/* =========================================================
   SETTINGS
========================================================= */

const TICKET_PRICE = 1100;

const events = [
  {
    value: "jaipur",
    city: "Jaipur",
    date: "30 Oct – 01 Nov 2026",
  },

  {
    value: "udaipur",
    city: "Udaipur",
    date: "13 Nov – 15 Nov 2026",
  },

  {
    value: "kota",
    city: "Kota",
    date: "20 Nov – 22 Nov 2026",
  },
];

/* =========================================================
   GET ENTRY PAGE
========================================================= */

export default function Get() {
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);

  const [savedEntry, setSavedEntry] = useState(null);

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    state: "",
    eventCity: "",
    tickets: 1,
  });

  /* =======================================================
     TOTAL
  ======================================================= */

  const totalAmount = useMemo(() => {
    return Number(formData.tickets || 1) * TICKET_PRICE;
  }, [formData.tickets]);

  /* =======================================================
     SELECTED EVENT
  ======================================================= */

  const selectedEvent = useMemo(() => {
    return events.find((event) => event.value === formData.eventCity);
  }, [formData.eventCity]);

  /* =======================================================
     CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");

    setFormData((previous) => ({
      ...previous,

      [name]: name === "tickets" ? Number(value) : value,
    }));
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.mobile.trim()) {
      return "Please enter your mobile number.";
    }

    const phoneDigits = formData.mobile.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      return "Please enter a valid mobile number.";
    }

    if (!formData.state.trim()) {
      return "Please enter your state.";
    }

    if (!formData.eventCity) {
      return "Please select the Ink Convention event.";
    }

    if (!formData.tickets || formData.tickets < 1) {
      return "Please select at least 1 ticket.";
    }

    return "";
  };

  /* =======================================================
     SAFE RESPONSE READER
  ======================================================= */

  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      const response = await fetch(`${API_URL}/api/get`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          fullName: formData.fullName,

          email: formData.email,

          mobile: formData.mobile,

          state: formData.state,

          eventCity: formData.eventCity,

          tickets: formData.tickets,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message || `Request failed with HTTP ${response.status}.`,
        );
      }

      setSavedEntry(data?.entry || null);

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      console.error("GET ENTRY submit error:", submitError);

      setError(submitError.message || "Unable to submit your entry.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     SUCCESS
  ======================================================= */

  if (submitted) {
    const ticketCount = savedEntry?.tickets ?? formData.tickets;

    const total = savedEntry?.totalAmount ?? totalAmount;

    return (
      <main className="min-h-screen bg-[#050507] px-5 py-16 text-white">
        <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-fuchsia-500/30 bg-[#0b0b10] p-7 text-center shadow-[0_0_60px_rgba(168,85,247,0.12)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500/15 text-fuchsia-300">
              <CheckCircle2 size={32} />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-400">
              INKCONVENTION ENTRY
            </p>

            <h1 className="mt-3 text-3xl font-black uppercase sm:text-5xl">
              Entry Details Received
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400">
              Thank you,{" "}
              <span className="font-bold text-white">{formData.fullName}</span>.
              Your entry details for{" "}
              <span className="font-bold text-white">
                {selectedEvent?.city}
              </span>{" "}
              have been received successfully.
            </p>

            <div className="mx-auto mt-7 max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs text-gray-500">Tickets</span>

                <span className="font-black text-white">{ticketCount}</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 py-3">
                <span className="text-xs text-gray-500">Price per ticket</span>

                <span className="font-black text-white">
                  ₹{TICKET_PRICE.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-bold text-gray-300">Total</span>

                <span className="text-xl font-black text-fuchsia-300">
                  ₹{Number(total).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/[0.06] px-5 py-4">
              <p className="text-sm font-semibold leading-6 text-gray-300">
                Our team will contact you within{" "}
                <span className="font-black text-fuchsia-300">24 hours</span>{" "}
                regarding your entry confirmation and payment process.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-6 py-3 text-xs font-black uppercase tracking-wider transition hover:bg-fuchsia-500"
            >
              Back to Home
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     FORM
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="relative overflow-hidden border-b border-white/5 bg-[#08080c]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-400">
                VISITOR ACCESS
              </p>

              <h1 className="mt-3 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
                GET <span className="text-fuchsia-500">ENTRY</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                Be part of Ink Convention. Fill in your details, choose your
                event city and select how many tickets you need.
              </p>
            </div>

            <div className="rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/[0.06] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                  <Ticket size={21} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-fuchsia-400">
                    ENTRY TICKET
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    ₹{TICKET_PRICE.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-6 text-gray-400">
                Price is ₹1,100 per person. Your total automatically updates
                based on the number of tickets selected.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-10 lg:py-16">
        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] border border-white/10 bg-[#0b0b10] p-5 shadow-2xl sm:p-7 lg:p-8"
        >
          <div className="border-b border-white/10 pb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-fuchsia-400">
              PERSONAL DETAILS
            </p>

            <h2 className="mt-2 text-2xl font-black uppercase">
              Tell us about yourself
            </h2>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              icon={<User size={16} />}
            />

            <Field
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
            />

            <Field
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              icon={<Phone size={16} />}
            />

            <Field
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter your state"
              icon={<MapPin size={16} />}
            />
          </div>

          <div className="mt-8 border-t border-white/10 pt-7">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-fuchsia-400">
              ENTRY DETAILS
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-gray-300">
                  Select Event City *
                </span>

                <select
                  name="eventCity"
                  value={formData.eventCity}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#08080c] px-4 text-sm text-white outline-none transition focus:border-fuchsia-500"
                >
                  <option value="">Choose event</option>

                  {events.map((event) => (
                    <option key={event.value} value={event.value}>
                      {event.city} — {event.date}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-gray-300">
                  Number of Tickets *
                </span>

                <select
                  name="tickets"
                  value={formData.tickets}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#08080c] px-4 text-sm text-white outline-none transition focus:border-fuchsia-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? "Ticket" : "Tickets"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/[0.06] p-5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                ₹{TICKET_PRICE.toLocaleString("en-IN")} × {formData.tickets}
              </span>

              <span>{formData.tickets} ticket(s)</span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm font-black uppercase tracking-wider">
                Total
              </span>

              <span className="text-3xl font-black text-fuchsia-300">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-between rounded-xl bg-fuchsia-600 px-5 py-4 text-sm font-black uppercase tracking-wider transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{submitting ? "Submitting..." : "Continue Entry"}</span>

            <ArrowRight size={18} />
          </button>
        </form>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b10]">
            <div className="border-b border-white/10 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-fuchsia-400">
                RAJASTHAN TOUR 2026
              </p>

              <h3 className="mt-2 text-xl font-black uppercase">
                Choose your city
              </h3>
            </div>

            <div className="divide-y divide-white/10">
              {events.map((event) => (
                <button
                  key={event.value}
                  type="button"
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,

                      eventCity: event.value,
                    }))
                  }
                  className={`flex w-full items-center justify-between gap-4 p-5 text-left transition ${
                    formData.eventCity === event.value
                      ? "bg-fuchsia-500/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-black uppercase text-white">
                      {event.city}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      {event.date}
                    </p>
                  </div>

                  <ArrowRight
                    size={16}
                    className={
                      formData.eventCity === event.value
                        ? "text-fuchsia-300"
                        : "text-gray-600"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-purple-500/[0.04] p-6">
            <Ticket size={27} className="text-fuchsia-300" />

            <h3 className="mt-5 text-xl font-black uppercase">
              One ticket.
              <br />
              One experience.
            </h3>

            <p className="mt-3 text-xs leading-6 text-gray-400">
              Meet tattoo artists, experience live art and be part of the Ink
              Convention community.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-gray-300">
        {label} *
      </span>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-white/10 bg-[#08080c] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-fuchsia-500"
        />
      </div>
    </label>
  );
}
