const mongoose = require('mongoose');

const indianstatecity = new mongoose.Schema({
    state_city: String
})

module.exports = mongoose.model('indianstatecity', indianstatecity)