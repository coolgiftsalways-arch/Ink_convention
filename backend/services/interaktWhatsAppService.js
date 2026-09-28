// backend/services/interaktWhatsAppService.js

/* =========================================================
   INTERAKT CONFIG
========================================================= */

const INTERAKT_API_URL =
  process.env.INTERAKT_API_URL ||
  "https://api.interakt.ai/v1/public/message/";

const INTERAKT_API_KEY =
  process.env.INTERAKT_API_KEY || "";

const INTERAKT_COUNTRY_CODE =
  process.env.INTERAKT_COUNTRY_CODE || "+91";

const INTERAKT_FREE_TEMPLATE =
  process.env.INTERAKT_FREE_TEMPLATE ||
  "inkconvention_free_booking";

const INTERAKT_PAID_TEMPLATE =
  process.env.INTERAKT_PAID_TEMPLATE ||
  "inkconvention_paid_booking";

const INTERAKT_TEMPLATE_LANGUAGE =
  process.env.INTERAKT_TEMPLATE_LANGUAGE || "en";

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  return String(value ?? "").trim();
}

/* =========================================================
   SANITIZE INTERAKT TEMPLATE VARIABLE

   Interakt / Meta does not allow:
   - Tabs
   - New lines
   - More than 2 consecutive spaces

   Example:

   Tiger tattoo
   Body placement: Forearm
   Budget: ₹5,000

   Becomes:

   Tiger tattoo | Body placement: Forearm | Budget: ₹5,000
========================================================= */

function sanitizeInteraktValue(value) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " | ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/(\|\s*){2,}/g, "| ")
    .trim()
    .replace(/^\|\s*/, "")
    .replace(/\s*\|$/, "");
}

/* =========================================================
   NORMALIZE INDIAN PHONE

   Accepted:
   9876543210
   09876543210
   +919876543210
   919876543210
========================================================= */

function normalizeIndianPhone(phone) {
  let digits =
    cleanText(phone).replace(/\D/g, "");

  /* +91 / 91 prefix */

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    digits = digits.slice(2);
  }

  /* 0 prefix */

  if (
    digits.length === 11 &&
    digits.startsWith("0")
  ) {
    digits = digits.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new Error(
      "Artist does not have a valid Indian WhatsApp number."
    );
  }

  return digits;
}

/* =========================================================
   MASK CUSTOMER PHONE FOR FREE ARTIST

   9876543210 -> ****3210
========================================================= */

function maskPhone(phone) {
  const digits =
    cleanText(phone).replace(/\D/g, "");

  if (digits.length < 4) {
    return "Hidden";
  }

  return `****${digits.slice(-4)}`;
}

/* =========================================================
   CUSTOMER FIRST NAME

   Ahmed Khan -> Ahmed
========================================================= */

function firstName(name) {
  const value = cleanText(name);

  if (!value) {
    return "Customer";
  }

  return (
    value.split(/\s+/)[0] ||
    "Customer"
  );
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return (
      cleanText(value) ||
      "Not specified"
    );
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }
  ).format(date);
}

/* =========================================================
   FORMAT TIME

   16:30 -> 4:30 PM
========================================================= */

function formatTime(value) {
  const time = cleanText(value);

  if (!time) {
    return "Not specified";
  }

  const match =
    time.match(
      /^(\d{1,2}):(\d{2})/
    );

  if (!match) {
    return time;
  }

  let hours =
    Number(match[1]);

  const minutes =
    match[2];

  if (
    Number.isNaN(hours)
  ) {
    return time;
  }

  const suffix =
    hours >= 12
      ? "PM"
      : "AM";

  hours %= 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${suffix}`;
}

/* =========================================================
   MASK PHONE FOR TERMINAL LOG

   Avoid exposing full artist number in terminal.
========================================================= */

function maskLogPhone(phone) {
  const digits =
    cleanText(phone).replace(/\D/g, "");

  if (digits.length < 4) {
    return "hidden";
  }

  return `******${digits.slice(-4)}`;
}

/* =========================================================
   VALIDATE INTERAKT CONFIG
========================================================= */

function validateInteraktConfig() {
  if (!INTERAKT_API_KEY) {
    throw new Error(
      "INTERAKT_API_KEY is missing from backend .env"
    );
  }

  if (!INTERAKT_API_URL) {
    throw new Error(
      "INTERAKT_API_URL is missing."
    );
  }

  if (!INTERAKT_FREE_TEMPLATE) {
    throw new Error(
      "INTERAKT_FREE_TEMPLATE is missing."
    );
  }

  if (!INTERAKT_PAID_TEMPLATE) {
    throw new Error(
      "INTERAKT_PAID_TEMPLATE is missing."
    );
  }
}

/* =========================================================
   SEND INTERAKT TEMPLATE
========================================================= */

async function sendInteraktTemplate({
  phone,
  templateName,
  bodyValues,
  bookingId,
}) {
  validateInteraktConfig();

  if (!templateName) {
    throw new Error(
      "Interakt template name is missing."
    );
  }

  if (!Array.isArray(bodyValues)) {
    throw new Error(
      "Interakt bodyValues must be an array."
    );
  }

  const phoneNumber =
    normalizeIndianPhone(phone);

  /* =====================================================
     IMPORTANT FIX

     Every template variable is sanitized before sending.
  ===================================================== */

  const cleanedBodyValues =
    bodyValues.map((value) => {
      const cleaned =
        sanitizeInteraktValue(value);

      return (
        cleaned ||
        "Not specified"
      );
    });

  const payload = {
    countryCode:
      INTERAKT_COUNTRY_CODE,

    phoneNumber,

    callbackData:
      bookingId
        ? `artist-booking:${bookingId}`
        : `artist-booking:${Date.now()}`,

    type: "Template",

    template: {
      name:
        templateName,

      languageCode:
        INTERAKT_TEMPLATE_LANGUAGE,

      bodyValues:
        cleanedBodyValues,
    },
  };

  /* =====================================================
     DEBUG LOG

     Does NOT expose:
     - API key
     - Full artist number
     - Customer private information
  ===================================================== */

  console.log(
    "\n============================================"
  );

  console.log(
    "📤 INTERAKT WHATSAPP REQUEST"
  );

  console.log(
    "URL:",
    INTERAKT_API_URL
  );

  console.log(
    "Template:",
    templateName
  );

  console.log(
    "Language:",
    INTERAKT_TEMPLATE_LANGUAGE
  );

  console.log(
    "Recipient:",
    `${INTERAKT_COUNTRY_CODE}${maskLogPhone(
      phoneNumber
    )}`
  );

  console.log(
    "Variables:",
    cleanedBodyValues.length
  );

  console.log(
    "Booking ID:",
    bookingId || "N/A"
  );

  console.log(
    "============================================\n"
  );

  /* =====================================================
     REQUEST TIMEOUT
  ===================================================== */

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      20000
    );

  let response;

  try {
    response =
      await fetch(
        INTERAKT_API_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Basic ${INTERAKT_API_KEY}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),

          signal:
            controller.signal,
        }
      );
  } catch (error) {
    clearTimeout(timeout);

    if (
      error?.name ===
      "AbortError"
    ) {
      throw new Error(
        "Interakt API request timed out after 20 seconds."
      );
    }

    throw new Error(
      `Unable to connect to Interakt API: ${
        error?.message ||
        "Unknown network error"
      }`
    );
  }

  clearTimeout(timeout);

  /* =====================================================
     READ RESPONSE SAFELY
  ===================================================== */

  const rawResponse =
    await response.text();

  let data = {};

  try {
    data =
      rawResponse
        ? JSON.parse(
            rawResponse
          )
        : {};
  } catch {
    data = {
      rawResponse,
    };
  }

  /* =====================================================
     RESPONSE LOG
  ===================================================== */

  console.log(
    "\n============================================"
  );

  console.log(
    "📥 INTERAKT RESPONSE"
  );

  console.log(
    "HTTP Status:",
    response.status
  );

  console.log(
    "HTTP OK:",
    response.ok
  );

  console.log(
    "Result:",
    data?.result
  );

  console.log(
    "Message:",
    data?.message || ""
  );

  console.log(
    "Message ID:",
    data?.id || ""
  );

  if (!response.ok) {
    console.log(
      "Raw response:",
      rawResponse
    );
  }

  console.log(
    "============================================\n"
  );

  /* =====================================================
     ERROR HANDLING
  ===================================================== */

  if (
    !response.ok ||
    data?.result === false
  ) {
    const providerMessage =
      cleanText(
        data?.message ||
          data?.error ||
          data?.detail ||
          data?.rawResponse
      );

    const error =
      new Error(
        providerMessage ||
        `Interakt API failed with HTTP ${response.status}`
      );

    error.status =
      response.status;

    error.interaktResponse =
      data;

    throw error;
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  console.log(
    "✅ Interakt accepted WhatsApp message:",
    {
      template:
        templateName,

      messageId:
        cleanText(
          data?.id
        ),
    }
  );

  return {
    success: true,

    messageId:
      cleanText(
        data?.id
      ),

    response:
      data,
  };
}

/* =========================================================
   FREE ARTIST BOOKING

   TEMPLATE:
   inkconvention_free_booking

   {{1}} Artist Name
   {{2}} Customer First Name
   {{3}} Masked Phone
   {{4}} Tattoo Style
   {{5}} Tattoo Idea
   {{6}} Preferred Date
   {{7}} Preferred Time
========================================================= */

async function sendFreeArtistBooking({
  artistPhone,
  artistName,

  customerName,
  customerPhone,

  tattooStyle,
  tattooIdea,

  preferredDate,
  preferredTime,

  bookingId,
}) {
  const bodyValues = [
    /* {{1}} ARTIST */

    artistName ||
      "Artist",

    /* {{2}} CUSTOMER FIRST NAME */

    firstName(
      customerName
    ),

    /* {{3}} MASKED PHONE */

    maskPhone(
      customerPhone
    ),

    /* {{4}} TATTOO STYLE */

    tattooStyle ||
      "Not specified",

    /* {{5}} TATTOO IDEA */

    tattooIdea ||
      "Not specified",

    /* {{6}} DATE */

    formatDate(
      preferredDate
    ),

    /* {{7}} TIME */

    formatTime(
      preferredTime
    ),
  ];

  console.log(
    "🆓 Preparing FREE artist WhatsApp:",
    {
      artist:
        artistName ||
        "Artist",

      template:
        INTERAKT_FREE_TEMPLATE,

      variables:
        bodyValues.length,

      bookingId:
        bookingId ||
        "N/A",
    }
  );

  return sendInteraktTemplate({
    phone:
      artistPhone,

    templateName:
      INTERAKT_FREE_TEMPLATE,

    bookingId,

    bodyValues,
  });
}

/* =========================================================
   PAID ARTIST BOOKING

   TEMPLATE:
   inkconvention_paid_booking

   {{1}} Artist Name
   {{2}} Customer Full Name
   {{3}} Customer Phone
   {{4}} Customer Email
   {{5}} Tattoo Style
   {{6}} Tattoo Idea
   {{7}} Preferred Date
   {{8}} Preferred Time
========================================================= */

async function sendPaidArtistBooking({
  artistPhone,
  artistName,

  customerName,
  customerPhone,
  customerEmail,

  tattooStyle,
  tattooIdea,

  preferredDate,
  preferredTime,

  bookingId,
}) {
  const bodyValues = [
    /* {{1}} ARTIST */

    artistName ||
      "Artist",

    /* {{2}} CUSTOMER */

    customerName ||
      "Customer",

    /* {{3}} PHONE */

    customerPhone ||
      "Not specified",

    /* {{4}} EMAIL */

    customerEmail ||
      "Not specified",

    /* {{5}} STYLE */

    tattooStyle ||
      "Not specified",

    /* {{6}} IDEA */

    tattooIdea ||
      "Not specified",

    /* {{7}} DATE */

    formatDate(
      preferredDate
    ),

    /* {{8}} TIME */

    formatTime(
      preferredTime
    ),
  ];

  console.log(
    "💎 Preparing PAID artist WhatsApp:",
    {
      artist:
        artistName ||
        "Artist",

      template:
        INTERAKT_PAID_TEMPLATE,

      variables:
        bodyValues.length,

      bookingId:
        bookingId ||
        "N/A",
    }
  );

  return sendInteraktTemplate({
    phone:
      artistPhone,

    templateName:
      INTERAKT_PAID_TEMPLATE,

    bookingId,

    bodyValues,
  });
}

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  sendInteraktTemplate,

  sendFreeArtistBooking,

  sendPaidArtistBooking,

  normalizeIndianPhone,

  maskPhone,

  firstName,

  formatDate,

  formatTime,

  sanitizeInteraktValue,
};