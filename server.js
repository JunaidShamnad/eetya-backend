const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
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
const fs = require("fs");
const jwt = require("jsonwebtoken");

// importing  routes
const adminRoute = require("./routes/admin");
const buyerRoute = require("./routes/buyer");
const dealerRouter = require("./routes/dealer");
const orderRouter = require("./routes/order");

const app = express();
dotenv.config();

const User = require("./models/user");

const Item = require("./models/item");

const Category = require("./models/category");

const categoryController = require("./controllers/categoryController");
const item = require("./models/item");
const newsLetter = require("./models/newletter");

mongoose.connect(
  "mongodb+srv://junaid:intelpik123@cluster0.tnj61.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
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
// app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
app.use(
  cors({
    origin: true, // <-- location of the react app were connecting to
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

app.get("/", (req, res) => res.json("eetya backend"));
app.post("/add-item", (req, res) => {
  res.json("ok");
});

app.post("/login", (req, res) => {
  try {
    User.findOne({ email: req.body.email }).then((user, e) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password).then((data) => {
          if (data) {
            const token = jwt.sign(
              { email: user.email, _id: user._id },
              "secret",
              { expiresIn: "1h" }
            );
            if (user.isVerified) {
              res.json({ user: user, token });
            } else {
              res.json({ unVerified: true });
            }
          } else res.json({ err: "Invalid Login!" });
        });
      } else {
        res.json({ err: "User not found" });
      }
    });
  } catch (e) {
    res.json({ err: "Sorry something went wrong" });
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
    user: "eetyainfo@gmail.com",
    pass: "eetya123",
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
    to: "eetyawebsite@gmail.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json("error");
    } else {
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
  User.findOne({ username: req.body.email }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let role = 1;
      if (req.body.role === "wholesaler") {
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
        role: role,
      });
      await newUser.save();
      const token = jwt.sign(
        { email: newUser.alternativeEmail, id: newUser._id },
        "secret",
        { expiresIn: "1h" }
      );
      res.send({ status: true });
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
  });
});

app.get("/wholesaler", (req, res) => {
  User.find({ role: 2 }).then((data) => res.json(data));
});
app.post("/contact", (req, res) => {
  let message = "<h3>Message: No message</h3>";

  if (req.body.message != undefined) {
    message = "<h3>Message: " + req.body.message + "</h3>";
  }

  var mailOptions = {
    from: "eetyainfo@gmail.com",
    to: "eetyawebsite@gmail.com",
    subject: `${req.body.name} contacted you.`,
    html:
      "<h1>Hi Admin</h1></br><h3>" +
      req.body.name +
      " has contacted you</h3></br><h3>Name: " +
      req.body.name +
      "</h3></br><h3>Email: " +
      req.body.email +
      "</h3></br><h3>Phone: " +
      req.body.phone +
      "</h3></br>" +
      message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json({ status: false });
    } else {
      res.json({ status: true });
    }
  });
});

app.post("/products", (req, res) => {
  console.log("/products");
  const pagination = req.body.pagination ? parseInt(req.body.pagination) : 12;
  //PageNumber From which Page to Start
  const pageNumber = req.body.page ? parseInt(req.body.page) : 1;
  item
    .find({})
    //skip takes argument to skip number of entries
    .sort({ _id: 1 })
    .skip((pageNumber - 1) * pagination)
    //limit is number of Records we want to display
    .limit(pagination)
    .then((data) => {
      let products = [];

      data.map((pro, index) => {
        let temp = {
          id: pro._id,
          title: pro.title,
          description: pro.description,
          category: pro.category,
          price: pro.price,
          maxQuandity: pro.maxQuandity,
          minQuandity: pro.maxQuandity,
          images: [],
        };
        pro.imagetype.map((val, index) => {
          let image = fs.readFileSync(
            `./public/images/${pro._id}+${index}.${val.type}`
          );
          const img64 = Buffer.from(image).toString("base64");
          const img = {
            data: img64.replace(`dataimage\/${val.type}base64`, ""),
            type: val.type,
          };
          temp.images.push(img);
        });
        products.push(temp);
      });
      return res.status(200).json(products);
    })
    .catch((err) => {
      res.status(400).send({
        err: err,
      });
    });
});

//get single product
app.post("/Product", (req, res) => {
  item
    .findOne({ _id: req.body.id })
    .then((data) => {
      let product = {
        title: data.title,
        id: data._id,
        description: data.description,
        added_date: data.date_added,
        minQuantity: data.minQuantity,
        maxQuantity: data.maxQuantity,
        category: data.category,
        price: data.price,
        images: [],
      };
      data.imagetype.map((val, index) => {
        let image = fs.readFileSync(
          `./public/images/${data._id}+${index}.${val.type}`
        );
        const img64 = Buffer.from(image).toString("base64");
        const img = {
          data: img64.replace(`dataimage\/${val.type}base64`, ""),
          type: val.type,
        };
        product.images.push(img);
      });
      // get user details
      User.findOne({ _id: data.dealerId })
        .then((usr) => {
          let user = {
            id: usr._id,
            name: usr.username,
            email: usr.email,
            number: usr.primaryPhone,
            companyname: usr.companyname,
          };
          res.json({ Product: product, User: user });
        })
        .catch((e) => res.json({ error: "something went wrong" }));

      // res.json({Product:product,User:user})
    })
    .catch((e) => res.json({ error: "something went wrong . " }));
});

//get product with category
app.post("/get-cat-products", (req, res) => {
  item.find({ category: req.body.category }).then((data) => {
    let products = [];

    data.map((pro, index) => {
      let temp = {
        id: pro._id,
        title: pro.title,
        description: pro.description,
        category: pro.category,
        price: pro.price,
        maxQuantity: pro.maxQuantity,
        minQuantity: pro.maxQuantity,
        images: [],
      };
      pro.imagetype.map((val, index) => {
        let image = fs.readFileSync(
          `./public/images/${pro._id}+${index}.${val.type}`
        );
        const img64 = Buffer.from(image).toString("base64");
        const img = {
          data: img64.replace(`dataimage\/${val.type}base64`, ""),
          type: val.type,
        };
        temp.images.push(img);
      });
      products.push(temp);
    });

    res.json(products);
  });
});

app.get("/newArrivals", (req, res) => {
  item
    .find({})
    .sort({ _id: -1 })
    .limit(6)
    .then((data) => {
      let products = [];

      data.map((pro, index) => {
        let temp = {
          id: pro._id,
          title: pro.title,
          description: pro.description,
          category: pro.category,
          price: pro.price,
          maxQuantity: pro.maxQuantity,
          minQuantity: pro.maxQuantity,
          images: [],
        };
        pro.imagetype.map((val, index) => {
          let image = fs.readFileSync(
            `./public/images/${pro._id}+${index}.${val.type}`
          );
          const img64 = Buffer.from(image).toString("base64");
          const img = {
            data: img64.replace(`dataimage\/${val.type}base64`, ""),
            type: val.type,
          };
          temp.images.push(img);
        });
        products.push(temp);
      });
      res.json(products);
    });
});
app.post("/searchProducts", (req, res) => {
  item
    .find({ title: { $regex: req.body.data, $options: "$i" } })
    .then((data) => {
      let products = [];

      data.map((pro, index) => {
        let temp = {
          id: pro._id,
          title: pro.title,
          description: pro.description,
          category: pro.category,
          price: pro.price,
          maxQuantity: pro.maxQuantity,
          minQuantity: pro.maxQuantity,
          images: [],
        };
        pro.imagetype.map((val, index) => {
          let image = fs.readFileSync(
            `./public/images/${pro._id}+${index}.${val.type}`
          );
          const img64 = Buffer.from(image).toString("base64");
          const img = {
            data: img64.replace(`dataimage\/${val.type}base64`, ""),
            type: val.type,
          };
          temp.images.push(img);
        });
        products.push(temp);
      });
      res.json(products);
    });
});
//get-Dealer-Products
app.post("/getDealerProduts", (req, res) => {
  item.find({ dealerId: req.body.dealerId }).then((data) => res.json(data));
});
//get product to edit

app.post("/getProduct-edit", (req, res) => {
  item
    .findOne({ _id: req.body.Id })
    .then((data) => {
      let product = {
        title: data.title,
        id: data._id,
        description: data.description,
        added_date: data.date_added,
        minQuantity: data.minQuantity,
        maxQuantity: data.maxQuantity,
        category: data.category,
        price: data.price,
        images: [],
      };
      data.imagetype.map((val, index) => {
        let image = fs.readFileSync(
          `./public/images/${data._id}+${index}.${val.type}`
        );
        const img64 = Buffer.from(image).toString("base64");
        const img = {
          data: img64.replace(`dataimage\/${val.type}base64`, ""),
          type: val.type,
        };
        product.images.push(img);
      });
      res.json(product);
    })
    .catch((e) => res.json({ error: "something went worng" }));
});

app.post("/Edit-Product", (req, res) => {
  const {
    id,
    title,
    description,
    category,
    minQuantity,
    maxQuantity,
    price,
    images,
  } = req.body;
  Item.findOne({ _id: id })
    .then((data) => {
      data.title = title;
      data.description = description;
      data.category = category;
      data.minQuantity = minQuantity;
      data.maxQuantity = maxQuantity;
      data.price = price;
      return data.save();
    })
    .then((result) => {
      console.log("UPDATED Product!");
    })
    .catch((e) => console.log("error: line 564", e));
});

app.post("/add-newsletter", (req, res) => {
  const { email } = req.body;
  newsLetter
    .updateOne(
      { _id: ObjectId("6077172aa222e635d8e6559d") },
      {
        $inc: { count: 1 },
        $push: { emails: email },
      }
    )
    .then(() => {
      res.json({ status: true });
    })
    .catch(() => {
      res.json({ status: false });
    });
});

app.post("/help-center", (req, res) => {
  const { message, email } = req.body;

  var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "eetyainfo@gmail.com",
      pass: "eetya123",
    },
  });

  var mailOptions = {
    from: "eetyainfo@gmail.com",
    to: "eetyawebite@gmail.com, jobins9633@gmail.com",
    subject: "msg from Eetya help center",
    html: "<h3>Dear admin</h3><br><p>Email " + email + "</p></br>" + message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json({ status: false });
    } else {
      res.json({ status: true });
    }
  });
});

app.use("/admin", adminRoute);
app.use("/buyer", buyerRoute);
app.use("/dealer", dealerRouter);
app.use("/order", orderRouter);
const port = process.env.PORT || 4000;
//Start Server
app.listen(port, () => {
  console.log("Server Has Started");
});
