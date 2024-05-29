import nodemailer from 'nodemailer';

export function getClient(){
    try{
    const transporter= nodemailer.createTransport({
        service:'Gmail',
        auth:{
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });
    return transporter;
    }
    catch(err){
        console.log(err.message);
    }
}
