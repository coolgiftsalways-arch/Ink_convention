const nodemailer = require("nodemailer");

function getTransporter() {
  const emailUser = String(process.env.EMAIL_USER || "").trim();
  const emailPassword = String(process.env.EMAIL_PASSWORD || "").trim();

  if (!emailUser || !emailPassword) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASSWORD is missing in backend .env",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
}

async function sendPaymentSuccessEmail({
  to,
  customerName,
  plan,
  amount,
  paymentId,
  orderId,
  expiresAt,
}) {
  const cleanEmail = String(to || "").trim();

  if (!cleanEmail) {
    console.log("⚠️ Payment email skipped: customer email missing.");

    return {
      sent: false,
    };
  }

  const transporter = getTransporter();

  const planName =
    plan === "verified"
      ? "Gold / Verified"
      : "Silver / Pro";

  const formattedAmount = Number(amount || 0).toLocaleString("en-IN");

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const info = await transporter.sendMail({
    from: `"Ink Convention" <${process.env.EMAIL_USER}>`,

    to: cleanEmail,

    subject: `Payment Successful - ${planName} Membership`,

    text: `
Hello ${customerName || "Artist"},

Your payment was successful.

Membership: ${planName}
Amount Paid: ₹${formattedAmount}
Payment ID: ${paymentId}
Order ID: ${orderId}
${formattedExpiry ? `Membership valid until: ${formattedExpiry}` : ""}

Your ${planName} membership is now active on Ink Convention.

Thank you,
Ink Convention
    `.trim(),

    html: `
      <div style="font-family:Arial,sans-serif;background:#0b0b0f;padding:30px;color:#ffffff;">
        <div style="max-width:600px;margin:auto;background:#15151a;padding:30px;border-radius:16px;">

          <h1 style="color:#a855f7;margin-top:0;">
            Payment Successful
          </h1>

          <p>
            Hello <strong>${customerName || "Artist"}</strong>,
          </p>

          <p>
            Your payment has been successfully received and your
            <strong>${planName}</strong> membership is now active.
          </p>

          <div style="
            margin:25px 0;
            padding:20px;
            border:1px solid #333;
            border-radius:12px;
            background:#0d0d11;
          ">

            <p>
              <strong>Membership:</strong>
              ${planName}
            </p>

            <p>
              <strong>Amount Paid:</strong>
              ₹${formattedAmount}
            </p>

            <p>
              <strong>Payment ID:</strong>
              ${paymentId}
            </p>

            <p>
              <strong>Order ID:</strong>
              ${orderId}
            </p>

            ${
              formattedExpiry
                ? `
                  <p>
                    <strong>Valid Until:</strong>
                    ${formattedExpiry}
                  </p>
                `
                : ""
            }

          </div>

          <p>
            Thank you for joining Ink Convention.
          </p>

          <p style="color:#888;font-size:12px;">
            INK CONVENTION 2026
          </p>

        </div>
      </div>
    `,
  });

  console.log(
    "✅ Payment success email sent:",
    cleanEmail,
    info.messageId,
  );

  return {
    sent: true,
    messageId: info.messageId,
  };
}

module.exports = {
  sendPaymentSuccessEmail,
};