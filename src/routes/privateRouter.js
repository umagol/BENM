var express = require("express");
const ProductController = require("../controllers/ProductController");
var router = express.Router();

//End Point Format 
// pri --> Router Type ( Private )
// product or user  --> Controller Type
// get or post or put or delete --> Method
// --> /api/pri/product/

router.get("/", ProductController.productList);
router.get("/:id", ProductController.productDetail);
router.post("/", ProductController.productStore);
router.put("/:id", ProductController.productUpdate);
router.delete("/:id", ProductController.productDelete);
module.exports = router;