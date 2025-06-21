import mongoose from "mongoose";

const connectdb=async()=>{
    mongoose.connection.on('connected',()=>{console.log('Mongodb connected')})
    await mongoose.connect(`${process.env.mongo_url}/mern_auth`)//mern auth is project name
} 

export default connectdb;  