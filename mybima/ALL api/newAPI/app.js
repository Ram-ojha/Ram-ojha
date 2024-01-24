var express = require("express");
var mongoose = require("mongoose");
const app = express()
var router = require("./router/user")
var state_city = require("./router/state-city")
var User = require("./schema/user")
var cors = require("cors");
var dbms = require("./dbmsconnection")
var bodyParser = require('body-parser')



app.use(cors())
app.use(bodyParser.json())
app.use(express.json());


app.use("/Api", router)
app.use("/Api", state_city)
app.use("/Api", User)

app.get('*', function (req, res) {
    res.send('Sorry, this is an invalid URL.');
});


app.listen(5000, () => {
    console.log("surver running");

})