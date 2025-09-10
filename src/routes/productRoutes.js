const express = require("express");
const router = express.Router();
const roleAdmin = require("../middleware/role");
const authenticate = require("../middleware/authenticate");
const { createMulterUpload } = require("../middleware/multer");
const productController = require("../controllers/productsController");

router.post(
    "/createProduct",
    authenticate,
    roleAdmin,
    createMulterUpload(),
    productController.validate("product"),
    productController.createProduct
);

router.get("/getProducts", productController.getProducts);

router.delete(
    "/deleteProduct/:id",
    authenticate,
    roleAdmin,
    productController.deleteProduct
);

router.get("/getProduct/:id", authenticate, productController.getProductById);

router.put(
    "/updateProduct/:id",
    authenticate,
    roleAdmin,
    createMulterUpload(),
    productController.updateProduct
);

module.exports = router;
