const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')

const User = require('../models/userModel')
const sendToken = require('../utils/sendToken')

const sendEmail = require('../utils/sendEmail.js')

exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const{name,email,password,role} = req.body
    const user = await User.create({
        name,email,password,role,avatar:{
            public_id:"this pub id",
            url:"url avatar"
        }
    })

    sendToken(user,201,res)
})


exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body

    //check for email and pass given

    if(!email || !password){
        return next(new ErrorHandler("Enter enter and pass",400))
    }

    const user = await User.findOne({email:email}).select("+password")
    if(!user){
        return next(new ErrorHandler("invalid email or pass",401))
    }

    const isPasswordMatch = user.comparePassword(password)
    if(!isPasswordMatch){
        return next(new ErrorHandler("invalid email or pass",401))
    }

    sendToken(user,200,res)

})


exports.logoutUser = catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:"logged Out"
    })
})


//forgot password email sending to user for reset password with token
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User not found",404))
    }

    //get toekn for reset

    const resetToken = user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    const resetPasswordurl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    const message = `your password reset token is \n\n ${resetPasswordurl} \n if not requested you it is, then ignore`

    try{
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message:``
        })

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })
    }catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave:false})
        return next(new ErrorHandler(error.message,500))

    }

})

//reset password using the forgot token received
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired ",404))
    }

    if(req.body.password != req.body.confirmPassword){
        return next(new ErrorHandler("password donot match",400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save();

    sendToken(user,200,res)

})