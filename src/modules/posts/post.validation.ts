import * as z from "zod"
import { AllowCommentEnum, AvailabilityEnum } from "../../DB/model/post.model"
import mongoose, { Schema, Types } from "mongoose"
import { generalRules } from "../../utils/generalRules"

export enum ActionEnum {
    like="like",
    unlike="unlike"
}
export const createPostSchema ={
    body:z.strictObject({
      content:z.string().min(5).max(10000).optional(),
      attachments:z.array(generalRules.file).max(2).optional(),
      assetFolderId: z.string().optional(),
      allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.allow).optional(),
      availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.public).optional(),
      tags:z.array(generalRules.id).refine((value)=>{return new Set(value).size === value?.length},{message:"Duplicate tags"}).optional()
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

 export const likePostSchema = {
        params:z.strictObject({
            postId:generalRules.id
        }),

        query:z.strictObject({
            action:z.enum(ActionEnum).default(ActionEnum.like)
        })
    }

export const updatePostSchema ={
    body:z.strictObject({
      content:z.string().min(5).max(10000).optional(),
      attachments:z.array(generalRules.file).max(2).optional(),
      assetFolderId: z.string().optional(),
      allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.allow).optional(),
      availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.public).optional(),
      tags:z.array(generalRules.id).refine((value)=>{return new Set(value).size === value?.length},{message:"Duplicate tags"}).optional()
    }).superRefine((data,ctx)=>{
      if(!Object.values(data).length){
        ctx.addIssue({
            code:"custom",
            message:"at least one field is required"
        })
      }
    })


   
}


export const freezeSchema = {
    params: z.strictObject({
    postId: z
      .string()
      .refine((id) => Types.ObjectId.isValid(id), {
        message: "postId must be a valid ObjectId"
      })
  }).required()
}

export const unfreezeSchema = {
  params: z.strictObject({
    postId: z
      .string()
      .refine((id) => Types.ObjectId.isValid(id), {
        message: "postId must be a valid ObjectId"
      })
  }).required()
};







export type freezeSchemaType = z.infer<typeof freezeSchema.params>
export type unfreezeSchemaType = z.infer<typeof unfreezeSchema.params>
    export type likePostDto = z.infer<typeof likePostSchema.params>
    export type likePostQueryDto = z.infer<typeof likePostSchema.query>