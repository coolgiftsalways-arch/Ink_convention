// =========================================================
// INTERAKT CAMPAIGN SERVICE
// =========================================================


function getConfig() {
  return {
    apiKey:
      process.env.INTERAKT_API_KEY || "",

    apiUrl:
      process.env.INTERAKT_API_URL ||
      "https://api.interakt.ai/v1/public/message/",

    templateName:
      process.env.INTERAKT_CAMPAIGN_TEMPLATE ||
      "inkconvention_brochure_1",

    templateLanguage:
      process.env.INTERAKT_TEMPLATE_LANGUAGE ||
      "en",

    brochureUrl:
      process.env.INTERAKT_BROCHURE_1_URL ||
      "",
  };
}


// =========================================================
// NORMALIZE INDIAN PHONE
// =========================================================

function normalizeIndianPhone(phone) {
  let number = String(phone || "")
    .trim()
    .replace(/\D/g, "");

  if (number.startsWith("00")) {
    number = number.substring(2);
  }

  if (
    number.length === 12 &&
    number.startsWith("91")
  ) {
    number = number.substring(2);
  }

  if (
    number.length === 11 &&
    number.startsWith("0")
  ) {
    number = number.substring(1);
  }

  if (number.length !== 10) {
    throw new Error(
      `Invalid Indian WhatsApp number: ${phone}`
    );
  }

  return {
    countryCode: "+91",
    phoneNumber: number,
  };
}


// =========================================================
// SEND BROCHURE 1 TEMPLATE
// =========================================================

async function sendBrochure1WhatsApp({
  phone,
  artistName,
  campaignId = "",
  callbackData = "",
}) {
  const config = getConfig();

  if (!config.apiKey) {
    throw new Error(
      "INTERAKT_API_KEY is missing"
    );
  }

  if (!config.brochureUrl) {
    throw new Error(
      "INTERAKT_BROCHURE_1_URL is missing"
    );
  }

  const {
    countryCode,
    phoneNumber,
  } = normalizeIndianPhone(phone);


  const payload = {
    countryCode,

    phoneNumber,

    type: "Template",

    callbackData:
      callbackData ||
      `brochure1:${Date.now()}`,

    template: {
      name:
        config.templateName,

      languageCode:
        config.templateLanguage,

      // IMAGE HEADER
      headerValues: [
        config.brochureUrl,
      ],

      // {{1}} = Artist Name
      bodyValues: [
        artistName || "Artist",
      ],
    },
  };


  // Optional:
  // lets Interakt group messages
  // under an API campaign.

  if (campaignId) {
    payload.campaignId =
      campaignId;
  }


  console.log(
    "📤 Sending Interakt campaign →",
    `${countryCode}${phoneNumber}`
  );

  console.log(
    "Artist:",
    artistName
  );


  const response =
    await fetch(
      config.apiUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Basic ${config.apiKey}`,
        },

        body:
          JSON.stringify(payload),
      }
    );


  const data =
    await response
      .json()
      .catch(() => ({}));


  console.log(
    "INTERAKT STATUS:",
    response.status
  );

  console.log(
    "INTERAKT RESPONSE:",
    JSON.stringify(
      data,
      null,
      2
    )
  );


  if (
    !response.ok ||
    data?.result === false
  ) {
    const error =
      new Error(
        data?.message ||
        `Interakt HTTP ${response.status}`
      );

    error.status =
      response.status;

    error.response =
      data;

    throw error;
  }


  return {
    success: true,

    messageId:
      data?.id || "",

    response:
      data,
  };
}


module.exports = {
  normalizeIndianPhone,
  sendBrochure1WhatsApp,
};