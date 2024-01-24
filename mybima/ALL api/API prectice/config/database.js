
const mongoose = require("mongoose")

const mongo = mongoose.connect("mongodb+srv://ramojha:lHxmUHMvOiUKXvFK@realmcluster.f8qkz.mongodb.net/ojha?retryWrites=true&w=majority",{

// const mongo = mongoose.connect("mongodb+srv://ramojha:yt7wn33TgrYSK6Sr@realmcluster.u8b8e.mongodb.net/test",{

    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("connected with server")
}).catch((err)=>{
console.log(err.message)
})

module.exports = mongoose