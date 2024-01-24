
var express = require("express");
var statecityrout = express();
// var mongoose = require(mongoose)
const state = require('../schema/state-city')

try {
    statecityrout.get("/state", async (req, res) => {
        const posts = await state.find()
        res.status(200)
        res.send(posts)

    });

}
catch (err) {
    console.log({ err: "not found" })
}





module.exports = statecityrout