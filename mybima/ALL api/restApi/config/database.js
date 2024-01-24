const mongoose = require("mongoose")
const mongo = mongoose.
    connect("mongodb+srv://ramojha:lHxmUHMvOiUKXvFK@realmcluster.f8qkz.mongodb.net/ojha?retryWrites=true&w=majority",

        // mongodb + srv://ramojha:<password>@realmcluster.f8qkz.mongodb.net/
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log('connect with serve')
        }).catch((err) => {
            console.log(err.message)
        })
module.exports = mongo