import { useState, useEffect, useRef } from "react";
import {
  Store,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import gsap from "gsap";

const STALL_PACKAGES = {
  1: {
    packageId: "1-day",
    packageName: "1 Day Stall",
    packagePrice: 4999,
  },
  2: {
    packageId: "2-days",
    packageName: "2 Days Stall",
    packagePrice: 8999,
  },
  3: {
    packageId: "3-days",
    packageName: "3 Days Stall",
    packagePrice: 12499,
  },
};

const ADVANCE_AMOUNT = 1499;

export default function StallBooking() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    duration: "1",
  });

  const bookCalloutRef = useRef(null);

  useEffect(() => {
    // Never-ending infinite GSAP floating/pulsing animation
    const anim = gsap.to(bookCalloutRef.current, {
      y: -6,
      scale: 1.02,
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      ease: "power1.inOut",
    });

    return () => {
      anim.kill();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!formData.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!formData.brandName.trim()) {
      alert("Please enter your brand name.");
      return;
    }

    if (!formData.city.trim()) {
      alert("Please enter your city.");
      return;
    }

    const selectedPackage =
      STALL_PACKAGES[formData.duration] || STALL_PACKAGES["1"];

    setLoading(true);

    try {
      const API_URL = (
        import.meta.env.VITE_API_URL || "http://localhost:5000"
      ).replace(/\/$/, "");

      // =====================================================
      // CHECK API URL
      // =====================================================

      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is missing. Please check your frontend .env file.",
        );
      }

      console.log("🌐 Payment API:", `${API_URL}/api/payment/create-order`);

      // =====================================================
      // LOAD RAZORPAY SCRIPT IF NEEDED
      // =====================================================

      if (!window.Razorpay) {
        console.log("Loading Razorpay Checkout...");

        await new Promise((resolve, reject) => {
          const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
          );

          if (existingScript) {
            existingScript.onload = resolve;
            existingScript.onerror = reject;

            // If it already loaded before this handler was attached
            if (window.Razorpay) {
              resolve();
            }

            return;
          }

          const script = document.createElement("script");

          script.src = "https://checkout.razorpay.com/v1/checkout.js";

          script.async = true;

          script.onload = () => {
            console.log("✅ Razorpay Checkout loaded.");

            resolve();
          };

          script.onerror = () => {
            reject(new Error("Unable to load Razorpay Checkout."));
          };

          document.body.appendChild(script);
        });
      }

      // =====================================================
      // FINAL CHECK
      // =====================================================

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page.",
        );
      }

      // =====================================================
      // CREATE RAZORPAY ORDER
      // =====================================================

      console.log("💳 Creating Razorpay order...");

      const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          // IMPORTANT
          // Razorpay amount is handled by backend.
          // We are requesting ₹1,499.

          amount: ADVANCE_AMOUNT,

          // This MUST match the package ID
          // expected by your backend.
          packageId: "stall-booking",

          email: formData.email.trim(),

          phone: formData.phone.trim(),

          name: formData.fullName.trim(),
        }),
      });

      // =====================================================
      // READ ORDER RESPONSE
      // =====================================================

      const orderData = await orderResponse.json();

      console.log("💳 Razorpay order response:", orderData);

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Unable to create Razorpay order.",
        );
      }

      // =====================================================
      // GET ORDER DETAILS
      // =====================================================

      const razorpayOrderId =
        orderData.orderId || orderData.order?.id || orderData.id;

      const razorpayAmount = orderData.amount;

      const razorpayCurrency = orderData.currency || "INR";

      const razorpayKey = orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      // =====================================================
      // VALIDATE ORDER ID
      // =====================================================

      if (!razorpayOrderId) {
        console.error("❌ Missing Razorpay order ID:", orderData);

        throw new Error("Razorpay order ID was not returned by the server.");
      }

      if (!String(razorpayOrderId).startsWith("order_")) {
        console.error("❌ Invalid Razorpay order ID:", razorpayOrderId);

        throw new Error("Invalid Razorpay order ID received from server.");
      }

      // =====================================================
      // CHECK RAZORPAY KEY
      // =====================================================

      if (!razorpayKey) {
        throw new Error(
          "Razorpay key is missing. Please check your backend response or VITE_RAZORPAY_KEY_ID.",
        );
      }

      // =====================================================
      // RAZORPAY CHECKOUT OPTIONS
      // =====================================================

      const options = {
        key: razorpayKey,

        amount: razorpayAmount || 149900,

        currency: razorpayCurrency,

        name: "INK CONVENTION 2026",

        description: "Stall Booking Advance",

        order_id: razorpayOrderId,

        prefill: {
          name: formData.fullName.trim(),

          email: formData.email.trim(),

          contact: formData.phone.trim(),
        },

        notes: {
          bookingType: "Stall Booking",

          brandName: formData.brandName.trim(),

          city: formData.city.trim(),

          duration: formData.duration,
        },

        theme: {
          color: "#a855f7",
        },

        // ===================================================
        // PAYMENT SUCCESS
        // ===================================================

        handler: async function (paymentResponse) {
          console.log("✅ Razorpay payment successful:", paymentResponse);

          try {
            // =============================================
            // CHECK PAYMENT RESPONSE
            // =============================================

            if (
              !paymentResponse?.razorpay_order_id ||
              !paymentResponse?.razorpay_payment_id ||
              !paymentResponse?.razorpay_signature
            ) {
              throw new Error("Incomplete Razorpay payment response.");
            }

            // =============================================
            // VERIFY PAYMENT ON BACKEND
            // =============================================

            console.log("🔐 Verifying payment...");

            const verifyResponse = await fetch(
              `${API_URL}/api/payment/verify`,
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

            console.log("🔐 Verification response:", verifyData);

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            console.log("✅ Payment verified successfully.");

            // =============================================
            // SAVE STALL BOOKING
            // =============================================

            console.log("💾 Saving stall booking...");

            const bookingResponse = await fetch(
              `${API_URL}/api/stall-bookings`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  // CUSTOMER / STUDIO
                  brandName: formData.brandName.trim(),
                  studioName: formData.brandName.trim(),
                  fullName: formData.fullName.trim(),
                  ownerName: formData.fullName.trim(),
                  name: formData.fullName.trim(),
                  email: formData.email.trim(),
                  phone: formData.phone.trim(),
                  city: formData.city.trim(),

                  // STALL PACKAGE
                  duration: formData.duration,
                  packageId: selectedPackage.packageId,
                  packageName: selectedPackage.packageName,
                  packagePrice: selectedPackage.packagePrice,
                  totalAmount: selectedPackage.packagePrice,
                  stallType: selectedPackage.packageName,
                  stallName: selectedPackage.packageName,

                  // ADVANCE PAYMENT
                  amount: ADVANCE_AMOUNT,
                  advanceAmount: ADVANCE_AMOUNT,
                  paidAmount: ADVANCE_AMOUNT,
                  paymentStatus: "paid",
                  bookingStatus: "confirmed",
                  status: "CONFIRMED",

                  // RAZORPAY
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,

                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              },
            );

            const bookingData = await bookingResponse.json();

            console.log("📦 Booking response:", bookingData);

            if (!bookingResponse.ok || !bookingData.success) {
              throw new Error(
                bookingData.message ||
                  "Payment succeeded but booking could not be saved.",
              );
            }

            // =============================================
            // EVERYTHING SUCCESSFUL
            // =============================================

            console.log("🎉 Stall booking completed successfully.");

            setSuccess(true);

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } catch (error) {
            console.error("❌ Post-payment error:", error);

            alert(
              error.message ||
                "Payment was successful, but your booking could not be completed. Please contact support.",
            );
          } finally {
            setLoading(false);
          }
        },

        // ===================================================
        // PAYMENT MODAL CLOSED
        // ===================================================

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed.");

            setLoading(false);
          },
        },
      };

      // =====================================================
      // CREATE RAZORPAY INSTANCE
      // =====================================================

      console.log("🚀 Opening Razorpay Checkout...");

      const razorpay = new window.Razorpay(options);

      // =====================================================
      // PAYMENT FAILED
      // =====================================================

      razorpay.on("payment.failed", function (response) {
        console.error("❌ Razorpay payment failed:", response.error);

        alert(
          response.error?.description || "Payment failed. Please try again.",
        );

        setLoading(false);
      });

      // =====================================================
      // OPEN CHECKOUT
      // =====================================================

      razorpay.open();
    } catch (error) {
      console.error("❌ Payment initialization error:", error);

      alert(error.message || "Unable to start payment. Please try again.");

      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#08080a] text-white p-6 lg:p-12 font-sans selection:bg-[#a855f7] selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER MATCHING YOUR REFERENCE IMAGE STYLE */}
      <header className="max-w-6xl mx-auto mt-8 lg:mt-12 mb-12 text-center lg:text-left relative z-10">
        <p className="text-[#a855f7] font-semibold tracking-widest text-sm mb-4">
          // EXHIBITION SPACE
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-6 leading-[1.1]">
          SECURE YOUR BOOTH SPACE <br />
          AND <span className="text-[#a855f7]">BOOK YOUR STALL.</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-sm lg:text-base leading-relaxed">
          Fill out your brand details and complete the advance booking fee to
          lock in your spot for the upcoming Ink Convention.
        </p>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* LEFT: BOOKING FORM */}
        <section className="lg:col-span-7 bg-[#121218]/80 backdrop-blur-xl border border-[#2a2a35] rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#a855f7]/10 rounded-full blur-[80px] pointer-events-none" />

          {/* GSAP Never-Ending Animated Eye-Catching Callout */}
          <div ref={bookCalloutRef} className="text-center mb-6 pt-2">
            <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black tracking-widest uppercase drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full">
              <ArrowDown size={16} className="text-amber-400 animate-bounce" />
              <span>🚀 BOOK YOUR STALL NOW 🚀</span>
              <ArrowDown size={16} className="text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a2a35]">
            <div>
              <h2 className="text-xl font-bold tracking-wide">
                Registration Details
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Please provide accurate studio and contact info
              </p>
            </div>
            <Store className="text-[#a855f7]" size={24} />
          </div>

          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Your ₹1,499 advance payment was verified and the stall booking
                for{" "}
                <span className="text-white font-semibold">
                  {formData.brandName}
                </span>{" "}
                was saved successfully.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#2a2a35] text-xs font-bold text-gray-300 hover:bg-[#3a3a48] transition"
              >
                Reset Form
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-5">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Brand / Studio Name *
                </label>
                <div className="relative">
                  <Store
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-[#a855f7]"
                    size={16}
                  />
                  <input
                    type="text"
                    name="brandName"
                    required
                    value={formData.brandName}
                    onChange={handleChange}
                    className="w-full bg-[#0d0d12] border border-[#2a2a35] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 outline-none transition-all"
                    placeholder="e.g. Inked Masters Studio"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-[#0d0d12] border border-[#2a2a35] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#0d0d12] border border-[#2a2a35] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#0d0d12] border border-[#2a2a35] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* City & Duration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    City / Location *
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-[#0d0d12] border border-[#2a2a35] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 outline-none transition-all"
                      placeholder="Mumbai"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Stall Duration *
                  </label>
                  <div className="relative">
                    <CalendarDays
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full bg-[#0d0d12] border border-[#2a2a35] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="1">1 Day Stall (₹4,999 total)</option>
                      <option value="2">2 Days Stall (₹8,999 total)</option>
                      <option value="3">3 Days Stall (₹12,499 total)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PAY BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:opacity-95 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-[#a855f7]/25 transition-all transform active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Pay Advance Booking Fee (₹1,499)</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Secure 256-bit encrypted gateway transaction</span>
              </div>
            </form>
          )}
        </section>

        {/* RIGHT: PRICING TIERS */}
        <aside className="lg:col-span-5 bg-white text-gray-900 rounded-3xl p-6 lg:p-8 shadow-2xl h-fit flex flex-col justify-between">
          <div>
            <div className="mb-6 border-b border-gray-100 pb-5">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                Exhibition Space
              </span>
              <h2 className="text-2xl font-black mt-3 text-gray-900">
                Stall Bookings
              </h2>
              <p className="text-gray-400 text-xs font-bold tracking-widest mt-1 uppercase">
                Booth Rental Rates
              </p>
            </div>

            <div className="space-y-4">
              {/* Advance Fee Highlight Box */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/60 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded">
                      Required Now
                    </span>
                    <h3 className="text-orange-900 font-black text-base mt-2">
                      Advance Booking Fee
                    </h3>
                  </div>
                  <span className="text-2xl font-black text-orange-600">
                    ₹ 1,499
                  </span>
                </div>
                <p className="text-orange-900/70 text-xs leading-relaxed mt-2 font-medium">
                  Mandatory upfront payment to reserve stall space across all
                  duration tiers.
                </p>
              </div>

              {/* Pricing Tiers */}
              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex justify-between items-center transition hover:bg-gray-100/80">
                <div>
                  <span className="block font-bold text-gray-800 text-sm">
                    1 Day Stall
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Single day exhibition pass
                  </span>
                </div>
                <span className="text-lg font-black text-gray-900">
                  ₹ 4,999
                </span>
              </div>

              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex justify-between items-center transition hover:bg-gray-100/80">
                <div>
                  <span className="block font-bold text-gray-800 text-sm">
                    2 Days Stall
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Standard weekend layout
                  </span>
                </div>
                <span className="text-lg font-black text-gray-900">
                  ₹ 8,999
                </span>
              </div>

              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex justify-between items-center transition hover:bg-gray-100/80">
                <div>
                  <span className="block font-bold text-gray-800 text-sm">
                    3 Days Stall
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Full convention access
                  </span>
                </div>
                <span className="text-lg font-black text-gray-900">
                  ₹ 12,499
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 font-medium">
              Need help with large setups? Contact support at{" "}
              <span className="text-gray-700 font-bold">
                support@inkconvention.com
              </span>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
