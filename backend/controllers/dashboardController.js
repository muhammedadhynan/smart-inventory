
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      lowStockProducts,
      inventoryValue,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),

      Customer.countDocuments({ isActive: true }),

      Order.countDocuments(),

      Product.find({
        isActive: true,
        $expr: { $lte: ["$quantity", "$minStockLevel"] },
      }).select("name sku quantity minStockLevel"),

      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$quantity", "$purchasePrice"] },
            },
          },
        },
      ]),

      Order.find()
        .populate("customer", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        lowStockCount: lowStockProducts.length,
        inventoryValue: inventoryValue[0]?.total || 0,
      },
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getDashboardStats };
