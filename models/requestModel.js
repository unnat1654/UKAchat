import mongoose from "mongoose";

const requestSchema=new mongoose.Schema({
    senderUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    senderGroupId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"groups"
    },
    recieverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    timeSent:{
        type:Date,
        required:true
    }
})

export default mongoose.model("requests",requestSchema,"requests");