const express = require("express");
const router = express.Router();
const student = require("../modal/studentschema")
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { status } = require("express/lib/response");



router.post("/signup", async (req, res) => {
    console.log("ram");

    // let user = await student.findOne({ email: req.body.email })

    // console.log(user);
    // if (user) {
    //     return res.status(400).send('That user already exisits!');
    // } else {

    const studentdata = new student({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        password: req.body.password
    })

    console.log(studentdata)
    const pass = await bcrypt.genSalt(10);
    studentdata.password = await bcrypt.hash(studentdata.password, pass);
    const stData = await studentdata.save()
    console.log(stData)
    if (!stData) {
        console.log('ojha', result);
        res.status(401).json({ message: "Record not found." })
        return
    }
    res.status(201).json(stData)

    // }
})


router.post("/login", (req, res) => {
    // console.log(req.body)


    let userDetails;

    student.findOne({
        email: req.body.email

    }).then(async (user) => {
        // console.log("..............",user)
        if (!user) {
            return res.status(401).json({ msg: 'user not found' })
        }
        userDetails = user;

        // bcrypt.compare(req.body.password, user.password)
        //     .then(result => {


        //     }).catch(err => {
        //         console.log(err.message)
        //     })
        try {
            const result = await bcrypt.compare(req.body.password, user.password)
            if (!result) {
                return res.status(401).json({ msg: "result not get" })
            }
            // console.log(result)
            const token = jwt.sign({ email: userDetails.email, uerId: userDetails._id }, 'this_is_ram_ojha', {
                expiresIn: '1h'

            })
            // console.log(token)
            return res.status(200).json({
                token: token
            })
        } catch (err) {
            res.status(401).json({
                err: err.message

            })
        }

    })
        .catch(err => {
            console.log(err.message)
            res.status(500).json({
                err: err.message

            })
        })
})




module.exports = router