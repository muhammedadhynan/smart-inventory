
const express = require("express");

const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All logged-in users can view dashboard statistics
router.get("/", protect, getDashboardStats);

module.exports = router;
