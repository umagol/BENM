var express = require("express");
const ProductController = require("../controllers/ProductController");

var router = express.Router();

// these all routers are access to every once

router.get("/get_all_product", ProductController.getAllProducts);

module.exports = router;