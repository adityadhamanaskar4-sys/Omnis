const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@localhost:27017/omnis?authSource=admin`);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
module.exports=connectDB;