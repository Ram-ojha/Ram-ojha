var express = require("express");
var routes = express.Router();
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

var database = require("../config/database");
var collName = "student";

// localhost:3000/api/menu
routes.get("/", (req, res)=>{
    MongoClient.connect(database.dbUrl, (err, con)=>{
        var db = con.db(database.dbName);
        db.collection(collName).find().toArray((err, result)=>{
            res.send(result);
        })
    })
})

// localhost:3000/api/menu/23
routes.get("/:id", (req, res) => {
    var id = mongodb.ObjectId(req.params.id);
    MongoClient.connect(database.dbUrl, (err, con) => {
        var db = con.db(database.dbName);
        db.collection(collName).find({ _id : id }).toArray((err, result) => {
            res.send(result[0]);
        })
    })
})

// localhost:3000/api/menu
routes.post("/", (req, res) => {
    
    MongoClient.connect(database.dbUrl, (err, con) => {
        var db = con.db(database.dbName);
        db.collection(collName).insertOne(req.body,(err)=>{
            res.send({ success : true });
        });
    })
})


routes.put("/:id", (req, res) => {
    console.log(req.body);
    console.log(req.params.id);
    delete req.body._id;
    var id = mongodb.ObjectId(req.params.id);
    MongoClient.connect(database.dbUrl, (err, con) => {
        var db = con.db(database.dbName);
        db.collection(collName).updateMany({_id : id }, { $set : req.body }, ()=>{
            res.send({ success : true });
        })
    })
})
// menu collection id ------> name
// dishes collection --->menu delete ----> delete dishes
// menu delete ----> id


routes.delete("/:id", (req, res) => {
    var id = mongodb.ObjectId(req.params.id);
    MongoClient.connect(database.dbUrl, (err, con) => {
        var db = con.db(database.dbName);
        
        // find the menu by its id
        db.collection(collName).find({ _id : id }).toArray((err, result)=>{
            var obj = result[0];
            var menuname = obj.name;
            // delete the dishes by menu name
            db.collection("dishes").deleteMany({ menu : menuname }, ()=>{
                // delete menu by its id
                db.collection(collName).deleteMany({_id : id }, ()=>{
                    res.send({ success : true });
                })
            })
        })
    })
})






module.exports = routes;