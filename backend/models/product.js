var mongoose = require("mongoose");
const { Schema } = mongoose;

const inventorySchema = new Schema({
  trackInventory: { type: Boolean, default: false },
  quantity: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
}, { _id: false });

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    categories: [{ type: Schema.Types.ObjectId, ref: "ProductCategory" }],
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    // stock is a convenience alias (mirrors inventory.quantity when tracked)
    stock: { type: Number, default: 0, min: 0 },
    inventory: { type: inventorySchema, default: () => ({}) },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

const productCategorySchema = new Schema(
  {
    name: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: {
      createdAt: "created_at",
    },
  },
);

const Product = mongoose.model("Product", productSchema);
const ProductCategory = mongoose.model(
  "ProductCategory",
  productCategorySchema,
);

module.exports = {
  Product,
  ProductCategory,
  productSchema,
  productCategorySchema,
};
