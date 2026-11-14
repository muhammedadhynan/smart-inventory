
const express = require("express");

const { addStock, removeStock } = require("../controllers/stockController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All stock routes require login
router.use(protect);

// Only admin and manager can manage stock
router.use(authorizeRoles("admin", "manager"));

// Add stock
router.post("/add", addStock);

// Remove stock
router.post("/remove", removeStock);

module.exports = router;
