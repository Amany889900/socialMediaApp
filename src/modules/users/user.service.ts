// interface ISignUp {name:string,email:string,password:string,cPassword:string} // DTO: Data Transfer Object just in development does not imply any validations
import { NextFunction, Request, Response } from "express";
import { confirmEmailSchemaType, FlagType, logoutSchemaType, signInSchemaType, signUpSchema, signUpSchemaType } from "./user.validation";
import { HydratedDocument, Model } from "mongoose";
import userModel, { IUser, RoleType } from "../../DB/model/user.model";
import { DbRepository } from "../../DB/repositories/db.repository";
import { AppError } from "../../utils/errorClass";
import { UserRepository } from "../../DB/repositories/user.repository";
import { Compare, Hash } from "../../utils/hash";
import { generateOTP, sendEmail } from "../../service/sendEmail";
import { emailTemplate } from "../../service/email.template";
import { eventEmitter } from "../../utils/events";
import { GenerateToken } from "../../utils/token";
import { RevokeTokenRepository } from "../../DB/repositories/revokeToken.repository";
import revokeTokenModel from "../../DB/model/revokeToken.model";
import { v4 as uuidv4 } from "uuid";


class UserService {

    // private _userModel:Model<IUser> = userModel
    private _userModel = new UserRepository(userModel)
    private _revokeTokenModel = new RevokeTokenRepository(revokeTokenModel)
    //*************SignUp**************//


signUp = async(req:Request,res:Response,next:NextFunction)=>{
    const {userName,email,password,cPassword,age,address,phone,gender}:signUpSchemaType = req.body;
    if(await this._userModel.findOne({email})){
        throw new AppError("Email already exists",409);
    }
    const hash = await Hash(password);
    const otp = await generateOTP();
    const hashedOtp = await Hash(String(otp));
    const user = await this._userModel.createOneUser({userName,otp:hashedOtp,email,password:hash,age,address,phone,gender})
    eventEmitter.emit("confirmEmail",{email,otp});
    return res.status(201).json({message:`Success!!`,user})
}
//*************SignIn**************//

signIn = async(req:Request,res:Response,next:NextFunction)=>{
    const {email,password}:signInSchemaType = req.body;
    const user = await this._userModel.findOne({email,confirmed:true});
    if(!user){
        throw new AppError("Email is not found or not confirmed yet",409);
    }

    if(!await Compare(password,user?.password!)){
        throw new AppError("Invalid password",400);
    }
    const jwtid = uuidv4();
    const access_token = await GenerateToken({payload:{id:user._id,email:user.email},signature:user.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,options:{expiresIn:'1h',jwtid}})
    const refresh_token = await GenerateToken({payload:{id:user._id,email:user.email},signature:user.role==RoleType.user? process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,options:{expiresIn:'1y',jwtid}})

    return res.status(200).json({message:`Success!!`,access_token,refresh_token})
}
//*************getProfile**************//

getProfile = async(req:Request,res:Response,next:NextFunction)=>{
    

    return res.status(200).json({message:`Success!!`,user:req.user})
}

//*************logout**************//

logout = async(req:Request,res:Response,next:NextFunction)=>{
    
    const {flag}:logoutSchemaType = req.body;

    if(flag == FlagType.all){
        await this._userModel.updateOne({_id:req.user?._id},{changeCredentials:new Date()})
        return res.status(200).json({message:"success, logged out from all devices"});
    }

    await this._revokeTokenModel.create({
        tokenId:req.decoded_access_token?.jti!,
        userId:req.user?._id!,
        expiresAt:new Date(req.decoded_access_token?.exp!*1000)
    })

    return res.status(200).json({message:`Successfully logged out from this device`})
}

//*************confirmEmail**************//

confirmEmail = async(req:Request,res:Response,next:NextFunction)=>{
    const {email,otp} : confirmEmailSchemaType = req.body;
    const user = await this._userModel.findOne({email,confirmed:{$exists:false}});
    if(!user){
        throw new AppError("Email is not found or already confirmed",409);
    }
    if(!await Compare(otp,user?.otp!)){
       throw new AppError("Invalid otp",400);
    }
    await this._userModel.updateOne({email:user?.email},{confirmed:true,$unset:{otp:""}})
    return res.status(200).json({message:`Confirmed!!`})
}

//*************refreshToken**************//

refreshToken = async(req:Request,res:Response,next:NextFunction)=>{

    const jwtid = uuidv4();
    const access_token = await GenerateToken({payload:{id:req.user?._id,email:req.user?.email},signature:req.user?.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,options:{expiresIn:'1h',jwtid}})
    const refresh_token = await GenerateToken({payload:{id:req.user?._id,email:req.user?.email},signature:req.user?.role==RoleType.user? process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,options:{expiresIn:'1y',jwtid}})
    
    await this._revokeTokenModel.create({
        tokenId:req.decoded_access_token?.jti!,
        userId:req.user?._id!,
        expiresAt:new Date(req.decoded_access_token?.exp!*1000)
    })
    

    return res.status(200).json({message:`Success!!`,access_token,refresh_token})
}

}


// lw hb3t ll class params yb2a a3ml export ll class kolo msh instance mno !!
export default new UserService()