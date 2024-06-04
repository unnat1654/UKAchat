import mongoose from "mongoose";

const requestSchema=new mongoose.Schema({
    senderUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true,
        immutable: true,
    },
    recieverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true,
        immutable: true,
    },
    timeSent:{
        type:Date,
        required:true,
        immutable: true,
    }
})

export default mongoose.model("requests",requestSchema,"requests");