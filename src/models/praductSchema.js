const mongoose = require("mongoose");
const { Schema } = mongoose;

const SizeSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
});

const ProductSchema = new mongoose.Schema({
    name: { type: String },
    price: { type: Number },
    discount: { type: Number },
    category: { type: String },
    shippingFee: { type: Number },
    description: { type: String },
    images: [String], // store image paths or URLs
    sizes: [[SizeSchema]], // array of arrays of sizes (per image)
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true,
    },
});

module.exports = mongoose.model("Product", ProductSchema);
