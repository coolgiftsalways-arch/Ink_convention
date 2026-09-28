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
  Check,
  X,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   BOOK ARTIST
========================================================= */

export default function BookArtist() {
  const location = useLocation();

  /* =======================================================
     SELECTED ARTIST

     Artist information comes from Artists.jsx navigation.
  ======================================================= */

  const selectedArtist = React.useMemo(
    () => ({
      id: String(
        location.state?.preferredArtistId ||
          location.state?.artistId ||
          ""
      ).trim(),

      name: String(
        location.state?.preferredArtist ||
          location.state?.artistName ||
          ""
      ).trim(),

      city: String(
        location.state?.city || ""
      ).trim(),

      state: String(
        location.state?.state || ""
      ).trim(),

      profileImage: String(
        location.state?.profileImage || ""
      ).trim(),

      plan: String(
        location.state?.plan || ""
      )
        .trim()
        .toLowerCase(),
    }),
    [location.state]
  );

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] =
    React.useState({
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
    });

  /* =======================================================
     STATES
  ======================================================= */

  const [loading, setLoading] =
    React.useState(false);

  const [submitted, setSubmitted] =
    React.useState(false);

  const [error, setError] =
    React.useState("");

  const [bookingId, setBookingId] =
    React.useState("");

  const [
    notificationSent,
    setNotificationSent,
  ] = React.useState(false);

  const [
    notificationError,
    setNotificationError,
  ] = React.useState("");

  const [
    showConsentPopup,
    setShowConsentPopup,
  ] = React.useState(false);

  const [
    consentAccepted,
    setConsentAccepted,
  ] = React.useState(false);

  /* =======================================================
     API
  ======================================================= */

  const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

  /* =======================================================
     HANDLE FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     SUBMIT BOOKING
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedArtist.id) {
      setError(
        "No artist was selected. Please return to Artists and choose an artist."
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      setNotificationError("");

      /* ===================================================
         VALIDATION
      =================================================== */

      if (!form.name.trim()) {
        throw new Error(
          "Please enter your name."
        );
      }

      if (!form.phone.trim()) {
        throw new Error(
          "Please enter your phone number."
        );
      }

      if (!form.email.trim()) {
        throw new Error(
          "Please enter your email address."
        );
      }

      if (!form.tattooStyle) {
        throw new Error(
          "Please select a tattoo style."
        );
      }

      if (!form.tattooIdea.trim()) {
        throw new Error(
          "Please tell the artist about your tattoo idea."
        );
      }

      if (!consentAccepted) {
        setShowConsentPopup(true);

        return;
      }

      /* ===================================================
         CREATE BOOKING
      =================================================== */

      const bookingResponse =
        await fetch(
          `${API_URL}/api/artist-bookings`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              /* CUSTOMER */

              name:
                form.name.trim(),

              phone:
                form.phone.trim(),

              email:
                form.email.trim(),

              /* ARTIST */

              selectedArtistId:
                selectedArtist.id,

              /* BOOKING */

              tattooStyle:
                form.tattooStyle,

              // Compatibility with older backend
              category:
                form.tattooStyle,

              preferredDate:
                form.date || null,

              preferredTime:
                form.time || "",

              tattooIdea:
                form.tattooIdea.trim(),

              bodyPlacement:
                form.bodyPlacement.trim(),

              tattooSize:
                form.tattooSize.trim(),

              budget:
                form.budget.trim(),

              referenceLink:
                form.referenceLink.trim(),
            }),
          }
        );

      const bookingData =
        await bookingResponse
          .json()
          .catch(() => ({}));

      /* ===================================================
         API ERROR
      =================================================== */

      if (!bookingResponse.ok) {
        throw new Error(
          bookingData?.message ||
            bookingData?.error ||
            "Unable to create your booking request."
        );
      }

      /* ===================================================
         GET BOOKING ID
      =================================================== */

      const createdBookingId =
        bookingData?.booking?._id ||
        bookingData?.booking?.id ||
        bookingData?._id ||
        bookingData?.id ||
        "";

      setBookingId(
        String(
          createdBookingId || ""
        )
      );

      /* ===================================================
         IMPORTANT

         Don't automatically set this to true.

         Backend tells us whether Interakt WhatsApp
         was actually sent successfully.
      =================================================== */

      setNotificationSent(
        Boolean(
          bookingData?.notificationSent
        )
      );

      setNotificationError(
        String(
          bookingData?.notificationError ||
            ""
        )
      );

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      console.error(
        "Direct artist booking error:",
        submitError
      );

      setError(
        submitError?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RESET / BOOK ANOTHER
  ======================================================= */

  const handleBookAnother =
    () => {
      setSubmitted(false);

      setBookingId("");

      setNotificationSent(false);

      setNotificationError("");

      setConsentAccepted(false);

      setShowConsentPopup(false);

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
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const artistPlanLabel =
    getPlanLabel(
      selectedArtist.plan
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#08080a] text-white pt-32 pb-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1180px] mx-auto">
        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/artists"
          className="inline-flex items-center gap-2 text-[9px] font-black tracking-[0.15em] text-gray-500 hover:text-purple-400 transition"
        >
          <ArrowLeft size={14} />

          BACK TO ARTISTS
        </Link>

        {/* =================================================
            PAGE HEADING
        ================================================= */}

        <div className="mt-10 mb-10">
          <div className="flex items-center gap-2 text-purple-400 mb-4">
            <Sparkles size={14} />

            <span className="text-[9px] font-mono tracking-[0.18em]">
              DIRECT ARTIST BOOKING
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-[-0.05em] leading-[0.9]">
            BOOK YOUR
            <br />

            <span className="text-purple-500">
              ARTIST.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm text-gray-500 leading-relaxed">
            You already selected an
            artist. Fill in your booking
            details and the request will
            be sent directly to that
            artist.
          </p>
        </div>

        {/* =================================================
            NO ARTIST
        ================================================= */}

        {!selectedArtist.id && (
          <div className="mb-8 rounded-[24px] border border-yellow-500/25 bg-yellow-500/[0.06] p-6">
            <h2 className="text-lg font-black uppercase">
              No artist selected
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please open the Artists
              page and click BOOK ARTIST
              on the artist you want.
            </p>

            <Link
              to="/artists"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-3 text-[9px] font-black tracking-widest transition"
            >
              CHOOSE AN ARTIST

              <ArrowRight
                size={13}
              />
            </Link>
          </div>
        )}

        {/* =================================================
            ARTIST CARD
        ================================================= */}

        {selectedArtist.id && (
          <SelectedArtistCard
            artist={
              selectedArtist
            }
            planLabel={
              artistPlanLabel
            }
          />
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 mb-6 border border-red-500/30 bg-red-500/[0.07] rounded-xl px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS OR FORM
        ================================================= */}

        {submitted ? (
          <SuccessState
            artist={
              selectedArtist
            }
            bookingId={
              bookingId
            }
            notificationSent={
              notificationSent
            }
            notificationError={
              notificationError
            }
            onBookAnother={
              handleBookAnother
            }
          />
        ) : selectedArtist.id ? (
          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 border border-white/10 bg-[#0d0d11] rounded-[28px] p-5 sm:p-8 lg:p-10"
          >
            {/* =================================================
                FORM TITLE
            ================================================= */}

            <div className="mb-8">
              <p className="text-[9px] font-mono tracking-[0.16em] text-purple-400">
                YOUR DETAILS
              </p>

              <h2 className="mt-2 text-2xl sm:text-3xl font-black uppercase">
                Booking information
              </h2>
            </div>

            {/* =================================================
                FORM GRID
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* NAME */}

              <FormField
                icon={
                  <User size={15} />
                }
                label="YOUR NAME *"
              >
                <input
                  type="text"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Enter your full name"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* PHONE */}

              <FormField
                icon={
                  <Phone
                    size={15}
                  />
                }
                label="PHONE NUMBER *"
              >
                <input
                  type="tel"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="+91 98765 43210"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* EMAIL */}

              <FormField
                icon={
                  <Mail
                    size={15}
                  />
                }
                label="EMAIL *"
              >
                <input
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="you@example.com"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* STYLE */}

              <FormField
                icon={
                  <Sparkles
                    size={15}
                  />
                }
                label="TATTOO STYLE / CATEGORY *"
              >
                <select
                  name="tattooStyle"
                  value={
                    form.tattooStyle
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className={`${inputClass} cursor-pointer [color-scheme:dark]`}
                >
                  <option
                    value=""
                    className="bg-[#0d0d11]"
                  >
                    Select tattoo
                    style
                  </option>

                  {TATTOO_CATEGORIES.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                        className="bg-[#0d0d11]"
                      >
                        {
                          category
                        }
                      </option>
                    )
                  )}
                </select>
              </FormField>

              {/* DATE */}

              <FormField
                icon={
                  <CalendarDays
                    size={15}
                  />
                }
                label="PREFERRED DATE"
              >
                <input
                  type="date"
                  name="date"
                  value={
                    form.date
                  }
                  onChange={
                    handleChange
                  }
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </FormField>

              {/* TIME */}

              <FormField
                icon={
                  <Clock3
                    size={15}
                  />
                }
                label="PREFERRED TIME"
              >
                <input
                  type="time"
                  name="time"
                  value={
                    form.time
                  }
                  onChange={
                    handleChange
                  }
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </FormField>

              {/* BODY PLACEMENT */}

              <FormField
                icon={
                  <MapPin
                    size={15}
                  />
                }
                label="BODY PLACEMENT"
              >
                <input
                  type="text"
                  name="bodyPlacement"
                  value={
                    form.bodyPlacement
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Forearm, back, wrist..."
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* SIZE */}

              <FormField
                icon={
                  <Ruler
                    size={15}
                  />
                }
                label="APPROX TATTOO SIZE"
              >
                <input
                  type="text"
                  name="tattooSize"
                  value={
                    form.tattooSize
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: 4 x 5 inches"
                  className={
                    inputClass
                  }
                />
              </FormField>

              {/* BUDGET */}

              <FormField
                icon={
                  <IndianRupee
                    size={15}
                  />
                }
                label="BUDGET"
              >
                <select
                  name="budget"
                  value={
                    form.budget
                  }
                  onChange={
                    handleChange
                  }
                  className={`${inputClass} cursor-pointer [color-scheme:dark]`}
                >
                  <option
                    value=""
                    className="bg-[#0d0d11]"
                  >
                    Select budget
                    range
                  </option>

                  <option
                    value="Under ₹2,000"
                    className="bg-[#0d0d11]"
                  >
                    Under ₹2,000
                  </option>

                  <option
                    value="₹2,000 - ₹5,000"
                    className="bg-[#0d0d11]"
                  >
                    ₹2,000 -
                    ₹5,000
                  </option>

                  <option
                    value="₹5,000 - ₹10,000"
                    className="bg-[#0d0d11]"
                  >
                    ₹5,000 -
                    ₹10,000
                  </option>

                  <option
                    value="₹10,000 - ₹25,000"
                    className="bg-[#0d0d11]"
                  >
                    ₹10,000 -
                    ₹25,000
                  </option>

                  <option
                    value="₹25,000+"
                    className="bg-[#0d0d11]"
                  >
                    ₹25,000+
                  </option>

                  <option
                    value="Discuss with artist"
                    className="bg-[#0d0d11]"
                  >
                    Discuss with
                    artist
                  </option>
                </select>
              </FormField>

              {/* REFERENCE */}

              <FormField
                icon={
                  <ImagePlus
                    size={15}
                  />
                }
                label="REFERENCE IMAGE LINK"
              >
                <input
                  type="url"
                  name="referenceLink"
                  value={
                    form.referenceLink
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Google Drive / Instagram / image URL"
                  className={
                    inputClass
                  }
                />
              </FormField>
            </div>

            {/* =================================================
                TATTOO IDEA
            ================================================= */}

            <div className="mt-5">
              <label className="block mb-2 text-[8px] font-black tracking-[0.15em] text-gray-500">
                TELL THE ARTIST ABOUT
                YOUR TATTOO *
              </label>

              <textarea
                name="tattooIdea"
                value={
                  form.tattooIdea
                }
                onChange={
                  handleChange
                }
                required
                rows={6}
                placeholder="Describe the tattoo idea, design, colours, reference, changes you want, etc."
                className={
                  textareaClass
                }
              />
            </div>

            {/* =================================================
                CONSENT
            ================================================= */}

            <div className="mt-6">
              <button
                type="button"
                aria-pressed={
                  consentAccepted
                }
                onClick={() => {
                  if (
                    consentAccepted
                  ) {
                    setConsentAccepted(
                      false
                    );
                  } else {
                    setShowConsentPopup(
                      true
                    );
                  }
                }}
                className={`
                  group
                  w-full
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  px-5
                  py-5
                  text-left
                  transition-all
                  duration-300

                  ${
                    consentAccepted
                      ? `
                        border-purple-500/50
                        bg-purple-500/[0.08]
                        shadow-[0_0_24px_rgba(168,85,247,0.10)]
                      `
                      : `
                        border-white/10
                        bg-white/[0.02]
                        hover:border-purple-500/30
                        hover:bg-purple-500/[0.04]
                      `
                  }
                `}
              >
                <span
                  className={`
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    border
                    transition-all
                    duration-300

                    ${
                      consentAccepted
                        ? "border-purple-500 bg-purple-600 text-white"
                        : "border-white/20 bg-black/30 text-transparent"
                    }
                  `}
                >
                  <Check
                    size={15}
                    strokeWidth={
                      3
                    }
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-white">
                    Share my
                    information with{" "}

                    <span className="text-purple-400">
                      {selectedArtist.name ||
                        "this artist"}
                    </span>
                  </span>

                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                    Your booking
                    information will be
                    shared according to
                    the artist's
                    InkConvention plan.
                  </span>
                </span>

                <ArrowRight
                  size={17}
                  className={`
                    shrink-0
                    transition-all
                    duration-300

                    ${
                      consentAccepted
                        ? "rotate-90 text-purple-400"
                        : "text-gray-600 group-hover:text-purple-400"
                    }
                  `}
                />
              </button>

              {!consentAccepted && (
                <p className="mt-2 px-1 text-[10px] leading-relaxed text-gray-600">
                  Please review and
                  accept this before
                  sending your booking
                  request.
                </p>
              )}
            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={
                  loading
                }
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
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

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

      {/* =====================================================
          CONSENT POPUP
      ===================================================== */}

      {showConsentPopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowConsentPopup(
                false
              );
            }
          }}
        >
          <div className="w-full max-w-md rounded-[28px] border border-purple-500/30 bg-[#0d0d11] p-7 shadow-[0_0_60px_rgba(168,85,247,0.16)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                <ShieldCheck
                  size={22}
                />
              </div>

              <button
                type="button"
                aria-label="Close confirmation"
                onClick={() =>
                  setShowConsentPopup(
                    false
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <p className="mt-6 text-[8px] font-black tracking-[0.18em] text-purple-400">
              CONFIRM INFORMATION
              SHARING
            </p>

            <h3 className="mt-2 text-2xl font-black uppercase leading-tight sm:text-3xl">
              Share your details
              with{" "}

              <span className="text-purple-400">
                {selectedArtist.name ||
                  "this artist"}
                ?
              </span>
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              By selecting YES,
              InkConvention will send
              your booking request to{" "}

              <span className="font-bold text-white">
                {selectedArtist.name ||
                  "the selected artist"}
              </span>
              .
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="space-y-3 text-xs text-gray-400">
                <ConsentItem>
                  Name
                </ConsentItem>

                <ConsentItem>
                  Phone number
                </ConsentItem>

                <ConsentItem>
                  Email address
                </ConsentItem>

                <ConsentItem>
                  Tattoo booking
                  information
                </ConsentItem>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setShowConsentPopup(
                    false
                  )
                }
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-[9px] font-black tracking-widest text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                NO, GO BACK
              </button>

              <button
                type="button"
                onClick={() => {
                  setConsentAccepted(
                    true
                  );

                  setShowConsentPopup(
                    false
                  );

                  setError("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-4 text-[9px] font-black tracking-widest text-white transition hover:bg-purple-500"
              >
                YES, I AGREE

                <Check
                  size={14}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   SELECTED ARTIST CARD
========================================================= */

function SelectedArtistCard({
  artist,
  planLabel,
}) {
  const isGold =
    artist.plan ===
      "verified" ||
    artist.plan === "gold" ||
    artist.plan ===
      "spotlight";

  const isSilver =
    artist.plan === "pro" ||
    artist.plan ===
      "silver";

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
              src={
                artist.profileImage
              }
              alt={
                artist.name ||
                "Tattoo Artist"
              }
              className="w-full h-full object-cover"
            />
          ) : (
            artist.name
              ?.charAt(0)
              ?.toUpperCase() ||
            "A"
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
            {artist.name ||
              "Tattoo Artist"}
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={12} />

            <span className="truncate">
              {[
                artist.city,
                artist.state,
              ]
                .filter(Boolean)
                .join(", ") ||
                "India"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SUCCESS STATE
========================================================= */

function SuccessState({
  artist,
  bookingId,
  notificationSent,
  notificationError,
  onBookAnother,
}) {
  return (
    <section className="mt-8 rounded-[28px] border border-emerald-500/25 bg-emerald-500/[0.05] p-7 sm:p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        <CheckCircle2
          size={28}
        />
      </div>

      <p className="mt-6 text-[8px] font-mono tracking-[0.16em] text-emerald-400">
        BOOKING REQUEST CREATED
      </p>

      <h2 className="mt-3 text-2xl sm:text-4xl font-black uppercase">
        Request sent to{" "}

        <span className="text-purple-400">
          {artist.name ||
            "the artist"}
        </span>
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500">
        Your booking request has
        been submitted
        successfully.
      </p>

      {/* WhatsApp status */}

      {notificationSent ? (
        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
          <p className="text-xs font-bold text-emerald-400">
            ✓ WhatsApp
            notification sent to
            the artist.
          </p>
        </div>
      ) : notificationError ? (
        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] p-4">
          <p className="text-xs leading-relaxed text-yellow-300">
            Your booking was saved,
            but the artist WhatsApp
            notification could not
            be sent automatically.
          </p>
        </div>
      ) : null}

      {/* BOOKING ID */}

      {bookingId && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-white/10 bg-black/30 px-4 py-3">
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
          onClick={
            onBookAnother
          }
          className="rounded-xl border border-white/10 bg-white/[0.04] px-7 py-4 text-[9px] font-black tracking-[0.12em] hover:bg-white/10 transition"
        >
          EDIT / SEND AGAIN
        </button>

        <Link
          to="/artists"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-7 py-4 text-[9px] font-black tracking-[0.12em] transition"
        >
          VIEW ARTISTS

          <ArrowRight
            size={14}
          />
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   PLAN LABEL
========================================================= */

function getPlanLabel(plan) {
  const value =
    String(
      plan || ""
    ).toLowerCase();

  if (
    value === "verified" ||
    value === "gold" ||
    value === "spotlight"
  ) {
    return "★ GOLD";
  }

  if (
    value === "pro" ||
    value === "silver"
  ) {
    return "SILVER PRO";
  }

  return "FREE";
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  icon,
  label,
  children,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2 text-[8px] font-black tracking-[0.15em] text-gray-500">
        <span className="text-purple-400">
          {icon}
        </span>

        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   CONSENT ITEM
========================================================= */

function ConsentItem({
  children,
}) {
  return (
    <div className="flex items-center gap-3">
      <Check
        size={14}
        className="text-purple-400"
      />

      {children}
    </div>
  );
}

/* =========================================================
   INPUT STYLES
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