const mongoose = require("mongoose");
const RoomMemberSchema = new mongoose.Schema(
{
    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"rooms",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    role:{
        type:String,
        enum:["owner","editor","viewer"],
        default:"viewer",
        required:true
    },

    joinedAt:{
        type:Date,
        default:Date.now
    }
});
RoomMemberSchema.index({ roomId:1 });
RoomMemberSchema.index({ userId:1 });
RoomMemberSchema.index({ roomId:1,userId:1 },{ unique:true });
module.exports = mongoose.model("roomMembers", RoomMemberSchema);