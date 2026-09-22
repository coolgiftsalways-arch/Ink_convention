/* =========================================================
   META WHATSAPP CLOUD API SERVICE

   This file contains all Meta-specific API code.
   Never put the access token in React / frontend code.
========================================================= */

function cleanEnv(value) {
  return String(value || "").trim();
}

function normalizeGraphVersion(value) {
  const version = cleanEnv(value);

  if (!version) {
    return "";
  }

  return version.startsWith("v") ? version : `v${version}`;
}

function normalizeWhatsAppPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  /*
    Ink Convention currently works with Indian artist numbers.
    Convert common local formats to international WhatsApp format.
  */
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  }

  return digits;
}

function getMetaWhatsAppConfig() {
  return {
    graphVersion: normalizeGraphVersion(process.env.META_GRAPH_API_VERSION),
    accessToken: cleanEnv(process.env.META_WHATSAPP_ACCESS_TOKEN),
    phoneNumberId: cleanEnv(process.env.META_WHATSAPP_PHONE_NUMBER_ID),
    wabaId: cleanEnv(process.env.META_WHATSAPP_WABA_ID),
    templateName: cleanEnv(process.env.META_WHATSAPP_TEMPLATE_NAME),
    templateLanguage:
      cleanEnv(process.env.META_WHATSAPP_TEMPLATE_LANGUAGE) || "en_US",
    displayNumber: cleanEnv(process.env.META_WHATSAPP_DISPLAY_NUMBER),
    publicSiteUrl:
      cleanEnv(process.env.PUBLIC_SITE_URL) || "https://inkconvention.com",
  };
}

function getMetaWhatsAppConfigurationStatus() {
  const config = getMetaWhatsAppConfig();

  const missing = [];

  if (!config.graphVersion) missing.push("META_GRAPH_API_VERSION");
  if (!config.accessToken) missing.push("META_WHATSAPP_ACCESS_TOKEN");
  if (!config.phoneNumberId) missing.push("META_WHATSAPP_PHONE_NUMBER_ID");
  if (!config.templateName) missing.push("META_WHATSAPP_TEMPLATE_NAME");

  return {
    configured: missing.length === 0,
    missing,
    templateName: config.templateName,
    templateLanguage: config.templateLanguage,
    displayNumber: config.displayNumber,
    wabaIdConfigured: Boolean(config.wabaId),
    graphVersion: config.graphVersion,
  };
}

function assertMetaWhatsAppConfigured() {
  const status = getMetaWhatsAppConfigurationStatus();

  if (!status.configured) {
    throw new Error(
      `Meta WhatsApp is not configured. Missing: ${status.missing.join(", ")}`,
    );
  }

  return getMetaWhatsAppConfig();
}

function createArtistProfileUrl(artistId) {
  const config = getMetaWhatsAppConfig();

  const root = config.publicSiteUrl.replace(/\/$/, "");

  return `${root}/artists?artist=${encodeURIComponent(String(artistId || ""))}`;
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/*
  REQUIRED META TEMPLATE BODY

  Your approved template must contain TWO body variables:

  Hi {{1}},
  your Ink Convention artist profile is available here:
  {{2}}

  {{1}} = artist name
  {{2}} = exact artist profile URL
*/
async function sendArtistProfileTemplate({
  to,
  artistName,
  artistId,
  profileUrl,
}) {
  const config = assertMetaWhatsAppConfigured();

  const normalizedPhone = normalizeWhatsAppPhone(to);

  if (!normalizedPhone) {
    throw new Error("Artist WhatsApp phone number is missing.");
  }

  const finalProfileUrl =
    profileUrl || createArtistProfileUrl(String(artistId || ""));

  const endpoint = `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedPhone,
        type: "template",
        template: {
          name: config.templateName,
          language: {
            code: config.templateLanguage,
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: String(artistName || "Tattoo Artist").slice(0, 1024),
                },
                {
                  type: "text",
                  text: finalProfileUrl,
                },
              ],
            },
          ],
        },
      }),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Meta WhatsApp API request timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const metaMessage =
      data?.error?.error_user_msg ||
      data?.error?.message ||
      `Meta WhatsApp HTTP ${response.status}`;

    const error = new Error(metaMessage);

    error.metaResponse = data;
    error.status = response.status;

    throw error;
  }

  return {
    normalizedPhone,
    profileUrl: finalProfileUrl,
    messageId: String(data?.messages?.[0]?.id || ""),
    waId: String(data?.contacts?.[0]?.wa_id || ""),
    raw: data,
  };
}

module.exports = {
  normalizeWhatsAppPhone,
  getMetaWhatsAppConfig,
  getMetaWhatsAppConfigurationStatus,
  createArtistProfileUrl,
  sendArtistProfileTemplate,
};
