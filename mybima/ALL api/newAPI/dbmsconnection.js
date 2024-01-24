var mongoose = require("mongoose");

mongoose.
    connect("mongodb+srv://ramojha:lHxmUHMvOiUKXvFK@realmcluster.f8qkz.mongodb.net/ojha?retryWrites=true&w=majority",
        { useNewUrlParser: true })
    .then(() => {

        console.log('connect with serve')
    }).catch((err) => {
        console.log(err)
    })

module.exports = mongoose