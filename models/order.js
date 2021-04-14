const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  items: {
    type: Array,
    required:true
  },
  date_added: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Order = mongoose.model("order", OrderSchema);
