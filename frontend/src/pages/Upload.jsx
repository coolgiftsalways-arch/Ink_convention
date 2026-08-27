import React, { useState } from "react";

import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Globe,
  Layers,
  Scale,
  Trophy,
  ChevronRight,
  ChevronLeft,
  CheckSquare,
  CreditCard,
  Target,
} from "lucide-react";

import { Link } from "react-router-dom";

import "../Style/Home.css";



const CATEGORIES = [
  "Black & Grey",
  "Realism",
  "Colour",
  "Fine Line",
  "Traditional",
  "Neo-Traditional",
  "Japanese",
  "Ornamental",
  "Cover-Up",
  "Small Tattoo",
  "Large Tattoo",
  "Experimental / Freehand",
];

/* =====================================================
   ENTRY PACKAGES
===================================================== */

const PACKAGES = [
  {
    id: "single",
    name: "SINGLE ENTRY",
    price: "499",
    subs: "1 competition submission",
    details:
      "1 category\nDigital participation certificate if eligible",
  },
  {
    id: "pro",
    name: "PROFESSIONAL BUNDLE",
    price: "1299",
    subs: "3 submissions",
    details:
      "Up to 3 categories\nArtist profile\nRanking eligibility",
  },
  {
    id: "multi",
    name: "MULTI-ENTRY BUNDLE",
    price: "1999",
    subs: "5 submissions",
    details:
      "Multiple eligible categories\nEnhanced artist profile benefits",
  },
];

/* =====================================================
   UPLOAD COMPONENT
===================================================== */

function Upload() {
  const [step, setStep] = useState(1);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [entryId, setEntryId] =
    useState(null);

  /* ===================================================
     FORM DATA
  =================================================== */

  const [formData, setFormData] = useState({
    category: "",
    entryPackage: "",

    firstName: "",
    lastName: "",
    professionalName: "",

    gmail: "",
    phone: "",

    instagram: "",
    studio: "",

    city: "",
    state: "",
    country: "India",

    primaryStyle: "",
    experience: "",

    tattooTitle: "",
    description: "",
    placement: "",
    size: "",

    isOriginal: "",

    declarationOriginal: false,
    declarationConsent: false,
    termsAccepted: false,
  });

  /* ===================================================
     FILES
  =================================================== */

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  /* ===================================================
     FORM CHANGE
  =================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* ===================================================
     IMAGE UPLOAD
  =================================================== */

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files
    );

    if (files.length > 5) {
      alert(
        "You can upload a maximum of 5 images."
      );

      return;
    }

    setImages(files);
  };

  /* ===================================================
     VIDEO UPLOAD
  =================================================== */

  const handleVideoChange = (e) => {
    const files = Array.from(
      e.target.files
    );

    if (files.length > 3) {
      alert(
        "You can upload a maximum of 3 videos."
      );

      return;
    }

    setVideos(files);
  };

  /* ===================================================
     VALIDATE CURRENT STEP
  =================================================== */

  const validateStep = () => {
    /* -----------------------------------------------
       STEP 1
    ------------------------------------------------ */

    if (
      step === 1 &&
      (
        !formData.category ||
        !formData.entryPackage
      )
    ) {
      alert(
        "Please select a category and entry package."
      );

      return false;
    }

    /* -----------------------------------------------
       STEP 2
    ------------------------------------------------ */

    if (
      step === 2 &&
      (
        !formData.firstName ||
        !formData.lastName ||
        !formData.gmail ||
        !formData.phone ||
        !formData.city
      )
    ) {
      alert(
        "Fill out required artist fields."
      );

      return false;
    }

    /* -----------------------------------------------
       STEP 3
    ------------------------------------------------ */

    if (
      step === 3 &&
      !formData.description
    ) {
      alert(
        "Provide a short description."
      );

      return false;
    }

    /* -----------------------------------------------
       STEP 4
    ------------------------------------------------ */

    if (
      step === 4 &&
      (
        images.length === 0 ||
        !formData.declarationOriginal ||
        !formData.declarationConsent ||
        !formData.termsAccepted
      )
    ) {
      alert(
        "Please upload at least 1 image and check all terms."
      );

      return false;
    }

    return true;
  };

  /* ===================================================
     NEXT STEP
  =================================================== */

  const nextStep = () => {
    if (validateStep()) {
      setStep((previous) => previous + 1);

      window.scrollTo(0, 0);
    }
  };

  /* ===================================================
     PREVIOUS STEP
  =================================================== */

  const prevStep = () => {
    setStep((previous) => previous - 1);

    window.scrollTo(0, 0);
  };

  /* ===================================================
     PAYMENT
  =================================================== */

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);

    try {
      const selectedPackage =
        PACKAGES.find(
          (pkg) =>
            pkg.id ===
            formData.entryPackage
        );

      if (!selectedPackage) {
        throw new Error(
          "Please select an entry package."
        );
      }

      /* =============================================
         STEP 1:
         CREATE RAZORPAY ORDER
      ============================================= */

      const orderResponse =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              amount:
                Number(
                  selectedPackage.price
                ),

              packageId:
                formData.entryPackage,

              email:
                formData.gmail,

              phone:
                formData.phone,

              name:
                `${formData.firstName} ${formData.lastName}`,
            }),
          }
        );

      const orderData =
        await orderResponse.json();

      if (!orderData.success) {
        throw new Error(
          orderData.message ||
            "Unable to create payment order."
        );
      }

      /* =============================================
         CHECK RAZORPAY
      ============================================= */

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page."
        );
      }

      /* =============================================
         RAZORPAY OPTIONS
      ============================================= */

      const options = {
        key: orderData.key,

        amount:
          orderData.amount,

        currency:
          orderData.currency,

        name:
          "INK CONVENTION 2026",

        description:
          `${selectedPackage.name} - Competition Entry`,

        order_id:
          orderData.orderId,

        prefill: {
          name:
            `${formData.firstName} ${formData.lastName}`,

          email:
            formData.gmail,

          contact:
            formData.phone,
        },

        notes: {
          category:
            formData.category,

          package:
            selectedPackage.name,
        },

        theme: {
          color: "#a855f7",
        },

        handler: async function (paymentResponse) {
          try {
            // STEP 3: Verify payment on backend
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,

                  razorpay_payment_id: paymentResponse.razorpay_payment_id,

                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              },
            );

              const verifyData =
                await verifyResponse.json();

              if (!verifyData.success) {
                throw new Error(
                  verifyData.message ||
                    "Payment verification failed."
                );
              }

              /* =====================================
                 PAYMENT VERIFIED
                 CREATE FORM DATA
              ====================================== */

              const data =
                new FormData();

              Object.keys(
                formData
              ).forEach((key) => {
                data.append(
                  key,
                  formData[key]
                );
              });

              /* =====================================
                 IMAGES
              ====================================== */

              images.forEach((img) => {
                data.append(
                  "images",
                  img
                );
              });

              /* =====================================
                 VIDEOS
              ====================================== */

            videos.forEach((vid) => {
              data.append("videos", vid);
            });

            // Store Razorpay payment details with the submission
            data.append("razorpay_order_id", paymentResponse.razorpay_order_id);

            data.append(
              "razorpay_payment_id",
              paymentResponse.razorpay_payment_id,
            );

              /* =====================================
                 SUBMIT ENTRY
              ====================================== */

              const submitResponse =
                await fetch(
                  `${import.meta.env.VITE_API_URL}/api/signup`,
                  {
                    method: "POST",

                    body: data,
                  }
                );

              const result =
                await submitResponse.json();

            if (!result.success) {
              throw new Error(result.message || "Entry submission failed.");
            }

            // STEP 5: Show successful entry
            setEntryId(result.entryId);
            setStep(6);
            window.scrollTo(0, 0);
          } catch (error) {
            console.error("Post-payment submission error:", error);

            alert(
              "Payment was successful, but entry submission failed. Please contact support with your payment ID.",
            );
          } finally {
            setIsProcessing(false);
          }
        },

        /* =========================================
           PAYMENT DISMISSED
        ========================================== */

        modal: {
          ondismiss:
            function () {
              setIsProcessing(
                false
              );
            },
        },
      };

      /* =============================================
         OPEN RAZORPAY
      ============================================= */

      const razorpay =
        new window.Razorpay(
          options
        );

      /* =============================================
         PAYMENT FAILED
      ============================================= */

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);

        alert(
          response.error?.description || "Payment failed. Please try again.",
        );

        setIsProcessing(false);
      });

      razorpay.open();

    } catch (error) {
      console.error("Payment initialization error:", error);

      alert(error.message || "Unable to start payment. Please try again.");

      setIsProcessing(false);
    }
  };

  /* ===================================================
     STEP 1 COMPLETION
  =================================================== */

  const competitionComplete =
    Boolean(
      formData.category &&
      formData.entryPackage
    );

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div
      className="
        w-full
        min-h-screen
        bg-[#08080a]
        text-white
        select-none
        pt-24
        pb-32
        px-4
        sm:px-6
        lg:px-12
        overflow-x-hidden
        font-sans
      "
    >

      <div
        className="
          max-w-4xl
          mx-auto
          w-full
        "
      >

        {/* =================================================
            HEADER + PROGRESS
        ================================================= */}

        {step < 6 && (
          <div
            className="
              space-y-8
              mb-12
            "
          >

            {/* =============================================
                HERO
            ============================================== */}

            <div
              className="
                text-center
                space-y-4
              "
            >

              <h4
                className="
                  text-[#a855f7]
                  font-mono
                  text-xs
                  sm:text-sm
                  tracking-[0.3em]
                  uppercase
                  font-semibold
                  flex
                  items-center
                  justify-center
                  gap-3
                "
              >

                <span
                  className="
                    w-6
                    h-[1px]
                    bg-[#a855f7]
                  "
                />

                // INK CONVENTION 2026 — ARTIST ENTRY

                <span
                  className="
                    w-6
                    h-[1px]
                    bg-[#a855f7]
                  "
                />

              </h4>

              <h1
                className="
                  text-4xl
                  sm:text-5xl
                  md:text-6xl
                  font-black
                  tracking-tight
                  text-white
                  uppercase
                  leading-[1.1]
                "
              >
                ENTER INK CONVENTION 2026
                <span className="text-[#a855f7]">
                  .
                </span>
              </h1>

              <p
                className="
                  text-gray-400
                  text-sm
                  sm:text-base
                  font-light
                  leading-relaxed
                  max-w-2xl
                  mx-auto
                "
              >
                Choose your category, submit your
                best work and compete for professional
                recognition, awards and ranking points.
              </p>

            </div>

            {/* =============================================
                COMPETITION SUMMARY
            ============================================== */}

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-4
                bg-[#0b0b0f]
                border
                border-white/5
                rounded-2xl
                p-6
              "
            >

              {/* ONLINE */}

              <div
                className="
                  text-center
                  space-y-1
                "
              >

                <Globe
                  size={18}
                  className="
                    mx-auto
                    text-[#a855f7]
                    mb-2
                  "
                />

                <h4
                  className="
                    text-[10px]
                    font-bold
                    text-white
                    uppercase
                    tracking-widest
                  "
                >
                  ONLINE COMPETITION
                </h4>

                <p
                  className="
                    text-[9px]
                    text-gray-500
                    font-mono
                    uppercase
                  "
                >
                  100% Digital Entry
                </p>

              </div>

              {/* CATEGORIES */}

              <div
                className="
                  text-center
                  space-y-1
                "
              >

                <Layers
                  size={18}
                  className="
                    mx-auto
                    text-[#a855f7]
                    mb-2
                  "
                />

                <h4
                  className="
                    text-[10px]
                    font-bold
                    text-white
                    uppercase
                    tracking-widest
                  "
                >
                  MULTIPLE CATEGORIES
                </h4>

                <p
                  className="
                    text-[9px]
                    text-gray-500
                    font-mono
                    uppercase
                  "
                >
                  Choose Your Style
                </p>

              </div>

              {/* JUDGING */}

              <div
                className="
                  text-center
                  space-y-1
                "
              >

                <Scale
                  size={18}
                  className="
                    mx-auto
                    text-[#a855f7]
                    mb-2
                  "
                />

                <h4
                  className="
                    text-[10px]
                    font-bold
                    text-white
                    uppercase
                    tracking-widest
                  "
                >
                  PROFESSIONAL JUDGING
                </h4>

                <p
                  className="
                    text-[9px]
                    text-gray-500
                    font-mono
                    uppercase
                  "
                >
                  Published Criteria
                </p>

              </div>

              {/* RANKING */}

              <div
                className="
                  text-center
                  space-y-1
                "
              >

                <Trophy
                  size={18}
                  className="
                    mx-auto
                    text-[#a855f7]
                    mb-2
                  "
                />

                <h4
                  className="
                    text-[10px]
                    font-bold
                    text-white
                    uppercase
                    tracking-widest
                  "
                >
                  ARTIST RANKING
                </h4>

                <p
                  className="
                    text-[9px]
                    text-gray-500
                    font-mono
                    uppercase
                  "
                >
                  Results Earn Points
                </p>

              </div>

            </div>

            {/* =============================================
                STEP INDICATOR
            ============================================== */}

            <div
              className="
                flex
                flex-wrap
                justify-center
                items-center
                gap-2
                sm:gap-4
                pt-4
              "
            >

              {[
                {
                  s: 1,
                  label: "Competition",
                },
                {
                  s: 2,
                  label: "Artist",
                },
                {
                  s: 3,
                  label: "Tattoo",
                },
                {
                  s: 4,
                  label: "Upload",
                },
                {
                  s: 5,
                  label: "Review",
                },
              ].map(
                (item, idx) => {

                  /*
                    Competition is only complete when
                    BOTH category and package are selected.
                  */

                  const isCompleted =
                    item.s === 1
                      ? competitionComplete
                      : step > item.s;

                  const isActive =
                    step === item.s;

                  /*
                    Once category + package are selected,
                    Artist becomes the next highlighted step.
                  */

                  const isNextReady =
                    item.s === 2 &&
                    competitionComplete &&
                    step === 1;

                  return (
                    <React.Fragment
                      key={item.s}
                    >

                      <div
                        className={`
                          flex
                          items-center
                          gap-2
                          text-xs
                          font-mono
                          tracking-widest
                          uppercase
                          transition-all
                          duration-500

                          ${
                            isCompleted
                              ? "text-[#a855f7] font-bold"
                              : isActive
                              ? "text-[#a855f7] font-bold"
                              : isNextReady
                              ? "text-[#c084fc] font-bold"
                              : "text-gray-600"
                          }
                        `}
                      >

                        <span
                          className={`
                            w-6
                            h-6
                            rounded-full
                            flex
                            items-center
                            justify-center
                            border
                            transition-all
                            duration-500

                            ${
                              isCompleted
                                ? "border-[#a855f7] bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                : isActive
                                ? "border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]"
                                : isNextReady
                                ? "border-[#c084fc] bg-[#a855f7]/10 text-[#c084fc] shadow-[0_0_18px_rgba(168,85,247,0.25)] scale-110"
                                : "border-gray-700 text-gray-600"
                            }
                          `}
                        >

                          {isCompleted ? (
                            <CheckCircle2
                              size={13}
                            />
                          ) : (
                            item.s
                          )}

                        </span>

                        <span
                          className={`
                            hidden
                            sm:inline
                            transition-all
                            duration-500

                            ${
                              isNextReady
                                ? "text-[#c084fc]"
                                : ""
                            }
                          `}
                        >
                          {item.label}
                        </span>

                      </div>

                      {idx < 4 && (
                        <ChevronRight
                          size={14}
                          className={`
                            transition-colors
                            duration-500

                            ${
                              isCompleted
                                ? "text-[#a855f7]"
                                : isNextReady &&
                                  item.s === 1
                                ? "text-[#c084fc]"
                                : "text-gray-700"
                            }
                          `}
                        />
                      )}

                    </React.Fragment>
                  );
                }
              )}

            </div>

          </div>
        )}

        {/* =================================================
            STEP 1 — COMPETITION
        ================================================= */}

        {step === 1 && (
          <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                CHOOSE YOUR CATEGORY
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${formData.category === cat ? "bg-[#a855f7]/20 border-[#a855f7]" : "bg-[#0b0b0f] border-white/5 hover:border-white/20"}`}
                  >
                    <h4
                      className={`font-bold ${formData.category === cat ? "text-[#a855f7]" : "text-white"}`}
                    >
                      {cat}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      Professional Category
                    </p>
                  </div>
                ))}
              </div>

            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                SELECT ENTRY PACKAGE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() =>
                      setFormData({ ...formData, entryPackage: pkg.id })
                    }
                    className={`p-6 rounded-2xl border relative cursor-pointer transition-all duration-300 flex flex-col ${formData.entryPackage === pkg.id ? "bg-gradient-to-b from-[#140a24] to-[#0b0b0f] border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.15)]" : "bg-[#0b0b0f] border-white/5 hover:border-white/20"}`}
                  >
                    {formData.entryPackage === pkg.id && (
                      <div className="absolute top-4 right-4 text-[#a855f7]">
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-white tracking-widest">
                      {pkg.name}
                    </h4>
                    <p className="text-2xl font-black text-[#a855f7] mt-2 mb-4">
                      ₹{pkg.price}
                    </p>
                    <p className="text-sm font-semibold text-gray-300 mb-4">
                      {pkg.subs}
                    </p>
                    <p className="text-xs text-gray-500 whitespace-pre-line font-mono mt-auto pt-4 border-t border-white/5">
                      {pkg.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

             

          
        {/* =================================================
            STEP 2 — ARTIST PROFILE
        ================================================= */}

        {step === 2 && (
          <div
            className="
              space-y-8
              animate-fade-in
            "
          >

            <h2
              className="
                text-2xl
                font-black
                text-white
                uppercase
                tracking-tight
              "
            >
              YOUR ARTIST PROFILE
              <span className="text-[#a855f7]">
                .
              </span>
            </h2>

            <div
              className="
                bg-[#0b0b0f]
                border
                border-white/10
                rounded-3xl
                p-6
                sm:p-10
                space-y-6
              "
            >

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-6
                "
              >

                {/* FIRST NAME */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-mono
                      text-gray-400
                      uppercase
                      tracking-widest
                    "
                  >
                    FIRST NAME *
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={
                      formData.firstName
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="Enter your first name"
                    className="
                      w-full
                      bg-black/50
                      border
                      border-white/10
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      text-sm
                      placeholder:text-gray-700
                      focus:outline-none
                      focus:border-[#a855f7]
                      focus:ring-1
                      focus:ring-[#a855f7]/20
                      transition
                    "
                  />

                </div>

                {/* LAST NAME */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-mono
                      text-gray-400
                      uppercase
                      tracking-widest
                    "
                  >
                    LAST NAME *
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={
                      formData.lastName
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="Enter your last name"
                    className="
                      w-full
                      bg-black/50
                      border
                      border-white/10
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      text-sm
                      placeholder:text-gray-700
                      focus:outline-none
                      focus:border-[#a855f7]
                      focus:ring-1
                      focus:ring-[#a855f7]/20
                      transition
                    "
                  />

                </div>

                {/* EMAIL */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-mono
                      text-gray-400
                      uppercase
                      tracking-widest
                    "
                  >
                    EMAIL ADDRESS *
                  </label>

                  <input
                    type="email"
                    name="gmail"
                    value={
                      formData.gmail
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="yourname@gmail.com"
                    className="
                      w-full
                      bg-black/50
                      border
                      border-white/10
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      text-sm
                      placeholder:text-gray-700
                      focus:outline-none
                      focus:border-[#a855f7]
                      focus:ring-1
                      focus:ring-[#a855f7]/20
                      transition
                    "
                  />

                </div>

                {/* PHONE */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-mono
                      text-gray-400
                      uppercase
                      tracking-widest
                    "
                  >
                    PHONE / WHATSAPP *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="Enter phone number"
                    className="
                      w-full
                      bg-black/50
                      border
                      border-white/10
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      text-sm
                      placeholder:text-gray-700
                      focus:outline-none
                      focus:border-[#a855f7]
                      focus:ring-1
                      focus:ring-[#a855f7]/20
                      transition
                    "
                  />

                </div>

                {/* CITY */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-mono
                      text-gray-400
                      uppercase
                      tracking-widest
                    "
                  >
                    CITY *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="Enter your city"
                    className="
                      w-full
                      bg-black/50
                      border
                      border-white/10
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      text-sm
                      placeholder:text-gray-700
                      focus:outline-none
                      focus:border-[#a855f7]
                      focus:ring-1
                      focus:ring-[#a855f7]/20
                      transition
                    "
                  />

                </div>

                {/* STATE */}

                <div className="space-y-2">

                  <label
                    className="
                      text-xs
                      font-mono
                      text-gray-400
                      uppercase
                      tracking-widest
                    "
                  >
                    STATE / REGION
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter your state"
                    className="
                      w-full
                      bg-black/50
                      border
                      border-white/10
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      text-sm
                      placeholder:text-gray-700
                      focus:outline-none
                      focus:border-[#a855f7]
                      focus:ring-1
                      focus:ring-[#a855f7]/20
                      transition
                    "
                  />

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            STEP 3 — TATTOO
        ================================================= */}

        {step === 3 && (
          <div
            className="
              space-y-8
              animate-fade-in
            "
          >

            <h2
              className="
                text-2xl
                font-black
                text-white
                uppercase
                tracking-tight
              "
            >
              YOUR COMPETITION ENTRY
              <span className="text-[#a855f7]">
                .
              </span>
            </h2>

            <div
              className="
                bg-[#0b0b0f]
                border
                border-white/10
                rounded-3xl
                p-6
                sm:p-10
                space-y-6
              "
            >

              {/* TITLE */}

              <div className="space-y-2">

                <label
                  className="
                    text-xs
                    font-mono
                    text-gray-400
                    uppercase
                    tracking-widest
                  "
                >
                  TATTOO TITLE (OPTIONAL)
                </label>

                <input
                  type="text"
                  name="tattooTitle"
                  placeholder='"Lotus in Motion"'
                  value={
                    formData.tattooTitle
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    w-full
                    bg-black/50
                    border
                    border-white/10
                    rounded-xl
                    px-4
                    py-3
                    text-white
                    text-sm
                    placeholder:text-gray-700
                    focus:outline-none
                    focus:border-[#a855f7]
                    focus:ring-1
                    focus:ring-[#a855f7]/20
                    transition
                  "
                />

              </div>

              {/* DESCRIPTION */}

              <div className="space-y-2">

                <label
                  className="
                    text-xs
                    font-mono
                    text-gray-400
                    uppercase
                    tracking-widest
                  "
                >
                  TATTOO DESCRIPTION *
                </label>

                <textarea
                  name="description"
                  required
                  rows="5"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Tell the judges about the concept, inspiration and execution..."
                  className="
                    w-full
                    bg-black/50
                    border
                    border-white/10
                    rounded-xl
                    px-4
                    py-3
                    text-white
                    text-sm
                    placeholder:text-gray-700
                    focus:outline-none
                    focus:border-[#a855f7]
                    focus:ring-1
                    focus:ring-[#a855f7]/20
                    resize-none
                    transition
                  "
                />

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            STEP 4 — UPLOAD
        ================================================= */}

        {step === 4 && (
          <div
            className="
              space-y-8
              animate-fade-in
            "
          >

            <h2
              className="
                text-2xl
                font-black
                text-white
                uppercase
                tracking-tight
              "
            >
              UPLOAD YOUR TATTOO
              <span className="text-[#a855f7]">
                .
              </span>
            </h2>

            <div
              className="
                bg-[#0b0b0f]
                border
                border-white/10
                rounded-3xl
                p-6
                sm:p-10
                space-y-8
              "
            >

              {/* FILE UPLOADS */}

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-8
                  border-b
                  border-white/10
                  pb-8
                "
              >

                {/* IMAGES */}

                <div className="space-y-3">

                  <label
                    className="
                      text-sm
                      font-bold
                      text-white
                      uppercase
                      tracking-widest
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <ImageIcon
                      size={16}
                      className="text-[#a855f7]"
                    />

                    IMAGES
                    (REQUIRED)

                  </label>

                  <p
                    className="
                      text-xs
                      text-gray-500
                      font-mono
                    "
                  >
                    1 to 5 photos max.
                    JPG, PNG, WEBP.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleImageChange
                    }
                    className="
                      w-full
                      text-xs
                      text-gray-400
                      file:mr-4
                      file:py-2
                      file:px-4
                      file:rounded-xl
                      file:border-0
                      file:text-xs
                      file:font-bold
                      file:bg-[#a855f7]
                      file:text-white
                      cursor-pointer
                    "
                  />

                  <p
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    {images.length} files selected
                  </p>

                </div>

                {/* VIDEOS */}

                <div className="space-y-3">

                  <label
                    className="
                      text-sm
                      font-bold
                      text-white
                      uppercase
                      tracking-widest
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Video
                      size={16}
                      className="text-[#a855f7]"
                    />

                    VIDEOS
                    (OPTIONAL)

                  </label>

                  <p
                    className="
                      text-xs
                      text-gray-500
                      font-mono
                    "
                  >
                    Optional process video.
                    1 to 3 max. MP4, MOV.
                  </p>

                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={
                      handleVideoChange
                    }
                    className="
                      w-full
                      text-xs
                      text-gray-400
                      file:mr-4
                      file:py-2
                      file:px-4
                      file:rounded-xl
                      file:border-0
                      file:text-xs
                      file:font-bold
                      file:bg-[#a855f7]
                      file:text-white
                      cursor-pointer
                    "
                  />

                  <p
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    {videos.length} files selected
                  </p>

                </div>

              </div>

              {/* DECLARATIONS */}

              <div
                className="
                  space-y-4
                  pt-2
                "
              >

                <h3
                  className="
                    text-lg
                    font-bold
                    text-white
                    uppercase
                    tracking-widest
                  "
                >
                  DECLARATIONS
                </h3>

                {/* ORIGINAL */}

                <label
                  className="
                    flex
                    items-start
                    gap-4
                    cursor-pointer
                  "
                >

                  <input
                    type="checkbox"
                    name="declarationOriginal"
                    checked={
                      formData.declarationOriginal
                    }
                    onChange={
                      handleChange
                    }
                    className="mt-1"
                  />

                  <span
                    className="
                      text-sm
                      text-gray-300
                      font-light
                    "
                  >
                    I confirm that this tattoo is my
                    original work and that I have the
                    right to submit.
                  </span>

                </label>

                {/* PHOTO CONSENT */}

                <label
                  className="
                    flex
                    items-start
                    gap-4
                    cursor-pointer
                  "
                >

                  <input
                    type="checkbox"
                    name="declarationConsent"
                    checked={
                      formData.declarationConsent
                    }
                    onChange={
                      handleChange
                    }
                    className="mt-1"
                  />

                  <span
                    className="
                      text-sm
                      text-gray-300
                      font-light
                    "
                  >
                    I confirm that I have the necessary
                    permission to submit photographs.
                  </span>

                </label>

                {/* TERMS */}

                <label
                  className="
                    flex
                    items-start
                    gap-4
                    cursor-pointer
                  "
                >

                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={
                      formData.termsAccepted
                    }
                    onChange={
                      handleChange
                    }
                    className="mt-1"
                  />

                  <span
                    className="
                      text-sm
                      text-gray-300
                      font-light
                    "
                  >
                    I agree to the competition rules,
                    terms & conditions and privacy policy.
                  </span>

                </label>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            STEP 5 — REVIEW
        ================================================= */}

        {step === 5 && (
          <div
            className="
              space-y-8
              animate-fade-in
              max-w-2xl
              mx-auto
              bg-[#0b0b0f]
              border
              border-[#a855f7]/30
              rounded-3xl
              p-8
              sm:p-12
              shadow-[0_0_60px_rgba(168,85,247,0.08)]
            "
          >

            <div className="text-center">

              <p
                className="
                  text-[#a855f7]
                  text-[10px]
                  font-mono
                  uppercase
                  tracking-[0.3em]
                  mb-3
                "
              >
                FINAL CHECK
              </p>

              <h2
                className="
                  text-3xl
                  font-black
                  text-white
                  uppercase
                  tracking-tight
                "
              >
                ENTRY SUMMARY
                <span className="text-[#a855f7]">
                  .
                </span>
              </h2>

            </div>

            <div className="space-y-4">

              {/* CATEGORY */}

              <div
                className="
                  flex
                  justify-between
                  gap-5
                  border-b
                  border-white/10
                  pb-3
                "
              >

                <span className="text-gray-400">
                  Category
                </span>

                <span
                  className="
                    font-bold
                    text-[#a855f7]
                    text-right
                  "
                >
                  {formData.category}
                </span>

              </div>

              {/* ARTIST */}

              <div
                className="
                  flex
                  justify-between
                  gap-5
                  border-b
                  border-white/10
                  pb-3
                "
              >

                <span className="text-gray-400">
                  Artist
                </span>

                <span
                  className="
                    font-bold
                    text-white
                    text-right
                  "
                >
                  {formData.firstName}{" "}
                  {formData.lastName}
                </span>

              </div>

              {/* EMAIL */}

              <div
                className="
                  flex
                  justify-between
                  gap-5
                  border-b
                  border-white/10
                  pb-3
                "
              >

                <span className="text-gray-400">
                  Email
                </span>

                <span
                  className="
                    font-mono
                    text-xs
                    text-gray-300
                    text-right
                  "
                >
                  {formData.gmail}
                </span>

              </div>

              {/* PACKAGE */}

              <div
                className="
                  flex
                  justify-between
                  gap-5
                  border-b
                  border-white/10
                  pb-3
                "
              >

                <span className="text-gray-400">
                  Package
                </span>

                <span
                  className="
                    font-bold
                    text-white
                    text-right
                  "
                >
                  {
                    PACKAGES.find(
                      (p) =>
                        p.id ===
                        formData.entryPackage
                    )?.name
                  }
                </span>

              </div>

              {/* TOTAL */}

              <div
                className="
                  flex
                  justify-between
                  items-center
                  gap-5
                  pt-2
                "
              >

                <span
                  className="
                    text-gray-400
                    uppercase
                    text-xs
                    font-mono
                    tracking-widest
                  "
                >
                  Total Payable
                </span>

                <span
                  className="
                    text-3xl
                    font-black
                    text-[#a855f7]
                  "
                >
                  ₹
                  {
                    PACKAGES.find(
                      (p) =>
                        p.id ===
                        formData.entryPackage
                    )?.price ||
                    "499"
                  }
                </span>

              </div>

            </div>

            {/* PAYMENT BUTTON */}

            <button
              onClick={
                handlePaymentSubmit
              }
              disabled={
                isProcessing
              }
              className="
                w-full
                bg-[#a855f7]
                hover:bg-[#9333ea]
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-white
                py-5
                rounded-xl
                font-bold
                uppercase
                tracking-widest
                cursor-pointer
                flex
                items-center
                justify-center
                gap-3
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_15px_35px_rgba(168,85,247,0.25)]
              "
            >

              <CreditCard
                size={18}
              />

              {isProcessing
                ? "PROCESSING SECURE PAYMENT..."
                : "PROCEED TO PAYMENT & SUBMIT"}

            </button>

          </div>
        )}

        {/* =================================================
            STEP 6 — SUCCESS
        ================================================= */}

        {step === 6 && (
          <div
            className="
              max-w-2xl
              mx-auto
              bg-[#0b0b0f]
              border
              border-[#a855f7]/30
              rounded-3xl
              p-12
              text-center
              space-y-6
              shadow-[0_0_70px_rgba(168,85,247,0.1)]
              animate-fade-in
            "
          >

            <div
              className="
                w-20
                h-20
                mx-auto
                rounded-full
                bg-[#a855f7]/10
                border
                border-[#a855f7]/30
                flex
                items-center
                justify-center
              "
            >

              <CheckCircle2
                size={42}
                className="text-[#a855f7]"
              />

            </div>

            <p
              className="
                text-[#a855f7]
                text-[10px]
                font-mono
                uppercase
                tracking-[0.3em]
              "
            >
              REGISTRATION COMPLETE
            </p>

            <h2
              className="
                text-3xl
                font-black
                uppercase
                text-white
              "
            >
              ENTRY RECEIVED
              <span className="text-[#a855f7]">
                .
              </span>
            </h2>

            <p
              className="
                text-gray-500
                text-sm
                max-w-md
                mx-auto
              "
            >
              Your Ink Convention 2026 competition
              entry has been successfully received.
            </p>

            <div
              className="
                bg-[#050507]
                border
                border-white/5
                rounded-2xl
                p-6
                my-6
              "
            >

              <span
                className="
                  text-xs
                  font-mono
                  text-gray-500
                  uppercase
                  tracking-widest
                  block
                  mb-2
                "
              >
                OFFICIAL ENTRY ID
              </span>

              <span
                className="
                  text-2xl
                  font-mono
                  font-bold
                  text-[#a855f7]
                "
              >
                {entryId}
              </span>

            </div>

            <Link
              to="/"
              className="
                inline-block
                bg-white
                text-black
                px-10
                py-4
                rounded-xl
                font-bold
                text-xs
                font-mono
                uppercase
                tracking-widest
                hover:bg-gray-200
                transition
              "
            >
              RETURN TO HOMEPAGE
            </Link>

          </div>
        )}

        {/* =================================================
            NAVIGATION BUTTONS
        ================================================= */}

        {step < 5 && (
          <div
            className="
              flex
              justify-between
              items-center
              mt-12
              pt-8
              border-t
              border-white/10
            "
          >

            {/* BACK */}

            {step > 1 ? (
              <button
                type="button"
                onClick={
                  prevStep
                }
                className="
                  flex
                  items-center
                  gap-2
                  px-6
                  py-3
                  rounded-xl
                  border
                  border-white/20
                  text-white
                  font-mono
                  text-xs
                  tracking-widest
                  uppercase
                  hover:bg-white/5
                  hover:border-white/30
                  transition
                  cursor-pointer
                "
              >

                <ChevronLeft
                  size={16}
                />

                BACK

              </button>
            ) : (
              <div />
            )}

            {/* NEXT */}

            <button
              type="button"
              onClick={
                nextStep
              }
              disabled={
                step === 1 &&
                (
                  !formData.category ||
                  !formData.entryPackage
                )
              }
              className={`
                flex
                items-center
                gap-2
                px-8
                py-3.5
                rounded-xl
                text-white
                font-bold
                font-mono
                text-xs
                tracking-widest
                uppercase
                transition-all
                duration-300
                ml-auto

                ${
                  step === 1 &&
                  (
                    !formData.category ||
                    !formData.entryPackage
                  )
                    ? "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"
                    : "bg-[#a855f7] hover:bg-[#9333ea] shadow-[0_10px_30px_rgba(168,85,247,0.25)] cursor-pointer hover:-translate-y-0.5"
                }
              `}
            >

              {step === 1 &&
              !formData.category
                ? "SELECT CATEGORY"
                : step === 1 &&
                  !formData.entryPackage
                ? "SELECT PACKAGE"
                : "NEXT STEP"}

              <ChevronRight
                size={16}
              />

            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default Upload;