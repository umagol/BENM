var express = require("express");
const BookController = require("../controllers/BookController");
const userController = require("../controllers/UserController");
var router = express.Router();
const auth = require("../middlewares/jwt");

//End Point Format 
// pri --> Router Type ( Private )
// book or user  --> Controller Type
// get or post or put or delete --> Method
// --> /api/pri/book/

router.get("/user/get_user_data", auth, userController.getUser);

module.exports = router;