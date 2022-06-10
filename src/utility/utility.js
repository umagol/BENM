const crypto = require("crypto"); // Added in: node v14.17.0
// var base64url = require('base64url');

exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.createUUID = function () {
	return crypto.randomBytes(10).toString("hex");
};