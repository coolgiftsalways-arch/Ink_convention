import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import gsap from "gsap";

import {
  initMsg91Otp,
  sendMsg91Otp,
  verifyMsg91Otp,
  resendMsg91Otp,
  getMsg91AccessToken,
} from "../utils/msg91Otp";

import { TATTOO_CATEGORIES } from "../data/tattooCategories";

/* =========================================================
   API URL
========================================================= */

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const MAX_PORTFOLIO_IMAGES = 10;

/* =========================================================
   OLD LOCAL CACHE HELPER

   IMPORTANT:
   SEARCH / OTP / PROFILE UPDATE / PAYMENT
   STILL COME FROM BACKEND.

   This only keeps compatibility with
   your older pulled frontend code.
========================================================= */

function getStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read localStorage key: ${key}`, error);

    return [];
  }
}

/* =========================================================
   OLD CACHE KEYS
========================================================= */

const PROFILE_KEY = "inkConventionUserProfiles";

const DIRECTORY_KEY = "inkConventionDirectoryArtists";

const CURRENT_USER_KEY = "inkConventionCurrentUserId";

/* =========================================================
   PLANS

   basic    = FREE
   pro      = SILVER
   verified = GOLD
========================================================= */

const PLANS = [
  {
    id: "basic",

    name: "FREE / BASIC",

    price: "₹0",

    amount: 0,

    billing: "NO PAYMENT",

    description:
      "Keep your full information saved privately while your public card shows only your name and state.",

    benefits: [
      "Name visible",
      "State visible",
      "All other entered details stay saved",
      "City, image, phone and premium details stay locked publicly",
      "No payment",
    ],
  },

  {
    id: "pro",

    name: "SILVER / PRO",

    price: "₹1,999",

    amount: 1999,

    billing: "1 YEAR",

    description:
      "Show the key contact details clients need while keeping premium profile details locked.",

    benefits: [
      "Name visible",
      "State visible",
      "City visible",
      "Profile image visible",
      "Phone number visible",
      "Email, studio, experience, Instagram and bio stay locked",
      "First 5 portfolio images are visible publicly",
      "Active for 1 year",
    ],
  },

  {
    id: "verified",

    name: "GOLD / VERIFIED",

    price: "₹2,999",

    amount: 2999,

    billing: "1 YEAR",

    description:
      "Unlock the complete public artist profile, Gold verification and Hall of Fame visibility.",

    benefits: [
      "Everything visible publicly",
      "Profile image and phone",
      "Email and studio",
      "Experience and Instagram",
      "Bio / About",
      "Up to 10 portfolio images",
      "Gold Verified badge",
      "Hall of Fame inclusion",
      "Active for 1 year",
    ],
  },
];

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  name: "",

  email: "",

  city: "",

  state: "",

  studio: "",

  experience: "",

  instagram: "",

  tattooStyles: [],

  bio: "",
};

/* =========================================================
   NORMALIZE PLAN
========================================================= */

function normalizePlan(value) {
  const plan = String(value || "basic")
    .trim()
    .toLowerCase();

  if (plan === "gold" || plan === "spotlight" || plan === "verified") {
    return "verified";
  }

  if (plan === "silver" || plan === "pro") {
    return "pro";
  }

  return "basic";
}

/* =========================================================
   UPDATE OLD LOCAL DIRECTORY CACHE

   BACKEND / MONGODB REMAINS REAL SOURCE.
========================================================= */

function updateDirectory(updatedProfile) {
  try {
    const directory = getStoredArray(DIRECTORY_KEY);

    const updatedDirectory = directory.map((artist) =>
      String(artist.id || artist._id || artist.profileId) ===
      String(
        updatedProfile.id || updatedProfile._id || updatedProfile.profileId,
      )
        ? {
            ...artist,

            ...updatedProfile,

            plan: normalizePlan(updatedProfile.plan),
          }
        : artist,
    );

    localStorage.setItem(
      DIRECTORY_KEY,

      JSON.stringify(updatedDirectory),
    );
  } catch (error) {
    console.error("❌ Failed to update directory cache:", error);
  }
}

/* =========================================================
   NORMALIZE ARTIST
========================================================= */

function normalizeArtist(source = {}) {
  return {
    id: source.id || source._id || source.profileId || "",

    name:
      source.name || source.artistName || source.professionalName || "Artist",

    studio: source.studio || source.studioName || "",

    city: source.city || "",

    state: source.state || "",

    maskedPhone: source.maskedPhone || source.phoneMasked || "",

    profileImage: source.profileImage || source.image || "",

    tattooStyles: Array.isArray(source.tattooStyles) ? source.tattooStyles : [],

    bio: source.bio || "",

    plan: normalizePlan(source.plan || source.membershipPlan),

    paymentStatus: String(source.paymentStatus || "")
      .trim()
      .toLowerCase(),

    planStartedAt: source.planStartedAt || null,

    planExpiresAt: source.planExpiresAt || null,

    silverToGoldUpgradeUsed: Boolean(source.silverToGoldUpgradeUsed),
  };
}

/* =========================================================
   CREATE FORM FROM PROFILE
========================================================= */

function makeForm(profile = {}) {
  return {
    name: profile.name || profile.artistName || profile.professionalName || "",

    email: profile.email || "",

    city: profile.city || "",

    state: profile.state || "",

    studio: profile.studio || profile.studioName || "",

    experience: profile.experience || "",

    instagram: profile.instagram || "",

    tattooStyles: Array.isArray(profile.tattooStyles)
      ? profile.tattooStyles
      : [],

    bio: profile.bio || "",
  };
}

/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(path, options = {}) {
  const response = await fetch(
    `${API_URL}${path}`,

    {
      method: options.method || "GET",

      credentials: "include",

      headers: {
        Accept: "application/json",

        ...(options.body
          ? {
              "Content-Type": "application/json",
            }
          : {}),

        ...(options.headers || {}),
      },

      body: options.body ? JSON.stringify(options.body) : undefined,
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || data.error || `Request failed (${response.status})`,
    );

    error.status = response.status;

    error.data = data;

    throw error;
  }

  return data;
}

/* =========================================================
   RAZORPAY SCRIPT
========================================================= */

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);

      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existing) {
      existing.addEventListener(
        "load",

        () => resolve(true),

        {
          once: true,
        },
      );

      existing.addEventListener(
        "error",

        () => resolve(false),

        {
          once: true,
        },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

/* =========================================================
   IMAGE COMPRESSION
========================================================= */

function compressImage(
  file,

  maxSize = 800,

  quality = 0.72,
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        let width = image.width;

        let height = image.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(
            maxSize / width,

            maxSize / height,
          );

          width = Math.round(width * ratio);

          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;

        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Canvas unavailable."));

          return;
        }

        context.drawImage(
          image,

          0,

          0,

          width,

          height,
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",

            quality,
          ),
        );
      };

      image.onerror = () => {
        reject(new Error("Unable to load image."));
      };

      image.src = String(reader.result || "");
    };

    reader.onerror = () => {
      reject(new Error("Unable to read image."));
    };

    reader.readAsDataURL(file);
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function Enter() {
  const navigate = useNavigate();

  const location = useLocation();

  const manageProfileRequested = Boolean(
    location.state?.manageProfile || location.state?.ownerMode,
  );

  /* =======================================================
     INCOMING ARTIST FROM ARTISTS.JSX
  ======================================================= */

  const incomingArtistSource =
    location.state?.artist ||
    location.state?.profile ||
    location.state?.selectedArtist ||
    null;

  const incomingProfileId =
    location.state?.profileId ||
    location.state?.claimArtistId ||
    location.state?.artistId ||
    incomingArtistSource?._id ||
    incomingArtistSource?.id ||
    "";

  const initialArtist = incomingProfileId
    ? normalizeArtist({
        ...(incomingArtistSource || {}),

        id: incomingProfileId,
      })
    : null;

  /* =======================================================
     SCREEN

     find
     verify
     edit
     plans
  ======================================================= */

  const [screen, setScreen] = useState(
    initialArtist && manageProfileRequested ? "verify" : "find",
  );

  const [selectedArtist, setSelectedArtist] = useState(
    initialArtist && manageProfileRequested ? initialArtist : null,
  );

  /* =======================================================
     SEARCH
  ======================================================= */

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const [searching, setSearching] = useState(false);

  /* =======================================================
     OTP
  ======================================================= */

  const [otpSent, setOtpSent] = useState(false);

  const [otp, setOtp] = useState("");

  const [otpLoading, setOtpLoading] = useState(false);

  const [maskedPhone, setMaskedPhone] = useState(
    initialArtist?.maskedPhone || "",
  );

  const [resendSeconds, setResendSeconds] = useState(0);

  /* =======================================================
     PROFILE
  ======================================================= */

  const [currentProfile, setCurrentProfile] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [profileImage, setProfileImage] = useState("");

  const [portfolioImages, setPortfolioImages] = useState([]);

  const [saving, setSaving] = useState(false);

  const [sessionChecking, setSessionChecking] = useState(true);

  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);

  /* =======================================================
     CHANGE PHONE
  ======================================================= */

  const [changePhoneOpen, setChangePhoneOpen] = useState(false);

  const [newPhone, setNewPhone] = useState("");

  const [newPhoneOtp, setNewPhoneOtp] = useState("");

  const [newPhoneOtpSent, setNewPhoneOtpSent] = useState(false);

  const [phoneLoading, setPhoneLoading] = useState(false);

  /* =======================================================
     MESSAGES
  ======================================================= */

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =======================================================
     BACKEND GOLD PRICE QUOTE

     This is used only to DISPLAY the correct Gold price.
     payment.js still makes the final secure pricing decision.
  ======================================================= */

  const [goldPriceQuote, setGoldPriceQuote] = useState(null);

  /* =======================================================
     HELPERS
  ======================================================= */

  const clearMessages = () => {
    setError("");

    setSuccess("");
  };

  const hydrateProfile = (
    profile,

    sessionExp = null,
  ) => {
    if (!profile) {
      return;
    }

    const normalized = normalizeArtist(profile);

    setCurrentProfile(profile);

    setSelectedArtist(normalized);

    setFormData(makeForm(profile));

    setProfileImage(profile?.profileImage || profile?.image || "");

    setPortfolioImages(
      Array.isArray(profile?.portfolioImages)
        ? profile.portfolioImages.slice(0, MAX_PORTFOLIO_IMAGES)
        : [],
    );

    setMaskedPhone(profile?.maskedPhone || profile?.phoneMasked || "");

    if (sessionExp) {
      setSessionExpiresAt(Number(sessionExp) || null);
    }
  };

  /* =======================================================
     RESTORE EXACT 4-HOUR VERIFIED SESSION

     SAME ARTIST:
     open edit

     DIFFERENT ARTIST:
     OTP again

     NO SESSION:
     OTP/search
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const restoreVerifiedSession = async () => {
      try {
        const data = await apiRequest("/api/claim/me");

        if (cancelled) {
          return;
        }

        const rawProfile = data.profile || data.artist || null;

        if (!rawProfile) {
          throw new Error("Verified profile was not returned.");
        }

        const normalizedProfile = normalizeArtist(rawProfile);

        const verifiedProfileId = String(
          normalizedProfile.id || rawProfile._id || rawProfile.id || "",
        );

        const requestedProfileId = String(
          manageProfileRequested ? initialArtist?.id || "" : "",
        );

        /* =========================================
             ACTIVE SESSION BELONGS TO OTHER ARTIST
          ========================================= */

        if (
          requestedProfileId &&
          verifiedProfileId &&
          requestedProfileId !== verifiedProfileId
        ) {
          setCurrentProfile(null);

          setFormData(EMPTY_FORM);

          setProfileImage("");

          setPortfolioImages([]);

          setSessionExpiresAt(null);

          setOtp("");

          setOtpSent(false);

          setResendSeconds(0);

          setMaskedPhone(initialArtist?.maskedPhone || "");

          setError("");

          setSuccess("");

          setSelectedArtist(initialArtist);

          setScreen("verify");

          return;
        }

        /* =========================================
             SAME ARTIST ACTIVE SESSION
          ========================================= */

        hydrateProfile(
          rawProfile,

          data.sessionExpiresAt,
        );

        setMaskedPhone(
          data.maskedPhone ||
            data.phoneMasked ||
            rawProfile.maskedPhone ||
            rawProfile.phoneMasked ||
            "VERIFIED NUMBER",
        );

        setError("");

        setSuccess("Your verified session is still active.");

        setScreen("edit");
      } catch (sessionError) {
        if (cancelled) {
          return;
        }

        setCurrentProfile(null);

        setFormData(EMPTY_FORM);

        setProfileImage("");

        setPortfolioImages([]);

        setSessionExpiresAt(null);

        const ownerTarget =
          manageProfileRequested && initialArtist ? initialArtist : null;

        setSelectedArtist(ownerTarget);

        setMaskedPhone(ownerTarget?.maskedPhone || "");

        setOtp("");

        setOtpSent(false);

        setResendSeconds(0);

        if (
          sessionError.status === 401 ||
          sessionError.status === 403 ||
          sessionError.status === 404
        ) {
          setScreen(ownerTarget ? "verify" : "find");

          return;
        }

        console.error("❌ Session restore error:", sessionError);

        setError(sessionError.message || "Unable to check your login session.");

        setScreen(ownerTarget ? "verify" : "find");
      } finally {
        if (!cancelled) {
          setSessionChecking(false);
        }
      }
    };

    void restoreVerifiedSession();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     AUTO EXPIRE EXACT 4-HOUR SESSION

     IMPORTANT:
     PAYMENT DOES NOT CHANGE THIS TIMER.
  ======================================================= */

  useEffect(() => {
    if (!sessionExpiresAt) {
      return undefined;
    }

    const remainingMs = Number(sessionExpiresAt) - Date.now();

    const expireVisibleSession = () => {
      const profileForVerification = normalizeArtist(
        currentProfile || selectedArtist || {},
      );

      if (profileForVerification.id) {
        setSelectedArtist(profileForVerification);
      }

      setCurrentProfile(null);

      setFormData(EMPTY_FORM);

      setProfileImage("");

      setPortfolioImages([]);

      setOtp("");

      setOtpSent(false);

      setResendSeconds(0);

      setSessionExpiresAt(null);

      void apiRequest(
        "/api/claim/logout",

        {
          method: "POST",
        },
      ).catch((logoutError) => {
        console.error("❌ Automatic logout request failed:", logoutError);
      });

      setSuccess("");

      setError("Your 4-hour login session expired. Please verify OTP again.");

      setScreen(profileForVerification.id ? "verify" : "find");
    };

    if (remainingMs <= 0) {
      expireVisibleSession();

      return undefined;
    }

    const timer = window.setTimeout(
      expireVisibleSession,

      remainingMs,
    );

    return () => window.clearTimeout(timer);
  }, [sessionExpiresAt, currentProfile, selectedArtist]);

  /* =======================================================
     MSG91 INIT
  ======================================================= */

  useEffect(() => {
    if (sessionChecking || screen !== "verify") {
      return;
    }

    initMsg91Otp()
      .then(() => {
        console.log("✅ MSG91 OTP READY");
      })
      .catch((initError) => {
        console.error("❌ MSG91 initialization error:", initError);

        setError(
          "OTP service could not be initialized. Please refresh the page.",
        );
      });
  }, [screen, sessionChecking]);

  /* =======================================================
     GSAP ANIMATION
  ======================================================= */

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".enter-reveal",

        {
          opacity: 0,

          y: 22,
        },

        {
          opacity: 1,

          y: 0,

          duration: 0.6,

          stagger: 0.04,

          ease: "power3.out",
        },
      );
    });

    return () => context.revert();
  }, [screen]);

  /* =======================================================
     OTP RESEND TIMER
  ======================================================= */

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(
      () => {
        setResendSeconds((previous) =>
          Math.max(
            previous - 1,

            0,
          ),
        );
      },

      1000,
    );

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  /* =======================================================
     CURRENT PLAN
  ======================================================= */

  const currentPlan = useMemo(
    () => normalizePlan(currentProfile?.plan || selectedArtist?.plan),

    [currentProfile?.plan, selectedArtist?.plan],
  );

  /* =======================================================
     GOLD PRICE FROM BACKEND

     WHY:
     /api/claim/me can return a restricted/safe profile that may
     not contain every payment field.

     So the Gold card asks payment.js directly.

     MongoDB source of truth:
     Active Silver + unused offer -> ₹699
     Otherwise -> ₹2,999
  ======================================================= */

  const pricingProfileId = String(
    currentProfile?._id ||
      currentProfile?.id ||
      selectedArtist?._id ||
      selectedArtist?.id ||
      "",
  );

  useEffect(() => {
    if (screen !== "plans" || !pricingProfileId) {
      return undefined;
    }

    let cancelled = false;

    const loadGoldPriceQuote = async () => {
      try {
        const data = await apiRequest("/api/payment/membership-quote", {
          method: "POST",
          body: {
            profileId: pricingProfileId,
            packageId: "verified",
          },
        });

        if (!cancelled) {
          setGoldPriceQuote(data);
        }
      } catch (quoteError) {
        console.error("❌ Gold price quote error:", quoteError);

        if (!cancelled) {
          setGoldPriceQuote(null);
        }
      }
    };

    void loadGoldPriceQuote();

    return () => {
      cancelled = true;
    };
  }, [screen, pricingProfileId]);

  /*
    Immediate UI fallback:

    If we already know the user is on Silver, show ₹699 straight
    away while the backend quote is loading.

    As soon as the backend responds, its answer wins.
  */
  const silverToGoldUpgradeAvailable = goldPriceQuote?.success
    ? goldPriceQuote.pricingType === "silver-to-gold-upgrade" &&
      Number(goldPriceQuote.amountRupees) === 699
    : currentPlan === "pro" &&
      !Boolean(
        currentProfile?.silverToGoldUpgradeUsed ||
        selectedArtist?.silverToGoldUpgradeUsed,
      );

  /* =======================================================
     RESET TO SEARCH
  ======================================================= */

  const resetToFind = () => {
    setScreen("find");

    setSelectedArtist(null);

    setOtp("");

    setOtpSent(false);

    setResendSeconds(0);

    setCurrentProfile(null);

    setFormData(EMPTY_FORM);

    setProfileImage("");

    setPortfolioImages([]);

    setChangePhoneOpen(false);

    setNewPhone("");

    setNewPhoneOtp("");

    setNewPhoneOtpSent(false);

    clearMessages();

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  /* =======================================================
     SEARCH REAL BACKEND / MONGODB
  ======================================================= */

  const handleSearch = async (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (query.length < 2) {
      setError("Enter at least 2 characters of artist or studio name.");

      return;
    }

    setSearching(true);

    clearMessages();

    try {
      const data = await apiRequest(
        "/api/claim/find",

        {
          method: "POST",

          body: {
            query,
          },
        },
      );

      const rawResults = Array.isArray(data.profiles)
        ? data.profiles
        : Array.isArray(data.artists)
          ? data.artists
          : Array.isArray(data.results)
            ? data.results
            : [];

      const results = rawResults.map((artist) => normalizeArtist(artist));

      setSearchResults(results);

      if (results.length === 0) {
        setError("No matching artist or studio found.");
      }
    } catch (searchError) {
      console.error(searchError);

      setSearchResults([]);

      setError(searchError.message || "Unable to search profiles.");
    } finally {
      setSearching(false);
    }
  };

  /* =======================================================
     SELECT ARTIST
  ======================================================= */

  const chooseArtist = (artist) => {
    const profile = normalizeArtist(artist);

    setSelectedArtist(profile);

    setMaskedPhone(profile.maskedPhone || "");

    setOtp("");

    setOtpSent(false);

    setResendSeconds(0);

    clearMessages();

    setScreen("verify");

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  /* =======================================================
     SEND OTP
  ======================================================= */

  const sendOtp = async () => {
    if (!selectedArtist?.id) {
      setError("Artist profile is missing.");

      return;
    }

    if (otpLoading) {
      return;
    }

    setOtpLoading(true);

    clearMessages();

    try {
      const data = await apiRequest(
        "/api/claim/send-otp",

        {
          method: "POST",

          body: {
            profileId: selectedArtist.id,
          },
        },
      );

      const identifier = data.identifier;

      if (!identifier) {
        throw new Error("Registered mobile number was not returned.");
      }

      await sendMsg91Otp(identifier);

      setMaskedPhone(
        data.maskedPhone ||
          data.phoneMasked ||
          selectedArtist.maskedPhone ||
          "REGISTERED NUMBER",
      );

      setOtp("");

      setOtpSent(true);

      setResendSeconds(60);

      setSuccess("OTP sent to the registered mobile number.");
    } catch (sendError) {
      console.error("❌ Send OTP error:", sendError);

      setError(sendError.message || "Unable to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  /* =======================================================
     RESEND OTP
  ======================================================= */

  const resendOtp = async () => {
    if (!otpSent || otpLoading || resendSeconds > 0) {
      return;
    }

    setOtpLoading(true);

    clearMessages();

    try {
      await resendMsg91Otp();

      setOtp("");

      setResendSeconds(60);

      setSuccess("OTP resent successfully.");
    } catch (resendError) {
      console.error("❌ Resend OTP error:", resendError);

      setError(resendError.message || "Unable to resend OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  /* =======================================================
     VERIFY MAIN OTP
  ======================================================= */

  const verifyOtp = async (event) => {
    event.preventDefault();

    if (!selectedArtist?.id) {
      setError("Artist profile is missing.");

      return;
    }

    if (!/^\d{4}$/.test(otp)) {
      setError("Enter the 4-digit OTP.");

      return;
    }

    setOtpLoading(true);

    clearMessages();

    try {
      const msg91Result = await verifyMsg91Otp(otp);

      const accessToken = getMsg91AccessToken(msg91Result);

      if (!accessToken) {
        console.error("MSG91 verification response:", msg91Result);

        throw new Error("MSG91 verification token was not returned.");
      }

      const verifyData = await apiRequest(
        "/api/claim/verify-otp",

        {
          method: "POST",

          body: {
            profileId: selectedArtist.id,

            accessToken,
          },
        },
      );

      let profile = verifyData.profile || verifyData.artist || null;

      if (!profile) {
        const profileData = await apiRequest("/api/claim/me");

        profile = profileData.profile || profileData.artist || profileData;
      }

      hydrateProfile(
        profile,

        verifyData.sessionExpiresAt,
      );

      setMaskedPhone(
        profile?.maskedPhone ||
          profile?.phoneMasked ||
          verifyData.maskedPhone ||
          maskedPhone,
      );

      setSuccess("OTP verified. You can now update your profile.");

      setScreen("edit");

      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    } catch (verifyError) {
      console.error("❌ Verify OTP error:", verifyError);

      setError(verifyError.message || "Incorrect or expired OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: value,
    }));

    clearMessages();
  };

  /* =======================================================
     TATTOO SPECIALITIES

     PULLED BOOK YOUR ARTIST FEATURE KEPT
  ======================================================= */

  const toggleTattooStyle = (style) => {
    setFormData((previous) => {
      const currentStyles = Array.isArray(previous.tattooStyles)
        ? previous.tattooStyles
        : [];

      const alreadySelected = currentStyles.includes(style);

      return {
        ...previous,

        tattooStyles: alreadySelected
          ? currentStyles.filter((item) => item !== style)
          : [...currentStyles, style],
      };
    });

    clearMessages();
  };

  /* =======================================================
     PROFILE IMAGE
  ======================================================= */

  const handleProfileImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");

      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be smaller than 8 MB.");

      return;
    }

    try {
      const image = await compressImage(file);

      setProfileImage(image);

      clearMessages();
    } catch (imageError) {
      console.error(imageError);

      setError("Unable to process profile image.");
    }
  };

  /* =======================================================
     PORTFOLIO

     MAX 10 SAVED IN MONGODB

     FREE   -> 0 public
     SILVER -> first 5 public
     GOLD   -> first 10 public
  ======================================================= */

  const handlePortfolioImages = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = Math.max(
      0,
      MAX_PORTFOLIO_IMAGES - portfolioImages.length,
    );

    if (remainingSlots === 0) {
      setError(
        `You already have ${MAX_PORTFOLIO_IMAGES} portfolio images. Remove an old image before adding another one.`,
      );

      event.target.value = "";
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can add only ${remainingSlots} more portfolio image${remainingSlots === 1 ? "" : "s"}. Maximum is ${MAX_PORTFOLIO_IMAGES}.`,
      );

      event.target.value = "";
      return;
    }

    if (selectedFiles.some((file) => !file.type.startsWith("image/"))) {
      setError("Portfolio files must be images.");

      event.target.value = "";
      return;
    }

    if (selectedFiles.some((file) => file.size > 8 * 1024 * 1024)) {
      setError("Each portfolio image must be smaller than 8 MB.");

      event.target.value = "";
      return;
    }

    try {
      const images = await Promise.all(
        selectedFiles.map((file) =>
          compressImage(
            file,

            1000,

            0.72,
          ),
        ),
      );

      setPortfolioImages((previous) => {
        const combined = [...previous, ...images];

        return Array.from(new Set(combined)).slice(0, MAX_PORTFOLIO_IMAGES);
      });

      clearMessages();
      event.target.value = "";
    } catch (portfolioError) {
      console.error(portfolioError);

      setError("Unable to process portfolio images.");
      event.target.value = "";
    }
  };

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter artist / owner name.");

      return false;
    }

    if (!formData.email.trim()) {
      setError("Please enter email.");

      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");

      return false;
    }

    if (!formData.city.trim()) {
      setError("Please enter city.");

      return false;
    }

    if (!formData.state.trim()) {
      setError("Please enter state.");

      return false;
    }

    if (!formData.studio.trim()) {
      setError("Please enter studio name.");

      return false;
    }

    if (
      !Array.isArray(formData.tattooStyles) ||
      formData.tattooStyles.length === 0
    ) {
      setError("Please select at least one tattoo speciality.");

      return false;
    }

    return true;
  };

  /* =======================================================
     UPDATE PROFILE

     ALL DETAILS STORED REGARDLESS OF PLAN
  ======================================================= */

  const saveProfile = async (event) => {
    event.preventDefault();

    // Which edit-screen button submitted the form?
    // Silver has two choices:
    // 1) done -> save and return to Artists
    // 2) upgrade-gold -> save first, then open the Gold upgrade screen
    const profileAction =
      event.nativeEvent?.submitter?.value ||
      event.nativeEvent?.submitter?.dataset?.profileAction ||
      "done";

    if (!validateForm()) {
      return;
    }

    if (!selectedArtist?.id) {
      setError("Artist profile is missing.");

      return;
    }

    setSaving(true);

    clearMessages();

    try {
      const data = await apiRequest(
        "/api/claim/update",

        {
          method: "POST",

          body: {
            profileId: selectedArtist.id,

            name: formData.name.trim(),

            email: formData.email.trim(),

            city: formData.city.trim(),

            state: formData.state.trim(),

            studio: formData.studio.trim(),

            experience: formData.experience.trim(),

            instagram: formData.instagram.trim(),

            tattooStyles: formData.tattooStyles,

            bio: formData.bio.trim(),

            profileImage,

            portfolioImages,
          },
        },
      );

      const updatedProfile = data.profile ||
        data.artist || {
          ...(currentProfile || {}),

          ...formData,

          profileImage,

          portfolioImages,
        };

      const finalProfile = {
        ...(currentProfile || {}),

        ...updatedProfile,

        id:
          updatedProfile.id ||
          updatedProfile._id ||
          currentProfile?.id ||
          currentProfile?._id ||
          selectedArtist.id,

        _id:
          updatedProfile._id ||
          updatedProfile.id ||
          currentProfile?._id ||
          selectedArtist.id,

        profileImage: updatedProfile.profileImage || profileImage || "",

        portfolioImages: Array.isArray(updatedProfile.portfolioImages)
          ? updatedProfile.portfolioImages.slice(0, MAX_PORTFOLIO_IMAGES)
          : portfolioImages.slice(0, MAX_PORTFOLIO_IMAGES),

        plan: normalizePlan(
          updatedProfile.plan ||
            currentProfile?.plan ||
            selectedArtist?.plan ||
            "basic",
        ),
      };

      setCurrentProfile(finalProfile);

      setSelectedArtist(
        normalizeArtist({
          ...(selectedArtist || {}),

          ...finalProfile,
        }),
      );

      setFormData(makeForm(finalProfile));

      setProfileImage(finalProfile.profileImage || "");

      setPortfolioImages(
        Array.isArray(finalProfile.portfolioImages)
          ? finalProfile.portfolioImages.slice(0, MAX_PORTFOLIO_IMAGES)
          : [],
      );

      updateDirectory(finalProfile);

      const savedPlan = normalizePlan(finalProfile.plan);

      /*
        SILVER owner gets TWO choices on the edit screen:

        DONE & VIEW PROFILE
        -> save changes and return to Artists

        SAVE & GO GOLD
        -> save changes first, then open the Gold upgrade screen
      */
      if (savedPlan === "pro" && profileAction === "upgrade-gold") {
        setSuccess(
          "Changes saved. You can now upgrade your Silver profile to Gold.",
        );
        setScreen("plans");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      /* Existing SILVER / GOLD owner pressed DONE. */
      if (savedPlan === "pro" || savedPlan === "verified") {
        navigate("/artists", {
          state: {
            refreshDirectory: Date.now(),
            newArtistId:
              finalProfile.id || finalProfile._id || selectedArtist.id,
          },
        });

        return;
      }

      /* FREE / BASIC continues to the membership selection screen. */
      setSuccess("Profile updated successfully. Choose your membership plan.");

      setScreen("plans");

      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    } catch (saveError) {
      console.error("❌ PROFILE UPDATE ERROR:", saveError);

      if (saveError.status === 401 || saveError.status === 403) {
        setSessionExpiresAt(null);

        setCurrentProfile(null);

        setError("Your verification session expired. Please verify OTP again.");

        setOtp("");

        setOtpSent(false);

        setResendSeconds(0);

        setScreen("verify");

        return;
      }

      setError(saveError.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CHANGE PHONE - SEND OTP
  ======================================================= */

  const sendNewPhoneOtp = async () => {
    const cleanedPhone = newPhone
      .replace(
        /[^0-9+]/g,

        "",
      )
      .trim();

    if (cleanedPhone.length < 10) {
      setError("Enter a valid new mobile number.");

      return;
    }

    setPhoneLoading(true);

    clearMessages();

    try {
      await apiRequest(
        "/api/claim/change-phone/send-otp",

        {
          method: "POST",

          body: {
            profileId: selectedArtist?.id,

            newPhone: cleanedPhone,
          },
        },
      );

      setNewPhone(cleanedPhone);

      setNewPhoneOtpSent(true);

      setSuccess("OTP sent to the new mobile number.");
    } catch (phoneError) {
      console.error(phoneError);

      setError(phoneError.message || "Unable to send OTP to new number.");
    } finally {
      setPhoneLoading(false);
    }
  };

  /* =======================================================
     CHANGE PHONE - VERIFY OTP
  ======================================================= */

  const verifyNewPhoneOtp = async () => {
    if (!/^\d{4,6}$/.test(newPhoneOtp)) {
      setError("Enter the OTP sent to the new number.");

      return;
    }

    setPhoneLoading(true);

    clearMessages();

    try {
      const data = await apiRequest(
        "/api/claim/change-phone/verify-otp",

        {
          method: "POST",

          body: {
            profileId: selectedArtist?.id,

            newPhone,

            otp: newPhoneOtp,
          },
        },
      );

      const profile = data.profile || data.artist || null;

      if (profile) {
        hydrateProfile(
          profile,

          sessionExpiresAt,
        );
      }

      setMaskedPhone(data.maskedPhone || data.phoneMasked || "NUMBER UPDATED");

      setChangePhoneOpen(false);

      setNewPhone("");

      setNewPhoneOtp("");

      setNewPhoneOtpSent(false);

      setSuccess("Mobile number updated successfully.");
    } catch (phoneError) {
      console.error(phoneError);

      setError(phoneError.message || "Incorrect OTP for the new number.");
    } finally {
      setPhoneLoading(false);
    }
  };

  /* =======================================================
     FREE
  ======================================================= */

  const chooseFreePlan = async () => {
    if (!currentProfile) {
      setError("Profile information is missing.");

      return;
    }

    setSaving(true);

    clearMessages();

    try {
      const data = await apiRequest(
        "/api/claim/select-free",

        {
          method: "POST",
        },
      );

      const profile = data.profile || data.artist || currentProfile;

      const finalProfile = {
        ...currentProfile,

        ...profile,

        plan: "basic",

        paymentStatus: "unpaid",
      };

      setCurrentProfile(finalProfile);

      updateDirectory(finalProfile);

      setSuccess(
        "Free / Basic listing is active. Your full data is saved privately.",
      );

      window.setTimeout(
        () => {
          navigate(
            "/artists",

            {
              state: {
                newArtistId: finalProfile._id || finalProfile.id,

                refreshDirectory: Date.now(),
              },
            },
          );
        },

        700,
      );
    } catch (freeError) {
      console.error("❌ Free plan error:", freeError);

      setError(freeError.message || "Unable to activate Free plan.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     SILVER / GOLD PAYMENT

     IMPORTANT:
     NO /refresh-session HERE.

     PAYMENT DOES NOT RESET
     4-HOUR OTP TIMER.
  ======================================================= */

  const startPaidPlan = async (planId) => {
    if (!currentProfile) {
      setError("Profile information is missing.");

      return;
    }

    const selectedPlan = PLANS.find((plan) => plan.id === planId);

    if (!selectedPlan || selectedPlan.amount <= 0) {
      setError("Invalid membership plan.");

      return;
    }

    try {
      setSaving(true);

      clearMessages();

      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay checkout could not be loaded. Please check your internet connection.",
        );
      }

      const profileId =
        currentProfile._id ||
        currentProfile.id ||
        selectedArtist?._id ||
        selectedArtist?.id ||
        "";

      /* =========================================
           BACKEND DECIDES REAL MEMBERSHIP PRICE
        ========================================= */

      const orderData = await apiRequest(
        "/api/payment/create-order",

        {
          method: "POST",

          body: {
            packageId: selectedPlan.id,

            profileId,

            email: currentProfile.email || formData.email || "",

            phone: currentProfile.phone || currentProfile.mobile || "",

            name: currentProfile.name || formData.name || "",
          },
        },
      );

      if (!orderData.success) {
        throw new Error(orderData.message || "Unable to create payment order.");
      }

      const options = {
        key: orderData.key,

        amount: orderData.amount,

        currency: orderData.currency || "INR",

        name: "INK CONVENTION 2026",

        description:
          orderData.pricingType === "silver-to-gold-upgrade"
            ? "Silver to Gold Upgrade - ₹699"
            : selectedPlan.name,

        order_id: orderData.orderId,

        prefill: {
          name: currentProfile.name || formData.name || "",

          email: currentProfile.email || formData.email || "",

          contact: currentProfile.phone || currentProfile.mobile || "",
        },

        theme: {
          color: "#a855f7",
        },

        handler: async (response) => {
          try {
            setSaving(true);

            clearMessages();

            const verifyData = await apiRequest(
              "/api/payment/verify",

              {
                method: "POST",

                body: {
                  razorpay_order_id: response.razorpay_order_id,

                  razorpay_payment_id: response.razorpay_payment_id,

                  razorpay_signature: response.razorpay_signature,

                  profileId,

                  packageId: selectedPlan.id,
                },
              },
            );

            if (!verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            const backendProfile =
              verifyData.profile || verifyData.artist || null;

            const upgradedProfile = {
              ...currentProfile,

              ...(backendProfile || {}),

              id:
                backendProfile?._id ||
                backendProfile?.id ||
                currentProfile._id ||
                currentProfile.id,

              _id:
                backendProfile?._id ||
                backendProfile?.id ||
                currentProfile._id ||
                currentProfile.id,

              plan: normalizePlan(backendProfile?.plan || selectedPlan.id),

              paymentStatus: backendProfile?.paymentStatus || "paid",

              paymentId: response.razorpay_payment_id,

              orderId: response.razorpay_order_id,

              updatedAt: backendProfile?.updatedAt || new Date().toISOString(),
            };

            /* ===================================
                   KEEP PULLED LOCAL CACHE SUPPORT
                =================================== */

            const profiles = getStoredArray(PROFILE_KEY);

            const updatedProfiles = profiles.map((profile) =>
              String(profile.id || profile._id) ===
              String(currentProfile.id || currentProfile._id)
                ? upgradedProfile
                : profile,
            );

            localStorage.setItem(
              PROFILE_KEY,

              JSON.stringify(updatedProfiles),
            );

            updateDirectory(upgradedProfile);

            setCurrentProfile(upgradedProfile);

            setGoldPriceQuote({
              success: true,
              pricingType: "standard-membership",
              amountRupees: 2999,
              upgradeDiscount: false,
            });

            const paidAmount = Number(
              verifyData.amountRupees || orderData.amountRupees || 0,
            );

            setSuccess(
              `${selectedPlan.name} activated successfully${
                paidAmount > 0
                  ? ` for ₹${paidAmount.toLocaleString("en-IN")}`
                  : ""
              }!`,
            );

            /* ===================================
                   DO NOT REFRESH OTP SESSION
                =================================== */

            window.setTimeout(
              () => {
                navigate(
                  "/artists",

                  {
                    state: {
                      newArtistId: upgradedProfile._id || upgradedProfile.id,

                      paidPlan: normalizePlan(upgradedProfile.plan),

                      refreshDirectory: Date.now(),
                    },
                  },
                );
              },

              1200,
            );
          } catch (verifyError) {
            console.error("❌ Payment verification error:", verifyError);

            setError(verifyError.message || "Payment verification failed.");
          } finally {
            setSaving(false);
          }
        },

        modal: {
          ondismiss: function () {
            setSaving(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",

        function (response) {
          console.error("❌ Razorpay payment failed:", response);

          setError(
            response.error?.description || "Payment failed. Please try again.",
          );

          setSaving(false);
        },
      );

      razorpay.open();
    } catch (paymentError) {
      console.error("❌ Razorpay initialization error:", paymentError);

      setError(paymentError.message || "Unable to start payment.");

      setSaving(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await apiRequest(
        "/api/claim/logout",

        {
          method: "POST",
        },
      );
    } catch (logoutError) {
      console.error("❌ Logout request failed:", logoutError);
    } finally {
      localStorage.removeItem(CURRENT_USER_KEY);

      localStorage.removeItem("inkConventionLoggedUser");

      setSessionExpiresAt(null);

      setCurrentProfile(null);

      setSelectedArtist(null);

      setFormData(EMPTY_FORM);

      setProfileImage("");

      setPortfolioImages([]);

      setOtp("");

      setOtpSent(false);

      setError("");

      setSuccess("");

      setScreen("find");

      navigate(
        "/Enter",

        {
          replace: true,

          state: null,
        },
      );
    }
  };

  /* =======================================================
     SESSION CHECK SCREEN
  ======================================================= */

  if (sessionChecking) {
    return (
      <PageShell>
        <div
          className="
            min-h-[45vh]
            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              text-center
            "
          >
            <ShieldCheck
              size={28}
              className="
                mx-auto
                text-purple-400
              "
            />

            <p
              className="
                mt-4
                text-[10px]
                font-mono
                tracking-[0.18em]
                text-gray-500
              "
            >
              CHECKING VERIFIED SESSION...
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  /* =======================================================
     FIND SCREEN
  ======================================================= */

  if (screen === "find") {
    return (
      <PageShell>
        <div
          className="
            enter-reveal
            max-w-4xl
            mx-auto
          "
        >
          <Eyebrow icon={<Search size={13} />}>FIND YOUR PROFILE</Eyebrow>

          <h1
            className="
              text-[clamp(3.2rem,8vw,7rem)]
              font-black
              uppercase
              tracking-[-0.07em]
              leading-[0.84]
            "
          >
            FIND YOUR
            <br />
            <span
              className="
                text-purple-500
              "
            >
              CARD.
            </span>
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
            Search your real artist or studio profile from the backend. Nobody
            can edit a card until OTP verification succeeds for the mobile
            number saved with that profile.
          </p>

          <form
            onSubmit={handleSearch}
            className="
              mt-10
              flex
              flex-col
              sm:flex-row
              gap-3
            "
          >
            <div
              className="
                relative
                flex-1
              "
            >
              <Search
                size={17}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-600
                "
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ARTIST OR STUDIO NAME..."
                className="
                  w-full
                  bg-[#0d0d11]
                  border
                  border-white/10
                  focus:border-purple-500
                  rounded-xl
                  pl-11
                  pr-4
                  py-4
                  outline-none
                  text-sm
                "
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="
                bg-purple-600
                hover:bg-purple-500
                disabled:opacity-50
                rounded-xl
                px-7
                py-4
                text-[10px]
                font-black
                tracking-widest
                transition
              "
            >
              {searching ? "SEARCHING..." : "SEARCH"}
            </button>
          </form>

          <Message error={error} success={success} />

          <div
            className="
              mt-8
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >
            {searchResults.map((artist) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => chooseArtist(artist)}
                className="
                    text-left
                    bg-[#0d0d11]
                    border
                    border-white/10
                    hover:border-purple-500/60
                    rounded-2xl
                    p-5
                    transition
                  "
              >
                <p
                  className="
                      text-[8px]
                      font-mono
                      tracking-[0.14em]
                      text-purple-400
                    "
                >
                  DIRECTORY PROFILE
                </p>

                <h2
                  className="
                      mt-2
                      text-xl
                      font-black
                      uppercase
                    "
                >
                  {artist.name}
                </h2>

                <p
                  className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                >
                  {artist.studio || "Tattoo Artist / Studio"}
                </p>

                <div
                  className="
                      mt-4
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-gray-500
                    "
                >
                  <MapPin
                    size={13}
                    className="
                        text-purple-500
                      "
                  />

                  {[artist.city, artist.state].filter(Boolean).join(", ") ||
                    "India"}
                </div>

                <div
                  className="
                      mt-5
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                >
                  <span
                    className="
                        text-[9px]
                        font-mono
                        text-gray-600
                      "
                  >
                    {artist.maskedPhone || "REGISTERED MOBILE"}
                  </span>

                  <span
                    className="
                        text-[9px]
                        font-black
                        text-purple-400
                      "
                  >
                    UPDATE YOUR CARD →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  /* =======================================================
     VERIFY SCREEN
  ======================================================= */

  if (screen === "verify") {
    return (
      <PageShell>
        <div
          className="
            enter-reveal
            max-w-2xl
            mx-auto
          "
        >
          <button
            type="button"
            onClick={resetToFind}
            className="
              text-[9px]
              font-mono
              text-gray-500
              hover:text-white
              transition
              mb-8
            "
          >
            ← CHOOSE ANOTHER PROFILE
          </button>

          <div
            className="
              bg-[#0d0d11]
              border
              border-white/10
              rounded-[28px]
              p-6
              sm:p-9
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
              "
            >
              <ShieldCheck
                size={25}
                className="
                  text-purple-400
                "
              />
            </div>

            <p
              className="
                mt-7
                text-[9px]
                font-mono
                tracking-[0.16em]
                text-purple-400
              "
            >
              OWNERSHIP VERIFICATION
            </p>

            <h1
              className="
                mt-3
                text-3xl
                sm:text-5xl
                font-black
                uppercase
                leading-none
              "
            >
              VERIFY BEFORE
              <br />
              YOU UPDATE.
            </h1>

            <div
              className="
                mt-7
                border
                border-white/10
                rounded-2xl
                p-5
              "
            >
              <h2
                className="
                  font-black
                  uppercase
                  text-lg
                "
              >
                {selectedArtist?.name || "ARTIST PROFILE"}
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                {selectedArtist?.studio || "Tattoo Artist / Studio"}
              </p>

              <p
                className="
                  mt-3
                  text-xs
                  text-gray-500
                "
              >
                OTP goes only to: {maskedPhone || "the saved mobile number"}
              </p>
            </div>

            <div
              id="msg91-captcha"
              className="
                mt-5
                flex
                justify-center
              "
            />

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading}
                className="
                  mt-6
                  w-full
                  bg-purple-600
                  hover:bg-purple-500
                  disabled:opacity-50
                  rounded-xl
                  p-4
                  font-black
                  text-[10px]
                  tracking-widest
                  transition
                "
              >
                {otpLoading ? "SENDING..." : "SEND OTP"}
              </button>
            ) : (
              <form
                onSubmit={verifyOtp}
                className="
                  mt-6
                "
              >
                <label
                  className="
                    block
                    text-[9px]
                    font-mono
                    text-gray-500
                    mb-2
                  "
                >
                  ENTER 4-DIGIT OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(
                          /\D/g,

                          "",
                        )
                        .slice(
                          0,

                          4,
                        ),
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="0000"
                  className="
                    w-full
                    text-center
                    tracking-[0.55em]
                    bg-black/40
                    border
                    border-white/10
                    focus:border-purple-500
                    rounded-xl
                    px-5
                    py-5
                    outline-none
                    text-xl
                    font-black
                  "
                />

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 4}
                  className="
                    mt-4
                    w-full
                    bg-white
                    hover:bg-slate-200
                    text-black
                    disabled:opacity-50
                    rounded-xl
                    p-4
                    font-black
                    text-[10px]
                    tracking-widest
                    transition
                  "
                >
                  {otpLoading ? "VERIFYING..." : "VERIFY OTP & OPEN PROFILE"}
                </button>

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={otpLoading || resendSeconds > 0}
                  className="
                    mt-4
                    w-full
                    text-[9px]
                    font-mono
                    text-purple-400
                    disabled:text-gray-700
                  "
                >
                  {resendSeconds > 0
                    ? `RESEND OTP IN ${resendSeconds}s`
                    : "RESEND OTP"}
                </button>
              </form>
            )}

            <Message error={error} success={success} />
          </div>
        </div>
      </PageShell>
    );
  }

  /* =======================================================
     EDIT SCREEN
  ======================================================= */

  if (screen === "edit") {
    return (
      <PageShell>
        <div
          className="
            max-w-[1250px]
            mx-auto
          "
        >
          <div
            className="
              enter-reveal
              flex
              flex-col
              lg:flex-row
              lg:items-end
              justify-between
              gap-6
              border-b
              border-white/10
              pb-8
            "
          >
            <div>
              <Eyebrow icon={<CheckCircle2 size={13} />}>
                PHONE VERIFIED
              </Eyebrow>

              <h1
                className="
                  text-[clamp(3rem,7vw,6rem)]
                  font-black
                  uppercase
                  tracking-[-0.065em]
                  leading-[0.86]
                "
              >
                UPDATE YOUR
                <br />
                <span
                  className="
                    text-purple-500
                  "
                >
                  PROFILE.
                </span>
              </h1>
            </div>

            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <button
                type="button"
                onClick={() => navigate("/artists")}
                className="
                  text-[9px]
                  font-mono
                  text-purple-400
                  hover:text-purple-300
                  transition
                "
              >
                VIEW PUBLIC PROFILE
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  text-[9px]
                  font-mono
                  text-gray-500
                  hover:text-white
                  transition
                "
              >
                LOG OUT
              </button>
            </div>
          </div>

          <form
            onSubmit={saveProfile}
            className="
              enter-reveal
              mt-10
              grid
              grid-cols-1
              lg:grid-cols-[320px_1fr]
              gap-10
            "
          >
            {/* =========================================
                LEFT
            ========================================= */}

            <div>
              <p
                className="
                  text-[9px]
                  font-mono
                  text-gray-500
                  mb-3
                "
              >
                PROFILE PHOTO
              </p>

              <label
                className="
                  relative
                  block
                  aspect-square
                  overflow-hidden
                  bg-[#0d0d11]
                  border
                  border-white/10
                  hover:border-purple-500/50
                  rounded-[26px]
                  cursor-pointer
                  transition
                "
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      flex-col
                      items-center
                      justify-center
                      text-center
                    "
                  >
                    <Users
                      size={32}
                      className="
                        text-purple-500
                      "
                    />

                    <p
                      className="
                        mt-4
                        font-black
                      "
                    >
                      UPLOAD PHOTO
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-600
                      "
                    >
                      Click to select
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImage}
                  className="hidden"
                />
              </label>

              {/* VERIFIED NUMBER */}

              <div
                className="
                  mt-5
                  bg-[#0d0d11]
                  border
                  border-white/10
                  rounded-2xl
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-purple-400
                  "
                >
                  <Lock size={13} />

                  <p
                    className="
                      text-[8px]
                      font-mono
                      tracking-[0.14em]
                    "
                  >
                    VERIFIED MOBILE
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-lg
                    font-black
                  "
                >
                  {maskedPhone || "VERIFIED NUMBER"}
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-gray-600
                    leading-relaxed
                  "
                >
                  The mobile number cannot be changed directly without another
                  OTP verification.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    clearMessages();

                    setChangePhoneOpen((previous) => !previous);

                    setNewPhone("");

                    setNewPhoneOtp("");

                    setNewPhoneOtpSent(false);
                  }}
                  className="
                    mt-4
                    text-[9px]
                    font-black
                    text-purple-400
                    hover:text-purple-300
                  "
                >
                  {changePhoneOpen
                    ? "CANCEL NUMBER CHANGE"
                    : "CHANGE MOBILE NUMBER →"}
                </button>

                {changePhoneOpen && (
                  <div
                    className="
                      mt-5
                      pt-5
                      border-t
                      border-white/10
                    "
                  >
                    <p
                      className="
                        text-xs
                        text-gray-500
                        leading-relaxed
                      "
                    >
                      Enter the new mobile number and verify it before changing
                      the saved number.
                    </p>

                    <input
                      type="text"
                      value={newPhone}
                      onChange={(event) => setNewPhone(event.target.value)}
                      disabled={newPhoneOtpSent}
                      placeholder="NEW MOBILE NUMBER"
                      className="
                        mt-4
                        w-full
                        bg-black/40
                        border
                        border-white/10
                        focus:border-purple-500
                        rounded-xl
                        px-4
                        py-3
                        outline-none
                        text-sm
                        disabled:opacity-60
                      "
                    />

                    {!newPhoneOtpSent ? (
                      <button
                        type="button"
                        onClick={sendNewPhoneOtp}
                        disabled={phoneLoading}
                        className="
                          mt-3
                          w-full
                          bg-white
                          text-black
                          hover:bg-slate-200
                          disabled:opacity-50
                          rounded-xl
                          py-3
                          text-[9px]
                          font-black
                          tracking-widest
                        "
                      >
                        {phoneLoading ? "SENDING..." : "SEND OTP TO NEW NUMBER"}
                      </button>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={newPhoneOtp}
                          onChange={(event) =>
                            setNewPhoneOtp(
                              event.target.value
                                .replace(
                                  /\D/g,

                                  "",
                                )
                                .slice(
                                  0,

                                  6,
                                ),
                            )
                          }
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="000000"
                          className="
                            mt-3
                            w-full
                            text-center
                            tracking-[0.45em]
                            bg-black/40
                            border
                            border-white/10
                            focus:border-purple-500
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            font-black
                          "
                        />

                        <button
                          type="button"
                          onClick={verifyNewPhoneOtp}
                          disabled={phoneLoading || newPhoneOtp.length < 4}
                          className="
                            mt-3
                            w-full
                            bg-purple-600
                            hover:bg-purple-500
                            disabled:opacity-50
                            rounded-xl
                            py-3
                            text-[9px]
                            font-black
                            tracking-widest
                          "
                        >
                          {phoneLoading
                            ? "VERIFYING..."
                            : "VERIFY & CHANGE NUMBER"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* =========================================
                RIGHT
            ========================================= */}

            <div
              className="
                space-y-5
              "
            >
              <InputField
                label="ARTIST / OWNER NAME"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />

              <InputField
                label="EMAIL"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="artist@gmail.com"
              />

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-5
                "
              >
                <InputField
                  label="CITY"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                />

                <InputField
                  label="STATE"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                />
              </div>

              <InputField
                label="STUDIO NAME"
                name="studio"
                value={formData.studio}
                onChange={handleChange}
                placeholder="Your tattoo studio"
              />

              {/* =====================================
                  TATTOO SPECIALITIES

                  PULLED BOOK YOUR ARTIST
                  FEATURE KEPT
              ===================================== */}

              <div>
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                    mb-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-mono
                        text-gray-500
                      "
                    >
                      TATTOO SPECIALITIES *
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-gray-700
                      "
                    >
                      Select every tattoo style you specialise in. These styles
                      are used for Book Your Artist matching.
                    </p>
                  </div>

                  <span
                    className="
                      shrink-0
                      text-[8px]
                      font-mono
                      text-purple-400
                    "
                  >
                    {formData.tattooStyles?.length || 0} SELECTED
                  </span>
                </div>

                <div
                  className="
                    border
                    border-white/10
                    bg-[#0d0d11]
                    rounded-2xl
                    p-4
                    sm:p-5
                  "
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {TATTOO_CATEGORIES.map((style) => {
                      const selected =
                        Array.isArray(formData.tattooStyles) &&
                        formData.tattooStyles.includes(style);

                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleTattooStyle(style)}
                          aria-pressed={selected}
                          className={`
                              rounded-full
                              border
                              px-3
                              sm:px-4
                              py-2.5
                              text-[8px]
                              font-black
                              tracking-[0.08em]
                              transition-all
                              duration-200

                              ${
                                selected
                                  ? `
                                    border-purple-400
                                    bg-purple-600
                                    text-white
                                    shadow-[0_0_18px_rgba(168,85,247,0.25)]
                                  `
                                  : `
                                    border-white/10
                                    bg-black/30
                                    text-gray-500
                                    hover:border-purple-500/40
                                    hover:text-purple-300
                                  `
                              }
                            `}
                        >
                          {selected ? "✓ " : ""}

                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.tattooStyles?.length > 0 && (
                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {formData.tattooStyles.map((style) => (
                      <span
                        key={style}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-purple-500/20
                            bg-purple-500/[0.06]
                            px-3
                            py-2
                            text-[8px]
                            font-black
                            text-purple-300
                          "
                      >
                        {style}

                        <button
                          type="button"
                          onClick={() => toggleTattooStyle(style)}
                          aria-label={`Remove ${style}`}
                          className="
                              text-purple-500
                              hover:text-white
                              transition
                            "
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <InputField
                label="EXPERIENCE"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="5 Years"
                required={false}
              />

              <InputField
                label="INSTAGRAM"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@username"
                required={false}
              />

              <TextareaField
                label="BIO / ABOUT"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell visitors about your tattoo style, specialties and studio."
                maxLength={1500}
                required={false}
              />

              {/* =====================================
                  PORTFOLIO
              ===================================== */}

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#0d0d11]
                  p-5
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-mono
                        tracking-[0.14em]
                        text-gray-500
                      "
                    >
                      PORTFOLIO IMAGES
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-gray-600
                      "
                    >
                      Upload up to 10 images. You can add more later or remove
                      old ones. Silver shows the first 5; Gold shows all 10;
                      Free keeps them private.
                    </p>
                  </div>

                  <label
                    className="
                      cursor-pointer
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-3
                      text-[9px]
                      font-black
                      tracking-widest
                      hover:border-purple-500/50
                    "
                  >
                    ADD IMAGES ({portfolioImages.length}/10)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioImages}
                      className="hidden"
                    />
                  </label>
                </div>

                {portfolioImages.length > 0 && (
                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-3
                      gap-3
                    "
                  >
                    {portfolioImages.map(
                      (
                        image,

                        index,
                      ) => (
                        <div
                          key={`${index}-${image.slice(
                            0,

                            24,
                          )}`}
                          className="
                            relative
                            aspect-square
                            overflow-hidden
                            rounded-xl
                            border
                            border-white/10
                            bg-black
                          "
                        >
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setPortfolioImages((previous) =>
                                previous.filter(
                                  (
                                    _,

                                    imageIndex,
                                  ) => imageIndex !== index,
                                ),
                              )
                            }
                            className="
                              absolute
                              right-2
                              top-2
                              rounded-full
                              bg-black/80
                              px-2
                              py-1
                              text-[8px]
                              font-black
                              text-white
                            "
                          >
                            REMOVE
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <Message error={error} success={success} />

              {currentPlan === "pro" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="submit"
                    name="profileAction"
                    value="done"
                    disabled={saving}
                    className="
                      group
                      w-full
                      rounded-xl
                      border
                      border-slate-300/30
                      bg-slate-200
                      p-5
                      text-black
                      disabled:opacity-50
                      flex
                      items-center
                      justify-between
                      text-[10px]
                      font-black
                      tracking-[0.14em]
                      transition
                      hover:bg-white
                    "
                  >
                    <span>{saving ? "SAVING..." : "DONE & VIEW PROFILE"}</span>
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  <button
                    type="submit"
                    name="profileAction"
                    value="upgrade-gold"
                    disabled={saving}
                    className="
                      group
                      w-full
                      rounded-xl
                      border
                      border-[#f5c451]/50
                      bg-[#f5c451]
                      p-5
                      text-black
                      disabled:opacity-50
                      flex
                      items-center
                      justify-between
                      text-[10px]
                      font-black
                      tracking-[0.14em]
                      transition
                      hover:bg-[#ffe58d]
                    "
                  >
                    <span>{saving ? "SAVING..." : "SAVE & GO GOLD"}</span>
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  name="profileAction"
                  value="done"
                  disabled={saving}
                  className="
                    group
                    w-full
                    bg-purple-600
                    hover:bg-purple-500
                    disabled:opacity-50
                    rounded-xl
                    p-5
                    flex
                    items-center
                    justify-between
                    text-[10px]
                    font-black
                    tracking-[0.14em]
                    transition
                  "
                >
                  <span>
                    {saving
                      ? "SAVING..."
                      : currentPlan === "verified"
                        ? "DONE & VIEW PROFILE"
                        : "UPDATE PROFILE"}
                  </span>

                  <ArrowRight
                    size={15}
                    className="
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </button>
              )}
            </div>
          </form>
        </div>
      </PageShell>
    );
  }

  /* =======================================================
     PLANS SCREEN
  ======================================================= */

  return (
    <PageShell>
      <div
        className="
          max-w-[1250px]
          mx-auto
        "
      >
        <div
          className="
            enter-reveal
            text-center
            max-w-3xl
            mx-auto
          "
        >
          <Eyebrow icon={<Sparkles size={13} />}>PROFILE UPDATED</Eyebrow>

          <h1
            className="
              text-[clamp(3.2rem,7vw,6.5rem)]
              font-black
              uppercase
              tracking-[-0.065em]
              leading-[0.86]
            "
          >
            GET MORE
            <br />
            <span
              className="
                text-purple-500
              "
            >
              VISIBILITY.
            </span>
          </h1>

          <p
            className="
              mt-6
              text-sm
              text-gray-500
              leading-relaxed
            "
          >
            All your information is saved. Now choose what visitors can see.
            Free keeps most details private, Silver unlocks key details, and
            Gold unlocks everything.
          </p>
        </div>

        {/* =============================================
            GOLD ALREADY ACTIVE
        ============================================= */}

        {currentPlan === "verified" ? (
          <div
            className="
              enter-reveal
              mt-12
              max-w-2xl
              mx-auto
              border
              border-[#f5c451]/30
              bg-[#f5c451]/[0.05]
              rounded-[28px]
              p-8
              text-center
            "
          >
            <CheckCircle2
              size={36}
              className="
                text-[#f5c451]
                mx-auto
              "
            />

            <h2
              className="
                mt-5
                text-3xl
                font-black
                uppercase
              "
            >
              GOLD ALREADY ACTIVE
            </h2>

            <p
              className="
                mt-3
                text-sm
                text-gray-500
              "
            >
              Your Gold / Verified membership is already active.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/artists",

                  {
                    state: {
                      refreshDirectory: Date.now(),
                    },
                  },
                )
              }
              className="
                mt-6
                bg-[#f5c451]
                text-black
                rounded-xl
                px-6
                py-4
                text-[9px]
                font-black
                tracking-widest
              "
            >
              VIEW PUBLIC PROFILE →
            </button>
          </div>
        ) : (
          <div
            className={`
              enter-reveal
              mt-12
              grid
              grid-cols-1

              ${
                currentPlan === "pro"
                  ? `
                    max-w-2xl
                    mx-auto
                  `
                  : `
                    lg:grid-cols-3
                  `
              }

              gap-6
            `}
          >
            {PLANS.filter((plan) => {
              /* =================================
                   SILVER ACTIVE:

                   ONLY GOLD UPGRADE SHOWN.

                   Prevent destroying active paid
                   membership with Free.
                ================================= */

              if (currentPlan === "pro") {
                return plan.id === "verified";
              }

              return true;
            }).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                saving={saving}
                silverToGoldUpgrade={
                  plan.id === "verified" && silverToGoldUpgradeAvailable
                }
                onClick={() =>
                  plan.id === "basic"
                    ? chooseFreePlan()
                    : startPaidPlan(plan.id)
                }
              />
            ))}
          </div>
        )}

        <Message error={error} success={success} />
      </div>
    </PageShell>
  );
}

/* =========================================================
   PAGE SHELL
========================================================= */

function PageShell({ children }) {
  return (
    <main
      className="
        min-h-screen
        bg-[#08080a]
        text-white
        pt-32
        pb-24
        px-4
        sm:px-6
        lg:px-10
      "
    >
      {children}
    </main>
  );
}

/* =========================================================
   EYEBROW
========================================================= */

function Eyebrow({ icon, children }) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        text-purple-400
        text-[10px]
        font-mono
        tracking-[0.2em]
        mb-5
      "
    >
      {icon}

      {children}
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,

  type = "text",

  required = true,

  ...props
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          block
          text-[9px]
          font-mono
          text-gray-500
          mb-2
        "
      >
        {label}

        {required ? " *" : ""}
      </span>

      <input
        {...props}
        type={type}
        required={required}
        className="
          w-full
          bg-[#0d0d11]
          border
          border-white/10
          focus:border-purple-500
          rounded-xl
          px-5
          py-4
          outline-none
          text-white
          placeholder:text-gray-700
          transition
        "
      />
    </label>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function TextareaField({
  label,

  required = true,

  ...props
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          block
          text-[9px]
          font-mono
          text-gray-500
          mb-2
        "
      >
        {label}

        {required ? " *" : ""}
      </span>

      <textarea
        {...props}
        required={required}
        rows={5}
        className="
          w-full
          resize-y
          bg-[#0d0d11]
          border
          border-white/10
          focus:border-purple-500
          rounded-xl
          px-5
          py-4
          outline-none
          text-white
          placeholder:text-gray-700
          transition
        "
      />
    </label>
  );
}

/* =========================================================
   MESSAGE
========================================================= */

function Message({
  error,

  success,
}) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={`
        mt-5
        rounded-xl
        border
        px-5
        py-4
        text-sm

        ${
          error
            ? `
              border-red-500/30
              bg-red-500/[0.05]
              text-red-400
            `
            : `
              border-emerald-500/30
              bg-emerald-500/[0.05]
              text-emerald-400
            `
        }
      `}
    >
      {error || success}
    </div>
  );
}

/* =========================================================
   PLAN CARD
========================================================= */

function PlanCard({
  plan,

  saving,

  silverToGoldUpgrade = false,

  onClick,
}) {
  const isBasic = plan.id === "basic";

  const isVerified = plan.id === "verified";

  const theme = isBasic
    ? {
        card: "border-purple-500/30 bg-[#0d0d11]",

        badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",

        title: "text-white",

        price: "text-purple-400",

        button:
          "border-purple-500/40 bg-purple-600 text-white hover:bg-purple-500",

        buttonText: "CONTINUE FREE",
      }
    : isVerified
      ? {
          card: "border-[#d6aa3a] bg-gradient-to-br from-[#d6aa3a]/[0.10] via-[#141108] to-[#0b0b0d] shadow-[0_0_34px_rgba(214,170,58,0.14)]",

          badge: "border-[#e7c45b]/40 bg-[#d6aa3a]/10 text-[#ffe59a]",

          title: "text-[#ffe9a8]",

          price: "text-[#ffe59a]",

          button:
            "border-[#ffe59a]/60 bg-gradient-to-r from-[#b77b15] via-[#f2cf65] to-[#b77b15] text-[#211600]",

          buttonText: "GET GOLD",
        }
      : {
          card: "border-slate-300/80 bg-gradient-to-br from-white/[0.07] via-[#111318] to-[#0b0b0d] shadow-[0_0_28px_rgba(226,232,240,0.10)]",

          badge: "border-white/20 bg-white/[0.06] text-slate-200",

          title: "text-white",

          price: "text-slate-100",

          button:
            "border-white/60 bg-gradient-to-r from-slate-300 via-white to-slate-300 text-black",

          buttonText: "GET SILVER",
        };

  return (
    <article
      className={`
        group
        relative
        flex
        min-h-[470px]
        flex-col
        overflow-hidden
        rounded-[24px]
        border-2
        p-5
        sm:p-6
        transition-all
        duration-500
        hover:-translate-y-1

        ${theme.card}
      `}
    >
      <div
        className={`
          absolute
          right-4
          top-4
          rounded-full
          border
          px-3
          py-1.5
          text-[7px]
          font-black
          tracking-widest

          ${theme.badge}
        `}
      >
        {isBasic ? "FREE" : isVerified ? "GOLD" : "SILVER"}
      </div>

      <p
        className="
          relative
          z-10
          text-[8px]
          font-mono
          tracking-[0.14em]
          text-gray-500
        "
      >
        DIRECTORY MEMBERSHIP
      </p>

      <h2
        className={`
          relative
          z-10
          mt-4
          pr-24
          text-3xl
          sm:text-4xl
          font-black
          uppercase
          leading-[0.92]

          ${theme.title}
        `}
      >
        {plan.name}
      </h2>

      <div
        className="
          relative
          z-10
          mt-5
          flex
          items-end
          gap-2
        "
      >
        <p
          className={`
            text-3xl
            sm:text-4xl
            font-black

            ${theme.price}
          `}
        >
          {silverToGoldUpgrade ? "₹699" : plan.price}
        </p>

        <span
          className="
            pb-1
            text-[7px]
            font-mono
            text-gray-500
          "
        >
          {silverToGoldUpgrade ? "ONE-TIME UPGRADE" : plan.billing}
        </span>
      </div>

      {silverToGoldUpgrade && (
        <div
          className="
            relative
            z-10
            mt-4
            rounded-xl
            border
            border-[#f5c451]/25
            bg-[#f5c451]/[0.06]
            px-4
            py-3
          "
        >
          <p
            className="
              text-[9px]
              font-black
              font-mono
              tracking-wider
              text-[#ffe59a]
            "
          >
            ACTIVE SILVER UPGRADE OFFER
          </p>

          <p
            className="
              mt-1
              text-[10px]
              leading-relaxed
              text-gray-400
            "
          >
            Upgrade your active Silver membership to Gold for ₹699. This special
            upgrade price can be used only once. Future Gold renewal is ₹2,999.
          </p>
        </div>
      )}

      <p
        className="
          relative
          z-10
          mt-4
          border-b
          border-white/10
          pb-4
          text-[11px]
          sm:text-xs
          leading-relaxed
          text-gray-500
        "
      >
        {plan.description}
      </p>

      <div
        className="
          relative
          z-10
          mt-4
          flex-1
          space-y-2.5
        "
      >
        {plan.benefits.map((benefit) => (
          <div
            key={benefit}
            className="
                flex
                items-start
                gap-2.5
                text-[11px]
                sm:text-xs
              "
          >
            <span
              className="
                  mt-[1px]
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/15
                  bg-white/[0.06]
                  text-[8px]
                "
            >
              ✓
            </span>

            <span
              className="
                  text-gray-300
                "
            >
              {benefit}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className={`
          relative
          z-10
          mt-5
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          border
          px-4
          py-3.5
          text-[9px]
          font-black
          tracking-widest
          transition-all
          disabled:opacity-50

          ${theme.button}
        `}
      >
        <span>
          {saving
            ? "PLEASE WAIT..."
            : silverToGoldUpgrade
              ? "UPGRADE TO GOLD • ₹699"
              : theme.buttonText}
        </span>

        {!saving && (
          <ArrowRight
            size={14}
            className="
              transition-transform
              group-hover:translate-x-1
            "
          />
        )}
      </button>
    </article>
  );
}
