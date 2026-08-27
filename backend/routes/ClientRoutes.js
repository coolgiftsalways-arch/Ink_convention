const express = require("express");
const Client = require("../models/Client");

const router = express.Router();

// =====================================================
// CLIENT REGISTRATION
// POST /api/clients
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      gmail,
      phone,
      city,
      state,
    } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (
      !name ||
      !gmail ||
      !phone ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all client details.",
      });
    }

    // -----------------------------------------------
    // CHECK DATABASE CONNECTION
    // -----------------------------------------------

    if (Client.db.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: "Database not connected yet.",
      });
    }

    // -----------------------------------------------
    // NORMALIZE DATA
    // -----------------------------------------------

    const cleanName = name.trim();
    const cleanGmail = gmail.toLowerCase().trim();
    const cleanPhone = phone.trim();
    const cleanCity = city.trim();
    const cleanState = state.trim();

    // -----------------------------------------------
    // CHECK EXISTING CLIENT
    // -----------------------------------------------

    const existingClient = await Client.findOne({
      gmail: cleanGmail,
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists.",
      });
    }

    // -----------------------------------------------
    // CREATE CLIENT
    // -----------------------------------------------

    const newClient = new Client({
      name: cleanName,
      gmail: cleanGmail,
      phone: cleanPhone,
      city: cleanCity,
      state: cleanState,
    });

    await newClient.save();

    console.log(
      "✅ New client registered:",
      newClient.gmail
    );

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Client registered successfully!",
      client: newClient,
    });

  } catch (error) {
    console.error(
      "❌ Client registration error:",
      error
    );

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

    console.log(
      `📋 Sending ${clients.length} clients to admin`
    );

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });

  } catch (error) {
    console.error(
      "❌ Fetch clients error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error while fetching clients.",
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
    const deletedClient =
      await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    console.log(
      "🗑️ Client deleted:",
      deletedClient.gmail
    );

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully.",
    });

  } catch (error) {
    console.error(
      "❌ Delete client error:",
      error
    );

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