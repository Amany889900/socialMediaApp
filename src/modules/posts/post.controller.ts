import {Router} from "express"
import PS from './post.service'
import * as PV from './post.validation'
import { Validation } from "../../middleware/validation"
import { Authentication } from "../../middleware/Authentication";
import { fileValidation, multerCloud } from "../../middleware/multer.cloud";
import commentRouter from "../comments/comment.controller";

const postRouter = Router({});

postRouter.use("/:postId/comments{/:commentId/reply}",commentRouter);

postRouter.post("/",
    Authentication(),
    multerCloud({fileTypes:fileValidation.image}).array("attachments",2),
    Validation(PV.createPostSchema),
    PS.createPost)

postRouter.patch("/:postId",Authentication(),Validation(PV.likePostSchema),PS.likePost)
postRouter.patch("/update/:postId",Authentication(),
multerCloud({fileTypes:fileValidation.image}).array("attachments",2),
Validation(PV.updatePostSchema),PS.updatePost)

postRouter.get("/",PS.getPosts);

postRouter.delete("/freeze/:postId",Authentication(),Validation(PV.freezeSchema),PS.freezePost);
postRouter.patch("/unfreeze/:postId",Authentication(),Validation(PV.unfreezeSchema),PS.unfreezePost);

export default postRouter