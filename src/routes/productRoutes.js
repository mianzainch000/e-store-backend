const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const { createMulterUpload } = require("../middleware/multer");
const productController = require("../controllers/productsController");

router.post(
    "/createProduct",
    authenticate,
    createMulterUpload(),
    productController.validate("product"),
    productController.createProduct
);

router.get("/getProducts", productController.getProducts);

router.delete(
    "/deleteProduct/:id",
    authenticate,
    productController.deleteProduct
);

router.put(
    "/updateProduct/:id",
    authenticate,
    createMulterUpload(),
    productController.validate("product"),
    productController.updateProduct
);

module.exports = router;
