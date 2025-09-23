import {Router} from "express"
import US from "./user.service"
import { Validation } from "../../middleware/validation";
import * as UV from "./user.validation";
import { Authentication } from "../../middleware/Authentication";
import { TokenType } from "../../utils/token";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";

const userRouter = Router();


userRouter.post("/signUp",Validation(UV.signUpSchema),US.signUp);
userRouter.patch("/confirmEmail",Validation(UV.confirmEmailSchema),US.confirmEmail);
userRouter.patch("/confirmTwoStepVeri",Validation(UV.twoStepVeriSchema),US.confirmTwoStepVeri);
userRouter.patch("/confirmLogin",Validation(UV.confirmLoginSchema),US.signInConfirmation);
userRouter.post("/signIn",Validation(UV.signInSchema),US.signIn);
userRouter.post("/loginWithGmail",Validation(UV.loginWithGmailSchema),US.loginWithGmail);
// userRouter.post("/upload",Authentication(),
//     multerCloud({fileTypes:fileValidation.image}).single("file")
//     ,US.uploadImage);
    userRouter.post("/upload",Authentication(),
    // multerCloud({fileTypes:fileValidation.image}).array("files")
    US.uploadImage);
userRouter.get("/profile",Authentication(),US.getProfile);
userRouter.get("/refreshToken",Authentication(TokenType.refresh),US.refreshToken);
userRouter.post("/logout",Authentication(),Validation(UV.logoutSchema),US.logout);
userRouter.patch("/forgetPassword",Validation(UV.forgetPasswordSchema),US.forgetPassword);
userRouter.patch("/resetPassword",Validation(UV.resetPasswordSchema),US.resetPassword);
userRouter.patch("/updatePassword",Authentication(),Validation(UV.updatePasswordSchema),US.updatePassword);
userRouter.patch("/updateProfileInfo",Authentication(),Validation(UV.updateProfileInfoSchema),US.updateProfileInfo);
userRouter.patch("/updateEmail",Authentication(),Validation(UV.updateEmailSchema),US.updateEmail);
userRouter.patch("/twoStepVeri",Authentication(),US.twoStepVeri);
userRouter.delete("/freeze{/:userId}",Authentication(),Validation(UV.freezeSchema),US.freezeAccount);
userRouter.patch("/unfreeze/:userId",Authentication(),Validation(UV.unfreezeSchema),US.unfreezeAccount);






export default userRouter