const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const paymentRoutes = require("./routes/payment");

const User = require("./models/user");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://inkconvention.com",
      "https://www.inkconvention.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

// Database Connection
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is missing from .env");
} else {
  mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log("Successfully connected to MongoDB Atlas!"))
    .catch((error) =>
      console.error("MongoDB connection failed:", error.message),
    );
}

// SMTP Setup
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

app.get("/", (req, res) => {
  res.status(200).send("Backend API is running successfully!");
});

app.use("/api/payment", paymentRoutes);
// ADMIN LOGIN ROUTE

app.post("/api/login", (req, res) => {
  const { gmail, password } = req.body;
  if (
    gmail === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res
      .status(200)
      .json({ success: true, message: "Login successful!" });
  }
  return res
    .status(401)
    .json({ success: false, message: "Invalid email or password." });
});

// SIGNUP / SUBMISSION ROUTE
app.post(
  "/api/signup",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 3 },
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
        return res
          .status(500)
          .json({ success: false, message: "Database not connected yet." });
      }

      const existingUser = await User.findOne({ gmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists!",
        });
      }

      const imagePaths =
        req.files && req.files.images
          ? req.files.images.map((file) => `uploads/${file.filename}`)
          : [];
      const videoPaths =
        req.files && req.files.videos
          ? req.files.videos.map((file) => `uploads/${file.filename}`)
          : [];

      if (imagePaths.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please upload at least 1 image of the tattoo.",
        });
      }

      const generatedEntryId = `INK26-${Math.floor(100000 + Math.random() * 900000)}`;

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

      let emailSent = false;
      try {
        const mailOptions = {
          from: `"Ink Convention" <${process.env.EMAIL_USER}>`,
          to: gmail,
          subject: "Registration & Entry Successful - Ink Convention",
          html: `<div style="padding: 20px; font-family: Arial;"><h2>Entry Received!</h2><p>Your ID is <strong>${generatedEntryId}</strong></p></div>`,
        };
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (emailError) {
        console.error("Email dispatch failed:", emailError.message);
      }

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

// GET ALL ENTRIES FOR DASHBOARD
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
      error: error.message,
    });
  }
});

// UPDATE APPLICATION STATUS ROUTE
app.patch("/api/admin/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, updated: updatedUser });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating status.",
      error: error.message,
    });
  }
});

// DELETE USER / ENTRY ROUTE
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting user.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
