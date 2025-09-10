const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    // createdAt: { type: Date, default: Date.now, expires: 30 }
});

module.exports = mongoose.model("Cart", CartItemSchema);
