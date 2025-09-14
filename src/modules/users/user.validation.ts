import * as z from "zod"
import { GenderType } from "../../DB/model/user.model"

export enum FlagType {
    all="all",
    current="current"
}

export const signInSchema = {
    body:z.object({
        email:z.email(),
        password:z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
       
    }).required()
}

export const loginWithGmailSchema = {
    body: z.strictObject({
        idToken:z.string(),
    }).required()
}

export const signUpSchema = {
    body:signInSchema.body.extend({
        userName:z.string().min(2).max(15).trim(),
        cPassword:z.string(),
        age: z.number().min(18).max(60),
        address: z.string(),
        phone: z.string(),
        gender: z.enum([GenderType.male,GenderType.female])
    }).required().superRefine((data,ctx)=>{
       if(data.password !== data.cPassword){
        ctx.addIssue({code:"custom",path:["cPassword"],message:"passwords do not match"})
       };
    })
}

export const confirmEmailSchema = {
    body:z.strictObject({
        email:z.email(),
        otp: z.string().regex(/^\d{6}$/).trim()  
    }).required()
}

export const logoutSchema = {
    body:z.strictObject({
        flag:z.enum(FlagType)
    }).required()
}

export const forgetPasswordSchema = {
    body:z.strictObject({
        email:z.email()
    }).required()
}
export const updateEmailSchema = forgetPasswordSchema;


export const resetPasswordSchema = {
    body:confirmEmailSchema.body.extend({
        password:z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
        cPassword:z.string(),
    }).required().superRefine((value,ctx)=>{
        if(value.password !== value.cPassword){
            ctx.addIssue({
                code:"custom",
                path:["cPassword"],
                message:"passwords does not match"
            })
        }
    })
}

export const updatePasswordSchema = {
    body:z.strictObject({
        oldPassword:z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
        newPassword:z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
        cNewPassword:z.string(),
    }).required().superRefine((value,ctx)=>{
        if(value.newPassword !== value.cNewPassword){
            ctx.addIssue({
                code:"custom",
                path:["cNewPassword"],
                message:"passwords does not match"
            })
        }
    })
}

export const updateProfileInfoSchema = {
    body:z.object({
        userName:z.string().min(2).max(15).trim().optional(),
        age: z.number().min(18).max(60).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        gender: z.enum([GenderType.male,GenderType.female]).optional()
    })
}



export type signUpSchemaType = z.infer<typeof signUpSchema.body>
export type signInSchemaType = z.infer<typeof signInSchema.body>
export type loginWithGmailSchemaType = z.infer<typeof loginWithGmailSchema.body>
export type confirmEmailSchemaType = z.infer<typeof confirmEmailSchema.body>
export type logoutSchemaType = z.infer<typeof logoutSchema.body>
export type forgetPasswordSchemaType = z.infer<typeof forgetPasswordSchema.body>
export type resetPasswordSchemaType = z.infer<typeof resetPasswordSchema.body>
export type updatePasswordSchemaType = z.infer<typeof updatePasswordSchema.body>