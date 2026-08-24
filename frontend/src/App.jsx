import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import HallOfFame from "./pages/Halloffam";
import Upload from "./pages/Upload";
import TOP from "./pages/TOP";
import Payment from "./components/Payment"; // <--- IMPORT YOUR NEW PAYMENT COMPONENT HERE

// Admin
import Dashboard from "./admin/Dashboard";

// Styles
import "./Style/SmoothScroll.css";
import "./Style/BarbaTransitions.css";
import "./Style/PageTransition.css";

function Layout() {
  const location = useLocation();
  // Only exclude Navbar and Footer on the Admin Dashboard now
  const isExcludedNavFooter = location.pathname === "/admin/dashboard";

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col justify-between selection:bg-[#a855f7] selection:text-white">
      {/* Navbar will now show on Upload page, but stay hidden on Dashboard */}
      {!isExcludedNavFooter && <Navbar />}

      <div className="flex-grow w-full">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/gallery"
            element={
              <PageTransition>
                <Gallery />
              </PageTransition>
            }
          />
          <Route
            path="/services"
            element={
              <PageTransition>
                <Gallery />
              </PageTransition>
            }
          />
          <Route
            path="/hall-of-fame"
            element={
              <PageTransition>
                <HallOfFame />
              </PageTransition>
            }
          />
          <Route
            path="/top"
            element={
              <PageTransition>
                <TOP />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/Upload"
            element={
              <PageTransition>
                <Upload />
              </PageTransition>
            }
          />

          {/* ---> ADDED THE ROUTE FOR YOUR PAYMENT PAGE HERE <--- */}
          <Route
            path="/payment"
            element={
              <PageTransition>
                <Payment />
              </PageTransition>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />
        </Routes>
      </div>

      {/* Footer will now show on Upload page, but stay hidden on Dashboard */}
      {!isExcludedNavFooter && <Footer />}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: true,
    });

    lenis.on("scroll", gsap.updateRoot);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout />
    </Router>
  );
}
