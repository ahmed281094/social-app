import { Router } from "express";
import { createPost, freezePost, getPosts, likePost, unfreezePost, updatePost } from "./post.service.js";
import { createPostSchema, freezePostSchema,likePostSchema, unfreezePostSchema, updatePostSchema } from "./post.validation.js";
import { validation } from "../../middleWare/validation.js";
import { fileTypes, multerHost } from "../../middleWare/multer.js";
import { authentcation, authorization } from "../../middleWare/auth.js";
import commentRouter from "../comment/comment.controller.js";
const postRouter = Router()

postRouter.use("/:refId/comments",commentRouter)

postRouter.post('/createPost', 
    authentcation,
    multerHost(fileTypes.image).array("attachments", 5),
    validation(createPostSchema),
    createPost
)

postRouter.patch('/updatePost/:postId',
    authentcation,
    multerHost(fileTypes.image).array("attachments", 5),
    validation(updatePostSchema),
    updatePost
)
postRouter.delete('/freezePost/:postId',
    validation(freezePostSchema),
    authentcation,
    freezePost
)

postRouter.patch('/unfreezePost/:postId',
    validation(unfreezePostSchema),
    authentcation,
    unfreezePost
)

// postRouter.patch('/like/:postId',
//     validation(likePostSchema),
//     authentcation,
//     likePost
// )

postRouter.patch('/like/:postId',
    validation(likePostSchema),
    authentcation,
    likePost
)
postRouter.get('/posts',
    // authentcation,
    getPosts
)

export default postRouter;