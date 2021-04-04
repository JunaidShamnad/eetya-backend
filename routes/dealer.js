const router = require('express').Router()
const Dealer = require('../models/dealer')
const bcrypt = require('bcryptjs')
const Item = require('../models/item')
const Order = require('../models/order')

const checkSeller = async (req, res, next) => {

    if (!req.session?.Dealer) res.json({ loginErr: true })
    else if (!req.session?.Dealer?.verified) res.json({ verified: false })
    else if (!req.session?.Dealer?.approved) res.json({ approved: false })
    else next()

}

router.get('/', checkSeller, async (req, res) => {
    try {
        const allData = await Promise.all([
            Item.find({ storeId: req.session.Dealer._id }),
            Order.find({ storeId: req.session.Dealer._id })
        ])
        allData.push(req.session.Dealer)
        res.json(allData)
    } catch (e) {
        res.json({ err: 'Something wrong' })
        console.log(e);
    }
})

// add new item 
router.post('/add-item', checkSeller, (req, res) => {
    const data = req.body
    if (!req.session?.Dealer) return res.json({ loginErr: true })

    try {
        const newItem = new Item({
            storeId: req.session.Dealer._id,
            title: data.title,
            description: data.description,
            category: data.category,
            price: data.price,
            image: data.image
        })

        newItem.save().then(item => (res.json(item), console.log(item))).catch(e => (res.json({ err: 'Something went wrong' }), console.log(e)))


    } catch (e) {
        res.json({ err: 'Sorry something went wrong' })
        console.log(e);
    }
})

// edit an item 
router.post('/edit-item', checkSeller, (req, res) => {
    try {
        const data = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            image: req.body.image
        }
        Item.findByOneAndUpdate(
            { _id: req.body.data, storeId: req.session.Dealer._id },
            { $set: { data } }, { new: true }
        ).then(editedItem => res.json(editedItem)).catch(e => (res.json({ err: 'something wrong' }), console.log(e)))

    } catch (e) {
        res.json({ err: 'something went wrong' })
        console.log(e);
    }
})


router.post('/login', async (req, res) => {


    if (req.session?.Dealer) return res.json(req.session.Dealer)

    try {
        const { email, password } = req.body;
        const foundDealer = await Dealer.findOne({ email })
        if (foundDealer) {

            const checkPassword = await bcrypt.compare(password, foundDealer.password)
            foundDealer.role = 'd'
            checkPassword ? (req.session.Dealer = foundDealer, res.json(foundDealer)) : res.json({ err: 'Sorry Password is incorrect' })

        } else res.json({ err: 'User not found' })
    } catch (e) {
        res.json({ err: "Sorry something went wrong" })
        console.log(e);
    }
})


router.post('/signUp', async (req, res) => {

    if (req.session.Dealer) return res.json(req.session.Dealer)
    try {
        const data = req.body
        const hashedPassword = await bcrypt.hash(data.password, 12)
        const isUserExist = await Dealer.find({ $or: [{ email: data.email }, { primaryPhone: data.primaryPhone }, { registrationNumber: data.registrationNumber }, { website: data.website }, { alternativeEmail: data.alternativeEmail }] })
        if (isUserExist.length > 0) res.json({ err: 'User already exist with any of your same credential' })
        else {
            const newDealer = new Dealer({
                name: data.name,
                email: data.email,
                password: hashedPassword,
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
            newDealer.save().
                then(user => (req.session.Dealer = user, res.json({ role: 'd', msg: 'Account created please verify you email' })))
                .catch(e => (res.json({ err: 'something went wrong' }), console.log(e)))
        }
    } catch (e) {
        console.log(e);
        res.json(e)
    }
})


module.exports = router;