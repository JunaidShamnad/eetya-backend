
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: {
        type: String,
    },
    items: []
    // bill: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // }
});

module.exports = Cart = mongoose.model('cart', CartSchema);