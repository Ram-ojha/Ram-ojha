const mongoose = require ('mongoose');

const UserSchema = new mongoose.Schema({
    // _id:mongoose.Schema.Types.ObjectId,
    name:String,
    email: String,
    age:Number
})

module.exports = mongoose.model('User',UserSchema)