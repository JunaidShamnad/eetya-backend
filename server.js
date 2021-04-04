const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
// const passport = require("passport");
// const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv')



// importing  routes 
const adminRoute = require('./routes/admin')
const buyerRoute = require('./routes/buyer')
const dealerRouter = require('./routes/dealer')

const app = express();
dotenv.config()

const User = require("./models/user");

const Item = require("./models/item");

mongoose.connect(
  process.env.mongoUri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  () => {
    console.log("Mongoose Is Connected");
  }
);

/// Middleware
app.use(express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // <-- location of the react app were connecting to
    credentials: true,
  })
);

app.use(fileUpload());
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser("secretcode"));
// app.use(passport.initialize());
// app.use(passport.session());
// require("./passportConfig")(passport);

//----------------------------------------- END OF MIDDLEWARE---------------------------------------------------

// Routes
// admin route
app.use('/admin', adminRoute)
app.use('/buyer', buyerRoute)
app.use('/dealer', dealerRouter)
app.get('/item/:id', (req, res) => {
  Item.findById({ _id: req.params.id }).then(data => res.json(data)).catch(e => res.json({ err: true }))
})
// logout 
app.get('/logout', (req, res) => {
  console.log(req.session);
  req.session.destroy()
  res.json(true)
})

app.get("/items", (req, res) => {
  Item.find().sort({ date: -1 }).then(items => res.json(items));
});



const port = process.env.PORT || 4000;
//Start Server
app.listen(port, () => {
  console.log("Server Has Started");
});
