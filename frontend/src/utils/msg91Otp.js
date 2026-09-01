let initPromise = null;

// ======================================================
// FORMAT INDIAN MOBILE NUMBER
// Example:
// 9876543210 -> 919876543210
// ======================================================

export const formatIndianMobile = (phone) => {
  let mobile = String(phone || "")
    .replace(/\D/g, "");

  if (mobile.length === 10) {
    mobile = `91${mobile}`;
  }

  if (
    mobile.length !== 12 ||
    !mobile.startsWith("91")
  ) {
    throw new Error(
      "Please enter a valid 10-digit Indian mobile number."
    );
  }

  return mobile;
};

// ======================================================
// WAIT UNTIL MSG91 METHODS ARE READY
// ======================================================

const waitForMsg91 = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const timer = setInterval(() => {
      attempts += 1;

      if (
        typeof window.sendOtp === "function" &&
        typeof window.verifyOtp === "function" &&
        typeof window.retryOtp === "function"
      ) {
        clearInterval(timer);
        resolve(true);
        return;
      }

      if (attempts >= 100) {
        clearInterval(timer);

        reject(
          new Error(
            "MSG91 OTP SDK failed to initialize."
          )
        );
      }
    }, 100);
  });
};

// ======================================================
// INITIALIZE MSG91 OTP WIDGET
// ======================================================

export const initMsg91Otp = async () => {
  if (
    typeof window.sendOtp === "function" &&
    typeof window.verifyOtp === "function"
  ) {
    return true;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise(
    (resolve, reject) => {
      const widgetId =
        import.meta.env
          .VITE_MSG91_WIDGET_ID;

      const tokenAuth =
        import.meta.env
          .VITE_MSG91_WIDGET_TOKEN;

      if (!widgetId) {
        reject(
          new Error(
            "VITE_MSG91_WIDGET_ID is missing."
          )
        );
        return;
      }

      if (!tokenAuth) {
        reject(
          new Error(
            "VITE_MSG91_WIDGET_TOKEN is missing."
          )
        );
        return;
      }

      const configuration = {
        widgetId,
        tokenAuth,

        // We will pass mobile number dynamically
        identifier: "",

        // Important for your custom React UI
        exposeMethods: true,

        // Keep this if CAPTCHA is enabled in MSG91
        captchaRenderId:
          "msg91-captcha",

        /*
          We use the callbacks of verifyOtp()
          directly, so these are only for logs.
        */
        success: (data) => {
          console.log(
            "✅ MSG91 GLOBAL SUCCESS:",
            data
          );
        },

        failure: (error) => {
          console.error(
            "❌ MSG91 GLOBAL FAILURE:",
            error
          );
        },
      };

      const initializeWidget =
        async () => {
          try {
            if (
              typeof window.initSendOTP !==
              "function"
            ) {
              throw new Error(
                "MSG91 initSendOTP function is unavailable."
              );
            }

            window.initSendOTP(
              configuration
            );

            await waitForMsg91();

            console.log(
              "✅ MSG91 OTP SDK READY"
            );

            resolve(true);
          } catch (error) {
            reject(error);
          }
        };

      // ==========================================
      // DO NOT LOAD SCRIPT TWICE
      // ==========================================

      const existingScript =
        document.getElementById(
          "msg91-otp-provider"
        );

      if (existingScript) {
        if (
          typeof window.initSendOTP ===
          "function"
        ) {
          initializeWidget();
        } else {
          existingScript.addEventListener(
            "load",
            initializeWidget,
            {
              once: true,
            }
          );
        }

        return;
      }

      // ==========================================
      // LOAD MSG91 SCRIPT
      // ==========================================

      const script =
        document.createElement(
          "script"
        );

      script.id =
        "msg91-otp-provider";

      script.src =
        "https://verify.msg91.com/otp-provider.js";

      script.async = true;

      script.onload =
        initializeWidget;

      script.onerror = () => {
        reject(
          new Error(
            "Unable to load MSG91 OTP SDK."
          )
        );
      };

      document.head.appendChild(
        script
      );
    }
  );

  return initPromise;
};

// ======================================================
// SEND OTP
// ======================================================

export const sendMsg91Otp = async (
  phone
) => {
  await initMsg91Otp();

  const identifier =
    formatIndianMobile(phone);

  console.log(
    "📱 Sending OTP to:",
    identifier
  );

  return new Promise(
    (resolve, reject) => {
      window.sendOtp(
        identifier,

        (data) => {
          console.log(
            "✅ MSG91 OTP SENT:",
            data
          );

          resolve(data);
        },

        (error) => {
          console.error(
            "❌ MSG91 SEND OTP ERROR:",
            error
          );

          reject(
            new Error(
              error?.message ||
                error?.error ||
                "Unable to send OTP."
            )
          );
        }
      );
    }
  );
};

// ======================================================
// VERIFY OTP
// ======================================================

export const verifyMsg91Otp = async (
  otp
) => {
  await initMsg91Otp();

  const cleanOtp =
    String(otp || "")
      .replace(/\D/g, "");

  if (!cleanOtp) {
    throw new Error(
      "Please enter OTP."
    );
  }

  return new Promise(
    (resolve, reject) => {
      window.verifyOtp(
        Number(cleanOtp),

        (data) => {
          console.log(
            "✅ MSG91 OTP VERIFIED:",
            data
          );

          resolve(data);
        },

        (error) => {
          console.error(
            "❌ MSG91 VERIFY OTP ERROR:",
            error
          );

          reject(
            new Error(
              error?.message ||
                error?.error ||
                "Invalid OTP."
            )
          );
        }
      );
    }
  );
};

// ======================================================
// RESEND OTP
// ======================================================

export const resendMsg91Otp =
  async () => {
    await initMsg91Otp();

    return new Promise(
      (resolve, reject) => {
        /*
          null = use widget's default resend
          configuration/channel.
        */

        window.retryOtp(
          null,

          (data) => {
            console.log(
              "✅ MSG91 OTP RESENT:",
              data
            );

            resolve(data);
          },

          (error) => {
            console.error(
              "❌ MSG91 RESEND OTP ERROR:",
              error
            );

            reject(
              new Error(
                error?.message ||
                  error?.error ||
                  "Unable to resend OTP."
              )
            );
          }
        );
      }
    );
  };

// ======================================================
// GET ACCESS TOKEN AFTER OTP VERIFICATION
// ======================================================

export const getMsg91AccessToken = (
  data
) => {
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
    data.message ||
    null
  );
};