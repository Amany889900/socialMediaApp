import * as z from "zod"
import { GenderType } from "../../DB/model/user.model"



export const signUpSchema = {
    body:z.object({
        userName:z.string().min(2).max(15).trim(),
        email:z.email(),
        password:z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
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

export type signUpSchemaType = z.infer<typeof signUpSchema.body>