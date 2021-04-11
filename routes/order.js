const { Router } = require('express');
const orderController = require('../controllers/orderControllers');
const router = Router();

const Order = require('../models/order')
const nodemailer = require("nodemailer");


const Email=(dealerEmail, buyerEmail, name, price, quantity)=>{
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "eetyainfo@gmail.com",
          pass: "eetya123"
        },
      });

      var mailOptions = {
        from: "eetyawebsite@gmail.com",
        to: `${dealerEmail} , ${buyerEmail}, eetyawebsite@gmail.com`,
        subject: `${name} is ordered`,
        html:
          "<h1>Hi ,</h1></br><h3>" +
          name +
          " has ordered.</h3></br><h3>Price: " +
          price +
          "</h3></br><h3>Quantity: " +
          quantity
      };
    

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.json({ status: false });
        } else {
          console.log("Email sent:" + info.response);
          res.json({ status: true });
        }
      });
}

router.post('/buy-now', (req, res)=>{
    const { productId, storeId, userId, name, price, quantity, dealerEmail, userEmail} = req.body

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
    newOrder.save().then(()=>{
        res.json({status:true})
        Email(dealerEmail, userEmail, name, price, quantity)
    })
    
})

module.exports = router;