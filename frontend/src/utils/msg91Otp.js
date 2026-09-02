const SCRIPT_ID = "msg91-otp-provider";
const SCRIPT_URL = "https://verify.msg91.com/otp-provider.js";

let initPromise = null;
let currentReqId = "";

/* =========================================================
   ENV
========================================================= */

function getMsg91Config() {
  const widgetId = String(import.meta.env.VITE_MSG91_WIDGET_ID || "").trim();

  const tokenAuth = String(import.meta.env.VITE_MSG91_TOKEN || "").trim();

  if (!widgetId) {
    throw new Error("VITE_MSG91_WIDGET_ID is missing in frontend .env");
  }

  if (!tokenAuth) {
    throw new Error("VITE_MSG91_TOKEN is missing in frontend .env");
  }

  return {
    widgetId,
    tokenAuth,
  };
}

/* =========================================================
   ERROR
========================================================= */

function makeError(error, fallback) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  return new Error(
    error?.message || error?.error || error?.description || fallback,
  );
}

/* =========================================================
   JSON HELPER
========================================================= */

function parseMaybeJson(value) {
  if (typeof value !== "string") {
    return value;
  }

  const text = value.trim();

  if (!text) {
    return value;
  }

  if (
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]"))
  ) {
    try {
      return JSON.parse(text);
    } catch {
      return value;
    }
  }

  return value;
}

/* =========================================================
   FIND VALUE
========================================================= */

function findValueByKeys(value, wantedKeys, depth = 0) {
  if (value === null || value === undefined || depth > 8) {
    return "";
  }

  const parsed = parseMaybeJson(value);

  if (parsed !== value) {
    return findValueByKeys(parsed, wantedKeys, depth + 1);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findValueByKeys(item, wantedKeys, depth + 1);

      if (found) {
        return found;
      }
    }

    return "";
  }

  if (typeof value !== "object") {
    return "";
  }

  for (const [key, candidate] of Object.entries(value)) {
    if (
      wantedKeys.has(key) &&
      (typeof candidate === "string" || typeof candidate === "number")
    ) {
      const text = String(candidate).trim();

      if (text) {
        return text;
      }
    }
  }

  for (const nested of Object.values(value)) {
    const found = findValueByKeys(nested, wantedKeys, depth + 1);

    if (found) {
      return found;
    }
  }

  return "";
}

/* =========================================================
   FIND JWT
========================================================= */

function findJwt(value, depth = 0) {
  if (value === null || value === undefined || depth > 8) {
    return "";
  }

  const parsed = parseMaybeJson(value);

  if (parsed !== value) {
    return findJwt(parsed, depth + 1);
  }

  if (typeof value === "string") {
    const text = value.trim();

    const parts = text.split(".");

    if (parts.length === 3 && parts.every(Boolean)) {
      return text;
    }

    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJwt(item, depth + 1);

      if (found) {
        return found;
      }
    }

    return "";
  }

  if (typeof value !== "object") {
    return "";
  }

  for (const nested of Object.values(value)) {
    const found = findJwt(nested, depth + 1);

    if (found) {
      return found;
    }
  }

  return "";
}

/* =========================================================
   REQUEST ID
========================================================= */

function extractReqId(data) {
  return findValueByKeys(
    data,

    new Set(["reqId", "req_id", "requestId", "request_id"]),
  );
}

/* =========================================================
   LOAD MSG91 SCRIPT
========================================================= */

function loadMsg91Script() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("MSG91 OTP can only run in browser."));

      return;
    }

    if (typeof window.initSendOTP === "function") {
      resolve();

      return;
    }

    const oldScript = document.getElementById(SCRIPT_ID);

    if (oldScript) {
      const startedAt = Date.now();

      const timer = window.setInterval(() => {
        if (typeof window.initSendOTP === "function") {
          window.clearInterval(timer);

          resolve();

          return;
        }

        if (Date.now() - startedAt > 15000) {
          window.clearInterval(timer);

          reject(new Error("MSG91 OTP script did not finish loading."));
        }
      }, 100);

      return;
    }

    const script = document.createElement("script");

    script.id = SCRIPT_ID;

    script.src = SCRIPT_URL;

    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Unable to load MSG91 OTP service."));
    };

    document.head.appendChild(script);
  });
}

/* =========================================================
   WAIT FOR METHODS
========================================================= */

function waitForMethods() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const ready =
        typeof window.sendOtp === "function" &&
        typeof window.retryOtp === "function" &&
        typeof window.verifyOtp === "function";

      if (ready) {
        window.clearInterval(timer);

        resolve();

        return;
      }

      if (Date.now() - startedAt > 15000) {
        window.clearInterval(timer);

        reject(
          new Error(
            "MSG91 OTP methods were not loaded. Check Widget ID and Token.",
          ),
        );
      }
    }, 100);
  });
}

/* =========================================================
   INITIALIZE
========================================================= */

export async function initMsg91Otp() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const { widgetId, tokenAuth } = getMsg91Config();

    await loadMsg91Script();

    if (typeof window.initSendOTP !== "function") {
      throw new Error("MSG91 initSendOTP is unavailable.");
    }

    const configuration = {
      widgetId,

      tokenAuth,

      exposeMethods: true,

      captchaRenderId: "msg91-captcha",

      success: () => {
        // verifyOtp has its own success callback.
      },

      failure: (error) => {
        console.error("❌ MSG91 widget error:", error);
      },
    };

    window.initSendOTP(configuration);

    await waitForMethods();

    console.log("✅ MSG91 OTP READY");

    return true;
  })().catch((error) => {
    initPromise = null;

    throw error;
  });

  return initPromise;
}

/* =========================================================
   SEND OTP
========================================================= */

export async function sendMsg91Otp(identifier) {
  await initMsg91Otp();

  const cleanIdentifier = String(identifier || "")
    .replace(/[^\d]/g, "")
    .trim();

  if (!cleanIdentifier) {
    throw new Error("Valid mobile number is required.");
  }

  return new Promise((resolve, reject) => {
    window.sendOtp(
      cleanIdentifier,

      (data) => {
        const reqId = extractReqId(data);

        if (reqId) {
          currentReqId = reqId;
        }

        console.log("✅ MSG91 OTP sent");

        resolve(data);
      },

      (error) => {
        reject(makeError(error, "Unable to send OTP."));
      },
    );
  });
}

/* =========================================================
   RESEND OTP
========================================================= */

export async function resendMsg91Otp() {
  await initMsg91Otp();

  return new Promise((resolve, reject) => {
    const success = (data) => {
      const reqId = extractReqId(data);

      if (reqId) {
        currentReqId = reqId;
      }

      console.log("✅ MSG91 OTP resent");

      resolve(data);
    };

    const failure = (error) => {
      reject(makeError(error, "Unable to resend OTP."));
    };

    if (currentReqId) {
      window.retryOtp(null, success, failure, currentReqId);
    } else {
      window.retryOtp(null, success, failure);
    }
  });
}

/* =========================================================
   VERIFY OTP
========================================================= */

export async function verifyMsg91Otp(otp) {
  await initMsg91Otp();

  const cleanOtp = String(otp || "").replace(/\D/g, "");

  if (!cleanOtp) {
    throw new Error("OTP is required.");
  }

  return new Promise((resolve, reject) => {
    const success = (data) => {
      console.log("✅ MSG91 OTP verified");

      resolve(data);
    };

    const failure = (error) => {
      reject(makeError(error, "Incorrect or expired OTP."));
    };

    if (currentReqId) {
      window.verifyOtp(cleanOtp, success, failure, currentReqId);
    } else {
      window.verifyOtp(cleanOtp, success, failure);
    }
  });
}

/* =========================================================
   GET ACCESS TOKEN
========================================================= */

export function getMsg91AccessToken(result) {
  const parsed = parseMaybeJson(result);

  if (typeof parsed === "string") {
    const directJwt = findJwt(parsed);

    if (directJwt) {
      return directJwt;
    }
  }

  const accessToken = findValueByKeys(
    parsed,

    new Set([
      "access-token",
      "accessToken",
      "access_token",
      "jwt",
      "jwtToken",
      "jwt_token",
    ]),
  );

  if (accessToken) {
    return accessToken;
  }

  /*
   * MSG91 can return the JWT inside
   * message on a successful verification.
   */

  const type = String(parsed?.type || "").toLowerCase();

  const success = parsed?.success === true || type === "success";

  if (success && typeof parsed?.message === "string") {
    const message = parsed.message.trim();

    if (message.split(".").length === 3) {
      return message;
    }
  }

  return findJwt(parsed);
}
