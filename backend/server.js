const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const paymentRoutes = require("./routes/payment");
const clientRoutes = require("./routes/ClientRoutes");

const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// NUCLEAR CORS CONFIGURATION (Overrides Hostinger Proxies)
// =====================================================

const allowedOrigins = [
  "https://brown-walrus-852933.hostingersite.com",
  "https://inkconvention.com",
  "https://www.inkconvention.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Forcefully allow these methods and headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Intercept the Preflight (OPTIONS) request and immediately return success
  if (req.method === "OPTIONS") {
    return res.status(200).end();
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

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// =====================================================
// MULTER
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
});

// =====================================================
// DATABASE CONNECTION
// =====================================================

if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is missing from .env");
} else {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
}

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

transporter.verify((error) => {
  if (error) {
    console.error("Hostinger SMTP connection failed:", error.message);
  } else {
    console.log("Hostinger SMTP server is ready!");
  }
});

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.status(200).send("Backend API is running successfully!");
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
// ADMIN LOGIN
// =====================================================

app.post("/api/login", (req, res) => {
  const { gmail, password } = req.body;

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
});

// =====================================================
// TATTOO ARTIST SIGNUP / SUBMISSION
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
      } = req.body;

      // Required fields
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

      // Database check
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({
          success: false,
          message: "Database not connected yet.",
        });
      }

      // Check duplicate user
      const existingUser = await User.findOne({
        gmail,
      });

      if (existingUser) {
        return res.status(400).json({
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

      // Require image
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
      // CREATE USER
      // =================================================

      const newUser = new User({
        entryId: generatedEntryId,

        category,

        entryPackage,

        firstName,

        lastName,

        professionalName: professionalName || "",

        gmail,

        phone,

        instagram: instagram || "",

        studio: studio || "",

        city,

        state: state || "",

        country: country || "India",

        primaryStyle: primaryStyle || "",

        experience: experience || "",

        tattooTitle: tattooTitle || "",

        description,

        placement: placement || "",

        size: size || "",

        isOriginal: isOriginal || "",

        declarationOriginal:
          declarationOriginal === "true" || declarationOriginal === true,

        declarationConsent:
          declarationConsent === "true" || declarationConsent === true,

        termsAccepted: termsAccepted === "true" || termsAccepted === true,

        images: imagePaths,

        videos: videoPaths,
      });

      await newUser.save();

      // =================================================
      // SEND EMAIL
      // =================================================

      let emailSent = false;

      try {
        const mailOptions = {
          from: `"Ink Convention" <${process.env.EMAIL_USER}>`,

          to: gmail,

          subject: "Registration & Entry Successful - Ink Convention",

          html: `
            <div
              style="
                padding:20px;
                font-family:Arial;
              "
            >

              <h2>
                Entry Received!
              </h2>

              <p>
                Your ID is
                <strong>
                  ${generatedEntryId}
                </strong>
              </p>

            </div>
          `,
        };

        await transporter.sendMail(mailOptions);

        emailSent = true;
      } catch (emailError) {
        console.error("Email dispatch failed:", emailError.message);
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
      console.error("Signup error:", error);

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

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,

      count: users.length,

      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: "Server error while fetching users.",

      error: error.message,
    });
  }
});

// =====================================================
// UPDATE ARTIST STATUS
// =====================================================

app.patch(
  "/api/admin/users/:id/status",

  async (req, res) => {
    try {
      const { status } = req.body;

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

      res.status(200).json({
        success: true,

        updated: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
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

      res.status(200).json({
        success: true,

        message: "User deleted successfully.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,

        message: "Server error while deleting user.",

        error: error.message,
      });
    }
  },
);

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
