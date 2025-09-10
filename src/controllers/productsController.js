require("dotenv").config();
const Product = require("../models/praductSchema");
const { check, validationResult, body } = require("express-validator");

exports.createProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorMsg = errors.array()[0].msg;
        return res.status(400).json({ errors: errorMsg });
    }

    const user = req.user;
    try {
        const { name, price, discount, description, category, shippingFee } =
            req.body;
        const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];

        const imagePaths = req.files.map((file) => file.path);

        const product = new Product({
            name,
            price,
            discount,
            description,
            images: imagePaths,
            sizes,
            category,
            shippingFee,
            userId: user.userId,
            // userId key get in models as a reference
        });

        await product.save();

        res.status(201).json({ message: "Product created successfully!", product });
    } catch (error) {
        console.error("createProduct error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        // userId key get in models as a reference
        if (products.length > 0) {
            return res.status(200).send({ products });
        } else {
            res.status(404).send({ message: "No Record Found" });
        }
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Something went wrong, please try again." });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.deleteOne({
            _id: id,
            userId: req.user.userId,
        });

        if (deletedProduct.deletedCount > 0) {
            return res.status(200).send({
                message: "Product deleted successfully",
                productId: id, // You can also return the product ID that was deleted
            });
        } else {
            return res.status(404).send({
                message: "Product not found",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error." });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("getProductById error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorMsg = errors.array()[0].msg;
        return res.status(400).json({ errors: errorMsg });
    }
    try {
        const { id } = req.params;
        const { name, price, discount, description, category, shippingFee } =
            req.body;
        const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
        const imageOrder = req.body.imageOrder
            ? JSON.parse(req.body.imageOrder)
            : [];

        const product = await Product.findOne({ _id: id, userId: req.user.userId });

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.discount = discount || product.discount;
        product.description = description || product.description;
        product.sizes = sizes.length > 0 ? sizes : product.sizes;
        product.category = category || product.category;
        product.shippingFee = shippingFee || product.shippingFee;

        // Build updated images array in exact order
        let updatedImages = [];
        let newFileCounter = 0;

        imageOrder.forEach((item) => {
            if (item.startsWith("newFile:")) {
                // Pick the correct uploaded file in the same order they were appended
                const file = req.files?.[newFileCounter];
                if (file) {
                    updatedImages.push(file.path.replace(/\\/g, "/"));
                }
                newFileCounter++;
            } else {
                // Remove domain if present
                const PORT = process.env.PORT;
                updatedImages.push(
                    item.replace(`http://localhost:${PORT}/`, "").replace(/\\/g, "/")
                );
            }
        });

        product.images = updatedImages;
        await product.save();

        return res.status(200).json({
            message: "Product updated successfully!",
            product,
        });
    } catch (error) {
        console.error("updateProduct error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.validate = (method) => {
    switch (method) {
        case "product": {
            return [
                // Name validation
                check("name").notEmpty().withMessage("Name is required"),

                // Price validation
                check("price")
                    .notEmpty()
                    .withMessage("Price is required")
                    .isFloat({ min: 0.01 })
                    .withMessage("Price must be greater than 0"),

                // Category validation
                check("category").notEmpty().withMessage("Category is required"),

                // Image validation
                body("images").custom((value, { req }) => {
                    if (!req.files || req.files.length === 0) {
                        throw new Error("At least one image is required");
                    }
                    return true;
                }),
            ];
        }
    }
};
