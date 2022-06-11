const Product = require("../models/ProductModel");
const { body, validationResult } = require("express-validator");
const { check } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");

// Product Schema
function ProductData(data) {
	this.id = data._id;
	this.title = data.title;
	this.description = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}

/**
 * Product List.
 *
 * @returns {Object}
 */
exports.productList = function (req, res) {
	const userId = req.query.userId || req.user._id;
	try {
		Product.find({ user: userId }, "_id title description isbn createdAt")
		// Get only selected fields with populate
			.populate("user", "firstName lastName firstTimeLogin email _id")
			.then((products) => {
				if (products.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						products
					);
				} else {
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						[]
					);
				}
			}).catch((err) => {
				return apiResponse.ErrorResponse(res, err);
			});
	} catch (err) {
		//throw error in json response with status 500.
		return apiResponse.ErrorResponse(res, err);
	}
};

/**
 * Get all products.
 * @param {object} res
 */

exports.getAllProducts = async function (req, res) {
	try {
		// with pagination and sorting
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10; 
		const skip = (page - 1) * limit;
		const query = {};
		const options = {
			skip: skip,
			limit: limit,
		};
		const products = await Product.find(query, "_id title description isbn createdAt")
		// Get only selected fields with populate
			.populate("user", "firstName lastName firstTimeLogin email _id")
			.sort(options.sort)
			.skip(options.skip)
			.limit(options.limit);
		const total = await Product.countDocuments();
		const totalPages = Math.ceil(total / limit);
		const meta = {
			total: total,
			totalPages: totalPages,
			page: page,
			limit: limit,
		};

		if (products.length > 0) {
			return apiResponse.successResponseWithData(res, "Operation success", {
				products: products,
				meta: meta,
			});
		} else {
			return apiResponse.successResponseWithData(
				res,
				"Operation success",
				[]
			);
		}
	} catch (err) {
		console.log(err);
		//throw error in json response with status 500.
		return apiResponse.ErrorResponse(res, err);
	}
};

/**
 * Product Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.productDetail = [
	auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Product.findOne(
				{ _id: req.params.id, user: req.user._id },
				"_id title description isbn createdAt"
			).then((product) => {
				if (product !== null) {
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						productData
					);
				} else {
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						{}
					);
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

/**
 * Product store.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.productAdd = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.")
		.isLength({ min: 1 })
		.trim(),
	body("isbn", "ISBN must not be empty")
		.isLength({ min: 1 })
		.trim()
		.custom((value, { req }) => {
			return Product.findOne({ isbn: value, user: req.user._id }).then(
				(product) => {
					if (product) {
						return Promise.reject("Product already exist with this ISBN no.");
					}
				}
			);
		}),
	check("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var product = new Product({
				title: req.body.title,
				user: req.user,
				description: req.body.description,
				isbn: req.body.isbn,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array()
				);
			} else {
				//Save product.
				product.save(function (err) {
					if (err) {
						return apiResponse.ErrorResponse(res, err);
					}
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(
						res,
						"Product add Success.",
						productData
					);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

/**
 * Product update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.productUpdate = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.")
		.isLength({ min: 1 })
		.trim(),
	body("isbn", "ISBN must not be empty")
		.isLength({ min: 1 })
		.trim()
		.custom((value, { req }) => {
			return Product.findOne({
				isbn: value,
				user: req.user._id,
				_id: { $ne: req.params.id },
			}).then((product) => {
				if (product) {
					return Promise.reject("Product already exist with this ISBN no.");
				}
			});
		}),
	check("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var product = new Product({
				title: req.body.title,
				description: req.body.description,
				isbn: req.body.isbn,
				_id: req.params.id,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array()
				);
			} else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(
						res,
						"Invalid Error.",
						"Invalid ID"
					);
				} else {
					Product.findById(req.params.id, function (err, foundProduct) {
						if (foundProduct === null) {
							return apiResponse.notFoundResponse(
								res,
								"Product is not exists"
							);
						} else {
							//Check authorized user
							if (foundProduct.user.toString() !== req.user._id) {
								return apiResponse.unauthorizedResponse(
									res,
									"You are not authorized to do this operation."
								);
							} else {
								//update product.
								Product.findByIdAndUpdate(
									req.params.id,
									product,
									{},
									function (err) {
										if (err) {
											return apiResponse.ErrorResponse(res, err);
										} else {
											let productData = new ProductData(product);
											return apiResponse.successResponseWithData(
												res,
												"Product update Success.",
												productData
											);
										}
									}
								);
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

/**
 * Product Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.productDelete = [
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(
				res,
				"Invalid Error.",
				"Invalid ID"
			);
		}
		try {
			Product.findById(req.params.id, function (err, foundProduct) {
				if (foundProduct === null) {
					return apiResponse.notFoundResponse(
						res,
						"Product is not exists"
					);
				} else {
					//Check authorized user
					if (foundProduct.user.toString() !== req.user._id) {
						return apiResponse.unauthorizedResponse(
							res,
							"You are not authorized to do this operation."
						);
					} else {
						//delete product.
						Product.findByIdAndRemove(req.params.id, function (err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							} else {
								return apiResponse.successResponse(
									res,
									"Product delete Success."
								);
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];
