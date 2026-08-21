const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

require("dotenv").config();

const User = require("./models/User");

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

app.use(
  express.urlencoded({
    extended: true,
  }),
);

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
    const safeName = file.originalname.replace(/\s+/g, "-");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
});

console.log("------------------------------------------");
console.log("Environment Configuration");
console.log("------------------------------------------");

console.log("MongoDB URI loaded:", !!process.env.MONGO_URI);

console.log("Email user:", process.env.EMAIL_USER);

console.log("Email password loaded:", !!process.env.EMAIL_PASS);

console.log("------------------------------------------");

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

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("ERROR: EMAIL_USER or EMAIL_PASS is missing from .env");
}

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",

  port: 465,

  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Hostinger SMTP connection failed:", error.message);
  } else {
    console.log("Hostinger SMTP server is ready!");
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Backend API is running successfully!");
});

// ==========================================
// ADMIN LOGIN ROUTE
// ==========================================
app.post("/api/login", (req, res) => {
  const { gmail, password } = req.body;

  const validEmail = process.env.ADMIN_EMAIL;
  const validPass = process.env.ADMIN_PASSWORD;

  if (gmail === validEmail && password === validPass) {
    return res.status(200).json({
      success: true,
      message: "Login successful!",
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }
});

app.get("/api/test-email", async (req, res) => {
  try {
    const recipient = req.query.to || process.env.EMAIL_USER;

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address.",
      });
    }

    const mailOptions = {
      from: `"Ink Convention" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: "Test Email - Ink Convention",
      text: "Hostinger SMTP is working successfully!",
      html: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 30px;"><div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 12px;"><h2>Ink Convention Email Test</h2><p>Your Hostinger SMTP configuration is working correctly.</p></div></body></html>`,
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${recipient}`,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("HOSTINGER EMAIL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email.",
      error: error.message,
    });
  }
});

// ==========================================
// SIGNUP ROUTE (Updated for First/Last Name & Addresses)
// ==========================================
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
      console.log("------------------------------------------");
      console.log("New signup request received");
      console.log("------------------------------------------");

      const {
        username,
        firstName,
        lastName,
        delayNumber,
        gmail,
        address1,
        address2,
        city,
        state,
      } = req.body;

      // Validation check matching frontend fields
      if (
        !username ||
        !firstName ||
        !lastName ||
        !gmail ||
        !address1 ||
        !city ||
        !state
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required details.",
        });
      }

      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({
          success: false,
          message: "Database not connected yet.",
        });
      }

      const existingUser = await User.findOne({
        gmail,
      });

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

      // Flexible file check
      if (imagePaths.length === 0 || imagePaths.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Please upload between 1 and 5 images.",
        });
      }

      if (videoPaths.length === 0 || videoPaths.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Please upload between 1 and 3 videos.",
        });
      }

      const newUser = new User({
        username,
        firstName,
        lastName,
        delayNumber,
        gmail,
        address1,
        address2: address2 || "",
        city,
        state,
        images: imagePaths,
        videos: videoPaths,
      });

      await newUser.save();

      console.log("User successfully saved:", newUser._id);

      let emailSent = false;

      try {
        const mailOptions = {
          from: `"Ink Convention" <${process.env.EMAIL_USER}>`,
          to: gmail,
          subject: "Registration Successful - Ink Convention",
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif;">
              <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 14px; overflow: hidden;">
                <div style="background: #111111; padding: 35px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Ink Convention</h1>
                  <p style="color: #cccccc;">Registration Confirmation</p>
                </div>
                <div style="padding: 35px;">
                  <h2>Registration Successful 🎉</h2>
                  <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
                  <p>Your registration has been successfully submitted.</p>
                  <div style="background: #f7f7f7; padding: 20px; border-radius: 10px; margin: 25px 0;">
                    <h3>Registration Details</h3>
                    <p><strong>Username:</strong> @${username}</p>
                    <p><strong>Email:</strong> ${gmail}</p>
                    <p><strong>Address:</strong> ${address1}${address2 ? `, ${address2}` : ""}</p>
                    <p><strong>Location:</strong> ${city}, ${state}</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log("Confirmation email sent successfully to:", gmail);
      } catch (emailError) {
        console.error("Hostinger email dispatch failed:", emailError.message);
      }

      return res.status(201).json({
        success: true,
        message: emailSent
          ? "User registered successfully and confirmation email sent!"
          : "User registered successfully, but confirmation email could not be sent.",
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
    console.error("Error fetching users:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
      error: error.message,
    });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

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
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting user.",
      error: error.message,
    });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log("------------------------------------------");
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("------------------------------------------");
});
