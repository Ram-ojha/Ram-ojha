var express = require("express");
var routes = express.Router();
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var database = require("../config/database");
var sha1 = require("sha1");


// :3000/api/user/signup
routes.post("/signup", (req, res)=>{

    delete req.body.re_password;

    req.body.password = sha1(req.body.password);

    MongoClient.connect(database.dbUrl, (err, con)=>{
        var db = con.db(database.dbName);
        db.collection("user").insertOne(req.body, ()=>{
            res.send({ success : true });
        })
    })
})

module.exports = routes;