// backend/services/msg91OtpService.js

async function verifyMsg91AccessToken(accessToken) {
  const cleanAccessToken = String(accessToken || "").trim();

  if (!cleanAccessToken) {
    throw new Error("MSG91 access token is required.");
  }

  const authkey = String(process.env.MSG91_AUTH_KEY || "").trim();

  if (!authkey) {
    throw new Error("MSG91_AUTH_KEY is missing in backend .env");
  }

  const response = await fetch(
    "https://control.msg91.com/api/v5/widget/verifyAccessToken",

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",
      },

      /*
       * IMPORTANT:
       *
       * MSG91's own Server Side
       * Integration example sends
       * BOTH values in the JSON body.
       */

      body: JSON.stringify({
        authkey,

        "access-token": cleanAccessToken,
      }),
    },
  );

  const rawText = await response.text();

  let data = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    console.error("❌ MSG91 RAW RESPONSE:", rawText);

    throw new Error("MSG91 returned an invalid verification response.");
  }

  console.log("📲 MSG91 STATUS:", response.status);

  console.log("📲 MSG91 RESULT:", data);

  const type = String(data?.type || "")
    .trim()
    .toLowerCase();

  if (!response.ok || type === "error" || data?.success === false) {
    throw new Error(
      data?.message || data?.error || "MSG91 access token verification failed.",
    );
  }

  return data;
}

module.exports = {
  verifyMsg91AccessToken,
};
