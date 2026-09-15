import { Link } from "react-router-dom";
import "../Style/DataDeletion.css";

const Step = ({ number, title, children }) => {
  return (
    <div className="dd-step">
      <span className="dd-step-number">{number}</span>

      <div className="dd-step-content">
        <h3>{title}</h3>
        <p>{children}</p>
      </div>

      <span className="dd-step-arrow">↘</span>
    </div>
  );
};

export default function DataDeletion() {
  return (
    <main className="dd-page">
      {/* BACKGROUND EFFECTS */}
      <div className="dd-noise" />
      <div className="dd-glow dd-glow-one" />
      <div className="dd-glow dd-glow-two" />

      {/* =====================================
          NAVBAR
      ====================================== */}

  

      {/* =====================================
          HERO
      ====================================== */}

      <section className="dd-hero">
        <div className="dd-hero-bg-text">DELETE</div>

        <div className="dd-tag">
          <span />
          LEGAL / DATA
        </div>

        <h1>
          DATA
          <span>DELETION.</span>
        </h1>

        <div className="dd-hero-bottom">
          <p>
            You have the right to request deletion of eligible personal
            information associated with your use of Ink Convention, including
            certain information received through Meta, WhatsApp and services
            connected with our platform.
          </p>

          <a href="#request" className="dd-main-button">
            REQUEST DELETION
            <span>↓</span>
          </a>
        </div>

        <div className="dd-side-words">
          <span>DATA</span>
          <span>CONTROL</span>
          <span>PRIVACY</span>
          <span>DELETE</span>
        </div>
      </section>

      {/* =====================================
          INTRO
      ====================================== */}

      <section className="dd-intro">
        <span className="dd-intro-number">01</span>

        <div className="dd-intro-title">
          <small>YOUR DATA / YOUR CONTROL</small>

          <h2>
            SIMPLE.
            <br />
            <strong>TRANSPARENT.</strong>
          </h2>
        </div>

        <div className="dd-intro-copy">
          <p>
            Ink Convention respects your privacy and provides a straightforward
            process for requesting deletion of eligible personal information.
          </p>

          <p>
            This may include information associated with your account,
            enquiries, artist profile, bookings, memberships, WhatsApp
            communications or other supported services.
          </p>
        </div>
      </section>

      {/* =====================================
          QUICK INFO CARDS
      ====================================== */}

      <section className="dd-quick">
        <a href="#data">
          <span>01</span>

          <div>
            <small>YOUR DATA</small>
            <strong>What can be deleted</strong>
          </div>

          <b>↘</b>
        </a>

        <a href="#process">
          <span>02</span>

          <div>
            <small>PROCESS</small>
            <strong>How deletion works</strong>
          </div>

          <b>↘</b>
        </a>

        <a href="#request">
          <span>03</span>

          <div>
            <small>REQUEST</small>
            <strong>Contact our team</strong>
          </div>

          <b>↘</b>
        </a>

        <Link to="/privacy-policy">
          <span>04</span>

          <div>
            <small>LEGAL</small>
            <strong>Privacy Policy</strong>
          </div>

          <b>↗</b>
        </Link>
      </section>

      {/* =====================================
          WHAT CAN BE DELETED
      ====================================== */}

      <section className="dd-grid-section" id="data">
        <aside className="dd-section-heading">
          <span>02 / DATA</span>

          <h2>
            WHAT CAN
            <br />
            <strong>BE DELETED?</strong>
          </h2>

          <p>
            Eligible personal information may be removed or de-identified
            following a verified request.
          </p>

          <div className="dd-heading-line" />
        </aside>

        <div className="dd-data-grid">
          <article>
            <span>01</span>

            <h3>Account Data</h3>

            <p>
              Eligible account information and personal information associated
              with your Ink Convention account.
            </p>
          </article>

          <article>
            <span>02</span>

            <h3>Contact Data</h3>

            <p>
              Phone numbers, email addresses and eligible contact information
              voluntarily submitted to Ink Convention.
            </p>
          </article>

          <article>
            <span>03</span>

            <h3>WhatsApp Data</h3>

            <p>
              Eligible WhatsApp-related information processed through supported
              Meta and WhatsApp integrations.
            </p>
          </article>

          <article>
            <span>04</span>

            <h3>Artist Profile</h3>

            <p>
              Eligible artist profile information, portfolio data, professional
              information and related account records.
            </p>
          </article>

          <article>
            <span>05</span>

            <h3>Enquiries</h3>

            <p>
              Eligible information submitted when sending tattoo, booking,
              customer or business enquiries.
            </p>
          </article>

          <article>
            <span>06</span>

            <h3>Communication Data</h3>

            <p>
              Eligible communication records associated with your interaction
              with Ink Convention.
            </p>
          </article>
        </div>
      </section>

      {/* =====================================
          PROCESS
      ====================================== */}

      <section className="dd-process" id="process">
        <aside className="dd-process-left">
          <span>03 / PROCESS</span>

          <h2>
            HOW TO
            <br />
            <strong>DELETE.</strong>
          </h2>

          <p>Follow these simple steps to submit a deletion request.</p>

          <div className="dd-heading-line" />
        </aside>

        <div className="dd-steps">
          <Step number="01" title="Send Your Request">
            Email Ink Convention using the contact address below and clearly
            state that you want eligible personal information associated with
            you to be deleted.
          </Step>

          <Step number="02" title="Provide Identification">
            Include enough information for us to identify your account or
            records, such as your registered name, phone number, email address
            or other relevant account details.
          </Step>

          <Step number="03" title="Verification">
            We may ask you to verify that you are the person associated with the
            information before processing your deletion request.
          </Step>

          <Step number="04" title="Review">
            Ink Convention will review the request and determine which
            information is eligible for deletion under applicable requirements.
          </Step>

          <Step number="05" title="Deletion">
            Once verified and approved, eligible information will be deleted or
            de-identified where reasonably practicable and legally permitted.
          </Step>

          <Step number="06" title="Confirmation">
            Where appropriate, we may confirm that the deletion request has been
            processed or provide information about any data that must legally be
            retained.
          </Step>
        </div>
      </section>

      {/* =====================================
          META / WHATSAPP
      ====================================== */}

      <section className="dd-meta">
        <div className="dd-meta-label">
          <span>04 / META</span>
        </div>

        <div className="dd-meta-main">
          <small>META & WHATSAPP DATA</small>

          <h2>
            PLATFORM DATA
            <br />
            <strong>MATTERS TOO.</strong>
          </h2>

          <p>
            If Ink Convention has received eligible information through Meta
            APIs, WhatsApp Business services or related platform integrations,
            users may request deletion of that information where applicable.
          </p>
        </div>

        <div className="dd-meta-note">
          <span>IMPORTANT</span>

          <p>
            Some information processed independently by Meta, WhatsApp or
            another third-party provider may need to be managed directly through
            that provider&apos;s own account, privacy or deletion tools.
          </p>
        </div>
      </section>

      {/* =====================================
          REQUEST
      ====================================== */}

      <section className="dd-request" id="request">
        <div className="dd-request-bg">REQUEST</div>

        <div className="dd-request-copy">
          <span>05 / REQUEST</span>

          <h2>
            READY TO
            <br />
            <strong>DELETE YOUR DATA?</strong>
          </h2>

          <p>
            Send your request from the email address or phone number associated
            with your Ink Convention activity where possible.
          </p>
        </div>

        <div className="dd-request-card">
          <small>DATA DELETION REQUEST</small>

          <h3>Contact Ink Convention</h3>

          <a href="mailto:ink.convention.expo@gmail.com">
            <div>
              <small>EMAIL</small>

              <strong>ink.convention.expo@gmail.com</strong>
            </div>

            <span>↗</span>
          </a>

          <a href="tel:+917039235169">
            <div>
              <small>PHONE</small>

              <strong>+91 70392 35169</strong>
            </div>

            <span>↗</span>
          </a>

          <a href="https://inkconvention.com/" target="_blank" rel="noreferrer">
            <div>
              <small>WEBSITE</small>

              <strong>inkconvention.com</strong>
            </div>

            <span>↗</span>
          </a>
        </div>
      </section>

      {/* =====================================
          WHAT TO INCLUDE
      ====================================== */}

      <section className="dd-include">
        <aside>
          <span>06 / REQUEST DETAILS</span>

          <h2>
            WHAT SHOULD
            <br />
            <strong>YOU INCLUDE?</strong>
          </h2>
        </aside>

        <div className="dd-include-grid">
          <div>
            <span>01</span>
            <p>Your full name</p>
          </div>

          <div>
            <span>02</span>
            <p>Your registered email address</p>
          </div>

          <div>
            <span>03</span>
            <p>Your mobile or WhatsApp number</p>
          </div>

          <div>
            <span>04</span>
            <p>Artist or studio name where applicable</p>
          </div>

          <div>
            <span>05</span>
            <p>Information you want deleted</p>
          </div>

          <div>
            <span>06</span>
            <p>Any useful account or request reference</p>
          </div>
        </div>
      </section>

      {/* =====================================
          RETENTION
      ====================================== */}

      <section className="dd-retention">
        <span>07 / IMPORTANT</span>

        <div>
          <h2>
            SOME DATA MAY NEED
            <br />
            <strong>TO BE RETAINED.</strong>
          </h2>

          <p>
            Certain information may need to be retained where required for legal
            compliance, financial records, fraud prevention, security, dispute
            resolution or other legitimate purposes.
          </p>
        </div>
      </section>

      {/* =====================================
          LINKS
      ====================================== */}

      <section className="dd-bottom-links">
        <Link to="/privacy-policy">
          <div>
            <small>READ NEXT</small>

            <strong>Privacy Policy</strong>
          </div>

          <span>↗</span>
        </Link>

        <Link to="/">
          <div>
            <small>RETURN</small>

            <strong>Ink Convention</strong>
          </div>

          <span>↗</span>
        </Link>
      </section>

      {/* =====================================
          FOOTER
      ====================================== */}

      <footer className="dd-footer">
        <Link to="/" className="dd-footer-logo">
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
