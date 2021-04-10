const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    storeId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    items: [],
    date_added: {
        type: Date,
        default: Date.now
    }
})

module.exports = Order = mongoose.model('order', OrderSchema);