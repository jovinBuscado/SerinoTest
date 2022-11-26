const { Schema, model } = require("mongoose");

var data = new Schema({
	treasure_id: Number,
	amount: Number
},{collection:"money_values"});

module.exports = model("money_values",data);