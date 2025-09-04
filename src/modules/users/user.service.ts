// interface ISignUp {name:string,email:string,password:string,cPassword:string} // DTO: Data Transfer Object just in development does not imply any validations
import { NextFunction, Request, Response } from "express";
import { signUpSchema, signUpSchemaType } from "./user.validation";
import { HydratedDocument, Model } from "mongoose";
import userModel, { IUser } from "../../DB/model/user.model";
import { DbRepository } from "../../DB/repositories/db.repository";
import { AppError } from "../../utils/errorClass";
import { UserRepository } from "../../DB/repositories/user.repository";
import { Hash } from "../../utils/hash";
import { generateOTP, sendEmail } from "../../service/sendEmail";
import { emailTemplate } from "../../service/email.template";
import { eventEmitter } from "../../utils/events";

class UserService {

    // private _userModel:Model<IUser> = userModel
    private _userModel = new UserRepository(userModel)
    //*************SignUp**************//


signUp = async(req:Request,res:Response,next:NextFunction)=>{
    const {userName,email,password,cPassword,age,address,phone,gender}:signUpSchemaType = req.body;
    
    if(await this._userModel.findOne({email})){
        throw new AppError("Email already exists",409);
    }

   

    const hash = await Hash(password);
    const user = await this._userModel.createOneUser({userName,email,password:hash,age,address,phone,gender})
    eventEmitter.emit("confirmEmail",{email});
    return res.status(201).json({message:`Success!!`,user})
}
//*************SignIn**************//

signIn = (req:Request,res:Response,next:NextFunction)=>{

    return res.status(200).json({message:`Success!!`})
}
}

// lw hb3t ll class params yb2a a3ml export ll class kolo msh instance mno !!
export default new UserService()