import React from "react";
import { Link, useLocation } from "react-router-dom";
import { TATTOO_CATEGORIES } from "../data/tattooCategories";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  Clock3,
  Ruler,
  IndianRupee,
  CheckCircle2,
  ImagePlus,
} from "lucide-react";

export default function BookArtist() {
  const location = useLocation();

  const selectedArtist = React.useMemo(
    () => ({
      id: String(location.state?.preferredArtistId || "").trim(),
      name: String(location.state?.preferredArtist || "").trim(),
      city: String(location.state?.city || "").trim(),
      state: String(location.state?.state || "").trim(),
      profileImage: String(location.state?.profileImage || "").trim(),
      plan: String(location.state?.plan || "").trim().toLowerCase(),
    }),
    [location.state],
  );

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    tattooStyle: "",
    tattooIdea: "",
    bodyPlacement: "",
    tattooSize: "",
    budget: "",
    referenceLink: "",
    additionalMessage: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [bookingId, setBookingId] = React.useState("");
  const [notificationSent, setNotificationSent] = React.useState(false);

  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedArtist.id) {
      setError(
        "No artist was selected. Please return to Artists and choose an artist.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (!form.name.trim()) {
        throw new Error("Please enter your name.");
      }

      if (!form.phone.trim()) {
        throw new Error("Please enter your phone number.");
      }

      if (!form.email.trim()) {
        throw new Error("Please enter your email address.");
      }

      if (!form.tattooStyle) {
        throw new Error("Please select a tattoo style.");
      }

      if (!form.tattooIdea.trim()) {
        throw new Error("Please tell the artist about your tattoo idea.");
      }

      const bookingResponse = await fetch(`${API_URL}/api/artist-bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          preferredArtist: selectedArtist.name,
          selectedArtistId: selectedArtist.id,
          city: selectedArtist.city || "",
          category: form.tattooStyle,
          preferredDate: form.date,
          preferredTime: form.time,
          tattooIdea: [
            form.tattooIdea.trim(),
            form.bodyPlacement.trim()
              ? `Body placement: ${form.bodyPlacement.trim()}`
              : "",
            form.tattooSize.trim()
              ? `Approx size: ${form.tattooSize.trim()}`
              : "",
            form.budget.trim() ? `Budget: ${form.budget.trim()}` : "",
            form.referenceLink.trim()
              ? `Reference: ${form.referenceLink.trim()}`
              : "",
            form.additionalMessage.trim()
              ? `Additional message: ${form.additionalMessage.trim()}`
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });

      const bookingData = await bookingResponse.json().catch(() => ({}));

      if (!bookingResponse.ok) {
        throw new Error(
          bookingData?.message || "Unable to create your booking request.",
        );
      }

      const createdBookingId =
        bookingData?.booking?._id ||
        bookingData?.booking?.id ||
        bookingData?._id ||
        bookingData?.id ||
        "";

      setBookingId(createdBookingId);
      setNotificationSent(true);
      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      console.error("Direct artist booking error:", submitError);

      setError(
        submitError?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookAnother = () => {
    setSubmitted(false);
    setBookingId("");
    setNotificationSent(false);
    setError("");

    setForm({
      name: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      tattooStyle: "",
      tattooIdea: "",
      bodyPlacement: "",
      tattooSize: "",
      budget: "",
      referenceLink: "",
      additionalMessage: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const artistPlanLabel = getPlanLabel(selectedArtist.plan);

  return (
    <main
      className="
        min-h-screen
        bg-[#08080a]
        text-white
        pt-32
        pb-20
        px-4
        sm:px-6
        lg:px-10
      "
    >
      <div className="max-w-[1180px] mx-auto">
        <Link
          to="/artists"
          className="
            inline-flex
            items-center
            gap-2
            text-[9px]
            font-black
            tracking-[0.15em]
            text-gray-500
            hover:text-purple-400
            transition
          "
        >
          <ArrowLeft size={14} />
          BACK TO ARTISTS
        </Link>

        <div className="mt-10 mb-10">
          <div className="flex items-center gap-2 text-purple-400 mb-4">
            <Sparkles size={14} />

            <span className="text-[9px] font-mono tracking-[0.18em]">
              DIRECT ARTIST BOOKING
            </span>
          </div>

          <h1
            className="
              text-4xl
              sm:text-6xl
              lg:text-7xl
              font-black
              uppercase
              tracking-[-0.05em]
              leading-[0.9]
            "
          >
            BOOK YOUR
            <br />
            <span className="text-purple-500">ARTIST.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm text-gray-500 leading-relaxed">
            You already selected an artist. Fill in your booking details and the
            request will be sent directly to that artist. We will not search for
            or suggest another artist.
          </p>
        </div>

        {!selectedArtist.id && (
          <div
            className="
              mb-8
              rounded-[24px]
              border
              border-yellow-500/25
              bg-yellow-500/[0.06]
              p-6
            "
          >
            <h2 className="text-lg font-black uppercase">No artist selected</h2>

            <p className="mt-2 text-sm text-gray-500">
              Please open the Artists page and click BOOK ARTIST on the artist you
              want.
            </p>

            <Link
              to="/artists"
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-purple-600
                hover:bg-purple-500
                px-5
                py-3
                text-[9px]
                font-black
                tracking-widest
                transition
              "
            >
              CHOOSE AN ARTIST
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {selectedArtist.id && (
          <SelectedArtistCard
            artist={selectedArtist}
            planLabel={artistPlanLabel}
          />
        )}

        {error && (
          <div
            className="
              mt-6
              mb-6
              border
              border-red-500/30
              bg-red-500/[0.07]
              rounded-xl
              px-5
              py-4
              text-sm
              text-red-300
            "
          >
            {error}
          </div>
        )}

        {submitted ? (
          <SuccessState
            artist={selectedArtist}
            bookingId={bookingId}
            notificationSent={notificationSent}
            onBookAnother={handleBookAnother}
          />
        ) : selectedArtist.id ? (
          <form
            onSubmit={handleSubmit}
            className="
              mt-8
              border
              border-white/10
              bg-[#0d0d11]
              rounded-[28px]
              p-5
              sm:p-8
              lg:p-10
            "
          >
            <div className="mb-8">
              <p
                className="
                  text-[9px]
                  font-mono
                  tracking-[0.16em]
                  text-purple-400
                "
              >
                YOUR DETAILS
              </p>

              <h2 className="mt-2 text-2xl sm:text-3xl font-black uppercase">
                Booking information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField icon={<User size={15} />} label="YOUR NAME *">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </FormField>

              <FormField icon={<Phone size={15} />} label="PHONE NUMBER *">
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </FormField>

              <FormField icon={<Mail size={15} />} label="EMAIL *">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </FormField>

              <FormField
                icon={<Sparkles size={15} />}
                label="TATTOO STYLE / CATEGORY *"
              >
                <select
                  name="tattooStyle"
                  value={form.tattooStyle}
                  onChange={handleChange}
                  required
                  className={`${inputClass} cursor-pointer [color-scheme:dark]`}
                >
                  <option value="" className="bg-[#0d0d11]">
                    Select tattoo style
                  </option>

                  {TATTOO_CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-[#0d0d11]"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                icon={<CalendarDays size={15} />}
                label="PREFERRED DATE"
              >
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </FormField>

              <FormField icon={<Clock3 size={15} />} label="PREFERRED TIME">
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </FormField>

              <FormField
                icon={<MapPin size={15} />}
                label="BODY PLACEMENT"
              >
                <input
                  type="text"
                  name="bodyPlacement"
                  value={form.bodyPlacement}
                  onChange={handleChange}
                  placeholder="Forearm, back, wrist..."
                  className={inputClass}
                />
              </FormField>

              <FormField icon={<Ruler size={15} />} label="APPROX TATTOO SIZE">
                <input
                  type="text"
                  name="tattooSize"
                  value={form.tattooSize}
                  onChange={handleChange}
                  placeholder="Example: 4 x 5 inches"
                  className={inputClass}
                />
              </FormField>

              <FormField icon={<IndianRupee size={15} />} label="BUDGET">
                <select
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer [color-scheme:dark]`}
                >
                  <option value="" className="bg-[#0d0d11]">
                    Select budget range
                  </option>
                  <option value="Under ₹2,000" className="bg-[#0d0d11]">
                    Under ₹2,000
                  </option>
                  <option value="₹2,000 - ₹5,000" className="bg-[#0d0d11]">
                    ₹2,000 - ₹5,000
                  </option>
                  <option value="₹5,000 - ₹10,000" className="bg-[#0d0d11]">
                    ₹5,000 - ₹10,000
                  </option>
                  <option value="₹10,000 - ₹25,000" className="bg-[#0d0d11]">
                    ₹10,000 - ₹25,000
                  </option>
                  <option value="₹25,000+" className="bg-[#0d0d11]">
                    ₹25,000+
                  </option>
                  <option value="Discuss with artist" className="bg-[#0d0d11]">
                    Discuss with artist
                  </option>
                </select>
              </FormField>

              <FormField
                icon={<ImagePlus size={15} />}
                label="REFERENCE IMAGE LINK"
              >
                <input
                  type="url"
                  name="referenceLink"
                  value={form.referenceLink}
                  onChange={handleChange}
                  placeholder="Google Drive / Instagram / image URL"
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="mt-5">
              <label
                className="
                  block
                  mb-2
                  text-[8px]
                  font-black
                  tracking-[0.15em]
                  text-gray-500
                "
              >
                TELL THE ARTIST ABOUT YOUR TATTOO *
              </label>

              <textarea
                name="tattooIdea"
                value={form.tattooIdea}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe the tattoo idea, design, colours, reference, changes you want, etc."
                className={textareaClass}
              />
            </div>

            <div className="mt-5">
              <label
                className="
                  block
                  mb-2
                  text-[8px]
                  font-black
                  tracking-[0.15em]
                  text-gray-500
                "
              >
                ADDITIONAL MESSAGE
              </label>

              <textarea
                name="additionalMessage"
                value={form.additionalMessage}
                onChange={handleChange}
                rows={4}
                placeholder="Anything else you want the artist to know..."
                className={textareaClass}
              />
            </div>

            <div
              className="
                mt-6
                rounded-xl
                border
                border-purple-500/20
                bg-purple-500/[0.05]
                px-4
                py-4
              "
            >
              <div className="flex items-start gap-3">
                <Sparkles
                  size={15}
                  className="mt-0.5 shrink-0 text-purple-400"
                />

                <div>
                  <p className="text-[8px] font-black tracking-widest text-purple-300">
                    DIRECT REQUEST
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    This request is for{" "}
                    <span className="font-bold text-white">
                      {selectedArtist.name}
                    </span>
                    . We will not match or suggest another artist.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  w-full
                  sm:w-auto
                  border
                  rounded-xl
                  px-8
                  py-4
                  text-[10px]
                  font-black
                  tracking-[0.14em]
                  transition-all
                  duration-300

                  ${
                    loading
                      ? `
                          cursor-not-allowed
                          border-purple-500/20
                          bg-purple-600/40
                          text-white/60
                        `
                      : `
                          bg-purple-600
                          hover:bg-purple-500
                          border-purple-400/40
                          text-white
                          shadow-[0_0_25px_rgba(168,85,247,0.22)]
                          hover:-translate-y-1
                        `
                  }
                `}
              >
                {loading ? (
                  <>
                    <span
                      className="
                        w-4
                        h-4
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                        animate-spin
                      "
                    />
                    SENDING REQUEST...
                  </>
                ) : (
                  <>
                    SEND BOOKING REQUEST
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </main>
  );
}

function SelectedArtistCard({ artist, planLabel }) {
  const isGold =
    artist.plan === "verified" ||
    artist.plan === "gold" ||
    artist.plan === "spotlight";

  const isSilver = artist.plan === "pro" || artist.plan === "silver";

  return (
    <section
      className={`
        rounded-[26px]
        border
        p-5
        sm:p-6

        ${
          isGold
            ? `
                border-[#f5c451]/40
                bg-gradient-to-br
                from-[#f5c451]/[0.10]
                via-[#151005]
                to-[#0d0d11]
              `
            : isSilver
              ? `
                  border-slate-200/20
                  bg-gradient-to-br
                  from-white/[0.06]
                  to-[#0d0d11]
                `
              : `
                  border-purple-500/20
                  bg-[#0d0d11]
                `
        }
      `}
    >
      <p className="text-[8px] font-mono tracking-[0.16em] text-gray-600">
        YOU ARE BOOKING
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div
          className={`
            w-16
            h-16
            shrink-0
            overflow-hidden
            rounded-full
            border-2
            bg-black
            flex
            items-center
            justify-center
            text-xl
            font-black

            ${
              isGold
                ? "border-[#f5c451] text-[#f5c451]"
                : isSilver
                  ? "border-slate-300 text-slate-200"
                  : "border-purple-500/30 text-purple-400"
            }
          `}
        >
          {artist.profileImage ? (
            <img
              src={artist.profileImage}
              alt={artist.name || "Tattoo Artist"}
              className="w-full h-full object-cover"
            />
          ) : (
            artist.name?.charAt(0)?.toUpperCase() || "A"
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-[7px]
                font-black

                ${
                  isGold
                    ? "bg-[#f5c451] text-black"
                    : isSilver
                      ? "bg-slate-200 text-black"
                      : "border border-purple-500/20 bg-purple-500/10 text-purple-400"
                }
              `}
            >
              {planLabel}
            </span>
          </div>

          <h2 className="mt-2 truncate text-xl sm:text-2xl font-black uppercase">
            {artist.name || "Tattoo Artist"}
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={12} />

            <span className="truncate">
              {[artist.city, artist.state].filter(Boolean).join(", ") || "India"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SuccessState({
  artist,
  bookingId,
  notificationSent,
  onBookAnother,
}) {
  return (
    <section
      className="
        mt-8
        rounded-[28px]
        border
        border-emerald-500/25
        bg-emerald-500/[0.05]
        p-7
        sm:p-10
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          border
          border-emerald-500/30
          bg-emerald-500/10
          text-emerald-400
        "
      >
        <CheckCircle2 size={28} />
      </div>

      <p className="mt-6 text-[8px] font-mono tracking-[0.16em] text-emerald-400">
        BOOKING REQUEST SENT
      </p>

      <h2 className="mt-3 text-2xl sm:text-4xl font-black uppercase">
        Request sent to{" "}
        <span className="text-purple-400">
          {artist.name || "the artist"}
        </span>
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500">
  Your booking request has been submitted successfully. A message has been
  sent to{" "}
  <span className="font-bold text-white">
    {artist.name || "the artist"}
  </span>
  .
</p>

      {bookingId && (
        <div
          className="
            mx-auto
            mt-6
            max-w-md
            rounded-xl
            border
            border-white/10
            bg-black/30
            px-4
            py-3
          "
        >
          <p className="text-[7px] font-mono tracking-widest text-gray-600">
            BOOKING ID
          </p>

          <p className="mt-1 break-all text-xs font-black text-white">
            {bookingId}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
        <button
          type="button"
          onClick={onBookAnother}
          className="
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            px-7
            py-4
            text-[9px]
            font-black
            tracking-[0.12em]
            hover:bg-white/10
            transition
          "
        >
          EDIT / SEND AGAIN
        </button>

        <Link
          to="/artists"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-purple-600
            hover:bg-purple-500
            px-7
            py-4
            text-[9px]
            font-black
            tracking-[0.12em]
            transition
          "
        >
          VIEW ARTISTS
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

function getPlanLabel(plan) {
  const value = String(plan || "").toLowerCase();

  if (
    value === "verified" ||
    value === "gold" ||
    value === "spotlight"
  ) {
    return "★ GOLD";
  }

  if (value === "pro" || value === "silver") {
    return "SILVER PRO";
  }

  return "FREE";
}

const inputClass = `
  w-full
  bg-black/30
  border
  border-white/10
  focus:border-purple-500
  rounded-xl
  px-4
  py-4
  text-sm
  text-white
  placeholder:text-gray-700
  outline-none
  transition
`;

const textareaClass = `
  w-full
  bg-black/30
  border
  border-white/10
  focus:border-purple-500
  rounded-xl
  px-4
  py-4
  text-sm
  text-white
  placeholder:text-gray-700
  outline-none
  resize-none
  transition
`;

function FormField({ icon, label, children }) {
  return (
    <div>
      <label
        className="
          flex
          items-center
          gap-2
          mb-2
          text-[8px]
          font-black
          tracking-[0.15em]
          text-gray-500
        "
      >
        <span className="text-purple-400">{icon}</span>
        {label}
      </label>

      {children}
    </div>
  );
}
