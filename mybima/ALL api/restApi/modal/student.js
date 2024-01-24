const mongoose = require('mongoose')
const user = require("../modal/userschema")
// user.insertMany([{
//     name:'ram',email:'ramkishor88@gmail.com',age:27
// }]).then(res=>{
//     console.log(res)
// }).catch(err=>{
//     console.log(err.message)
// })

// user.find().then(result=>{
//     console.log("dafa",result,user)
// }).catch(err=>{
//     console.log(err.message)
// })

module.exports = user