import {Router} from "express"
import US from "./user.service"
import { Validation } from "../../middleware/validation";
import { signUpSchema } from "./user.validation";

const userRouter = Router();


userRouter.post("/signUp",Validation(signUpSchema),US.signUp);
userRouter.post("/signIn",US.signIn);






export default userRouter