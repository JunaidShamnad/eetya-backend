const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    dealerId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    minQuantity: {
        type: String,
        required: true
    },
    maxQuantity: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imagetype:  
    {
        type: Array,
        required :true
    },
    date_added: {
        type: Date,
        default: Date.now
    },
});

module.exports = Item = mongoose.model('item', ItemSchema, 'item');