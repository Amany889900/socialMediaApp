import { NextFunction, Request, Response } from "express";
import postModel, { AllowCommentEnum, AvailabilityEnum, IPost } from "../../DB/model/post.model";
import userModel from "../../DB/model/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { PostRepository } from "../../DB/repositories/post.repository";
import { AppError } from "../../utils/errorClass";
import { deleteFiles, uploadFiles } from "../../utils/s3.config";
import { v4 as uuidv4 } from "uuid";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import commentModel, { IComment, OnModelEnum } from "../../DB/model/comment.model";
import { CommentRepository } from "../../DB/repositories/comment.repository";
import { populate } from "dotenv";



class CommentService{
    private _userModel = new UserRepository(userModel);
    private _postModel = new PostRepository(postModel);
    private _commentModel = new CommentRepository(commentModel);
    constructor(){}

    createComment = async(req:Request,res:Response,next:NextFunction) =>{
           const {postId,commentId} = req.params;
           let {content,tags,attachments,onModel} = req.body;
           let doc: HydratedDocument<IPost | IComment> | null = null;

           if(commentId || onModel==OnModelEnum.comment){
            // if(onModel !== OnModelEnum.comment){
            //   throw new AppError("onModel must be comment",400)
            // }
            const comment = await this._commentModel.findOne(
              {
                _id:commentId,
                refId:postId
              },undefined,
              {
                populate:{
                  path:"refId",
                  match:{
                  allowComment:AllowCommentEnum.allow,
                   $or:[
            {availability:AvailabilityEnum.public},
            {availability:AvailabilityEnum.private,createdBy:req.user?._id},
            {availability:AvailabilityEnum.friends,createdBy:{$in:[...req.user?.friends || [],req.user?.id]}}, // lw ana friend 3nd 7d yb2o hwa friend 3ndy
         ] }
              }
            }
            )
            if(!comment?.refId){ //null
               throw new AppError("comment not found or you are not authorized",404)
            }
            doc = comment;
            
           }else if(onModel == OnModelEnum.post ){
                    const post = await this._postModel.findOne({
            _id: postId,
            allowComment:AllowCommentEnum.allow,
           $or:[
            {availability:AvailabilityEnum.public},
            {availability:AvailabilityEnum.private,createdBy:req.user?._id},
            {availability:AvailabilityEnum.friends,createdBy:{$in:[...req.user?.friends || [],req.user?.id]}}, // lw ana friend 3nd 7d yb2o hwa friend 3ndy
         ]
           })
           if(!post){
            throw new AppError("post is not found or you are not authorized",404)
           }
           doc = post;
           }

     
          if(tags?.length && (await this._userModel.find({filter:{_id:{$in:tags}}})).length !== tags?.length){
             throw new AppError("Invalid user id",400)
          }

          const assetFolderId= uuidv4();
          if(attachments?.length){
            attachments = await uploadFiles({
                files:req?.files as unknown as Express.Multer.File[],
                path:`users/${doc?.createdBy}/posts/${doc?.assetFolderId}/comments/${assetFolderId}`
            })
          }

          const comment = await this._commentModel.create({
           content,tags,attachments,assetFolderId,onModel,refId:doc?._id as unknown as Types.ObjectId,createdBy: req?.user?._id as unknown as Types.ObjectId
          })

          if(!comment){
            await deleteFiles({urls:attachments || []})
            throw new AppError("failed to create comment",500)
          }
        return res.status(201).json({message:"created!!",comment})
    }

    
}


export default new CommentService()