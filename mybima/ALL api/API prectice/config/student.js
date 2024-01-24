
const mongoose = require("mongoose")

const studemtschima = new mongoose.Schema({
    firstname: String,
    lastname: String,
    address: String,
    email: String,
    phone: Number,
    gender: String,
    password: String

})

module.exports = mongoose.model("student", studemtschima)
