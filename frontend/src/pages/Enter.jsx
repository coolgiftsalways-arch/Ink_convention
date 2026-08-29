import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowRight, Sparkles, MapPin, Users } from "lucide-react";

import gsap from "gsap";

/* =========================================================
   STORAGE
========================================================= */

const PROFILE_KEY = "inkConventionUserProfiles";

const DIRECTORY_KEY = "inkConventionDirectoryArtists";

const CURRENT_USER_KEY = "inkConventionCurrentUserId";

const PENDING_MEMBERSHIP_KEY = "inkConventionPendingMembership";

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  studio: "",
  experience: "",
  instagram: "",
};

/* =========================================================
   NEW DIRECTORY MEMBERSHIPS

   FREE
   PRO ₹1,499 / YEAR
   VERIFIED ₹2,999 / YEAR
========================================================= */

const plans = [
  {
    id: "free",

    name: "LIFETIME FREE LISTING",

    shortName: "FREE",

    price: "₹0",

    amount: 0,

    billing: "LIFETIME",

    priority: 1,

    description:
      "Permanent entry in the Ink Convention directory. This is the primary lead-generation hook, while public contact details remain masked to encourage upgrades.",

    benefits: [
      "Permanent directory entry",
      "Profile photo",
      "Artist / studio name",
      "City & state displayed",
      "Studio name displayed",
      "Contact details remain masked",
      "Primary lead-generation listing",
      "Upgrade anytime",
    ],
  },

  {
    id: "pro",

    name: "PRO LISTING",

    shortName: "PRO",

    price: "₹1,499",

    amount: 1499,

    billing: "PER YEAR",

    priority: 2,

    description:
      "Upgrade your profile with city-wise search visibility, a Recommended tag and unmasked direct contact information for consumer booking.",

    benefits: [
      "Everything in Lifetime Free",
      "City-wise search visibility",
      "Recommended profile tag",
      "Phone number visible",
      "Email visible",
      "Instagram visible",
      "Direct consumer booking contact",
      "Higher directory visibility",
    ],
  },

  {
    id: "verified",

    name: "VERIFIED SPOTLIGHT",

    shortName: "VERIFIED",

    price: "₹2,999",

    amount: 2999,

    billing: "PER YEAR",

    priority: 3,

    description:
      "Premium tier with a dedicated standalone URL profile page, Hall of Fame inclusion, priority search ranking and maximum digital visibility.",

    benefits: [
      "Everything in Pro",
      "Verified Spotlight badge",
      "Dedicated standalone profile URL",
      "Hall of Fame inclusion",
      "Priority search ranking",
      "Featured Spotlight placement",
      "Maximum digital visibility",
      "Full direct contact visibility",
    ],
  },
];

/* =========================================================
   STORAGE HELPERS
========================================================= */

const getStoredArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");

    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error("Storage error:", error);

    return [];
  }
};

/* =========================================================
   OLD PLAN MIGRATION

   SILVER -> PRO
   GOLD   -> VERIFIED
========================================================= */

const normalizePlan = (plan) => {
  const value = String(plan || "free").toLowerCase();

  if (value === "gold") {
    return "verified";
  }

  if (value === "silver") {
    return "pro";
  }

  if (value === "verified") {
    return "verified";
  }

  if (value === "pro") {
    return "pro";
  }

  return "free";
};

/* =========================================================
   PLAN PRIORITY
========================================================= */

const getPlanPriority = (plan) => {
  const normalized = normalizePlan(plan);

  if (normalized === "verified") {
    return 3;
  }

  if (normalized === "pro") {
    return 2;
  }

  return 1;
};

/* =========================================================
   FIND PLAN
========================================================= */

const getPlanById = (id) => {
  const normalized = normalizePlan(id);

  return plans.find((plan) => plan.id === normalized) || plans[0];
};

/* =========================================================
   VERIFIED PROFILE URL
========================================================= */

const createProfileSlug = (name, id) => {
  const safeName = String(name || "artist")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeName || "artist"}-${id}`;
};

/* =========================================================
   NORMALIZE SAVED PROFILES
========================================================= */

const migrateProfiles = () => {
  const profiles = getStoredArray(PROFILE_KEY);

  let changed = false;

  const migrated = profiles.map((profile) => {
    const newPlan = normalizePlan(profile.plan);

    if (newPlan !== profile.plan) {
      changed = true;
    }

    return {
      ...profile,

      plan: newPlan,
    };
  });

  if (changed) {
    try {
      localStorage.setItem(
        PROFILE_KEY,

        JSON.stringify(migrated),
      );
    } catch (error) {
      console.error(error);
    }
  }

  return migrated;
};

/* =========================================================
   MAIN
========================================================= */

export default function Enter() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("loading");

  const [error, setError] = useState("");

  const [currentProfile, setCurrentProfile] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [profileImage, setProfileImage] = useState("");

  /* =========================================================
     CHECK SAVED PROFILE
  ========================================================= */

  useEffect(() => {
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);

    const profiles = migrateProfiles();

    if (currentUserId) {
      const found = profiles.find(
        (profile) => String(profile.id) === String(currentUserId),
      );

      if (found) {
        setCurrentProfile(found);

        setScreen("profile");

        return;
      }
    }

    setScreen("form");
  }, []);

  /* =========================================================
     PAGE ANIMATION
  ========================================================= */

  useEffect(() => {
    if (screen === "loading") {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".enter-reveal",

        {
          opacity: 0,

          y: 25,
        },

        {
          opacity: 1,

          y: 0,

          duration: 0.7,

          stagger: 0.05,

          ease: "power3.out",
        },
      );
    });

    return () => {
      ctx.revert();
    };
  }, [screen]);

  /* =========================================================
     INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: value,
    }));

    setError("");
  };

  /* =========================================================
     COMPRESS PROFILE IMAGE
  ========================================================= */

  const compressImage = (file, maxSize = 700, quality = 0.65) => {
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

          context.drawImage(image, 0, 0, width, height);

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

        image.src = reader.result;
      };

      reader.onerror = () => {
        reject(new Error("Unable to read image."));
      };

      reader.readAsDataURL(file);
    });
  };

  /* =========================================================
     PROFILE IMAGE
  ========================================================= */

  const handleProfileImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");

      return;
    }

    try {
      const image = await compressImage(file);

      setProfileImage(image);

      setError("");
    } catch (imageError) {
      console.error(imageError);

      setError("Unable to load profile image.");
    }
  };

  /* =========================================================
     VALIDATE FORM
  ========================================================= */

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your name.");

      return false;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");

      return false;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");

      return false;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city.");

      return false;
    }

    if (!formData.state.trim()) {
      setError("Please enter your state.");

      return false;
    }

    if (!formData.studio.trim()) {
      setError("Please enter your studio.");

      return false;
    }

    if (!formData.experience.trim()) {
      setError("Please enter your experience.");

      return false;
    }

    if (!formData.instagram.trim()) {
      setError("Please enter your Instagram username.");

      return false;
    }

    if (!profileImage) {
      setError("Please upload your profile photo.");

      return false;
    }

    return true;
  };

  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    setScreen("choose-plan");

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  /* =========================================================
     BUILD PROFILE FROM FORM
  ========================================================= */

  const buildProfileFromForm = (selectedPlan) => {
    const now = new Date().toISOString();

    return {
      id: Date.now(),

      plan: normalizePlan(selectedPlan),

      name: formData.name.trim(),

      phone: formData.phone.trim(),

      email: formData.email.trim(),

      city: formData.city.trim(),

      state: formData.state.trim(),

      studio: formData.studio.trim(),

      experience: formData.experience.trim(),

      instagram: formData.instagram.trim(),

      profileImage,

      createdAt: now,

      updatedAt: now,

      membershipStartedAt: selectedPlan === "free" ? now : null,

      membershipExpiresAt: null,

      paymentStatus: selectedPlan === "free" ? "not_required" : "pending",
    };
  };

  /* =========================================================
     CREATE PUBLIC DIRECTORY ARTIST

     FREE:
     - Name
     - Photo
     - City
     - State
     - Studio
     - Contact hidden

     PRO:
     - Full contact
     - SEO boost
     - Analytics
     - Higher priority

     VERIFIED:
     - Everything Pro
     - Verified
     - Spotlight
     - Highest priority
  ========================================================= */

  const buildDirectoryArtist = (profile) => {
    const plan = normalizePlan(profile.plan);

    const common = {
      id: profile.id,

      plan,

      name: profile.name,

      profileImage: profile.profileImage || "",

      city: profile.city,

      state: profile.state,

      studio: profile.studio,

      year: "2026",

      createdAt: profile.createdAt,

      updatedAt: new Date().toISOString(),
    };

    /* =====================================================
       LIFETIME FREE LISTING

       Permanent directory entry.
       Contact details stay masked.
       Acts as the lead-generation entry tier.
    ===================================================== */

    if (plan === "free") {
      return {
        ...common,

        contactMasked: true,

        phoneVisible: false,

        emailVisible: false,

        instagramVisible: false,

        consumerBookingEnabled: false,

        citySearchVisible: false,

        recommended: false,

        verified: false,

        spotlight: false,

        standaloneProfile: false,

        standaloneProfileUrl: "",

        hallOfFameEligible: false,

        prioritySearch: false,

        maximumDigitalVisibility: false,

        leadGenerationListing: true,

        directoryPriority: 1,
      };
    }

    /* =====================================================
       PRO LISTING

       City-wise visibility + Recommended tag.
       Direct contact is unmasked for consumer booking.
    ===================================================== */

    if (plan === "pro") {
      return {
        ...common,

        phone: profile.phone,

        email: profile.email,

        experience: profile.experience,

        instagram: profile.instagram,

        contactMasked: false,

        phoneVisible: true,

        emailVisible: true,

        instagramVisible: true,

        consumerBookingEnabled: true,

        citySearchVisible: true,

        recommended: true,

        verified: false,

        spotlight: false,

        standaloneProfile: false,

        standaloneProfileUrl: "",

        hallOfFameEligible: false,

        prioritySearch: false,

        maximumDigitalVisibility: false,

        leadGenerationListing: false,

        directoryPriority: 2,
      };
    }

    /* =====================================================
       VERIFIED SPOTLIGHT

       Dedicated URL + Hall of Fame + priority ranking +
       maximum digital visibility.
    ===================================================== */

    const standaloneProfileUrl = `/artist/${createProfileSlug(
      profile.name,
      profile.id,
    )}`;

    return {
      ...common,

      phone: profile.phone,

      email: profile.email,

      experience: profile.experience,

      instagram: profile.instagram,

      contactMasked: false,

      phoneVisible: true,

      emailVisible: true,

      instagramVisible: true,

      consumerBookingEnabled: true,

      citySearchVisible: true,

      recommended: true,

      verified: true,

      spotlight: true,

      standaloneProfile: true,

      standaloneProfileUrl,

      hallOfFameEligible: true,

      prioritySearch: true,

      maximumDigitalVisibility: true,

      leadGenerationListing: false,

      directoryPriority: 3,
    };
  };

  /* =========================================================
     UPDATE DIRECTORY
  ========================================================= */

  const updateDirectory = (profile) => {
    const directory = getStoredArray(DIRECTORY_KEY);

    const publicArtist = buildDirectoryArtist(profile);

    const index = directory.findIndex(
      (artist) => String(artist.id) === String(profile.id),
    );

    let updated;

    if (index >= 0) {
      updated = [...directory];

      updated[index] = publicArtist;
    } else {
      updated = [publicArtist, ...directory];
    }

    localStorage.setItem(
      DIRECTORY_KEY,

      JSON.stringify(updated),
    );
  };

  /* =========================================================
     SAVE FREE PROFILE

     FREE NEEDS NO PAYMENT
  ========================================================= */

  const createFreeProfile = () => {
    const profiles = migrateProfiles();

    const newProfile = buildProfileFromForm("free");

    try {
      localStorage.setItem(
        PROFILE_KEY,

        JSON.stringify([newProfile, ...profiles]),
      );

      localStorage.setItem(
        CURRENT_USER_KEY,

        String(newProfile.id),
      );

      localStorage.removeItem(PENDING_MEMBERSHIP_KEY);

      updateDirectory(newProfile);

      setCurrentProfile(newProfile);

      navigate("/artists", {
        state: {
          newArtistId: newProfile.id,
        },
      });
    } catch (saveError) {
      console.error(saveError);

      setError("Unable to save your profile.");
    }
  };

  /* =========================================================
     START PAID MEMBERSHIP CHECKOUT

     IMPORTANT:
     THIS DOES NOT ACTIVATE PRO/VERIFIED YET.

     PAYMENT PAGE MUST VERIFY PAYMENT FIRST.
  ========================================================= */

  const startPaidMembership = (selectedPlan, existingProfile = null) => {
    const plan = getPlanById(selectedPlan);

    if (plan.id === "free") {
      createFreeProfile();

      return;
    }

    const profileDraft = existingProfile
      ? {
          ...existingProfile,

          plan: plan.id,

          updatedAt: new Date().toISOString(),

          paymentStatus: "pending",
        }
      : buildProfileFromForm(plan.id);

    const pendingCheckout = {
      source: "directory-membership",

      action: existingProfile ? "upgrade" : "create",

      planId: plan.id,

      planName: plan.name,

      amount: plan.amount,

      billing: "yearly",

      profileId: existingProfile?.id || profileDraft.id,

      previousPlan: existingProfile?.plan || null,

      profileDraft,

      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        PENDING_MEMBERSHIP_KEY,

        JSON.stringify(pendingCheckout),
      );

      navigate("/payment", {
        state: {
          source: "directory-membership",

          action: pendingCheckout.action,

          planId: plan.id,

          planName: plan.name,

          amount: plan.amount,

          billing: "yearly",

          profileDraft,
        },
      });
    } catch (paymentError) {
      console.error(paymentError);

      setError("Unable to start payment.");
    }
  };

  /* =========================================================
     PLAN SELECT
  ========================================================= */

  const handlePlanSelect = (selectedPlan) => {
    const normalized = normalizePlan(selectedPlan);

    if (normalized === "free") {
      createFreeProfile();

      return;
    }

    startPaidMembership(normalized);
  };

  /* =========================================================
     UPGRADE
  ========================================================= */

  const upgradePlan = (nextPlan) => {
    if (!currentProfile) {
      return;
    }

    const normalizedNext = normalizePlan(nextPlan);

    const oldPriority = getPlanPriority(currentProfile.plan);

    const nextPriority = getPlanPriority(normalizedNext);

    if (nextPriority <= oldPriority) {
      return;
    }

    startPaidMembership(
      normalizedNext,

      currentProfile,
    );
  };

  /* =========================================================
     LOGOUT

     DOES NOT DELETE PROFILE.
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);

    localStorage.removeItem("inkConventionLoggedUser");

    setCurrentProfile(null);

    setFormData(emptyForm);

    setProfileImage("");

    setError("");

    navigate("/client-login", {
      replace: true,
    });
  };

  /* =========================================================
     CURRENT NORMALIZED PLAN
  ========================================================= */

  const normalizedCurrentPlan = normalizePlan(currentProfile?.plan);

  const currentPlan = useMemo(
    () => plans.find((plan) => plan.id === normalizedCurrentPlan),

    [normalizedCurrentPlan],
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (screen === "loading") {
    return <main className="min-h-screen bg-[#08080a]" />;
  }

  /* =========================================================
     SAVED PROFILE
  ========================================================= */

  if (screen === "profile" && currentProfile) {
    const isFree = normalizedCurrentPlan === "free";

    const isPro = normalizedCurrentPlan === "pro";

    const isVerified = normalizedCurrentPlan === "verified";

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
        <div
          className="
            max-w-[1400px]
            mx-auto
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              enter-reveal

              border-b
              border-white/10

              pb-12

              flex
              flex-col
              sm:flex-row

              sm:items-end

              justify-between

              gap-8
            "
          >
            <div>
              <p
                className="
                  text-purple-400

                  text-[10px]

                  font-mono

                  tracking-[0.2em]

                  mb-5
                "
              >
                MY DIRECTORY PROFILE
              </p>

              <h1
                className="
                  text-[clamp(3.5rem,7vw,7rem)]

                  font-black

                  uppercase

                  tracking-[-0.07em]

                  leading-[0.85]
                "
              >
                WELCOME
                <br />
                <span className="text-purple-500">BACK.</span>
              </h1>
            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                shrink-0

                border
                border-red-500/30

                bg-red-500/[0.05]

                hover:bg-red-500

                hover:text-white

                text-red-400

                px-7
                py-4

                text-[10px]

                font-black

                tracking-[0.16em]

                uppercase

                transition-all

                duration-300
              "
            >
              LOGOUT →
            </button>
          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <div
            className="
              grid

              grid-cols-1

              lg:grid-cols-[330px_1fr]

              gap-8
              lg:gap-14

              mt-12
            "
          >
            {/* PHOTO */}

            <div className="enter-reveal">
              <div
                className={`
                  relative

                  aspect-square

                  rounded-[30px]

                  overflow-hidden

                  bg-[#0d0d11]

                  border-2

                  ${
                    isVerified
                      ? `
                        border-purple-400

                        shadow-[0_0_50px_rgba(168,85,247,0.16)]
                      `
                      : isPro
                        ? "border-slate-300"
                        : "border-white/10"
                  }
                `}
              >
                {currentProfile.profileImage ? (
                  <img
                    src={currentProfile.profileImage}
                    alt={currentProfile.name}
                    className="
                      w-full
                      h-full

                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      w-full
                      h-full

                      flex

                      items-center
                      justify-center

                      bg-[#0d0d11]
                    "
                  >
                    <Users size={40} className="text-gray-700" />
                  </div>
                )}

                {isVerified && (
                  <div
                    className="
                      absolute

                      top-4
                      left-4

                      bg-purple-600

                      border
                      border-purple-300/30

                      px-4
                      py-2

                      text-[8px]

                      font-black

                      tracking-[0.15em]
                    "
                  >
                    ✓ VERIFIED
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                PROFILE INFORMATION
            ================================================= */}

            <div
              className="
                enter-reveal

                bg-[#0d0d11]

                border
                border-white/10

                rounded-[30px]

                p-6
                sm:p-8
              "
            >
              <div
                className="
                  flex

                  flex-col
                  sm:flex-row

                  sm:items-start

                  justify-between

                  gap-5

                  pb-7

                  border-b
                  border-white/10
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]

                      font-mono

                      text-gray-600

                      mb-2
                    "
                  >
                    DIRECTORY PROFILE
                  </p>

                  <h2
                    className="
                      text-3xl
                      sm:text-5xl

                      font-black

                      uppercase
                    "
                  >
                    {currentProfile.name}
                  </h2>

                  <div
                    className="
                      flex

                      items-center

                      gap-2

                      mt-4

                      text-gray-400
                    "
                  >
                    <MapPin size={14} className="text-purple-500" />

                    <span>
                      {currentProfile.city}, {currentProfile.state}
                    </span>
                  </div>
                </div>

                {/* PLAN BADGE */}

                <div
                  className={`
                    px-5
                    py-3

                    text-[10px]

                    font-black

                    tracking-[0.15em]

                    ${
                      isVerified
                        ? `
                          bg-purple-600

                          text-white

                          shadow-[0_0_25px_rgba(168,85,247,0.30)]
                        `
                        : isPro
                          ? `
                            bg-slate-200

                            text-black
                          `
                          : `
                            bg-white/10

                            text-white

                            border
                            border-white/10
                          `
                    }
                  `}
                >
                  {currentPlan?.shortName}
                </div>
              </div>

              {/* =================================================
                  PRIVATE SAVED DETAILS

                  User can see everything here even on Free.
              ================================================= */}

              <div
                className="
                  grid

                  grid-cols-1
                  sm:grid-cols-2

                  gap-6

                  mt-8
                "
              >
                <ProfileInfo label="PHONE" value={currentProfile.phone} />

                <ProfileInfo label="EMAIL" value={currentProfile.email} />

                <ProfileInfo label="CITY" value={currentProfile.city} />

                <ProfileInfo label="STATE" value={currentProfile.state} />

                <ProfileInfo label="STUDIO" value={currentProfile.studio} />

                <ProfileInfo
                  label="EXPERIENCE"
                  value={currentProfile.experience}
                />

                <ProfileInfo
                  label="INSTAGRAM"
                  value={currentProfile.instagram}
                />

                <ProfileInfo label="MEMBERSHIP" value={currentPlan?.name} />
              </div>

              {/* FREE MASK MESSAGE */}

              {isFree && (
                <div
                  className="
                    mt-8

                    border
                    border-purple-500/20

                    bg-purple-500/[0.04]

                    rounded-2xl

                    p-5
                  "
                >
                  <p
                    className="
                      text-[9px]

                      font-mono

                      tracking-[0.16em]

                      text-purple-400
                    "
                  >
                    FREE LISTING PRIVACY
                  </p>

                  <p
                    className="
                      mt-2

                      text-sm

                      text-gray-500

                      leading-relaxed
                    "
                  >
                    Your permanent Lifetime Free listing is active. Your phone,
                    email and Instagram remain masked on the public directory.
                    Upgrade to Pro to unlock direct consumer booking contact.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate("/artists")}
                className="
                  mt-8

                  text-[10px]

                  font-black

                  tracking-widest

                  text-purple-400

                  hover:text-purple-300

                  transition
                "
              >
                VIEW MY DIRECTORY CARD →
              </button>
            </div>
          </div>

          {/* =================================================
              UPGRADE
          ================================================= */}

          <section
            className="
              enter-reveal

              mt-16

              pt-12

              border-t
              border-white/10
            "
          >
            <p
              className="
                text-[9px]

                text-purple-400

                font-mono

                tracking-[0.2em]

                mb-3
              "
            >
              DIRECTORY MEMBERSHIP
            </p>

            <h2
              className="
                text-3xl
                sm:text-5xl

                font-black

                uppercase
              "
            >
              {isVerified
                ? "YOUR SPOTLIGHT IS ACTIVE"
                : "GET MORE CLIENT VISIBILITY"}
            </h2>

            <p
              className="
                mt-4

                max-w-2xl

                text-sm

                text-gray-500

                leading-relaxed
              "
            >
              Upgrade to Pro for city-wise search visibility, a Recommended tag
              and direct consumer booking contact. Choose Verified Spotlight for
              a standalone profile URL, Hall of Fame inclusion and priority
              ranking.
            </p>

            {/* ===============================================
                FREE -> PRO / VERIFIED
            =============================================== */}

            {isFree && (
              <div
                className="
                  grid

                  grid-cols-1
                  md:grid-cols-2

                  gap-5

                  mt-8
                "
              >
                <UpgradeCard
                  name="PRO LISTING"
                  price="₹1,499"
                  billing="PER YEAR"
                  type="pro"
                  description="Get city-wise search visibility, a Recommended tag and unmasked direct contact information for consumer booking."
                  benefits={[
                    "Everything in Lifetime Free",
                    "City-Wise Search Visibility",
                    "Recommended Tag",
                    "Phone Number Visible",
                    "Email Visible",
                    "Instagram Visible",
                    "Direct Consumer Booking Contact",
                    "Higher Directory Visibility",
                  ]}
                  onClick={() => upgradePlan("pro")}
                />

                <UpgradeCard
                  name="VERIFIED SPOTLIGHT"
                  price="₹2,999"
                  billing="PER YEAR"
                  type="verified"
                  description="Premium visibility with a standalone profile URL, Hall of Fame inclusion, priority search ranking and maximum digital visibility."
                  benefits={[
                    "Everything in Pro",
                    "Verified Spotlight Badge",
                    "Dedicated Standalone Profile URL",
                    "Hall of Fame Inclusion",
                    "Priority Search Ranking",
                    "Featured Spotlight Placement",
                    "Maximum Digital Visibility",
                    "Full Direct Contact Visibility",
                  ]}
                  onClick={() => upgradePlan("verified")}
                />
              </div>
            )}

            {/* ===============================================
                PRO -> VERIFIED
            =============================================== */}

            {isPro && (
              <div
                className="
                  max-w-2xl

                  mt-8
                "
              >
                <UpgradeCard
                  name="VERIFIED SPOTLIGHT"
                  price="₹2,999"
                  billing="PER YEAR"
                  type="verified"
                  description="Upgrade from Pro to a standalone profile URL, Hall of Fame inclusion, priority search ranking and maximum digital visibility."
                  benefits={[
                    "Everything in Pro",
                    "Verified Spotlight Badge",
                    "Dedicated Standalone Profile URL",
                    "Hall of Fame Inclusion",
                    "Priority Search Ranking",
                    "Featured Spotlight Placement",
                    "Maximum Digital Visibility",
                  ]}
                  onClick={() => upgradePlan("verified")}
                />
              </div>
            )}

            {/* ===============================================
                VERIFIED
            =============================================== */}

            {isVerified && (
              <div
                className="
                  mt-8

                  border
                  border-purple-400/30

                  bg-purple-500/[0.05]

                  rounded-[24px]

                  p-7
                "
              >
                <p
                  className="
                    text-purple-400

                    font-black
                  "
                >
                  ✓ YOUR VERIFIED SPOTLIGHT PROFILE IS ACTIVE
                </p>

                <p
                  className="
                    text-sm

                    text-gray-500

                    mt-2

                    leading-relaxed
                  "
                >
                  Your premium tier is active with priority search ranking,
                  maximum digital visibility, Hall of Fame eligibility and a
                  dedicated standalone profile URL.
                </p>
              </div>
            )}

            {error && (
              <p
                className="
                  mt-5

                  text-red-400

                  text-sm
                "
              >
                {error}
              </p>
            )}
          </section>
        </div>
      </main>
    );
  }

  /* =========================================================
     REGISTRATION FORM
  ========================================================= */

  if (screen === "form") {
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
        <div
          className="
            max-w-[1400px]

            mx-auto
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              enter-reveal

              mb-12
            "
          >
            <div
              className="
                flex

                items-center

                gap-2

                text-purple-400

                text-[10px]

                font-mono

                tracking-[0.2em]

                mb-4
              "
            >
              <Sparkles size={13} />
              CLAIM YOUR DIRECTORY LISTING
            </div>

            <h1
              className="
                text-[clamp(3.5rem,7vw,7rem)]

                font-black

                uppercase

                tracking-[-0.07em]

                leading-[0.85]
              "
            >
              GET FOUND.
              <br />
              <span className="text-purple-500">GET BOOKED.</span>
            </h1>

            <p
              className="
                mt-6

                max-w-2xl

                text-gray-500

                text-sm

                leading-relaxed
              "
            >
              Create your tattoo artist or studio profile once. Start with a
              permanent Lifetime Free listing, move to Pro for city-wise
              discovery and direct booking contact, or choose Verified Spotlight
              for maximum digital visibility.
            </p>

            {/* SMALL BENEFITS */}

            <div
              className="
                flex

                flex-wrap

                gap-3

                mt-6
              "
            >
              {[
                "LIFETIME FREE OPTION",
                "INDIA-WIDE DIRECTORY",
                "UPGRADE ANYTIME",
              ].map((item) => (
                <span
                  key={item}
                  className="
                      border
                      border-white/10

                      bg-white/[0.03]

                      rounded-full

                      px-4
                      py-2

                      text-[8px]

                      font-mono

                      tracking-[0.12em]

                      text-gray-500
                    "
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="
              enter-reveal

              grid

              grid-cols-1

              lg:grid-cols-[340px_1fr]

              gap-10
              lg:gap-16
            "
          >
            {/* PHOTO */}

            <div>
              <p
                className="
                  text-[9px]

                  font-mono

                  text-gray-500

                  mb-3
                "
              >
                PROFILE PHOTO *
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
                      size={30}
                      className="
                        text-purple-500

                        mb-4
                      "
                    />

                    <p
                      className="
                        font-black

                        text-lg
                      "
                    >
                      UPLOAD PHOTO
                    </p>

                    <p
                      className="
                        text-xs

                        text-gray-600

                        mt-2
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

              <div
                className="
                  mt-4

                  p-4

                  border
                  border-white/[0.06]

                  bg-white/[0.02]
                "
              >
                <p
                  className="
                    text-[8px]

                    font-mono

                    text-purple-400

                    tracking-[0.12em]
                  "
                >
                  YOUR DETAILS STAY SAVED
                </p>

                <p
                  className="
                    mt-2

                    text-[11px]

                    text-gray-600

                    leading-relaxed
                  "
                >
                  Free listings keep sensitive contact details hidden on the
                  public directory.
                </p>
              </div>
            </div>

            {/* DETAILS */}

            <div className="space-y-5">
              <InputField
                label="ARTIST / OWNER NAME"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />

              <InputField
                label="PHONE"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
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

              <InputField
                label="EXPERIENCE"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="5 Years"
              />

              <InputField
                label="INSTAGRAM"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@username"
              />

              {error && (
                <div
                  className="
                    border-l-2
                    border-red-500

                    bg-red-500/[0.05]

                    px-5
                    py-4

                    text-red-400

                    text-sm
                  "
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="
                  group

                  w-full

                  bg-purple-600

                  hover:bg-purple-500

                  p-5

                  flex

                  items-center
                  justify-between

                  font-black

                  text-[11px]

                  tracking-[0.15em]

                  transition
                "
              >
                VIEW LISTING OPTIONS
                <ArrowRight
                  size={16}
                  className="
                    transition-transform

                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  /* =========================================================
     CHOOSE MEMBERSHIP
  ========================================================= */

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
      <div
        className="
          max-w-[1400px]

          mx-auto
        "
      >
        <button
          type="button"
          onClick={() => setScreen("form")}
          className="
            text-[10px]

            font-mono

            text-gray-500

            mb-10

            hover:text-white

            transition
          "
        >
          ← EDIT DETAILS
        </button>

        <div className="enter-reveal">
          <p
            className="
              text-purple-400

              text-[10px]

              font-mono

              tracking-[0.2em]

              mb-4
            "
          >
            DIRECTORY MEMBERSHIP
          </p>

          <h1
            className="
              text-[clamp(3.5rem,7vw,7rem)]

              font-black

              uppercase

              tracking-[-0.07em]

              leading-[0.85]
            "
          >
            CHOOSE YOUR
            <br />
            <span className="text-purple-500">VISIBILITY.</span>
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
            Start with a permanent free directory entry, upgrade to Pro for
            city-wise search visibility and direct booking contact, or choose
            Verified Spotlight for a standalone URL, Hall of Fame inclusion and
            priority search ranking.
          </p>
        </div>

        {/* =================================================
            PLAN CARDS
        ================================================= */}

        <div
          className="
            grid

            grid-cols-1
            lg:grid-cols-3

            gap-5

            mt-12
          "
        >
          {plans.map((plan) => (
            <MembershipCard
              key={plan.id}
              plan={plan}
              onClick={() => handlePlanSelect(plan.id)}
            />
          ))}
        </div>

        {/* PAYMENT INFO */}

        <div
          className="
            mt-7

            border
            border-white/[0.06]

            bg-white/[0.02]

            p-5

            flex

            flex-col
            md:flex-row

            md:items-center

            justify-between

            gap-4
          "
        >
          <div>
            <p
              className="
                text-[9px]

                font-black

                tracking-[0.14em]
              "
            >
              FREE REALLY MEANS FREE.
            </p>

            <p
              className="
                mt-2

                text-xs

                text-gray-600
              "
            >
              No payment is required for the permanent Lifetime Free listing.
            </p>
          </div>

          <p
            className="
              text-[9px]

              font-mono

              text-purple-400

              tracking-[0.12em]
            "
          >
            PRO & VERIFIED ARE BILLED ANNUALLY
          </p>
        </div>

        {error && (
          <p
            className="
              mt-5

              text-red-400
            "
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({ label, type = "text", ...props }) {
  return (
    <div>
      <p
        className="
          text-[9px]

          font-mono

          text-gray-500

          mb-2
        "
      >
        {label} *
      </p>

      <input
        {...props}
        type={type}
        className="
          w-full

          bg-[#0d0d11]

          border
          border-white/10

          focus:border-purple-500

          px-5
          py-4

          outline-none

          text-white

          placeholder:text-gray-700

          transition
        "
      />
    </div>
  );
}

/* =========================================================
   MEMBERSHIP CARD
========================================================= */

function MembershipCard({ plan, onClick }) {
  const isVerified = plan.id === "verified";

  const isPro = plan.id === "pro";

  const isFree = plan.id === "free";

  return (
    <article
      className={`
        relative

        p-7

        min-h-[610px]

        flex
        flex-col

        overflow-hidden

        transition-all

        duration-500

        hover:-translate-y-2

        ${
          isVerified
            ? `
              border-2

              border-purple-400

              bg-gradient-to-br

              from-purple-500/[0.10]

              via-[#100b17]

              to-[#0d0d11]

              shadow-[0_0_50px_rgba(168,85,247,0.12)]
            `
            : isPro
              ? `
                border-2

                border-slate-300

                bg-gradient-to-br

                from-white/[0.05]

                to-[#0d0d11]
              `
              : `
                border

                border-white/10

                bg-[#0d0d11]
              `
        }
      `}
    >
      {/* POPULAR BADGE */}

      {isPro && (
        <div
          className="
            absolute

            top-5
            right-5

            bg-white

            text-black

            px-3
            py-1.5

            text-[7px]

            font-black

            tracking-[0.12em]
          "
        >
          POPULAR
        </div>
      )}

      {isVerified && (
        <div
          className="
            absolute

            top-5
            right-5

            bg-purple-600

            text-white

            px-3
            py-1.5

            text-[7px]

            font-black

            tracking-[0.12em]
          "
        >
          HIGHEST VISIBILITY
        </div>
      )}

      <p
        className={`
          text-[9px]

          font-mono

          tracking-[0.12em]

          ${
            isVerified
              ? "text-purple-400"
              : isPro
                ? "text-slate-300"
                : "text-gray-600"
          }
        `}
      >
        DIRECTORY MEMBERSHIP
      </p>

      <h2
        className="
          text-4xl
          xl:text-5xl

          font-black

          uppercase

          tracking-[-0.04em]

          leading-[0.95]

          mt-5
        "
      >
        {plan.name}
      </h2>

      <div
        className="
          flex

          items-end

          gap-3

          mt-6
        "
      >
        <p
          className={`
            text-4xl
            xl:text-5xl

            font-black

            ${isVerified ? "text-purple-400" : "text-white"}
          `}
        >
          {plan.price}
        </p>

        <p
          className="
            text-[8px]

            font-mono

            text-gray-600

            pb-1
          "
        >
          {plan.billing}
        </p>
      </div>

      <p
        className="
          text-gray-500

          text-sm

          leading-relaxed

          mt-5

          pb-6

          border-b
          border-white/10
        "
      >
        {plan.description}
      </p>

      {/* BENEFITS */}

      <div
        className="
          space-y-3

          mt-6

          flex-1
        "
      >
        {plan.benefits.map((benefit) => (
          <div
            key={benefit}
            className="
                flex

                gap-3

                items-start

                text-sm

                text-gray-300
              "
          >
            <span
              className={`
                  w-5
                  h-5

                  rounded-full

                  shrink-0

                  flex

                  items-center
                  justify-center

                  text-[9px]

                  ${
                    isVerified
                      ? `
                        bg-purple-500/10

                        text-purple-400
                      `
                      : isPro
                        ? `
                          bg-white/10

                          text-slate-200
                        `
                        : `
                          bg-purple-500/10

                          text-purple-400
                        `
                  }
                `}
            >
              ✓
            </span>

            <span>{benefit}</span>
          </div>
        ))}
      </div>

      {/* BUTTON */}

      <button
        type="button"
        onClick={onClick}
        className={`
          group

          w-full

          mt-8

          p-4

          flex

          items-center

          justify-between

          font-black

          text-[10px]

          tracking-widest

          transition-all

          ${
            isVerified
              ? `
                bg-purple-600

                hover:bg-purple-500

                text-white
              `
              : isPro
                ? `
                  bg-white

                  hover:bg-slate-200

                  text-black
                `
                : `
                  border

                  border-white/10

                  bg-white/[0.04]

                  hover:bg-purple-600

                  hover:border-purple-600

                  text-white
                `
          }
        `}
      >
        <span>
          {isFree
            ? "CLAIM FREE LISTING"
            : isPro
              ? "GET PRO LISTING"
              : "GET VERIFIED"}
        </span>

        <ArrowRight
          size={15}
          className="
            transition-transform

            group-hover:translate-x-1
          "
        />
      </button>

      {!isFree && (
        <p
          className="
            text-center

            text-[7px]

            text-gray-700

            font-mono

            tracking-[0.1em]

            mt-3
          "
        >
          CONTINUES TO SECURE PAYMENT
        </p>
      )}
    </article>
  );
}

/* =========================================================
   PROFILE INFO
========================================================= */

function ProfileInfo({ label, value }) {
  return (
    <div>
      <p
        className="
          text-[8px]

          font-mono

          text-gray-600

          mb-1
        "
      >
        {label}
      </p>

      <p
        className="
          text-sm

          text-gray-300

          break-words
        "
      >
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   UPGRADE CARD
========================================================= */

function UpgradeCard({
  name,
  price,
  billing,
  description,
  type,
  benefits,
  onClick,
}) {
  const isVerified = type === "verified";

  return (
    <article
      className={`
        p-7

        border-2

        rounded-[24px]

        ${
          isVerified
            ? `
              border-purple-400

              bg-purple-500/[0.05]

              shadow-[0_0_40px_rgba(168,85,247,0.08)]
            `
            : `
              border-slate-300

              bg-white/[0.025]
            `
        }
      `}
    >
      <p
        className="
          text-[9px]

          font-mono

          text-gray-600
        "
      >
        UPGRADE TO
      </p>

      <h3
        className={`
          text-3xl
          sm:text-4xl

          font-black

          uppercase

          mt-3

          ${isVerified ? "text-purple-400" : "text-slate-100"}
        `}
      >
        {name}
      </h3>

      <div
        className="
          flex

          items-end

          gap-3

          mt-3
        "
      >
        <p
          className="
            text-3xl

            font-black
          "
        >
          {price}
        </p>

        <span
          className="
            text-[8px]

            text-gray-600

            font-mono

            pb-1
          "
        >
          {billing}
        </span>
      </div>

      <p
        className="
          text-sm

          text-gray-500

          leading-relaxed

          mt-5

          pb-5

          border-b
          border-white/10
        "
      >
        {description}
      </p>

      <div
        className="
          mt-5

          space-y-2
        "
      >
        {benefits.map((benefit) => (
          <p
            key={benefit}
            className="
                text-sm

                text-gray-300
              "
          >
            ✓ {benefit}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`
          group

          w-full

          mt-7

          py-4
          px-5

          flex

          items-center

          justify-between

          text-[10px]

          font-black

          tracking-widest

          transition

          ${
            isVerified
              ? `
                bg-purple-600

                hover:bg-purple-500

                text-white
              `
              : `
                bg-slate-100

                hover:bg-white

                text-black
              `
          }
        `}
      >
        CONTINUE TO PAYMENT
        <ArrowRight
          size={14}
          className="
            transition-transform

            group-hover:translate-x-1
          "
        />
      </button>
    </article>
  );
}
