import { useEffect, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Phone,
  Mail,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";

const API_URL = import.meta.env.DEV
  ? ""
  : String(import.meta.env.VITE_API_URL || "https://api.inkconvention.com")
      .trim()
      .replace(/\/$/, "");

const STATUS_OPTIONS = ["all", "new", "contacted", "completed", "cancelled"];

const PLAN_LABELS = {
  quarterly: "3 Months",
  "half-yearly": "6 Months",
  yearly: "1 Year",
};

function money(value) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function dateLabel(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function requestId(request) {
  return String(request?._id || request?.id || "");
}

/*
 * Show the membership tier AND the duration the artist chose.
 * Old Silver/Gold requests do not contain planOption/durationMonths:
 * the existing backend activated those requests for one calendar year.
 * Do not invent a 3- or 6-month selection for those historical records.
 */
function membershipTier(request) {
  const tier = String(request?.requestedPlan || "")
    .trim()
    .toLowerCase();
  if (tier === "verified" || tier === "gold") return "Gold / Verified";
  if (tier === "pro" || tier === "silver") return "Silver / Pro";
  if (tier === "basic" || tier === "free") return "Free / Basic";
  return (
    request?.selectedPlanName ||
    request?.requestedPlanName ||
    request?.planName ||
    request?.planTitle ||
    request?.requestedPlan ||
    "Plan not recorded"
  );
}

function planDuration(request) {
  const option = String(request?.planOption || "")
    .trim()
    .toLowerCase();
  if (option && PLAN_LABELS[option]) {
    return { label: PLAN_LABELS[option], isLegacy: false };
  }

  const duration = Number(request?.durationMonths);
  if ([3, 6, 12].includes(duration)) {
    return {
      label: duration === 12 ? "12 Months" : `${duration} Months`,
      isLegacy: false,
    };
  }

  if (
    option ||
    (request?.durationMonths != null && request.durationMonths !== "")
  ) {
    return { label: "Duration not recorded", isLegacy: false };
  }

  // These are historical annual Silver/Gold requests from the original API.
  if (
    ["pro", "verified"].includes(
      String(request?.requestedPlan || "").toLowerCase(),
    )
  ) {
    return { label: "12 Months (older plan)", isLegacy: true };
  }

  return { label: "Duration not recorded", isLegacy: false };
}

function planLabel(request) {
  const tier = membershipTier(request);
  const duration = planDuration(request).label;
  return `${tier} - ${duration}`;
}

async function adminRequest(path, options = {}) {
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
    const fallback =
      response.status === 401 || response.status === 403
        ? "Please sign in with an authorized admin account."
        : "Unable to complete the request.";

    throw new Error(data?.message || data?.error || fallback);
  }

  return data;
}

export default function PlanRequests() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");

  const actionLock = useRef(false);

  const selectedRequest = requests.find(
    (request) => requestId(request) === selectedId,
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadRequests() {
      setLoading(true);
      setError("");

      try {
        const data = await adminRequest("/api/membership-requests/admin/all", {
          signal: controller.signal,
        });

        if (!Array.isArray(data.requests)) {
          throw new Error(
            "The server did not return a valid membership request list.",
          );
        }

        if (!controller.signal.aborted) {
          setRequests(data.requests);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadRequests();

    return () => controller.abort();
  }, [reloadKey]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = status === "all" || request.requestStatus === status;

    const searchableText = [
      request.name,
      request.studio,
      request.phone,
      request.email,
      request.city,
      request.state,
      planLabel(request),
      requestId(request),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesStatus &&
      (!normalizedSearch || searchableText.includes(normalizedSearch))
    );
  });

  const counts = {
    total: requests.length,

    new: requests.filter((request) => request.requestStatus === "new").length,

    completed: requests.filter(
      (request) => request.requestStatus === "completed",
    ).length,

    cancelled: requests.filter(
      (request) => request.requestStatus === "cancelled",
    ).length,
  };

  function selectRequest(request) {
    setSelectedId(requestId(request));
    setNotes(request.notes || "");
    setError("");
    setSuccess("");
  }

  async function performAction(request, action, extra = {}) {
    if (actionLock.current || loading) return;

    const id = requestId(request);
    if (!id) return;

    if (action === "mark-paid") {
      const confirmed = window.confirm(
        `Confirm that payment of ${money(
          request.requestedAmount,
        )} has actually been received from ${request.name || "this artist"}?`,
      );

      if (!confirmed) return;
    }

    if (action === "activate") {
      const confirmed = window.confirm(
        `Activate ${planLabel(request)} for ${
          request.name || "this artist"
        }? The server will set the membership dates.`,
      );

      if (!confirmed) return;
    }

    if (action === "cancel") {
      const confirmed = window.confirm(
        "Cancel this request? This action does not issue a refund.",
      );

      if (!confirmed) return;
    }

    actionLock.current = true;
    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      const actionPaths = {
        contact: "contacted",
        "mark-paid": "paid",
        activate: "activate",
        cancel: "cancel",
        "save-notes": "notes",
      };

      const endpoint = actionPaths[action];

      if (!endpoint) {
        throw new Error("Unsupported membership request action.");
      }

      const data = await adminRequest(
        `/api/membership-requests/${encodeURIComponent(id)}/${endpoint}`,
        {
          method: "PATCH",
          ...(action === "save-notes" ? { body: { notes: extra.notes } } : {}),
        },
      );

      const updated = data.request;

      if (!updated || requestId(updated) !== id) {
        throw new Error(
          "The server response could not be confirmed. Refresh before trying again.",
        );
      }

      setRequests((previous) =>
        previous.map((item) => (requestId(item) === id ? updated : item)),
      );

      if (selectedId === id) {
        setNotes(updated.notes || "");
      }

      const messages = {
        contact: "Request marked as contacted.",
        "mark-paid": "Payment marked as paid.",
        activate: "Membership activated.",
        cancel: "Request cancelled.",
        "save-notes": "Notes saved.",
      };

      setSuccess(messages[action] || "Request updated.");
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      actionLock.current = false;
      setBusyId("");
    }
  }

  /* Only deletes the membership *request* record. It will not revoke an
     activated studio membership, take money back or initiate a refund. */
  async function deleteRequest(request) {
    if (actionLock.current || loading) return;

    const id = requestId(request);
    if (!id) return;

    const isPaid = request.paymentStatus === "paid";
    const isCompleted = request.requestStatus === "completed";
    const recordWarning =
      isPaid || isCompleted
        ? "\n\nIMPORTANT: This record contains paid/completed membership history. " +
          "Deleting it will NOT cancel the live membership or issue a refund."
        : "";

    const answer = window.prompt(
      `Permanently delete the membership request for ${request.name || "this artist"}?` +
        `\nSelected plan: ${planLabel(request)}` +
        `\nAmount: ${money(request.requestedAmount)}` +
        `\n\nThis cannot be undone. The artist profile will not be deleted.` +
        recordWarning +
        `\n\nType DELETE to confirm:`,
      "",
    );

    if (answer !== "DELETE") return;

    actionLock.current = true;
    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      const data = await adminRequest(
        `/api/membership-requests/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      if (data.deletedRequestId && String(data.deletedRequestId) !== id) {
        throw new Error(
          "The server did not confirm the correct deletion. Please refresh.",
        );
      }

      setRequests((previous) =>
        previous.filter((item) => requestId(item) !== id),
      );
      if (selectedId === id) {
        setSelectedId("");
        setNotes("");
      }
      setSuccess(
        `Request for ${request.name || "artist"} deleted permanently.`,
      );
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete membership request.");
    } finally {
      actionLock.current = false;
      setBusyId("");
    }
  }

  return (
    <main className="plan-admin">
      <style>{styles}</style>

      <header className="plan-admin__header">
        <div>
          <p className="plan-admin__eyebrow">INK CONVENTION · ADMIN</p>
          <h1>Plan Requests</h1>
          <p className="plan-admin__muted">
            Review artist requests, record payments and activate memberships.
          </p>
        </div>

        <button
          type="button"
          className="plan-admin__button"
          disabled={loading || Boolean(busyId)}
          onClick={() => {
            setSuccess("");
            setReloadKey((value) => value + 1);
          }}
        >
          <RefreshCw size={16} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </header>

      <section className="plan-admin__stats" aria-label="Request totals">
        <StatCard
          label="Total requests"
          value={counts.total}
          icon={<Users size={20} />}
        />
        <StatCard
          label="New requests"
          value={counts.new}
          icon={<Clock size={20} />}
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          icon={<CheckCircle2 size={20} />}
        />
        <StatCard
          label="Cancelled"
          value={counts.cancelled}
          icon={<XCircle size={20} />}
        />
      </section>

      <div className="plan-admin__toolbar">
        <label className="plan-admin__search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search membership requests"
            placeholder="Search artist, studio, phone or city…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          <span className="plan-admin__sr-only">Filter by request status</span>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "all"
                  ? "All statuses"
                  : option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="plan-admin__notice is-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="plan-admin__notice is-success" role="status">
          {success}
        </div>
      )}

      <section className="plan-admin__table-wrap">
        <table
          className="plan-admin__table"
          aria-label="Membership plan requests and selected plans"
        >
          <thead>
            <tr>
              <th>Artist / Contact</th>
              <th>Selected Plan</th>
              <th>Price</th>
              <th>Customers</th>
              <th>Requested</th>
              <th>Request status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="plan-admin__empty">
                  Loading membership requests…
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} className="plan-admin__empty">
                  {error
                    ? "Requests could not be loaded."
                    : "No matching requests found."}
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={requestId(request)}>
                  <td>
                    <strong>{request.name || "Artist"}</strong>
                    <small>Studio: {request.studio || "Not recorded"}</small>
                    <small>Phone: {request.phone || "Not recorded"}</small>
                    <small>Email: {request.email || "Not recorded"}</small>
                    <small>
                      {[request.city, request.state]
                        .filter(Boolean)
                        .join(", ") || "Location not recorded"}
                    </small>
                  </td>

                  <td>
                    <strong className="plan-admin__tier">
                      {membershipTier(request)}
                    </strong>
                    <small>{planDuration(request).label}</small>
                  </td>
                  <td>{money(request.requestedAmount)}</td>
                  <td>{request.promisedCustomers ?? "—"}</td>
                  <td>{dateLabel(request.createdAt)}</td>

                  <td>
                    <StatusBadge value={request.requestStatus} />
                  </td>

                  <td>
                    <StatusBadge value={request.paymentStatus} />
                  </td>

                  <td>
                    <div className="plan-admin__row-actions">
                      <button
                        type="button"
                        className="plan-admin__button"
                        disabled={Boolean(busyId) || loading}
                        onClick={() => selectRequest(request)}
                      >
                        Manage
                      </button>
                      <button
                        type="button"
                        className="plan-admin__button is-danger"
                        disabled={Boolean(busyId) || loading}
                        aria-label={`Delete request from ${request.name || "artist"}`}
                        title="Permanently delete this request"
                        onClick={() => deleteRequest(request)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {selectedRequest && (
        <section
          className="plan-admin__details"
          aria-labelledby="selected-request-title"
        >
          <header className="plan-admin__details-header">
            <div>
              <p className="plan-admin__eyebrow">SELECTED REQUEST</p>

              <h2 id="selected-request-title">
                {selectedRequest.name || "Artist"}
              </h2>

              <p className="plan-admin__muted">
                {selectedRequest.studio || "Studio not provided"}
              </p>
            </div>

            <button
              type="button"
              className="plan-admin__button"
              disabled={Boolean(busyId)}
              onClick={() => setSelectedId("")}
            >
              Close
            </button>
          </header>

          <div className="plan-admin__detail-grid">
            <Detail
              label="Selected plan"
              value={membershipTier(selectedRequest)}
            />
            <Detail
              label="Amount"
              value={money(selectedRequest.requestedAmount)}
            />
            <Detail
              label="Validity"
              value={planDuration(selectedRequest).label}
            />
            <Detail
              label="Promised customers"
              value={selectedRequest.promisedCustomers ?? "Not recorded"}
            />
            <Detail
              label="Request status"
              value={selectedRequest.requestStatus}
            />
            <Detail
              label="Payment status"
              value={selectedRequest.paymentStatus}
            />
            <Detail
              label="Activated"
              value={dateLabel(selectedRequest.activatedAt)}
            />
            <Detail
              label="Location"
              value={
                [selectedRequest.city, selectedRequest.state]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
          </div>

          <div className="plan-admin__contacts">
            {selectedRequest.phone && (
              <a href={`tel:${selectedRequest.phone.replace(/[^\d+]/g, "")}`}>
                <Phone size={16} />
                {selectedRequest.phone}
              </a>
            )}

            {selectedRequest.email && (
              <a href={`mailto:${selectedRequest.email}`}>
                <Mail size={16} />
                {selectedRequest.email}
              </a>
            )}
          </div>

          <label className="plan-admin__notes">
            <span>Internal notes</span>

            <textarea
              value={notes}
              maxLength={5000}
              disabled={Boolean(busyId)}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add follow-up or payment reference details…"
              rows={4}
            />
          </label>

          <div className="plan-admin__actions">
            <button
              type="button"
              className="plan-admin__button"
              disabled={Boolean(busyId) || loading}
              onClick={() =>
                performAction(selectedRequest, "save-notes", {
                  notes: notes.trim(),
                })
              }
            >
              Save Notes
            </button>

            <button
              type="button"
              className="plan-admin__button"
              disabled={
                Boolean(busyId) ||
                loading ||
                selectedRequest.requestStatus !== "new"
              }
              onClick={() => performAction(selectedRequest, "contact")}
            >
              Mark Contacted
            </button>

            <button
              type="button"
              className="plan-admin__button"
              disabled={
                Boolean(busyId) ||
                loading ||
                selectedRequest.paymentStatus === "paid" ||
                ["cancelled", "completed"].includes(
                  selectedRequest.requestStatus,
                )
              }
              onClick={() => performAction(selectedRequest, "mark-paid")}
            >
              Confirm Payment Received
            </button>

            <button
              type="button"
              className="plan-admin__button is-gold"
              disabled={
                Boolean(busyId) ||
                loading ||
                selectedRequest.paymentStatus !== "paid" ||
                Boolean(selectedRequest.activatedAt) ||
                !["pro", "verified"].includes(selectedRequest.requestedPlan) ||
                ["cancelled", "completed"].includes(
                  selectedRequest.requestStatus,
                )
              }
              onClick={() => performAction(selectedRequest, "activate")}
            >
              Activate Plan
            </button>

            <button
              type="button"
              className="plan-admin__button is-danger"
              disabled={
                Boolean(busyId) ||
                loading ||
                Boolean(selectedRequest.activatedAt) ||
                selectedRequest.paymentStatus === "paid" ||
                ["cancelled", "completed"].includes(
                  selectedRequest.requestStatus,
                )
              }
              onClick={() => performAction(selectedRequest, "cancel")}
            >
              Cancel Request
            </button>

            <button
              type="button"
              className="plan-admin__button is-delete"
              disabled={Boolean(busyId) || loading}
              onClick={() => deleteRequest(selectedRequest)}
            >
              <Trash2 size={15} /> Delete Record Permanently
            </button>
          </div>

          {busyId && (
            <p className="plan-admin__muted" role="status">
              Updating request…
            </p>
          )}

          <p className="plan-admin__footnote">
            Confirm payment only after verifying receipt. Paid requests cannot
            be cancelled here; arrange any refund through your payment process.
            Deleting a request only removes its record; it does not remove an
            activated artist membership or refund a payment.
          </p>
        </section>
      )}
    </main>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <article className="plan-admin__stat">
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <span>{icon}</span>
    </article>
  );
}

function StatusBadge({ value }) {
  const knownStatuses = [
    "new",
    "contacted",
    "completed",
    "cancelled",
    "pending",
    "paid",
  ];

  const status = knownStatuses.includes(value) ? value : "unknown";

  return (
    <span className={`plan-admin__badge status-${status}`}>
      {value || "Unknown"}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value ?? "—"}</dd>
    </div>
  );
}

const styles = `
.plan-admin {
  min-height: 100vh;
  padding: 32px;
  background: #f5f3ed;
  color: #25251f;
  font-family: Arial, sans-serif;
}
.plan-admin * { box-sizing: border-box; }
.plan-admin h1,
.plan-admin h2,
.plan-admin p { margin: 0; }

.plan-admin__header,
.plan-admin__details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}
.plan-admin__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .18em;
  color: #8b671d;
  margin-bottom: 10px !important;
}
.plan-admin h1 {
  font-size: clamp(28px, 4vw, 42px);
  letter-spacing: -.04em;
  margin-bottom: 10px;
}
.plan-admin h2 { font-size: 25px; margin-bottom: 8px; }
.plan-admin__muted {
  font-size: 13px;
  line-height: 1.65;
  color: #6c6c60;
}
.plan-admin__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 25px;
}
.plan-admin__stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 22px;
  background: #fffefa;
  border: 1px solid #e1ddcf;
  border-radius: 14px;
}
.plan-admin__stat p { font-size: 12px; color: #747164; }
.plan-admin__stat strong {
  display: block;
  margin-top: 12px;
  font-size: 30px;
}
.plan-admin__stat > span {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: #f3e7c8;
  color: #88641b;
  border-radius: 12px;
}
.plan-admin__toolbar {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}
.plan-admin__search {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  padding: 0 15px;
  background: white;
  border: 1px solid #d9d5c8;
  border-radius: 10px;
}
.plan-admin__search input {
  width: 100%;
  min-width: 0;
  height: 46px;
  border: 0;
  background: transparent;
  color: #25251f;
  font: inherit;
  font-size: 13px;
}
.plan-admin select {
  height: 48px;
  padding: 0 15px;
  border: 1px solid #d9d5c8;
  border-radius: 10px;
  background: white;
  color: #25251f;
}
.plan-admin__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 10px 15px;
  border: 1px solid #d3cebf;
  border-radius: 8px;
  background: #fffefa;
  color: #302d24;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.plan-admin__button:hover:not(:disabled) {
  background: #eee8d9;
}
.plan-admin__button:disabled {
  opacity: .45;
  cursor: not-allowed;
}
.plan-admin__button.is-gold {
  background: #e8c771;
  border-color: #b78e32;
  color: #30250e;
}
.plan-admin__button.is-danger {
  background: #fff2ee;
  border-color: #e1b0a6;
  color: #a33d2e;
}
.plan-admin__button.is-delete {
  background: #a72f2e;
  border-color: #a72f2e;
  color: #fff;
}
.plan-admin__button.is-delete:hover:not(:disabled) {
  background: #841e20;
}
.plan-admin__row-actions {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 7px;
}
.plan-admin__row-actions .plan-admin__button {
  padding: 9px 12px;
  min-height: 36px;
  white-space: nowrap;
}
.plan-admin__tier { font-weight: 700; }
.plan-admin :is(button, input, textarea, select, a):focus-visible {
  outline: 3px solid #977127;
  outline-offset: 3px;
}
.plan-admin__table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e1ddcf;
  border-radius: 14px;
  background: #fffefa;
}
.plan-admin__table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  text-align: left;
}
.plan-admin__table th {
  padding: 16px;
  background: #eeeadf;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.plan-admin__table td {
  padding: 17px 16px;
  border-top: 1px solid #eeeade;
  font-size: 12px;
  vertical-align: middle;
}
.plan-admin__table small {
  display: block;
  margin-top: 5px;
  color: #777367;
  font-size: 11px;
}
.plan-admin__empty {
  padding: 45px !important;
  text-align: center;
  color: #777367;
}
.plan-admin__badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  background: #eee;
  color: #555;
  font-size: 10px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}
.plan-admin .status-new { background: #e9effd; color: #385d9b; }
.plan-admin .status-contacted { background: #fff0ca; color: #835e14; }
.plan-admin .status-paid,
.plan-admin .status-completed { background: #e1f3e9; color: #286648; }
.plan-admin .status-pending { background: #f5ecd6; color: #856018; }
.plan-admin .status-cancelled { background: #fbe7e2; color: #a54334; }

.plan-admin__notice {
  padding: 14px 18px;
  margin-bottom: 18px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.6;
}
.plan-admin__notice.is-error { background: #fce9e4; color: #983b2c; }
.plan-admin__notice.is-success { background: #e5f4e9; color: #286648; }

.plan-admin__details {
  padding: 27px;
  margin-top: 25px;
  border: 1px solid #ccb77e;
  border-radius: 14px;
  background: #fffefa;
}
.plan-admin__detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  padding-block: 20px;
  border-block: 1px solid #e8e1cf;
}
.plan-admin__detail-grid dt {
  font-size: 11px;
  color: #767163;
  margin-bottom: 7px;
}
.plan-admin__detail-grid dd {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.plan-admin__contacts,
.plan-admin__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}
.plan-admin__contacts a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #79591d;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.plan-admin__notes {
  display: block;
  margin-top: 24px;
}
.plan-admin__notes span {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
}
.plan-admin__notes textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #d9d1bc;
  border-radius: 9px;
  background: #fff;
  color: #25251f;
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
}
.plan-admin__footnote {
  margin-top: 18px !important;
  font-size: 11px;
  line-height: 1.7;
  color: #777367;
}
.plan-admin__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
@media (max-width: 1000px) {
  .plan-admin__stats,
  .plan-admin__detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .plan-admin { padding: 20px 14px; }
  .plan-admin__header { align-items: flex-start; }
  .plan-admin__header > button { padding: 10px; }
  .plan-admin__stats { gap: 10px; }
  .plan-admin__stat { padding: 15px; }
  .plan-admin__stat > span { display: none; }
  .plan-admin__toolbar { flex-direction: column; }
  .plan-admin select { width: 100%; }
  .plan-admin__details { padding: 18px; }
  .plan-admin__actions > button { flex: 1 1 140px; }
}
`;
