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

//get user details
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        user,
    })
})

//update suer passowrd
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password")
    
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401))
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password no match",401))
    }

    user.password = req.body.newPassword;

    await user.save()


    sendToken(user,200,res)
})



//update user profile
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
   
    const newUserData={
        name:req.body.name,
        email:req.body.email,

    }

    //! will add cloudinary avatar later

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    
    res.status(200).json({
        success:true
    })
})


//get all users by admin

exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find()
    res.status(200).json({
        success:true,
        users
    })
})

//get single user by admin

exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler(`USer doesnt exist with id ${req.params.id}`,400))
    }

    res.status(200).json({
        success:true,
        user
    })
})


//update user role by admin
exports.updateRole = catchAsyncErrors(async(req,res,next)=>{
   
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role

    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    
    res.status(200).json({
        success:true,
        message:"user has been updated"
    })
})


//delete user  by admin
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
   
    const user = await User.findById(req.params.id)
    
    if(!user){
        return next(new ErrorHandler(`USer doesnt exist with id ${req.params.id}`,400))
    }

    await user.remove()
    
    res.status(200).json({
        success:true,
        message:"user has been deleted"
    })
})