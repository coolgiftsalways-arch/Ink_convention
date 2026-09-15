import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ShieldCheck,
  FileText,
  CreditCard,
  Users,
} from "lucide-react";
import "../Style/Terms.css";

const terms = [
  {
    number: "01",
    title: "About InkConvention",
    content: (
      <p>
        InkConvention is an online platform that helps users discover tattoo
        artists, explore tattoo work, submit booking requests, and connect with
        tattoo professionals.
      </p>
    ),
  },
  {
    number: "02",
    title: "Acceptance of Terms",
    content: (
      <p>
        By accessing or using InkConvention, you agree to these Terms of
        Service. If you do not agree with these terms, please do not use the
        platform.
      </p>
    ),
  },
  {
    number: "03",
    title: "User Accounts and Information",
    content: (
      <>
        <p>
          Users are responsible for providing accurate and up-to-date
          information when submitting forms, creating accounts, or making
          booking requests.
        </p>

        <p>
          You are responsible for maintaining the confidentiality of any account
          credentials associated with your use of the platform.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "Artist Listings",
    content: (
      <p>
        Artist profiles and information may be provided by artists or managed by
        InkConvention. InkConvention does not guarantee the accuracy,
        availability, quality, or suitability of any artist, studio, service, or
        portfolio displayed on the platform.
      </p>
    ),
  },
  {
    number: "05",
    title: "Booking Requests",
    content: (
      <p>
        A booking request submitted through InkConvention does not automatically
        guarantee an appointment. Final appointment availability, pricing,
        tattoo design, placement, timing, and other details must be confirmed
        directly with the relevant artist or studio.
      </p>
    ),
  },
  {
    number: "06",
    title: "Payments and Subscriptions",
    content: (
      <p>
        Certain InkConvention features, listings, promotional services, or
        subscriptions may require payment. Applicable prices, payment terms, and
        refund conditions will be presented before payment where applicable.
      </p>
    ),
  },
  {
    number: "07",
    title: "Tattoo Services",
    content: (
      <>
        <p>
          InkConvention is a platform connecting users with tattoo
          professionals. InkConvention does not itself provide tattooing
          services unless explicitly stated otherwise.
        </p>

        <p>
          Users should independently discuss health requirements, allergies,
          aftercare, pricing, design, consent, and other relevant matters with
          their chosen tattoo artist or studio.
        </p>
      </>
    ),
  },
  {
    number: "08",
    title: "User Content",
    content: (
      <p>
        Users may submit information, images, artwork, tattoo ideas, references,
        and other content. You represent that you have the right to submit such
        content and that your submission does not knowingly violate another
        person's rights.
      </p>
    ),
  },
  {
    number: "09",
    title: "Prohibited Use",
    content: (
      <p>
        You must not misuse InkConvention, attempt to gain unauthorized access
        to the platform, interfere with its operation, submit fraudulent
        information, or use the platform for unlawful purposes.
      </p>
    ),
  },
  {
    number: "10",
    title: "Intellectual Property",
    content: (
      <p>
        InkConvention&apos;s website, branding, design, software, and original
        content are protected by applicable intellectual property laws. You may
        not reproduce or commercially exploit InkConvention materials without
        appropriate authorization.
      </p>
    ),
  },
  {
    number: "11",
    title: "Third-Party Services",
    content: (
      <p>
        InkConvention may use third-party services for payments, communications,
        hosting, analytics, authentication, or other functionality. Your use of
        those services may also be subject to their respective terms and
        policies.
      </p>
    ),
  },
  {
    number: "12",
    title: "Limitation of Liability",
    content: (
      <p>
        To the extent permitted by applicable law, InkConvention is not
        responsible for disputes, injuries, losses, cancellations, pricing
        disagreements, or other issues arising directly from interactions
        between users, tattoo artists, and studios.
      </p>
    ),
  },
  {
    number: "13",
    title: "Changes to These Terms",
    content: (
      <p>
        InkConvention may update these Terms of Service from time to time.
        Updated terms will be published on this page.
      </p>
    ),
  },
  {
    number: "14",
    title: "Contact",
    content: (
      <>
        <p>
          If you have questions about these Terms of Service, contact
          InkConvention at:
        </p>

        <a
          href="mailto:ink.convention.expo@gmail.com"
          className="terms-email-link"
        >
          ink.convention.expo@gmail.com
          <ArrowUpRight size={16} />
        </a>
      </>
    ),
  },
];

export default function Terms() {
  return (
    <main className="terms-page">
      <div className="terms-noise" />
      <div className="terms-glow terms-glow-one" />
      <div className="terms-glow terms-glow-two" />

      {/* TOP BAR */}
     

      {/* HERO */}
      <section className="terms-hero">
        <div className="terms-hero-left">
          <div className="terms-eyebrow">
            <span />
            LEGAL / TERMS
          </div>

          <h1>
            TERMS
            <span> OF SERVICE.</span>
          </h1>

          <p>
            Clear rules for using InkConvention, connecting with tattoo
            professionals, submitting bookings, payments and platform services.
          </p>

          <a href="#terms-content" className="terms-view-btn">
            VIEW TERMS
            <span>↓</span>
          </a>
        </div>

        <div className="terms-hero-art">
          <div className="terms-big-number">14</div>

          <div className="terms-art-copy">
            <small>SECTIONS</small>
            <strong>
              CLEAR TERMS.
              <br />
              BETTER EXPERIENCE.
            </strong>
          </div>

          <div className="terms-circle">INK • PEOPLE • ART • COMMUNITY •</div>
        </div>
      </section>

      {/* QUICK CARDS */}
      <section className="terms-summary">
        <div className="terms-summary-card">
          <ShieldCheck />

          <div>
            <small>PLATFORM</small>
            <h3>Fair Use</h3>
            <p>Rules for safely using InkConvention.</p>
          </div>
        </div>

        <div className="terms-summary-card">
          <Users />

          <div>
            <small>ARTISTS</small>
            <h3>Connections</h3>
            <p>How customers and professionals interact.</p>
          </div>
        </div>

        <div className="terms-summary-card">
          <CreditCard />

          <div>
            <small>PAYMENTS</small>
            <h3>Subscriptions</h3>
            <p>Terms around paid services and features.</p>
          </div>
        </div>

        <div className="terms-summary-card">
          <FileText />

          <div>
            <small>LEGAL</small>
            <h3>Your Agreement</h3>
            <p>Important responsibilities and limitations.</p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="terms-content" id="terms-content">
        <aside className="terms-side">
          <span>01 / 14</span>

          <h2>
            READ ONLY
            <br />
            <em>WHAT YOU NEED.</em>
          </h2>

          <p>Click any section to expand it. Everything else stays compact.</p>

          <div className="terms-side-line" />
        </aside>

        <div className="terms-accordion-list">
          {terms.map((term) => (
            <details key={term.number} className="terms-accordion">
              <summary>
                <span className="terms-number">{term.number}</span>

                <h3>{term.title}</h3>

                <ChevronDown size={19} className="terms-chevron" />
              </summary>

              <div className="terms-accordion-body">{term.content}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="terms-cta">
        <div>
          <span>NEED CLARIFICATION?</span>

          <h2>
            HAVE A QUESTION
            <br />
            <strong>ABOUT OUR TERMS?</strong>
          </h2>
        </div>

        <a href="mailto:ink.convention.expo@gmail.com">
          CONTACT US
          <ArrowUpRight size={18} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="terms-footer">
        <Link to="/" className="terms-footer-logo">
          INK<span>CONVENTION.</span>
        </Link>

        <p>© {new Date().getFullYear()} Ink Convention</p>

        <div>
          <Link to="/privacy-policy">Privacy</Link>

          <Link to="/data-deletion">Data Deletion</Link>

          <Link to="/">Home</Link>
        </div>
      </footer>
    </main>
  );
}
