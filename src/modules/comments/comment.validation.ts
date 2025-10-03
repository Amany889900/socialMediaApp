import * as z from "zod"
import { AllowCommentEnum, AvailabilityEnum } from "../../DB/model/post.model"
import mongoose, { Schema } from "mongoose"
import { generalRules } from "../../utils/generalRules"
import { OnModelEnum } from "../../DB/model/comment.model"



export const createCommentSchema ={
  params: z.strictObject({
    postId:generalRules.id,
    commentId:generalRules.id.optional(),
  }),
    body:z.strictObject({
      content:z.string().min(5).max(10000).optional(),
      attachments:z.array(generalRules.file).max(2).optional(),
      assetFolderId: z.string().optional(),
      tags:z.array(generalRules.id).refine((value)=>{return new Set(value).size === value?.length},{message:"Duplicate tags"}).optional(),
      onModel:z.enum(OnModelEnum)
    }).superRefine((data,ctx)=>{
      if(!data.content && !data.attachments?.length){
        ctx.addIssue({
            code:"custom",
            path:["content"],
            message:"at least a content or attachments must be provided"
        })
      }
    })

   
}

 