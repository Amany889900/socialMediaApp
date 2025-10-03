import { NextFunction, Request, Response } from "express";
import { RoleType } from "../DB/model/user.model";

export const Authorization = (accessRoles:RoleType[]=[])=>{
return (req:Request,res:Response,next:NextFunction) =>{
  if(!accessRoles.includes(req?.user?.role!)){
    throw new Error("User not authorized",{cause:401})
  }
  return next();
}
}