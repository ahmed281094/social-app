import joi from "joi";
import { generalRules } from "../../utilits/generalRules/index.js";



export const createCommentSchema =

    joi.object({
        content: joi.string().alphanum(),
        refId: generalRules.objectId.required(),
        onModel:joi.string().valid("Post","Comment").required(),
        files:joi.array().items(generalRules.file)
    })


    export const updateCommentSchema =

    joi.object({
        content: joi.string().alphanum(),
        postId: generalRules.objectId.required(),
        commentId: generalRules.objectId.required(),
        files:joi.array().items(generalRules.file)
    })
    export const freezeCommentSchema =

    joi.object({
        postId: generalRules.objectId.required(),
        commentId: generalRules.objectId.required(),
    })