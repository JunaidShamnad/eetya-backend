const Admin = require("../models/admin");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const category = require("../models/category");
const User = require("../models/user");
const Cart = require("../models/cart");
const order = require("../models/order");
const item = require("../models/item");
const user = require("../models/user");
const newletter = require("../models/newletter");

const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const verifyAdmin = (req, res, next) => {
  if (req.session.Admin) next();
  else res.json({ loginErr: true });
};
router.get("/", (req, res) => {
  res.json({ data: "data" });
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const foundAdmin = await Admin.findOne({ username: username });
    if (foundAdmin) {
      const admin = await bcrypt.compare(password, foundAdmin.password);
      if (admin) res.json("Login success");
      else res.json({ err: "password wrong" });
    }
    res.json({ err: "Username is wrong" });
  } catch (e) {
    res.json({ err: "Sorry something went wrong" });
  }
});

router.post("/updateCredentials", (req, res) => {});

router.post("/create-category", (req, res) => {
  const newCategory = new category({
    categoryName: req.body.categoryName,
  });
  newCategory
    .save()
    .then((category) => res.json({ status: true }))
    .catch((e) => res.json({ status: false, error: e }));
});

router.post("/delete-category", (req, res) => {
  category
    .deleteOne({ _id: req.body.id })
    .then(() => res.json({ status: true }))
    .catch(() => res.json({ status: false }));
});

router.post("/edit-category", (req, res) => {
  category
    .replaceOne({ _id: req.body.id }, { categoryName: req.body.categoryName })
    .then(() => res.json({ status: true }))
    .catch(() => res.json({ status: false }));
});

router.get("/new-users", (req, res) => {
  console.log("sended");
  User.find({ isVerified: false })
    .select({ _id: 1, email: 1, username: 1, role: 1, primaryPhone: 1 })
    .then((users) => {
      res.json(users);
    });
});

router.post("/reject", (req, res) => {
  const { id } = req.body;
  User.deleteOne({ _id: id }).then(() => res.json({ status: true }));
});

router.post("/accept", (req, res) => {
  const { id } = req.body;
  User.update(
    { _id: id },
    {
      isVerified: true,
    },
    (err) => {
      if (!err) res.json({ status: true });
    }
  );
});

router.get("/orders", (req, res) => {
  let data = new Array();
  order
    .find({})
    .sort({ _id: -1 })
    .limit(25)
    .then(async (orders) => {
      await Promise.all(
        orders.map(async (order, i) => {
          console.log(order);
          let dealerId = order.items[0].storeId;
          let buyerId = order.userId;
          let dealer = await user.findOne({ _id: dealerId });
          let buyer = await user.findOne({ _id: buyerId });
          data[i] = {
            _id: order._id,
            dealerName: dealer.username,
            dealerPhone: dealer.primaryPhone,
            retailerName: buyer.username,
            items: order.items,
          };
        })
      );
      res.json(data);
      console.log(data);
    })
    .catch((e) => console.log(e));
});

router.get("/products", (req, res) => {
  item
    .find()
    .sort({ _id: -1 })
    .limit(25)
    .then((products) => {
      res.json(products);
    });
});

router.get("/users", (req, res) => {
  user
    .find({ role: { $ne: 3 } })
    .sort({ _id: -1 })
    .limit(25)
    .then((user) => {
      res.json(user);
    });
});

router.post("/remove-user", (req, res) => {
  user
    .deleteOne({ _id: req.body.id })
    .then(() => {
      res.json({ status: true });
    })
    .catch(() => {
      res.json({ status: false });
    });
});

router.get("/newsletter-count", (req, res) => {
  newletter
    .findOne({ _id: ObjectID("6077172aa222e635d8e6559d") })
    .then((data) => {
      res.json({ count: data.count });
    });
});

router.post("/sent-newsletter", (req, res) => {
  console.log('sent newsletter');
  const {message} = req.body
  let emails = "";
  newletter
    .findOne({ _id: ObjectID("6077172aa222e635d8e6559d") })
    .then((data) => {
      data.emails.map((email, i) => {
        if (i === 0) {
          emails = emails + email;
        } else {
          emails = emails + ", " + email;
        }
      });
      var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          
          user: "eetyainfo@gmail.com",
          pass: "eetya123",
          
        },
      });

      var mailOptions = {
        from: "eetyainfo@gmail.com",
        to: emails,
        subject: "EETYA Newsletter",
        html: "<h3>Dear user</h3><br>"+message
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.json({status:false});
        } else {
          res.json({status:true});
        }
      });
      
    });
});

module.exports = router;
