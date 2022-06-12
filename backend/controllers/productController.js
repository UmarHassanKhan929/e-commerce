const Product = require('../models/productModel')

//create product - admin
exports.createProduct = async (req,res)=>{
    const product = await Product.create(req.body)
    
    res.status(201).json({
        success:true,
        product
    })
}



//update product - admin
exports.updateProduct = async (req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return res.status(500).json({success:false,message:"prodcuuct not found"})
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindandModify:false})
    
    res.status(200).json({
        success:true,
        product
    })
}

//delete product - admin
exports.deleteProduct = async (req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return res.status(500).json({success:false,message:"prodcuuct not found"})
    }
    await product.remove()

    res.status(200).json({
        success:true,
        message:"product deleted successfully"
    })
}

//get  product detail
exports.getProductDetails = async (req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return res.status(500).json({success:false,message:"prodcuuct not found"})
    }

    res.status(200).json({
        success:true,
        product
    })
}

//get all products
exports.getAllProducts = async (req,res)=>{
    const products = await Product.find()
    res.status(200).json({
        success:true,
        products
    })
}