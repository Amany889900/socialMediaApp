import mongoose, { mongo, Schema, Types } from "mongoose";
import { PostRepository } from "../repositories/post.repository";
import { OnModelEnum } from "./comment.model";

export enum AllowCommentEnum  {
    allow="allow",
    deny="deny"
}

export enum AvailabilityEnum  {
    private="private",
    public="public",
    friends="friends",
}



export interface IPost {
    // userId:Types.ObjectId,
    content?:string,
    attachments?:string[],
    assetFolderId?:string,
    createdBy:Types.ObjectId,
    allowComment:AllowCommentEnum,
    availability:AvailabilityEnum,
    tags?:Types.ObjectId[],
    likes?:Types.ObjectId[],
    deletedBy?:Types.ObjectId,
    restoredBy?:Types.ObjectId,
    deletedAt?:Date,
    restoredAt:Date
}

const postSchema = new mongoose.Schema<IPost>({
//    userId:{
//     type: mongoose.Schema.Types.ObjectId,
//     ref:"User",
//     required:true
//    },
   content:{
    type:String,
    minLength:5,
    maxLength:10000,
    required:function(){return this.attachments?.length === 0}
   },
   attachments:[String],
   assetFolderId:{type:String},
   createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
   allowComment:{type:String,enum:AllowCommentEnum,default:AllowCommentEnum.allow},
   availability:{type:String,enum:AvailabilityEnum,default:AvailabilityEnum.public},
   tags:[{type:Schema.Types.ObjectId,ref:"User"}],
   likes:[{type:Schema.Types.ObjectId,ref:"User"}],
   deletedAt:Date,
   deletedBy:{type:Schema.Types.ObjectId,ref:"User"},
   restoredAt:Date,
   restoredBy:{type:Schema.Types.ObjectId,ref:"User"}
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    strictQuery:true // ignore non-existent fields as paranoid
})

postSchema.pre(["findOne","find"],function(next){
    const query = this.getQuery()
    const {paranoid,...rest} = query
    if(paranoid===false){
        this.setQuery({...rest})
    }else{
        this.setQuery({...rest,deletedAt:{$exists:false}})
    }
    next();
})

postSchema.virtual("comments",{
    ref:"comment",
    localField:"_id",
    foreignField:"refId",
    options:{
        onModel:OnModelEnum.post // get the real comment not the replies
    }
})


const postModel = mongoose.models.post || mongoose.model<IPost>("post",postSchema)

export default postModel