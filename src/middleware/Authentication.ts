import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errorClass";
import { decodedTokenAndFetchUser, GetSignature, TokenType} from "../utils/token";



export const Authentication = (tokenType:TokenType = TokenType.access)=>{
    return async(req:Request,res:Response,next:NextFunction) =>{
     const {authorization} = req.headers;
     const [prefix,token] = authorization?.split(" ") || []; // hnst8na 3nd el condition el fo2
     if(!prefix || !token){
        throw new AppError("token does not exist",400);
     }
     const signature = await GetSignature(tokenType,prefix);

     if(!signature){
        throw new AppError("Invalid signature",400);
     }

     const decoded = await decodedTokenAndFetchUser(token,signature);

     if(!decoded){
        throw new AppError("Invalid token",400);
     }
     req.user=decoded?.user; // a pass el user ll middle ware el b3d kda 3n taree2 el request
     req.decoded_access_token=decoded?.decoded_access_token;
     return next();
     
}
}