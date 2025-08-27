import * as z from "zod"


export const signUpSchema = {
    body:z.object({
        name:z.string().min(2).max(5).trim(),
        email:z.email(),
        password:z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
        cPassword:z.string()
    }).required().refine((data)=>{
        return data.password === data.cPassword;
    },{
        error:"Passwords do not match",
        path:["cPassword"]
    })
}