const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
// const passport = require("passport");
// const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken')

// importing  routes
const adminRoute = require("./routes/admin");
const buyerRoute = require("./routes/buyer");
const dealerRouter = require("./routes/dealer");

const app = express();
dotenv.config();

const User = require("./models/user");

const Item = require("./models/item");

const Category = require("./models/category");

const categoryController = require("./controllers/categoryController");
const item = require("./models/item");

mongoose.connect(
  process.env.mongoUri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log("Mongoose Is Connected");
  }
);

/// Middleware
app.use(express.static("public"));

app.use(bodyParser({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
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
app.use("/admin", adminRoute);
app.use("/buyer", buyerRoute);
app.use("/dealer", dealerRouter);

app.post("/add-item", (req, res) => {
  res.json("ok");
  console.log(req.body);
});

app.post("/login", (req, res) => {
  if (req.session.User) {
    console.log(req.session.User);
    return res.json({ userExist: true });
  }
  try {
    User.findOne({ username: req.body.username }).then((user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password).then((data) => {
          if (data) {
            const token = jwt.sign({email:user.alternativeEmail, _id: user._id} , 'secret', {expiresIn:'1h'})
            req.session.User = user;
            res.json({user: user, token});
          } else res.json({ err: "Password wrong" });
        });
      } else res.json({ err: "User not found" });
    });
  } catch (e) {
    res.json({ err: "Sorry something went wrong" });
    console.log(e);
  }
});
//email verification
const oauth2Client = new OAuth2(
  "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
  "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
  refresh_token:
    "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
});

// const accessToken = oauth2Client.getAccessToken();

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    // type: 'OAuth2',
    user: "eetyawebsite@gmail.com",
    pass: "eetya@123website",
    // clientId:
    //   "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
    // clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
    // refreshToken:
    //   "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
    // accessToken: accessToken,
  },
});

app.post("/sendEmail", (req, res) => {
  var mailOptions = {
    from: "eetyawebsite@gmail.com",
    to: "vaisakh.k591@gmail.com, jobins9633@gmail.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.json("error");
    } else {
      console.log("Email sent: " + info.response);
      res.json("hello koiiii");
    }
  });
});

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
  User.findOne({ username: req.body.email }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let role = 1;
      if(req.body.category === 'wholesaler'){
        role = 2;
      }

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
        role:role
      });
      await newUser.save();
      const token = jwt.sign({email:newUser.alternativeEmail, id:newUser._id}, 'secret', {expiresIn:'1h'})
      res.send({token, newUser});
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
app.post("/items-images", (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: "file is not found" });
  }
  // accessing the file
  const myFile = req.files.file;
  //  mv() method places the file inside public directory
  myFile.mv(
    `${__dirname}../client/public/uploads/${file.name}`,
    function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "Error occured" });
      }
      // returing the response with file path and name
      return res.send({ name: myFile.name, path: `/uploads/${myFile.name}` });
    }
  );
});

app.get("/items", (req, res) => {
  Item.find()
    .sort({ date: -1 })
    .then((items) => res.json(items));
});

app.put("/items/:id", (req, res) => {
  Item.findByIdAndUpdate({ _id: req.params.id }, req.body).then(function (
    item
  ) {
    Item.findOne({ _id: req.params.id }).then(function (item) {
      res.json(item);
    });
  });
});

app.get("/category", (req, res) => {
  Category.find().then((data) => {
    res.json(data);
    console.log(data);
  });
});

app.post("/contact", (req, res) => {
let message = '<h3>Message: No message</h3>'

  if(req.body.message != undefined){
    message = '<h3>Message: '+req.body.message+'</h3>'
  }

  var mailOptions = {
    from: "eetyawebsite@gmail.com",
    to: "vaisakh.k591@gmail.com, jobins9633@gmail.com",
    subject: `${req.body.name} contacted you.`,
    html:
      '<h1>Hi Admin</h1></br><h3>'+ req.body.name +' has contacted you</h3></br><h3>Name: '+req.body.name+'</h3></br><h3>Email: '+req.body.email+'</h3></br><h3>Phone: '+req.body.phone+'</h3></br>'+message
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.json({ status: false });
    } else {
      console.log("Email sent:" + info.response);
      res.json({ status: true });
    }
  });
});


app.post('/products', (req, res)=>{
  const pagination = req.body.pagination ? parseInt(req.body.pagination) : 12;
    //PageNumber From which Page to Start 
    const pageNumber = req.body.page ? parseInt(req.body.page) : 1;
    item.find({})
        //skip takes argument to skip number of entries 
        .sort({"_id" : 1})
        .skip((pageNumber - 1) * pagination)
        //limit is number of Records we want to display
        .limit(pagination)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).send({
                "err": err
            })
        })
})
 
const port = process.env.PORT || 4000;
//Start Server
app.listen(port, () => {
  console.log("Server Has Started");
});
