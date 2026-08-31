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

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================================
   STORAGE
========================================================= */

const PROFILE_KEY = "inkConventionUserProfiles";

const DIRECTORY_KEY = "inkConventionDirectoryArtists";

const CURRENT_USER_KEY = "inkConventionCurrentUserId";

const PENDING_MEMBERSHIP_KEY = "inkConventionPendingMembership";

const PLANS = [
  {
    id: "pro",
    name: "PRO LISTING",
    price: "₹1,499",
    amount: 1499,
    billing: "PER YEAR",
    description:
      "Higher directory visibility with city-wise discovery and a Recommended tag.",
    benefits: [
      "Name visible",
      "Email visible",
      "City & state visible",
      "City-wise search visibility",
      "Recommended tag",
      "Higher directory ranking",
    ],
  },
  {
    id: "verified",
    name: "VERIFIED SPOTLIGHT",
    price: "₹2,999",
    amount: 2999,
    billing: "PER YEAR",
    description:
      "Maximum visibility with full profile details, Verified status and Hall of Fame placement.",
    benefits: [
      "Everything in Pro",
      "Photo visible",
      "Phone visible",
      "Studio visible",
      "Experience visible",
      "Instagram visible",
      "Verified Spotlight badge",
      "Highest directory ranking",
      "Standalone profile page",
      "Hall of Fame inclusion",
    ],
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  city: "",
  state: "",
  studio: "",
  experience: "",
  instagram: "",
};

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
    plan: normalizePlan(source.plan || source.membershipPlan),
  };
}

function makeForm(profile = {}) {
  return {
    name: profile.name || profile.artistName || profile.professionalName || "",
    email: profile.email || "",
    city: profile.city || "",
    state: profile.state || "",
    studio: profile.studio || profile.studioName || "",
    experience: profile.experience || "",
    instagram: profile.instagram || "",
  };
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || data.error || `Request failed (${response.status})`,
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

export default function Enter() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [screen, setScreen] = useState(initialArtist ? "verify" : "find");
  const [selectedArtist, setSelectedArtist] = useState(initialArtist);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState(
    initialArtist?.maskedPhone || "",
  );
  const [resendSeconds, setResendSeconds] = useState(0);

  const [currentProfile, setCurrentProfile] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [profileImage, setProfileImage] = useState("");
  const [saving, setSaving] = useState(false);

  const [changePhoneOpen, setChangePhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPhoneOtp, setNewPhoneOtp] = useState("");
  const [newPhoneOtpSent, setNewPhoneOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setResendSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const currentPlan = useMemo(
    () => normalizePlan(currentProfile?.plan || selectedArtist?.plan),
    [currentProfile?.plan, selectedArtist?.plan],
  );

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };
    const resetToFind = () => {
    setScreen("find");
    setSelectedArtist(null);

    setOtp("");
    setOtpSent(false);
    setResendSeconds(0);

    setCurrentProfile(null);
    setFormData(EMPTY_FORM);
    setProfileImage("");

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
      const data = await apiRequest("/api/claim/find", {
        method: "POST",
        body: {
          query,
        },
      });

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

  const sendOtp = async () => {
    if (!selectedArtist?.id) {
      setError("Artist profile is missing.");
      return;
    }

    if (otpLoading || resendSeconds > 0) return;

    setOtpLoading(true);
    clearMessages();

    try {
      const data = await apiRequest("/api/claim/send-otp", {
        method: "POST",
        body: {
          profileId: selectedArtist.id,
        },
      });

      setMaskedPhone(
        data.maskedPhone ||
          data.phoneMasked ||
          selectedArtist.maskedPhone ||
          "REGISTERED NUMBER",
      );

      setOtpSent(true);

      setResendSeconds(Number(data.resendAfterSeconds || 60));

      setSuccess("OTP sent to the registered mobile number.");
    } catch (sendError) {
      console.error(sendError);

      setError(sendError.message || "Unable to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    if (!selectedArtist?.id) {
      setError("Artist profile is missing.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    clearMessages();

    try {
      const verifyData = await apiRequest("/api/claim/verify-otp", {
        method: "POST",
        body: {
          profileId: selectedArtist.id,
          otp,
        },
      });

      let profile = verifyData.profile || verifyData.artist || null;

      if (!profile) {
        const profileData = await apiRequest("/api/claim/me");

        profile = profileData.profile || profileData.artist || profileData;
      }

      setCurrentProfile(profile);

      setFormData(makeForm(profile));

      setProfileImage(profile?.profileImage || profile?.image || "");

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
      console.error(verifyError);

      setError(verifyError.message || "Incorrect or expired OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessages();
  };

  const compressImage = (file, maxSize = 800, quality = 0.72) =>
    new Promise((resolve, reject) => {
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

        image.src = String(reader.result || "");
      };

      reader.onerror = () => {
        reject(new Error("Unable to read image."));
      };

      reader.readAsDataURL(file);
    });

  const handleProfileImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

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

    return true;
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    clearMessages();

    try {
      const data = await apiRequest("/api/claim/update", {
        method: "POST",
        body: {
          profileId: selectedArtist?.id,

          name: formData.name.trim(),

          email: formData.email.trim(),

          city: formData.city.trim(),

          state: formData.state.trim(),

          studio: formData.studio.trim(),

          experience: formData.experience.trim(),

          instagram: formData.instagram.trim(),

          profileImage,
        },
      });

      const updatedProfile = data.profile ||
        data.artist || {
          ...currentProfile,
          ...formData,
          profileImage,
        };

      setCurrentProfile(updatedProfile);

      setSelectedArtist((previous) =>
        normalizeArtist({
          ...(previous || {}),
          ...updatedProfile,
        }),
      );

      setSuccess("Profile updated successfully.");

      setScreen("plans");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (saveError) {
      console.error(saveError);

      if (saveError.status === 401 || saveError.status === 403) {
        setError("Your verification expired. Please verify OTP again.");

        setOtp("");
        setOtpSent(false);

        setScreen("verify");
      } else {
        setError(saveError.message || "Unable to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const sendNewPhoneOtp = async () => {
    const cleanedPhone = newPhone.replace(/[^0-9+]/g, "").trim();

    if (cleanedPhone.length < 10) {
      setError("Enter a valid new mobile number.");
      return;
    }

    setPhoneLoading(true);
    clearMessages();

    try {
      await apiRequest("/api/claim/change-phone/send-otp", {
        method: "POST",
        body: {
          profileId: selectedArtist?.id,
          newPhone: cleanedPhone,
        },
      });

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

  const verifyNewPhoneOtp = async () => {
    if (!/^\d{6}$/.test(newPhoneOtp)) {
      setError("Enter the 6-digit OTP sent to the new number.");

      return;
    }

    setPhoneLoading(true);
    clearMessages();

    try {
      const data = await apiRequest("/api/claim/change-phone/verify-otp", {
        method: "POST",
        body: {
          profileId: selectedArtist?.id,
          newPhone,
          otp: newPhoneOtp,
        },
      });

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

     DOES NOT DELETE PROFILE.
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);

    localStorage.removeItem("inkConventionLoggedUser");

    setCurrentProfile(null);

    setFormData(EMPTY_FORM);

    setProfileImage("");

    setError("");

    navigate("/Enter", {
      replace: true,
      state: null,
    });
  };

  if (screen === "find") {
    return (
      <PageShell>
        <div className="enter-reveal max-w-4xl mx-auto">
          <Eyebrow icon={<Search size={13} />}>FIND YOUR PROFILE</Eyebrow>

          <h1 className="text-[clamp(3.2rem,8vw,7rem)] font-black uppercase tracking-[-0.07em] leading-[0.84]">
            FIND YOUR
            <br />
            <span className="text-purple-500">CARD.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm text-gray-500 leading-relaxed">
            Search your artist or studio name. Nobody can edit a card until the
            OTP sent to the mobile number already saved with that card is
            verified.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ARTIST OR STUDIO NAME..."
                className="w-full bg-[#0d0d11] border border-white/10 focus:border-purple-500 rounded-xl pl-11 pr-4 py-4 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl px-7 py-4 text-[10px] font-black tracking-widest transition"
            >
              {searching ? "SEARCHING..." : "SEARCH"}
            </button>
          </form>

          <Message error={error} success={success} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((artist) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => chooseArtist(artist)}
                className="text-left bg-[#0d0d11] border border-white/10 hover:border-purple-500/60 rounded-2xl p-5 transition"
              >
                <p className="text-[8px] font-mono tracking-[0.14em] text-purple-400">
                  DIRECTORY PROFILE
                </p>

                <h2 className="mt-2 text-xl font-black uppercase">
                  {artist.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {artist.studio || "Tattoo Artist / Studio"}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={13} className="text-purple-500" />

                  {[artist.city, artist.state].filter(Boolean).join(", ") ||
                    "India"}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-[9px] font-mono text-gray-600">
                    {artist.maskedPhone || "REGISTERED MOBILE"}
                  </span>

                  <span className="text-[9px] font-black text-purple-400">
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

  if (screen === "verify") {
    return (
      <PageShell>
        <div className="enter-reveal max-w-2xl mx-auto">
          <button
            type="button"
            onClick={resetToFind}
            className="text-[9px] font-mono text-gray-500 hover:text-white transition mb-8"
          >
            ← CHOOSE ANOTHER PROFILE
          </button>

          <div className="bg-[#0d0d11] border border-white/10 rounded-[28px] p-6 sm:p-9">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <ShieldCheck size={25} className="text-purple-400" />
            </div>

            <p className="mt-7 text-[9px] font-mono tracking-[0.16em] text-purple-400">
              OWNERSHIP VERIFICATION
            </p>

            <h1 className="mt-3 text-3xl sm:text-5xl font-black uppercase leading-none">
              VERIFY BEFORE
              <br />
              YOU UPDATE.
            </h1>

            <div className="mt-7 border border-white/10 rounded-2xl p-5">
              <h2 className="font-black uppercase text-lg">
                {selectedArtist?.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedArtist?.studio || "Tattoo Artist / Studio"}
              </p>

              <p className="mt-3 text-xs text-gray-500">
                OTP goes only to: {maskedPhone || "the saved mobile number"}
              </p>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl p-4 font-black text-[10px] tracking-widest transition"
              >
                {otpLoading ? "SENDING..." : "SEND OTP"}
              </button>
            ) : (
              <form onSubmit={verifyOtp} className="mt-6">
                <label className="block text-[9px] font-mono text-gray-500 mb-2">
                  ENTER 6-DIGIT OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="w-full text-center tracking-[0.55em] bg-black/40 border border-white/10 focus:border-purple-500 rounded-xl px-5 py-5 outline-none text-xl font-black"
                />

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="mt-4 w-full bg-white hover:bg-slate-200 text-black disabled:opacity-50 rounded-xl p-4 font-black text-[10px] tracking-widest transition"
                >
                  {otpLoading ? "VERIFYING..." : "VERIFY OTP & OPEN PROFILE"}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading || resendSeconds > 0}
                  className="mt-4 w-full text-[9px] font-mono text-purple-400 disabled:text-gray-700"
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

  if (screen === "edit") {
    return (
      <PageShell>
        <div className="max-w-[1250px] mx-auto">
          <div className="enter-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <Eyebrow icon={<CheckCircle2 size={13} />}>
                PHONE VERIFIED
              </Eyebrow>

              <h1 className="text-[clamp(3rem,7vw,6rem)] font-black uppercase tracking-[-0.065em] leading-[0.86]">
                UPDATE YOUR
                <br />
                <span className="text-purple-500">PROFILE.</span>
              </h1>
            </div>

            <button
              type="button"
              onClick={resetToFind}
              className="text-[9px] font-mono text-gray-500 hover:text-white transition"
            >
              EXIT VERIFICATION
            </button>
          </div>

          <form
            onSubmit={saveProfile}
            className="enter-reveal mt-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10"
          >
            <div>
              <p className="text-[9px] font-mono text-gray-500 mb-3">
                PROFILE PHOTO
              </p>

              <label className="relative block aspect-square overflow-hidden bg-[#0d0d11] border border-white/10 hover:border-purple-500/50 rounded-[26px] cursor-pointer transition">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Users size={32} className="text-purple-500" />

                    <p className="mt-4 font-black">UPLOAD PHOTO</p>

                    <p className="mt-1 text-xs text-gray-600">
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

              <div className="mt-5 bg-[#0d0d11] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-purple-400">
                  <Lock size={13} />

                  <p className="text-[8px] font-mono tracking-[0.14em]">
                    VERIFIED MOBILE
                  </p>
                </div>

                <p className="mt-2 text-lg font-black">
                  {maskedPhone || "VERIFIED NUMBER"}
                </p>

                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  The mobile number cannot be typed over directly. Use secure
                  number change below.
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
                  className="mt-4 text-[9px] font-black text-purple-400 hover:text-purple-300"
                >
                  {changePhoneOpen
                    ? "CANCEL NUMBER CHANGE"
                    : "CHANGE MOBILE NUMBER →"}
                </button>

                {changePhoneOpen && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your current number was already verified to open this
                      profile. Enter the new number and verify its OTP.
                    </p>

                    <input
                      type="text"
                      value={newPhone}
                      onChange={(event) => setNewPhone(event.target.value)}
                      disabled={newPhoneOtpSent}
                      placeholder="NEW MOBILE NUMBER"
                      className="mt-4 w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-3 outline-none text-sm disabled:opacity-60"
                    />

                    {!newPhoneOtpSent ? (
                      <button
                        type="button"
                        onClick={sendNewPhoneOtp}
                        disabled={phoneLoading}
                        className="mt-3 w-full bg-white text-black hover:bg-slate-200 disabled:opacity-50 rounded-xl py-3 text-[9px] font-black tracking-widest"
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
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="000000"
                          className="mt-3 w-full text-center tracking-[0.45em] bg-black/40 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-3 outline-none font-black"
                        />

                        <button
                          type="button"
                          onClick={verifyNewPhoneOtp}
                          disabled={phoneLoading || newPhoneOtp.length !== 6}
                          className="mt-3 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl py-3 text-[9px] font-black tracking-widest"
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

            <div className="space-y-5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

              <Message error={error} success={success} />

              <button
                type="submit"
                disabled={saving}
                className="group w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl p-5 flex items-center justify-between text-[10px] font-black tracking-[0.14em] transition"
              >
                <span>{saving ? "UPDATING..." : "UPDATE PROFILE"}</span>

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </form>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-[1250px] mx-auto">
        <div className="enter-reveal text-center max-w-3xl mx-auto">
          <Eyebrow icon={<Sparkles size={13} />}>PROFILE UPDATED</Eyebrow>

          <h1 className="text-[clamp(3.2rem,7vw,6.5rem)] font-black uppercase tracking-[-0.065em] leading-[0.86]">
            GET MORE
            <br />
            <span className="text-purple-500">VISIBILITY.</span>
          </h1>

          <p className="mt-6 text-sm text-gray-500 leading-relaxed">
            Your existing Basic directory card has been updated. You can keep it
            as Basic or upgrade for more visibility.
          </p>
        </div>

        {currentPlan === "verified" ? (
          <div className="enter-reveal mt-12 max-w-2xl mx-auto border border-purple-400/30 bg-purple-500/[0.05] rounded-[28px] p-8 text-center">
            <CheckCircle2 size={36} className="text-purple-400 mx-auto" />

            <h2 className="mt-5 text-3xl font-black uppercase">
              ALREADY VERIFIED
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Your Verified Spotlight membership is already active.
            </p>
          </div>
        ) : (
          <div
            className={`enter-reveal mt-12 grid grid-cols-1 ${
              currentPlan === "pro" ? "max-w-2xl mx-auto" : "lg:grid-cols-2"
            } gap-6`}
          >
            {PLANS.filter((plan) => {
              if (currentPlan === "pro") {
                return plan.id === "verified";
              }

              return true;
            }).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onClick={() => startPaidPlan(plan.id)}
              />
            ))}
          </div>
        )}

        <div className="enter-reveal mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 bg-[#0d0d11] rounded-2xl p-5">
          <div>
            <p className="text-[9px] font-black tracking-widest">
              FINISHED UPDATING?
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Go back to the directory to see your card.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/artists")}
            className="text-[9px] font-black text-purple-400 hover:text-purple-300"
          >
            BACK TO ARTISTS →
          </button>
        </div>

        <Message error={error} success={success} />
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <main className="min-h-screen bg-[#08080a] text-white pt-32 pb-24 px-4 sm:px-6 lg:px-10">
      {children}
    </main>
  );
}

function Eyebrow({ icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 text-purple-400 text-[10px] font-mono tracking-[0.2em] mb-5">
      {icon}
      {children}
    </div>
  );
}

function InputField({ label, type = "text", required = true, ...props }) {
  return (
    <label className="block">
      <span className="block text-[9px] font-mono text-gray-500 mb-2">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        {...props}
        type={type}
        required={required}
        className="w-full bg-[#0d0d11] border border-white/10 focus:border-purple-500 rounded-xl px-5 py-4 outline-none text-white placeholder:text-gray-700 transition"
      />
    </label>
  );
}

function Message({ error, success }) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={`mt-5 rounded-xl border px-5 py-4 text-sm ${
        error
          ? "border-red-500/30 bg-red-500/[0.05] text-red-400"
          : "border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-400"
      }`}
    >
      {error || success}
    </div>
  );
}

function PlanCard({ plan, onClick }) {
  const isVerified = plan.id === "verified";

  return (
    <article
      className={`relative flex flex-col min-h-[560px] rounded-[28px] p-7 sm:p-9 border-2 transition-transform hover:-translate-y-1 ${
        isVerified
          ? "border-purple-400 bg-purple-500/[0.05] shadow-[0_0_50px_rgba(168,85,247,0.10)]"
          : "border-slate-300 bg-white/[0.025]"
      }`}
    >
      {isVerified && (
        <div className="absolute top-5 right-5 bg-purple-600 px-3 py-1.5 text-[7px] font-black tracking-widest">
          HALL OF FAME
        </div>
      )}

      <p className="text-[9px] font-mono tracking-[0.14em] text-gray-500">
        DIRECTORY UPGRADE
      </p>

      <h2
        className={`mt-5 text-4xl sm:text-5xl font-black uppercase leading-[0.9] ${
          isVerified ? "text-purple-400" : "text-white"
        }`}
      >
        {plan.name}
      </h2>

      <div className="mt-6 flex items-end gap-3">
        <p className="text-4xl sm:text-5xl font-black">{plan.price}</p>

        <span className="pb-1 text-[8px] font-mono text-gray-600">
          {plan.billing}
        </span>
      </div>

      <p className="mt-5 pb-6 border-b border-white/10 text-sm text-gray-500 leading-relaxed">
        {plan.description}
      </p>

      <div className="mt-6 space-y-3 flex-1">
        {plan.benefits.map((benefit) => (
          <div key={benefit} className="flex items-start gap-3 text-sm">
            <span
              className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] ${
                isVerified
                  ? "bg-purple-500/10 text-purple-400"
                  : "bg-white/10 text-slate-200"
              }`}
            >
              ✓
            </span>

            <span className="text-gray-300">{benefit}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`group mt-8 w-full rounded-xl p-4 flex items-center justify-between text-[10px] font-black tracking-widest transition ${
          isVerified
            ? "bg-purple-600 hover:bg-purple-500 text-white"
            : "bg-white hover:bg-slate-200 text-black"
        }`}
      >
        <span>{isVerified ? "GET VERIFIED" : "GET PRO LISTING"}</span>

        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </article>
  );
}
