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

        // Cart item find karo
        const cartItem = await Cart.findOne({ _id: id, userId });
        if (!cartItem) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Product find karo
        const product = await Product.findById(cartItem.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // size quantity wapis add karo
        let sizeFound = false;
        for (let i = 0; i < product.sizes.length; i++) {
            for (let j = 0; j < product.sizes[i].length; j++) {
                if (product.sizes[i][j].name === cartItem.size) {
                    product.sizes[i][j].quantity += cartItem.quantity; // ✅ restore stock
                    sizeFound = true;
                }
            }
        }

        if (!sizeFound) {
            return res.status(400).json({ message: "Size not found in product" });
        }

        await product.save();

        // ab cart item delete karo
        await Cart.deleteOne({ _id: id, userId });

        res.status(200).json({ message: "Item removed and stock restored" });
    } catch (error) {
        console.error("removeCartItem error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Remove All Cart Items for current user
exports.removeAllCartItems = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Current user's cart items fetch karo
        const cartItems = await Cart.find({ userId });

        for (let cartItem of cartItems) {
            // Product fetch karo
            const product = await Product.findById(cartItem.productId);
            if (product) {
                // Size quantity restore karo
                for (let i = 0; i < product.sizes.length; i++) {
                    for (let j = 0; j < product.sizes[i].length; j++) {
                        if (product.sizes[i][j].name === cartItem.size) {
                            product.sizes[i][j].quantity += cartItem.quantity;
                        }
                    }
                }
                await product.save();
            }
        }

        // User ke saare cart items delete karo
        await Cart.deleteMany({ userId });

        res.status(200).json({ message: "All cart items removed and stock restored" });
    } catch (error) {
        console.error("removeAllCartItems error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
