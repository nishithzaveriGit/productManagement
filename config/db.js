import mongoose from "mongoose";

const connectDb = async () => {
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log('Database Connected!!!', '\n',connect.connection.host,'\n', connect.connection.name)
    } catch(err){
        console.log('Database connection error', err);
        process.exit(1);
    }
}

export default connectDb;