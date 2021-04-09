const mongoose = require("mongoose");
const user = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a valid password"],
    // minlength: [6, 'Minimum password length must be 6 characters']
  },
  primaryPhone: {
    type: Number,
    required: true,
  },
  secondaryNumber: {
    type: Number,
    required: true,
  },
  alternativeEmail: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  typeOfBusiness: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: false,
  },
  billingAddress: {
    type: String,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: Number,
    default: 1,
  },
  isVerified:{
    type:Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", user);
