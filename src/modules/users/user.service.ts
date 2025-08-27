interface ISignUp {name:string,email:string,password:string,cPassword:string} // DTO: Data Transfer Object just in development does not imply any validations
import { NextFunction, Request, Response } from "express";
import { signUpSchema } from "./user.validation";

class UserService {
    //*************SignUp**************//


signUp = (req:Request,res:Response,next:NextFunction)=>{
    const {name,email,password,cPassword}:ISignUp = req.body;

    signUpSchema["body"].parse(req.body);
    return res.status(201).json({message:`Success!!`,body:req.body})
}
//*************SignIn**************//

signIn = (req:Request,res:Response,next:NextFunction)=>{

    return res.status(200).json({message:`Success!!`})
}
}

// lw hb3t ll class params yb2a a3ml export ll class kolo msh instance mno !!
export default new UserService()