const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

const cartController = require("../controllers/cartController");

router.post("/addCart", authenticate, cartController.addToCart);

router.get("/getCart", authenticate, cartController.getCart);

router.delete("/deleteCart/:id", authenticate, cartController.removeCartItem);

router.delete("/removeAll", authenticate, cartController.removeAllCartItems);

module.exports = router;
