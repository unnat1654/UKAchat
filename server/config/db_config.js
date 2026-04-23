import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.DATABASE_URL);
    console.log(
      `Connected to MongoDB database - ${connect.connection.host}`.bgMagenta
        .white
    );
  } catch (error) {
    console.log(`Error in Mongodb:\n ${error}`.bgRed.white);
  }
};

export default connectDB;
