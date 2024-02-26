import userModel from "../models/userModel.js";
import requestModel from "../models/requestModel.js";
import chatRoomModel from "../models/chatRoomModel.js";

//POST   /send-request
export const sendRequestController=async (req,res)=>{
    const {sentToId,sendType,timeSent}=req.body;
    const user = req.user._id;
    if("chat"===sendType){
        try {
            const user= await userModel.findById({_id:sentToId});
            if(!user){
                res.status(404).send({
                    success:false,
                    message:"User not found among registered Users"
                });
            }
            else {
                const invitesToSameUser=await requestModel.find({$or:[{recieverId:sentToId},{recieverId:sentToId,senderUserId}]});
                if(invitesToSameUser.length==50){
                    res.status(200).send({
                        success:false,
                        message:"Invited user has too many pending invites",
                    });
                }
                const invite= new requestModel({
                    senderUserId:user,
                    recieverId:sentToId,
                    timeSent:timeSent
                });
                await invite.save();
                res.status(201).send({
                    success:true,
                    message:"Invite sent successfully"
                })
            }
        } catch (error) {
            console.log(error);
            req.status(500).send({
                success:false,
                message:"Error while sending request",
                error
            })
        }
    }
}


//GET  /show-requests
export const showRequestsController=async (req,res)=>{
    const user = req.user._id;
    try {
        const invites=await requestModel.find({
            recieverId:user
        }).sort({"timeSent":"des"}).populate({path:"senderUserId",select:"username photo"});
        if(!invites){
            res.status(200).send({
            success:true,
            message : "No pending invites"
            });
        }
        else if(invites.length==50){
            res.status(200).send({
                success:true,
                message:"Maximum possible invites reached",
                invites
            })
        }
        else{
            res.status(200).send({
                success:true,
                message:"Invites fetched successfully",
                invites
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error while fetching requests",
            error
        })
    }
}

//DELETE  /handle-requests
export const handleRequestController=async(req,res)=>{
    const user = req.user._id;
    const {senderId,senderType,isAccepted} = req.body;
    try {
        const invite= await requestModel.findOneAndDelete({senderUserId:senderId,recieverId:user});
        if(!invite){
            res.status(404).send({
                success:false,
                message:"No invite Found"
            });
        }
        if(!isAccepted){
            res.status(200).send({
                success:true,
                message:"Invite Rejected"
            })
        }
        const room = new chatRoomModel({
        user1: user,
        user2: senderId,
        })
        await room.save();
        res.status(200).send({
            success:true,
            message:"Invite accepted successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Error while responding to invite",
            error
        })
    }
}