var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	title: { 
		type: String, 
		required: true 
	},
	description: { 
		type: String, 
		required: true 
	},
	price: { 
		type: Number, 
		required: true 
	},
	user: { 
		type: Schema.ObjectId, 
		ref: "User", 
		required: true 
	},
}, { 
	timestamps: true 
});

module.exports = mongoose.model("Product", ProductSchema);