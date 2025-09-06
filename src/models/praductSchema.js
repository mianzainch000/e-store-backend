const mongoose = require("mongoose");
const { Schema } = mongoose;

const SizeSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
});

const ProductSchema = new mongoose.Schema({
    name: { type: String },
    price: { type: Number },
    description: { type: String },
    images: [String], // store image paths or URLs
    sizes: [[SizeSchema]], // array of arrays of sizes (per image)
    category: { type: String },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true,
    },
});

module.exports = mongoose.model("Product", ProductSchema);
