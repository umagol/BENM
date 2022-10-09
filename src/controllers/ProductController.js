const Product = require("../models/ProductModel");
const { body, validationResult } = require("express-validator");
const { check } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");

// Product Schema
function ProductData(data) {
	this.id = data._id;
	this.title = data.title;
	this.description = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}

/**
 * @description Get all users products with pagination (default limit 10) and sorting
 * @returns {Array of Objects} List of Products.
 */

exports.productList = async (req, res) => {
	const userId = req.query.userId || req.user._id;
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	try {
		const products = await Product.find({ user: userId }, "_id title description isbn createdAt")
			.populate("user", "firstName lastName email _id")
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit).limit(limit); 
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
	} catch (err) {
		//throw error in json response with status 500.
		return apiResponse.ErrorResponse(res, err);
	}
};

/**
 * @description Get all products list
 * @param {object} res
 */

exports.getAllProducts = async (req, res) => {
	try {
		// with pagination and sorting
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10; 
		const skip = (page - 1) * limit;
		const sort = req.query.sort || "createdAt";
		const query = {};
		const products = await Product.find(query, "_id title description isbn createdAt")
			.populate("user", "firstName lastName email _id")
			.sort(sort)
			.skip(skip)
			.limit(limit);
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
		//throw error in json response with status 500.
		return apiResponse.ErrorResponse(res, err);
	}
};

/**
 * @description Get product detail by id
 * @param {string} id
 * @returns {Object}
 */
exports.productDetail = async (req, res) => {
	const id = req.params.id || "";
	const userId = req.user._id;
	try {
		if(id === "") {
			return apiResponse.validationErrorWithData(
				res,
				"Validation Error.",
			);
		}
		const product = await Product.findOne(
			{ _id: id, user: userId },
			"_id title description isbn createdAt"
		);
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
	} catch (err) {
		//throw error in json response with status 500.
		return apiResponse.ErrorResponse(res, err);
	}
};

/**
 * @description Add new product
 * @param {string} title
 * @param {string} description
 * @param {integer} price
 * @returns {Object}
 */
exports.productAdd = [
	body("title", "Title is not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description is not be empty.").isLength({ min: 1 }).trim(),
	body("price", "Price is not valid.").isNumeric().isLength({ min: 1 }).trim(),
	check("*").escape(),
	async  (req, res) => {
		try {
			const errors = validationResult(req);
			const { title, description, price } = req.body;
			var reqProduct = new Product({
				title: title,
				user: req.user,
				price: price,
				description: description
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array()
				);
			} else {
				//Save product.
				const product = await reqProduct.save();
				if(product){
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(
						res,
						"Product add Success.",
						productData
					);
				} else	{
					return apiResponse.ErrorResponse(res, "Product add failed.");
				}
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];


/**
 * @description Update product by id
 * @param {string} title
 * @param {string} description
 * @returns {Object}
 */
exports.productUpdate = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("price", "Price must not be empty.").isLength({ min: 1 }).trim(),
	check("*").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			var reqProduct = new Product({
				title: req.body.title,
				description: req.body.description,
				isbn: req.body.isbn,
				_id: req.params.id,
			});
			const id = req.params.id || "";
			const userId = req.user._id;
			if (!errors.isEmpty() && id !== "") {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array()
				);
			} else {
				const product = await Product.findOne(
					{ _id: id, user: userId },
				);
				if (product !== null) {
					return apiResponse.notFoundResponse(
						res,
						"Product is not exists"
					);
				} else {
					//update product.
					const updateProduct = await Product.findByIdAndUpdate(id, reqProduct, {raw: true});
					if (updateProduct) {
						let productData = new ProductData(product);
						return apiResponse.successResponseWithData(
							res,
							"Product update Success.",
							productData
						);
					} else {
						return apiResponse.ErrorResponse(res, "Product update failed.");
					}
				}
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];


/**
 * @description Delete product by id
 * @param {string} id
 * @returns {Object}
 */
exports.productDelete = async (req, res) => {
	try {
		const id = req.params.id;
		const userId = req.user._id;
		if(id === "") {
			return apiResponse.validationErrorWithData(
				res,
				"Validation Error.",
			);
		}
		const product = await Product.findOne({ _id: id, user: userId });
		if (product) {
			//delete product.
			const deletedProduct = await Product.findByIdAndRemove(req.params.id);
			if (deletedProduct) {
				return apiResponse.successResponse(
					res,
					"Product delete Success."
				);
			} else {
				return apiResponse.ErrorResponse(res, "Product delete failed.");
			}
		} else {
			return apiResponse.notFoundResponse(
				res,
				"Product is not exists"
			);
		}
	} catch (err) {
		//throw error in json response with status 500.
		return apiResponse.ErrorResponse(res, err);
	}
};
