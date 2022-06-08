var express = require("express");
const BookController = require("../controllers/BookController");
var router = express.Router();

//End Point Format 
// pri --> Router Type ( Private )
// book or user  --> Controller Type
// get or post or put or delete --> Method
// --> /api/pri/book/

router.get("/", BookController.bookList);
router.get("/:id", BookController.bookDetail);
router.post("/", BookController.bookStore);
router.put("/:id", BookController.bookUpdate);
router.delete("/:id", BookController.bookDelete);
module.exports = router;