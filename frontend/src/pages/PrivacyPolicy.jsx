import { Link } from "react-router-dom";
import privacyHero from "../assets/sponsor-hero.png";
import "../Style/LegalPages.css";

const Accordion = ({ number, title, children }) => {
  return (
    <details className="privacy-item">
      <summary>
        <span className="privacy-item-number">{number}</span>

        <h3>{title}</h3>

        <span className="privacy-plus">+</span>
      </summary>

      <div className="privacy-item-content">{children}</div>
    </details>
  );
};

function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <div className="privacy-noise" />

      {/* =========================================
          TOP BAR
      ========================================== */}

      <header className="privacy-topbar">
        <Link to="/" className="privacy-logo">
          INK<span>CONVENTION</span>
        </Link>

        <div className="privacy-nav-actions">
          <Link to="/data-deletion">DATA DELETION</Link>

          <Link to="/" className="privacy-back-btn">
            BACK TO WEBSITE
            <span>↗</span>
          </Link>
        </div>
      </header>

      {/* =========================================
          HERO
      ========================================== */}

      <section className="privacy-hero">
        {/* IMAGE */}

        <div className="privacy-hero-image">
          <img src={privacyHero} alt="Ink Convention tattoo art" />

          <div className="privacy-image-overlay" />
        </div>

        {/* CONTENT */}

        <div className="privacy-hero-content">
          <div className="privacy-label">
            <span />
            LEGAL / PRIVACY
          </div>

          <h1>
            PRIVACY
            <span>POLICY.</span>
          </h1>

          <p>
            This Privacy Policy explains how Ink Convention collects, uses,
            stores, shares and protects information across our website, WhatsApp
            communications and services connected with Meta Platforms.
          </p>

          <div className="privacy-hero-links">
            <a href="#policy">
              VIEW POLICY
              <span>↓</span>
            </a>

            <Link to="/data-deletion">
              DELETE MY DATA
              <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="privacy-side-text">
          <span>ART</span>
          <span>PEOPLE</span>
          <span>PRIVACY</span>
          <span>ALWAYS</span>
        </div>
      </section>

      {/* =========================================
          INTRO
      ========================================== */}

      <section className="privacy-intro">
        <div className="privacy-intro-number">01</div>

        <div>
          <small>YOUR INFORMATION / YOUR CONTROL</small>

          <h2>
            PRIVACY SHOULDN&apos;T
            <br />
            <span>FEEL COMPLICATED.</span>
          </h2>
        </div>

        <div className="privacy-intro-text">
          <p>
            Ink Convention ("Ink Convention", "we", "our" or "us") respects your
            privacy and is committed to protecting your personal information.
          </p>

          <p>
            This Privacy Policy applies when you use{" "}
            <strong>https://inkconvention.com</strong>, register as an artist,
            book a stall, purchase a membership, submit an enquiry, communicate
            through WhatsApp or interact with services integrated with Meta
            Platforms.
          </p>
        </div>
      </section>

      {/* =========================================
          QUICK LINKS
      ========================================== */}

      <section className="privacy-quick">
        <a href="#information">
          <span>01</span>

          <div>
            <small>INFORMATION</small>
            <strong>What we collect</strong>
          </div>

          <b>↘</b>
        </a>

        <a href="#whatsapp">
          <span>02</span>

          <div>
            <small>MESSAGING</small>
            <strong>WhatsApp & Meta</strong>
          </div>

          <b>↘</b>
        </a>

        <a href="#rights">
          <span>03</span>

          <div>
            <small>CONTROL</small>
            <strong>Your rights</strong>
          </div>

          <b>↘</b>
        </a>

        <a href="#contact">
          <span>04</span>

          <div>
            <small>SUPPORT</small>
            <strong>Contact us</strong>
          </div>

          <b>↘</b>
        </a>
      </section>

      {/* =========================================
          POLICY
      ========================================== */}

      <section className="privacy-policy-wrapper" id="policy">
        {/* =====================================
            LEFT TITLE
        ====================================== */}

        <aside className="privacy-policy-left">
          <span>02 / POLICY</span>

          <h2>
            THE
            <br />
            DETAILS.
          </h2>

          <p>Open only the section you need.</p>

          <div className="privacy-policy-line" />
        </aside>

        {/* =====================================
            RIGHT ACCORDIONS
        ====================================== */}

        <div className="privacy-accordions">
          <div id="information">
            <Accordion number="01" title="Information We Collect">
              <p>
                Depending on how you interact with Ink Convention, we may
                collect personal information that you voluntarily provide to us.
              </p>

              <ul>
                <li>Full name</li>
                <li>Mobile and WhatsApp number</li>
                <li>Email address</li>
                <li>City, state and address</li>
                <li>Artist or studio name</li>
                <li>Business information</li>
                <li>Instagram or social media profile</li>
                <li>Profile photographs</li>
                <li>Artist portfolio images</li>
                <li>Tattoo interests and requirements</li>
                <li>Event registration information</li>
                <li>Stall booking information</li>
                <li>Membership information</li>
                <li>Messages and enquiries</li>
                <li>Payment and transaction information</li>
                <li>Communication preferences and consent records</li>
              </ul>
            </Accordion>
          </div>

          <div id="whatsapp">
            <Accordion
              number="02"
              title="Information Received Through Meta & WhatsApp"
            >
              <p>
                Ink Convention may use the WhatsApp Business Platform and other
                services provided by Meta Platforms to communicate with
                customers, tattoo artists, studios, exhibitors, sponsors and
                other users.
              </p>

              <p>Depending on your interaction with us, we may process:</p>

              <ul>
                <li>Your WhatsApp phone number</li>

                <li>Your WhatsApp user/account identifier</li>

                <li>Your WhatsApp profile name, where available</li>

                <li>Messages sent to Ink Convention</li>

                <li>
                  Images, videos, documents or audio voluntarily submitted
                </li>

                <li>Message identifiers</li>
                <li>Message timestamps</li>

                <li>Delivery and read status, where available</li>

                <li>Replies and interactions</li>

                <li>Opt-in and opt-out preferences</li>

                <li>Customer service information</li>

                <li>Lead or enquiry information</li>
              </ul>

              <p>
                We do not ask users to provide their Facebook, Instagram,
                WhatsApp or Meta passwords.
              </p>
            </Accordion>
          </div>

          <Accordion number="03" title="How We Use WhatsApp Information">
            <p>WhatsApp information may be used to:</p>

            <ul>
              <li>Respond to enquiries</li>
              <li>Provide customer support</li>

              <li>Connect customers with tattoo artists or studios</li>

              <li>Confirm registrations and bookings</li>

              <li>Provide stall booking updates</li>

              <li>Provide membership updates</li>

              <li>Send transaction-related messages</li>

              <li>Send requested event reminders</li>

              <li>Send OTP or verification messages where applicable</li>

              <li>Maintain communication history</li>

              <li>Prevent fraud or misuse</li>

              <li>Protect our services</li>

              <li>Comply with legal requirements</li>
            </ul>

            <p>
              Where appropriate consent has been obtained, we may also send
              event announcements, promotional messages, membership offers and
              other marketing communications.
            </p>
          </Accordion>

          <Accordion number="04" title="WhatsApp Consent & Opt-In">
            <p>
              Ink Convention does not intend to send unsolicited WhatsApp
              marketing messages.
            </p>

            <p>
              Where required, users provide permission before we send
              promotional communications through WhatsApp.
            </p>

            <p>Consent may be provided through:</p>

            <ul>
              <li>Website checkboxes</li>
              <li>Registration forms</li>
              <li>Contact or lead forms</li>
              <li>Booking forms</li>
              <li>WhatsApp conversations</li>
              <li>QR codes</li>
              <li>Artist registrations</li>
              <li>Membership registrations</li>
              <li>Other clear consent mechanisms</li>
            </ul>
          </Accordion>

          <Accordion number="05" title="Opting Out of WhatsApp Messages">
            <p>
              Users may stop receiving promotional WhatsApp communications at
              any time.
            </p>

            <div className="privacy-stop">
              <small>OPT-OUT</small>

              <h4>
                Reply
                <strong> STOP </strong>
                or
                <strong> UNSUBSCRIBE</strong>
              </h4>

              <p>
                You may also contact Ink Convention and ask us to stop
                promotional messages.
              </p>
            </div>

            <p>
              We may still send necessary transactional, account, security,
              support or legally required communications.
            </p>
          </Accordion>

          <Accordion number="06" title="Customer Enquiries & Leads">
            <p>
              Ink Convention may help customers connect with tattoo artists,
              studios, exhibitors, sponsors or businesses listed on our
              platform.
            </p>

            <p>
              When submitting an enquiry, users may provide their name, phone
              number, email address, city, preferred artist, tattoo
              requirements, booking preferences and message.
            </p>

            <p>
              Relevant information may be shared with the artist, studio or
              business selected by the user for the purpose of responding to the
              enquiry.
            </p>

            <p>
              Where a masked lead or masked contact feature is available, direct
              contact information may initially be limited or hidden.
            </p>
          </Accordion>

          <Accordion number="07" title="Meta Platform Data">
            <p>
              Information received through Meta APIs, WhatsApp Business APIs,
              Meta Business services, webhooks or similar Meta Platform features
              may be treated as Meta Platform Data.
            </p>

            <ul>
              <li>
                Uses Meta Platform Data only for disclosed and legitimate
                purposes
              </li>

              <li>Does not sell Meta Platform Data</li>

              <li>
                Does not rent Meta Platform Data for third-party independent
                marketing
              </li>

              <li>
                Limits disclosure to service providers or parties necessary to
                provide requested services
              </li>

              <li>
                Deletes information received in error where reasonably
                practicable
              </li>
            </ul>
          </Accordion>

          <Accordion number="08" title="Service Providers">
            <p>
              We may use trusted service providers to help operate Ink
              Convention.
            </p>

            <ul>
              <li>Meta Platforms and WhatsApp</li>

              <li>Hosting and cloud providers</li>

              <li>Database providers</li>

              <li>Payment gateways</li>

              <li>OTP providers</li>

              <li>Email and SMS services</li>

              <li>CRM providers</li>

              <li>Communication automation services</li>

              <li>Analytics services</li>

              <li>Security and fraud-prevention services</li>
            </ul>

            <p>
              Service providers may process information only as reasonably
              necessary to provide their services to Ink Convention.
            </p>
          </Accordion>

          <Accordion number="09" title="Payments">
            <p>
              Payments for memberships, stall bookings, registrations or other
              services may be processed by authorised payment providers.
            </p>

            <ul>
              <li>Transaction ID</li>
              <li>Payment amount</li>
              <li>Payment date</li>
              <li>Payment status</li>
              <li>Payment method</li>

              <li>Order or booking reference</li>
            </ul>

            <p>
              Ink Convention does not ask users to provide UPI PINs, banking
              passwords, card PINs or similar private banking authentication
              credentials.
            </p>
          </Accordion>

          <Accordion number="10" title="Artist Profiles & Public Information">
            <p>
              Tattoo artists may voluntarily create profiles containing
              information such as artist name, studio name, profile photo,
              portfolio, tattoo styles, city, social media profiles and
              professional descriptions.
            </p>

            <p>
              Information intentionally submitted for a public profile may be
              visible to visitors of InkConvention.com.
            </p>
          </Accordion>

          <Accordion number="11" title="Automatically Collected Information">
            <p>
              When you visit InkConvention.com, we may automatically receive
              technical information such as:
            </p>

            <ul>
              <li>IP address</li>
              <li>Device and browser type</li>
              <li>Operating system</li>
              <li>Pages visited</li>
              <li>Referring website</li>
              <li>Date and time</li>
              <li>Session information</li>
              <li>Diagnostic information</li>

              <li>Approximate location derived from technical data</li>
            </ul>
          </Accordion>

          <Accordion number="12" title="Cookies & Analytics">
            <p>
              InkConvention.com may use cookies and similar technologies to
              maintain sessions, remember preferences, understand traffic,
              improve the website, detect abuse and measure campaign
              performance.
            </p>

            <p>
              Where legally required, consent will be requested before
              non-essential cookies are used.
            </p>
          </Accordion>

          <Accordion number="13" title="How We Share Information">
            <p>Information may be shared with:</p>

            <ul>
              <li>Meta and WhatsApp</li>

              <li>Technology and service providers</li>

              <li>Payment processors</li>
              <li>Messaging providers</li>

              <li>Artists or businesses selected by users</li>

              <li>Authorities where legally required</li>
            </ul>

            <div className="privacy-important">
              <small>IMPORTANT</small>

              <p>
                Ink Convention does not sell or rent personal information to
                third parties for their independent marketing purposes.
              </p>
            </div>
          </Accordion>

          <Accordion number="14" title="Data Retention">
            <p>
              We retain personal information only for as long as reasonably
              necessary to provide services, complete transactions, respond to
              enquiries, maintain legally required records, prevent fraud and
              resolve disputes.
            </p>

            <p>
              Meta Platform Data and WhatsApp-related information may be deleted
              or de-identified when no longer required for the purpose for which
              it was collected, subject to applicable legal requirements.
            </p>
          </Accordion>

          <div id="rights">
            <Accordion number="15" title="User Data Deletion">
              <p>
                Users may request deletion of personal information held by Ink
                Convention, including eligible information received through Meta
                or WhatsApp.
              </p>

              <Link to="/data-deletion" className="privacy-delete-link">
                <div>
                  <small>USER DATA REQUEST</small>

                  <strong>Open Data Deletion Instructions</strong>
                </div>

                <span>↗</span>
              </Link>

              <p>
                Some information may need to be retained for legal compliance,
                financial records, fraud prevention, security or dispute
                resolution.
              </p>
            </Accordion>
          </div>

          <Accordion number="16" title="Your Rights & Choices">
            <p>
              Subject to applicable law, users may request access, modification,
              correction or deletion of eligible personal information.
            </p>

            <ul>
              <li>Request access to personal data</li>

              <li>Correct inaccurate information</li>

              <li>Update incomplete information</li>

              <li>Request deletion</li>

              <li>Withdraw consent where applicable</li>

              <li>Change communication preferences</li>

              <li>Stop promotional communications</li>
            </ul>
          </Accordion>

          <Accordion number="17" title="Data Security">
            <p>
              Ink Convention uses reasonable administrative, organisational and
              technical safeguards designed to protect information.
            </p>

            <ul>
              <li>HTTPS encryption</li>

              <li>Restricted administrative access</li>

              <li>Password hashing</li>

              <li>Authentication controls</li>

              <li>Database access controls</li>

              <li>Secure hosting</li>

              <li>Monitoring and backup measures</li>
            </ul>

            <p>No online system can be guaranteed to be completely secure.</p>
          </Accordion>

          <Accordion number="18" title="Children">
            <p>
              Where applicable law requires parental or guardian consent for a
              child's personal information, appropriate consent must be obtained
              before processing such information.
            </p>
          </Accordion>

          <Accordion number="19" title="International Processing">
            <p>
              Some technology and communication providers, including Meta and
              WhatsApp, may use infrastructure located outside India.
            </p>

            <p>
              Where applicable, information will be handled in accordance with
              relevant legal requirements.
            </p>
          </Accordion>

          <Accordion number="20" title="Third-Party Services">
            <p>
              InkConvention.com may contain links or integrations involving
              WhatsApp, Facebook, Instagram, payment providers, sponsors,
              artists and other third-party websites.
            </p>

            <p>
              Independent third-party services are governed by their own terms
              and privacy policies.
            </p>
          </Accordion>

          <Accordion number="21" title="Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy when our services, Meta or
              WhatsApp integrations, legal requirements or service providers
              change.
            </p>

            <p>
              The latest version will remain available on InkConvention.com, and
              the Last Updated date will be changed when appropriate.
            </p>
          </Accordion>
        </div>
      </section>

      {/* =========================================
          CONTACT
      ========================================== */}

      <section className="privacy-contact" id="contact">
        <div className="privacy-contact-title">
          <span>03 / CONTACT</span>

          <h2>
            NEED HELP?
            <br />
            <strong>TALK TO US.</strong>
          </h2>

          <p>
            For privacy, WhatsApp or personal-data questions, contact the Ink
            Convention team.
          </p>
        </div>

        <div className="privacy-contact-links">
          <a href="https://inkconvention.com/" target="_blank" rel="noreferrer">
            <small>WEBSITE</small>

            <strong>inkconvention.com</strong>

            <span>↗</span>
          </a>

          <a href="mailto:ink.convention.expo@gmail.com">
            <small>EMAIL</small>

            <strong>ink.convention.expo@gmail.com</strong>

            <span>↗</span>
          </a>

          <a href="tel:+917039235169">
            <small>PHONE</small>

            <strong>+91 70392 35169</strong>

            <span>↗</span>
          </a>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================== */}

      <footer className="privacy-footer">
        <Link to="/" className="privacy-footer-logo">
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

export default PrivacyPolicy;
