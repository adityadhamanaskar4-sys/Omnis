const mongoose = require("mongoose");
const RoomSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:50
    },
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    isPublic:{
        type:Boolean,
        default:false
    },
    inviteCode:{
        type:String,
        required:true,
        unique:true
    }
},{timestamps:true});
module.exports = mongoose.model("rooms", RoomSchema);