let initPromise = null;

const MSG91_SCRIPT_ID = "msg91-otp-provider";

const MSG91_SCRIPT_URL = "https://verify.msg91.com/otp-provider.js";

/* =========================================================
   FORMAT INDIAN MOBILE

   9137960973
   ->
   919137960973
========================================================= */

export const formatIndianMobile = (phone) => {
  let mobile = String(phone || "")
    .replace(/\D/g, "")
    .trim();

  // 09137960973 -> 9137960973
  if (mobile.length === 11 && mobile.startsWith("0")) {
    mobile = mobile.slice(1);
  }

  // 9137960973 -> 919137960973
  if (mobile.length === 10) {
    mobile = `91${mobile}`;
  }

  if (mobile.length !== 12 || !mobile.startsWith("91")) {
    throw new Error("Please enter a valid 10-digit Indian mobile number.");
  }

  return mobile;
};

/* =========================================================
   ENV CONFIG
========================================================= */

const getMsg91Config = () => {
  const widgetId = String(import.meta.env.VITE_MSG91_WIDGET_ID || "").trim();

  const tokenAuth = String(
    import.meta.env.VITE_MSG91_WIDGET_TOKEN || "",
  ).trim();

  if (!widgetId || widgetId === "PASTE_YOUR_WIDGET_ID_HERE") {
    throw new Error("Please add your real MSG91 Widget ID in frontend/.env");
  }

  if (!tokenAuth || tokenAuth === "PASTE_YOUR_WIDGET_TOKEN_HERE") {
    throw new Error("Please add your real MSG91 Widget Token in frontend/.env");
  }

  return {
    widgetId,
    tokenAuth,
  };
};

/* =========================================================
   ERROR MESSAGE
========================================================= */

const getErrorMessage = (error, fallback = "MSG91 request failed.") => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.data?.message ||
    error?.data?.error ||
    error?.response?.message ||
    fallback
  );
};

/* =========================================================
   ERROR LOGGER
========================================================= */

const printError = (title, error) => {
  console.error(`❌ ${title}:`, error);

  try {
    console.error("❌ FULL ERROR:", JSON.stringify(error, null, 2));
  } catch {
    // ignore
  }

  console.error("❌ MESSAGE:", error?.message);

  console.error("❌ CODE:", error?.code);

  console.error("❌ TYPE:", error?.type);

  console.error("🌐 ORIGIN:", window.location.origin);
};

/* =========================================================
   CHECK METHODS
========================================================= */

const msg91MethodsReady = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.sendOtp === "function" &&
    typeof window.verifyOtp === "function" &&
    typeof window.retryOtp === "function"
  );
};

/* =========================================================
   WAIT FOR MSG91 METHODS
========================================================= */

const waitForMsg91Methods = () => {
  return new Promise((resolve, reject) => {
    let count = 0;

    const timer = window.setInterval(() => {
      count += 1;

      if (msg91MethodsReady()) {
        window.clearInterval(timer);

        resolve(true);

        return;
      }

      if (count >= 150) {
        window.clearInterval(timer);

        reject(new Error("MSG91 methods failed to initialize."));
      }
    }, 100);
  });
};

/* =========================================================
   LOAD MSG91 SDK
========================================================= */

const loadMsg91Script = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.initSendOTP === "function") {
      resolve(true);

      return;
    }

    const oldScript = document.getElementById(MSG91_SCRIPT_ID);

    if (oldScript) {
      let count = 0;

      const timer = window.setInterval(() => {
        count += 1;

        if (typeof window.initSendOTP === "function") {
          window.clearInterval(timer);

          resolve(true);

          return;
        }

        if (count >= 100) {
          window.clearInterval(timer);

          reject(new Error("MSG91 SDK exists but initSendOTP is unavailable."));
        }
      }, 100);

      return;
    }

    const script = document.createElement("script");

    script.id = MSG91_SCRIPT_ID;

    script.src = MSG91_SCRIPT_URL;

    script.async = true;

    script.onload = () => {
      console.log("✅ MSG91 SCRIPT LOADED");

      if (typeof window.initSendOTP !== "function") {
        reject(new Error("MSG91 SDK loaded but initSendOTP was not found."));

        return;
      }

      resolve(true);
    };

    script.onerror = () => {
      reject(new Error("Unable to load MSG91 SDK."));
    };

    document.head.appendChild(script);
  });
};

/* =========================================================
   INITIALIZE MSG91
========================================================= */

export const initMsg91Otp = async () => {
  if (msg91MethodsReady()) {
    return true;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const { widgetId, tokenAuth } = getMsg91Config();

    console.log("====================================");

    console.log("🔵 INITIALIZING MSG91");

    console.log("🔵 WIDGET ID:", widgetId);

    console.log("🔐 TOKEN PRESENT:", Boolean(tokenAuth));

    console.log("🌐 WEBSITE:", window.location.origin);

    console.log("====================================");

    /*
     * hCaptcha does not like localhost.
     * This gives you a clear message instead
     * of a confusing network-error.
     */

    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      throw new Error(
        "MSG91 hCaptcha cannot run correctly on localhost. Open the website using http://ink.local:5173",
      );
    }

    await loadMsg91Script();

    if (typeof window.initSendOTP !== "function") {
      throw new Error("MSG91 initSendOTP is unavailable.");
    }

    const configuration = {
      widgetId,

      tokenAuth,

      /*
       * Custom React UI
       */
      exposeMethods: true,

      /*
       * Required when CAPTCHA is enabled.
       *
       * Enter.jsx must contain:
       *
       * <div id="msg91-captcha"></div>
       */
      captchaRenderId: "msg91-captcha",

      success: (data) => {
        console.log("✅ MSG91 GLOBAL SUCCESS:", data);
      },

      failure: (error) => {
        printError("MSG91 GLOBAL FAILURE", error);
      },
    };

    console.log("🔵 Calling initSendOTP...");

    window.initSendOTP(configuration);

    await waitForMsg91Methods();

    console.log("✅ MSG91 OTP SDK READY");

    return true;
  })().catch((error) => {
    initPromise = null;

    printError("MSG91 INITIALIZATION ERROR", error);

    throw error;
  });

  return initPromise;
};

/* =========================================================
   SEND OTP
========================================================= */

export const sendMsg91Otp = async (phone) => {
  await initMsg91Otp();

  const identifier = formatIndianMobile(phone);

  console.log("====================================");

  console.log("📱 SENDING OTP");

  console.log("📱 Identifier:", identifier);

  console.log("====================================");

  if (typeof window.sendOtp !== "function") {
    throw new Error("MSG91 sendOtp is unavailable.");
  }

  return new Promise((resolve, reject) => {
    try {
      window.sendOtp(
        identifier,

        /* SUCCESS */
        (data) => {
          console.log("✅ MSG91 OTP SENT:", data);

          resolve(data);
        },

        /* ERROR */
        (error) => {
          printError("MSG91 SEND OTP ERROR", error);

          const message = getErrorMessage(error, "Unable to send OTP.");

          if (String(message).toLowerCase().includes("authenticationfailure")) {
            reject(
              new Error(
                "MSG91 authentication failed. Check Widget ID and Widget Token.",
              ),
            );

            return;
          }

          if (String(message).toLowerCase().includes("network-error")) {
            reject(
              new Error(
                "MSG91 / hCaptcha network error. Make sure you are using http://ink.local:5173 and not localhost.",
              ),
            );

            return;
          }

          reject(new Error(message));
        },
      );
    } catch (error) {
      printError("MSG91 SEND OTP EXCEPTION", error);

      reject(error);
    }
  });
};

/* =========================================================
   VERIFY OTP
========================================================= */

export const verifyMsg91Otp = async (otp) => {
  await initMsg91Otp();

  const cleanOtp = String(otp || "")
    .replace(/\D/g, "")
    .trim();

  if (!cleanOtp) {
    throw new Error("Please enter OTP.");
  }

  if (cleanOtp.length < 4 || cleanOtp.length > 8) {
    throw new Error("Please enter a valid OTP.");
  }

  if (typeof window.verifyOtp !== "function") {
    throw new Error("MSG91 verifyOtp is unavailable.");
  }

  console.log("🔐 VERIFYING OTP...");

  return new Promise((resolve, reject) => {
    try {
      window.verifyOtp(
        Number(cleanOtp),

        /* SUCCESS */
        (data) => {
          console.log("✅ OTP VERIFIED:", data);

          resolve(data);
        },

        /* ERROR */
        (error) => {
          printError("MSG91 VERIFY ERROR", error);

          reject(new Error(getErrorMessage(error, "Invalid OTP.")));
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};

/* =========================================================
   RESEND OTP
========================================================= */

export const resendMsg91Otp = async () => {
  await initMsg91Otp();

  if (typeof window.retryOtp !== "function") {
    throw new Error("MSG91 retryOtp is unavailable.");
  }

  console.log("🔄 RESENDING OTP...");

  return new Promise((resolve, reject) => {
    try {
      window.retryOtp(
        null,

        /* SUCCESS */
        (data) => {
          console.log("✅ OTP RESENT:", data);

          resolve(data);
        },

        /* ERROR */
        (error) => {
          printError("MSG91 RESEND ERROR", error);

          reject(new Error(getErrorMessage(error, "Unable to resend OTP.")));
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};

/* =========================================================
   ACCESS TOKEN
========================================================= */

export const getMsg91AccessToken = (data) => {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  return (
    data["access-token"] ||
    data.accessToken ||
    data.access_token ||
    data.token ||
    data?.data?.["access-token"] ||
    data?.data?.accessToken ||
    data?.data?.access_token ||
    data?.data?.token ||
    null
  );
};

/* =========================================================
   RESET DURING DEVELOPMENT
========================================================= */

export const resetMsg91Otp = () => {
  initPromise = null;

  console.log("🔄 MSG91 RESET");
};
