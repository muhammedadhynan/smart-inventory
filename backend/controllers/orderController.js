
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const StockTransaction = require("../models/StockTransaction");

// Create a new order
const createOrder = async (req, res) => {
  let session;

  try {
    const { customerId, items, notes } = req.body;

    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item needs a valid product ID and positive quantity",
        });
      }
    }

    session = await mongoose.startSession();

    let createdOrder;

    await session.withTransaction(async () => {
      const customer = await Customer.findOne({
        _id: customerId,
        isActive: true,
      }).session(session);

      if (!customer) {
        throw new Error("Customer not found");
      }

      const orderItems = [];
      const stockLogs = [];
      let totalAmount = 0;

      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          isActive: true,
        }).session(session);

        if (!product) {
          throw new Error("Product not found: " + item.productId);
        }

        if (product.quantity < item.quantity) {
          throw new Error("Insufficient stock for " + product.name);
        }

        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity - item.quantity;
        const unitPrice = product.sellingPrice;
        const subtotal = unitPrice * item.quantity;

        product.quantity = newQuantity;
        await product.save({ session });

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });

        stockLogs.push({
          product: product._id,
          transactionType: "sale",
          quantity: item.quantity,
          previousQuantity,
          newQuantity,
          reference: "Customer order",
          notes: notes || "",
          performedBy: req.user._id,
        });

        totalAmount += subtotal;
      }

      const orderNumber = "ORD-" + Date.now();

      const orders = await Order.create(
        [
          {
            orderNumber,
            customer: customer._id,
            items: orderItems,
            totalAmount,
            notes: notes || "",
            createdBy: req.user._id,
            statusHistory: [
              {
                orderStatus: "pending",
                paymentStatus: "pending",
                changedBy: req.user._id,
              },
            ],
          },
        ],
        { session }
      );

      await StockTransaction.create(stockLogs, { session });

      createdOrder = orders[0];
    });

    const order = await Order.findById(createdOrder._id)
      .populate("customer", "name email phone")
      .populate("items.product", "name sku");

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    const statusCode =
      error.message === "Customer not found" ||
      error.message.startsWith("Product not found")
        ? 404
        : error.message.startsWith("Insufficient stock")
          ? 400
          : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email phone")
      .populate("items.product", "name sku")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one order
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("items.product", "name sku")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const allowedOrderStatuses = [
      "pending",
      "processing",
      "completed",
      "cancelled",
    ];

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    if (
      orderStatus !== undefined &&
      !allowedOrderStatuses.includes(orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    if (
      paymentStatus !== undefined &&
      !allowedPaymentStatuses.includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    if (orderStatus === undefined && paymentStatus === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide an order status or payment status",
      });
    }

    if (orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order cancellation and stock restoration are not implemented yet",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const nextOrderStatus = orderStatus ?? order.orderStatus;
    const nextPaymentStatus = paymentStatus ?? order.paymentStatus;
    const statusChanged =
      nextOrderStatus !== order.orderStatus ||
      nextPaymentStatus !== order.paymentStatus;

    if (orderStatus !== undefined) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus !== undefined) {
      order.paymentStatus = paymentStatus;
    }

    if (statusChanged) {
      order.statusHistory.push({
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        changedBy: req.user._id,
        changedAt: new Date(),
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
