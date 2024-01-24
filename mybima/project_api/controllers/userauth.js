var express = require("express");
var routes = express.Router();
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var database = require("../config/database");
var collName = "user";
var sha1 = require("sha1");
var jwt = require("jsonwebtoken");


routes.post("/", (req, res) => {
    // console.log(req.body);
    MongoClient.connect(database.dbUrl, (err, con) => {
        var db = con.db(database.dbName);
        console.log(db);
        db.collection(collName).find({ email: req.body.email }).toArray((err, result) => {
            // console.log(result);
            if (result.length == 1) // email id is correct
            {
                if (result[0].password == sha1(req.body.password)) // password is correct
                {
                    var token = jwt.sign(result[0], "my name is james");
                    // console.log(token);
                    res.status(200).send({ token: token });

                }
                else {
                    res.status(401).send({ success: false, type: 2 });
                }
            }
            else {
                res.status(401).send({ success: false, type: 1 });
            }
        })
    })
})



module.exports = routes;