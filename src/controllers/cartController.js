const Cart = require("../models/cartSchema");
const Product = require("../models/praductSchema");

exports.addToCart = async (req, res) => {
    try {
        const { productId, sizeName, quantity } = req.body;
        const userId = req.user.userId;

        // product find
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // size find
        const size = product.sizes.flat().find((s) => s.name === sizeName);
        if (!size) return res.status(400).json({ message: "Invalid size" });

        // stock check
        if (size.quantity < quantity) {
            return res
                .status(400)
                .json({ message: `Only ${size.quantity} left in stock` });
        }

        // stock reduce
        size.quantity -= quantity;
        await product.save();

        // cart update or create
        let cartItem = await Cart.findOne({ productId, size: sizeName, userId });

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = new Cart({
                productId,
                size: sizeName,
                quantity,
                price: product.price,
                image: product.images[0],
                userId,
            });
        }

        await cartItem.save();

        res.status(201).json({
            message: "Added to cart successfully",
            cartItem,
        });
    } catch (error) {
        console.error("addToCart error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.find({ userId }).populate("productId");
        res.status(200).json({ cart });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Cart item find
        const cartItem = await Cart.findOne({ _id: id, userId });

        if (!cartItem)
            return res.status(404).json({ message: "Item not found in cart" });

        // Product find
        const product = await Product.findById(cartItem.productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Size restore
        const size = product.sizes.flat().find((s) => s.name === cartItem.size);
        if (!size)
            return res.status(400).json({ message: "Size not found in product" });

        size.quantity += cartItem.quantity; // ✅ stock restore
        await product.save();

        // Cart item delete
        await Cart.deleteOne({ _id: id, userId });

        res.status(200).json({ message: "Item removed and stock restored" });
    } catch (error) {
        console.error("removeCartItem error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.removeAllCartItems = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Current user's cart items fetch
        const cartItems = await Cart.find({ userId });

        for (const cartItem of cartItems) {
            const product = await Product.findById(cartItem.productId);
            if (!product) continue;

            // size restore with flat + find
            const size = product.sizes.flat().find((s) => s.name === cartItem.size);
            if (size) {
                size.quantity += cartItem.quantity;
                await product.save();
            }
        }

        // Delete all cart items for the user
        await Cart.deleteMany({ userId });

        res
            .status(200)
            .json({ message: "All cart items removed and stock restored" });
    } catch (error) {
        console.error("removeAllCartItems error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
