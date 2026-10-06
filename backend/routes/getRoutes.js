const express = require("express");

const {
  createGet,
  getAllGets,
  getGetById,
  updateGetStatus,
  deleteGet,
} = require("../Controller/getController");

const router = express.Router();

/* =========================================================
   CREATE GET ENTRY
   POST /api/get
========================================================= */

router.post("/", createGet);

/* =========================================================
   GET ALL ENTRIES
   GET /api/get
========================================================= */

router.get("/", getAllGets);

/* =========================================================
   GET SINGLE ENTRY
   GET /api/get/:id
========================================================= */

router.get("/:id", getGetById);

/* =========================================================
   UPDATE STATUS
   PATCH /api/get/:id/status
========================================================= */

router.patch("/:id/status", updateGetStatus);

/* =========================================================
   DELETE ENTRY
   DELETE /api/get/:id
========================================================= */

router.delete("/:id", deleteGet);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;
