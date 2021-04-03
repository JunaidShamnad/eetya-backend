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


app.post('/add-item', (req, res) => {
  res.json('ok')
  console.log(req.body);
})


app.post('/login', (req, res) => {
  if (req.session?.User) {
    console.log(req.session.User);
    return res.json({ userExist: true })
  }
  try {
    User.findOne({ username: req.body.username })
      .then(user => {
        if (user) {
          bcrypt.compare(req.body.password, user.password).then(data => {
            if (data) {
              req.session.User = user;
              res.json(user)
            }
            else res.json({ err: 'Password wrong' })
          })
        } else res.json({ err: 'User not found' })
      })

  } catch (e) {
    res.json({ err: "Sorry something went wrong" })
    console.log(e);
  }
})



// app.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     console.log('login');
//     if (err) throw err;
//     if (!user) res.send("No User Exists");
//     else {
//       req.logIn(user, (err) => {
//         if (err) throw err;
//         res.send("Successfully Authenticated");
//         console.log(req.user);
//       });
//     }
//   })(req, res, next);
// });
app.post("/register", (req, res) => {
  console.log(req.body);
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        primaryPhone: req.body.primaryPhone,
        secondaryNumber: req.body.secondaryNumber,
        alternativeEmail: req.body.alternativeEmail,
        companyName: req.body.companyName,
        registrationNumber: req.body.registrationNumber,
        typeOfBusiness: req.body.typeOfBusiness,
        website: req.body.website,
        billingAddress: req.body.billingAddress,
        shippingAddress: req.body.shippingAddress,
      });
      await newUser.save();
      res.send("User Created");
    }
  });
});

app.get("/user", (req, res) => {
  res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

app.post("/items", (req, res) => {


  const newItem = new Item({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
  });
  newItem.save();
  res.send("Item Created");

});
app.post('/items-images', (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: "file is not found" })
  }
  // accessing the file
  const myFile = req.files.file;
  //  mv() method places the file inside public directory
  myFile.mv(`${__dirname}../client/public/uploads/${file.name}`, function (err) {
    if (err) {
      console.log(err)
      return res.status(500).send({ msg: "Error occured" });
    }
    // returing the response with file path and name
    return res.send({ name: myFile.name, path: `/uploads/${myFile.name}` });
  });
})

app.get("/items", (req, res) => {
  Item.find().sort({ date: -1 }).then(items => res.json(items));
});

app.put("/items/:id", (req, res) => {
  Item.findByIdAndUpdate({ _id: req.params.id }, req.body).then(function (item) {
    Item.findOne({ _id: req.params.id }).then(function (item) {
      res.json(item);
    });
  });
});


const port = process.env.PORT || 4000;
//Start Server
app.listen(port, () => {
  console.log("Server Has Started");
});
