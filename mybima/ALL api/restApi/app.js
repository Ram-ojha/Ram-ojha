
const express = require("express");
const app = express();
//const mongo = require('./config/database')
const user = require("./modal/userschema")
const rout = require('./config/routes')
const routes = require('./config/signup');
const rou = require('./config/fileuoload')
var cors = require('cors')
var bodyParser = require('body-parser')
const multer = require('multer')
const users = require('./modal/student')
const load = require('express-fileupload');

const mail = require('nodemailer')
const pdf = require("pdfkit");
const { path } = require("pdfkit");
const axios = require('axios');
const patt = require("path")
// console.log("dfff",pdf)
var fs = require("fs");
var http = require("http");
const { type } = require("express/lib/response");

app.use(cors())
app.use(load());
app.use(bodyParser.json())
app.use(express.json());


// app.use(express.static(patt.join(__dirname, "", "./dist/bima")))
app.use("/api", routes)
app.use("/api", rout)
app.use("/api", rou)
app.use("/api", users)


// app.post('/upload',(req,res)=>{
//     let file = req.files.upload
//     file.mv(__dirname+'/config/uoload/'+file.name,(err)=>{
//         res.send({success:"successfully uploaded"})
//     })

// })



port = process.env.PORT || 3000
app.listen(port, () => {

    console.log(`surver running ${port}`)
})



