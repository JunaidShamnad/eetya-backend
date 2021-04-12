const Admin = require("../models/admin");
const router = require("express").Router();
const bcrypt = require("bcryptjs");

const category = require("../models/category");
const User = require("../models/user");
const Cart = require("../models/cart");
const order = require("../models/order");
const item = require("../models/item");
const user = require("../models/user");

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
  let data = [];
  order
    .find({})
    .sort({ _id: -1 })
    .limit(25)
    .then(async (orders) => {
      for (i in orders) {
        // let buyer = await User.findOne({ _id: mongoose.Types.ObjectId(orders[i].userId) });
        // let dealer = await User.findOne({ _id: mongoose.Types.ObjectId(orders[i].storeId) });
        let totalPrice = 0;
        for (j in orders[i].items) {
          let price = orders[i].items[j].quantity * orders[i].items[j].price;
          totalPrice = totalPrice + price;
        }
        data[i] = {
          // buyerName: buyer.username,
          // dealerName: dealer.username,
          cartTotal: totalPrice,
        };
      }

      res.json(data);
    }).catch((e)=>{
      res.json({err:e})
    })
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
    .find()
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

module.exports = router;
