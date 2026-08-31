// =====================================================
// DNS
// =====================================================

const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// =====================================================
// ENVIRONMENT VARIABLES
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

// =====================================================
// MODELS
// =====================================================

const User = require("./models/User");

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  // Production frontend
  "https://brown-walrus-852933.hostingersite.com",
  "https://inkconvention.com",
  "https://www.inkconvention.com",

  // API domain
  "https://api.inkconvention.com",

  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

// =====================================================
// CORS MIDDLEWARE
// =====================================================

app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(
    `🌐 ${req.method} ${req.originalUrl} | Origin: ${origin || "no-origin"}`,
  );

  // Requests such as Postman/server-to-server may not
  // contain an Origin header.
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

  // Important when dynamically returning origin
  res.setHeader("Vary", "Origin");

  // ===================================================
  // PREFLIGHT REQUEST
  // ===================================================

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// =====================================================
// BODY PARSERS
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(__dirname, "uploads");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =====================================================
// SERVE UPLOADED FILES
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
// MULTER UPLOAD
// =====================================================

const upload = multer({
  storage,

  limits: {
    // 100 MB maximum per file
    fileSize: 100 * 1024 * 1024,
  },
});

// =====================================================
// DATABASE CONNECTION
// =====================================================

if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing from .env");
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
// MONGOOSE EVENTS
// =====================================================

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

// =====================================================
// SMTP SETUP
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
// VERIFY SMTP
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
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS missing from .env");
}

// =====================================================
// ROOT API
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,

    message: "Ink Convention backend API is running successfully!",

    environment: process.env.NODE_ENV || "development",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,

    message: "Server is healthy",

    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",

    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// PAYMENT ROUTES
// =====================================================
//
// /api/payment
// /api/payment/create-order
// /api/payment/verify
//
// =====================================================

app.use("/api/payment", paymentRoutes);

// =====================================================
// CLIENT ROUTES
// =====================================================
//
// /api/clients
// /api/clients/register
// /api/clients/login
//
// =====================================================

app.use("/api/clients", clientRoutes);
app.use("/api/admin/tattoo-studios", tattooStudioRoutes);

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
    console.error("❌ Admin login error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error during login.",
    });
  }
});

// =====================================================
// TATTOO ARTIST SIGNUP / SUBMISSION
// =====================================================

app.post(
  "/api/signup",

  // ===================================================
  // MULTER FILE UPLOAD
  // ===================================================

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

  // ===================================================
  // REQUEST HANDLER
  // ===================================================

  async (req, res) => {
    try {
      console.log("📥 Artist signup request received");

      // =================================================
      // BODY DATA
      // =================================================

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

        // Razorpay information
        razorpay_order_id,

        razorpay_payment_id,
      } = req.body;

      // =================================================
      // REQUIRED FIELD VALIDATION
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

          message: "Database not connected yet.",
        });
      }

      // =================================================
      // NORMALIZE EMAIL
      // =================================================

      const cleanEmail = gmail.trim().toLowerCase();

      // =================================================
      // CHECK DUPLICATE USER
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

      const imagePaths =
        req.files && req.files.images
          ? req.files.images.map((file) => `uploads/${file.filename}`)
          : [];

      // =================================================
      // VIDEOS
      // =================================================

      const videoPaths =
        req.files && req.files.videos
          ? req.files.videos.map((file) => `uploads/${file.filename}`)
          : [];

      // =================================================
      // REQUIRE AT LEAST ONE IMAGE
      // =================================================

      if (imagePaths.length === 0) {
        return res.status(400).json({
          success: false,

          message: "Please upload at least 1 image of the tattoo.",
        });
      }

      // =================================================
      // ENTRY ID
      // =================================================

      const generatedEntryId = `INK26-${Math.floor(
        100000 + Math.random() * 900000,
      )}`;

      // =================================================
      // BOOLEAN HELP FUNCTION
      // =================================================

      const toBoolean = (value) => {
        return value === true || value === "true";
      };

      // =================================================
      // CREATE USER
      // =================================================

      const newUser = new User({
        entryId: generatedEntryId,

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
      });

      // =================================================
      // SAVE USER
      // =================================================

      await newUser.save();

      console.log(`✅ Artist saved with Entry ID: ${generatedEntryId}`);

      // =================================================
      // LOG PAYMENT DATA
      // =================================================

      if (razorpay_payment_id) {
        console.log("💳 Razorpay Payment:", razorpay_payment_id);
      }

      if (razorpay_order_id) {
        console.log("💳 Razorpay Order:", razorpay_order_id);
      }

      // =================================================
      // SEND EMAIL
      // =================================================

      let emailSent = false;

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const mailOptions = {
            from: `"Ink Convention" <${process.env.EMAIL_USER}>`,

            to: cleanEmail,

            subject: "Registration & Entry Successful - Ink Convention",

            html: `
              <div
                style="
                  max-width:600px;
                  margin:0 auto;
                  padding:30px;
                  background:#08080a;
                  color:#ffffff;
                  font-family:Arial,Helvetica,sans-serif;
                  border-radius:16px;
                "
              >

                <h1
                  style="
                    color:#a855f7;
                    margin-bottom:20px;
                  "
                >
                  INK CONVENTION 2026
                </h1>

                <h2>
                  Entry Received!
                </h2>

                <p>
                  Hi ${firstName},
                </p>

                <p
                  style="
                    color:#cccccc;
                    line-height:1.6;
                  "
                >
                  Your competition entry has been received successfully.
                </p>

                <div
                  style="
                    margin:25px 0;
                    padding:20px;
                    background:#111116;
                    border:1px solid #a855f7;
                    border-radius:12px;
                  "
                >

                  <p
                    style="
                      margin:0 0 8px;
                      color:#999;
                    "
                  >
                    Official Entry ID
                  </p>

                  <strong
                    style="
                      font-size:24px;
                      color:#a855f7;
                    "
                  >
                    ${generatedEntryId}
                  </strong>

                </div>

                <p>
                  Category:
                  <strong>
                    ${category}
                  </strong>
                </p>

                <p>
                  Package:
                  <strong>
                    ${entryPackage}
                  </strong>
                </p>

                ${
                  razorpay_payment_id
                    ? `
                      <p>
                        Payment ID:
                        <strong>
                          ${razorpay_payment_id}
                        </strong>
                      </p>
                    `
                    : ""
                }

                <p
                  style="
                    margin-top:30px;
                    color:#777;
                    font-size:12px;
                  "
                >
                  Ink Convention 2026
                </p>

              </div>
            `,
          };

          await transporter.sendMail(mailOptions);

          emailSent = true;

          console.log(`✅ Registration email sent to ${cleanEmail}`);
        } catch (emailError) {
          console.error("❌ Email dispatch failed:", emailError.message);
        }
      }

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(201).json({
        success: true,

        message: "User registered successfully!",

        entryId: generatedEntryId,

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
// GET ALL ARTIST ENTRIES
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
      console.error("❌ Fetch users error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while fetching users.",

        error: error.message,
      });
    }
  },
);

// =====================================================
// GET SINGLE ARTIST
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

      return res.status(200).json({
        success: true,

        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,

        message: "Server error while fetching user.",

        error: error.message,
      });
    }
  },
);

// =====================================================
// UPDATE ARTIST STATUS
// =====================================================

app.patch(
  "/api/admin/users/:id/status",

  async (req, res) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,

          message: "Status is required.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,

        {
          status,
        },

        {
          new: true,
        },
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,

          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,

        message: "Status updated successfully.",

        updated: updatedUser,
      });
    } catch (error) {
      console.error("❌ Status update error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while updating status.",

        error: error.message,
      });
    }
  },
);

// =====================================================
// DELETE ARTIST ENTRY
// =====================================================

app.delete(
  "/api/admin/users/:id",

  async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,

          message: "User not found.",
        });
      }

      // =================================================
      // DELETE ASSOCIATED FILES
      // =================================================

      const filesToDelete = [
        ...(deletedUser.images || []),
        ...(deletedUser.videos || []),
      ];

      filesToDelete.forEach((filePath) => {
        try {
          const absolutePath = path.join(__dirname, filePath);

          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } catch (fileError) {
          console.error("⚠️ Unable to delete file:", fileError.message);
        }
      });

      return res.status(200).json({
        success: true,

        message: "User deleted successfully.",
      });
    } catch (error) {
      console.error("❌ Delete user error:", error);

      return res.status(500).json({
        success: false,

        message: "Server error while deleting user.",

        error: error.message,
      });
    }
  },
);

// =====================================================
// 404 API HANDLER
// =====================================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,

    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("❌ Unhandled server error:", error);

  // Multer error
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

  console.log(`💳 Payment: http://localhost:${PORT}/api/payment`);

  console.log("==============================================");
});
