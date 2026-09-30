import mongoose from "mongoose";


async function connectDb() {
    try{
        mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDb connected");
    } catch (err) {
        console.log(`mongo db connection failed ${err.message}`);
    }
} 


export default connectDb
