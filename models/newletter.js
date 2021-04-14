const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsLetterSchema = new Schema({
    count:{
        type:Number,
        required: true
    },
    emails:[]
});

module.exports = newsLetter = mongoose.model('newsletter', newsLetterSchema, 'newsletter');