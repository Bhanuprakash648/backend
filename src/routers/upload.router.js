import { Router } from 'express';
import admin from '../middleware/admin.mid.js';
import multer from 'multer';
import handler from 'express-async-handler';
import {OrderModel } from '../models/order.model.js'
import { BAD_REQUEST } from '../constants/httpStatus.js';
import { configCloudinary } from '../config/cloudinary.config.js';
import {OrderStatus } from '../constants/orderStatus.js';
import { DeliveryEmailReceipt} from '../helpers/mail.delivery.js'
import {sendEmailReceipt} from '../helpers/mail.helper.js';

const router = Router();
const upload = multer();

router.put(
  '/updateStatus/:orderId',
  admin,
  handler(async (req, res) => {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = OrderStatus.DELIVERED;
    await order.save();
    DeliveryEmailReceipt(order);
    res.json({ message: 'Order status updated successfully', order });
  })
);


router.post(
  '/',
  admin,
  upload.single('image'),
  handler(async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(BAD_REQUEST).send();
      return;
    } 
    const imageUrl = await uploadImageToCloudinary(req.file?.buffer);
    res.send(imageUrl);
  })
);

const uploadImageToCloudinary = imageBuffer => {
  const cloudinary = configCloudinary();  

  return new Promise((resolve, reject) => {
    if (!imageBuffer) reject(null);

    cloudinary.uploader
      .upload_stream((error, result) => {
        if (error || !result) reject(error);
        else resolve(result.url);
      })
      .end(imageBuffer);
  });
};

export default router;
