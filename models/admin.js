const mongoose = require('mongoose')

const admin = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true, 'Please Enter a valid Password']
    }
})

module.exports = mongoose.model('Admin', admin)