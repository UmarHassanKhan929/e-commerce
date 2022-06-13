//to check whether user is authorized to visit that page or that function

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");

exports.isAuthenticated = catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Pleae login to access this resource",401))
    }

    const decodedData = jwt.verify(token,process.env.JWT_SEC)

    req.user = await User.findById(decodedData.id)

    next()
})


exports.authorizedRoles = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Roles: ${req.user.role} is not allowed to access this resource`,403))
        } 

        next();
    }
}