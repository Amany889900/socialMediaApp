import {Router} from "express"
import CS from './comment.service'
import * as CV from './comment.validation'
import { Validation } from "../../middleware/validation"
import { Authentication } from "../../middleware/Authentication";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";

const commentRouter = Router({mergeParams:true}); // 3shan ngeeb el params mn awel url el posts


commentRouter.post("/",
    Authentication(),
    multerCloud({fileTypes:fileValidation.image}).array("attachments",2),
    Validation(CV.createCommentSchema),
    CS.createComment)


export default commentRouter