const express = require("express")
const route = express.Router()

const student = require("../config/student")
const stdcode = require("../config/STDcode")

route.get("/STDcode", async (req, res) => {
    const stdc = await stdcode.find()
    // const std = await student.find()
    // console.log(stdc, std)
    res.status(200).json(stdc)
})


// route.get("/", async (req, res) => {
//     const students = await student.find()
//     //    console.log(students)
//     res.status(200).json(students)
// })

// route.get("/:id", async (req, res) => {

//     console.log(req.params.id)
//     const students = await student.findById(req.params.id)
//     console.log(students)

//     res.status(200).json(students)

// })

route.post("/post", async (req, res) => {
    // console.log(req)
    const savedata = new student({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        password: req.body.password
    });
    await savedata.save().then((result) => {
        res.status(201).json(result)
    }).catch(err => {
        console.log(err)
    })
})


route.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id
        const students = await student.deleteOne({ _id: id })
        if (students.deletedCount > 0) {
            res.json({ msg: "delete sucessfully." })
        } else {
            res.json({ msg: "given data does'nt exists." })
        }
        // console.log(students)
    } catch (err) {
        res.json({ error: err.message })
    }

})



route.put("/update/:id", (req, res) => {
    const id = req.params.id
    console.log(req.body)
    // student.()

    student.updateOne({ _id: req.params.id }, {
        $set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            address: req.body.address,
            email: req.body.email,
            phone: req.body.phone,
            gender: req.body.gender,
        }

    }).then(result => {
        console.log(result)
        res.status(200).json(result)
    }).catch(err => {
        res.status(500).json({ error: err })
    })

})

module.exports = route