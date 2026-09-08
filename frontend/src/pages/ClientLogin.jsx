import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Store,
  User,
  Users,
} from "lucide-react";

const STALL_PACKAGES = {
  1: {
    packageId: "1-day",
    packageName: "1 Day Stall",
    packagePrice: 4999,
    description: "Single day exhibition pass",
  },
  2: {
    packageId: "2-days",
    packageName: "2 Days Stall",
    packagePrice: 8999,
    description: "Two-day exhibition access",
  },
  3: {
    packageId: "3-days",
    packageName: "3 Days Stall",
    packagePrice: 12499,
    description: "Full three-day convention access",
  },
};

const ADVANCE_AMOUNT = 1499;

const CONTACT_PHONE = "7039235169";
const CONTACT_EMAIL = "info@inkconvention.com";

export default function StallBooking() {
  const navigate = useNavigate();
  const [redirectSeconds, setRedirectSeconds] = useState(9);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const successRef = useRef(null);

  /*
    IMPORTANT:
    Use the same API origin/session setup as Enter.jsx.

    In development the Vite proxy can handle /api requests.
    In production VITE_API_URL (or the production API URL) is used.
  */
  const API_URL = import.meta.env.DEV
    ? ""
    : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
        .trim()
        .replace(/\/$/, "");

  const [verifiedProfile, setVerifiedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const makeBookingForm = (profile = {}, duration = "1") => ({
    brandName:
      profile.studio ||
      profile.studioName ||
      profile.brandName ||
      "",

    fullName:
      profile.name ||
      profile.artistName ||
      profile.professionalName ||
      profile.ownerName ||
      "",

    email: profile.email || "",

    phone:
      profile.phone ||
      profile.mobile ||
      profile.phoneNumber ||
      profile.mobileNumber ||
      "",

    city: profile.city || "",

    duration: String(duration || "1"),
  });

  const [formData, setFormData] = useState(() => makeBookingForm());

  /*
    AUTO-FILL FROM THE VERIFIED BACKEND PROFILE

    The artist has already verified OTP on Enter.jsx.
    /api/claim/me uses that existing verified session and returns
    the real MongoDB profile.

    The form stays editable after auto-fill.
  */
  useEffect(() => {
    let cancelled = false;

    const loadVerifiedProfile = async () => {
      try {
        setProfileLoading(true);

        const response = await fetch(`${API_URL}/api/claim/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const backendError = new Error(
            data?.message ||
              data?.error ||
              "Unable to load your verified artist details.",
          );

          backendError.status = response.status;
          throw backendError;
        }

        const profile = data?.profile || data?.artist || data || null;

        if (!profile || typeof profile !== "object") {
          throw new Error("Verified artist profile was not returned.");
        }

        if (cancelled) {
          return;
        }

        setVerifiedProfile(profile);

        setFormData((previous) =>
          makeBookingForm(profile, previous.duration || "1"),
        );
      } catch (profileError) {
        if (cancelled) {
          return;
        }

        console.error("Stall booking profile auto-fill error:", profileError);

        /*
          Do not block the page if there is no active verified session.
          The visitor can still type the form manually.
        */
        setVerifiedProfile(null);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    void loadVerifiedProfile();

    return () => {
      cancelled = true;
    };
  }, [API_URL]);
    /* =========================================================
     RETURN TO VERIFIED PROFILE AFTER SUCCESS
  ========================================================= */

  useEffect(() => {
    if (!submitted) {
      return undefined;
    }

    setRedirectSeconds(9);

    const timer = window.setInterval(() => {
      setRedirectSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);

          navigate("/Enter", {
            replace: true,
            state: {
              manageProfile: true,
            },
          });

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submitted, navigate]);

  const selectedPackage =
    STALL_PACKAGES[formData.duration] || STALL_PACKAGES[1];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      if (!formData.brandName.trim()) {
        throw new Error("Please enter your brand / studio name.");
      }

      if (!formData.fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (!formData.email.trim()) {
        throw new Error("Please enter your email address.");
      }

      if (!formData.phone.trim()) {
        throw new Error("Please enter your phone number.");
      }

      if (!formData.city.trim()) {
        throw new Error("Please enter your preferred city.");
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/api/stall-bookings/request`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // LINK THIS REQUEST TO THE VERIFIED ARTIST PROFILE
          profileId:
            verifiedProfile?._id ||
            verifiedProfile?.id ||
            verifiedProfile?.profileId ||
            "",

          artistId:
            verifiedProfile?._id ||
            verifiedProfile?.id ||
            verifiedProfile?.profileId ||
            "",

          // CUSTOMER / STUDIO
          brandName: formData.brandName.trim(),
          studioName: formData.brandName.trim(),
          fullName: formData.fullName.trim(),
          ownerName: formData.fullName.trim(),
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),

          // EXTRA SAVED PROFILE DATA
          state: String(verifiedProfile?.state || "").trim(),
          instagram: String(verifiedProfile?.instagram || "").trim(),
          currentPlan: String(
            verifiedProfile?.plan ||
              verifiedProfile?.membershipPlan ||
              "",
          ).trim(),

          // STALL OPTION
          duration: formData.duration,
          packageId: selectedPackage.packageId,
          packageName: selectedPackage.packageName,
          packagePrice: selectedPackage.packagePrice,
          totalAmount: selectedPackage.packagePrice,
          stallType: selectedPackage.packageName,
          stallName: selectedPackage.packageName,

          // REQUEST-FIRST BOOKING FLOW
          advanceAmount: ADVANCE_AMOUNT,
          paidAmount: 0,
          amount: ADVANCE_AMOUNT,

          paymentStatus: "pending",
          bookingStatus: "new_request",
          status: "NEW REQUEST",

          source: "website_stall_request",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          "Unable to submit your stall request right now. Please try again or contact our team.",
        );
      }

      const newBookingId =
        data?.booking?._id || data?.booking?.id || data?._id || data?.id || "";

      setBookingId(newBookingId);
      setSubmitted(true);

      // Wait until React renders the success card,
      // then bring it directly into the user's view.
      setTimeout(() => {
        successRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } catch (submitError) {
      console.error("Stall request error:", submitError);

      setError(
        submitError?.message ||
          "Something went wrong while submitting your request.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = () => {
    setSubmitted(false);
    setBookingId("");
    setError("");

    setFormData(makeBookingForm(verifiedProfile || {}, "1"));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const enquiryText = useMemo(() => {
    const lines = [
      "Hi Ink Convention, I submitted a stall booking request and would like to speak with your team.",
      "",
      formData.brandName.trim()
        ? `Brand / Studio: ${formData.brandName.trim()}`
        : "",
      formData.fullName.trim() ? `Name: ${formData.fullName.trim()}` : "",
      formData.phone.trim() ? `Phone: ${formData.phone.trim()}` : "",
      formData.email.trim() ? `Email: ${formData.email.trim()}` : "",
      formData.city.trim() ? `Preferred City: ${formData.city.trim()}` : "",
      `Stall Option: ${selectedPackage.packageName} (₹${selectedPackage.packagePrice.toLocaleString(
        "en-IN",
      )})`,
      "",
      "Please help me with expo availability, stall details and the ₹1,499 advance process.",
    ];

    return lines.filter(Boolean).join("\n");
  }, [formData, selectedPackage]);

  const whatsappUrl = `https://wa.me/91${CONTACT_PHONE}?text=${encodeURIComponent(
    enquiryText,
  )}`;

  const emailUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Ink Convention Stall Booking Enquiry",
  )}&body=${encodeURIComponent(enquiryText)}`;

  return (
    <div
      className="
        min-h-screen
        bg-[#08080a]
        text-white
        pt-28
        sm:pt-32
        pb-16
        sm:pb-20
        px-4
        sm:px-6
        lg:px-10
        font-sans
        selection:bg-[#a855f7]
        selection:text-white
        relative
        overflow-hidden
      "
    >
      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div
        className="
          absolute
          top-0
          left-1/4
          w-96
          h-96
          bg-[#a855f7]/10
          rounded-full
          blur-[120px]
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-10
          right-10
          w-80
          h-80
          bg-purple-900/10
          rounded-full
          blur-[100px]
          pointer-events-none
        "
      />

      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* =====================================================
            HERO
        ===================================================== */}

        <header
          className="
            relative
            overflow-hidden
            rounded-[28px]
            sm:rounded-[34px]
            border
            border-white/10
            bg-[#0d0d11]
            px-5
            sm:px-8
            lg:px-12
            py-10
            sm:py-12
            lg:py-14
            text-center
          "
        >
          <div
            className="
              absolute
              -top-40
              left-1/2
              -translate-x-1/2
              w-96
              h-96
              rounded-full
              bg-[#a855f7]/10
              blur-[110px]
              pointer-events-none
            "
          />

          <div className="relative z-10">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#a855f7]/30
                bg-[#a855f7]/10
                px-4
                py-2
              "
            >
              <Sparkles size={13} className="text-[#c084fc]" />

              <span
                className="
                  text-[8px]
                  sm:text-[9px]
                  font-black
                  font-mono
                  uppercase
                  tracking-[0.22em]
                  text-[#c084fc]
                "
              >
                Ink Convention 2026
              </span>
            </div>

            <p
              className="
                mt-7
                text-[10px]
                sm:text-xs
                font-black
                font-mono
                uppercase
                tracking-[0.28em]
                text-[#a855f7]
              "
            >
              Ready to exhibit?
            </p>

            <h1
              className="
                mt-4
                text-4xl
                sm:text-6xl
                lg:text-7xl
                xl:text-8xl
                font-black
                uppercase
                tracking-[-0.055em]
                leading-[0.9]
              "
            >
              Book Your
              <br />
              <span className="text-[#a855f7]">Stall.</span>
            </h1>

            <p
              className="
                mx-auto
                mt-6
                max-w-3xl
                text-sm
                sm:text-base
                lg:text-lg
                text-gray-400
                leading-relaxed
              "
            >
              Secure exhibition space for your tattoo studio, creative setup or
              industry brand at an upcoming Ink Convention regional expo. Submit
              your stall request first and our team will contact you to confirm
              availability, booking details and the ₹1,499 advance.
            </p>

            {/* EYE-GUIDING ARROW */}

            <div className="mt-8 flex flex-col items-center">
              <span
                className="
                  text-[8px]
                  sm:text-[9px]
                  font-black
                  font-mono
                  uppercase
                  tracking-[0.20em]
                  text-gray-600
                "
              >
                Start your stall enquiry below
              </span>

              <div className="mt-3 flex items-center gap-3">
                <span
                  className="
                    hidden
                    sm:block
                    w-20
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    to-[#a855f7]/70
                  "
                />

                <ArrowDown
                  size={23}
                  className="
                    text-[#a855f7]
                    animate-bounce
                    drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]
                  "
                />

                <span
                  className="
                    hidden
                    sm:block
                    w-20
                    h-px
                    bg-gradient-to-l
                    from-transparent
                    to-[#a855f7]/70
                  "
                />
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            BOOKING INFORMATION + STALL OPTIONS
        ===================================================== */}

        <main
          className="
            mt-6
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-6
          "
        >
          {/* ===================================================
              LEFT: ENQUIRY DETAILS
          =================================================== */}

          <section
            className="
              lg:col-span-7
              bg-[#121218]/80
              backdrop-blur-xl
              border
              border-[#2a2a35]
              rounded-[26px]
              p-5
              sm:p-7
              lg:p-8
              shadow-2xl
              relative
              overflow-hidden
            "
          >
            <div
              className="
                absolute
                -top-24
                -left-24
                w-52
                h-52
                bg-[#a855f7]/10
                rounded-full
                blur-[80px]
                pointer-events-none
              "
            />

            <div
              className="
                relative
                z-10
                flex
                items-center
                justify-between
                gap-4
                mb-7
                pb-4
                border-b
                border-[#2a2a35]
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    font-mono
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-[#a855f7]
                  "
                >
                  Stall enquiry
                </p>

                <h2
                  className="
                    mt-2
                    text-xl
                    sm:text-2xl
                    font-black
                    uppercase
                    tracking-tight
                  "
                >
                  Tell us about your setup
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  These details are automatically added to your WhatsApp or
                  email enquiry.
                </p>
              </div>

              <div
                className="
                  shrink-0
                  w-11
                  h-11
                  rounded-xl
                  border
                  border-[#a855f7]/30
                  bg-[#a855f7]/10
                  flex
                  items-center
                  justify-center
                  text-[#c084fc]
                "
              >
                <Store size={20} />
              </div>
            </div>

            {submitted ? (
              <div
                ref={successRef}
                className="
                  relative
                  z-10
                  rounded-[24px]
                  border
                  border-emerald-500/25
                  bg-emerald-500/[0.05]
                  p-6
                  sm:p-8
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

                <p
                  className="
                    mt-6
                    text-[8px]
                    font-mono
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-emerald-400
                  "
                >
                  Request received
                </p>

                <h3
                  className="
                    mt-3
                    text-2xl
                    sm:text-3xl
                    font-black
                    uppercase
                    tracking-tight
                  "
                >
                  Our team will contact you within 24 hours
                </h3>
                <div
  className="
    mx-auto
    mt-5
    max-w-md
    rounded-xl
    border
    border-purple-500/20
    bg-purple-500/[0.06]
    px-4
    py-3
    text-center
  "
>
  <p className="text-[8px] font-mono font-black uppercase tracking-[0.16em] text-purple-400">
    Returning to your profile
  </p>

  <p className="mt-2 text-sm font-bold text-white">
    Redirecting in {redirectSeconds} second
    {redirectSeconds === 1 ? "" : "s"}...
  </p>
</div>

                <p
                  className="
                    mx-auto
                    mt-4
                    max-w-xl
                    text-sm
                    leading-relaxed
                    text-gray-500
                  "
                >
                  Thank you,{" "}
                  <span className="font-bold text-white">
                    {formData.fullName}
                  </span>
                  . Your stall request for{" "}
                  <span className="font-bold text-white">
                    {selectedPackage.packageName}
                  </span>{" "}
                  has been submitted successfully. Our team will contact you
                  within 24 hours to confirm expo availability, stall details
                  and the ₹1,499 advance.
                </p>

                {bookingId && (
                  <div
                    className="
                      mx-auto
                      mt-5
                      max-w-md
                      rounded-xl
                      border
                      border-white/10
                      bg-black/20
                      px-4
                      py-3
                    "
                  >
                    <p className="text-[7px] font-mono uppercase tracking-widest text-gray-600">
                      Request ID
                    </p>

                    <p className="mt-1 break-all text-xs font-black text-white">
                      {bookingId}
                    </p>
                  </div>
                )}

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-3
                  "
                >
                  <a
                    href={`tel:+91${CONTACT_PHONE}`}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      px-5
                      py-4
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-white
                      transition
                      hover:bg-white/10
                    "
                  >
                    <Phone size={14} />
                    Call Our Team
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#a855f7]
                      px-5
                      py-4
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-white
                      transition
                      hover:bg-[#9333ea]
                    "
                  >
                    <MessageCircle size={14} />
                    WhatsApp Our Team
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleNewRequest}
                  className="
                    mt-4
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-gray-600
                    transition
                    hover:text-white
                  "
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                {/* BACKEND AUTO-FILL STATUS */}

                {profileLoading ? (
                  <div
                    className="
                      rounded-xl
                      border
                      border-purple-500/20
                      bg-purple-500/[0.06]
                      px-4
                      py-3
                      text-[9px]
                      font-mono
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-purple-300
                    "
                  >
                    Loading your verified profile details...
                  </div>
                ) : verifiedProfile ? (
                  <div
                    className="
                      rounded-xl
                      border
                      border-emerald-500/20
                      bg-emerald-500/[0.05]
                      px-4
                      py-3
                      text-[9px]
                      font-mono
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-emerald-300
                    "
                  >
                    ✓ Details auto-filled from your verified profile
                  </div>
                ) : null}

                {/* Brand */}

                <InputField
                  icon={<Store size={16} />}
                  label="Brand / Studio Name"
                >
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    placeholder="e.g. Inked Masters Studio"
                    className={inputClass}
                  />
                </InputField>

                {/* Name */}

                <InputField icon={<User size={16} />} label="Full Name">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </InputField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField icon={<Mail size={16} />} label="Email Address">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </InputField>

                  <InputField icon={<Phone size={16} />} label="Phone Number">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    icon={<MapPin size={16} />}
                    label="Preferred City"
                  >
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className={inputClass}
                    />
                  </InputField>

                  <InputField
                    icon={<CalendarDays size={16} />}
                    label="Stall Duration"
                  >
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none cursor-pointer [color-scheme:dark]`}
                    >
                      <option value="1" className="bg-[#0d0d12]">
                        1 Day Stall — ₹4,999
                      </option>

                      <option value="2" className="bg-[#0d0d12]">
                        2 Days Stall — ₹8,999
                      </option>

                      <option value="3" className="bg-[#0d0d12]">
                        3 Days Stall — ₹12,499
                      </option>
                    </select>
                  </InputField>
                </div>

                {/* REQUEST-FIRST FLOW */}

                <div
                  className="
                  mt-2
                  rounded-2xl
                  border
                  border-[#a855f7]/35
                  bg-[#a855f7]/[0.07]
                  p-5
                  sm:p-6
                "
                >
                  <div
                    className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                    gap-5
                  "
                  >
                    <div>
                      <p
                        className="
                        text-[8px]
                        font-mono
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-[#c084fc]
                      "
                      >
                        Submit first — pay after speaking with our team
                      </p>

                      <h3
                        className="
                        mt-2
                        text-lg
                        sm:text-xl
                        font-black
                        uppercase
                      "
                      >
                        Send your stall request
                      </h3>

                      <p
                        className="
                        mt-2
                        max-w-xl
                        text-xs
                        sm:text-sm
                        text-gray-500
                        leading-relaxed
                      "
                      >
                        No payment is taken on this page. Submit your details
                        and our team will call you to confirm availability,
                        explain your stall option and guide you through the
                        ₹1,499 advance.
                      </p>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="text-[8px] font-mono uppercase tracking-widest text-gray-600">
                        Advance after confirmation
                      </p>

                      <p className="mt-1 text-3xl font-black text-[#c084fc]">
                        ₹{ADVANCE_AMOUNT.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    className="
                    rounded-xl
                    border
                    border-red-500/30
                    bg-red-500/[0.07]
                    px-4
                    py-3
                    text-xs
                    text-red-300
                  "
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`
                  group
                  w-full
                  rounded-xl
                  px-6
                  py-4
                  flex
                  items-center
                  justify-center
                  gap-3
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  transition-all
                  duration-300

                  ${
                    loading
                      ? "cursor-not-allowed bg-[#a855f7]/40 text-white/60"
                      : "bg-[#a855f7] hover:bg-[#9333ea] text-white hover:-translate-y-0.5 shadow-[0_0_25px_rgba(168,85,247,0.22)]"
                  }
                `}
                >
                  {loading ? (
                    <>
                      <span
                        className="
                        h-4
                        w-4
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                        animate-spin
                      "
                      />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      Submit Stall Request
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <p
                  className="
                  text-center
                  text-[9px]
                  leading-relaxed
                  text-gray-600
                "
                >
                  By submitting, you&apos;re requesting a call from the Ink
                  Convention team. No payment is taken now.
                </p>
              </form>
            )}
          </section>

          {/* ===================================================
              RIGHT: STALL OPTIONS
          =================================================== */}

          <aside
            className="
              lg:col-span-5
              bg-[#0d0d11]
              border
              border-white/10
              rounded-[26px]
              p-5
              sm:p-7
              lg:p-8
              shadow-2xl
              h-fit
            "
          >
            <div className="mb-6 border-b border-white/10 pb-5">
              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-[#a855f7]/25
                  bg-[#a855f7]/10
                  px-3
                  py-1.5
                  text-[8px]
                  font-black
                  font-mono
                  uppercase
                  tracking-[0.15em]
                  text-[#c084fc]
                "
              >
                Exhibition Space
              </span>

              <h2
                className="
                  mt-4
                  text-2xl
                  sm:text-3xl
                  font-black
                  uppercase
                  tracking-tight
                "
              >
                Stall Options
              </h2>

              <p
                className="
                  mt-2
                  text-xs
                  text-gray-500
                  leading-relaxed
                "
              >
                Select the duration that fits your exhibition plans.
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(STALL_PACKAGES).map(([key, item]) => {
                const active = String(formData.duration) === String(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        duration: String(key),
                      }))
                    }
                    className={`
                      w-full
                      text-left
                      rounded-2xl
                      border
                      p-4
                      sm:p-5
                      transition-all
                      duration-300

                      ${
                        active
                          ? `
                              border-[#a855f7]/60
                              bg-[#a855f7]/10
                              shadow-[0_0_25px_rgba(168,85,247,0.10)]
                            `
                          : `
                              border-white/10
                              bg-white/[0.025]
                              hover:border-white/20
                              hover:bg-white/[0.045]
                            `
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <div>
                        <span
                          className={`
                            block
                            text-sm
                            sm:text-base
                            font-black
                            uppercase

                            ${active ? "text-white" : "text-gray-300"}
                          `}
                        >
                          {item.packageName}
                        </span>

                        <span
                          className="
                            mt-1
                            block
                            text-[10px]
                            sm:text-xs
                            text-gray-600
                          "
                        >
                          {item.description}
                        </span>
                      </div>

                      <span
                        className={`
                          shrink-0
                          text-lg
                          sm:text-xl
                          font-black

                          ${active ? "text-[#c084fc]" : "text-gray-400"}
                        `}
                      >
                        ₹{item.packagePrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-5
              "
            >
              <p
                className="
                  text-[8px]
                  font-mono
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-gray-600
                "
              >
                Selected
              </p>

              <div
                className="
                  mt-2
                  flex
                  items-end
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p className="text-sm font-black uppercase text-white">
                    {selectedPackage.packageName}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-600">
                    Final availability confirmed by our team.
                  </p>
                </div>

                <p className="text-2xl font-black text-[#c084fc]">
                  ₹{selectedPackage.packagePrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </aside>
        </main>

        {/* =====================================================
            CONTACT — MAIN USER FOCUS
        ===================================================== */}

        <section
          className="
            mt-6
            relative
            overflow-hidden
            rounded-[28px]
            sm:rounded-[32px]
            border
            border-[#a855f7]/25
            bg-[#0d0d11]
            p-5
            sm:p-8
            lg:p-10
          "
        >
          <div
            className="
              absolute
              -top-28
              left-1/2
              -translate-x-1/2
              w-72
              h-72
              rounded-full
              bg-[#a855f7]/10
              blur-[90px]
              pointer-events-none
            "
          />

          <div className="relative z-10 text-center">
            <p
              className="
                text-[9px]
                sm:text-[10px]
                font-black
                font-mono
                uppercase
                tracking-[0.25em]
                text-[#a855f7]
              "
            >
              Ready to book?
            </p>

            <h2
              className="
                mt-3
                text-3xl
                sm:text-5xl
                lg:text-6xl
                font-black
                uppercase
                tracking-[-0.04em]
              "
            >
              Get in touch with us
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                sm:text-base
                text-gray-500
                leading-relaxed
              "
            >
              After submitting your request, our team will contact you. If you
              want faster assistance, you can also call, WhatsApp or email us
              directly about your stall request.
            </p>

            {/* ARROW FOCUS */}

            <div className="mt-7 flex justify-center">
              <div
                className="
                  inline-flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-[#a855f7]/20
                  bg-[#a855f7]/[0.06]
                  px-4
                  py-2
                  text-[#a855f7]
                "
              >
                <ArrowDown size={16} className="animate-bounce" />

                <span
                  className="
                    text-[8px]
                    font-black
                    font-mono
                    uppercase
                    tracking-[0.18em]
                  "
                >
                  Choose a contact option
                </span>

                <ArrowDown size={16} className="animate-bounce" />
              </div>
            </div>
          </div>

          <div
            className="
              relative
              z-10
              mt-6
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            "
          >
            {/* CALL */}

            <a href={`tel:+91${CONTACT_PHONE}`} className={contactCardClass}>
              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-[#a855f7]
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-[0_0_30px_rgba(168,85,247,0.22)]
                "
              >
                <Phone size={20} />
              </div>

              <p className={contactLabelClass}>Mobile</p>

              <h3 className="mt-2 text-2xl sm:text-3xl font-black">
                {CONTACT_PHONE}
              </h3>

              <p className={contactDescriptionClass}>
                Call our team directly for stall availability and booking help.
              </p>

              <span className={contactActionClass}>
                Call now
                <ArrowRight size={14} />
              </span>
            </a>

            {/* WHATSAPP */}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                ${contactCardClass}
                border-[#a855f7]/40
                bg-gradient-to-b
                from-[#a855f7]/10
                to-[#08080a]
              `}
            >
              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-[#a855f7]
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-[0_0_30px_rgba(168,85,247,0.26)]
                "
              >
                <MessageCircle size={21} />
              </div>

              <p className={`${contactLabelClass} text-[#c084fc]`}>
                Fastest option
              </p>

              <h3 className="mt-2 text-2xl sm:text-3xl font-black">
                WhatsApp Us
              </h3>

              <p className={contactDescriptionClass}>
                Your stall details and ₹1,499 advance-payment request are
                automatically added to the message.
              </p>

              <span className={contactActionClass}>
                Start chat
                <ArrowRight size={14} />
              </span>
            </a>

            {/* EMAIL */}

            <a href={emailUrl} className={contactCardClass}>
              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  border
                  border-[#a855f7]/30
                  bg-[#a855f7]/10
                  flex
                  items-center
                  justify-center
                  text-[#c084fc]
                "
              >
                <Mail size={20} />
              </div>

              <p className={contactLabelClass}>Email</p>

              <h3
                className="
                  mt-2
                  break-all
                  text-lg
                  sm:text-xl
                  lg:text-[22px]
                  font-black
                "
              >
                {CONTACT_EMAIL}
              </h3>

              <p className={contactDescriptionClass}>
                Send your enquiry and our team can reply with complete details.
              </p>

              <span className={contactActionClass}>
                Send email
                <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </section>

        {/* =====================================================
            ABOUT + HOW IT WORKS
        ===================================================== */}

        <section
          className="
            mt-6
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >
          {/* ABOUT */}

          <div
            className="
              rounded-[26px]
              border
              border-white/10
              bg-[#0d0d11]
              p-6
              sm:p-8
            "
          >
            <p
              className="
                text-[8px]
                font-mono
                font-black
                uppercase
                tracking-[0.20em]
                text-[#a855f7]
              "
            >
              About stall booking
            </p>

            <h2
              className="
                mt-3
                text-2xl
                sm:text-3xl
                font-black
                uppercase
                tracking-tight
              "
            >
              Showcase your work at Ink Convention.
            </h2>

            <p
              className="
                mt-4
                text-sm
                text-gray-500
                leading-relaxed
              "
            >
              Submit a stall request first. After our team confirms availability
              and the ₹1,499 advance is completed, your stall gives tattoo
              studios, artists and industry brands a dedicated exhibition space
              to meet visitors, showcase portfolios, promote services and
              connect with the wider tattoo community.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <InfoBadge icon={<Store size={13} />} text="Exhibition Space" />
              <InfoBadge icon={<Users size={13} />} text="Meet The Community" />
              <InfoBadge icon={<MapPin size={13} />} text="Regional Expos" />
            </div>
          </div>

          {/* NEXT STEPS */}

          <div
            className="
              rounded-[26px]
              border
              border-white/10
              bg-[#0d0d11]
              p-6
              sm:p-8
            "
          >
            <p
              className="
                text-[8px]
                font-mono
                font-black
                uppercase
                tracking-[0.20em]
                text-[#a855f7]
              "
            >
              What happens next
            </p>

            <div
              className="
                mt-5
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-3
              "
            >
              <BookingStep
                number="01"
                icon={<Store size={17} />}
                title="Submit Request"
                text="Send your studio and stall details."
              />

              <BookingStep
                number="02"
                icon={<Phone size={17} />}
                title="Team Calls You"
                text="We confirm availability, city and stall option."
              />

              <BookingStep
                number="03"
                icon={<CheckCircle2 size={17} />}
                title="Confirm Booking"
                text="Pay ₹1,499 advance after speaking with our team."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function InputField({ icon, label, children }) {
  return (
    <div>
      <label
        className="
          mb-2
          flex
          items-center
          gap-2
          text-[8px]
          sm:text-[9px]
          font-black
          uppercase
          tracking-[0.14em]
          text-gray-500
        "
      >
        <span className="text-[#a855f7]">{icon}</span>
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoBadge({ icon, text }) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-black/20
        px-3
        py-2
        text-[8px]
        sm:text-[9px]
        font-black
        uppercase
        tracking-wider
        text-gray-400
      "
    >
      <span className="text-[#a855f7]">{icon}</span>
      {text}
    </div>
  );
}

function BookingStep({ number, icon, title, text }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-black/20
        p-4
      "
    >
      <div className="flex items-center justify-between">
        <div
          className="
            w-9
            h-9
            rounded-xl
            bg-[#a855f7]/10
            flex
            items-center
            justify-center
            text-[#c084fc]
          "
        >
          {icon}
        </div>

        <span
          className="
            text-[8px]
            font-mono
            font-black
            tracking-[0.16em]
            text-gray-700
          "
        >
          {number}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-black uppercase">{title}</h3>

      <p className="mt-2 text-xs text-gray-500 leading-relaxed">{text}</p>
    </div>
  );
}

/* =========================================================
   CLASSES
========================================================= */

const inputClass = `
  w-full
  bg-[#0d0d12]
  border
  border-[#2a2a35]
  rounded-xl
  py-3.5
  px-4
  text-sm
  text-white
  placeholder:text-gray-700
  focus:border-[#a855f7]
  focus:ring-2
  focus:ring-[#a855f7]/20
  outline-none
  transition-all
`;

const contactCardClass = `
  group
  rounded-[22px]
  border
  border-white/10
  bg-[#08080a]
  p-5
  sm:p-6
  text-left
  transition-all
  duration-300
  hover:-translate-y-1
  hover:border-[#a855f7]/50
  hover:bg-[#a855f7]/[0.04]
`;

const contactLabelClass = `
  mt-6
  text-[8px]
  font-mono
  font-black
  uppercase
  tracking-[0.18em]
  text-gray-600
`;

const contactDescriptionClass = `
  mt-3
  text-xs
  sm:text-sm
  text-gray-500
  leading-relaxed
`;

const contactActionClass = `
  mt-5
  inline-flex
  items-center
  gap-2
  text-[9px]
  font-black
  uppercase
  tracking-[0.14em]
  text-[#c084fc]
  transition
  group-hover:gap-3
`;
