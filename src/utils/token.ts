import jwt, { JwtPayload } from "jsonwebtoken"
import { AppError } from "./errorClass"
import { UserRepository } from "../DB/repositories/user.repository";
import userModel from "../DB/model/user.model";
import { RevokeTokenRepository } from "../DB/repositories/revokeToken.repository";
import revokeTokenModel from "../DB/model/revokeToken.model";

export enum TokenType{
    access="access",
    refresh="refresh"
}
const _userModel = new UserRepository(userModel);
const _revokeToken = new RevokeTokenRepository(revokeTokenModel);

export const GenerateToken = async({payload,signature,options}:{
    payload:Object,
    signature:string,
    options?:jwt.SignOptions
}):Promise<string>=>{
    return jwt.sign(payload,signature,options)
}

export const VerifyToken = async ({token,signature}:{
    token:string,
    signature:string
}):Promise<JwtPayload>=>{
  return jwt.verify(token,signature) as JwtPayload;
}


export const GetSignature = async(tokenType:TokenType,prefix:string)=>{
   if(tokenType === TokenType.access){
    if(prefix === process.env.BEARER_USER){
        return  process.env.ACCESS_TOKEN_USER;
    }else if(prefix === process.env.BEARER_ADMIN){
        return  process.env.ACCESS_TOKEN_ADMIN;
    }else{
        return null;
    }
   }
   if(tokenType === TokenType.refresh){
     if(prefix === process.env.BEARER_USER){
        return  process.env.REFRESH_TOKEN_USER;
    }else if(prefix === process.env.BEARER_ADMIN){
        return  process.env.REFRESH_TOKEN_ADMIN;
    }else{
        return null;
    }
   }
   return null;
}

export const decodedTokenAndFetchUser = async(token:string,signature:string)=>{
    const decoded_access_token = await VerifyToken({token,signature});
     if(!(decoded_access_token?.email)){
       throw new AppError("Invalid token",400);
     }

    const user = await _userModel.findOne({email:decoded_access_token.email});
    if(!user){
      throw new AppError("User does not exist",404);
    }

    if(!user?.confirmed){
      throw new AppError("Please confirm email first",400);
    }

    if(await _revokeToken.findOne({tokenId:decoded_access_token?.jti})){
      throw new AppError("Token has been revoked",401);
    }

    if(user?.changeCredentials?.getTime()!> decoded_access_token?.iat! *1000 ){
      throw new AppError("Token has been revoked",401);
    }

    return {decoded_access_token,user}
}