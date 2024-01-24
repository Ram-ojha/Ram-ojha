
var express = require("express");
const student = require("../schema/student");
var rout = express();
// var mongoose = require(mongoose)
const Student = require('../schema/student')
const MycollectionSchema = require("../schema/user")

rout.get("/student", async (req, res) => {
    const posts = await MycollectionSchema.find()
    res.send(posts)

});


rout.post("/signup", async (req, res) => {
    let olduser = await Student.findOne({ email: req.body.email })


    if (olduser) {
        return res.status(400).send("this user alrealy register")
    } else {
        const data = new MycollectionSchema({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            password: req.body.password
        });

        await data.save().then((result) => {
            res.status(201).json(result)
        }).catch(err => {
            console.log(err.message);
        })
    }
})

rout.post("/login", (req, res) => {

    let newUser = {};

    newUser = req.body.email;
    newpassword = req.body.password

    MycollectionSchema.findOne({ email: req.body.email })
        .then(u => {

            if (!u) {
                res.status(400).send("user not exist")
            } else {
                if (u.password == newpassword && u.email == newUser) {
                    res.status(200).send("successfully login")
                } else {
                    res.status(400).send("user name and password does nat match")
                }
            }
        }).catch(err => {
            console.log("Error is ", err.message);
        })
})



module.exports = rout
