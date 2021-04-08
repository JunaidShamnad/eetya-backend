const Admin = require('../models/admin')
const router = require('express').Router()
const bcrypt = require('bcryptjs')

const category = require('../models/category');


const verifyAdmin = (req, res, next) => {
    if (req.session.Admin) next()
    else res.json({ loginErr: true })
}
router.get('/', (req, res) => {
    res.json({ data: 'data' })
})

router.post('/login', async (req, res) => {
    try {

        const { username, password } = req.body;
        const foundAdmin = await Admin.findOne({ username: username })
        if (foundAdmin) {
            const admin = await bcrypt.compare(password, foundAdmin.password)
            if (admin) res.json('Login success')
            else res.json({ err: 'password wrong' })
        } res.json({ err: 'Username is wrong' })
    } catch (e) {
        res.json({ err: 'Sorry something went wrong' })
    }
})

router.post('/updateCredentials', (req, res) => {

})

router.post('/create-category', (req, res)=>{

    const newCategory = new category({
        categoryName:req.body.categoryName
    })
    newCategory.save()
    .then((category)=>res.json({status:true}))
    .catch((e)=>res.json({status:false, error:e}))
})

router.post('/delete-category', (req, res)=>{
    category.deleteOne({_id:req.body.id})
    .then(()=>res.json({status:true}))
    .catch(()=>res.json({status:false}))
})

router.post('/edit-category', (req, res)=>{
    category.replaceOne({_id:req.body.id}, {categoryName:req.body.categoryName})
    .then(()=>res.json({status:true}))
    .catch(()=>res.json({status:false}))
})

module.exports = router;