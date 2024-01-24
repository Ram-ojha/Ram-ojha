var express = require("express");
var routes = express.Router();
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

var database = require("../config/database");
var collName = "menu";

// :3000/api/menu_dish

routes.get("/", (req, res)=>{
    MongoClient.connect(database.dbUrl, (err, con)=>{
        var db = con.db(database.dbName);
        var allData = [];
        db.collection(collName).find().toArray((err, result)=>{
            // async(result)=>{
            //     result.forEach((x)=>{
            //         var result2 = await db.collection("dishes").find({ menu : result.menu }).toArray();
            //         result.items = result2;
            //         allData.push(result);
            //     })
            //     console.log(allData)
            // }
        })
    })
})





module.exports = routes;