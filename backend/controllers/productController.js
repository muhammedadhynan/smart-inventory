
const Product = require("../models/Product");
const Category = require("../models/Category");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      purchasePrice,
      sellingPrice,
      minStockLevel,
      unit,
    } = req.body;

    if (
      !name ||
      !sku ||
      !category ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required product details",
      });
    }

    if (
      !Number.isFinite(Number(purchasePrice)) ||
      !Number.isFinite(Number(sellingPrice)) ||
      Number(purchasePrice) < 0 ||
      Number(sellingPrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Prices must be valid non-negative numbers",
      });
    }

    const existingProduct = await Product.findOne({
      sku: sku.trim().toUpperCase(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product SKU already exists",
      });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Active category not found",
      });
    }

    const product = await Product.create({
      name,
      sku,
      description,
      category,
      purchasePrice,
      sellingPrice,
      minStockLevel,
      unit,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("category", "name")
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      purchasePrice,
      sellingPrice,
      minStockLevel,
      unit,
    } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (sku !== undefined) {
      const existingSKU = await Product.findOne({
        sku: sku.trim().toUpperCase(),
        _id: { $ne: product._id },
      });

      if (existingSKU) {
        return res.status(409).json({
          success: false,
          message: "Product SKU already exists",
        });
      }

      product.sku = sku;
    }

    if (category !== undefined) {
      const categoryExists = await Category.findOne({
        _id: category,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Active category not found",
        });
      }

      product.category = category;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (purchasePrice !== undefined) product.purchasePrice = purchasePrice;
    if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
    if (minStockLevel !== undefined) product.minStockLevel = minStockLevel;
    if (unit !== undefined) product.unit = unit;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE PRODUCT (SOFT DELETE)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
