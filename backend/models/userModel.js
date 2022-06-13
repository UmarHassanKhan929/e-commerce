const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Plis enter valid name"],
        maxlength:[40,"is that even valid ??"]
    },
    email:{
        type:String,
        required:[true,"ENter emiaal"],
        unique:true,
        validate:[validator.isEmail,'plis enter valid email brh']
    },
    password:{
        type:String,
        required:[true,"plis enter password"],
        minlength:[8,"length of password be greater than 8"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user",

    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
})

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next()
    }

    this.password = await bcrypt.hash(this.password,10)
})


//jwt token for instant login after registration
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SEC,{
        expiresIn:process.env.JWT_EXP
    })
}

//compare hashed password

userSchema.methods.comparePassword = async function(enteredpassword){
    return await bcrypt.compare(enteredpassword,this.password);
}


//generating password reset token

userSchema.methods.getResetPasswordToken = function(){
    //generate token
    const resetToken = crypto.randomBytes(20).toString("hex")

    //hashing and adding to user schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire = Date.now()+10*60*1000

    return resetToken
}
module.exports = mongoose.model("User",userSchema)