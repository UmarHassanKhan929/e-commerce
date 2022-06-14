const express = require('express')
const cookirParser = require('cookie-parser')
const app = express()

const errorMiddleware = require('./middleware/error')

app.use(express.json())
app.use(cookirParser())
// ROutes import
const product = require('./routes/productRoute')
const user = require('./routes/userRoute')
const order = require("./routes/orderRoute")

//routes
app.use("/api/v1",product)
app.use("/api/v1",user)
app.use("/api/v1",order)


//middle wares
app.use(errorMiddleware)

module.exports = app