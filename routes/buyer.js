const router = require('express').Router()
const Cart = require('../models/cart')
const Item = require('../models/item')
const Order = require('../models/order')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const Dealer = require('../models/dealer')
const checkBuyer = async (req, res, next) => {
    const user = await User.findOne({ email: 'a' })
    req.session.Buyer = user
    if (!req.session?.Buyer) return res.json({ loginErr: true })
    else if (!req.session.Buyer?.verified) res.json({ verified: false })
    else if (req.session.Buyer.approved === false) res.json({ approved: false })
    else next()
}


// home route for buyers
router.get('/', checkBuyer, async (req, res) => {

    const allPromise = await Promise.all([
        Item.find(),
        Cart.findOne({ userId: req.session.Buyer._id }),
        Order.find({ userId: req.session.Buyer._id }),
        Dealer.find({}, { _id: 1, name: 1, email: 1 })
    ])
    // allPromise[3] = allPromise[3].map(it => ({ name: it.name, email: it.email }))
    allPromise.push(req.session.Buyer)
    res.json(allPromise)
})

//route to buyer login 
router.post('/login', async (req, res) => {
    if (req.session.Buyer) return res.json(req.session.Buyer)
    try {
        const { email, password } = req.body
        const FoundBuyer = await User.find({ email: email })
        if (FoundBuyer) {
            const checkPassword = await bcrypt.compare(password, FoundBuyer.password)
            if (checkPassword) (req.session.Buyer = FoundBuyer, res.json(FoundBuyer))
            else res.json({ err: 'Password is Incorrect' })
        } else res.json({ err: 'User not found' })
    } catch (e) {
        res.json({ err: 'something went wrong' })
        console.log(e);
    }
})

// route to verify email
router.get('/verify/:id', (req, res) => {
    User.findByIdAndUpdate({ _id: req.params > id }, { $set: { verified: true } }, { new: true })
        .then(verifiedUser => (req.session.Buyer = verifiedUser, res.json({ msg: 'Email verified' })))
        .catch(e => (res.json({ err: 'something went wrong' }), console.log(e)))
})

// route to sign up 
router.post('/signUp', async (req, res) => {
    if (req.session.Buyer) return res.json(req.session.Buyer)
    const data = req.body
    const isUserExist = await User.find({ $or: [{ email: data.email }, { primaryPhone: data.primaryPhone }, { registrationNumber: data.registrationNumber }, { website: data.website }, { alternativeEmail: data.alternativeEmail }] })
    if (isUserExist.length > 0) return res.json({ err: 'User already exist with any of the credentials you provided' })
    const password = await bcrypt.hash(data.password, 12)
    try {
        const newUser = new User({
            name: data.name,
            email: data.email,
            password: password,
            primaryPhone: data.primaryPhone,
            secondaryNumber: data.secondaryNumber,
            alternativeEmail: data.alternativeEmail,
            companyName: data.companyName,
            registrationNumber: data.registrationNumber,
            typeOfBusiness: data.typeOfBusiness,
            website: data.website,
            billingAddress: data.billingAddress,
            shippingAddress: data.shippingAddress,
        })

        newUser.save()
            .then(user => (req.session.Buyer === user, res.json({ role: 'b', msg: 'Account created verification email sent to your email' })))
            .catch(e => (res.json({ err: 'something went wrong' }), console.log(e)))
    } catch (e) {
        res.json({ err: 'something went wrong' })
        console.log(e);
    }
})
//place order 
router.get('/place-order/:storeId/', checkBuyer, async (req, res) => {
    try {
        const storeId = req.params.storeId
        const userId = req.session.Buyer._id
        const cart = await Cart.findOne({ userId })
        if (cart) {
            const cartItems = cart.items.filter(i => i.storeId === storeId)
            const cartProductIdes = cartItems.map(i => i.productId)
            const cartProductDetails = await Item.find({ _id: { $in: cartProductIdes } })
            let totalBill = 0
            const Items = cartProductDetails.map(it => {
                const foundItem = cartItems.find(i => i.productId === it._id.toString())
                totalBill += foundItem.quantity * it.price
                return {
                    productId: it._id,
                    name: it.name,
                    quantity: foundItem.quantity,
                    price: it.price
                }
            })
            const newOrder = new Order({
                storeId: storeId,
                userId: userId,
                items: Items,
                bill: totalBill
            })

            newOrder.save().then(order => res.json(order)).catch(e => res.json('Sorry some internal error'))
            Cart.findOneAndUpdate(
                { userId: userId },
                { $pull: { items: { productId: { $in: cartProductIdes } } } },
                { new: true }
            ).then(data => console.log('success')).catch(e => console.log(e))
        } else res.json('Sorry something went wrong')

    } catch (e) {
        console.log(e);
        res.json('Sorry something went wrong')
    }
})

//add-to cart
router.post('/add-to-cart', checkBuyer, async (req, res) => {

    try {
        const userId = req.session.Buyer._id
        const { prodId, name, storeId } = req.body;
        const qnt = Math.abs(req.body.qnt)
        const foundCart = await Cart.findOne({ userId: userId })

        const newItem = {
            productId: prodId,
            storeId: storeId,
            name: name,
            quantity: qnt,
        }
        if (foundCart) {
            let isItemInCart = false
            let allItems = foundCart.items.map(i => {
                if (i.productId === prodId) {
                    isItemInCart = true

                    return {
                        productId: i.productId,
                        name: i.name,
                        quantity: i.quantity + qnt,
                        storeId: i.storeId,

                    }
                } else return i
            })
            if (isItemInCart) foundCart.items = allItems
            else foundCart.items.push(newItem)
            Cart.findOneAndUpdate({ userId: userId }, { $set: { items: foundCart.items } }, { new: true })
                .then(cart => res.json(cart)).catch(e => res.json({ err: e }))
        } else {
            const newCart = new Cart({
                userId: userId,
                items: [newItem],
            })
            newCart.save().then(cart => res.json(cart)).catch(e => res.json({ err: e }))
        }

    } catch (e) {
        console.log(e);
        res.json({ err: 'Sorry something went wrong' })
    }
})

router.post('/change-qnt', checkBuyer, (req, res) => {
    try {
        const { prodId, opt, userId } = req.body;
        const newQnt = opt === '+' ? 1 : -1
        Cart.findOneAndUpdate(
            { userId: userId, 'items.productId': prodId },
            { $inc: { 'items.$.quantity': newQnt } },
            { new: true }
        ).then(cart => res.json(cart)).catch(e => res.json({ err: e }))
    } catch (e) {
        console.log(e);
        res.json({ err: 'Sorry something went wrong' })
    }
})
router.post('/removeItem', checkBuyer, (req, res) => {
    try {
        const { prodId, userId } = req.body;
        Cart.findOneAndUpdate(
            { userId: userId, 'items.productId': prodId },
            { $pull: { items: { productId: prodId } } },
            { new: true }
        ).then(cart => res.json(cart)).catch(e => res.json({ err: e }))
    } catch (e) {
        console.log(e);
        res.json({ err: 'sorry something went wrong' })
    }
})
router.get('/delete-store/:id', checkBuyer, (req, res) => {
    try {
        const storeId = req.params.id
        Cart.findOneAndUpdate(
            { userId: req.session.Buyer._id },
            { $pull: { items: { storeId: storeId } } },
            { new: true }
        ).then(data => (res.json(data))).catch(e => (console.log(e), res.json({ err: 'something wrong' })))
    } catch (e) {
        console.log(e);
        res.json({ err: 'something wrong' })
    }
})
// delete cart 
router.get('/empty-cart/:id', checkBuyer, async (req, res) => {
    try {
        const userId = req.params.id
        const deletedCart = await Cart.findOneAndUpdate({ userId: userId }, { $set: { items: [] } }, { new: true })
        deletedCart ? res.json(deletedCart) : res.json('Sorry something went wrong')
    } catch (e) {
        console.log(e);
        res.json('Sorry  something went wrong')
    }
})
module.exports = router;

