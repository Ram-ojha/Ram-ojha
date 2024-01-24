const mongoose = require('mongoose');

const StudentsSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    address: String,
    email: String,
    phone: Number,
    gender: String,
    password: Number
})

module.exports = mongoose.model('Students', StudentsSchema)