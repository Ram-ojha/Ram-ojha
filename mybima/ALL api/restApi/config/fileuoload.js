const express = require("express");
const userschema = require("../modal/userschema");
const router = express.Router();
const User = require("../modal/userschema")




router.post('/upload',  (req, res) => {
    let file = req.files.upload
    console.log("------------->", file)
    let filePath = __dirname + '/uoload/' + file.name
    file.mv(filePath).then(async(result )=> {
        console.log(filePath)
        try {
        let userData =  User({img:filePath})
         let reultUser=await userData.save()
            if (!reultUser) {
                console.log(reultUser)
                return;
            }
            console.log(reultUser)
            res.send({ success: "successfully uploaded" })
        } catch (err) {
            console.log(err)
        }


        // console.log(__dirname);
    }).catch(err => {
        console.log(err)
    })


})

module.exports = router