
import { EventEmitter } from "events";
import { generateOTP, sendEmail } from "../service/sendEmail";
import { emailTemplate } from "../service/email.template";
import { deleteFile, getFile } from "./s3.config";
import { UserRepository } from "../DB/repositories/user.repository";
import userModel from "../DB/model/user.model";
export const eventEmitter = new EventEmitter();

 eventEmitter.on("confirmEmail",async(data)=>{

        const {email,otp} = data
       
        await sendEmail({to:email,subject:"Confirm Email to complete sign up",html:emailTemplate(otp as unknown as string,"Email confirmation")})
 });

  eventEmitter.on("confirmUpdatedEmail",async(data)=>{

        const {email,otp} = data
       
        await sendEmail({to:email,subject:"Confirm Email to complete update",html:emailTemplate(otp as unknown as string,"Email confirmation")})
 });

eventEmitter.on("forgetPassword",async(data)=>{

        const {email,otp} = data
       
        await sendEmail({to:email,subject:"Confirm Email to reset password",html:emailTemplate(otp as unknown as string,"Email confirmation")})
 });

 eventEmitter.on("twoStepVeri",async(data)=>{

        const {email,otp} = data
       
        await sendEmail({to:email,subject:"Confirm Email to enable 2-step verification",html:emailTemplate(otp as unknown as string,"Email confirmation")})
 });

  eventEmitter.on("loginWithTwoStepVeri",async(data)=>{

        const {email,otp} = data
       
        await sendEmail({to:email,subject:"Login with 2-step verification",html:emailTemplate(otp as unknown as string,"Login with 2-step verification")})
 });


eventEmitter.on("UploadProfileImage",async(data)=>{
       const {userId,oldKey,Key,expiresIn} = data;
       console.log({data})
       const _userModel = new UserRepository(userModel);
       setTimeout(async()=>{
           try{
             await getFile({
              Key
           })
           await _userModel.findOneAndUpdate({
                     _id:userId
                  },{
                     $unset:{tempProfileImage:""}
                  }) 
       // delete old file
       if(oldKey){
              await deleteFile({Key:oldKey})
       }
           console.log("success");
           }catch(error:any){
             console.log({error});
             if(error?.Code == "NoSuchKey"){
               if(!oldKey){
                  await _userModel.findOneAndUpdate({
                     _id:userId
                  },{
                     $unset:{profileImage:""}
                  })
               }else{
                  await _userModel.findOneAndUpdate({
                     _id:userId
                  },{
                     $set:{profileImage:oldKey},
                     $unset:{tempProfileImage:""}
                  }) 
               }
             }
           }
       },expiresIn*1000);
})
