const express = require('express')
const app = express()

const errorMiddleware = require('./middleware/error')

app.use(express.json())

// ROutes import
const product = require('./routes/productRoute')

app.use("/api/v1",product)


//middle wares
app.use(errorMiddleware)

module.exports = app