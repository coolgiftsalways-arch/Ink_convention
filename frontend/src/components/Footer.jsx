import { Link } from "react-router-dom";
import "../Style/Footer.css";

function Footer() {
  return (
    <footer
      className="
        w-full
        bg-[#08080a]
        text-white
        border-t
        border-white/10
        py-12
        md:py-16
        select-none
        relative
        overflow-hidden
      "
    >
      {/* Soft purple footer glow */}
      <div
        className="
          absolute
          -top-24
          right-[8%]
          w-72
          h-72
          rounded-full
          bg-[#a855f7]/10
          blur-[110px]
          pointer-events-none
        "
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* =====================================================
            MAIN FOOTER
        ===================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* ===================================================
              COLUMN 1 — BRAND
          =================================================== */}
          <div className="space-y-4">
            <Link
              to="/"
              className="
                inline-flex
                items-center
                text-xl
                font-black
                tracking-tighter
                uppercase
                text-white
                hover:opacity-80
                transition
              "
            >
              INKCONVENTION
              <span className="text-[#a855f7]">.</span>
            </Link>

            <p
              className="
                text-gray-300
                text-xs
                sm:text-sm
                leading-relaxed
                max-w-xs
                font-light
              "
            >
              EXPO 2026. The Premier Global Tattoo Event.
            </p>

            <p
              className="
                text-white/45
                text-[9px]
                font-mono
                uppercase
                tracking-[0.15em]
              "
            >
              Real Art • Real Artists • One Community
            </p>
          </div>

          {/* ===================================================
              COLUMN 2 — OFFICE
          =================================================== */}
          <div className="space-y-4">
            <h4
              className="
                text-xs
                font-mono
                font-bold
                text-white
                uppercase
                tracking-widest
                relative
                pb-2

                after:content-['']
                after:absolute
                after:bottom-0
                after:left-0
                after:w-8
                after:h-0.5
                after:bg-[#a855f7]
              "
            >
              Office
            </h4>

            <div className="text-gray-300 text-xs sm:text-sm space-y-1.5 font-light">
              <p>ITPL Road, Whitefield</p>
              <p>Bangalore, Karnataka, PIN 560066, India</p>
            </div>

            <a
              href="mailto:ink.convention.expo@gmail.com"
              className="
                inline-block
                text-[10px]
                sm:text-xs
                text-gray-400
                hover:text-[#a855f7]
                transition-colors
                break-all
              "
            >
              ink.convention.expo@gmail.com
            </a>
          </div>

          {/* ===================================================
              COLUMN 3 — LINKS
          =================================================== */}
          <div className="space-y-4">
            <h4
              className="
                text-xs
                font-mono
                font-bold
                text-white
                uppercase
                tracking-widest
                relative
                pb-2

                after:content-['']
                after:absolute
                after:bottom-0
                after:left-0
                after:w-8
                after:h-0.5
                after:bg-[#a855f7]
              "
            >
              Links
            </h4>

            <ul className="flex flex-col space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link
                  to="/"
                  className="footer-link text-gray-300 hover:text-[#a855f7] transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="footer-link text-gray-300 hover:text-[#a855f7] transition-colors"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/upcoming"
                  className="footer-link text-gray-300 hover:text-[#a855f7] transition-colors"
                >
                  Expo 2026
                </Link>
              </li>

              <li>
                <Link
                  to="/gallery"
                  className="footer-link text-gray-300 hover:text-[#a855f7] transition-colors"
                >
                  Gallery
                </Link>
              </li>

              <li>
                <Link
                  to="/artists"
                  className="footer-link text-gray-300 hover:text-[#a855f7] transition-colors"
                >
                  Artists
                </Link>
              </li>

              <li>
                <Link
                  to="/hall-of-fame"
                  className="footer-link text-gray-300 hover:text-[#a855f7] transition-colors"
                >
                  Hall Of Fame
                </Link>
              </li>

              <li>
                <Link
                  to="/sponsors"
                  className="footer-link text-gray-300 hover:text-[#a855f7] transition-colors"
                >
                  Sponsors
                </Link>
              </li>
            </ul>
          </div>

          {/* ===================================================
              COLUMN 4 — ALERTS + CONTACT
          =================================================== */}
          <div className="space-y-4">
            <h4
              className="
                text-xs
                font-mono
                font-bold
                text-white
                uppercase
                tracking-widest
                relative
                pb-2

                after:content-['']
                after:absolute
                after:bottom-0
                after:left-0
                after:w-8
                after:h-0.5
                after:bg-[#a855f7]
              "
            >
              INKCONVENTION ALERTS
            </h4>

            <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">
              Get notified for upcoming cities, finalist announcements, stall
              availability and ticket releases.
            </p>

            {/* Social icons */}
            <div className="flex items-center space-x-3 pt-2">
              {/* WhatsApp */}
              <a
                href="https://wa.me/message/U536VCYKIRWMA1"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-white/[0.06]
                  border
                  border-white/15
                  flex
                  items-center
                  justify-center
                  text-white
                  hover:bg-[#a855f7]
                  hover:border-[#a855f7]
                  transition
                  duration-300
                "
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
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
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-white/[0.06]
                  border
                  border-white/15
                  flex
                  items-center
                  justify-center
                  text-white
                  hover:bg-[#a855f7]
                  hover:border-[#a855f7]
                  transition
                  duration-300
                "
                aria-label="Email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
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

            <Link
              to="/stall-booking"
              className="
                inline-flex
                items-center
                gap-2
                mt-2
                rounded-xl
                bg-[#a855f7]
                px-4
                py-3
                text-[9px]
                sm:text-[10px]
                font-black
                uppercase
                tracking-[0.12em]
                text-white
                hover:bg-[#9333ea]
                transition
              "
            >
              Book Your Stall
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* =====================================================
            BOTTOM FOOTER
        ===================================================== */}
        <div
          className="
            pt-8
            border-t
            border-white/10
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-5
            text-xs
            font-mono
          "
        >
          <p className="text-center md:text-left text-white/50">
            © {new Date().getFullYear()} INKCONVENTION. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link
              to="/privacy-policy"
              className="text-white/50 hover:text-[#a855f7] transition-colors duration-300"
            >
              Privacy Policy
            </Link>

            <Link
              to="/data-deletion"
              className="text-white/50 hover:text-[#a855f7] transition-colors duration-300"
            >
              Data Deletion
            </Link>

            <Link
              to="/terms"
              className="text-white/50 hover:text-[#a855f7] transition-colors duration-300"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
