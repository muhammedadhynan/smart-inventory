
const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All order routes require login
router.use(protect);

// Admin and manager can manage orders
router.use(authorizeRoles("admin", "manager"));

// Create order
router.post("/", createOrder);

// Get all orders
router.get("/", getOrders);

// Get one order
router.get("/:id", getOrderById);

// Update order and payment status
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
