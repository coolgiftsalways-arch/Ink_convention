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

  console.log("========================================");
  console.log("🔐 VERIFYING MSG91 ACCESS TOKEN");
  console.log("🔑 Authkey configured:", Boolean(authkey));
  console.log("🎟️ Access token configured:", Boolean(cleanAccessToken));
  console.log("========================================");

  const response = await fetch(
    "https://api.msg91.com/api/v5/widget/verifyAccessToken",
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        // IMPORTANT:
        // Keep the real MSG91 Authkey on backend only.
        authkey,
      },

      body: JSON.stringify({
        "access-token": cleanAccessToken,
      }),
    },
  );

  const rawText = await response.text();

  console.log("📲 MSG91 STATUS:", response.status);
  console.log("📲 MSG91 RAW RESPONSE:", rawText);

  let data = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    console.error("❌ MSG91 INVALID JSON RESPONSE:", rawText);

    throw new Error(
      `MSG91 returned an invalid verification response (${response.status}).`,
    );
  }

  console.log("📲 MSG91 RESULT:", data);

  const type = String(data?.type || "")
    .trim()
    .toLowerCase();

  const success =
    response.ok &&
    type !== "error" &&
    data?.success !== false;

  if (!success) {
    const message =
      data?.message ||
      data?.error ||
      data?.description ||
      `MSG91 access token verification failed (${response.status}).`;

    console.error("❌ MSG91 ACCESS TOKEN VERIFICATION FAILED:", message);

    throw new Error(message);
  }

  console.log("✅ MSG91 ACCESS TOKEN VERIFIED");

  return data;
}

module.exports = {
  verifyMsg91AccessToken,
};
