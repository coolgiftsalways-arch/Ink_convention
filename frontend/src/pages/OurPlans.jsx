import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";

import "../Style/OurPlans.css";
import "../Style/OurPlansVideo.css";
import tattooHandVideo from "../assets/Event/tattoo-hand.mp4";

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const PLANS = [
  { id: "quarterly", title: "3 Months", months: 3, price: 1999, customers: 2 },
  {
    id: "half-yearly",
    title: "6 Months",
    months: 6,
    price: 2999,
    customers: 5,
  },
  {
    id: "yearly",
    title: "1 Year",
    months: 12,
    price: 4999,
    customers: 12,
    featured: true,
  },
];

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const getPlan = (id) => PLANS.find((p) => p.id === id) || null;
const getProfileId = (p) => String(p?._id || p?.id || p?.profileId || "");
const normalizeMembership = (value) => {
  const v = String(value || "").toLowerCase();
  return ["verified", "gold", "spotlight"].includes(v)
    ? "verified"
    : ["pro", "silver"].includes(v)
      ? "pro"
      : "basic";
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    cache: "no-store",
    signal: options.signal,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.success === false) {
    const error = new Error(
      data?.message || data?.error || "Unable to complete the request.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}

function DiyaIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M10 37h44c-3 12-11 18-22 18S13 49 10 37Z" />
      <path d="M16 43h32M21 59h22" />
      <path d="M32 10c-2 8-10 12-10 19a10 10 0 0 0 20 0c0-7-8-11-10-19Z" />
      <path d="M32 24v13M8 23l5 3M51 26l5-3M15 11l4 5M45 16l4-5M32 2v4" />
    </svg>
  );
}

export default function OurPlans() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlanId, setSelectedPlanId] = useState(
    () =>
      getPlan(location.state?.selectedPlanId)?.id ||
      getPlan(new URLSearchParams(location.search).get("plan"))?.id ||
      "",
  );
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const cursorRef = useRef(null);
  const requestSectionRef = useRef(null);
  const submitLock = useRef(false);
  const [soundOn, setSoundOn] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const selectedPlan = getPlan(selectedPlanId);

  // Autoplay audio may be restricted until the visitor clicks.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let active = true;

    async function start() {
      try {
        video.volume = 0.65;
        video.muted = false;
        await video.play();
        if (active) {
          setSoundOn(true);
          setPlaying(true);
        }
      } catch {
        video.muted = true;
        const started = await video
          .play()
          .then(() => true)
          .catch(() => false);
        if (active) {
          setSoundOn(false);
          setPlaying(started);
        }
      }
    }
    void start();
    return () => {
      active = false;
      video.pause();
    };
  }, []);

  async function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.muted) {
      video.muted = true;
      setSoundOn(false);
      return;
    }
    try {
      video.volume = 0.65;
      video.muted = false;
      if (video.paused) await video.play();
      setSoundOn(true);
      setPlaying(!video.paused);
    } catch {
      video.muted = true;
      await video.play().catch(() => {});
      setSoundOn(false);
      setPlaying(!video.paused);
    }
  }

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      setPlaying(false);
    } else {
      try {
        await video.play();
      } catch {
        video.muted = true;
        setSoundOn(false);
        await video.play().catch(() => {});
      }
      setPlaying(!video.paused);
    }
  }

  function moveCursor(e) {
    if (e.pointerType !== "mouse" || !cursorRef.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    cursorRef.current.style.left = `${e.clientX - box.left}px`;
    cursorRef.current.style.top = `${e.clientY - box.top}px`;
  }

  useEffect(() => {
    const controller = new AbortController();
    async function checkSession() {
      try {
        const data = await apiRequest("/api/claim/me", {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const verified = data.profile || data.artist;
        setProfile(getProfileId(verified) ? verified : null);
      } catch (e) {
        if (controller.signal.aborted) return;
        setProfile(null);
        if (![401, 403].includes(e.status)) {
          setError(
            "We couldn’t check your profile. Please refresh and try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }
    void checkSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedPlanId) return;
    const params = new URLSearchParams(location.search);
    if (params.get("plan") === selectedPlanId) return;
    params.set("plan", selectedPlanId);
    navigate(
      { pathname: location.pathname, search: `?${params}` },
      {
        replace: true,
        state: location.state,
      },
    );
  }, [
    selectedPlanId,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);

  function openClaimPage(planId) {
    navigate("/Enter", {
      state: { returnTo: "/our-plans", selectedPlanId: planId },
    });
  }

  function choosePlan(plan) {
    if (checking || submitting || submitLock.current) return;
    setError("");
    setReceipt(null);
    setSelectedPlanId(plan.id);
    if (!profile) {
      openClaimPage(plan.id);
      return;
    }
    window.requestAnimationFrame(() =>
      requestSectionRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      }),
    );
  }

  async function submitPlanRequest() {
    if (!selectedPlan || checking || submitLock.current) return;
    if (!profile) {
      openClaimPage(selectedPlan.id);
      return;
    }
    const expectedProfileId = getProfileId(profile);
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    setReceipt(null);
    try {
      const session = await apiRequest("/api/claim/me");
      const verified = session.profile || session.artist;
      const verifiedId = getProfileId(verified);
      if (!verifiedId) {
        setProfile(null);
        openClaimPage(selectedPlan.id);
        return;
      }
      if (verifiedId !== expectedProfileId) {
        setProfile(verified);
        setError(
          "Your signed-in artist profile changed. Review the details and try again.",
        );
        return;
      }
      setProfile(verified);
      const data = await apiRequest("/api/membership-requests", {
        method: "POST",
        body: {
          profileId: verifiedId,
          currentPlan: normalizeMembership(
            verified.plan || verified.membershipPlan,
          ),
          requestedPlan: "verified",
          requestedPlanName: `Gold — ${selectedPlan.title}`,
          planOption: selectedPlan.id,
          durationMonths: selectedPlan.months,
          promisedCustomers: selectedPlan.customers,
          requestedAmount: selectedPlan.price,
          pricingType: "diwali-membership",
          name: verified.name || "",
          email: verified.email || "",
          phone:
            verified.phone || verified.mobile || verified.phoneNumber || "",
          city: verified.city || "",
          state: verified.state || "",
          studio: verified.studio || verified.studioName || "",
          source: "our_plans_page",
        },
      });
      const saved = data.request || data.membershipRequest;
      if (
        !saved ||
        !(saved._id || saved.id) ||
        String(saved.profileId) !== verifiedId ||
        saved.requestedPlan !== "verified" ||
        saved.planOption !== selectedPlan.id ||
        Number(saved.durationMonths) !== selectedPlan.months ||
        Number(saved.promisedCustomers) !== selectedPlan.customers ||
        Number(saved.requestedAmount) !== selectedPlan.price
      ) {
        setError(
          "The server responded, but we couldn’t confirm the selected plan details. Contact Ink Convention before submitting again.",
        );
        return;
      }
      setReceipt({
        id: String(saved._id || saved.id),
        title: selectedPlan.title,
        price: Number(saved.requestedAmount),
        status: saved.requestStatus || "new",
      });
    } catch (e) {
      if ([401, 403].includes(e.status)) {
        setProfile(null);
        openClaimPage(selectedPlan.id);
        return;
      }
      setError(e.message || "Unable to submit your request. Please try again.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="ink-plans">
      {/* VIDEO ONLY — no smoke PNG/WEBP used anywhere. */}
      <section
        className="ink-plans-video-hero"
        aria-label="Ink Convention membership plans"
      >
        <div className="ink-plans-video-hero__videos" aria-hidden="true">
          <video
            ref={videoRef}
            className="ink-plans-video-hero__video ink-plans-video-hero__video--right"
            src={tattooHandVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        </div>
        <div className="ink-plans-video-hero__overlay" aria-hidden="true" />
        <div className="ink-plans-video-hero__content">
          <p className="ink-plans-video-hero__eyebrow">
            INK CONVENTION · OUR PLANS
          </p>
          <h1>
            Your art deserves
            <br />a bigger <em>audience</em>
            <span>.</span>
          </h1>
          <p className="ink-plans-video-hero__subtitle">
            Choose a plan. Grow your presence.
          </p>
          <a className="ink-plans-video-hero__explore" href="#membership-plans">
            Explore memberships <ArrowRight size={22} aria-hidden="true" />
          </a>
        </div>
        <button
          type="button"
          className="ink-plans-video-hero__sound-zone"
          aria-label={soundOn ? "Mute video sound" : "Turn on video sound"}
          onClick={toggleSound}
          onPointerEnter={(e) => {
            setHovered(e.pointerType === "mouse");
            moveCursor(e);
          }}
          onPointerMove={moveCursor}
          onPointerLeave={() => setHovered(false)}
        >
          <span
            ref={cursorRef}
            aria-hidden="true"
            className={`ink-plans-video-hero__cursor ${hovered ? "is-visible" : ""}`}
          >
            {soundOn ? <VolumeX size={22} /> : <Volume2 size={22} />}
            <small>{soundOn ? "MUTE" : "SOUND ON"}</small>
          </span>
        </button>
        <div className="ink-plans-video-hero__controls">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={playing ? "Pause video" : "Play video"}
          >
            {playing ? <Pause size={17} /> : <Play size={17} />}
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Mute video" : "Unmute video"}
          >
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            {soundOn ? "Mute" : "Enable sound"}
          </button>
        </div>
        {videoError && (
          <p className="ink-plans-video-hero__error">
            Video not found: src/assets/Event/tattoo-hand.mp4
          </p>
        )}
      </section>

      <section className="ink-plans-festival" aria-label="Diwali special offer">
        <div className="ink-plans-container ink-plans-festival__inner">
          <DiyaIcon />
          <span className="ink-plans-festival__line" />
          <h2>Diwali Special Offer</h2>
          <span className="ink-plans-festival__line" />
          <DiyaIcon />
        </div>
      </section>

      <section
        id="membership-plans"
        className="ink-plans-memberships ink-plans-container"
        aria-label="Membership plans"
      >
        <p
          className="ink-plans-price-note"
          style={{ paddingBottom: 20 }}
          role="status"
        >
          {checking
            ? "Checking your artist profile…"
            : profile
              ? `Verified artist: ${profile.name || profile.studio || "Your profile"}. Choose a plan to submit a request.`
              : "Choose a plan, claim your artist profile, then submit your request."}
        </p>
        <div className="ink-plans-grid">
          {PLANS.map((plan, index) => (
            <article
              key={plan.id}
              className={`ink-plan-card ${plan.featured ? "ink-plan-card--featured" : ""}`}
              style={{
                "--card-delay": `${index * 100}ms`,
                outline:
                  selectedPlanId === plan.id ? "2px solid #79500c" : undefined,
                outlineOffset: 4,
              }}
              aria-labelledby={`plan-${plan.id}`}
            >
              <header className="ink-plan-card__header">
                <h2 id={`plan-${plan.id}`}>{plan.title}</h2>
                {plan.featured && (
                  <span className="ink-plan-card__badge">Best Value</span>
                )}
              </header>
              <div className="ink-plan-card__pricing">
                <p className="ink-plan-card__price">
                  {formatPrice(plan.price)}
                </p>
                <p className="ink-plan-card__billing">
                  Plan price · Valid for {plan.months} months
                </p>
              </div>
              <div className="ink-plan-card__benefit">
                <span className="ink-plan-card__count">{plan.customers}</span>
                <h3>Confirmed customers</h3>
                <p>Within your membership validity.</p>
              </div>
              <button
                type="button"
                className="ink-plan-card__button"
                disabled={checking || submitting}
                onClick={() => choosePlan(plan)}
              >
                <span>
                  {checking ? "Please wait…" : `Choose ${plan.title}`}
                </span>
                <ArrowRight aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>

        {error && (
          <p className="ink-plans-error" role="alert">
            {error}
          </p>
        )}
        {selectedPlan && !checking && (
          <section
            ref={requestSectionRef}
            className="ink-plans-promise"
            aria-labelledby="plan-request-title"
            style={{ scrollMarginTop: 130 }}
          >
            <div className="ink-plans-promise__icon">
              {receipt ? (
                <CheckCircle2 aria-hidden="true" />
              ) : (
                <ShieldCheck aria-hidden="true" />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {receipt ? (
                <div role="status">
                  <h2 id="plan-request-title">Request received</h2>
                  <p>
                    Your {receipt.title} membership request for{" "}
                    {formatPrice(receipt.price)} has been received. Our team
                    will contact you to confirm the next steps.
                  </p>
                  <p>
                    No online payment was taken. Membership activation is
                    handled separately.
                  </p>
                  <p style={{ overflowWrap: "anywhere" }}>
                    Request ID: {receipt.id}
                    <br />
                    Status: {receipt.status}
                  </p>
                </div>
              ) : profile ? (
                <>
                  <h2 id="plan-request-title">Review your plan request</h2>
                  <p>
                    <strong>Artist:</strong> {profile.name || "Artist"}
                    <br />
                    <strong>Studio:</strong>{" "}
                    {profile.studio || profile.studioName || "—"}
                    <br />
                    <strong>Location:</strong>{" "}
                    {[profile.city, profile.state].filter(Boolean).join(", ") ||
                      "—"}
                    <br />
                    <strong>Selected plan:</strong> {selectedPlan.title} ·{" "}
                    {formatPrice(selectedPlan.price)}
                    <br />
                    <strong>Includes:</strong> {selectedPlan.customers}{" "}
                    confirmed customers within {selectedPlan.months} months.
                  </p>
                  <p>
                    Submit your interest for our team to review. No payment is
                    taken on this page.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      marginTop: 18,
                    }}
                  >
                    <button
                      type="button"
                      className="ink-plan-card__button"
                      style={{ width: "auto" }}
                      disabled={submitting}
                      aria-busy={submitting}
                      onClick={submitPlanRequest}
                    >
                      <span>
                        {submitting ? "Submitting…" : "Submit Plan Request"}
                      </span>
                      {!submitting && <ArrowRight aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      className="ink-plan-card__button"
                      style={{ width: "auto" }}
                      disabled={submitting}
                      onClick={() => openClaimPage(selectedPlan.id)}
                    >
                      Review My Profile
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="plan-request-title">Claim your artist profile</h2>
                  <p>
                    Your selected plan is <strong>{selectedPlan.title}</strong>{" "}
                    for {formatPrice(selectedPlan.price)}. Verify and save your
                    artist profile to continue.
                  </p>
                  <button
                    type="button"
                    className="ink-plan-card__button"
                    style={{ width: "auto", marginTop: 18 }}
                    onClick={() => openClaimPage(selectedPlan.id)}
                  >
                    Claim Profile &amp; Continue{" "}
                    <ArrowRight aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </section>
        )}
        <aside
          className="ink-plans-promise"
          aria-labelledby="customer-promise-title"
        >
          <div className="ink-plans-promise__icon">
            <ShieldCheck aria-hidden="true" />
          </div>
          <div>
            <h2 id="customer-promise-title">Our Customer Promise</h2>
            <p>
              If we don’t deliver your plan’s promised customer count within its
              validity, you’ll receive a refund.
            </p>
          </div>
        </aside>
        <p className="ink-plans-price-note">
          All prices shown are for the full plan duration.
        </p>
      </section>
      <section className="ink-plans-closing ink-plans-container">
        <div className="ink-plans-closing__divider" aria-hidden="true">
          <span />
          <Sparkles size={25} />
          <span />
        </div>
        <h2>
          Make your next chapter <em>unforgettable.</em>
        </h2>
        <p>Your craft. Your community. Your next opportunity.</p>
      </section>
    </main>
  );
}
