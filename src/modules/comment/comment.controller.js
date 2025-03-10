import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { fileTypes, multerHost, multerLocal } from "../../middleWare/multer.js";
import { authentcation } from "../../middleWare/auth.js";
import { createCommentSchema, freezeCommentSchema, updateCommentSchema } from "./comment.validation.js";
import { createComment, freezeComment, updateComment } from "./comment.service.js";


const commentRouter = Router({mergeParams:true})

commentRouter.post('/comment',
    authentcation,
    multerHost(fileTypes.image).array("attachments", 5),
    validation(createCommentSchema),
    createComment
)
commentRouter.patch('/updateComment/:commentId',
    authentcation,
    multerHost(fileTypes.image).array("attachments", 5),
    validation(updateCommentSchema),
    updateComment
)
commentRouter.delete('/freezComment/:commentId',
    authentcation,
    validation(freezeCommentSchema),
    freezeComment
)
export default commentRouter
