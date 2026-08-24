import { useState } from "react";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#08080a]">
      <div className="max-w-6xl mx-auto">
        {/* Header Section matching the theme */}
        <div className="text-center mb-16">
          <span className="text-[#a855f7] tracking-[0.2em] text-sm font-bold uppercase block mb-4">
            // SECURE CHECKOUT
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-wide">
            Payment Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Details Section */}
          <div className="lg:col-span-2 bg-[#121215] p-6 md:p-8 rounded-xl border border-white/10">
            {/* Payment Method Selector */}
            <div className="flex space-x-4 mb-8">
              <label
                className={`flex-1 flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                  paymentMethod === "card"
                    ? "border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]"
                    : "border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  className="hidden"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span className="font-bold tracking-wide">
                  CREDIT / DEBIT CARD
                </span>
              </label>

              <label
                className={`flex-1 flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                  paymentMethod === "upi"
                    ? "border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]"
                    : "border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  className="hidden"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <span className="font-bold tracking-wide">UPI</span>
              </label>
            </div>

            {/* Card Form */}
            {paymentMethod === "card" && (
              <form className="space-y-6">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-4 py-3 rounded-lg bg-[#08080a] border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#a855f7] focus:border-transparent outline-none transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 rounded-lg bg-[#08080a] border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#a855f7] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-lg bg-[#08080a] border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#a855f7] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="***"
                      maxLength="4"
                      className="w-full px-4 py-3 rounded-lg bg-[#08080a] border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#a855f7] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* UPI Form */}
            {paymentMethod === "upi" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="username@bank"
                    className="w-full px-4 py-3 rounded-lg bg-[#08080a] border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#a855f7] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1 bg-[#121215] p-6 rounded-xl border border-white/10 h-fit">
            <h2 className="text-xl font-black text-white uppercase tracking-wide mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Pass Subtotal</span>
                <span className="font-medium text-white">₹1,299.00</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Processing Fee</span>
                <span className="font-medium text-white">₹40.00</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Taxes (GST)</span>
                <span className="font-medium text-white">₹65.00</span>
              </div>
            </div>

            <hr className="border-white/10 mb-6" />

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-white uppercase">
                Total
              </span>
              <span className="text-2xl font-black text-[#a855f7]">
                ₹1,404.00
              </span>
            </div>

            <button className="w-full bg-[#a855f7] text-white font-black uppercase tracking-wider py-4 rounded-lg hover:bg-[#9333ea] transition-colors duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              Pay ₹1,404.00
            </button>

            <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center font-medium tracking-wide">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              ENCRYPTED & SECURE PAYMENT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
