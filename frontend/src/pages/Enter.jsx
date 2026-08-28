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
   PLANS
========================================================= */

const plans = [
  {
    id: "gold",
    name: "GOLD",
    price: "₹1299",
    priority: 3,

    description:
      "Your complete professional artist profile with maximum directory visibility.",

    benefits: [
      "Gold profile border",
      "Highest directory position",
      "Profile photo",
      "Artist name",
      "Phone number",
      "Email address",
      "City",
      "State",
      "Studio name",
      "Experience",
      "Instagram",
    ],
  },

  {
    id: "silver",
    name: "SILVER",
    price: "₹799",
    priority: 2,

    description:
      "A professional listing with your profile photo and important contact information.",

    benefits: [
      "Silver profile border",
      "Above Free artists",
      "Profile photo",
      "Artist name",
      "City",
      "State",
      "Phone number",
    ],
  },

  {
    id: "free",
    name: "FREE",
    price: "₹0",
    priority: 1,

    description: "A simple basic entry in the Ink Convention Artist Directory.",

    benefits: [
      "Artist name",
      "State",
      "Normal profile border",
      "Basic directory listing",
    ],
  },
];

/* =========================================================
   HELPERS
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

const getPlanPriority = (plan) => {
  if (plan === "gold") {
    return 3;
  }

  if (plan === "silver") {
    return 2;
  }

  return 1;
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

    const profiles = getStoredArray(PROFILE_KEY);

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
     ANIMATION
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
     COMPRESS IMAGE
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
            const ratio = Math.min(maxSize / width, maxSize / height);

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

          resolve(canvas.toDataURL("image/jpeg", quality));
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
    } catch (error) {
      console.error(error);

      setError("Unable to load profile image.");
    }
  };

  /* =========================================================
     VALIDATE
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
     CREATE PUBLIC ARTIST

     FREE:
     NAME + STATE

     SILVER:
     PROFILE + NAME + CITY + STATE + PHONE

     GOLD:
     PROFILE + NAME + ALL 7 DETAILS
  ========================================================= */

  const buildDirectoryArtist = (profile) => {
    const common = {
      id: profile.id,

      plan: profile.plan,

      name: profile.name,

      state: profile.state,

      year: "2026",

      createdAt: profile.createdAt,

      updatedAt: new Date().toISOString(),
    };

    /* FREE */

    if (profile.plan === "free") {
      return common;
    }

    /* SILVER */

    if (profile.plan === "silver") {
      return {
        ...common,

        profileImage: profile.profileImage,

        city: profile.city,

        phone: profile.phone,
      };
    }

    /* GOLD */

    return {
      ...common,

      profileImage: profile.profileImage,

      phone: profile.phone,

      email: profile.email,

      city: profile.city,

      state: profile.state,

      studio: profile.studio,

      experience: profile.experience,

      instagram: profile.instagram,
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

    localStorage.setItem(DIRECTORY_KEY, JSON.stringify(updated));
  };

  /* =========================================================
     CREATE PROFILE
  ========================================================= */

  const createProfile = (selectedPlan) => {
    const profiles = getStoredArray(PROFILE_KEY);

    const newProfile = {
      id: Date.now(),

      plan: selectedPlan,

      name: formData.name.trim(),

      phone: formData.phone.trim(),

      email: formData.email.trim(),

      city: formData.city.trim(),

      state: formData.state.trim(),

      studio: formData.studio.trim(),

      experience: formData.experience.trim(),

      instagram: formData.instagram.trim(),

      profileImage,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify([newProfile, ...profiles]),
      );

      localStorage.setItem(CURRENT_USER_KEY, String(newProfile.id));

      updateDirectory(newProfile);

      setCurrentProfile(newProfile);

      navigate("/artists", {
        state: {
          newArtistId: newProfile.id,
        },
      });
    } catch (error) {
      console.error(error);

      setError("Unable to save your profile.");
    }
  };

  /* =========================================================
     UPGRADE
  ========================================================= */

  const upgradePlan = (nextPlan) => {
    if (!currentProfile) {
      return;
    }

    const oldPriority = getPlanPriority(currentProfile.plan);

    const nextPriority = getPlanPriority(nextPlan);

    if (nextPriority <= oldPriority) {
      return;
    }

    const profiles = getStoredArray(PROFILE_KEY);

    const upgradedProfile = {
      ...currentProfile,

      plan: nextPlan,

      updatedAt: new Date().toISOString(),
    };

    const updatedProfiles = profiles.map((profile) =>
      String(profile.id) === String(currentProfile.id)
        ? upgradedProfile
        : profile,
    );

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfiles));

      updateDirectory(upgradedProfile);

      setCurrentProfile(upgradedProfile);

      navigate("/artists", {
        state: {
          newArtistId: upgradedProfile.id,
        },
      });
    } catch (error) {
      console.error(error);

      setError("Unable to upgrade membership.");
    }
  };

  /* =========================================================
     LOGOUT

     DOES NOT DELETE USER PROFILE.
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
     CURRENT PLAN
  ========================================================= */

  const currentPlan = useMemo(
    () => plans.find((plan) => plan.id === currentProfile?.plan),
    [currentProfile],
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (screen === "loading") {
    return (
      <main
        className="
          min-h-screen
          bg-[#08080a]
        "
      />
    );
  }

  /* =========================================================
     SAVED USER PROFILE
  ========================================================= */

  if (screen === "profile" && currentProfile) {
    const isFree = currentProfile.plan === "free";

    const isSilver = currentProfile.plan === "silver";

    const isGold = currentProfile.plan === "gold";

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
          {/* HEADER + LOGOUT */}

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
                MY ARTIST PROFILE
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
                <span
                  className="
                    text-purple-500
                  "
                >
                  BACK.
                </span>
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

          {/* PROFILE */}

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

            <div
              className="
                enter-reveal
              "
            >
              <div
                className={`
                  relative
                  aspect-square
                  rounded-[30px]
                  overflow-hidden
                  bg-[#0d0d11]
                  border-2

                  ${
                    isGold
                      ? "border-yellow-400"
                      : isSilver
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
                    <Users
                      size={40}
                      className="
                        text-gray-700
                      "
                    />
                  </div>
                )}
              </div>
            </div>

            {/* INFORMATION */}

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
                    ARTIST PROFILE
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
                    <MapPin
                      size={14}
                      className="
                        text-purple-500
                      "
                    />

                    <span>
                      {currentProfile.city}, {currentProfile.state}
                    </span>
                  </div>
                </div>

                <div
                  className={`
                    px-5
                    py-3
                    text-xs
                    font-black
                    tracking-[0.15em]

                    ${
                      isGold
                        ? "bg-yellow-400 text-black"
                        : isSilver
                          ? "bg-slate-200 text-black"
                          : "bg-purple-600 text-white"
                    }
                  `}
                >
                  {currentPlan?.name}
                </div>
              </div>

              {/* PRIVATE SAVED DETAILS */}

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
              </div>

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

          {/* UPGRADE */}

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
              MEMBERSHIP
            </p>

            <h2
              className="
                text-3xl
                sm:text-5xl
                font-black
                uppercase
              "
            >
              {isGold ? "YOU HAVE MAXIMUM VISIBILITY" : "UPGRADE YOUR PROFILE"}
            </h2>

            {/* FREE -> SILVER/GOLD */}

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
                  name="SILVER"
                  price="₹799"
                  description="Show your profile photo, name, city, state and phone number with Silver styling."
                  type="silver"
                  benefits={[
                    "Profile Photo",
                    "Name",
                    "City",
                    "State",
                    "Phone",
                    "Silver Border",
                  ]}
                  onClick={() => upgradePlan("silver")}
                />

                <UpgradeCard
                  name="GOLD"
                  price="₹1299"
                  description="Unlock your full professional profile and highest directory visibility."
                  type="gold"
                  benefits={[
                    "Profile Photo",
                    "Name",
                    "Phone",
                    "Email",
                    "City",
                    "State",
                    "Studio",
                    "Experience",
                    "Instagram",
                    "Gold Border",
                  ]}
                  onClick={() => upgradePlan("gold")}
                />
              </div>
            )}

            {/* SILVER -> GOLD */}

            {isSilver && (
              <div
                className="
                  max-w-2xl
                  mt-8
                "
              >
                <UpgradeCard
                  name="GOLD"
                  price="₹1299"
                  description="Upgrade your Silver profile to Gold and show all seven professional details."
                  type="gold"
                  benefits={[
                    "Phone",
                    "Email",
                    "City",
                    "State",
                    "Studio",
                    "Experience",
                    "Instagram",
                    "Gold Border",
                    "Highest Priority",
                  ]}
                  onClick={() => upgradePlan("gold")}
                />
              </div>
            )}

            {/* GOLD */}

            {isGold && (
              <div
                className="
                  mt-8
                  border
                  border-yellow-400/30
                  bg-yellow-400/[0.05]
                  p-7
                "
              >
                <p
                  className="
                    text-yellow-400
                    font-black
                  "
                >
                  Your Gold profile is already active.
                </p>

                <p
                  className="
                    text-sm
                    text-gray-500
                    mt-2
                  "
                >
                  Your card shows all seven professional details and receives
                  the highest directory priority.
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
     REGISTRATION
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
              ARTIST REGISTRATION
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
              CREATE YOUR
              <br />
              <span
                className="
                  text-purple-500
                "
              >
                PROFILE.
              </span>
            </h1>

            <p
              className="
                mt-6
                max-w-xl
                text-gray-500
                text-sm
                leading-relaxed
              "
            >
              Fill your information once. Your full private profile stays saved
              even if you start with the Free membership.
            </p>
          </div>

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
            </div>

            {/* DETAILS */}

            <div
              className="
                space-y-5
              "
            >
              <InputField
                label="FULL NAME"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
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
                label="STUDIO"
                name="studio"
                value={formData.studio}
                onChange={handleChange}
                placeholder="Studio name"
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
                CHOOSE MEMBERSHIP
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
     FIRST MEMBERSHIP
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
          <span
            className="
              text-purple-500
            "
          >
            MEMBERSHIP.
          </span>
        </h1>

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
              onClick={() => createProfile(plan.id)}
            />
          ))}
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
   INPUT
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
   MEMBERSHIP
========================================================= */

function MembershipCard({ plan, onClick }) {
  const isGold = plan.id === "gold";

  const isSilver = plan.id === "silver";

  return (
    <article
      className={`
        p-7
        min-h-[570px]
        flex
        flex-col

        ${
          isGold
            ? `
              border-2
              border-yellow-400
              bg-yellow-400/[0.04]
            `
            : isSilver
              ? `
              border-2
              border-slate-300
              bg-white/[0.025]
            `
              : `
              border
              border-white/10
              bg-[#0d0d11]
            `
        }
      `}
    >
      <p
        className={`
          text-[9px]
          font-mono

          ${
            isGold
              ? "text-yellow-400"
              : isSilver
                ? "text-slate-300"
                : "text-purple-400"
          }
        `}
      >
        MEMBERSHIP
      </p>

      <h2
        className="
          text-5xl
          font-black
          mt-4
        "
      >
        {plan.name}
      </h2>

      <p
        className="
          text-4xl
          font-black
          mt-3
        "
      >
        {plan.price}
      </p>

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
                    isGold
                      ? "bg-yellow-400/10 text-yellow-400"
                      : isSilver
                        ? "bg-white/10 text-slate-200"
                        : "bg-purple-500/10 text-purple-400"
                  }
                `}
            >
              ✓
            </span>

            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`
          mt-7
          p-4
          font-black
          text-[10px]
          tracking-widest
          transition

          ${
            isGold
              ? "bg-yellow-400 hover:bg-yellow-300 text-black"
              : isSilver
                ? "bg-slate-100 hover:bg-white text-black"
                : "bg-purple-600 hover:bg-purple-500 text-white"
          }
        `}
      >
        {isGold ? "SELECT GOLD" : isSilver ? "SELECT SILVER" : "CONTINUE FREE"}
      </button>
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

function UpgradeCard({ name, price, description, type, benefits, onClick }) {
  const isGold = type === "gold";

  return (
    <article
      className={`
        p-7
        border-2

        ${
          isGold
            ? `
              border-yellow-400
              bg-yellow-400/[0.04]
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
          text-4xl
          font-black
          mt-3

          ${isGold ? "text-yellow-400" : "text-slate-100"}
        `}
      >
        {name}
      </h3>

      <p
        className="
          text-3xl
          font-black
          mt-2
        "
      >
        {price}
      </p>

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
          w-full
          mt-7
          py-4
          text-[10px]
          font-black
          tracking-widest
          transition

          ${
            isGold
              ? "bg-yellow-400 hover:bg-yellow-300 text-black"
              : "bg-slate-100 hover:bg-white text-black"
          }
        `}
      >
        UPGRADE TO {name}
      </button>
    </article>
  );
}
