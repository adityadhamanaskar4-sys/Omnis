const router = require('express')();
const Room = require('../schemas/RoomSchema');
const roomMembers = require('../schemas/RoomMember');
const { verifyAuthToken } = require('../utils/jwt');
const RoomMember = require('../schemas/RoomMember');
const crypto = require('crypto');

router.post('/', verifyAuthToken, async (req, res) => {
    try {
        const room = new Room({
            name: req.body.name,
            ownerId: req.user.id,
            isPublic: req.body.isPublic,
            inviteCode: crypto.randomBytes(4).toString("hex"),
        })
        await room.save();
        const member = new roomMembers({
            roomId: room._id,
            userId: room.ownerId,
            role: "owner",
        })
        await member.save()
        return res.status(201).json(room)
    }catch(err){
        return res.status(500).json({message:"Internal Server error"})
    }
});
router.get('/', verifyAuthToken, async(req,res)=>{
    try{
        const rooms=await RoomMember.find({userId:req.user.id}).populate("roomId");
        return res.status(200).json(rooms)
    }catch(err){
        return res.status(500).json({message:"Internal Server error"})
    }
});
router.get('/:id', verifyAuthToken, async(req,res)=>{
    try{
        const member=await RoomMember.findOne({
            roomId:req.params.id,
            userId:req.user.id,
        });
        if(!member)
            return res.status(403).json({message:"Unauthorized Access"})
        const room=await Room.findById({_id:req.params.id})
        return res.status(200).json(room);
    }catch(err){
        return res.status(500).json({message:"Internal Server error"})
    }
});
router.delete('/:id', verifyAuthToken, async(req,res)=>{
    try{
        const room=await Room.findOne({_id:req.params.id});
        if(!room)
            return res.status(404).json({message:"Not found"})
        const member=await RoomMember.findOne({
            userId:req.user.id,
            roomId:req.params.id
        })
        if(!member||member.role!='owner')
            return res.status(403).json({message:"Unauthorized Access"})
        const deletedrooms=await Room.findOneAndDelete({_id:req.params.id})
        const deletedmembers=await RoomMember.deleteMany({roomId:req.params.id});
        return res.status(200).json({room:deletedrooms,members:deletedmembers});
    }catch(err){
        return res.status(500).json({message:"Internal Server error"})
    }
});
router.post('/:id/join', verifyAuthToken, async(req,res)=>{
    try{
        const room=await Room.findOne({_id:req.params.id});
        if(!room)
            return res.status(404).json({message:"Not found"})
        const member=await RoomMember.findOne({
            userId:req.user.id,
            roomId:req.params.id
        })
        if(member)
            return res.status(409).json({message:"Already joined"})
        if(room.isPublic){
            const newMember=new RoomMember({
                roomId:req.params.id,
                userId:req.user.id,
                role:"editor"
            })
            await newMember.save();
            return res.status(200).json({room:room})
        }else{
            return res.status(403).json({message:"private"})
        }
        return res.status(200).json({room:room})
    }catch(err){
        return res.status(500).json({message:"Internal Server error"})
    }
});
router.post('/:id/leave', verifyAuthToken, async(req,res)=>{
    try{
        const room=await Room.findOne({_id:req.params.id});
        if(!room)
            return res.status(404).json({message:"Not Found"})
        const member=await RoomMember.findOne({
            userId:req.user.id,
            roomId:req.params.id
        })
        if(member.role=="owner")
            return res.status(400).json({message:"can not leave the room"})
        const deletedmembers=await RoomMember.findOneAndDelete({
            userId:req.user.id,
            roomId:req.params.id
        });
        return res.status(200).json({room:room})
    }catch(err){
        return res.status(500).json({message:"Internal Server error"})
    }
});
module.exports = router;