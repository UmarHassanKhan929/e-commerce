const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

//create product - admin
exports.createProduct = catchAsyncErrors(async (req, res) => {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product,
    });
});

//update product - admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindandModify: false,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

//delete product - admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }
    await product.remove();

    res.status(200).json({
        success: true,
        message: "product deleted successfully",
    });
});

//get all products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    const resultPerPage = process.env.RPP; //for backend pagination
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    const products = await apiFeature.query;

    res.status(200).json({
        success: true,
        products,
        productCount,
    });
});

//get  product detail
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

//create new review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });


  // get all reviews of product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews:product.reviews
    });
});

  // get all reviews of product
  exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }

    const reviews = product.reviews.filter(rev=>rev._id.toString()!== req.query.id.toString())

    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,ratings,numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindandModify:false,
    })

    res.status(200).json({
        success: true
    });
});