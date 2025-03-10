import joi from "joi";
import { generalRules } from "../../utilits/generalRules/index.js";
import { genderTypes } from "../../DB/models/user.model.js";


export const signUpSchema =

    joi.object({
        name: joi.string().alphanum().min(3).max(50).required(),
        role: joi.string().valid("user","admin").required(),
        email: generalRules.email.required(),
        password: generalRules.password.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
        gender: joi.string().valid(genderTypes.male, genderTypes.female).required(),
        cPassword: generalRules.password.valid(joi.ref("password")).required(),
        phone: joi.string().regex(/^01[0125][0-9]{8}$/).required(),
        file:generalRules.file.required()
    }).required()




export const confirmEmailSchema = joi.object({

    email: generalRules.email.required(),
    code: joi.string().length(4).required()
}).required()

export const loginSchema = joi.object({

    email: generalRules.email.required(),
    password: generalRules.password.required()
}).required()

export const refreshTokenSchema = joi.object({

    authorization: joi.string().required()

}).required()

export const forgetPasswordSchema = joi.object({

    email: generalRules.email.required()

}).required()

export const resetPasswordSchema = joi.object({

    email: generalRules.email.required(),
    code: joi.string().length(4).required(),
    newPassword: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("newPassword")).required()
}).required()


export const updateProfileSchema =

    joi.object({
        name: joi.string().alphanum().min(3).max(50),
        gender: joi.string().valid(genderTypes.male, genderTypes.female),
        phone: joi.string().regex(/^01[0125][0-9]{8}$/),
        file:generalRules.file
    }).required()


    export const updatePasswordSchema =

    joi.object({
        email:  generalRules.email.required(),
        oldPassword:  generalRules.password.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
        newPassword: generalRules.password.required(),
        cNewPassword: generalRules.password.valid(joi.ref("newPassword")).required().messages({"any.only":"password dont match"})
    }).required()



    export const shareProfileSchema =

    joi.object({
        id: generalRules.objectId,
    }).required()


    export const updateEmailSchema =

    joi.object({
        email:  generalRules.email.required(),
    }).required()


    export const replaceEmailSchema =

    joi.object({
        oldCode:  joi.string().length(4).required(),
        newCode:joi.string().length(4).required(),
    }).required()