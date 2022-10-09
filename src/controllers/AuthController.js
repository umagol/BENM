const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { check } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../utility/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const constant = require("../constants/mailTemplate");
/**
 * 
 * @description Register user.
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} password
 *
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("firstName").isAlpha("en-US", {ignore: " "}).isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isAlpha("en-US", {ignore: " "}).isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
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
						return Promise.reject({id:1, msg: "Your Email-id is already registered but not verified. Please check your email and verify your account."});
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
	async (req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				const { firstName, lastName, email, password } = req.body;
				//hash input password
				const hashPassword = await bcrypt.hash(password,10);
				// generate OTP for confirmation
				let otp = utility.randomNumber(4);
				// Create User object with escaped and trimmed data
				var user = new UserModel({
					firstName: firstName,
					lastName: lastName,
					email: email,
					password: hashPassword,
					confirmOTP: otp,
				});
				// Html email body
				let html = constant.otpMailTemplate(otp);
				// Send confirmation email
				mailer.send(
					email,
					"Confirm Account",
					html
				);
				// Save user.
				await user.save();
				let userData = {
					_id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email
				};
				return apiResponse.successResponseWithData(res,"Registration Success.", userData); 
			}
		} catch (error) {
			console.log(error);
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, error.message);
		}
	}];

/**
 * 
 * @description User login.
 * @param {string} email
 * @param {string} password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	check("email").escape(),
	check("password").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				const user = await UserModel.findOne({email : req.body.email});
				if (user) {
					//Check account confirmation.
					if(user.isConfirmed && user.status){
					//Compare given password with db's hash.
						const verifyPassword = await bcrypt.compare(req.body.password,user.password);
						if(verifyPassword){
							// Check User's account active or not.
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
							userData.token = await jwt.sign(jwtPayload, secret, jwtData);
							return apiResponse.successResponseWithData(res,"Login Success.", userData);
						} else {
							return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Account is not verified. Please verified your account.");
					}
				}else{
					return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
				}
			}
		} catch (error) {
			return apiResponse.ErrorResponse(res, error.message);
		}
	}];

/**
 * 
 * @description verify OTP
 * @param {string} email
 * @param {Integer} otp
 *
 * @returns {Object}
 */
exports.verifyAccount = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isNumeric().isLength({ min: 4 }).trim().withMessage("OTP must be specified."),
	check("email").escape(),
	check("otp").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				const { email, otp } = req.body;
				var query = {email : email};
				const user= await UserModel.findOne(query);
				if (user) {
					//Check already confirm or not.
					if(!user.isConfirmed){
						//Check account confirmation.
						if(user.confirmOTP == otp){
							//Update user as confirmed
							const updateUserOTPStatus = await UserModel.findOneAndUpdate(query, {
								isConfirmed: 1,
								confirmOTP: null 
							});
							if(!updateUserOTPStatus){
								return apiResponse.ErrorResponse(res, "Error in update user.");
							}							
							// Html email body
							let html = constant.accountIsConfirmedTemplate(email, user.firstName, user.lastName);
							// Send confirmation email
							mailer.send(
								email,
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
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * 
 * @description Resend verification OTP.
 * @param {string} email
 * 
 * @returns {Object}
 */
exports.resendVerificationOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	check("email").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				const user = await UserModel.findOne({email : req.body.email});
				if (user) {
					//Check already confirm or not.
					if(!user.isConfirmed){
						// Generate otp
						let otp = utility.randomNumber(4);
						// Html email body
						let html = constant.otpMailTemplate(otp);
						// Send confirmation email
						await mailer.send(
							req.body.email,
							"Confirm Account",
							html
						);
						// Update otp
						user.confirmOTP = otp;
						// Save user.
						await user.save();
						return apiResponse.successResponse(res,"new OTP sent.");
					}else{
						return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
					}
				}else{
					return apiResponse.unauthorizedResponse(res, "Specified email not found.");
				}
			}
		} catch (error) {
			return apiResponse.ErrorResponse(res, error.message);
		}
	}];

/**
 * 
 * @description Forgot Password.
 * @param {string} email
 * 
 * @returns {Object}
 */
exports.forgotPassword = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	check("email").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				const user = await UserModel.findOne({email : req.body.email});
				if (user) {
					// Generate otp
					let ForgotPasswordUUID =  await utility.createUUID();
					var host = req.get("host");
					const link = req.protocol+"://"+host+"/auth/reset-password/"+ForgotPasswordUUID+"/"+user._id;
					// Html email body
					let html = constant.forgotPasswordMailTemplate(link, user.firstName);
					// Send confirmation email
					await mailer.send(
						req.body.email,
						"Forgot Password",
						html
					);
					user.forgotPasswordId = ForgotPasswordUUID;
					// Save user.
					await user.save();
					return apiResponse.successResponse(res,"Forgot Password Link Sent.");
				}else{
					return apiResponse.unauthorizedResponse(res, "Email not found.");
				}
			}
		} catch (error) {
			return apiResponse.ErrorResponse(res, error.message);
		}
	}
];
/**
 * @description Reset Password.
 * @param {string} password
 * @param {string} confirmPassword
 * @param {string} forgotPasswordId
 * 
 * @returns {Object}
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
	body("uuid").isLength({ min: 1 }).trim().withMessage("id must be specified.")
		.isLength({ min: 6 }).withMessage("id is invalid"),
	body("userId").isLength({ min: 1 }).trim().withMessage("id must be specified.")
		.isLength({ min: 6 }).withMessage("userId is invalid"),
	check("password").escape(),
	check("confirmPassword").escape(),
	check("uuid").escape(),
	check("userId").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				const { password, uuid, userId } = req.body;
				const user = await UserModel.findOne({forgotPasswordId : uuid, _id: userId});
				if (user) {
					const hashPassword = await bcrypt.hash(password,10);
					user.password = hashPassword;
					user.forgotPasswordId = null;
					// Save user.
					await user.save();
					return apiResponse.successResponse(res,"Password reset successfully.");
				}else{
					return apiResponse.unauthorizedResponse(res, "Link is invalid, Please try with valid link.");
				}
			}
		} catch (error) {
			return apiResponse.ErrorResponse(res, error.message);
		}
	}
];