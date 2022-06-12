const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose
        .connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then((data) =>
            console.log("DB Connection Successfull: " + data.connection.host)
        )
};

module.exports = connectDatabase
