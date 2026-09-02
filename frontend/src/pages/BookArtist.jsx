import React from "react";
import { Link } from "react-router-dom";
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
  Star,
  Search,
} from "lucide-react";

export default function BookArtist() {
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    category: "",
    artist: "",
    date: "",
    tattooIdea: "",
  });

  const [submitted, setSubmitted] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [error, setError] = React.useState("");

  const [suggestedArtists, setSuggestedArtists] = React.useState([]);

  const [bookingId, setBookingId] = React.useState("");

  const [bookingArtistId, setBookingArtistId] = React.useState("");

  const [bookingMessage, setBookingMessage] = React.useState("");

  const [selectedBookingArtist, setSelectedBookingArtist] =
    React.useState(null);

  /* =========================================================
     API URL
  ========================================================= */

  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  /* =========================================================
     FORM CHANGE
  ========================================================= */

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

  /* =========================================================
     SUBMIT BOOKING
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    setError("");

    setSuggestedArtists([]);

    setBookingId("");

    setBookingArtistId("");

    setBookingMessage("");

    try {
      /* =====================================================
         VALIDATION
      ===================================================== */

      if (!form.name.trim()) {
        throw new Error("Please enter your name.");
      }

      if (!form.phone.trim()) {
        throw new Error("Please enter your phone number.");
      }

      if (!form.email.trim()) {
        throw new Error("Please enter your email address.");
      }

      if (!form.city.trim()) {
        throw new Error("Please enter your city.");
      }

      if (!form.category) {
        throw new Error("Please select a tattoo category.");
      }

      /* =====================================================
         SEND TO BACKEND

         Backend route:

         POST /api/artist-bookings
      ===================================================== */

      const response = await fetch(`${API_URL}/api/artist-bookings`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: form.name.trim(),

          phone: form.phone.trim(),

          email: form.email.trim(),

          city: form.city.trim(),

          category: form.category,

          preferredArtist: form.artist.trim(),

          preferredDate: form.date,

          tattooIdea: form.tattooIdea.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to submit booking request.");
      }

      /* =====================================================
         BACKEND RETURNS MATCHING ARTISTS
      ===================================================== */

      const recommendations = Array.isArray(data?.suggestedArtists)
        ? data.suggestedArtists
        : Array.isArray(data?.artists)
          ? data.artists
          : [];

      setSuggestedArtists(recommendations);

      setBookingId(data?.booking?._id || data?.booking?.id || "");

      setSubmitted(true);

      /* =====================================================
         SCROLL TO RESULT
      ===================================================== */

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    } catch (submitError) {
      console.error("Book artist error:", submitError);

      setError(
        submitError.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     BOOK SELECTED ARTIST
  ========================================================= */

  const handleBookArtist = async (artist) => {
    const artistId = artist?._id || artist?.id || "";

    if (!bookingId) {
      setError("Booking information is missing. Please start a new search.");
      return;
    }

    if (!artistId) {
      setError("Artist information is missing.");
      return;
    }

    if (bookingArtistId) {
      return;
    }

    try {
      setBookingArtistId(String(artistId));

      setBookingMessage("");

      setError("");

      const response = await fetch(
        `${API_URL}/api/artist-bookings/${bookingId}/select-artist`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            artistId,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to book this artist.");
      }

      setBookingMessage(
        `${artist?.name || "Artist"} has been selected. ${
          data?.notificationSent
            ? "The artist has been notified about your booking request."
            : "Your booking request has been saved."
        }`,
      );

      // Close the confirmation popup only after the request succeeds.
      setSelectedBookingArtist(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (bookingError) {
      console.error("Book selected artist error:", bookingError);

      setError(bookingError.message || "Unable to send booking request.");
    } finally {
      setBookingArtistId("");
    }
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const handleBookAnother = () => {
    setSubmitted(false);

    setSuggestedArtists([]);

    setBookingId("");

    setBookingArtistId("");

    setBookingMessage("");

    setSelectedBookingArtist(null);

    setError("");

    setForm({
      name: "",
      phone: "",
      email: "",
      city: "",
      category: "",
      artist: "",
      date: "",
      tattooIdea: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
      <div className="max-w-[1250px] mx-auto">
        {/* =================================================
            BACK
        ================================================= */}

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

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-10 mb-12">
          <div
            className="
              flex
              items-center
              gap-2

              text-purple-400

              mb-4
            "
          >
            <Sparkles size={14} />

            <span
              className="
                text-[9px]
                font-mono
                tracking-[0.18em]
              "
            >
              INK CONVENTION
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

          <p
            className="
              mt-6

              max-w-2xl

              text-sm
              text-gray-500

              leading-relaxed
            "
          >
            Select your tattoo style and location. We will find tattoo artists
            and studios that match your requirement.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
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

        {/* =================================================
            RESULT
        ================================================= */}

        {submitted ? (
          <div className="space-y-8">
            {/* =============================================
                SUCCESS
            ============================================= */}

            <div
              className="
                border
                border-purple-500/30

                bg-purple-500/[0.06]

                rounded-[28px]

                p-8
                sm:p-12

                text-center
              "
            >
              <div
                className="
                  w-16
                  h-16

                  mx-auto
                  mb-5

                  rounded-full

                  flex
                  items-center
                  justify-center

                  bg-purple-500/15

                  border
                  border-purple-500/30

                  text-purple-400
                "
              >
                <Sparkles size={25} />
              </div>

              <p
                className="
                  text-purple-400

                  text-[9px]
                  font-mono

                  tracking-[0.16em]
                  uppercase
                "
              >
                {form.category}
              </p>

              <h2
                className="
                  mt-3

                  text-2xl
                  sm:text-4xl

                  font-black
                  uppercase
                "
              >
                Suggested Artists
              </h2>

              <p
                className="
                  mt-3

                  max-w-xl

                  mx-auto

                  text-sm
                  text-gray-500
                "
              >
                We searched for artists matching{" "}
                <span className="text-white">{form.category}</span> in{" "}
                <span className="text-white">{form.city}</span>.
              </p>
            </div>

            {/* =============================================
                ARTIST RESULTS
            ============================================= */}

            {bookingMessage && (
              <div
                className="
                  rounded-xl

                  border
                  border-emerald-500/30

                  bg-emerald-500/[0.06]

                  px-5
                  py-4

                  text-sm
                  text-emerald-400
                "
              >
                {bookingMessage}
              </div>
            )}

            {suggestedArtists.length === 0 ? (
              <div
                className="
                  border
                  border-white/10

                  bg-[#0d0d11]

                  rounded-[24px]

                  px-6
                  py-12

                  text-center
                "
              >
                <Search
                  size={30}
                  className="
                    mx-auto
                    mb-4
                    text-gray-700
                  "
                />

                <h3
                  className="
                    text-lg
                    font-black
                    uppercase
                  "
                >
                  No exact artist found
                </h3>

                <p
                  className="
                    mt-2

                    text-sm
                    text-gray-600
                  "
                >
                  We don't currently have a matching {form.category} artist in{" "}
                  {form.city}.
                </p>

                <Link
                  to="/artists"
                  className="
                    mt-6

                    inline-flex
                    items-center
                    justify-center
                    gap-2

                    rounded-xl

                    border
                    border-purple-500/30

                    bg-purple-500/10

                    px-6
                    py-3.5

                    text-[9px]
                    font-black
                    tracking-[0.12em]

                    text-purple-300

                    hover:bg-purple-600
                    hover:text-white

                    transition
                  "
                >
                  BROWSE ALL ARTISTS
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  xl:grid-cols-3

                  gap-5
                "
              >
                {suggestedArtists.map((artist, index) => {
                  const artistId =
                    artist._id || artist.id || `${artist.name}-${index}`;

                  const artistStyles = Array.isArray(artist.tattooStyles)
                    ? artist.tattooStyles
                    : [];

                  const artistPlan = String(
                    artist.plan || "basic",
                  ).toLowerCase();

                  const isGold =
                    artistPlan === "verified" || artistPlan === "gold";

                  const isSilver =
                    artistPlan === "pro" || artistPlan === "silver";

                  return (
                    <div
                      key={artistId}
                      className={`
                          relative
                          overflow-hidden

                          rounded-[24px]

                          border

                          p-5

                          transition-all
                          duration-300

                          hover:-translate-y-1

                          ${
                            isGold
                              ? `
                                border-[#f5c451]/50
                                bg-gradient-to-br
                                from-[#f5c451]/[0.10]
                                via-[#151005]
                                to-[#0d0d11]

                                shadow-[0_0_25px_rgba(245,196,81,0.10)]
                              `
                              : isSilver
                                ? `
                                  border-slate-200/25
                                  bg-gradient-to-br
                                  from-white/[0.06]
                                  to-[#0d0d11]
                                `
                                : `
                                  border-white/10
                                  bg-[#0d0d11]
                                `
                          }
                        `}
                    >
                      {/* PROFILE */}

                      <div
                        className="
                            flex
                            items-start
                            gap-4
                          "
                      >
                        <div
                          className={`
                              w-14
                              h-14

                              rounded-full

                              shrink-0

                              overflow-hidden

                              flex
                              items-center
                              justify-center

                              bg-black

                              border-2

                              font-black

                              ${
                                isGold
                                  ? `
                                    border-[#f5c451]
                                    text-[#f5c451]
                                  `
                                  : isSilver
                                    ? `
                                      border-slate-300
                                      text-slate-200
                                    `
                                    : `
                                      border-purple-500/30
                                      text-purple-400
                                    `
                              }
                            `}
                        >
                          {artist.profileImage ? (
                            <img
                              src={artist.profileImage}
                              alt={artist.name || "Tattoo Artist"}
                              className="
                                  w-full
                                  h-full
                                  object-cover
                                "
                            />
                          ) : (
                            artist.name?.charAt(0)?.toUpperCase() || "A"
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* PLAN */}

                          <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2

                                mb-2
                              "
                          >
                            {isGold && (
                              <span
                                className="
                                    rounded-full

                                    bg-[#f5c451]

                                    px-2.5
                                    py-1

                                    text-[7px]
                                    font-black

                                    text-black
                                  "
                              >
                                ★ GOLD
                              </span>
                            )}

                            {isSilver && (
                              <span
                                className="
                                    rounded-full

                                    bg-slate-200

                                    px-2.5
                                    py-1

                                    text-[7px]
                                    font-black

                                    text-black
                                  "
                              >
                                SILVER PRO
                              </span>
                            )}

                            {!isGold && !isSilver && (
                              <span
                                className="
                                      rounded-full

                                      border
                                      border-purple-500/20

                                      bg-purple-500/10

                                      px-2.5
                                      py-1

                                      text-[7px]
                                      font-black

                                      text-purple-400
                                    "
                              >
                                DIRECTORY
                              </span>
                            )}
                          </div>

                          {/* NAME */}

                          <h3
                            className="
                                text-lg
                                font-black
                                uppercase

                                truncate
                              "
                          >
                            {artist.name || "Tattoo Artist"}
                          </h3>

                          {/* LOCATION */}

                          <div
                            className="
                                mt-2

                                flex
                                items-center
                                gap-1.5

                                text-xs
                                text-gray-500
                              "
                          >
                            <MapPin size={12} />

                            <span className="truncate">
                              {[artist.city, artist.state]
                                .filter(Boolean)
                                .join(", ") || "India"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RATING */}

                      {(artist.rating || artist.reviews) && (
                        <div
                          className="
                              mt-5

                              flex
                              items-center
                              gap-2

                              border-t
                              border-white/10

                              pt-4
                            "
                        >
                          <Star
                            size={13}
                            className="
                                text-yellow-400
                              "
                          />

                          <span
                            className="
                                text-xs
                                font-black
                              "
                          >
                            {artist.rating || "—"}
                          </span>

                          <span
                            className="
                                text-[10px]
                                text-gray-600
                              "
                          >
                            ({artist.reviews || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* STYLES */}

                      {artistStyles.length > 0 && (
                        <div
                          className="
                              mt-4

                              flex
                              flex-wrap
                              gap-2
                            "
                        >
                          {artistStyles.slice(0, 5).map((style) => (
                            <span
                              key={style}
                              className={`
                                    rounded-full

                                    border

                                    px-2.5
                                    py-1

                                    text-[7px]
                                    font-black

                                    ${
                                      String(style).toLowerCase() ===
                                      String(form.category).toLowerCase()
                                        ? `
                                          border-purple-400/50
                                          bg-purple-500/20
                                          text-purple-300
                                        `
                                        : `
                                          border-white/10
                                          bg-white/[0.03]
                                          text-gray-500
                                        `
                                    }
                                  `}
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* MATCH */}

                      <div
                        className="
                            mt-5

                            border-t
                            border-white/10

                            pt-4

                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                      >
                        <div>
                          <p
                            className="
                                text-[7px]
                                font-mono
                                tracking-[0.12em]

                                text-gray-600
                              "
                          >
                            MATCHED STYLE
                          </p>

                          <p
                            className="
                                mt-1

                                text-[10px]
                                font-black

                                text-purple-400
                              "
                          >
                            {form.category}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedBookingArtist(artist)}
                          disabled={Boolean(bookingArtistId)}
                          className="
                              inline-flex
                              items-center
                              justify-center
                              gap-2

                              rounded-lg

                              border
                              border-purple-400/40

                              bg-purple-600

                              px-4
                              py-3

                              text-[8px]
                              font-black
                              tracking-[0.06em]

                              text-white

                              hover:bg-purple-500

                              disabled:opacity-50
                              disabled:cursor-not-allowed

                              transition
                            "
                        >
                          BOOK THIS ARTIST
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* =============================================
                BOTTOM BUTTONS
            ============================================= */}

            <div
              className="
                flex
                flex-col
                sm:flex-row

                justify-center

                gap-3

                pt-4
              "
            >
              <button
                type="button"
                onClick={handleBookAnother}
                className="
                  px-7
                  py-4

                  rounded-xl

                  border
                  border-white/10

                  bg-white/[0.04]

                  text-[9px]
                  font-black
                  tracking-[0.12em]

                  hover:bg-white/10

                  transition
                "
              >
                NEW SEARCH
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
                VIEW ALL ARTISTS
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* =================================================
              FORM
          ================================================= */

          <form
            onSubmit={handleSubmit}
            className="
              border
              border-white/10

              bg-[#0d0d11]

              rounded-[28px]

              p-5
              sm:p-8
              lg:p-10
            "
          >
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2

                gap-5
              "
            >
              {/* NAME */}

              <FormField icon={<User size={15} />} label="YOUR NAME">
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

              {/* PHONE */}

              <FormField icon={<Phone size={15} />} label="PHONE NUMBER">
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

              {/* EMAIL */}

              <FormField icon={<Mail size={15} />} label="EMAIL">
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

              {/* CITY */}

              <FormField icon={<MapPin size={15} />} label="CITY">
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="Mumbai"
                  className={inputClass}
                />
              </FormField>

              {/* =================================================
                  TATTOO CATEGORY
              ================================================= */}

              <FormField
                icon={<Sparkles size={15} />}
                label="TATTOO STYLE / CATEGORY"
              >
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={`
                    ${inputClass}

                    cursor-pointer

                    [color-scheme:dark]
                  `}
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

              {/* DATE */}

              <FormField
                icon={<CalendarDays size={15} />}
                label="PREFERRED DATE"
              >
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`
                    ${inputClass}
                    [color-scheme:dark]
                  `}
                />
              </FormField>

              {/* PREFERRED ARTIST */}

              <div className="md:col-span-2">
                <FormField
                  icon={<Sparkles size={15} />}
                  label="PREFERRED ARTIST / STUDIO (OPTIONAL)"
                >
                  <input
                    type="text"
                    name="artist"
                    value={form.artist}
                    onChange={handleChange}
                    placeholder="Already know an artist? Enter artist or studio name"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {/* =================================================
                TATTOO IDEA
            ================================================= */}

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
                TELL US ABOUT YOUR TATTOO
              </label>

              <textarea
                name="tattooIdea"
                value={form.tattooIdea}
                onChange={handleChange}
                rows={6}
                placeholder="Tattoo idea, size, body placement, reference, colours or any other details..."
                className="
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
                "
              />
            </div>

            {/* =================================================
                SELECTED CATEGORY
            ================================================= */}

            {form.category && (
              <div
                className="
                  mt-5

                  flex
                  items-center
                  justify-between
                  gap-4

                  rounded-xl

                  border
                  border-purple-500/20

                  bg-purple-500/[0.05]

                  px-4
                  py-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <Sparkles size={14} className="text-purple-400" />

                  <div>
                    <p
                      className="
                        text-[7px]
                        font-mono
                        tracking-[0.12em]

                        text-gray-600
                      "
                    >
                      SELECTED STYLE
                    </p>

                    <p
                      className="
                        mt-0.5

                        text-[10px]
                        font-black

                        text-purple-300
                      "
                    >
                      {form.category}
                    </p>
                  </div>
                </div>

                <span
                  className="
                    text-[8px]
                    text-gray-600
                  "
                >
                  Matching artists will be suggested
                </span>
              </div>
            )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div
              className="
                mt-8

                flex
                justify-end
              "
            >
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
                    FINDING ARTISTS...
                  </>
                ) : (
                  <>
                    FIND MY ARTIST
                    <ArrowRight
                      size={14}
                      className="
                        transition-transform

                        group-hover:translate-x-1
                      "
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* =========================================================
          BOOK ARTIST CONFIRMATION MODAL
      ========================================================= */}

      {selectedBookingArtist && (
        <div
          className="
            fixed
            inset-0
            z-[9999]

            flex
            items-center
            justify-center

            bg-black/80
            backdrop-blur-sm

            p-4
          "
        >
          <div
            className="
    w-full
    max-w-[520px]

    max-h-[90vh]
    overflow-y-auto

    rounded-[28px]

    border
    border-purple-500/30

    bg-[#0d0d11]

    p-6
    sm:p-8
  "
          >
            <div
              className="
                w-14
                h-14

                rounded-full

                bg-purple-500/10

                border
                border-purple-500/20

                flex
                items-center
                justify-center

                text-purple-400
              "
            >
              <Sparkles size={23} />
            </div>

            <p
              className="
                mt-6

                text-[8px]
                font-mono
                tracking-[0.16em]

                text-purple-400
              "
            >
              CONFIRM BOOKING REQUEST
            </p>

            <h2
              className="
                mt-3

                text-2xl
                sm:text-3xl

                font-black
                uppercase
              "
            >
              Book{" "}
              <span className="text-purple-400">
                {selectedBookingArtist.name || "this artist"}
              </span>
              ?
            </h2>

            {/* ARTIST */}

            <div
              className="
                mt-6

                flex
                items-center
                gap-4

                rounded-2xl

                border
                border-white/10

                bg-black/30

                p-4
              "
            >
              <div
                className="
                  w-14
                  h-14

                  rounded-full

                  overflow-hidden

                  border
                  border-purple-500/30

                  bg-black

                  flex
                  items-center
                  justify-center

                  font-black
                  text-purple-400
                "
              >
                {selectedBookingArtist.profileImage ? (
                  <img
                    src={selectedBookingArtist.profileImage}
                    alt={selectedBookingArtist.name || "Tattoo Artist"}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />
                ) : (
                  selectedBookingArtist.name?.charAt(0)?.toUpperCase() || "A"
                )}
              </div>

              <div className="min-w-0">
                <h3
                  className="
                    font-black
                    uppercase
                    truncate
                  "
                >
                  {selectedBookingArtist.name || "Tattoo Artist"}
                </h3>

                <p
                  className="
                    mt-1

                    text-xs
                    text-gray-500
                  "
                >
                  {[selectedBookingArtist.city, selectedBookingArtist.state]
                    .filter(Boolean)
                    .join(", ") || "India"}
                </p>
              </div>
            </div>

            {/* BOOKING DETAILS */}

            <div
              className="
                mt-4

                rounded-2xl

                border
                border-white/10

                bg-black/30

                p-5

                space-y-4
              "
            >
              <div>
                <p className="text-[7px] text-gray-600">TATTOO STYLE</p>

                <p
                  className="
                    mt-1

                    text-sm
                    font-black

                    text-purple-400
                  "
                >
                  {form.category}
                </p>
              </div>

              <div>
                <p className="text-[7px] text-gray-600">CUSTOMER</p>

                <p className="mt-1 text-sm">{form.name}</p>
              </div>

              <div>
                <p className="text-[7px] text-gray-600">PREFERRED DATE</p>

                <p className="mt-1 text-sm">{form.date || "Not selected"}</p>
              </div>

              <div>
                <p className="text-[7px] text-gray-600">TATTOO IDEA</p>

                <p
                  className="
                    mt-1

                    text-sm
                    text-gray-400

                    leading-relaxed
                  "
                >
                  {form.tattooIdea || "No additional details provided."}
                </p>
              </div>
            </div>

            {/* INFO */}

            <div
              className="
                mt-5

                rounded-xl

                border
                border-yellow-500/20

                bg-yellow-500/[0.05]

                px-4
                py-3
              "
            >
              <p
                className="
                  text-[10px]
                  text-yellow-200/70

                  leading-relaxed
                "
              >
                This sends a booking request to the artist. Your booking is only
                confirmed after the artist accepts it.
              </p>
            </div>

            {/* BUTTONS */}

            <div
              className="
    sticky
    bottom-0

    mt-7
    pt-4

    grid
    grid-cols-2
    gap-3

    bg-[#0d0d11]
  "
            >
              <button
                type="button"
                disabled={Boolean(bookingArtistId)}
                onClick={() => setSelectedBookingArtist(null)}
                className="
                  rounded-xl

                  border
                  border-white/10

                  bg-white/[0.04]

                  py-4

                  text-[9px]
                  font-black
                  tracking-[0.10em]

                  hover:bg-white/10

                  disabled:opacity-50
                  disabled:cursor-not-allowed

                  transition
                "
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={Boolean(bookingArtistId)}
                onClick={() => handleBookArtist(selectedBookingArtist)}
                className="
                  rounded-xl

                  bg-purple-600
                  hover:bg-purple-500

                  py-4

                  text-[9px]
                  font-black
                  tracking-[0.10em]

                  text-white

                  disabled:opacity-50
                  disabled:cursor-not-allowed

                  transition
                "
              >
                {bookingArtistId ? "SENDING..." : "SEND REQUEST"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   INPUT CLASS
========================================================= */

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

/* =========================================================
   FORM FIELD
========================================================= */

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
