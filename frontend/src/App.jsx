import { useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Lenis from "lenis";
import gsap from "gsap";

/* =========================================================
   COMPONENTS
========================================================= */

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";
import Payment from "./components/Payment";

/* =========================================================
   PUBLIC PAGES
========================================================= */

import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import HallOfFame from "./pages/Halloffam";
import Artists from "./pages/Artists";
import Enter from "./pages/Enter";
import Upload from "./pages/Upload";
import TOP from "./pages/TOP";
import Upcoming from "./pages/Upcomeing";
import ClientLogin from "./pages/ClientLogin";

/* =========================================================
   ADMIN PAGES
========================================================= */

import Dashboard from "./admin/Dashboard";
import Clients from "./admin/Clients";
import AdminStalls from "./admin/AdminStalls";
import AdminArtists from "./admin/Adminartists";
import AdminLogin from "./admin/Login";

/*
  DO NOT import AdminSidebar here.

  AdminSidebar is already used inside your admin pages.

  src/admin/AdminSidebar.jsx
  is a component, not a separate page.
*/

/* =========================================================
   STYLES
========================================================= */

import "./Style/SmoothScroll.css";
import "./Style/BarbaTransitions.css";
import "./Style/PageTransition.css";

/* =========================================================
   LAYOUT
========================================================= */

function Layout() {
  const location = useLocation();

  /* =======================================================
     HIDE WEBSITE NAVBAR + FOOTER
     ON EVERY ADMIN PAGE

     /admin/dashboard
     /admin/clients
     /admin/stalls
     /admin/artists
     /admin/login
  ======================================================= */

  const isAdminPage =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/admin");

  return (
    <div
      className="
        min-h-screen
        bg-[#08080a]
        text-white
        flex
        flex-col
        justify-between
        selection:bg-[#a855f7]
        selection:text-white
      "
    >
      {/* ===================================================
          PUBLIC NAVBAR
      =================================================== */}

      {!isAdminPage && <Navbar />}

      {/* ===================================================
          ROUTES
      =================================================== */}

      <div className="flex-grow w-full">
        <Routes location={location} key={location.pathname}>
          {/* =================================================
              HOME
          ================================================= */}

          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />

          {/* =================================================
              ABOUT
          ================================================= */}

          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />

          {/* =================================================
              GALLERY
          ================================================= */}

          <Route
            path="/gallery"
            element={
              <PageTransition>
                <Gallery />
              </PageTransition>
            }
          />

          {/* =================================================
              SERVICES
          ================================================= */}

          <Route
            path="/services"
            element={
              <PageTransition>
                <Gallery />
              </PageTransition>
            }
          />

          {/* =================================================
              HALL OF FAME

              ₹2,999 VERIFIED ARTISTS
          ================================================= */}

          <Route
            path="/hall-of-fame"
            element={
              <PageTransition>
                <HallOfFame />
              </PageTransition>
            }
          />

          {/* =================================================
              ARTISTS DIRECTORY

              BASIC
              ₹1,499 SILVER
              ₹2,999 GOLD
          ================================================= */}

          <Route
            path="/artists"
            element={
              <PageTransition>
                <Artists />
              </PageTransition>
            }
          />

          {/* =================================================
              ARTIST CLAIM / UPDATE
          ================================================= */}

          <Route
            path="/Enter"
            element={
              <PageTransition>
                <Enter />
              </PageTransition>
            }
          />

          <Route
            path="/enter"
            element={
              <PageTransition>
                <Enter />
              </PageTransition>
            }
          />

          {/* =================================================
              TOP
          ================================================= */}

          <Route
            path="/top"
            element={
              <PageTransition>
                <TOP />
              </PageTransition>
            }
          />

          {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

          <Route
            path="/upcoming"
            element={
              <PageTransition>
                <Upcoming />
              </PageTransition>
            }
          />

          {/* =================================================
              CONTACT
          ================================================= */}

          <Route
            path="/contact"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />

          {/* =================================================
              COMPETITION UPLOAD
          ================================================= */}

          <Route
            path="/Upload"
            element={
              <PageTransition>
                <Upload />
              </PageTransition>
            }
          />

          <Route
            path="/upload"
            element={
              <PageTransition>
                <Upload />
              </PageTransition>
            }
          />

          {/* =================================================
              PAYMENT
          ================================================= */}

          <Route
            path="/payment"
            element={
              <PageTransition>
                <Payment />
              </PageTransition>
            }
          />

          {/* =================================================
              CLIENT LOGIN
          ================================================= */}

          <Route
            path="/client-login"
            element={
              <PageTransition>
                <ClientLogin />
              </PageTransition>
            }
          />

          {/* =================================================
              ADMIN ROOT

              /admin
                    ↓
              /admin/dashboard
          ================================================= */}

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* =================================================
              ADMIN LOGIN

              FILE:
              src/admin/Login.jsx

              URL:
              /admin/login
          ================================================= */}

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* =================================================
              OLD LOGIN REDIRECT SUPPORT

              Your Admin Login.jsx currently navigates to:
              /dashboard

              So this redirects it to:
              /admin/dashboard
          ================================================= */}

          <Route
            path="/dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* =================================================
              ADMIN COMPETITION DASHBOARD

              FILE:
              src/admin/Dashboard.jsx

              URL:
              /admin/dashboard
          ================================================= */}

          <Route
            path="/admin/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />

          {/* =================================================
              ADMIN CLIENTS

              FILE:
              src/admin/Clients.jsx

              URL:
              /admin/clients
          ================================================= */}

          <Route
            path="/admin/clients"
            element={
              <PageTransition>
                <Clients />
              </PageTransition>
            }
          />

          {/* =================================================
              ADMIN STALL BOOKINGS

              FILE:
              src/admin/AdminStalls.jsx

              URL:
              /admin/stalls
          ================================================= */}

          <Route
            path="/admin/stalls"
            element={
              <PageTransition>
                <AdminStalls />
              </PageTransition>
            }
          />

          {/* =================================================
              ADMIN ARTISTS

              FILE:
              src/admin/Adminartists.jsx

              Shows:
              BASIC artists
              ₹1,499 SILVER / PRO
              ₹2,999 GOLD / VERIFIED

              URL:
              /admin/artists
          ================================================= */}

          <Route
            path="/admin/artists"
            element={
              <PageTransition>
                <AdminArtists />
              </PageTransition>
            }
          />

          {/* =================================================
              404
          ================================================= */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* ===================================================
          PUBLIC FOOTER
      =================================================== */}

      {!isAdminPage && <Footer />}
    </div>
  );
}

/* =========================================================
   404 PAGE
========================================================= */

function NotFound() {
  return (
    <div
      className="
        min-h-[75vh]
        bg-[#08080a]
        flex
        flex-col
        items-center
        justify-center
        text-center
        px-5
      "
    >
      <p
        className="
          text-purple-500
          font-black
          text-sm
          tracking-[0.3em]
          mb-4
        "
      >
        404
      </p>

      <h1
        className="
          text-4xl
          sm:text-6xl
          font-black
          uppercase
          tracking-tighter
        "
      >
        PAGE NOT FOUND
      </h1>

      <p className="text-gray-500 mt-4">This page does not exist.</p>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  useEffect(() => {
    /* =====================================================
       LENIS SMOOTH SCROLL
    ===================================================== */

    const lenis = new Lenis({
      duration: 1.2,

      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    /* =====================================================
       GSAP + LENIS
    ===================================================== */

    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);

    gsap.ticker.lagSmoothing(0);

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      gsap.ticker.remove(raf);

      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />

      <Layout />
    </Router>
  );
}
