import { Link } from "react-router-dom";

import "../Style/Footer.css";

function Footer() {
  return (
    <footer className="w-full bg-[#08080a] text-white border-t border-white/10 py-12 md:py-16 select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <Link
              to="/"
              className="text-xl font-black tracking-tighter uppercase text-white hover:opacity-80 transition"
            >
              INKCONVENTION.<span className="text-[#a855f7]">.</span>
            </Link>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs font-light">
              EXPO 2026. The Premier Global Tattoo Event.
            </p>
          </div>

          {/* Column 2: Office / Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#a855f7]">
              Office
            </h4>

            <div className="text-gray-400 text-xs sm:text-sm space-y-1.5 font-light">
              <p>ITPL Road, Whitefield</p>
              <p>Bangalore, Karnataka, PIN 560066, India</p>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#a855f7]">
              Links
            </h4>

            <ul className="flex flex-col space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link
                  to="/"
                  className="footer-link text-gray-400 hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="footer-link text-gray-400 hover:text-white"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/Upload"
                  className="footer-link text-gray-400 hover:text-white"
                >
                  Expo 2026
                </Link>
              </li>

              <li>
                <Link
                  to="/gallery"
                  className="footer-link text-gray-400 hover:text-white"
                >
                  Gallery
                </Link>
              </li>

              <li>
                <Link
                  to="/hall-of-fame"
                  className="footer-link text-gray-400 hover:text-white"
                >
                  Hall Of Fame
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Alerts & Social Icons */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#a855f7]">
              INKCONVENTION ALERTS
            </h4>

            <p className="text-gray-400 text-xs sm:text-sm font-light">
              Get notified for finalist announcements and ticket releases.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {/* WhatsApp */}
              <a
                href="https://wa.me/message/U536VCYKIRWMA1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:ink.convention.expo@gmail.com"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition duration-300"
                aria-label="Email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />

                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-mono">
          <p>© {new Date().getFullYear()} EXPO 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
