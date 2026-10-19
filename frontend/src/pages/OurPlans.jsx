import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import "../Style/OurPlans.css";

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const PLANS = [
  {
    id: "quarterly",
    title: "3 Months",
    months: 3,
    price: 1999,
    customers: 2,
  },
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

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function getPlan(id) {
  return PLANS.find((plan) => plan.id === id) || null;
}

function getProfileId(profile) {
  return String(profile?._id || profile?.id || profile?.profileId || "");
}

function normalizeMembership(value) {
  const plan = String(value || "").toLowerCase();

  if (["verified", "gold", "spotlight"].includes(plan)) {
    return "verified";
  }

  if (["pro", "silver"].includes(plan)) {
    return "pro";
  }

  return "basic";
}

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
      data?.message ||
        data?.error ||
        "Unable to complete this request. Please try again.",
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

export default function OurPlans({ heroImage = "/images/plans-tattoo.jpg" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPlanId =
    getPlan(location.state?.selectedPlanId)?.id ||
    getPlan(new URLSearchParams(location.search).get("plan"))?.id ||
    "";

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);

  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  const submitLock = useRef(false);
  const requestSectionRef = useRef(null);

  const selectedPlan = getPlan(selectedPlanId);

  // Only the backend session confirms the artist's identity.
  // Navigation state and browser storage do not prove ownership.
  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      setChecking(true);

      try {
        const data = await apiRequest("/api/claim/me", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const verifiedProfile = data.profile || data.artist;

        setProfile(getProfileId(verifiedProfile) ? verifiedProfile : null);
      } catch (sessionError) {
        if (controller.signal.aborted) return;

        setProfile(null);

        if (![401, 403].includes(sessionError.status)) {
          setError(
            "We couldn’t check your profile. Please refresh and try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      }
    }

    void checkSession();

    return () => controller.abort();
  }, []);

  // Keep the selected plan in the URL so refresh preserves it.
  useEffect(() => {
    if (!selectedPlanId) return;

    const params = new URLSearchParams(location.search);

    if (params.get("plan") === selectedPlanId) return;

    params.set("plan", selectedPlanId);

    navigate(
      {
        pathname: location.pathname,
        search: `?${params.toString()}`,
      },
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
      state: {
        returnTo: "/our-plans",
        selectedPlanId: planId,
      },
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

    window.requestAnimationFrame(() => {
      requestSectionRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    });
  }

  async function submitPlanRequest() {
    if (!selectedPlan || checking || submitLock.current) {
      return;
    }

    if (!profile) {
      openClaimPage(selectedPlan.id);
      return;
    }

    const reviewedProfileId = getProfileId(profile);

    submitLock.current = true;
    setSubmitting(true);
    setError("");
    setReceipt(null);

    try {
      // Recheck before submitting, in case the session expired
      // or another artist signed in after this page loaded.
      const sessionData = await apiRequest("/api/claim/me");
      const verifiedProfile = sessionData.profile || sessionData.artist;

      const verifiedProfileId = getProfileId(verifiedProfile);

      if (!verifiedProfileId) {
        setProfile(null);
        openClaimPage(selectedPlan.id);
        return;
      }

      if (verifiedProfileId !== reviewedProfileId) {
        setProfile(verifiedProfile);
        setError(
          "Your signed-in artist profile changed. Review the details below before submitting again.",
        );
        return;
      }

      setProfile(verifiedProfile);

      const data = await apiRequest("/api/membership-requests", {
        method: "POST",

        // These fields match the existing request format.
        // The backend must verify profile ownership and
        // derive pricing/benefits from planOption.
        body: {
          profileId: verifiedProfileId,

          currentPlan: normalizeMembership(
            verifiedProfile.plan || verifiedProfile.membershipPlan,
          ),

          requestedPlan: "verified",
          requestedPlanName: `Gold — ${selectedPlan.title}`,

          planOption: selectedPlan.id,
          durationMonths: selectedPlan.months,
          promisedCustomers: selectedPlan.customers,
          requestedAmount: selectedPlan.price,
          pricingType: "diwali-membership",

          name: verifiedProfile.name || "",
          email: verifiedProfile.email || "",

          phone:
            verifiedProfile.phone ||
            verifiedProfile.mobile ||
            verifiedProfile.phoneNumber ||
            "",

          city: verifiedProfile.city || "",
          state: verifiedProfile.state || "",

          studio: verifiedProfile.studio || verifiedProfile.studioName || "",

          source: "our_plans_page",
        },
      });

      const savedRequest = data.request || data.membershipRequest;

      // Do not show a successful duration-plan request if an
      // older backend silently discarded the new fields.
      const savedCorrectPlan =
        savedRequest &&
        (savedRequest._id || savedRequest.id) &&
        String(savedRequest.profileId) === verifiedProfileId &&
        savedRequest.requestedPlan === "verified" &&
        savedRequest.planOption === selectedPlan.id &&
        Number(savedRequest.durationMonths) === selectedPlan.months &&
        Number(savedRequest.promisedCustomers) === selectedPlan.customers &&
        Number(savedRequest.requestedAmount) === selectedPlan.price;

      if (!savedCorrectPlan) {
        setError(
          "The server responded, but we couldn’t confirm your selected plan details. Please contact Ink Convention before submitting again.",
        );
        return;
      }

      setReceipt({
        id: String(savedRequest._id || savedRequest.id),
        title: selectedPlan.title,
        price: Number(savedRequest.requestedAmount),
        status: savedRequest.requestStatus || "new",
      });
    } catch (requestError) {
      if ([401, 403].includes(requestError.status)) {
        setProfile(null);
        openClaimPage(selectedPlan.id);
        return;
      }

      setError(
        requestError.message ||
          "Unable to submit your request. Please try again.",
      );
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="ink-plans">
      <section className="ink-plans-hero">
        <div className="ink-plans-hero__photo" aria-hidden="true">
          <img src={heroImage} alt="" />
        </div>

        <div className="ink-plans-container ink-plans-hero__content">
          <p className="ink-plans-eyebrow">INK CONVENTION · OUR PLANS</p>

          <h1>
            Your art deserves
            <br />a bigger audience<span>.</span>
          </h1>

          <p className="ink-plans-hero__subtitle">
            Choose a plan. Grow your presence.
          </p>

          <a className="ink-plans-explore" href="#membership-plans">
            Explore memberships
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
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
              ? `Verified artist: ${
                  profile.name || profile.studio || "Your profile"
                }. Choose a plan to submit a request.`
              : "Choose a plan, claim your artist profile, then submit your request."}
        </p>

        <div className="ink-plans-grid">
          {PLANS.map((plan, index) => (
            <article
              key={plan.id}
              className={`ink-plan-card ${
                plan.featured ? "ink-plan-card--featured" : ""
              }`}
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
                className="ink-plan-card__button"
                type="button"
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
                    style={{
                      width: "auto",
                      marginTop: 18,
                    }}
                    onClick={() => openClaimPage(selectedPlan.id)}
                  >
                    Claim Profile & Continue
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
