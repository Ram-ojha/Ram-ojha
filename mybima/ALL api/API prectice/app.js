const express = require("express");
const app = express();
const routed = require("./routes/data")
const mongoose = require("./config/database")
const path = require('path')
var bodyParser = require('body-parser')
var cors = require('cors')



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors())
// app.use(bodyParser)
// app.use(express.static(path.join(__dirname,"../ram/" +'dist/ram')))
app.use("/api", routed)


app.listen(3000, () => {
    console.log("surver runing");
})