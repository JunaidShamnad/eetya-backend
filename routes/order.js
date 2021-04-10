const { Router } = require('express');
const orderController = require('../controllers/orderControllers');
const router = Router();

const Order = require('../models/order')

router.post('/buy-now',async ()=>{
    const { productId, storeId, userId, name, price, quantity} = req.body

    const newOrder = new Order({
        storeId:storeId,
        userId:userId,
        items:[{
            productId:productId,
            title:name,
            price:price,
            quantity:quantity
        }]
    })
    await newOrder.save()
})

module.exports = router;