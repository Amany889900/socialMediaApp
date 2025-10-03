import { NextFunction, Request, Response } from "express";
import postModel, { AvailabilityEnum, IPost } from "../../DB/model/post.model";
import userModel from "../../DB/model/user.model";
import { UserRepository } from "../../DB/repositories/user.repository";
import { PostRepository } from "../../DB/repositories/post.repository";
import { AppError } from "../../utils/errorClass";
import { deleteFiles, uploadFiles } from "../../utils/s3.config";
import { v4 as uuidv4 } from "uuid";
import { ActionEnum, likePostDto, likePostQueryDto } from "./post.validation";
import { UpdateQuery } from "mongoose";
import { CommentRepository } from "../../DB/repositories/comment.repository";
import commentModel from "../../DB/model/comment.model";



class PostService{
    private _userModel = new UserRepository(userModel);
    private _postModel = new PostRepository(postModel);
    private _commentModel = new CommentRepository(commentModel);
    constructor(){}

    createPost = async(req:Request,res:Response,next:NextFunction) =>{

          if(req?.body?.tags.length && (await this._userModel.find({filter:{_id:{$in:req?.body?.tags}}})).length !== req?.body?.tags?.length){
             throw new AppError("Invalid user id",400)
          }
          const assetFolderId= uuidv4();
          let attachments:string[]=[];
          if(req.files?.length){
            attachments = await uploadFiles({
                files:req?.files as unknown as Express.Multer.File[],
                path:`users/${req?.user?._id}/posts/${assetFolderId}`
            })
          }

          const post = await this._postModel.create({
            ...req.body,attachments,assetFolderId,createdBy:req.user?._id
          })

          if(!post){
            await deleteFiles({urls:attachments || []})
            throw new AppError("failed to create post",500)
          }
        return res.status(201).json({message:"created!!",post})
    }

      likePost = async(req:Request,res:Response,next:NextFunction) =>{

         const {postId}:likePostDto = req.params as likePostDto 
         const {action}:likePostQueryDto = req.query as likePostQueryDto

         let updateQuery:UpdateQuery<IPost> = {$addToSet:{likes:req.user?._id}}

         if(action === ActionEnum.unlike){
             updateQuery = {$pull:{likes:req.user?._id}}
         }
        

         const post = await this._postModel.findOneAndUpdate({_id:postId,$or:[
            {availability:AvailabilityEnum.public},
            {availability:AvailabilityEnum.private,createdBy:req.user?._id},
            {availability:AvailabilityEnum.friends,createdBy:{$in:[...req.user?.friends || [],req.user?.id]}}, // lw ana friend 3nd 7d yb2o hwa friend 3ndy
         ]},{...updateQuery},{new:true})

         if(!post){
            throw new AppError("failed to like post",404)
         }

        return res.status(201).json({message:`${action}`,post})
    }

        updatePost = async(req:Request,res:Response,next:NextFunction) =>{

         const {postId}:likePostDto = req.params as likePostDto 
         

         const post = await this._postModel.findOne({_id:postId,createdBy:req.user?._id,paranoid:false})

         if(!post){
            throw new AppError("failed to update post or unAuthorized",404)
         }

         if(req?.body?.content){
            post.content = req.body.content
         }

          if(req?.body?.availability){
            post.availability = req.body.availability
         }

          if(req?.body?.allowComment){
            post.allowComment = req.body.allowComment
         }

         if(req?.files?.length){
            await deleteFiles({urls:post.attachments || []}) // old files
            post.attachments = await uploadFiles({
                files:req?.files as unknown as Express.Multer.File[],
                path:`users/${req?.user?._id}/posts/${post.assetFolderId}`
            })
         }

         if(req?.body?.tags?.length){
           if(req?.body?.tags.length && (await this._userModel.find({filter:{_id:{$in:req?.body?.tags}}})).length !== req?.body?.tags?.length){
             throw new AppError("Invalid user id",400)
          }
          post.tags = req.body.tags;
         }

         await post.save();

        return res.status(201).json({message:`update`,post})
    }

      getPosts = async(req:Request,res:Response,next:NextFunction) =>{

         let {page,limit=5} = req.query as unknown as {page:number,limit:number};

        
         // const posts = await this._postModel.find({filter:{}, options:{skip,limit}});
         const {currentPage,docs,countDocuments,numOfPages} = await this._postModel.paginate({filter:{},query:{page,limit},options:{populate:[{path:"comments",populate:{path:"replies"}}]}});
         
         // intensive load on memory performance sy2
         // let result = []
         // for (const doc of docs) {
         //    const comments = await this._commentModel.find({filter:{postId:doc._id}});
         //    result.push({...doc,comments}); // do not forget lean:true in the options
         // }
         // SOLN cursor => delegates the loops to the database not the memory / virtual populate
         return res.status(200).json({message:"success",page:currentPage,countDocuments,numOfPages,posts:docs});
         
        
        
    }
}


export default new PostService()