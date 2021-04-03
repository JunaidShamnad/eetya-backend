const router = require('express').Router()
const Dealer = require('../models/dealer')
const bcrypt = require('bcryptjs')
const Item = require('../models/item')


router.get('/', (req, res) => {
    res.json('Dealers')
})


router.post('/add-item',(req,res)=>{
      const data = req.body
   if(!req.session?.Dealer) return res.json({loginErr:true})

    try {
          const newItem = new Item({
            storeId : '60674897ef835a5c9d1f20c5'  ,
            title : data.title,
            description : data.description,
            category : data.category,
            price : data.price ,
            image : data.image
          })
 
          newItem.save().then(item=>(res.json(item),console.log(item))).catch(e=>(res.json({err:'Something went wrong'}),console.log(e)))
    

    } catch (e) {
        res.json({err:'Sorry something went wrong'})
        console.log(e);
    }
})




router.post('/login', async (req, res) => {
    
     if(req.session?.Dealer) return res.json({loggedIn:true})

    try {
        const { email, password } = req.body;
        const foundDealer = await Dealer.findOne({ email })
        if (foundDealer) {

            const admin = await bcrypt.compare(password, foundDealer.password)
            admin ? (req.session.Dealer = foundDealer,res.json(foundDealer)) : res.json({err:'Sorry Password is incorrect'})

        } else res.json({err:'User not found'})
    } catch (e) {
        res.json({err:"Sorry something went wrong"})
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