const ErrorHandler = require('../utils/errorHandler')

module.exports = (err,req,res,next) =>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"

    //mongo db wrong id error = cast error
    if(err.name === "CastError"){
        const message = `Resource not valid / found. Look here: ${err.path}`
        err = new ErrorHandler(message,400)
    }



    res.status(err.statusCode).json({
        success:false,message:err.stack
    })
}