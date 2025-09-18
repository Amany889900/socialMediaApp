// interface ISignUp {name:string,email:string,password:string,cPassword:string} // DTO: Data Transfer Object just in development does not imply any validations
import { NextFunction, Request, Response } from "express";
import { confirmEmailSchemaType, confirmLoginSchemaType, FlagType, forgetPasswordSchemaType, likeSchemaType, loginWithGmailSchemaType, logoutSchemaType, resetPasswordSchemaType, signInSchemaType, signUpSchema, signUpSchemaType, twoStepVeriSchemaType, updatePasswordSchemaType } from "./user.validation";
import { HydratedDocument, Model } from "mongoose";
import userModel, { IUser, ProviderType, RoleType } from "../../DB/model/user.model";
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
import {OAuth2Client} from 'google-auth-library';
import { TokenPayload } from "google-auth-library/build/src/auth/loginticket";
import postModel from "../../DB/model/post.model";
import { PostRepository } from "../../DB/repositories/post.repository";
import { createUploadFilePresignedUrl, uploadFile, uploadFiles, uploadLargeFile } from "../../utils/s3.config";
import { StorageEnum } from "../../middleware/multer.cloud";


class UserService {

// private _userModel:Model<IUser> = userModel
    private _userModel = new UserRepository(userModel)
    private _postModel = new PostRepository(postModel)
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
    const user = await this._userModel.findOne({email,confirmed:true,provider:ProviderType.system});
    if(!user){
        throw new AppError("Email is not found or not confirmed yet or invalid provider",409);
    }

    if(!await Compare(password,user?.password!)){
        throw new AppError("Invalid password",400);
    }
    if(user?.twoStep){
    const otp = await generateOTP();
    const hashedOtp = await Hash(String(otp));
    await this._userModel.updateOne({email},{otp:hashedOtp});
    eventEmitter.emit("loginWithTwoStepVeri",{email,otp});
    return res.status(200).json({message:`Check your email for OTP to complete login with 2-step verification`});
    }
    const jwtid = uuidv4();
    const access_token = await GenerateToken({payload:{id:user._id,email:user.email},signature:user.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,options:{expiresIn:'1h',jwtid}})
    const refresh_token = await GenerateToken({payload:{id:user._id,email:user.email},signature:user.role==RoleType.user? process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,options:{expiresIn:'1y',jwtid}})

    return res.status(200).json({message:`Success!!`,access_token,refresh_token})
}

//*************signInConfirmation**************//
signInConfirmation = async(req:Request,res:Response,next:NextFunction)=>{
    const {email,otp} : confirmLoginSchemaType = req.body;
    const user = await this._userModel.findOne({email});
    if(!user){
        throw new AppError("Email is not found",409);
    }
    if(!await Compare(otp,user?.otp!)){
       throw new AppError("Invalid otp",400);
    }
    await this._userModel.updateOne({email:user?.email},{$unset:{otp:""}})
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

//*************loginWithGmail**************//
loginWithGmail = async(req:Request,res:Response,next:NextFunction)=>{

    const {idToken}:loginWithGmailSchemaType = req.body;

  const client = new OAuth2Client();
  async function verify() {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID!,
  });
  const payload = ticket.getPayload();
  return payload;
}
const {email,email_verified,picture,name} = await verify() as TokenPayload
let user = await this._userModel.findOne({email})
  if(!user){
    user = await this._userModel.create({
      userName:name!,
      email:email!,
      confirmed:email_verified!,
      image:picture!,
      password:uuidv4(), // ay value
      provider:ProviderType.google
    }) //b2eet el fields htdrb validationError => required
  }

  if(user?.provider !== ProviderType.google){
    throw new AppError("Please login on system")
  }
  
    const jwtid = uuidv4();
    const access_token = await GenerateToken({payload:{id:user._id,email:user.email},signature:user.role==RoleType.user?process.env.ACCESS_TOKEN_USER!:process.env.ACCESS_TOKEN_ADMIN!,options:{expiresIn:'1h',jwtid}})
    const refresh_token = await GenerateToken({payload:{id:user._id,email:user.email},signature:user.role==RoleType.user? process.env.REFRESH_TOKEN_USER!:process.env.REFRESH_TOKEN_ADMIN!,options:{expiresIn:'1y',jwtid}})

    return res.status(200).json({message:`Success!!`,access_token,refresh_token})

}

//*************forgetPassword**************//
forgetPassword = async(req:Request,res:Response,next:NextFunction)=>{
    const {email}:forgetPasswordSchemaType = req.body;
    const user = await this._userModel.findOne({email,confirmed:{$exists:true}});
    if(!user){
        throw new AppError("Email is not found or not confirmed yet",409);
    }

  
    const otp = await generateOTP();
    const hashedOtp = await Hash(String(otp));
    eventEmitter.emit("forgetPassword",{email,otp});

    await this._userModel.updateOne({email:user?.email},{otp:hashedOtp});
    
    return res.status(200).json({message:`Successfully sent otp`})
}

//*************resetPassword**************//
resetPassword = async(req:Request,res:Response,next:NextFunction)=>{
    const {email,otp,password,cPassword}:resetPasswordSchemaType = req.body;
    const user = await this._userModel.findOne({email,otp:{$exists:true}});
    if(!user){
        throw new AppError("Email is not found or not confirmed yet",409);
    }
    if(!await Compare(otp,user?.otp!)){
        throw new AppError("Invalid OTP",400);
    }
    const hashedPassword = await Hash(password)
    await this._userModel.updateOne({email:user?.email},{password:hashedPassword, $unset:{otp:""}});
    
    return res.status(200).json({message:`Password successfully reset`})
}

//*************updatePassword**************//
updatePassword = async(req:Request,res:Response,next:NextFunction)=>{ 
    const {oldPassword,newPassword}:updatePasswordSchemaType = req.body

    if(!await Compare(oldPassword,req.user?.password!)){
        throw new AppError("Old password is Invalid",400)
    }

    const hashedPassword = await Hash(newPassword);

    await this._userModel.updateOne({email:req.user?.email!},{password:hashedPassword});

    return res.status(200).json({message:`Password successfully updated`})
}

//*************updateProfileInfo**************//
updateProfileInfo = async(req:Request,res:Response,next:NextFunction)=>{ 

    if(req.body.userName!){
        const [fName, lName] = req.body.userName.split(" ");
        await this._userModel.updateOne({email:req.user?.email!},{fName,lName})
    }

    if(req.body.age!){
        await this._userModel.updateOne({email:req.user?.email!},{age:req.body.age!})
    }

     if(req.body.address!){
        await this._userModel.updateOne({email:req.user?.email!},{address:req.body.address!})
    }

     if(req.body.gender!){
        await this._userModel.updateOne({email:req.user?.email!},{gender:req.body.gender!})
    }

     if(req.body.phone!){
        await this._userModel.updateOne({email:req.user?.email!},{phone:req.body.phone!})
    }

    return res.status(200).json({message:`Profile info successfully updated`})
}

//*************updateEmail**************//
updateEmail = async(req:Request,res:Response,next:NextFunction)=>{ 
   
    if(await this._userModel.findOne({email:req.body.email!})){
        throw new AppError("Email already exists",409);
    }

    const otp = await generateOTP();
    const hashedOtp = await Hash(String(otp));
    
    // update new email 
    await this._userModel.updateOne({email:req.user?.email!},{email:req.body.email!,$unset: { confirmed: "" },otp:hashedOtp});
    
    // confirm new email
    eventEmitter.emit("confirmUpdatedEmail",{email:req.body.email!,otp});
    return res.status(200).json({message:`Email successfully updated please confirm new email`});
}

//*************twoStepVeri**************//
twoStepVeri = async(req:Request,res:Response,next:NextFunction)=>{ 

    const otp = await generateOTP();
    const hashedOtp = await Hash(String(otp));
    await this._userModel.updateOne({email:req.user?.email!},{otp:hashedOtp});
    eventEmitter.emit("twoStepVeri",{email:req.user?.email!,otp});
    return res.status(200).json({message:`Check your email for OTP to confirm 2 step verification`});
}

//*************confirmTwoStepVeri**************//
confirmTwoStepVeri = async(req:Request,res:Response,next:NextFunction)=>{ 

    const {email,otp} : twoStepVeriSchemaType = req.body;
    const user = await this._userModel.findOne({email,twoStep:{$exists:false}});
    if(!user){
        throw new AppError("Email is not found or 2-step verification already enabled",409);
    }
    if(!await Compare(otp,user?.otp!)){
       throw new AppError("Invalid otp",400);
    }
    await this._userModel.updateOne({email:user?.email},{twoStep:true,$unset:{otp:""}})
    return res.status(200).json({message:`2-step Verification enabled successfully!!`})
}

//*************like**************//
like = async(req:Request,res:Response,next:NextFunction)=>{ 

    const {postId} : likeSchemaType = req.body;
    const post = await this._postModel.findOne({_id:postId});
    
    if(!post){
       throw new AppError("Post not found",404);
    }

    if (!post.likes.some(id => id.toString() === req.user!._id.toString())) {
         post.likes.push(req.user!._id);
         await this._postModel.bulkSave([post]);
    }
    
 
    return res.status(200).json({message:`You liked this post!`})
}


//*************unLike**************//
unLike = async(req:Request,res:Response,next:NextFunction)=>{ 

    const {postId} : likeSchemaType = req.body;
    const post = await this._postModel.findOne({_id:postId});
    
    if(!post){
       throw new AppError("Post not found",404);
    }

    post.likes = post.likes.filter(
    (id) => id.toString() !== req.user?._id!.toString()
     );
    await this._postModel.bulkSave([post]);
 
    return res.status(200).json({message:`You unliked this post!`})
}

uploadImage = async(req:Request,res:Response,next:NextFunction)=>{

    // const key = await uploadFile({
    //     file:req.file!,
    //     path:`users/${req.user?._id}`,
    // })
    // const key = await uploadLargeFile({
    //     file:req.file!,
    //     path:`users/${req.user?._id}`,
    // })

    //  const key = await uploadFiles({
    //     files:req.files as Express.Multer.File[],
    //     path:`users/${req.user?._id}`,
    // })

    const {originalname,ContentType} =  req.body

    const url = await createUploadFilePresignedUrl({
        originalname,
        ContentType,
        path:`users/${req.user?._id}`
    })

 

    return res.status(200).json({message:"success",url});
}


}


// lw hb3t ll class params yb2a a3ml export ll class kolo msh instance mno !!
export default new UserService()