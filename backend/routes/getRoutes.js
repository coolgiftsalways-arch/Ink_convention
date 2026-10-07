const express = require("express");

const {
  createGet,
  getAllGets,
  getGetById,
  updateGetStatus,
  deleteGet,
} = require("../Controller/getController");

const claimRoutes = require("./claimRoutes");

const router = express.Router();

const requireClaimSession = claimRoutes.requireClaimSession;

const requireGetEntryClaimSession = (req, res, next) => {
  if (typeof requireClaimSession !== "function") {
    console.error("❌ requireClaimSession is not exported from claimRoutes.js");

    return res.status(500).json({
      success: false,
      message: "Claim-session middleware is not configured correctly.",
    });
  }

  return requireClaimSession(req, res, next);
};

// CREATE GET ENTRY
router.post("/", requireGetEntryClaimSession, createGet);

// GET ALL
router.get("/", getAllGets);

// GET SINGLE
router.get("/:id", getGetById);

// UPDATE STATUS
router.patch("/:id/status", updateGetStatus);

// DELETE
router.delete("/:id", deleteGet);

module.exports = router;
