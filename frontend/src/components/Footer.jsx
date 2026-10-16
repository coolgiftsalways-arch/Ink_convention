import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import "../Style/Footer.css";

// =====================================================
// INK CONVENTION — PREMIUM LIGHT FOOTER
// Updated office address: Mumbai, Maharashtra
// =====================================================

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Expo 2026", to: "/upcoming" },
  { label: "Gallery", to: "/gallery" },
  { label: "Artists", to: "/artists" },
  { label: "Hall Of Fame", to: "/hall-of-fame" },
  { label: "Sponsors", to: "/sponsors" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Data Deletion", to: "/data-deletion" },
  { label: "Terms", to: "/terms" },
];

function SocialLinks() {
  return (
    <div className="inkFooter-socials" aria-label="Contact Ink Convention">
      <a
        href="https://wa.me/message/U536VCYKIRWMA1"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        title="WhatsApp"
      >
        <MessageCircle size={19} strokeWidth={1.75} />
      </a>

      <a
        href="mailto:ink.convention.expo@gmail.com"
        aria-label="Send us an email"
        title="Email"
      >
        <Mail size={19} strokeWidth={1.75} />
      </a>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="inkFooter">
      <div className="inkFooter-container">
        <div className="inkFooter-grid">
          {/* BRAND */}
          <div className="inkFooter-brandColumn">
            <Link
              to="/"
              className="inkFooter-logo"
              aria-label="Ink Convention Home"
            >
              INKCONVENTION<span>.</span>
            </Link>

            <p className="inkFooter-brandDescription">
              EXPO 2026. The Premier Global Tattoo Event.
            </p>

            <p className="inkFooter-brandTagline">
              Real Art • Real Artists • One Community
            </p>
          </div>

          {/* OFFICE — UPDATED MUMBAI ADDRESS */}
          <div className="inkFooter-column">
            <h3 className="inkFooter-heading">Office</h3>

            <address className="inkFooter-officeAddress">
              <span>Plot C-66, G Block,</span>
              <span>Bandra Kurla Complex (BKC),</span>
              <span>Bandra East, Mumbai,</span>
              <span>Maharashtra 400051, India</span>
            </address>

            <a
              className="inkFooter-emailLink"
              href="mailto:ink.convention.expo@gmail.com"
            >
              ink.convention.expo@gmail.com
            </a>
          </div>

          {/* LINKS */}
          <div className="inkFooter-column">
            <h3 className="inkFooter-heading">Links</h3>

            <nav aria-label="Footer navigation">
              <ul className="inkFooter-links">
                {footerLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to}>
                      <span>{label}</span>
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ALERTS */}
          <div className="inkFooter-column inkFooter-alertsColumn">
            <h3 className="inkFooter-heading">INKCONVENTION ALERTS</h3>

            <p className="inkFooter-alertsCopy">
              Get notified for upcoming cities, finalist announcements, stall
              availability and ticket releases.
            </p>

            <SocialLinks />

           
          </div>
        </div>

        {/* LOWER STRIP */}
        <div className="inkFooter-bottom">
          <p>
            © {new Date().getFullYear()} INKCONVENTION. All rights reserved.
          </p>

          <nav className="inkFooter-legal" aria-label="Legal information">
            {legalLinks.map(({ label, to }) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
