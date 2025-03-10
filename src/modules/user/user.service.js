import * as dbservice from "../../DB/DBservice.js";
import postModel from "../../DB/models/post.model.js";
import userModel, { providerTypes, roleTypes } from "../../DB/models/user.model.js";
import { decodedToken, tokenTypes } from "../../middleWare/auth.js";
import cloudinary from "../../utilits/cloudinary/index.js";
import { compareHashing, Encrypt, Hash } from "../../utilits/encryption/index.js";
import { asyncHandler } from "../../utilits/error/errorHandling.js";
import { eventEmitter } from "../../utilits/sendEmailEvents/sendEmail.event.js";
import { generateToken, verifyToken } from "../../utilits/token/index.js";
import { OAuth2Client } from 'google-auth-library'


export const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone, role, gender } = req.body
    const emailExsit = await dbservice.findOne({ model: userModel, filter: { email } })
    if (emailExsit) {
        return next(new Error("email already exists", { cause: 409 }))
    }
    if (!req?.file) {
        return next(new Error("please upload photo", { cause: 400 }))
    }

    // const arrPaths =[]
    // for (const file of req.files.images) {
    //     arrPaths.push(file.path)
    // }


    // const arrPaths = []
    // for (const file of req.files) {
    //     const {secure_url,public_id} = await cloudinary.uploader.upload(file.path)
    //     arrPaths.push({secure_url,public_id})
    // }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "socialApp/users",
        // use_filename:true,
        // public_id:"ahmed",
        // unique_filename:true,
        // resource_type:"video",
    })

    const cipherText = await Encrypt({ key: phone, SECERET_KEY: process.env.SECRET_KEY })
    const hash = await Hash({ key: password, SALT_ROUNDS: process.env.SALT_ROUNDS })
    eventEmitter.emit("sendEmailConfirmation", { email })
    const user = await dbservice.create({
        model: userModel,
        query: {
            name,
            email,
            password: hash,
            phone: cipherText,
            // image: req.files.image[0].path,
            image: { secure_url, public_id },
            role,
            gender

            // coverImage:arrPaths
        }
    })

    return res.status(201).json({ message: "User created successfully", user })
})

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { code, email } = req.body
    const user = await dbservice.findOne({ model: userModel, filter: { email, confirmed: false } })
    if (!user) {
        return next(new Error("email not exists or already confirmed", { cause: 404 }))
    }
    const match = await compareHashing({ key: code, hashed: user.otpEmail })
    if (!match) {
        return next(new Error("invalid otp code", { cause: 401 }))
    }
    await dbservice.updateOne({ model: userModel, update: { confirmed: true, $unset: { otpEmail: 0 } } })
    return res.status(201).json({ message: "User confirmed successfully", user })
})

export const login = asyncHandler(async (req, res, next) => {
    const { password, email } = req.body
    const user = await dbservice.findOne({
        model: userModel,
        filter: {
            email, confirmed: true,
            isDeleted: { $exists: false }
        }
    })
    if (!user) {
        return next(new Error("email not exists or not confirmed yet", { cause: 404 }))
    }

    const match = await compareHashing({ key: password, hashed: user.password })
    if (!match) {
        return next(new Error("invalid password", { cause: 401 }))
    }

    const access_token = await generateToken({
        payload: { email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_TOKEN_ADMIN,
        option: { expiresIn: "1d" }
    })

    const refresh_token = await generateToken({
        payload: { email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.REFRESH_SIGNATURE_USER : process.env.REFRESH_SIGNATURE_ADMIN,
        option: { expiresIn: "1w" }
    })

    return res.status(201).json({
        message: "done", token: {
            access_token,
            refresh_token
        }
    })
})

export const refreshToken = asyncHandler(async (req, res, next) => {
    const { authorization } = req.body
    const user = await decodedToken({ authorization, tokenType: tokenTypes.refresh, next })
    const access_token = await generateToken({
        payload: { email: user.email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_TOKEN_ADMIN,
        option: { expiresIn: "1d" }
    })
    return res.status(201).json({
        message: "done", token: {
            access_token,
        }
    })
})

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await dbservice.findOne({
        model: userModel,
        filter: {
            email,
            isDeleted: { $exists: false }
        }
    })
    if (!user) {
        return next(new Error("email not exist", { cause: 404 }))
    }
    eventEmitter.emit("forgetPassword", { email })
    return res.status(201).json({ message: "done" })
})

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, newPassword } = req.body
    const user = await dbservice.findOne({
        model: userModel,
        filter: {
            email,
            isDeleted: { $exists: false }
        }
    })
    if (!user) {
        return next(new Error("email not exists", { cause: 404 }))
    }
    const match = await compareHashing({ key: code, hashed: user.otpPassword })
    if (!match) {
        return next(new Error("invalid otp", { cause: 401 }))
    }
    const hash = await Hash({ key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS })
    await dbservice.updateOne({
        model: userModel,
        update: {
            password: hash,
            confirmed: true,
            $unset: { otpPassword: 0 }
        }
    })
    return res.status(201).json({ message: "done" })
})

export const loginWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body
    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload
    }
    const { name, email, email_verified, picture } = await verify()
    let user = await dbservice.findOne({ model: userModel, filter: { email } })
    if (!user) {
        user = await dbservice.create({
            model: userModel, query: {
                name,
                email,
                confirmed: email_verified,
                image: picture,
                provider: providerTypes.google
            }
        })
    }
    if (user.provider != providerTypes.google) {
        return next(new Error("please login with system", { cause: 401 }))
    }
    const access_token = await generateToken({
        payload: { email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_ADMIN,
        option: { expiresIn: "1d" }
    })
    return res.status(201).json({ message: "Done", token: access_token })
})

export const updateProfile = asyncHandler(async (req, res, next) => {
    if (req.body.phone) {
        req.body.phone = await Encrypt({ key: req.body.phone, SECERET_KEY: process.env.SECRET_KEY })
    }
    if (req.file) {
        await cloudinary.uploader.destroy(req.user.image.public_id)
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: "socialApp/users"
        })
        req.body.image = { secure_url, public_id }
    }
    const user = await dbservice.findByIdAndUpdate({
        model: userModel,
        id: { _id: req.user._id },
        update: req.body
    })
    return res.status(201).json({ message: "done", user })
})

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { email, oldPassword, newPassword } = req.body
    const emailexsit = await dbservice.findOne({
        model: userModel,
        filter: {
            email,
            isDeleted: { $exists: false }
        }
    })
    if (!emailexsit) {
        return next(new Error("email not exsist", { cause: 400 }))
    }
    if (!await compareHashing({ key: oldPassword, hashed: req.user.password })) {
        return next(new Error("inValid old password ", { cause: 400 }))
    }
    const hash = await Hash({ key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS })
    const user = await dbservice.findByIdAndUpdate({
        model: userModel,
        id: { _id: req.user._id },
        update: {
            password: hash,
            changePasswordAt: Date.now()
        }
    })
    return res.status(201).json({ message: "done", user })
})

export const shareProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const user = await dbservice.findOne({
        model: userModel,
        filter: {
            _id: id,
            isDeleted: { $exists: false }
        }
    })
    if (!user) {
        return next(new Error("email not exsist or deleted", { cause: 400 }))
    }
    if (req.user._id.toString() === id) {
        return res.status(201).json({ message: "done", user: req.user })
    }
    const emailExsit = user.viewers.find(viewer => {
        return viewer.userId.toString() === req.user._id.toString()
    })
    if (emailExsit) {
        emailExsit.time.push(Date.now())
        if (emailExsit.time.length > 5) {
            emailExsit.time = emailExsit.time.slice(-5)
        }
    } else {
        user.viewers.push({ userId: req.user._id, time: [Date.now()] })
    }
    await user.save()
    return res.status(201).json({ message: "done", user })
})

export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await dbservice.findOne({
        model: userModel,
        filter: {
            email,
            isDeleted: { $exists: false }
        }
    })
    if (user) {
        return next(new Error("email already exsist", { cause: 409 }))
    }
    await dbservice.updateOne({
        model: userModel
        , filter: { _id: req.user._id }
        , update: { tempEmail: email }
    })
    eventEmitter.emit("sendEmailConfirmation", { email: req.user.email, id: req.user._id })
    eventEmitter.emit("sendNewEmailConfirmation", { email, id: req.user._id })
    return res.status(201).json({ message: "done" })
})

export const replaceEmail = asyncHandler(async (req, res, next) => {
    const { oldCode, newCode } = req.body
    const user = await dbservice.findOne({
        model: userModel,
        filter: {
            _id: req.user._id,
            isDeleted: { $exists: false }
        }
    })
    if (!user) {
        return next(new Error("user not exsist or deleted", { cause: 400 }))
    }
    if (!await compareHashing({ key: oldCode, hashed: user.otpEmail })) {
        return next(new Error("inValid old code", { cause: 400 }))
    }
    if (!await compareHashing({ key: newCode, hashed: user.otpNewEmail })) {
        return next(new Error("inValid new code", { cause: 400 }))
    }
    await dbservice.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        update: {
            email: user.tempEmail,
            $unset: {
                tempEmail: 0,
                otpEmail: 0,
                otpNewEmail: 0
            },
            changePasswordAt: Date.now()
        }
    })
    return res.status(201).json({ message: "done" })
})

export const dashboard = asyncHandler(async (req, res, next) => {
    const data = await Promise.all([
        userModel.find(),
        postModel.find()
    ])
    return res.status(201).json({ message: "done", data })
})

export const updateRole = asyncHandler(async (req, res, next) => {
    const { userId } = req.params
    const { role } = req.body
    const data = req.user.role === roleTypes.superAdmin ? { role: { $nin: [roleTypes.superAdmin] } }
        : { role: { $nin: [roleTypes.superAdmin, roleTypes.admin] } }
    const user = await dbservice.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: userId,
            isDeleted: { $exists: false },
            ...data
        },
        update: {
            role,
            updatedBy: req.user._id
        }
    })
    if (!user) {
        return next(new Error("user not exsist or deleted", { cause: 404 }))
    }
    return res.status(201).json({ message: "done", user })
})
