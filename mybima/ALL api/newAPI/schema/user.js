const mongoose = require('mongoose');

const MycollectionSchema = new mongoose.Schema({
    // _id:mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    age: Number,
    password: String
})

module.exports = mongoose.model('MycollectionSchema', MycollectionSchema)