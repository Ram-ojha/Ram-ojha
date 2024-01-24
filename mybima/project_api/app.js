var express = require("express");
var app = express();
var routes = require("./config/routes");
var cors = require("cors");
var fileupload = require("express-fileupload");

app.use(express.static(__dirname+"/assets"));

app.use(express.json());
app.use(express.urlencoded());
app.use(fileupload());

app.use(cors());

app.use(routes);


var port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log("server running with port : ", port)
})