const mongoose = require("mongoose");

const stdcodeschima = new mongoose.Schema({
    name: String,
    dial_code: String,
    code: String


})

module.exports = mongoose.model("STDCode", stdcodeschima)