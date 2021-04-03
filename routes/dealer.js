const router = require('express').Router()
const Dealer = require('../models/dealer')
const bcrypt = require('bcryptjs')
const Item = require('../models/item')


router.get('/', (req, res) => {
    res.json('Dealers')
})


router.post('/add-item',(req,res)=>{
    try {
        
  

    } catch (e) {
        res.json({err:'Sorry something went wrong'})
    }
})




router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundDealer = await Dealer.findOne({ email })
        if (foundDealer) {

            const admin = await bcrypt.compare(password, foundDealer.password)
            admin ? res.json(foundDealer) : res.json('Sorry Password is incorrect')

        } else res.json('User not found')
    } catch (e) {
        res.json("Sorry something went wrong")
        console.log(e);
    }
})


router.post('/sign-up', async (req, res) => {
    try {
        const data = req.body
        const hashedPassword = await bcrypt.hash(data.password, 12)
        const isUserExist = await Dealer.find({ $or: [{ email: data.email }, { primaryPhone: data.primaryPhone }, { registrationNumber: data.registrationNumber }, { website: data.website }, { alternativeEmail: data.alternativeEmail }] })
        if (isUserExist.length > 0) res.json({ err: 'User already exist with any of your same credential' })
        else {
            const newDealer = new Dealer({
                name: data.username,
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
            newDealer.save().then(user => res.json(user)).catch(e => res.json({ err: e }))
        }
    } catch (e) {
        console.log(e);
        res.json(e)
    }
})


module.exports = router;