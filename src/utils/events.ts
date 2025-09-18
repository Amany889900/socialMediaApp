
import { EventEmitter } from "events";
import { generateOTP, sendEmail } from "../service/sendEmail";
import { emailTemplate } from "../service/email.template";
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