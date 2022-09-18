var express = require("express");
const ProductController = require("../controllers/ProductController");
var router = express.Router();

router.get("/get_user_product_list", ProductController.productList);
router.get("/get_product_details/:id", ProductController.productDetail);
router.post("/add_new_product", ProductController.productAdd);
router.put("/update_product_details/:id", ProductController.productUpdate);
router.delete("/delete_product/:id", ProductController.productDelete);
module.exports = router;