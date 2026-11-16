
const mongoose = require("mongoose");
const Product = require("../models/Product");
const StockTransaction = require("../models/StockTransaction");

// Add stock to a product
const addStock = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { productId, quantity, transactionType, reference, notes } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    const type = transactionType || "purchase";

    if (!["purchase", "return"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock addition type",
      });
    }

    let updatedProduct;

    await session.withTransaction(async () => {
      const product = await Product.findOne({
        _id: productId,
        isActive: true,
      }).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity + quantity;

      product.quantity = newQuantity;
      await product.save({ session });

      await StockTransaction.create(
        [
          {
            product: product._id,
            transactionType: type,
            quantity,
            previousQuantity,
            newQuantity,
            reference: reference || "",
            notes: notes || "",
            performedBy: req.user._id,
          },
        ],
        { session }
      );

      updatedProduct = product;
    });

    return res.status(200).json({
      success: true,
      message: "Stock added successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(error.message === "Product not found" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// Remove stock from a product
const removeStock = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { productId, quantity, transactionType, reference, notes } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    const type = transactionType || "sale";

    if (!["sale", "adjustment"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock removal type",
      });
    }

    let updatedProduct;

    await session.withTransaction(async () => {
      const product = await Product.findOne({
        _id: productId,
        isActive: true,
      }).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      const previousQuantity = product.quantity;

      if (quantity > previousQuantity) {
        throw new Error("Insufficient stock available");
      }

      const newQuantity = previousQuantity - quantity;

      product.quantity = newQuantity;
      await product.save({ session });

      await StockTransaction.create(
        [
          {
            product: product._id,
            transactionType: type,
            quantity,
            previousQuantity,
            newQuantity,
            reference: reference || "",
            notes: notes || "",
            performedBy: req.user._id,
          },
        ],
        { session }
      );

      updatedProduct = product;
    });

    return res.status(200).json({
      success: true,
      message: "Stock removed successfully",
      product: updatedProduct,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Product not found") statusCode = 404;
    if (error.message === "Insufficient stock available") statusCode = 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  addStock,
  removeStock,
};
