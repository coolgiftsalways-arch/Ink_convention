const express = require("express");
const mongoose = require("mongoose");
const Client = require("../models/Client");

const router = express.Router();

// =====================================================
// REGISTER CLIENT
// POST /api/clients
// POST /api/clients/register
// =====================================================

const registerClient = async (req, res) => {
  try {
    console.log("📥 Client data received:", req.body);

    const { name, gmail, email, phone, state, city } = req.body;

    const clientEmail = (gmail || email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !clientEmail || !phone || !state || !city) {
      return res.status(400).json({
        success: false,
        message: "Name, Gmail, phone, state and city are required.",
      });
    }

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10 digit phone number.",
      });
    }

    // =================================================
    // DATABASE CHECK
    // =================================================

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected. Please try again.",
      });
    }

    // =================================================
    // NORMALIZE DATA
    // =================================================

    const cleanName = name.trim();
    const cleanCity = city.trim();
    const cleanState = state.trim();

    // =================================================
    // CHECK EXISTING CLIENT
    // =================================================

    const existingClient = await Client.findOne({
      $or: [
        {
          gmail: clientEmail,
        },
        {
          phone: cleanPhone,
        },
      ],
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        message:
          "A client with this email or phone number is already registered.",
      });
    }

    // =================================================
    // CREATE CLIENT
    // =================================================

    const newClient = await Client.create({
      name: cleanName,
      gmail: clientEmail,
      phone: cleanPhone,
      state: cleanState,
      city: cleanCity,
    });

    console.log("✅ Client saved:", newClient._id);

    return res.status(201).json({
      success: true,
      message: "Client registered successfully!",
      client: {
        id: newClient._id,
        name: newClient.name,
        gmail: newClient.gmail,
        phone: newClient.phone,
        state: newClient.state,
        city: newClient.city,
      },
    });
  } catch (error) {
    console.error("❌ Client registration error:", error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while registering client.",
      error: error.message,
    });
  }
};

// IMPORTANT:
// ClientLogin.jsx sends POST /api/clients
router.post("/", registerClient);

// Optional alternative:
// POST /api/clients/register
router.post("/register", registerClient);

// =====================================================
// GET ALL CLIENTS
// GET /api/clients
// =====================================================

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected.",
      });
    }

    const clients = await Client.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error("❌ Fetch clients error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching clients.",
      error: error.message,
    });
  }
});

// =====================================================
// CLIENT LOGIN / FIND CLIENT
// POST /api/clients/login
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { gmail, email, phone } = req.body;

    const clientEmail = (gmail || email || "").trim().toLowerCase();

    const cleanPhone = phone ? String(phone).replace(/\D/g, "") : "";

    if (!clientEmail && !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected.",
      });
    }

    const conditions = [];

    if (clientEmail) {
      conditions.push({
        gmail: clientEmail,
      });
    }

    if (cleanPhone) {
      conditions.push({
        phone: cleanPhone,
      });
    }

    const client = await Client.findOne({
      $or: conditions,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client found successfully.",
      client,
    });
  } catch (error) {
    console.error("❌ Client login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while finding client.",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE CLIENT
// DELETE /api/clients/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected.",
      });
    }

    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Delete client error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting client.",
      error: error.message,
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
