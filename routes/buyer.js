const router = require("express").Router();
const Cart = require("../models/cart");
const Item = require("../models/item");
const Order = require("../models/order");

// home route for buyers
router.get("/", async (req, res) => {
  const allPromise = await Promise.all([
    Item.find(),
    Cart.findOne({ userId: req.session.userId }),
  ]);
  res.json(allPromise);
});

//place order
router.get("/place-order/:id/:userId", async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.params.userId;
    const cart = await Cart.findOne({ userId });
    if (cart) {
      const cartItems = cart.items.filter((i) => i.storeId === storeId);
      const cartProductIdes = cartItems.map((i) => i.productId);
      const cartProductDetails = await Item.find({
        _id: { $in: cartProductIdes },
      });
      let totalBill = 0;
      const Items = cartProductDetails.map((it) => {
        const foundItem = cartItems.find(
          (i) => i.productId === it._id.toString()
        );
        totalBill += foundItem.quantity * it.price;
        return {
          productId: it._id,
          name: it.name,
          quantity: foundItem.quantity,
          price: it.price,
        };
      });
      const newOrder = new Order({
        storeId: storeId,
        userId: userId,
        items: Items,
        bill: totalBill,
      });

      newOrder
        .save()
        .then((order) => res.json(order))
        .catch((e) => res.json("Sorry some internal error"));
      Cart.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: { $in: cartProductIdes } } } },
        { new: true }
      )
        .then((data) => console.log("success"))
        .catch((e) => console.log(e));
    } else res.json("Sorry something went wrong");
  } catch (e) {
    console.log(e);
    res.json("Sorry something went wrong");
  }
});

//add-to cart
router.post("/add-to-cart", async (req, res) => {
  try {
    const { prodId, userId, name, price, storeId } = req.body;
    const qnt = Math.abs(req.body.qnt);
    const foundCart = await Cart.findOne({ userId: userId });

    const newItem = {
      productId: prodId,
      userId: userId,
      name: name,
      quantity: qnt,
      price: price,
      storeId: storeId
    };
    console.log(newItem);
    if (foundCart) {
      let isItemInCart = false;
      let allItems = foundCart.items.map((i) => {
        if (i.productId === prodId) {
          isItemInCart = true;

          return {
            productId: i.productId,
            name: i.name,
            quantity: i.quantity + qnt,
            storeId: i.storeId,
          };
        } else return i;
      });
      if (isItemInCart) foundCart.items = allItems;
      else foundCart.items.push(newItem);
      Cart.findOneAndUpdate(
        { userId: userId },
        { $set: { items: foundCart.items } },
        { new: true }
      )
        .then((cart) => res.json(cart))
        .catch((e) => res.json({ err: e }));
    } else {
      const newCart = new Cart({
        userId: userId,
        items: [newItem],
      });
      newCart
        .save()
        .then((cart) => res.json(cart))
        .catch((e) => res.json({ err: e }));
    }
  } catch (e) {
    console.log(e);
    res.json({ err: "Sorry something went wrong" });
  }
});

router.post("/change-qnt", (req, res) => {
  try {
    const { value, productId, userId } = req.body;

    Cart.findOneAndUpdate(
      { userId: userId, "items.productId": productId },
      { $inc: { "items.$.quantity": value } },
      { new: true }
    )
      .then((cart) => res.json({ status: true, cart }))
      .catch((e) => res.json({ err: e }));
  } catch (e) {
    console.log(e);
    res.json({ err: "Sorry something went wrong" });
  }
});
router.post("/removeItem", (req, res) => {
  try {
    const { prodId, userId } = req.body;
    Cart.findOneAndUpdate(
      { userId: userId, "items.productId": prodId },
      { $pull: { items: { productId: prodId } } },
      { new: true }
    )
      .then((cart) => res.json(cart))
      .catch((e) => res.json({ err: e }));
  } catch (e) {
    console.log(e);
    res.json({ err: "sorry something went wrong" });
  }
});
// delete cart
router.get("/empty-cart/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedCart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $set: { items: [] } },
      { new: true }
    );
    deletedCart
      ? res.json(deletedCart)
      : res.json("Sorry something went wrong");
  } catch (e) {
    console.log(e);
    res.json("Sorry  something went wrong");
  }
});

router.post("/cart", (req, res) => {
  console.log(req.body.id);
  Cart.findOne({ userId: req.body.id }).then((cart) => {
    console.log(cart);
    if (cart) {
      res.json({ cart });
    } else {
      res.json({ error: "no cart found" });
    }
  });
});

router.post("/confirm-product", (req, res) => {
  Cart.findOne({ userId: req.body.id, "items.productId": req.body.productId })
    .then((cart) => {
      if (cart) {
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    })
    .catch((e) => res.json(e));
});

router.post('/cart-count', (req, res)=>{
    const {userId} = req.body

    console.log('cart-count'+userId);
    Cart.find({userId:userId}).then((cart)=>{
        if(cart.items){
            res.json({count:cart.items.length})
        }else{
            res.json({count:0})
        }
    })
})


module.exports = router;
