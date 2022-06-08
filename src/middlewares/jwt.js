const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
	let token = req.header("Authorization");
	if (!token) {
		return res.status(401).send("Access Denied");
	}

	if (token.startsWith("Bearer ")) {
		// Remove Bearer from string
		token = token.slice(7, token.length).trimLeft();
	}
	try {
		const verified = jwt.verify(token, secret);
		req.user = verified;
		next();
	} catch (error) {
		res.status(401).send({ message: "Invalid Token" });
	}
};
