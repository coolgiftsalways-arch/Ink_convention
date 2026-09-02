// =====================================================
// DNS
// =====================================================

const dns = require("dns");

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (error) {
  console.log("⚠️ DNS setup warning:", error.message);
}

// =====================================================
// ENV
// =====================================================

require("dotenv").config();

// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

// =====================================================
// ROUTES
// =====================================================

const paymentRoutes = require("./routes/payment");
const clientRoutes = require("./routes/ClientRoutes");
const tattooStudioRoutes = require("./routes/tattooStudioRoutes");
const claimRoutes = require("./routes/claimRoutes");
const stallBookingRoutes = require("./routes/stallBookingRoutes");
const artistBookingRoutes = require("./routes/artistBookingRoutes");

// =====================================================
// MODELS
// =====================================================

const User = require("./models/User");

// =====================================================
// APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;

// Hostinger / nginx / reverse proxy support
app.set("trust proxy", 1);

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  // LIVE WEBSITE
  "https://inkconvention.com",
  "https://www.inkconvention.com",

  // HOSTINGER TEMP DOMAIN
  "https://brown-walrus-852933.hostingersite.com",

  // TEST WEBSITE
  "http://test.inkconvention.com:5173",
  "https://test.inkconvention.com",
  "https://test.inkconvention.com:5173",

  // LOCAL DEVELOPMENT
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",

  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
];

// =====================================================
// CORS MIDDLEWARE
// KEEP BEFORE ALL API ROUTES
// =====================================================

app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log("");
  console.log("============================================");
  console.log("🌐 REQUEST");
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("ORIGIN:", origin || "NO ORIGIN");
  console.log("============================================");

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);

    console.log("✅ CORS origin allowed:", origin);
  } else if (!origin) {
    console.log("✅ Request without Origin allowed");
  } else {
    console.log("❌ CORS origin not in list:", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.setHeader("Access-Control-Max-Age", "86400");

  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS PREFLIGHT RECEIVED");

    if (origin && !allowedOrigins.includes(origin)) {
      console.log("❌ OPTIONS BLOCKED:", origin);

      return res.status(403).json({
        success: false,
        message: "Origin is not allowed.",
        origin,
      });
    }

    console.log("✅ OPTIONS PREFLIGHT SUCCESS");

    return res.status(204).end();
  }

  next();
});

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "15mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "15mb",
  }),
);

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =====================================================
// STATIC UPLOAD FILES
// =====================================================

app.use("/uploads", express.static(uploadDir));

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

// =====================================================
// MONGODB
// =====================================================

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
} else {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("✅ Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message);
    });
}

// =====================================================
// MONGODB EVENTS
// =====================================================

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

// =====================================================
// EMAIL TRANSPORT
// =====================================================

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",

  port: 465,

  secure: true,

  auth: {
    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS,
  },
});

// =====================================================
// VERIFY EMAIL
// =====================================================

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error("❌ Hostinger SMTP connection failed:", error.message);
    } else {
      console.log("✅ Hostinger SMTP server is ready!");
    }
  });
} else {
  console.log("⚠️ EMAIL_USER / EMAIL_PASS not configured");
}

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,

    message: "Ink Convention API running",

    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// HEALTH ROUTE
// =====================================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,

    message: "Ink Convention Backend Running",

    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",

    port: PORT,

    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// CORS TEST ROUTE
// =====================================================

app.get("/api/cors-test", (req, res) => {
  return res.status(200).json({
    success: true,

    message: "CORS is working",

    origin: req.headers.origin || "No origin",

    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// PAYMENT ROUTES
// =====================================================

app.use("/api/payment", paymentRoutes);

// =====================================================
// CLIENT ROUTES
// =====================================================

app.use("/api/clients", clientRoutes);

// =====================================================
// STALL BOOKING ROUTES
// =====================================================

app.use("/api/stall-bookings", stallBookingRoutes);

// OLD ROUTE SUPPORT

app.use("/api/stalls", stallBookingRoutes);

console.log("✅ Stall booking routes mounted at /api/stall-bookings");

console.log("✅ Stall booking alias mounted at /api/stalls");

// =====================================================
// TATTOO DIRECTORY ROUTES
// =====================================================

app.use("/api/admin/tattoo-studios", tattooStudioRoutes);

// =====================================================
// CLAIM ROUTES
// =====================================================

app.use("/api/claim", claimRoutes);

console.log("✅ Claim routes mounted at /api/claim");

// =====================================================
// ARTIST BOOKING ROUTES
//
// PULLED FEATURE KEPT
// =====================================================

app.use("/api/artist-bookings", artistBookingRoutes);

console.log("✅ Artist booking routes mounted at /api/artist-bookings");

// =====================================================
// ADMIN LOGIN
// =====================================================

const adminLogin = (req, res) => {
  try {
    console.log("🔐 Admin login request received");

    console.log("📦 Login request body:", {
      email: req.body?.email || req.body?.gmail || "missing",

      passwordProvided: Boolean(req.body?.password),
    });

    // =================================================
    // SUPPORT EMAIL OR GMAIL
    // =================================================

    const receivedEmail = req.body?.email || req.body?.gmail || "";

    const receivedPassword = req.body?.password || "";

    // =================================================
    // CLEAN VALUES
    // =================================================

    const email = String(receivedEmail).trim().toLowerCase();

    const password = String(receivedPassword);

    // =================================================
    // VALIDATION
    // =================================================

    if (!email) {
      return res.status(400).json({
        success: false,

        message: "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,

        message: "Password is required.",
      });
    }

    // =================================================
    // ENV CHECK
    // =================================================

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");

      return res.status(500).json({
        success: false,

        message: "Admin login is not configured on the server.",
      });
    }

    // =================================================
    // CLEAN ADMIN DETAILS
    // =================================================

    const adminEmail = String(process.env.ADMIN_EMAIL).trim().toLowerCase();

    const adminPassword = String(process.env.ADMIN_PASSWORD);

    // =================================================
    // LOGIN CHECK
    // =================================================

    if (email === adminEmail && password === adminPassword) {
      console.log("✅ Admin login successful:", email);

      return res.status(200).json({
        success: true,

        message: "Login successful!",

        admin: {
          email: adminEmail,
        },
      });
    }

    // =================================================
    // WRONG LOGIN
    // =================================================

    console.log("❌ Invalid admin login:", email);

    return res.status(401).json({
      success: false,

      message: "Invalid email or password.",
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error while logging in.",

      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// =====================================================
// ADMIN LOGIN ROUTES
// =====================================================

app.post("/api/login", adminLogin);

app.post("/api/admin/login", adminLogin);

// =====================================================
// COMPETITION SIGNUP
// =====================================================

app.post(
  "/api/signup",

  upload.fields([
    {
      name: "images",
      maxCount: 5,
    },

    {
      name: "videos",
      maxCount: 3,
    },
  ]),

  async (req, res) => {
    try {
      console.log("📥 Artist signup request received");

      const {
        category,

        entryPackage,

        firstName,

        lastName,

        professionalName,

        gmail,

        phone,

        instagram,

        studio,

        city,

        state,

        country,

        primaryStyle,

        experience,

        tattooTitle,

        description,

        placement,

        size,

        isOriginal,

        declarationOriginal,

        declarationConsent,

        termsAccepted,

        razorpay_order_id,

        razorpay_payment_id,
      } = req.body;

      // =================================================
      // VALIDATION
      // =================================================

      if (
        !category ||
        !entryPackage ||
        !firstName ||
        !lastName ||
        !gmail ||
        !phone ||
        !city ||
        !description
      ) {
        return res.status(400).json({
          success: false,

          message: "Please provide all required details.",
        });
      }

      // =================================================
      // DATABASE CHECK
      // =================================================

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      // =================================================
      // CLEAN EMAIL
      // =================================================

      const cleanEmail = gmail.trim().toLowerCase();

      // =================================================
      // EXISTING USER
      // =================================================

      const existingUser = await User.findOne({
        gmail: cleanEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,

          message: "User with this email already exists!",
        });
      }

      // =================================================
      // IMAGES
      // =================================================

      const imagePaths = req.files?.images
        ? req.files.images.map((file) => `uploads/${file.filename}`)
        : [];

      // =================================================
      // VIDEOS
      // =================================================

      const videoPaths = req.files?.videos
        ? req.files.videos.map((file) => `uploads/${file.filename}`)
        : [];

      // =================================================
      // IMAGE REQUIRED
      // =================================================

      if (imagePaths.length === 0) {
        return res.status(400).json({
          success: false,

          message: "Please upload at least 1 image.",
        });
      }

      // =================================================
      // ENTRY ID
      // =================================================

      const entryId = `INK26-${Math.floor(100000 + Math.random() * 900000)}`;

      // =================================================
      // BOOLEAN FUNCTION
      // =================================================

      const toBoolean = (value) => value === true || value === "true";

      // =================================================
      // CREATE USER
      // =================================================

      const newUser = new User({
        entryId,

        category,

        entryPackage,

        firstName: firstName.trim(),

        lastName: lastName.trim(),

        professionalName: professionalName || "",

        gmail: cleanEmail,

        phone: phone.trim(),

        instagram: instagram || "",

        studio: studio || "",

        city: city.trim(),

        state: state || "",

        country: country || "India",

        primaryStyle: primaryStyle || "",

        experience: experience || "",

        tattooTitle: tattooTitle || "",

        description,

        placement: placement || "",

        size: size || "",

        isOriginal: isOriginal || "",

        declarationOriginal: toBoolean(declarationOriginal),

        declarationConsent: toBoolean(declarationConsent),

        termsAccepted: toBoolean(termsAccepted),

        images: imagePaths,

        videos: videoPaths,

        razorpay_order_id: razorpay_order_id || "",

        razorpay_payment_id: razorpay_payment_id || "",
      });

      // =================================================
      // SAVE USER
      // =================================================

      await newUser.save();

      console.log("✅ Artist saved:", entryId);

      // =================================================
      // SEND EMAIL
      // =================================================

      let emailSent = false;

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: `"Ink Convention" <${process.env.EMAIL_USER}>`,

            to: cleanEmail,

            subject: "Ink Convention Registration Successful",

            html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  padding: 30px;
                  background: #08080a;
                  color: white;
                "
              >

                <h1 style="color:#a855f7;">
                  INK CONVENTION 2026
                </h1>

                <p>
                  Hi ${firstName},
                </p>

                <p>
                  Your entry has been received successfully.
                </p>

                <h2>
                  Entry ID: ${entryId}
                </h2>

              </div>
            `,
          });

          emailSent = true;

          console.log("✅ Confirmation email sent");
        } catch (emailError) {
          console.error("❌ Email:", emailError.message);
        }
      }

      // =================================================
      // SUCCESS
      // =================================================

      return res.status(201).json({
        success: true,

        message: "User registered successfully!",

        entryId,

        emailSent,

        user: newUser,
      });
    } catch (error) {
      console.error("❌ Signup error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while registering user.",

        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  },
);

// =====================================================
// GET ALL ADMIN USERS
// =====================================================

app.get(
  "/api/admin/users",

  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      const users = await User.find().sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,

        count: users.length,

        users,
      });
    } catch (error) {
      console.error("❌ Unable to load users:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to load users.",
      });
    }
  },
);

// =====================================================
// GET SINGLE USER
// =====================================================

app.get(
  "/api/admin/users/:id",

  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,

          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,

        user,
      });
    } catch (error) {
      console.error("❌ Unable to load user:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to load user.",
      });
    }
  },
);

// =====================================================
// UPDATE USER STATUS
// =====================================================

app.patch(
  "/api/admin/users/:id/status",

  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,

          message: "Status is required.",
        });
      }

      const updated = await User.findByIdAndUpdate(
        req.params.id,

        {
          status,
        },

        {
          new: true,
        },
      );

      if (!updated) {
        return res.status(404).json({
          success: false,

          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message: "User status updated successfully.",

        updated,
      });
    } catch (error) {
      console.error("❌ Unable to update user:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to update user.",
      });
    }
  },
);

// =====================================================
// DELETE USER
// =====================================================

app.delete(
  "/api/admin/users/:id",

  async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,

          message: "Database not connected.",
        });
      }

      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,

          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message: "User deleted successfully.",
      });
    } catch (error) {
      console.error("❌ Unable to delete user:", error);

      return res.status(500).json({
        success: false,

        message: "Unable to delete user.",
      });
    }
  },
);

// =====================================================
// API 404
// KEEP AFTER ALL API ROUTES
// =====================================================

app.use(
  "/api",

  (req, res) => {
    console.log("❌ API ROUTE NOT FOUND:", req.method, req.originalUrl);

    return res.status(404).json({
      success: false,

      message: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  },
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("❌ GLOBAL SERVER ERROR:", error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,

      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,

    message: "Internal server error.",

    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
});

// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,

  () => {
    console.log("");
    console.log("==============================================");

    console.log(`🚀 Server running on port ${PORT}`);

    console.log(`🌐 Local API: http://localhost:${PORT}`);

    console.log(`❤️ Health: http://localhost:${PORT}/api/health`);

    console.log(`🧪 CORS Test: http://localhost:${PORT}/api/cors-test`);

    console.log(`🔐 Admin Login: http://localhost:${PORT}/api/login`);

    console.log(
      `🔐 Admin Login Alias: http://localhost:${PORT}/api/admin/login`,
    );

    console.log(`👤 Clients: http://localhost:${PORT}/api/clients`);

    console.log(
      `🏪 Stall Bookings: http://localhost:${PORT}/api/stall-bookings`,
    );

    console.log(
      `🎨 Directory: http://localhost:${PORT}/api/admin/tattoo-studios`,
    );

    console.log(`🔐 Claim API: http://localhost:${PORT}/api/claim`);

    console.log(`💳 Payment: http://localhost:${PORT}/api/payment`);

    console.log(
      `🎯 Artist Bookings: http://localhost:${PORT}/api/artist-bookings`,
    );

    console.log("==============================================");

    console.log("");
  },
);
