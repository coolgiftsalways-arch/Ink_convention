const nodemailer = require("nodemailer");

/* =========================================================
   EMAIL CONFIGURATION
========================================================= */

const transporter = nodemailer.createTransport({
  host:
    process.env.EMAIL_HOST ||
    "smtp.hostinger.com",

  port:
    Number(
      process.env.EMAIL_PORT,
    ) || 465,

  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================================================
   VERIFY EMAIL CONNECTION
========================================================= */

async function verifyEmailConnection() {
  try {
    await transporter.verify();

    console.log(
      "✅ Email server connected successfully",
    );
  } catch (error) {
    console.error(
      "❌ Email server connection failed:",
      error.message,
    );
  }
}

/* =========================================================
   SEND ARTIST BOOKING EMAIL
========================================================= */

async function sendArtistBookingEmail({
  to,
  artistName,
  artistId,
  bookingId,
}) {
  if (!to) {
    throw new Error(
      "Artist email address is required.",
    );
  }

  const frontendUrl = String(
    process.env.FRONTEND_URL ||
      "http://localhost:5173",
  ).replace(/\/$/, "");

  /*
    Change /enter below if your artist
    profile page uses another route.
  */

  const profileUrl =
    `${frontendUrl}/enter?profileId=${encodeURIComponent(
      artistId,
    )}&bookingId=${encodeURIComponent(
      bookingId,
    )}`;

  const safeArtistName =
    artistName || "Artist";

  /* =====================================================
     EMAIL
  ===================================================== */

  const mailOptions = {
    from:
      `"Ink Convention" <${process.env.EMAIL_USER}>`,

    to,

    subject:
      "New Booking Request | Ink Convention",

    text: `
Hi ${safeArtistName},

You have received a new booking request through Ink Convention.

Someone is interested in booking you for a tattoo.

Please visit Ink Convention and update/verify your artist profile to view booking details.

Verified profiles can access customer information and additional booking details.

View your profile:
${profileUrl}

Ink Convention
    `.trim(),

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    New Booking Request
  </title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #050505;
    font-family: Arial, Helvetica, sans-serif;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #050505;
      padding: 30px 15px;
    "
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #0d0d10;
            border: 1px solid #29292f;
            border-radius: 18px;
            overflow: hidden;
          "
        >

          <!-- TOP -->
          <tr>
            <td
              style="
                padding: 35px 35px 20px;
                text-align: center;
              "
            >

              <div
                style="
                  font-size: 13px;
                  letter-spacing: 3px;
                  color: #a855f7;
                  font-weight: bold;
                  margin-bottom: 15px;
                "
              >
                INK CONVENTION
              </div>

              <h1
                style="
                  margin: 0;
                  color: #ffffff;
                  font-size: 30px;
                  line-height: 1.3;
                "
              >
                New Booking Request
              </h1>

            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td
              style="
                padding: 10px 35px 35px;
              "
            >

              <p
                style="
                  color: #ffffff;
                  font-size: 17px;
                  line-height: 1.7;
                "
              >
                Hi
                <strong>
                  ${safeArtistName}
                </strong>,
              </p>

              <p
                style="
                  color: #b7b7c0;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >
                Someone is interested in
                booking you for a tattoo
                through
                <strong
                  style="
                    color: #ffffff;
                  "
                >
                  Ink Convention
                </strong>.
              </p>

              <p
                style="
                  color: #b7b7c0;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >
                Please visit your artist
                profile and make sure your
                information is updated.
              </p>

              <!-- NOTICE -->
              <div
                style="
                  background: #17131d;
                  border: 1px solid #503060;
                  border-radius: 12px;
                  padding: 18px;
                  margin: 25px 0;
                "
              >

                <div
                  style="
                    color: #c084fc;
                    font-weight: bold;
                    font-size: 15px;
                    margin-bottom: 7px;
                  "
                >
                  Verified Artist Access
                </div>

                <div
                  style="
                    color: #b7b7c0;
                    font-size: 14px;
                    line-height: 1.6;
                  "
                >
                  Verified profiles can
                  access customer information
                  and additional booking
                  details from their artist
                  account.
                </div>

              </div>

              <!-- BUTTON -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                width="100%"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 10px 0 20px;
                    "
                  >

                    <a
                      href="${profileUrl}"
                      style="
                        background: #9d00ff;
                        color: #ffffff;
                        display: inline-block;
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: bold;
                        padding: 16px 28px;
                        border-radius: 10px;
                        letter-spacing: 0.5px;
                      "
                    >
                      VIEW / UPDATE PROFILE
                    </a>

                  </td>
                </tr>
              </table>

              <p
                style="
                  color: #656570;
                  font-size: 12px;
                  line-height: 1.6;
                  text-align: center;
                  margin-top: 20px;
                "
              >
                Customer personal information
                is not included in this email
                for privacy and security.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              style="
                border-top: 1px solid #24242a;
                padding: 20px 35px;
                text-align: center;
              "
            >

              <p
                style="
                  margin: 0;
                  color: #55555f;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()}
                Ink Convention
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  };

  const info =
    await transporter.sendMail(
      mailOptions,
    );

  console.log(
    "📧 Artist email Message ID:",
    info.messageId,
  );

  return info;
}

module.exports = {
  transporter,
  verifyEmailConnection,
  sendArtistBookingEmail,
};