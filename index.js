import express from 'express';
import mongoose from 'mongoose';
import {Login} from './models/login.js';
import cors from 'cors';
const app=express()
app.use(express.json())
app.use(cors(

));
app.get('/',(req,res)=>{
    return res.status(234).send("welcome to node js");
});

mongoose.connect("mongodb+srv://bp7386:Bhanu648@bp.5bpxfjk.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    console.log("database is connected");
}).catch((error)=>{
    console.log(error);
});
app.get("/data",async(req,res)=>{
    try{
        const data=await Login.find({});
        return res.status(200).send(data);
    }
    catch(err){
        return res.status(400).send({message:err.message});
    }
});
app.post("/register",async (req,res)=>{
    try{
        if(!req.body.email){
            return res.status(400).send({message:err.message});
        }
        const data=await Login.findOne({email:req.body.email})
        if(data){
            console.log(data);
            return res.status(400).send({message:"user already exists"});
        }
        if(!req.body.first||!req.body.last||!req.body.email||!req.body.password){
            return res.status(400).send({
                message:'send all required fields'
            });

        }
        const newuser={
            email:req.body.email,
            last:req.body.last,
            first:req.body.first,
            password:req.body.password,
        };
        const n= await Login.create(newuser);
        console.log(newuser);
        return response.status(201).send(n);
    }catch(err){
        return res.status(400).send({message:err.message});
    }
});
app.post("/login",async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    const check= await Login.findOne({email:email});
    if(check){
        if(check.password==password){
            return res.json("login success");
        }
        else{
            return res.json("wrong password");
        }
    }
    else{
        return res.json("user not found");
    }
})

app.listen(8000,()=>{
    console.log('listening on port 8000');
});
