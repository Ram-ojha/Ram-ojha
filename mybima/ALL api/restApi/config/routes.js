const path = require('path')
const express = require("express");
const mongoose = require("mongoose");
const router = express();
const User = require('../modal/userschema')
const multer = require('multer')
var http = require("http");
const axios = require('axios');
var request = require('request');
const mail = require('nodemailer')

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "config/uoload")
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + ".png")
        }
    })
}).single("upload")



router.post('/profile', upload, (req, res) => {
    console.log("response---------<>", res.req.file)
    // express.static(path.join(__dirname, "images"))
    console.log(path.join(__dirname, './uplaod'))
    res.send(path.join(__dirname, './uplaod'))
    // app.use("/images", express.static(path.join(__dirname, "images")));

})

async function test() {
    var options = {
        'method': 'GET',
        'url': 'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY',
        'headers': {
            'Authorization': 'Basic bmlmdHlhcGl1c2VyOm5pZnR5YXBpdXNlckAyMTEwIw==',
            'Cookie': 'ak_bmsc=77584A3A1F728E0DF49D6208EA6D364D~000000000000000000000000000000~YAAQLqkRYDXD2b6MAQAAo8jYwxa55Q+OAk2OdYmk96q7r9+5p4a45/F9BhEtUH+pcBrNjB5BkMYxaTK7eZuu1FjeNB2zNrGwyTfRaYfuU7h12IdDUZKhqdl/Bwp5CjxfNQaAXwFX7yezWNEGsXgQMAlfpgCCg6NjaS0l1sy8xsKNPY3O6lYUN+JhEi9megbSvusvae0NjtAzvELhcQcvyNMDELM6aIptGd+ctMf78a96f8Rf3k1dMuSEws46aCSRo6HvHSKivSS2N2BHUlv2rFtUH8YOQRvUPh/3tnYAzvbPaOZtyWm28hj+Pbx2l/gn5tAT5mfW2mTwf4MqhYuEN4HvUEWPSjeBpoPtr4tXaCp1R3Hk3OrVxQvjfvKL; bm_sv=BC8CBB780A78BB524BBDCD45139B565E~YAAQLqkRYEJK276MAQAAzJb0wxbM2KVYBlDtDpSIopUVjDsndsWGZm1Bs1aiAZBlq9RecRgWlrH5UzsD8jy85idIN77RcoHYar6H+4bVi+JaQaz7j8wBYPNSrq3Oo6wq8kx435dYqpuaUyeV9uR9OueFTVPIYKIJVVEV30fWoBkXlwBnDhld89tS1wJ68lJFEd6fgidinhm/fy0VQuEO5ptPk5UTBTC146MLSMNAS1iA49HeFiASGb4Q92jeu4nlmGo=~1'
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });

}
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) =>
    fetch(...args));

router.get("/user", async (req, res) => {
    try {
        let data = '';

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY',
            headers: {
                'Authorization': 'Basic bmlmdHlhcGl1c2VyOm5pZnR5YXBpdXNlckAyMTEwIw==',
                'user-agent': 'PostmanRuntime/7.36.0'//req.headers['user-agent']
            },
            data: data
        };
        // console.log(req)
        axios.request(config).then((response) => {
            console.log("Ram ojha", req);
            res.json(response.data)

        })
            .catch((error) => {
                console.log(error);
                res.json(error)
            });

    } catch (err) {
        console.log(error);
        res.json(error);
        return;
    }



    // await test();
    // const posts = await User.find()

    // console.log(posts)
});





router.post("/post", async (req, res) => {
    const data = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
    });
    await data.save().then((result) => {
        console.log(result)
        res.status(201).json(result)
    }).catch(err => {
        console.log(err);
    })

})

router.get("/send", (req, res) => {

    var smtpConfig = mail.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'ojharamkishor88@gmail.com',
            pass: 'Ramu143@'
        }
    });

    var poolConfig = mail.createTransport({
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'ojharamkishor88@gmail.com',
            pass: 'Ramu143@'
        }
    });
    let transporter = mail.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        port: 25,
        auth: {
            user: 'ojharamkishor88@gmail.com',
            pass: 'Ramu143@'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    //    let transfer = mail.createTransport({
    //     host : "ojharamkishor88@gmail.com",
    //     port : 465,
    //     secure : false,
    //     requireTLS:true,
    //     auth: {
    //        user: "ojharamkishor88@gmail.com",
    //        pass:"Ramu143@"
    //     },tls: {
    //         rejectUnauthorized: false
    //     }
    //    });
    let HelperOptions = {
        from: 'ojharamkishor88@gmail.com',
        to: 'pranaybansod59@gmail.com',
        subject: 'Majeni Contact Request',
        text: 'Hello',
        // html: outputData
    };

    poolConfig.sendMail(HelperOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("The message was sent!");
        console.log(info);
    });

    //    console.log("dscfk" ,transfer);
})


module.exports = router