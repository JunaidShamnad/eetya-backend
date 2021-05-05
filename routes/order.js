const { Router } = require("express");
const orderController = require("../controllers/orderControllers");
const router = Router();

const Order = require("../models/order");
const nodemailer = require("nodemailer");

const Cart = require("../models/cart");
const user = require("../models/user");
const order = require("../models/order");
const { ObjectId } = require("mongodb");

const Email = (dealerEmail, buyerEmail, name, price, quantity) => {
  var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "eetyainfo@gmail.com",
      pass: "eetya123",
    },
  });

  var mailOptions = {
    from: "eetyawebsite@gmail.com",
    to: `${dealerEmail} , ${buyerEmail}, eetyawebsite@gmail.com`,
    subject: `${name} is ordered`,
    html:
      "<h1>Hi ,</h1></br><h3>" +
      name +
      " has ordered.</h3></br><h3>Price: " +
      price +
      "</h3></br><h3>Quantity: " +
      quantity,
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
};

const EmailCheckout = (dealerEmail, buyerEmail, price, quantity) => {
  var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "eetyainfo@gmail.com",
      pass: "eetya123",
    },
  });

  var mailOptions = {
    from: "eetyawebsite@gmail.com",
    to: `${dealerEmail} , ${buyerEmail}, eetyawebsite@gmail.com`,
    subject: `Your Order has placed`,
    html: "<h1>Hi ,</h1></br><h3>" + "your order has been placed</h3>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log("Email sent:" + info.response);
      return true;
    }
  });
};

router.post("/buy-now", (req, res) => {
  const {
    productId,
    storeId,
    userId,
    name,
    price,
    quantity,
    dealerEmail,
    userEmail,
  } = req.body;

  const newOrder = new Order({
    userId: ObjectId(userId),
    items: [
      {
        productId: productId,
        name: name,
        price: price,
        quantity: quantity,
        storeId: ObjectId(storeId),
      },
    ],
  });
  newOrder.save().then(() => {
    res.json({ status: true });
    Email(dealerEmail, userEmail, name, price, quantity);
  });
});

router.post("/checkout", (req, res) => {
  const { userId, userEmail } = req.body;
  let dealerEmail = " ";
  console.log("userid " + userId);
  Cart.find({ userId: userId }).then(async (cart) => {
    for (i in cart[0].items) {
      let storeId = cart[0].items[i].storeId;
      let store = await user.find({ _id: storeId });
      dealerEmail = dealerEmail + store.email;

      const newOrder = new Order({
        userId: ObjectId(userId),
        items: cart[0].items[i],
      });
      newOrder.save();
    }

    EmailCheckout(dealerEmail, userEmail);
    Cart.deleteOne({ userId: userId })
      .then(() => {
        console.log("data deleted");
        res.json({ status: true });
      })
      .catch(() => {
        res.json({ status: false });
      });
  });
});

module.exports = router;
