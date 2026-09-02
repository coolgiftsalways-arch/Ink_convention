const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

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

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "https://brown-walrus-852933.hostingersite.com",
  "https://inkconvention.com",
  "https://www.inkconvention.com",
  "https://api.inkconvention.com",

  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",

  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(
    `🌐 ${req.method} ${req.originalUrl} | Origin: ${origin || "no-origin"}`,
  );

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
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
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// =====================================================
// BODY
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
// UPLOADS
// =====================================================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

app.use("/uploads", express.static(uploadDir));

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

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

// =====================================================
// EMAIL
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

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error("❌ Hostinger SMTP connection failed:", error.message);
    } else {
      console.log("✅ Hostinger SMTP server is ready!");
    }
  });
}

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Ink Convention API running",
  });
});

// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,

    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",

    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// PAYMENT
// =====================================================

app.use("/api/payment", paymentRoutes);

// =====================================================
// CLIENTS
// =====================================================

app.use("/api/clients", clientRoutes);

// =====================================================
// STALL BOOKINGS
// VERY IMPORTANT
// =====================================================

app.use("/api/stall-bookings", stallBookingRoutes);

// Old route also supported
app.use("/api/stalls", stallBookingRoutes);

console.log("✅ Stall booking routes mounted at /api/stall-bookings");

console.log("✅ Stall booking alias mounted at /api/stalls");

// =====================================================
// DIRECTORY
// =====================================================

app.use("/api/admin/tattoo-studios", tattooStudioRoutes);

// =====================================================
// CLAIM
// =====================================================

app.use("/api/claim", claimRoutes);

console.log("✅ Claim routes mounted at /api/claim");

// =====================================================
// ARTIST BOOKING ROUTES
// =====================================================

app.use("/api/artist-bookings", artistBookingRoutes);

console.log(
  "✅ Artist booking routes mounted at /api/artist-bookings"
);
// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/login", (req, res) => {
  try {
    const { gmail, password } = req.body;

    if (!gmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (
      gmail === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.status(200).json({
        success: true,
        message: "Login successful!",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  } catch (error) {
    console.error("❌ Admin login:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

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

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: "Database not connected.",
        });
      }

      const cleanEmail = gmail.trim().toLowerCase();

      const existingUser = await User.findOne({
        gmail: cleanEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,

          message: "User with this email already exists!",
        });
      }

      const imagePaths = req.files?.images
        ? req.files.images.map((file) => `uploads/${file.filename}`)
        : [];

      const videoPaths = req.files?.videos
        ? req.files.videos.map((file) => `uploads/${file.filename}`)
        : [];

      if (imagePaths.length === 0) {
        return res.status(400).json({
          success: false,

          message: "Please upload at least 1 image.",
        });
      }

      const entryId = `INK26-${Math.floor(100000 + Math.random() * 900000)}`;

      const toBoolean = (value) => value === true || value === "true";

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

      await newUser.save();

      console.log("✅ Artist saved:", entryId);

      let emailSent = false;

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: `"Ink Convention" <${process.env.EMAIL_USER}>`,

            to: cleanEmail,

            subject: "Ink Convention Registration Successful",

            html: `
              <div style="font-family:Arial;padding:30px;background:#08080a;color:white">
                <h1 style="color:#a855f7">
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
        } catch (emailError) {
          console.error("❌ Email:", emailError.message);
        }
      }

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

        error: error.message,
      });
    }
  },
);

// =====================================================
// ADMIN USERS
// =====================================================

app.get(
  "/api/admin/users",

  async (req, res) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });

      return res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to load users.",
      });
    }
  },
);

// =====================================================
// SINGLE USER
// =====================================================

app.get(
  "/api/admin/users/:id",

  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
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
      const { status } = req.body;

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

      return res.json({
        success: true,
        updated,
      });
    } catch (error) {
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
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.json({
        success: true,
        message: "User deleted successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to delete user.",
      });
    }
  },
);

// =====================================================
// API 404
// KEEP THIS AFTER ALL ROUTES
// =====================================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,

    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR
// =====================================================

app.use((error, req, res, next) => {
  console.error("❌ Server error:", error);

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

app.listen(PORT, () => {
  console.log("==============================================");

  console.log(`🚀 Server is running on port ${PORT}`);

  console.log(`🌐 Local API: http://localhost:${PORT}`);

  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);

  console.log(`👤 Clients: http://localhost:${PORT}/api/clients`);

  console.log(`🏪 Stall Bookings: http://localhost:${PORT}/api/stall-bookings`);

  console.log(
    `🎨 Directory: http://localhost:${PORT}/api/admin/tattoo-studios`,
  );

  console.log(`🔐 Claim API: http://localhost:${PORT}/api/claim`);

  console.log(`💳 Payment: http://localhost:${PORT}/api/payment`);

  console.log("==============================================");
});
