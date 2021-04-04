const Admin = require('../models/admin')
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Dealer = require('../models/dealer')
const Order = require('../models/order')

const verifyAdmin = (req, res, next) => {
    if (req.session.Admin) next()
    else res.json({ loginErr: true })
}
router.get('/', (req, res) => {
    res.json({ data: 'data' })
})
// route to get all data required 
router.get('/getAllUsers', verifyAdmin, async (req, res) => {
    try {
        const allData = await Promise.all([
            User.find(),
            Dealer.find(),
            Order.find()
        ])
        if (allData) res.json(allData)
        else res.json({ err: 'something wrong' })
    } catch (e) {
        console.log(e);
        res.json({ err: true })
    }
})
// route to approve user or seller 
router.get('/approve/sec/:id', verifyAdmin, (req, res) => {
    try {
        if (req.params.sec === 'd') {
            Dealer.findByIdAndUpdate({ _id: req.params.id }, { $set: { approved: true } })
                .then(d => res.json({ success: true })).catch(e => (console.log(e), res.json({ err: true })))
        } else {
            User.findByIdAndUpdate({ _id: req.params.id }, { $set: { approved: true } })
                .then(d => res.json({ success: true })).catch(e => (console.log(e), res.json({ err: true })))
        }
    } catch (e) {
        res.json({ err: 'something wrong' })
        console.log(e);
    }
})
//login admin
// router.post('/create', async (req, res) => {
//     const { email, password } = req.body
//     const hashedPassword = await bcrypt.hash(password, 12)
//     const admin = new Admin({
//         email: email,
//         password: hashedPassword
//     })
//     admin.save().then(data => res.json(data)).catch(e => res.json(e))
// })
router.post('/login', async (req, res) => {
    try {
        if (req.session?.Admin) return res.json({ Admin: true })
        const { email, password } = req.body;
        const foundAdmin = await Admin.findOne({ email: email })
        if (foundAdmin) {
            const admin = await bcrypt.compare(password, foundAdmin.password)
            if (admin) (req.session.Admin = foundAdmin, res.json({ Admin: true }))
            else res.json({ err: 'password wrong' })
        } res.json({ err: 'Username is wrong' })
    } catch (e) {
        res.json({ err: 'Sorry something went wrong' })
    }
})

router.post('/updateCredentials', (req, res) => {

})

module.exports = router;