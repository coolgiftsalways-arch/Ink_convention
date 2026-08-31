import { useEffect, useState } from "react";

import {
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  Trash2,
  RefreshCw,
  UserRound,
  Search,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";

import "../Style/AdminClients.css";

export default function Clients() {
  // =====================================================
  // AUTH
  // =====================================================

  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isLoggedIn") === "true"
  );

  // =====================================================
  // CLIENT DATA
  // =====================================================

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =====================================================
  // API
  // =====================================================

  const API_URL = "http://localhost:5000";
  // For local testing, use:
  // const API_URL = "http://localhost:5000";

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userEmail");

    setIsAuthenticated(false);
  };

  // =====================================================
  // FETCH CLIENTS
  // =====================================================

  const fetchClients = async () => {
    try {
      setLoading(true);

      console.log("🔄 Fetching clients...");

      const response = await fetch(
        `${API_URL}/api/clients`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("📋 Clients response:", data);

      if (data.success) {
        setClients(data.clients || []);
      } else {
        console.error(
          "Failed to fetch clients:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "❌ Client fetch error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE CLIENT
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this client?"
    );

    if (!confirmed) return;

    try {
      console.log(
        "🗑️ Deleting client:",
        id
      );

      const response = await fetch(
        `${API_URL}/api/clients/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      console.log(
        "Delete response:",
        data
      );

      if (response.ok && data.success) {
        setClients((prev) =>
          prev.filter(
            (client) => client._id !== id
          )
        );

        alert("Client deleted successfully.");
      } else {
        alert(
          data.message ||
            "Failed to delete client."
        );
      }
    } catch (error) {
      console.error(
        "❌ Delete client error:",
        error
      );

      alert(
        "Network error. Could not delete client."
      );
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredClients = clients.filter(
    (client) => {
      const searchText =
        search.toLowerCase().trim();

      return (
        client.name
          ?.toLowerCase()
          .includes(searchText) ||

        client.gmail
          ?.toLowerCase()
          .includes(searchText) ||

        client.phone
          ?.toLowerCase()
          .includes(searchText) ||

        client.city
          ?.toLowerCase()
          .includes(searchText) ||

        client.state
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  // =====================================================
  // LOGIN REQUIRED
  // =====================================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center">
        <div className="text-center">

          <Users
            size={40}
            className="text-[#a855f7] mx-auto mb-5"
          />

          <h1 className="text-2xl font-black">
            Admin Authentication Required
            <span className="text-[#a855f7]">
              .
            </span>
          </h1>

          <p className="mt-2 text-gray-500 font-mono text-xs">
            Please login to access client records.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="admin-clients-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar
        onLogout={handleLogout}
        tattooCount={0}
        clientCount={clients.length}
      />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="flex-1 lg:pl-72">

        <div className="admin-clients-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="clients-header">

            <div className="clients-header-left">

              <div className="clients-eyebrow">
                <Users size={13} />
                Client Registry
              </div>

              <h1 className="clients-title">
                Clients
                <span>.</span>
              </h1>

              <p className="clients-description">
                Manage client registrations and view
                contact information collected through
                the Ink Convention experience.
              </p>

            </div>

            {/* REFRESH */}

            <button
              onClick={fetchClients}
              className="clients-refresh"
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              {loading
                ? "Loading"
                : "Refresh"}
            </button>

          </header>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="clients-stats">

            {/* TOTAL CLIENTS */}

            <div className="clients-stat-card">

              <p className="clients-stat-label">
                Total Clients
              </p>

              <p className="clients-stat-number">
                {clients.length}
              </p>

            </div>

            {/* REGISTRATION */}

            <div className="clients-stat-card">

              <p className="clients-stat-label">
                Registration
              </p>

              <div className="clients-stat-active">

                <span className="clients-stat-active-dot" />

                ACTIVE

              </div>

            </div>

            {/* SERVER */}

            <div className="clients-stat-card">

              <p className="clients-stat-label">
                Server
              </p>

              <p className="clients-stat-online">
                ONLINE
              </p>

            </div>

          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="clients-toolbar">

            <div className="clients-search">

              <Search
                size={17}
                className="clients-search-icon"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name, email, phone, city..."
                className="clients-search-input"
              />

            </div>

          </div>

          {/* =================================================
              CLIENT SECTION
          ================================================= */}

          <section>

            {/* SECTION HEADER */}

            <div className="clients-section-header">

              <div className="clients-section-title">

                <Users size={15} />

                Client Registrations
                {" "}
                ({filteredClients.length})

              </div>

              <span className="clients-live">
                Live Registry
              </span>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div className="clients-loading">

                <RefreshCw
                  size={30}
                  className="mx-auto text-[#a855f7] animate-spin"
                />

                <p className="clients-loading-text">
                  Loading client registry...
                </p>

              </div>

            ) : filteredClients.length === 0 ? (

              /* =================================================
                  EMPTY
              ================================================= */

              <div className="clients-empty">

                <div className="clients-empty-icon">

                  <Users size={28} />

                </div>

                <h3 className="clients-empty-title">

                  {search
                    ? "No Matching Clients"
                    : "No Clients Yet"}

                  <span>.</span>

                </h3>

                <p className="clients-empty-text">

                  {search
                    ? "Try a different search."
                    : "Client registrations will appear here."}

                </p>

              </div>

            ) : (

              /* =================================================
                 CLIENT CARDS
              ================================================= */

              <div className="clients-grid">

                {filteredClients.map(
                  (client) => (

                    <div
                      key={client._id}
                      className="client-card"
                    >

                      {/* PURPLE GLOW */}

                      <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#a855f7]/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

                      {/* =================================================
                          CARD HEADER
                      ================================================= */}

                      <div className="client-card-header">

                        <div className="client-profile">

                          <div className="client-avatar">

                            <UserRound
                              size={20}
                            />

                          </div>

                          <div className="client-name-wrapper">

                            <h3 className="client-name">
                              {client.name ||
                                "Unnamed Client"}
                            </h3>

                            <p className="client-type">
                              Client
                            </p>

                          </div>

                        </div>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(
                              client._id
                            )
                          }
                          className="client-delete"
                          title="Delete Client"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>

                      {/* =================================================
                          DETAILS
                      ================================================= */}

                      <div className="client-details">

                        {/* EMAIL */}

                        <div className="client-detail">

                          <Mail size={14} />

                          <span>
                            {client.gmail ||
                              "No email"}
                          </span>

                        </div>

                        {/* PHONE */}

                        <div className="client-detail">

                          <Phone size={14} />

                          <span>
                            {client.phone ||
                              "No phone"}
                          </span>

                        </div>

                        {/* LOCATION */}

                        <div className="client-detail">

                          <MapPin size={14} />

                          <span>

                            {client.city ||
                              "No city"}

                            {client.state
                              ? `, ${client.state}`
                              : ""}

                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          CARD FOOTER
                      ================================================= */}

                      <div className="client-card-footer">

                        <span className="client-date">

                          <Clock size={11} />

                          {client.createdAt
                            ? new Date(
                                client.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Unknown"}

                        </span>

                        <span className="client-status">
                          Registered
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}