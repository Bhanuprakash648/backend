import mongoose from 'mongoose';
const loginSchema=mongoose.Schema(
    {
        first:{
            type: String,
            requried: true,
        },
        last:{
            type:String,
            required:true, 
        },
        email:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,
        },
    },
    {
        timestamps:true,
    }
);
export const Login=mongoose.model('login',loginSchema);
