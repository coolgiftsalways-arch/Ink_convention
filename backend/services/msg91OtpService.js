// backend/services/msg91OtpService.js

async function verifyMsg91AccessToken(accessToken) {
  if (!accessToken) {
    throw new Error(
      "MSG91 access token is required."
    );
  }

  const authkey =
    process.env.MSG91_AUTH_KEY;

  if (!authkey) {
    throw new Error(
      "MSG91_AUTH_KEY is missing in backend .env"
    );
  }

  const response = await fetch(
    "https://control.msg91.com/api/v5/widget/verifyAccessToken",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        authkey,
        "access-token": accessToken,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  console.log(
    "📲 MSG91 VERIFY RESPONSE:",
    data
  );

  if (
    !response.ok ||
    data?.type === "error" ||
    data?.success === false
  ) {
    console.error(
      "❌ MSG91 access token verification failed:",
      data
    );

    throw new Error(
      data?.message ||
        "MSG91 access token verification failed."
    );
  }

  return data;
}

module.exports = {
  verifyMsg91AccessToken,
};