const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const TattooStudio = require("../models/TattooStudio");

const {
  normalizePlan,
  addOneCalendarYear,
  startMembershipExpiryWorker,
} = require("../services/membershipService");

const router = express.Router();

/* =========================================================
   MEMBERSHIP PRICES

   SILVER / PRO     = ₹1,999 / YEAR
   GOLD / VERIFIED  = ₹2,999 / YEAR
========================================================= */

const MEMBERSHIP_PRICES = {
  pro: 1999,
  verified: 2999,
};

/*
  ONE-TIME UPGRADE OFFER

  Active Silver / Pro
        ↓
  Gold / Verified
        =
  ₹699

  This is available only once per artist profile.
*/
const SILVER_TO_GOLD_UPGRADE_PRICE = 699;

const MEMBERSHIP_PRICING_TYPES = {
  STANDARD: "standard-membership",
  SILVER_TO_GOLD: "silver-to-gold-upgrade",
};

/* =========================================================
   START MEMBERSHIP EXPIRY WORKER
========================================================= */

startMembershipExpiryWorker();

/* =========================================================
   RAZORPAY KEYS
========================================================= */

function getRazorpayKeys() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();

  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in backend .env",
    );
  }

  return {
    keyId,
    keySecret,
  };
}

/* =========================================================
   RAZORPAY INSTANCE
========================================================= */

function getRazorpay() {
  const { keyId, keySecret } = getRazorpayKeys();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/* =========================================================
   CHECK DIRECTORY MEMBERSHIP PAYMENT
========================================================= */

function isDirectoryMembership(profileId, packageId) {
  if (!profileId) {
    return false;
  }

  const plan = normalizePlan(packageId);

  return plan === "pro" || plan === "verified";
}

/* =========================================================
   ACTIVE MEMBERSHIP CHECK
========================================================= */

function hasActiveMembership(studio, expectedPlan) {
  if (!studio) {
    return false;
  }

  if (normalizePlan(studio.plan) !== normalizePlan(expectedPlan)) {
    return false;
  }

  if (String(studio.paymentStatus || "").toLowerCase() !== "paid") {
    return false;
  }

  /*
    Old rows may not have planExpiresAt.
    If it is missing, treat a paid plan as active for
    compatibility with existing MongoDB data.
  */
  if (!studio.planExpiresAt) {
    return true;
  }

  const expiryTime = new Date(studio.planExpiresAt).getTime();

  return Number.isFinite(expiryTime) && expiryTime > Date.now();
}

/* =========================================================
   ONE-TIME SILVER -> GOLD ELIGIBILITY
========================================================= */

function canUseSilverToGoldUpgrade(studio, targetPlan) {
  return (
    normalizePlan(targetPlan) === "verified" &&
    hasActiveMembership(studio, "pro") &&
    !Boolean(studio?.silverToGoldUpgradeUsed)
  );
}

/* =========================================================
   BACKEND MEMBERSHIP PRICE DECISION

   FREE  -> SILVER = ₹1,999
   FREE  -> GOLD   = ₹2,999
   ACTIVE SILVER -> FIRST GOLD = ₹699

   After ₹699 has been used:
   GOLD / future GOLD renewal = ₹2,999
========================================================= */

function getMembershipPrice(studio, targetPlan) {
  const plan = normalizePlan(targetPlan);

  if (canUseSilverToGoldUpgrade(studio, plan)) {
    return {
      amountRupees: SILVER_TO_GOLD_UPGRADE_PRICE,
      pricingType: MEMBERSHIP_PRICING_TYPES.SILVER_TO_GOLD,
      upgradeDiscount: true,
    };
  }

  return {
    amountRupees: MEMBERSHIP_PRICES[plan],
    pricingType: MEMBERSHIP_PRICING_TYPES.STANDARD,
    upgradeDiscount: false,
  };
}

/* =========================================================
   CREATE UNIQUE RECEIPT
========================================================= */

function makeReceipt(prefix = "ink") {
  const random = crypto.randomBytes(4).toString("hex");

  return `${prefix}_${Date.now()}_${random}`.slice(0, 40);
}

/* =========================================================
   SAFE MEMBERSHIP RESPONSE
========================================================= */

function safeMembershipProfile(studio) {
  if (!studio) {
    return null;
  }

  return {
    _id: studio._id,

    id: studio._id,

    plan: normalizePlan(studio.plan),

    paymentStatus: studio.paymentStatus,

    verified: Boolean(studio.verified),

    spotlight: Boolean(studio.spotlight),

    hallOfFameEligible: Boolean(studio.hallOfFameEligible),

    planStartedAt: studio.planStartedAt || null,

    planExpiresAt: studio.planExpiresAt || null,

    paymentAmount: Number(studio.paymentAmount || 0),

    silverToGoldUpgradeUsed: Boolean(studio.silverToGoldUpgradeUsed),

    silverToGoldUpgradeUsedAt: studio.silverToGoldUpgradeUsedAt || null,

    updatedAt: studio.updatedAt || null,
  };
}

/* =========================================================
   PAYMENT API TEST

   GET
   /api/payment
========================================================= */

router.get(
  "/",

  (req, res) => {
    return res.status(200).json({
      success: true,

      message: "Payment API is working.",

      membershipPrices: MEMBERSHIP_PRICES,

      silverToGoldUpgradePrice: SILVER_TO_GOLD_UPGRADE_PRICE,
    });
  },
);

/* =========================================================
   MEMBERSHIP PRICE QUOTE

   POST
   /api/payment/membership-quote

   IMPORTANT:
   This does NOT create a Razorpay order.

   It lets the frontend ask the backend:
   "What should this exact profile pay for this plan?"

   ACTIVE SILVER -> GOLD:
   ₹699 one-time

   ALL OTHER GOLD:
   ₹2,999
========================================================= */

router.post(
  "/membership-quote",

  async (req, res) => {
    try {
      const { profileId, packageId } = req.body || {};

      if (!profileId) {
        return res.status(400).json({
          success: false,
          message: "Artist profile ID is required.",
        });
      }

      const targetPlan = normalizePlan(packageId);

      if (targetPlan !== "pro" && targetPlan !== "verified") {
        return res.status(400).json({
          success: false,
          message: "Invalid membership plan.",
        });
      }

      const studio = await TattooStudio.findById(profileId).lean();

      if (!studio) {
        return res.status(404).json({
          success: false,
          message: "Artist profile not found.",
        });
      }

      const priceDecision = getMembershipPrice(studio, targetPlan);

      return res.status(200).json({
        success: true,
        membership: true,

        profileId: String(studio._id),

        currentPlan: normalizePlan(studio.plan),
        targetPlan,

        paymentStatus: String(studio.paymentStatus || "")
          .trim()
          .toLowerCase(),

        planExpiresAt: studio.planExpiresAt || null,

        silverToGoldUpgradeUsed: Boolean(studio.silverToGoldUpgradeUsed),

        amountRupees: priceDecision.amountRupees,
        pricingType: priceDecision.pricingType,
        upgradeDiscount: priceDecision.upgradeDiscount,

        silverToGoldUpgradePrice: SILVER_TO_GOLD_UPGRADE_PRICE,
      });
    } catch (error) {
      console.error("❌ Membership quote error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to check membership price.",
      });
    }
  },
);

/* =========================================================
   CREATE RAZORPAY ORDER

   POST
   /api/payment/create-order


   DIRECTORY MEMBERSHIP:

   pro
   ₹1,999

   verified
   ₹2,999


   IMPORTANT:

   FRONTEND CANNOT CHANGE
   MEMBERSHIP AMOUNT.

   BACKEND DECIDES PRICE.
========================================================= */

router.post(
  "/create-order",

  async (req, res) => {
    try {
      const { amount, packageId, profileId, email, phone, name } =
        req.body || {};

      /* =============================================
         CHECK IF THIS IS ARTIST MEMBERSHIP
      ============================================= */

      const membership = isDirectoryMembership(profileId, packageId);

      const normalizedPlan = normalizePlan(packageId);

      let amountRupees;

      let pricingType = "general-payment";

      let upgradeDiscount = false;

      /* =============================================
         MEMBERSHIP PAYMENT
      ============================================= */

      if (membership) {
        const studio = await TattooStudio.findById(profileId).lean();

        if (!studio) {
          return res.status(404).json({
            success: false,

            message: "Artist profile not found.",
          });
        }

        /* ===========================================
           PRICE FROM BACKEND ONLY

           STANDARD:
           SILVER = ₹1,999
           GOLD   = ₹2,999

           ONE-TIME UPGRADE:
           ACTIVE SILVER -> GOLD = ₹699
        =========================================== */

        const priceDecision = getMembershipPrice(studio, normalizedPlan);

        amountRupees = priceDecision.amountRupees;

        pricingType = priceDecision.pricingType;

        upgradeDiscount = priceDecision.upgradeDiscount;
      } else {
        /* ===========================================
           OTHER PAYMENT FLOWS

           Keep existing Razorpay
           payments working.
        =========================================== */

        amountRupees = Number(amount);
      }

      /* =============================================
         VALIDATE AMOUNT
      ============================================= */

      if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
        return res.status(400).json({
          success: false,

          message: "Invalid payment amount.",
        });
      }

      /* =============================================
         GET RAZORPAY
      ============================================= */

      const razorpay = getRazorpay();

      const { keyId } = getRazorpayKeys();

      /* =============================================
         CREATE ORDER
      ============================================= */

      const order = await razorpay.orders.create({
        amount: Math.round(amountRupees * 100),

        currency: "INR",

        receipt: makeReceipt(membership ? "member" : "payment"),

        notes: {
          packageId: String(packageId || ""),

          profileId: String(profileId || ""),

          name: String(name || "").slice(0, 200),

          email: String(email || "").slice(0, 200),

          phone: String(phone || "").slice(0, 50),

          purpose: membership ? "directory-membership" : "general-payment",

          pricingType: String(pricingType),

          expectedAmountRupees: String(amountRupees),

          upgradeDiscount: upgradeDiscount ? "true" : "false",
        },
      });

      /* =============================================
         RESPONSE
      ============================================= */

      return res.status(200).json({
        success: true,

        key: keyId,

        orderId: order.id,

        amount: order.amount,

        currency: order.currency,

        order,

        ...(membership
          ? {
              membership: true,

              plan: normalizedPlan,

              amountRupees,

              pricingType,

              upgradeDiscount,
            }
          : {}),
      });
    } catch (error) {
      console.error("❌ Razorpay create order error:", error);

      return res.status(500).json({
        success: false,

        message: error.message || "Unable to create payment order.",
      });
    }
  },
);

/* =========================================================
   VERIFY RAZORPAY PAYMENT

   POST
   /api/payment/verify


   MEMBERSHIP FRONTEND SENDS:

   razorpay_order_id
   razorpay_payment_id
   razorpay_signature

   profileId
   packageId
========================================================= */

router.post(
  "/verify",

  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        profileId,
        packageId,
      } = req.body || {};

      /* =============================================
         REQUIRED RAZORPAY VALUES
      ============================================= */

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,

          message: "Incomplete Razorpay payment response.",
        });
      }

      /* =============================================
         VERIFY SIGNATURE
      ============================================= */

      const { keySecret } = getRazorpayKeys();

      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const receivedBuffer = Buffer.from(String(razorpay_signature));

      const expectedBuffer = Buffer.from(expectedSignature);

      const validSignature =
        receivedBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

      if (!validSignature) {
        return res.status(400).json({
          success: false,

          message: "Payment signature verification failed.",
        });
      }

      /* =============================================
         CHECK MEMBERSHIP PAYMENT
      ============================================= */

      const membership = isDirectoryMembership(profileId, packageId);

      /* =============================================
         NORMAL PAYMENT

         Competition / Stall /
         Other existing payments
      ============================================= */

      if (!membership) {
        return res.status(200).json({
          success: true,

          verified: true,

          message: "Payment verified successfully.",

          paymentId: razorpay_payment_id,

          orderId: razorpay_order_id,
        });
      }

      /* =============================================
         MEMBERSHIP PLAN
      ============================================= */

      const plan = normalizePlan(packageId);

      /* =============================================
         FETCH ORIGINAL RAZORPAY ORDER

         SECURITY:

         We check that payment belongs
         to exactly this artist and
         selected membership.
      ============================================= */

      const razorpay = getRazorpay();

      const order = await razorpay.orders.fetch(razorpay_order_id);

      const orderPlan = normalizePlan(order?.notes?.packageId);

      const orderProfileId = String(order?.notes?.profileId || "");

      const orderPricingType = String(
        order?.notes?.pricingType || MEMBERSHIP_PRICING_TYPES.STANDARD,
      );

      const orderExpectedAmountRupees = Number(
        order?.notes?.expectedAmountRupees,
      );

      const isSilverToGoldUpgradeOrder =
        orderPricingType === MEMBERSHIP_PRICING_TYPES.SILVER_TO_GOLD;

      /*
        Razorpay notes are created by this backend.

        We still validate that a discounted order is EXACTLY
        the allowed ₹699 Gold-upgrade order.
      */
      const validPricingType = isSilverToGoldUpgradeOrder
        ? plan === "verified" &&
          orderExpectedAmountRupees === SILVER_TO_GOLD_UPGRADE_PRICE
        : orderPricingType === MEMBERSHIP_PRICING_TYPES.STANDARD &&
          orderExpectedAmountRupees === MEMBERSHIP_PRICES[plan];

      const expectedAmountPaise = Math.round(orderExpectedAmountRupees * 100);

      /* =============================================
         SECURITY CHECK

         PACKAGE
         PROFILE
         PRICING TYPE
         AMOUNT
         CURRENCY
      ============================================= */

      if (
        orderPlan !== plan ||
        orderProfileId !== String(profileId) ||
        !validPricingType ||
        !Number.isFinite(expectedAmountPaise) ||
        Number(order?.amount) !== expectedAmountPaise ||
        String(order?.currency || "").toUpperCase() !== "INR"
      ) {
        return res.status(400).json({
          success: false,

          message: "This payment order does not match the selected membership.",
        });
      }

      /* =============================================
         FIND ARTIST
      ============================================= */

      const studio = await TattooStudio.findById(profileId);

      if (!studio) {
        return res.status(404).json({
          success: false,

          message: "Artist profile not found.",
        });
      }

      /* =============================================
         IDEMPOTENT VERIFY

         If Razorpay/browser retries the same successful
         verification, return success instead of charging
         or changing membership again.
      ============================================= */

      if (
        String(studio.razorpayOrderId || "") === String(razorpay_order_id) &&
        String(studio.razorpayPaymentId || "") === String(razorpay_payment_id)
      ) {
        const existingProfile = safeMembershipProfile(studio);

        return res.status(200).json({
          success: true,
          verified: true,
          alreadyProcessed: true,
          message: "Payment was already verified successfully.",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          plan: normalizePlan(studio.plan),
          planStartedAt: studio.planStartedAt || null,
          planExpiresAt: studio.planExpiresAt || null,
          amountRupees: Number(studio.paymentAmount || 0),
          profile: existingProfile,
          artist: existingProfile,
        });
      }

      /* =============================================
         RE-CHECK ₹699 UPGRADE ELIGIBILITY

         The artist must STILL have:
         - active Silver
         - paid status
         - unused one-time upgrade offer

         This prevents reusing an old discounted order.
      ============================================= */

      if (
        isSilverToGoldUpgradeOrder &&
        !canUseSilverToGoldUpgrade(studio, plan)
      ) {
        return res.status(409).json({
          success: false,

          message:
            "The ₹699 Silver-to-Gold upgrade offer is no longer available for this profile.",
        });
      }

      /* =============================================
         MEMBERSHIP DATES

         START:
         NOW

         EXPIRY:
         1 CALENDAR YEAR
      ============================================= */

      const startedAt = new Date();

      const expiresAt = addOneCalendarYear(startedAt);

      /* =============================================
         PLAN
      ============================================= */

      studio.plan = plan;

      studio.paymentStatus = "paid";

      /* =============================================
         GOLD FLAGS

         ONLY GOLD / VERIFIED
      ============================================= */

      studio.verified = plan === "verified";

      studio.spotlight = plan === "verified";

      studio.hallOfFameEligible = plan === "verified";

      /* =============================================
         RAZORPAY PAYMENT DATA
      ============================================= */

      studio.razorpayOrderId = String(razorpay_order_id);

      studio.razorpayPaymentId = String(razorpay_payment_id);

      studio.razorpaySignature = String(razorpay_signature);

      studio.paymentAmount = orderExpectedAmountRupees;

      studio.paymentCurrency = "INR";

      studio.paidAt = startedAt;

      /* =============================================
         MARK ONE-TIME ₹699 OFFER AS USED

         This flag is permanent.
         Membership expiry must NOT reset it.
      ============================================= */

      if (isSilverToGoldUpgradeOrder) {
        studio.silverToGoldUpgradeUsed = true;

        studio.silverToGoldUpgradeUsedAt = startedAt;

        studio.silverToGoldUpgradePaymentId = String(razorpay_payment_id);
      }

      /* =============================================
         MEMBERSHIP DATES
      ============================================= */

      studio.planStartedAt = startedAt;

      studio.planExpiresAt = expiresAt;

      studio.updatedAt = startedAt;

      /* =============================================
         SAVE
      ============================================= */

      await studio.save();

      /* =============================================
         SAFE RESPONSE
      ============================================= */

      const profile = safeMembershipProfile(studio);

      console.log(
        `✅ Membership activated: ${plan} | ₹${orderExpectedAmountRupees} | ${orderPricingType} | ${studio._id} | expires ${expiresAt.toISOString()}`,
      );

      /* =============================================
         IMPORTANT:

         THIS DOES NOT CREATE OR
         REFRESH OTP SESSION.

         PAYMENT DOES NOT RESET
         THE 4-HOUR CLAIM TIMER.
      ============================================= */

      return res.status(200).json({
        success: true,

        verified: true,

        message: `${
          plan === "verified" ? "Gold" : "Silver"
        } membership activated for 1 year.`,

        paymentId: razorpay_payment_id,

        orderId: razorpay_order_id,

        plan,

        amountRupees: orderExpectedAmountRupees,

        pricingType: orderPricingType,

        upgradeDiscountUsed: isSilverToGoldUpgradeOrder,

        planStartedAt: startedAt,

        planExpiresAt: expiresAt,

        profile,

        artist: profile,
      });
    } catch (error) {
      console.error("❌ Razorpay verification error:", error);

      return res.status(500).json({
        success: false,

        message: error.message || "Payment verification failed.",
      });
    }
  },
);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
