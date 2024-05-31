import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();
export const razorpayInstance=new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});