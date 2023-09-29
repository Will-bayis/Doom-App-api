const mongoose = require("mongoose");
require('dotenv').config({ path: './config/.env' });


async function connectDB() {
    try {
        mongoose.set("strictQuery", false);
        await
            mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log(err)
        process.exit();
    }
};


module.exports = connectDB;
