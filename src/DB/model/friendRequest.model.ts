import mongoose, { Types } from "mongoose";


export interface IFriendRequest {
    sentFrom:Types.ObjectId,
    sentTo:Types.ObjectId,
    acceptedAt:Date
}

const friendRequestSchema = new mongoose.Schema<IFriendRequest>({
    sentFrom:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    sentTo:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    acceptedAt:{type:Date}
}
   ,{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})



friendRequestSchema.pre(["findOne","find","findOneAndUpdate"],function(next){
    const query = this.getQuery()
    const {paranoid,...rest} = query
    if(paranoid===false){
        this.setQuery({...rest})
    }else{
        this.setQuery({...rest,deletedAt:{$exists:false}})
    }
    next();
})

const friendRequestModel = mongoose.models.friendRequest || mongoose.model<IFriendRequest>("friendRequest",friendRequestSchema)

export default friendRequestModel