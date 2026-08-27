import { useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Lenis from "lenis";
import gsap from "gsap";

/* ================================
   COMPONENTS
================================ */

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";

/* ================================
   PAGES
================================ */

import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import HallOfFame from "./pages/Halloffam";
import Artists from "./pages/Artists";
import Upload from "./pages/Upload";
import TOP from "./pages/TOP";
import Upcoming from "./pages/Upcomeing";
import Payment from "./components/Payment";
import ClientLogin from "./pages/ClientLogin";

/* ================================
   ADMIN
================================ */

import Dashboard from "./admin/Dashboard";
import Clients from "./admin/Clients";

/* ================================
   STYLES
================================ */

import "./Style/SmoothScroll.css";
import "./Style/BarbaTransitions.css";
import "./Style/PageTransition.css";


function Layout() {
  const location = useLocation();

  /* =================================
     HIDE NORMAL NAVBAR + FOOTER
     ON BOTH ADMIN PAGES
  ================================= */

  const isExcludedNavFooter =
    location.pathname === "/admin/dashboard" ||
    location.pathname === "/admin/clients";

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col justify-between selection:bg-[#a855f7] selection:text-white">

      {/* =================================
          NORMAL WEBSITE NAVBAR
          Hidden on admin pages
      ================================= */}

      {!isExcludedNavFooter && <Navbar />}

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <div className="flex-grow w-full">

        <Routes
          location={location}
          key={location.pathname}
        >

          {/* =================================
              HOME
          ================================= */}

          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />

          {/* =================================
              ABOUT
          ================================= */}

          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />

          {/* =================================
              GALLERY
          ================================= */}

          <Route
            path="/gallery"
            element={
              <PageTransition>
                <Gallery />
              </PageTransition>
            }
          />

          {/* =================================
              SERVICES
          ================================= */}

          <Route
            path="/services"
            element={
              <PageTransition>
                <Gallery />
              </PageTransition>
            }
          />

          {/* =================================
              HALL OF FAME
          ================================= */}

          <Route
            path="/hall-of-fame"
            element={
              <PageTransition>
                <HallOfFame />
              </PageTransition>
            }
          />

          {/* =================================
              ARTISTS
          ================================= */}

          <Route
            path="/artists"
            element={
              <PageTransition>
                <Artists />
              </PageTransition>
            }
          />

          {/* =================================
              TOP
          ================================= */}

          <Route
            path="/top"
            element={
              <PageTransition>
                <TOP />
              </PageTransition>
            }
          />

          {/* =================================
              UPCOMING EVENTS
          ================================= */}

          <Route
            path="/upcoming"
            element={
              <PageTransition>
                <Upcoming />
              </PageTransition>
            }
          />

          {/* =================================
              CONTACT
          ================================= */}

          <Route
            path="/contact"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />

          {/* =================================
              TATTOO UPLOAD
          ================================= */}

          <Route
            path="/Upload"
            element={
              <PageTransition>
                <Upload />
              </PageTransition>
            }
          />

          {/* =================================
              PAYMENT
          ================================= */}

          <Route
            path="/payment"
            element={
              <PageTransition>
                <Payment />
              </PageTransition>
            }
          />

          {/* =================================
              CLIENT LOGIN
          ================================= */}

          <Route
            path="/client-login"
            element={
              <PageTransition>
                <ClientLogin />
              </PageTransition>
            }
          />

          {/* =================================
              ADMIN - TATTOO SUBMISSIONS
          ================================= */}

          <Route
            path="/admin/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />

          {/* =================================
              ADMIN - CLIENTS
          ================================= */}

          <Route
            path="/admin/clients"
            element={
              <PageTransition>
                <Clients />
              </PageTransition>
            }
          />

        </Routes>

      </div>

      {/* =================================
          NORMAL WEBSITE FOOTER
          Hidden on admin pages
      ================================= */}

      {!isExcludedNavFooter && <Footer />}

    </div>
  );
}


/* ======================================
   APP
====================================== */

export default function App() {

  useEffect(() => {

    const lenis = new Lenis({
      duration: 1.2,

      easing: (t) =>
        Math.min(
          1,
          1.001 - Math.pow(2, -10 * t)
        ),

      direction: "vertical",

      smooth: true,
    });

    /* ================================
       LENIS + GSAP
    ================================= */

    lenis.on("scroll", gsap.updateRoot);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    /* ================================
       CLEANUP
    ================================= */

    return () => {

      lenis.destroy();

      gsap.ticker.remove(
        lenis.raf
      );

    };

  }, []);

  return (
    <Router>

      <ScrollToTop />

      <Layout />

    </Router>
  );
}