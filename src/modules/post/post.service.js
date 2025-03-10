
import * as dbService from "../../DB/DBservice.js";
import commentModel from "../../DB/models/comment.model.js";
import postModel from "../../DB/models/post.model.js";
import { roleTypes } from "../../DB/models/user.model.js";
import cloudinary from "../../utilits/cloudinary/index.js";
import { asyncHandler } from "../../utilits/error/errorHandling.js";
import { pagination } from "../../utilits/featurs/pagination.js";


export const createPost = asyncHandler(async (req, res, next) => {
    if (req?.files.length) {
        const images = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(
                file.path,
                { folder: "socialApp/posts" }
            )
            images.push({ secure_url, public_id })
        }
        req.body.attachments = images
    }
    const post = await dbService.create({
        model: postModel,
        query: {
            ...req.body,
            userId: req.user._id
        }
    })
    return res.status(201).json({ message: "done", post })
})

export const updatePost = asyncHandler(async (req, res, next) => {
    const { postId } = req.params
    const post = await dbService.findOne(
        {
            model: postModel,
            filter: {
                _id: postId,
                userId: req.user._id,
                isDeleted: { $exists: false }
            }
        })
    if (!post) {
        return next(new Error("post not found or not belong to you", { cause: 404 }))
    }
    if (req?.files.length) {
        for (const file of post.attachments) {
            await cloudinary.uploader.destroy(file.public_id)
        }
        const images = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(
                file.path,
                { folder: "socialApp/posts" }
            )
            images.push({ secure_url, public_id })
        }
        post.attachments = images
    }
    if (req.body.content) {
        post.content = req.body.content
    }
    await post.save()
    return res.status(201).json({ message: "done", post })
})

export const freezePost = asyncHandler(async (req, res, next) => {
    const { postId } = req.params
    const condition = req.user.role === roleTypes.admin ? {} : { userId: req.user._id }
    const post = await dbService.findOneAndUpdate({
        model: postModel, filter: {
            _id: postId,
            ...condition,
            isDeleted: { $exists: false }
        },
        update: { isDeleted: true, deletedBy: req.user._id }
    })
    if (!post) {
        return next(new Error("post not found or already deleted", { cause: 404 }));
    }
    return res.status(201).json({ message: "done", post })
})


export const unfreezePost = asyncHandler(async (req, res, next) => {
    const { postId } = req.params
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: postId,
            isDeleted: { $exists: true },
            deletedBy: req.user._id
        },
        update: { $unset: { deletedBy: 0, isDeleted: 0 } }
    })
    if (!post) {
        return next(new Error("post not found or already deleted", { cause: 404 }));
    }
    return res.status(201).json({ message: "done", post })
})


// export const likePost = asyncHandler(async (req, res, next) => {
//     const { postId } = req.params
//     const {action} = req.query
//     const data = action === 'like' ?  { $addToSet: { likes:  req.user._id } }:{ $pull: { likes:  req.user._id } }
//     const post = await postModel.findOneAndUpdate({
//         _id: postId,
//         isDeleted: { $exists: false }
//     },
//         data,
//         { new: true }
//     )
//     if (!post) {
//         return next(new Error("post not found or deleted", { cause: 404 }));
//     }
//     return res.status(201).json({ message: "done", post })
// })


export const likePost = asyncHandler(async (req, res, next) => {
    const { postId } = req.params
    const post = await dbService.findOne(
        {
            model: postModel,
            filter: {
                _id: postId,
                isDeleted: { $exists: false },
                likes: { $in: [req.user._id] }
            }
        })
    let updatePost;
    let action
    if (post) {
        updatePost = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: postId,
                isDeleted: { $exists: false }
            },
            update: { $pull: { likes: req.user._id } }
        })
        action = 'unlike'
    } else {
        updatePost = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: postId,
                isDeleted: { $exists: false }
            },
            update: { $addToSet: { likes: req.user._id } }
        })
        action = 'like'
    }
    if (!updatePost) {
        return next(new Error("post not found or deleted", { cause: 404 }));
    }
    return res.status(201).json({ message: `${action}`, post: updatePost })
})


export const getPosts = asyncHandler(async (req, res, next) => {
    // const posts = await postModel.find({ isDeleted: { $exists: false } }).lean()
    // const list = []
    // for (let post of posts) {
    //     const comments = await commentModel.find({ postId: post._id })
    //     // post=post.toObject()
    //     post.comments = comments
    //     list.push(post)
    // }

    // const cursor = postModel.find({ isDeleted: { $exists: false } }).lean().cursor();
    // const list = []
    // for (let post = await cursor.next(); post != null; post = await cursor.next()) {
    //     const comments = await commentModel.find({ postId: post._id })
    //     post.comments = comments
    //     list.push(post)
    // }

    // const posts = await postModel.find({ isDeleted: { $exists: false } })
    // .populate([
    //     {
    //         path: 'comments',
    //         match:{
    //             commentId:{$exists: false},
    //             deletedBy:{$exists: false},
    //             isDeleted:{$exists: false}
    //         },
    //         populate:{
    //             path: 'reply',
    //         }
    //     }
    // ])


    const { data, _page } = await pagination({ model: postModel, page: req.query.page })

    return res.status(201).json({ message: "done", page: _page, posts: data })
})