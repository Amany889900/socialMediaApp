import {Router} from "express"
import US from "./user.service"
import { Validation } from "../../middleware/validation";
import * as UV from "./user.validation";
import { Authentication } from "../../middleware/Authentication";
import { TokenType } from "../../utils/token";

const userRouter = Router();


userRouter.post("/signUp",Validation(UV.signUpSchema),US.signUp);
userRouter.patch("/confirmEmail",Validation(UV.confirmEmailSchema),US.confirmEmail);
userRouter.post("/signIn",Validation(UV.signInSchema),US.signIn);
userRouter.post("/loginWithGmail",Validation(UV.loginWithGmailSchema),US.loginWithGmail);
userRouter.get("/profile",Authentication(),US.getProfile);
userRouter.get("/refreshToken",Authentication(TokenType.refresh),US.refreshToken);
userRouter.post("/logout",Authentication(),Validation(UV.logoutSchema),US.logout);
userRouter.patch("/forgetPassword",Validation(UV.forgetPasswordSchema),US.forgetPassword);
userRouter.patch("/resetPassword",Validation(UV.resetPasswordSchema),US.resetPassword);
userRouter.patch("/updatePassword",Authentication(),Validation(UV.updatePasswordSchema),US.updatePassword);
userRouter.patch("/updateProfileInfo",Authentication(),Validation(UV.updateProfileInfoSchema),US.updateProfileInfo);
userRouter.patch("/updateEmail",Authentication(),Validation(UV.updateEmailSchema),US.updateEmail);






export default userRouter