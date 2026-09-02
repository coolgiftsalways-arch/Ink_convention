/* =========================================================
   MSG91 WHATSAPP SERVICE
========================================================= */

const MSG91_WHATSAPP_URL =
  "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

/* =========================================================
   CLEAN / NORMALIZE PHONE
========================================================= */

function normalizePhone(phone) {
  let number = String(phone || "")
    .replace(/\D/g, "")
    .trim();

  if (!number) {
    return "";
  }

  /*
    If Indian 10 digit number:
    9876543210
         ↓
    919876543210
  */

  if (number.length === 10) {
    number = `91${number}`;
  }

  return number;
}

/* =========================================================
   BUILD TEMPLATE BODY VARIABLES

   ["Ahmed", "https://..."]

   becomes:

   {
     body_1: {
       type: "text",
       value: "Ahmed"
     },

     body_2: {
       type: "text",
       value: "https://..."
     }
   }
========================================================= */

function buildBodyComponents(values = []) {
  const components = {};

  values.forEach((value, index) => {
    components[`body_${index + 1}`] = {
      type: "text",
      value: String(value ?? ""),
    };
  });

  return components;
}

/* =========================================================
   SEND SINGLE TEMPLATE MESSAGE
========================================================= */

async function sendWhatsAppTemplate({
  phone,
  templateName,
  namespace,
  language = "en",
  variables = [],
  components = null,
  crqid = "",
}) {
  if (!process.env.MSG91_AUTH_KEY) {
    throw new Error(
      "MSG91_AUTH_KEY is missing from .env",
    );
  }

  if (!process.env.MSG91_WHATSAPP_NUMBER) {
    throw new Error(
      "MSG91_WHATSAPP_NUMBER is missing from .env",
    );
  }

  if (!templateName) {
    throw new Error(
      "WhatsApp template name is required.",
    );
  }

  const recipient = normalizePhone(phone);

  if (!recipient) {
    throw new Error(
      "Valid WhatsApp phone number is required.",
    );
  }

  const finalComponents =
    components ||
    buildBodyComponents(variables);

  const template = {
    name: templateName,

    language: {
      code: language,
      policy: "deterministic",
    },

    to_and_components: [
      {
        to: [recipient],
        components: finalComponents,
      },
    ],
  };

  /*
    MSG91 template API examples contain namespace.

    We add it only when configured.
  */

  if (namespace) {
    template.namespace = namespace;
  }

  const payload = {
    integrated_number:
      process.env.MSG91_WHATSAPP_NUMBER,

    content_type: "template",

    payload: {
      messaging_product: "whatsapp",

      type: "template",

      template,
    },
  };

  /*
    CRQID lets us match the MSG91 webhook
    to our MongoDB WhatsAppMessage.
  */

  if (crqid) {
    payload.CRQID = String(crqid);
  }

  console.log(
    `📱 Sending WhatsApp to ${recipient}`,
  );

  const response = await fetch(
    MSG91_WHATSAPP_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        authkey:
          process.env.MSG91_AUTH_KEY,
      },

      body: JSON.stringify(payload),
    },
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      message:
        await response.text(),
    };
  }

  if (!response.ok) {
    console.error(
      "❌ MSG91 WhatsApp API error:",
      data,
    );

    throw new Error(
      data?.message ||
        `MSG91 WhatsApp error ${response.status}`,
    );
  }

  console.log(
    "✅ MSG91 WhatsApp API response:",
    data,
  );

  return {
    success: true,

    phone: recipient,

    response: data,
  };
}

/* =========================================================
   SEND MULTIPLE RECIPIENTS

   Useful for marketing batches.
========================================================= */

async function sendWhatsAppBulk({
  recipients = [],
  templateName,
  namespace,
  language = "en",
  crqid = "",
}) {
  if (
    !Array.isArray(recipients) ||
    recipients.length === 0
  ) {
    throw new Error(
      "Recipients are required.",
    );
  }

  if (!templateName) {
    throw new Error(
      "Template name is required.",
    );
  }

  const toAndComponents =
    recipients
      .map((recipient) => {
        const phone =
          normalizePhone(
            recipient.phone,
          );

        if (!phone) {
          return null;
        }

        return {
          to: [phone],

          components:
            recipient.components ||
            buildBodyComponents(
              recipient.variables || [],
            ),

          /*
            Individual tracking value.
          */

          ...(recipient.crqid
            ? {
                CRQID:
                  String(
                    recipient.crqid,
                  ),
              }
            : {}),
        };
      })
      .filter(Boolean);

  if (
    toAndComponents.length === 0
  ) {
    throw new Error(
      "No valid recipients found.",
    );
  }

  const template = {
    name: templateName,

    language: {
      code: language,
      policy: "deterministic",
    },

    to_and_components:
      toAndComponents,
  };

  if (namespace) {
    template.namespace = namespace;
  }

  const payload = {
    integrated_number:
      process.env.MSG91_WHATSAPP_NUMBER,

    content_type: "template",

    payload: {
      messaging_product: "whatsapp",

      type: "template",

      template,
    },
  };

  if (crqid) {
    payload.CRQID = String(crqid);
  }

  const response = await fetch(
    MSG91_WHATSAPP_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        authkey:
          process.env.MSG91_AUTH_KEY,
      },

      body: JSON.stringify(payload),
    },
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      message:
        await response.text(),
    };
  }

  if (!response.ok) {
    console.error(
      "❌ MSG91 bulk WhatsApp error:",
      data,
    );

    throw new Error(
      data?.message ||
        "Unable to send WhatsApp batch.",
    );
  }

  return {
    success: true,

    count: toAndComponents.length,

    response: data,
  };
}

/* =========================================================
   ARTIST BOOKING MESSAGE
========================================================= */

async function sendArtistBookingWhatsApp({
  phone,
  artistName,
  artistId,
  bookingId,
  crqid,
}) {
  const frontendUrl = String(
    process.env.FRONTEND_URL ||
      "http://localhost:5173",
  ).replace(/\/$/, "");

  const profileUrl =
    `${frontendUrl}/enter?profileId=${encodeURIComponent(
      artistId,
    )}&bookingId=${encodeURIComponent(
      bookingId,
    )}`;

  return sendWhatsAppTemplate({
    phone,

    templateName:
      process.env
        .MSG91_BOOKING_TEMPLATE,

    namespace:
      process.env
        .MSG91_WHATSAPP_NAMESPACE,

    language:
      process.env
        .MSG91_BOOKING_LANGUAGE ||
      "en",

    variables: [
      artistName || "Artist",
      profileUrl,
    ],

    crqid,
  });
}

/* =========================================================
   MARKETING MESSAGE
========================================================= */

async function sendMarketingWhatsApp({
  phone,
  customerName,
  crqid,
}) {
  const websiteUrl =
    process.env.FRONTEND_URL;

  return sendWhatsAppTemplate({
    phone,

    templateName:
      process.env
        .MSG91_MARKETING_TEMPLATE,

    namespace:
      process.env
        .MSG91_WHATSAPP_NAMESPACE,

    language:
      process.env
        .MSG91_MARKETING_LANGUAGE ||
      "en",

    variables: [
      customerName || "there",
      websiteUrl,
    ],

    crqid,
  });
}

module.exports = {
  normalizePhone,

  buildBodyComponents,

  sendWhatsAppTemplate,

  sendWhatsAppBulk,

  sendArtistBookingWhatsApp,

  sendMarketingWhatsApp,
};