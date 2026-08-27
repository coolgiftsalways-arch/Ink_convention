const express = require("express");
const Client = require("../models/Client");

const router = express.Router();

// =====================================================
// CREATE CLIENT
// POST /api/clients
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      gmail,
      phone,
      state,
      city,
    } = req.body;

    // Check required fields
    if (!name || !gmail || !phone || !state || !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required details.",
      });
    }

    // Check duplicate Gmail
    const existingClient = await Client.findOne({
      gmail: gmail.toLowerCase().trim(),
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists.",
      });
    }

    // Create client
    const newClient = new Client({
      name: name.trim(),
      gmail: gmail.toLowerCase().trim(),
      phone: phone.trim(),
      state: state.trim(),
      city: city.trim(),
    });

    await newClient.save();

    console.log("✅ New client registered:", newClient.gmail);

    return res.status(201).json({
      success: true,
      message: "Client registered successfully!",
      client: newClient,
    });

  } catch (error) {
    console.error("❌ Client registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while registering client.",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL CLIENTS
// GET /api/clients
// =====================================================

router.get("/", async (req, res) => {
  try {
    const clients = await Client.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });

  } catch (error) {
    console.error("❌ Error fetching clients:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching clients.",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE CLIENT
// GET /api/clients/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      client,
    });

  } catch (error) {
    console.error("❌ Error fetching client:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching client.",
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
    const deletedClient = await Client.findByIdAndDelete(
      req.params.id
    );

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
    console.error("❌ Error deleting client:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting client.",
      error: error.message,
    });
  }
});

module.exports = router;