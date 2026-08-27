import React, { useState } from "react";
import {
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

const PACKAGES = [
  {
    id: "single",
    name: "SINGLE ENTRY",
    price: "499",
    subs: "1 competition submission",
    details: "1 category\nDigital participation certificate if eligible",
  },
  {
    id: "pro",
    name: "PROFESSIONAL BUNDLE",
    price: "1299",
    subs: "3 submissions",
    details: "Up to 3 categories\nArtist profile\nRanking eligibility",
  },
  {
    id: "multi",
    name: "MULTI-ENTRY BUNDLE",
    price: "1999",
    subs: "5 submissions",
    details: "Multiple eligible categories\nEnhanced artist profile benefits",
  },
];

function Upload() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entryId, setEntryId] = useState(null);

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

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // SELECT ALL DECLARATIONS
  // ==========================================

  const allDeclarationsSelected =
    formData.declarationOriginal &&
    formData.declarationConsent &&
    formData.termsAccepted;

  const handleSelectAll = () => {
    const newValue = !allDeclarationsSelected;

    setFormData((prev) => ({
      ...prev,
      declarationOriginal: newValue,
      declarationConsent: newValue,
      termsAccepted: newValue,
    }));
  };

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }

    setImages(files);
  };

  // ==========================================
  // VIDEO UPLOAD
  // ==========================================

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      alert("You can upload a maximum of 3 videos.");
      return;
    }

    setVideos(files);
  };

  // ==========================================
  // VALIDATE EVERY STEP
  // ==========================================

  const validateStep = () => {
    // STEP 1
    if (step === 1) {
      if (!formData.category) {
        alert("Please select a competition category.");
        return false;
      }

      if (!formData.entryPackage) {
        alert("Please select an entry package.");
        return false;
      }
    }

    // STEP 2
    if (step === 2) {
      if (!formData.firstName.trim()) {
        alert("Please enter your first name.");
        return false;
      }

      if (!formData.lastName.trim()) {
        alert("Please enter your last name.");
        return false;
      }

      if (!formData.gmail.trim()) {
        alert("Please enter your email address.");
        return false;
      }

      if (!formData.phone.trim()) {
        alert("Please enter your phone / WhatsApp number.");
        return false;
      }

      if (!formData.city.trim()) {
        alert("Please enter your city.");
        return false;
      }
    }

    // ==========================================
    // STEP 3 - TATTOO TITLE IS NOW REQUIRED
    // ==========================================

    if (step === 3) {
      if (!formData.tattooTitle.trim()) {
        alert("Please enter your tattoo title.");
        return false;
      }

      if (!formData.description.trim()) {
        alert("Please enter your tattoo description.");
        return false;
      }
    }

    // STEP 4
    if (step === 4) {
      if (images.length === 0) {
        alert("Please upload at least 1 tattoo image.");
        return false;
      }

      if (
        !formData.declarationOriginal ||
        !formData.declarationConsent ||
        !formData.termsAccepted
      ) {
        alert("Please accept all declarations before continuing.");
        return false;
      }
    }

    return true;
  };

  // ==========================================
  // NEXT STEP
  // ==========================================

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ==========================================
  // PREVIOUS STEP
  // ==========================================

  const prevStep = () => {
    setStep((prev) => prev - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // PAYMENT
  // ==========================================

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);

    try {
      const selectedPackage = PACKAGES.find(
        (pkg) => pkg.id === formData.entryPackage,
      );

      if (!selectedPackage) {
        throw new Error("Please select an entry package.");
      }

      // ==========================================
      // STEP 1 - CREATE RAZORPAY ORDER
      // ==========================================

      const orderResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            amount: Number(selectedPackage.price),
            packageId: formData.entryPackage,
            email: formData.gmail,
            phone: formData.phone,
            name: `${formData.firstName} ${formData.lastName}`,
          }),
        },
      );

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Unable to create payment order.");
      }

      // ==========================================
      // CHECK RAZORPAY SCRIPT
      // ==========================================

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page.",
        );
      }

      // ==========================================
      // STEP 2 - OPEN RAZORPAY
      // ==========================================

      const options = {
        key: orderData.key,

        amount: orderData.amount,

        currency: orderData.currency,

        name: "INK CONVENTION 2026",

        description: `${selectedPackage.name} - Competition Entry`,

        order_id: orderData.orderId,

        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.gmail,
          contact: formData.phone,
        },

        notes: {
          category: formData.category,
          package: selectedPackage.name,
        },

        theme: {
          color: "#a855f7",
        },

        // ==========================================
        // PAYMENT SUCCESS
        // ==========================================

        handler: async function (paymentResponse) {
          try {
            // ==========================================
            // STEP 3 - VERIFY PAYMENT
            // ==========================================

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

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            // ==========================================
            // CREATE FORM DATA
            // ==========================================

            const data = new FormData();

            Object.keys(formData).forEach((key) => {
              data.append(key, formData[key]);
            });

            // ==========================================
            // ADD IMAGES
            // ==========================================

            images.forEach((image) => {
              data.append("images", image);
            });

            // ==========================================
            // ADD VIDEOS
            // ==========================================

            videos.forEach((video) => {
              data.append("videos", video);
            });

            // ==========================================
            // ADD PAYMENT DETAILS
            // ==========================================

            data.append("razorpay_order_id", paymentResponse.razorpay_order_id);

            data.append(
              "razorpay_payment_id",
              paymentResponse.razorpay_payment_id,
            );

            // ==========================================
            // SUBMIT ENTRY
            // ==========================================

            const submitResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/signup`,
              {
                method: "POST",
                body: data,
              },
            );

            const result = await submitResponse.json();

            if (!result.success) {
              throw new Error(result.message || "Entry submission failed.");
            }

            // ==========================================
            // SUCCESS PAGE
            // ==========================================

            setEntryId(result.entryId);

            setStep(6);

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } catch (error) {
            console.error("Post-payment submission error:", error);

            alert(
              "Payment was successful, but entry submission failed. Please contact support with your payment ID.",
            );
          } finally {
            setIsProcessing(false);
          }
        },

        // ==========================================
        // PAYMENT CLOSED
        // ==========================================

        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      // ==========================================
      // CREATE RAZORPAY INSTANCE
      // ==========================================

      const razorpay = new window.Razorpay(options);

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

  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none pt-24 pb-32 px-4 sm:px-6 lg:px-12 overflow-x-hidden font-sans">
      <div className="max-w-4xl mx-auto w-full">
        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        {step < 6 && (
          <div className="space-y-8 mb-12">
            <div className="text-center space-y-4">
              <h4 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold flex items-center justify-center gap-3">
                <span className="w-6 h-[1px] bg-[#a855f7]" />
                // INK CONVENTION 2026 — ARTIST ENTRY
                <span className="w-6 h-[1px] bg-[#a855f7]" />
              </h4>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.1]">
                ENTER INK CONVENTION 2026
              </h1>

              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
                Choose your category, submit your best work and compete for
                professional recognition, awards and ranking points.
              </p>
            </div>

            {/* ==========================================
                COMPETITION SUMMARY
            ========================================== */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0b0b0f] border border-white/5 rounded-2xl p-6">
              <div className="text-center space-y-1">
                <Globe size={18} className="mx-auto text-[#a855f7] mb-2" />

                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">
                  ONLINE COMPETITION
                </h4>

                <p className="text-[9px] text-gray-500 font-mono uppercase">
                  100% Digital Entry
                </p>
              </div>

              <div className="text-center space-y-1">
                <Layers size={18} className="mx-auto text-[#a855f7] mb-2" />

                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">
                  MULTIPLE CATEGORIES
                </h4>

                <p className="text-[9px] text-gray-500 font-mono uppercase">
                  Choose Your Style
                </p>
              </div>

              <div className="text-center space-y-1">
                <Scale size={18} className="mx-auto text-[#a855f7] mb-2" />

                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">
                  PROFESSIONAL JUDGING
                </h4>

                <p className="text-[9px] text-gray-500 font-mono uppercase">
                  Published Criteria
                </p>
              </div>

              <div className="text-center space-y-1">
                <Trophy size={18} className="mx-auto text-[#a855f7] mb-2" />

                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">
                  ARTIST RANKING
                </h4>

                <p className="text-[9px] text-gray-500 font-mono uppercase">
                  Results Earn Points
                </p>
              </div>
            </div>

            {/* ==========================================
                STEP INDICATOR
            ========================================== */}

            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 pt-4">
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
              ].map((item, index) => (
                <React.Fragment key={item.s}>
                  <div
                    className={`flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors ${
                      step >= item.s
                        ? "text-[#a855f7] font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        step >= item.s
                          ? "border-[#a855f7] bg-[#a855f7]/10"
                          : "border-gray-700"
                      }`}
                    >
                      {item.s}
                    </span>

                    <span className="hidden sm:inline">{item.label}</span>
                  </div>

                  {index < 4 && (
                    <ChevronRight
                      size={14}
                      className={
                        step > item.s ? "text-[#a855f7]" : "text-gray-700"
                      }
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 1
        ========================================== */}

        {step === 1 && (
          <div className="space-y-10 animate-fade-in">
            {/* CATEGORY */}

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                CHOOSE YOUR CATEGORY
              </h2>

              <div
                className={`grid gap-4 ${
                  formData.category
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                }`}
              >
                {CATEGORIES.map((category) => {
                  if (formData.category && formData.category !== category) {
                    return null;
                  }

                  return (
                    <div
                      key={category}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,

                          category: prev.category === category ? "" : category,
                        }))
                      }
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        formData.category === category
                          ? "bg-[#a855f7]/10 border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                          : "bg-[#0b0b0f] border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4
                            className={`font-bold ${
                              formData.category === category
                                ? "text-[#a855f7]"
                                : "text-white"
                            }`}
                          >
                            {category}
                          </h4>

                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            Professional Category
                          </p>
                        </div>

                        {formData.category === category && (
                          <span className="text-[10px] font-bold text-[#a855f7] border border-[#a855f7]/30 bg-[#a855f7]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                            Change
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ==========================================
                PACKAGE
            ========================================== */}

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                SELECT ENTRY PACKAGE
              </h2>

              <div
                className={`grid gap-6 ${
                  formData.entryPackage
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-3"
                }`}
              >
                {PACKAGES.map((pkg) => {
                  if (
                    formData.entryPackage &&
                    formData.entryPackage !== pkg.id
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={pkg.id}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,

                          entryPackage:
                            prev.entryPackage === pkg.id ? "" : pkg.id,
                        }))
                      }
                      className={`p-6 rounded-2xl border relative cursor-pointer transition-all duration-300 flex flex-col ${
                        formData.entryPackage === pkg.id
                          ? "bg-gradient-to-b from-[#140a24] to-[#0b0b0f] border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                          : "bg-[#0b0b0f] border-white/5 hover:border-white/20"
                      }`}
                    >
                      {formData.entryPackage === pkg.id && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-[#a855f7]">
                          <span className="text-[10px] font-bold border border-[#a855f7]/30 bg-[#a855f7]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                            Change
                          </span>

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
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 2
        ========================================== */}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              YOUR ARTIST PROFILE
            </h2>

            <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FIRST NAME */}

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    FIRST NAME *
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7]"
                  />
                </div>

                {/* LAST NAME */}

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    LAST NAME *
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7]"
                  />
                </div>

                {/* EMAIL */}

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    EMAIL ADDRESS *
                  </label>

                  <input
                    type="email"
                    name="gmail"
                    value={formData.gmail}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7]"
                  />
                </div>

                {/* PHONE */}

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    PHONE / WHATSAPP *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7]"
                  />
                </div>

                {/* CITY */}

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    CITY *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7]"
                  />
                </div>

                {/* STATE */}

                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    STATE / REGION
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 3
            TATTOO DETAILS
        ========================================== */}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              YOUR COMPETITION ENTRY
            </h2>

            <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
              {/* ==========================================
                  TATTOO TITLE - REQUIRED
              ========================================== */}

              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                  TATTOO TITLE *
                </label>

                <input
                  type="text"
                  name="tattooTitle"
                  required
                  placeholder='e.g. "Lotus in Motion"'
                  value={formData.tattooTitle}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7]"
                />

                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  Required
                </p>
              </div>

              {/* ==========================================
                  TATTOO DESCRIPTION - REQUIRED
              ========================================== */}

              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                  TATTOO DESCRIPTION *
                </label>

                <textarea
                  name="description"
                  required
                  rows="4"
                  placeholder="Describe your tattoo artwork..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a855f7] resize-none"
                />

                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  Required
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 4
            UPLOAD
        ========================================== */}

        {step === 4 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              UPLOAD YOUR TATTOO
            </h2>

            <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/10 pb-8">
                {/* ==========================================
                    IMAGES
                ========================================== */}

                <div className="space-y-3">
                  <label className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#a855f7]" />
                    IMAGES (REQUIRED)
                  </label>

                  <p className="text-xs text-gray-500 font-mono">
                    1 to 5 photos max. JPG, PNG, WEBP.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#a855f7] file:text-white cursor-pointer"
                  />

                  <p className="text-xs text-gray-500">
                    {images.length} files selected
                  </p>
                </div>

                {/* ==========================================
                    VIDEOS
                ========================================== */}

                <div className="space-y-3">
                  <label className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Video size={16} className="text-[#a855f7]" />
                    VIDEOS (OPTIONAL)
                  </label>

                  <p className="text-xs text-gray-500 font-mono">
                    Optional process video. 1 to 3 max. MP4, MOV.
                  </p>

                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#a855f7] file:text-white cursor-pointer"
                  />

                  <p className="text-xs text-gray-500">
                    {videos.length} files selected
                  </p>
                </div>
              </div>

              {/* ==========================================
                  DECLARATIONS
              ========================================== */}

              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                    DECLARATIONS
                  </h3>

                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold font-mono uppercase tracking-widest transition-all cursor-pointer ${
                      allDeclarationsSelected
                        ? "bg-[#a855f7] border-[#a855f7] text-white"
                        : "bg-[#a855f7]/10 border-[#a855f7]/40 text-[#a855f7] hover:bg-[#a855f7]/20"
                    }`}
                  >
                    <CheckSquare size={16} />

                    {allDeclarationsSelected ? "UNSELECT ALL" : "SELECT ALL"}
                  </button>
                </div>

                {/* ORIGINAL WORK */}

                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="declarationOriginal"
                    checked={formData.declarationOriginal}
                    onChange={handleChange}
                    className="mt-1"
                  />

                  <span className="text-sm text-gray-300 font-light">
                    I confirm that this tattoo is my original work and that I
                    have the right to submit.
                  </span>
                </label>

                {/* PERMISSION */}

                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="declarationConsent"
                    checked={formData.declarationConsent}
                    onChange={handleChange}
                    className="mt-1"
                  />

                  <span className="text-sm text-gray-300 font-light">
                    I confirm that I have the necessary permission to submit
                    photographs.
                  </span>
                </label>

                {/* TERMS */}

                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-1"
                  />

                  <span className="text-sm text-gray-300 font-light">
                    I agree to the competition rules, terms & conditions and
                    privacy policy.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 5
            REVIEW
        ========================================== */}

        {step === 5 && (
          <div className="space-y-8 animate-fade-in max-w-2xl mx-auto bg-[#0b0b0f] border border-[#a855f7]/30 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight text-center">
              ENTRY SUMMARY
            </h2>

            <div className="space-y-4">
              {/* CATEGORY */}

              <div className="flex justify-between gap-5 border-b border-white/10 pb-3">
                <span className="text-gray-400">Category</span>

                <span className="font-bold text-[#a855f7] text-right">
                  {formData.category}
                </span>
              </div>

              {/* ARTIST */}

              <div className="flex justify-between gap-5 border-b border-white/10 pb-3">
                <span className="text-gray-400">Artist</span>

                <span className="font-bold text-white text-right">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>

              {/* TATTOO TITLE */}

              <div className="flex justify-between gap-5 border-b border-white/10 pb-3">
                <span className="text-gray-400">Tattoo Title</span>

                <span className="font-bold text-white text-right">
                  {formData.tattooTitle}
                </span>
              </div>

              {/* DESCRIPTION */}

              <div className="border-b border-white/10 pb-3">
                <span className="text-gray-400 block mb-2">
                  Tattoo Description
                </span>

                <p className="font-medium text-white text-sm leading-relaxed">
                  {formData.description}
                </p>
              </div>

              {/* IMAGES */}

              <div className="flex justify-between gap-5 border-b border-white/10 pb-3">
                <span className="text-gray-400">Images</span>

                <span className="font-bold text-white">{images.length}</span>
              </div>

              {/* VIDEOS */}

              <div className="flex justify-between gap-5 border-b border-white/10 pb-3">
                <span className="text-gray-400">Videos</span>

                <span className="font-bold text-white">{videos.length}</span>
              </div>

              {/* TOTAL */}

              <div className="flex justify-between items-center gap-5 border-b border-white/10 pb-3">
                <span className="text-gray-400">Total Payable</span>

                <span className="text-2xl font-black text-[#a855f7]">
                  ₹
                  {PACKAGES.find((pkg) => pkg.id === formData.entryPackage)
                    ?.price || "499"}
                </span>
              </div>
            </div>

            {/* ==========================================
                PAYMENT BUTTON
            ========================================== */}

            <button
              type="button"
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className={`w-full py-5 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition ${
                isProcessing
                  ? "bg-[#a855f7]/50 cursor-not-allowed text-white/70"
                  : "bg-[#a855f7] hover:bg-[#9333ea] cursor-pointer text-white"
              }`}
            >
              <CreditCard size={18} />

              {isProcessing
                ? "PROCESSING SECURE PAYMENT..."
                : "PROCEED TO PAYMENT & SUBMIT"}
            </button>
          </div>
        )}

        {/* ==========================================
            STEP 6
            SUCCESS
        ========================================== */}

        {step === 6 && (
          <div className="max-w-2xl mx-auto bg-[#0b0b0f] border border-[#a855f7]/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <CheckCircle2 size={50} className="text-[#a855f7] mx-auto" />

            <h2 className="text-3xl font-black uppercase text-white">
              ENTRY RECEIVED
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed">
              Your competition entry has been successfully received.
            </p>

            <div className="bg-[#050507] border border-white/5 rounded-2xl p-6 my-6">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block mb-1">
                OFFICIAL ENTRY ID
              </span>

              <span className="text-2xl font-mono font-bold text-[#a855f7]">
                {entryId}
              </span>
            </div>

            <Link
              to="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-xl font-bold text-xs font-mono uppercase tracking-widest hover:bg-gray-200 transition"
            >
              RETURN TO HOMEPAGE
            </Link>
          </div>
        )}

        {/* ==========================================
            NAVIGATION
        ========================================== */}

        {step < 5 && (
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
            {/* BACK BUTTON */}

            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-mono text-xs tracking-widest uppercase hover:bg-white/5 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                BACK
              </button>
            ) : (
              <div />
            )}

            {/* NEXT BUTTON */}

            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold font-mono text-xs tracking-widest uppercase shadow-lg transition cursor-pointer ml-auto"
            >
              NEXT STEP
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
