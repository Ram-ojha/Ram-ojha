const mongoose = require ('mongoose');

const StudentSchema = new mongoose.Schema({

    firstname: String,
    lastname: String,
    address:String,
    email: String,
    phone: Number,
    gender:String,
    password:String
})



module.exports = mongoose.model('Student',StudentSchema)