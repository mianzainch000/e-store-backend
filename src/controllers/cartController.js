const Cart = require("../models/cartSchema");
const Product = require("../models/praductSchema");

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, sizeName, quantity } = req.body;
        const userId = req.user.userId;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // check size stock
        let sizeFound = false;
        for (let i = 0; i < product.sizes.length; i++) {
            for (let j = 0; j < product.sizes[i].length; j++) {
                if (product.sizes[i][j].name === sizeName) {
                    sizeFound = true;
                    if (product.sizes[i][j].quantity < quantity) {
                        return res.status(400).json({
                            message: `Only ${product.sizes[i][j].quantity} left in stock`,
                        });
                    }

                    // stock reduce
                    product.sizes[i][j].quantity -= quantity;
                }
            }
        }

        if (!sizeFound) {
            return res.status(400).json({ message: "Invalid size" });
        }

        await product.save();

        // check if already in cart → update
        let cartItem = await Cart.findOne({ productId, size: sizeName, userId });
        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = new Cart({
                productId,
                size: sizeName,
                quantity,
                price: product.price,
                image: product.images[0], // pehli image save kar rahe h
                userId,
            });
            await cartItem.save();
        }

        res.status(201).json({
            message: "Added to cart successfully",
            cartItem,
        });
    } catch (error) {
        console.error("addToCart error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Cart Items
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.find({ userId }).populate("productId");
        res.status(200).json({ cart });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Remove Cart Item
exports.removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deleted = await Cart.deleteOne({ _id: id, userId });
        if (deleted.deletedCount > 0) {
            return res.status(200).json({ message: "Item removed" });
        }
        res.status(404).json({ message: "Item not found" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
