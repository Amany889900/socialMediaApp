import mongoose, { HydratedDocument, mongo, Schema, Types } from "mongoose";
import { IPost } from "./post.model";



export enum OnModelEnum {
    post="post",
    comment="comment"
}

export interface IComment {
    content?:string,
    attachments?:string[],
    assetFolderId?:string,
    createdBy:Types.ObjectId,
    commentId?:Types.ObjectId,
    tags?:Types.ObjectId[],
    likes?:Types.ObjectId[],
    deletedBy?:Types.ObjectId,
    restoredBy?:Types.ObjectId,
    deletedAt?:Date,
    restoredAt:Date,
    refId:Types.ObjectId, // child-parent relation
    onModel:OnModelEnum
}

const commentSchema = new mongoose.Schema<IComment>({

   content:{
    type:String,
    minLength:5,
    maxLength:10000,
    required:function(){return this.attachments?.length === 0}
   },
   attachments:[String],
   assetFolderId:{type:String},
   createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
   refId:{type:Schema.Types.ObjectId,refPath:"onModel",required:true},
   onModel:{type:String,enum:OnModelEnum,required:true},
   commentId:{type:Schema.Types.ObjectId,ref:"comment"},
   tags:[{type:Schema.Types.ObjectId,ref:"User"}],
   likes:[{type:Schema.Types.ObjectId,ref:"User"}],
   deletedAt:Date,
   deletedBy:{type:Schema.Types.ObjectId,ref:"User"},
   restoredAt:Date,
   restoredBy:{type:Schema.Types.ObjectId,ref:"User"}
},{
    timestamps:true,
    strictQuery:true, // ignore non-existent fields as paranoid
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})

commentSchema.pre(["findOne","find","findOneAndUpdate"],function(next){
    const query = this.getQuery()
    const {paranoid,...rest} = query
    if(paranoid===false){
        this.setQuery({...rest})
    }else{
        this.setQuery({...rest,deletedAt:{$exists:false}})
    }
    next();
})

commentSchema.virtual("replies",{
    ref:"comment",
    localField:"_id",
    foreignField:"refId",
    options:{
        onModel:OnModelEnum.comment // get the replies not real comments
}})



const commentModel = mongoose.models.comment || mongoose.model<IComment>("comment",commentSchema)

export default commentModel