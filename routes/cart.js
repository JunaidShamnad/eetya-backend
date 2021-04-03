const { Router } = require('express');
const cartController = require('../controllers/cartControllers');
const router = Router();

function hello(req, res, next) {
    console.log('hello');
    next()
}

router.get('/cart/:id', hello, cartController.get_cart_items);
router.post('/cart/:id', hello, cartController.add_cart_item);
router.delete('/cart/:userId/:itemId', hello, cartController.delete_item);

module.exports = router;