const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter product Name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Enter product description plis"]
    },
    price:{
        type:Number,
        required:[true,"enter product price"],
        maxLength:[8,"Enter valid bruh"]
    },
    rating:{
        type:Number,
        default:0
    },
    images:[{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }],
    category:{
        type:String,
        required:[true,"plis enter product category"]
    },
    stock:{
        type:Number,
        required:[true,"ENter product stock plis"],
        default:1
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            name:{
                type:String,required:true
            },rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",productSchema)