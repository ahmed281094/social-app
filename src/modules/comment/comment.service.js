import * as dbService from "../../DB/DBservice.js";
import commentModel from "../../DB/models/comment.model.js";
import postModel from "../../DB/models/post.model.js";
import cloudinary from "../../utilits/cloudinary/index.js";
import { asyncHandler } from "../../utilits/error/errorHandling.js";
import { roleTypes } from "../../DB/models/user.model.js";


export const createComment = asyncHandler(async (req, res, next) => {
    const { refId } = req.params
    const { onModel } = req.body
    if (onModel == "Post") {
        const post = await dbService.findOne({
            model: postModel,
            filter: {
                _id: refId,
                isDeleted: { $exists: false }
            }
        })
        if (!post) {
            return next(new Error("post not found or deleted", { cause: 404 }))
        }
    } else {
        const comment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: refId,
                isDeleted: { $exists: false }
            }
        })
        if (!comment) {
            return next(new Error("comment not found or deleted", { cause: 404 }))
        }
    }
    // if (commentId) {
    //     const comment = await commentModel.findOne({ _id: commentId, isDeleted: { $exists: false }, postId})
    //     if (!comment) {
    //         return next(new Error("inValid comment or post not found", { cause: 404 }))
    //     }
    // }
    if (req?.files?.length) {
        const list = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: "socialApp/comments",
            })
            list.push({ secure_url, public_id })
        }
        req.body.attachments = list
    }
    const comment = await dbService.create({
        model: commentModel,
        query: {
            ...req.body,
            onModel,
            refId,
            userId: req.user._id
        }
    })
    return res.status(201).json({ message: " done ", comment })
})

export const updateComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params
    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            isDeleted: { $exists: false },
            postId,
            userId: req.user._id
        },
        populate: [{
            path: "postId"
        }]
    })
    if (!comment || comment?.postId?.isDeleted) {
        return next(new Error("inValid comment or post not found", { cause: 404 }))
    }
    if (req.files.length) {
        for (const file of comment.attachments) {
            await cloudinary.uploader.destroy(file.public_id)
        }
        const list = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: "socialApp/comments",
            })
            list.push({ secure_url, public_id })
        }
        req.body.attachments = list
    }
    const newComment = await dbService.findByIdAndUpdate({
        model: commentModel,
        id: { _id: commentId },
        update: req.body
    })
    return res.status(201).json({ message: " comment updated successfully  ", comment: newComment })
})

export const freezeComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params
    const comment = await dbService.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            isDeleted: { $exists: false },
            postId,
        },
        populate: [{
            path: "postId"
        }]
    })
    if (!comment || (
        req.user.role != roleTypes.admin
        &&
        req.user._id.toString() != comment.userId.toString()
        &&
        req.user._id.toString() != comment.postId.userId.toString()
    )) {
        return next(new Error("inValid comment or you dont have permession", { cause: 404 }))
    }
    const freezedComment = await dbService.findByIdAndUpdate({
        model: commentModel,
        id: { _id: commentId },
        update: {
            isDeleted: true,
            deletedBy: req.user._id
        }
    })
    return res.status(201).json({ message: " comment freezed successfully", freezedComment })
})