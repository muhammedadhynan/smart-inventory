
const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All customer routes require login
router.use(protect);

// Admin and manager can manage customers
router.use(authorizeRoles("admin", "manager"));

// Create customer
router.post("/", createCustomer);

// Get all customers
router.get("/", getCustomers);

// Get one customer
router.get("/:id", getCustomerById);

// Update customer
router.put("/:id", updateCustomer);

// Delete customer
router.delete("/:id", deleteCustomer);

module.exports = router;
