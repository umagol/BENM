const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { check } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const constant = require("../helpers/constants");
/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({email : value}).then((user) => {
				if (user) {	
					if(user.isConfirmed){
						// User already exists.
						return Promise.reject({id:0, msg: "E-mail already in used."});  
					}else{
						// Your email is not verified.
						return Promise.reject({id:1, msg: "Your Email-id is not verified."});
					}
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	// Sanitize fields.
	check("firstName").escape(),
	check("lastName").escape(),
	check("email").escape(),
	check("password").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					var user = new UserModel(
						{
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							email: req.body.email,
							password: hash,
							confirmOTP: otp,
						}
					);
					// Html email body
					let html = constant.otpMailTemplate(otp);
					// Send confirmation email
					mailer.send(
						req.body.email,
						"Confirm Account",
						html
					);
					// INFO: why I commented this? because, mail part is very slow and it will take time to send mail.
					// .then(function(){
					// Save user.
					user.save(function (err) {
						if (err) { return apiResponse.ErrorResponse(res, err); }
						let userData = {
							_id: user._id,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email
						};
						return apiResponse.successResponseWithData(res,"Registration Success.", userData);
					});
					// }).catch(err => {
					// 	console.log(err);
					// 	return apiResponse.ErrorResponse(res,err);
					// }) ;
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	check("email").escape(),
	check("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel.findOne({email : req.body.email}).then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password,user.password,function (err,same) {
							if(same){
								//Check account confirmation.
								if(user.isConfirmed){
									// Check User's account active or not.
									if(user.status) {
										let userData = {
											_id: user._id,
											firstName: user.firstName,
											lastName: user.lastName,
											email: user.email,
										};
										//Prepare JWT token for authentication
										const jwtPayload = userData;
										const jwtData = {
											expiresIn: process.env.JWT_TIMEOUT_DURATION,
										};
										const secret = process.env.JWT_SECRET;
										//Generated JWT token with Payload and secret.
										userData.token = jwt.sign(jwtPayload, secret, jwtData);
										return apiResponse.successResponseWithData(res,"Login Success.", userData);
									}else {
										return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
									}
								}else{
									return apiResponse.unauthorizedResponse(res, "Account is not verified. Please verified your account.");
								}
							}else{
								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
							}
						});
					}else{
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
	check("email").escape(),
	check("otp").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							//Check account confirmation.
							if(user.confirmOTP == req.body.otp){
								//Update user as confirmed
								UserModel.findOneAndUpdate(query, {
									isConfirmed: 1,
									confirmOTP: null 
								}).catch(err => {
									return apiResponse.ErrorResponse(res, err);
								});
								// Html email body
								let html = constant.accountIsConfirmedTemplate(req.body.email, user.firstName, user.lastName);
								// Send confirmation email
								mailer.send(
									req.body.email,
									"Your Account is Verified",
									html
								);
								return apiResponse.successResponse(res,"Account is verified successfully.");
							}else{
								return apiResponse.unauthorizedResponse(res, "Invalid OTP.");
							}
						}else{
							return apiResponse.unauthorizedResponse(res, "Account is already verified.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Resend Confirm otp.
 *
 * @param {string} email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	check("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							// Generate otp
							let otp = utility.randomNumber(4);
							// Html email body
							let html = constant.otpMailTemplate(otp);
							// Send confirmation email
							mailer.send(
								req.body.email,
								"Confirm Account",
								html
							).then(function(){

								user.isConfirmed = 0;
								user.confirmOTP = otp;
								// Save user.
								user.save(function (err) {
									if (err) { return apiResponse.ErrorResponse(res, err); }
									return apiResponse.successResponse(res,"Confirm otp sent.");
								});
							});
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Forgot Password.
 * 
 * @param {string} email
 *
 * @returns {Object}
 */
exports.forgotPassword = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	check("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						// Generate otp
						let ForgotPasswordUUID = utility.createUUID();
						var host = req.get("host");
						const link = req.protocol+"://"+host+"/auth/reset-password/"+ForgotPasswordUUID+"/"+user._id;
						// Html email body
						let html = constant.forgotPasswordMailTemplate(link);
						// Send confirmation email
						mailer.send(
							req.body.email,
							"Forgot Password",
							html
						).then(function(){
							user.forgotPasswordId = ForgotPasswordUUID;
							// Save user.
							user.save(function (err) {
								if (err) { return apiResponse.ErrorResponse(res, err); }
								return apiResponse.successResponse(res,"Forgot Password Link Sent.");
							});
						});
					}else{
						return apiResponse.unauthorizedResponse(res, "Email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
/**
 * Reset Password.
 * 
 */
exports.resetPassword = [
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified.")
		.isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
	body("confirmPassword").isLength({ min: 1 }).trim().withMessage("Confirm Password must be specified.")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Password confirmation does not match password.");
			}
			return value;
		}),
	check("password").escape(),
	check("confirmPassword").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {
					_id : req.body.id,
					forgotPasswordId : req.body.token
				};
				UserModel.findOne(query).then(user => {
					if (user) {
						bcrypt.hash(req.body.password,10,function(err, hash) {
							user.password = hash;
							user.forgotPasswordId = "";
							// Save user.
							user.save(function (err) {
								if (err) { return apiResponse.ErrorResponse(res, err); }
								return apiResponse.successResponse(res,"Password reset successfully.");
							});
						});
					}else{
						return apiResponse.unauthorizedResponse(res, "Link is invalid, Please try with valid link.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];