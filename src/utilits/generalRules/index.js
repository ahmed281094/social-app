import joi from "joi";
import { Types } from "mongoose"
export const idValidation = (value, helper) => {
    let isValidId = Types.ObjectId.isValid(value);
    return isValidId ? value : helper.messages(`id is required ${value}`);
}


export const generalRules = {
    email: joi.string().email(),
    password: joi.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
    objectId: joi.string().custom(idValidation),
    headers: joi.object({
        authorization: joi.string().required(),
        'content-type': joi.string(),
        "cache-control": joi.string(),
        "user-agent": joi.string(),
        "content-length": joi.string(),
        "postman-token": joi.string(),
        host: joi.string(),
        accept: joi.string(),
        connection: joi.string(),
        "accept-encoding": joi.string(),

    }),
    file:
    joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required(),
        destination: joi.string().required()
    }).messages({ "any.required": "Please upload photo"})
}
