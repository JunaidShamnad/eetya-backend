
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required:true
    },
    items: []
    // bill: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // }
});

module.exports = Cart = mongoose.model('cart', CartSchema);