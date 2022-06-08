const User = require("../models/UserModel");
const apiResponse = require("../helpers/apiResponse");

/**
 * @api {get} /api/pri/user/:id Get User
 * @apiName GetUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Get User
 * @apiPermission Private
 */
exports.getUser = (req, res) => {
  try {
    User.findById(req.user._id).select("_id, firstName lastName").then((user) => {
        return res.status(200).send(user);
      })
      .catch((err) => {
        return res.status(500).send(err);
      });
  } catch (error) {
    res.status(500).send(error);
  }
};
