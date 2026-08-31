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

const API_URL = (
  import.meta.env.VITE_API_URL || "https://api.inkconvention.com"
).replace(/\/$/, "");

const PENDING_MEMBERSHIP_KEY = "inkConventionPendingMembership";

const PLANS = [
  {
    id: "pro",
    name: "SILVER PRO",
    price: "₹1,499",
    amount: 1499,
    billing: "PER YEAR",
    description:
      "Higher directory visibility with city search, email visibility and a Recommended profile tag.",
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
    name: "GOLD VERIFIED",
    price: "₹2,999",
    amount: 2999,
    billing: "PER YEAR",
    description:
      "Maximum visibility with a full public profile, Gold Verified status and Hall of Fame placement.",
    benefits: [
      "Everything in Silver Pro",
      "Photo visible",
      "Phone visible",
      "Studio visible",
      "Experience visible",
      "Instagram visible",
      "Gold Verified badge",
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

  if (
    plan === "gold" ||
    plan === "verified" ||
    plan === "spotlight" ||
    plan === "verified spotlight"
  ) {
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
      source.name ||
      source.artistName ||
      source.professionalName ||
      "Tattoo Artist",
    studio: source.studio || source.studioName || "",
    city: source.city || "",
    state: source.state || "",
    maskedPhone: source.maskedPhone || source.phoneMasked || "",
    profileImage: source.profileImage || source.image || source.photo || "",
    plan: normalizePlan(source.plan || source.membershipPlan || source.tier),
  };
}

function makeForm(profile = {}) {
  return {
    name: profile.name || profile.artistName || profile.professionalName || "",
    email: profile.email || profile.gmail || "",
    city: profile.city || "",
    state: profile.state || "",
    studio: profile.studio || profile.studioName || "",
    experience: profile.experience || "",
    instagram: profile.instagram || "",
  };
}

function getResultsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.profiles)) return data.profiles;
  if (Array.isArray(data?.artists)) return data.artists;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
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
  const location = useLocation();
  const navigate = useNavigate();

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentPlan = useMemo(
    () => normalizePlan(currentProfile?.plan || selectedArtist?.plan),
    [currentProfile?.plan, selectedArtist?.plan],
  );

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".enter-reveal",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.035,
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

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (query.length < 2) {
      setError("Enter at least 2 characters of the artist or studio name.");
      return;
    }

    setSearching(true);
    clearMessages();

    try {
      const data = await apiRequest(
        `/api/claim/search?q=${encodeURIComponent(query)}&limit=12`,
      );

      const results = getResultsArray(data).map((artist) =>
        normalizeArtist(artist),
      );

      setSearchResults(results);

      if (results.length === 0) {
        setError("No matching artist or studio found.");
      }
    } catch (searchError) {
      console.error("Artist search error:", searchError);
      setSearchResults([]);
      setError(searchError.message || "Unable to search artist profiles.");
    } finally {
      setSearching(false);
    }
  };

  const chooseArtist = (artist) => {
    const normalized = normalizeArtist(artist);

    setSelectedArtist(normalized);
    setMaskedPhone(normalized.maskedPhone || "");
    setOtpSent(false);
    setOtp("");
    setResendSeconds(0);
    clearMessages();
    setScreen("verify");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendOtp = async () => {
    if (!selectedArtist?.id) {
      setError("Artist profile ID is missing.");
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
      setSuccess("OTP sent to the mobile number already saved on this card.");
    } catch (sendError) {
      console.error("OTP send error:", sendError);
      setError(sendError.message || "Unable to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    if (!selectedArtist?.id) {
      setError("Artist profile ID is missing.");
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
        const profileData = await apiRequest("/api/claim/profile");
        profile = profileData.profile || profileData.artist || profileData;
      }

      setCurrentProfile(profile);
      setFormData(makeForm(profile));
      setProfileImage(
        profile?.profileImage || profile?.image || profile?.photo || "",
      );
      setMaskedPhone(
        profile?.maskedPhone ||
          profile?.phoneMasked ||
          verifyData.maskedPhone ||
          maskedPhone,
      );
      setSuccess("OTP verified. You can now update this profile.");
      setScreen("edit");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (verifyError) {
      console.error("OTP verify error:", verifyError);
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

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(String(reader.result || ""));
      clearMessages();
    };

    reader.onerror = () => {
      setError("Unable to read this image.");
    };

    reader.readAsDataURL(file);
  };

  const validateProfile = () => {
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

    return true;
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!validateProfile()) return;

    setSaving(true);
    clearMessages();

    try {
      const data = await apiRequest("/api/claim/profile", {
        method: "PUT",
        body: {
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

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (saveError) {
      console.error("Profile update error:", saveError);

      if (saveError.status === 401 || saveError.status === 403) {
        setOtp("");
        setOtpSent(false);
        setResendSeconds(0);
        setScreen("verify");
        setError("Your verification expired. Please verify OTP again.");
      } else {
        setError(saveError.message || "Unable to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const startPaidPlan = (planId) => {
    const plan = PLANS.find((item) => item.id === normalizePlan(planId));

    if (!plan || !selectedArtist?.id) {
      setError("Unable to start this upgrade.");
      return;
    }

    if (currentPlan === "verified") {
      setError("This profile is already Gold Verified.");
      return;
    }

    if (currentPlan === "pro" && plan.id === "pro") {
      setError("This profile is already Silver Pro.");
      return;
    }

    const pendingCheckout = {
      source: "directory-membership",
      action: "upgrade",
      profileId: selectedArtist.id,
      claimArtistId: selectedArtist.id,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      billing: "yearly",
      previousPlan: currentPlan,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      PENDING_MEMBERSHIP_KEY,
      JSON.stringify(pendingCheckout),
    );

    navigate("/payment", {
      state: pendingCheckout,
    });
  };

  const resetToFind = () => {
    setScreen("find");
    setSelectedArtist(null);
    setSearchQuery("");
    setSearchResults([]);
    setOtpSent(false);
    setOtp("");
    setMaskedPhone("");
    setResendSeconds(0);
    setCurrentProfile(null);
    setFormData(EMPTY_FORM);
    setProfileImage("");
    clearMessages();

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
            Search your artist or studio name. Your card can only be edited
            after an OTP is verified on the mobile number already saved with
            that profile.
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
            {searchResults.map((artist, index) => (
              <button
                key={artist.id || `${artist.name}-${index}`}
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

                {artist.studio && (
                  <p className="mt-1 text-sm text-gray-500">{artist.studio}</p>
                )}

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
        <div className="max-w-[1200px] mx-auto">
          <div className="enter-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <Eyebrow icon={<CheckCircle2 size={13} />}>
                MOBILE VERIFIED
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
                    alt="Artist profile"
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
                  The saved mobile number is protected and cannot be edited from
                  this form.
                </p>
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
                required={false}
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
      <div className="max-w-[1200px] mx-auto">
        <div className="enter-reveal text-center max-w-3xl mx-auto">
          <Eyebrow icon={<Sparkles size={13} />}>PROFILE UPDATED</Eyebrow>

          <h1 className="text-[clamp(3.2rem,7vw,6.5rem)] font-black uppercase tracking-[-0.065em] leading-[0.86]">
            GET MORE
            <br />
            <span className="text-purple-500">VISIBILITY.</span>
          </h1>

          <p className="mt-6 text-sm text-gray-500 leading-relaxed">
            Your directory card is updated. Keep the Basic listing or upgrade to
            Silver Pro or Gold Verified.
          </p>
        </div>

        {currentPlan === "verified" ? (
          <div className="enter-reveal mt-12 max-w-2xl mx-auto border border-amber-300/30 bg-amber-400/[0.05] rounded-[28px] p-8 text-center">
            <CheckCircle2 size={36} className="text-amber-300 mx-auto" />
            <h2 className="mt-5 text-3xl font-black uppercase">
              ALREADY GOLD VERIFIED
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Your ₹2,999 Gold Verified membership is already active.
            </p>
          </div>
        ) : (
          <div
            className={`enter-reveal mt-12 grid grid-cols-1 ${
              currentPlan === "pro" ? "max-w-2xl mx-auto" : "lg:grid-cols-2"
            } gap-6`}
          >
            {PLANS.filter((plan) => {
              if (currentPlan === "pro") return plan.id === "verified";
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
              Return to the directory to see your card.
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
  if (!error && !success) return null;

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
  const isGold = plan.id === "verified";

  return (
    <article
      className={`relative flex flex-col min-h-[540px] rounded-[28px] p-7 sm:p-9 border-2 ${
        isGold
          ? "border-amber-300/60 bg-amber-400/[0.04] shadow-[0_0_50px_rgba(251,191,36,0.10)]"
          : "border-slate-300/50 bg-slate-300/[0.025] shadow-[0_0_45px_rgba(226,232,240,0.06)]"
      }`}
    >
      {isGold && (
        <div className="absolute top-5 right-5 bg-amber-400 text-black px-3 py-1.5 text-[7px] font-black tracking-widest">
          HALL OF FAME
        </div>
      )}

      <p
        className={`text-[9px] font-mono tracking-[0.14em] ${
          isGold ? "text-amber-300" : "text-slate-300"
        }`}
      >
        {isGold ? "GOLD MEMBERSHIP" : "SILVER MEMBERSHIP"}
      </p>

      <h2
        className={`mt-5 text-4xl sm:text-5xl font-black uppercase leading-[0.9] ${
          isGold ? "text-amber-300" : "text-slate-100"
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
                isGold
                  ? "bg-amber-400/10 text-amber-300"
                  : "bg-slate-300/10 text-slate-200"
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
          isGold
            ? "bg-amber-400 hover:bg-amber-300 text-black"
            : "bg-slate-100 hover:bg-white text-black"
        }`}
      >
        <span>{isGold ? "GET GOLD VERIFIED" : "GET SILVER PRO"}</span>
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </article>
  );
}
