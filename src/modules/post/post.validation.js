import joi from "joi";
import { generalRules } from "../../utilits/generalRules/index.js";



export const createPostSchema =
    joi.object({
        content: joi.string().min(3).required(),
        files: joi.array().items(generalRules.file)
    }).required()

export const updatePostSchema =
    joi.object({
        postId: generalRules.objectId.required(),
        content: joi.string().min(3),
        files: joi.array().items(generalRules.file)
    })

export const freezePostSchema =

    joi.object({
        postId: generalRules.objectId.required()
    })
export const unfreezePostSchema =

    joi.object({
        postId: generalRules.objectId.required()
    })
// export const likePostSchema =

//     joi.object({
//         action: joi.string().valid("like", "unlike").required(),
//         postId: generalRules.objectId.required()
//     })

    export const likePostSchema =
    joi.object({
        postId: generalRules.objectId.required()
    })