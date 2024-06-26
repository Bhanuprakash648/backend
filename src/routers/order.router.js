import { Router } from 'express';
import handler from 'express-async-handler';
import crypto from 'crypto';
import auth from '../middleware/auth.mid.js';
import admin from '../middleware/admin.mid.js';
import { BAD_REQUEST } from '../constants/httpStatus.js';
import { OrderModel } from '../models/order.model.js';
import { OrderStatus } from '../constants/orderStatus.js';
import { UserModel } from '../models/user.model.js';
import { sendEmailReceipt } from '../helpers/mail.helper.js';
import { razorpayInstance } from '../config/razor.config.js';

const router = Router();
router.use(auth);

router.post(
  '/create',
  handler(async (req, res) => {
    const order = req.body;

    if (order.items.length <= 0) res.status(BAD_REQUEST).send('Cart Is Empty!');

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    const newOrder = new OrderModel({ ...order, user: req.user.id });
    await newOrder.save();
    res.send(newOrder);
  })
);

router.post('/razorpay',async(req,res)=>{
  const {amount}=req.body;
  try{
    const options={
      amount:Number(amount*100),
      currency:"INR",
      receipt: crypto.randomBytes(10).toString("hex")
    }
      razorpayInstance.orders.create(options,(err,order)=>{
        if(err){
          return res.status(500).json({message:err.message});
        }
        console.log(order)
        res.status(200).json({
          data:order
        })
      })
  }catch(err){
    res.status(500).json({message:err.message});
  }
})


router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
          .update(sign.toString())
          .digest("hex");
      const isAuthentic = expectedSign === razorpay_signature;
      if (isAuthentic) {
          res.json({
              paymentId:razorpay_payment_id
          });
      }
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error!" });
      console.log(error);
  }
})

router.put(
  '/pay',
  handler(async (req, res) => {
    const { paymentId } = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
      res.status(BAD_REQUEST).send('Order Not Found!');
      return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    sendEmailReceipt(order);

    res.send(order._id);
  })
);

router.get(
  '/track/:orderId',
  handler(async (req, res) => {
    const { orderId } = req.params;
    const user = await UserModel.findById(req.user.id);

    const filter = {
      _id: orderId,
    };

    if (!user.isAdmin) {
      filter.user = user._id;
    }

    const order = await OrderModel.findOne(filter);

    if (!order) return res.send(UNAUTHORIZED);

    return res.send(order);
  })
);

router.get(
  '/newOrderForCurrentUser',
  handler(async (req, res) => {
    const order = await getNewOrderForCurrentUser(req);
    if (order) res.send(order);
    else res.status(BAD_REQUEST).send();
  })
);

router.get('/allstatus', (req, res) => {
  const allStatus = Object.values(OrderStatus);
  res.send(allStatus);
});

router.get(
  '/:status?',
  handler(async (req, res) => {
    const status = req.params.status;
    const user = await UserModel.findById(req.user.id);
    const filter = {};

    if (!user.isAdmin) filter.user = user._id;
    if (status) filter.status = status;

    const orders = await OrderModel.find(filter).sort('-createdAt');
    res.send(orders);
  })
);

const getNewOrderForCurrentUser = async req =>
  await OrderModel.findOne({
    user: req.user.id,
    status: OrderStatus.NEW,
  }).populate('user');
export default router;
