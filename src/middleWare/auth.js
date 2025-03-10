import userModel from '../DB/models/user.model.js';
import { asyncHandler } from '../utilits/error/errorHandling.js';
import { verifyToken } from '../utilits/token/index.js';

export const tokenTypes = {
    access: 'access',
    refresh: 'refresh'

}

export const decodedToken = async ({ authorization, tokenType,next }) => {
    const [prefix, token] = authorization.split(" ") || []
    if (!token || !prefix) {
        return next(new Error("token is required", { cause: 401 }))
    }
    let ACCESS_SIGNATRUE = undefined
    let REFRESH_SIGNATRUE = undefined
    if (prefix == process.env.PREFIX_TOKEN_ADMIN) {
        ACCESS_SIGNATRUE = process.env.SIGNATURE_TOKEN_ADMIN
        REFRESH_SIGNATRUE = process.env.REFRESH_SIGNATURE_ADMIN
    } else if (prefix == process.env.PREFIX_TOKEN_BEARER) {
        ACCESS_SIGNATRUE = process.env.SIGNATURE_TOKEN_USER
        REFRESH_SIGNATRUE = process.env.REFRESH_SIGNATURE_USER
    }
    else {
        return next(new Error("invalid token prefix", { cause: 401 }))
    }
    const decoded = await verifyToken({
        token,
        SIGNATURE: tokenType == tokenTypes.access ? ACCESS_SIGNATRUE : REFRESH_SIGNATRUE
    })
    if (!decoded?.id) {
        return next(new Error("invalid token payload", { cause: 401 }))
    }
    const user = await userModel.findById(decoded.id).lean()
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    if (!user) {
        return next(new Error("user is deleted", { cause: 401 }))
    }
    if (parseInt(user?.changePasswordAt?.getTime() / 1000) >= decoded.iat) {
        return next(new Error("token expired", { cause: 401 }));
    }
    return user
}



export const authentcation = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers
    const user = await decodedToken({ authorization,tokenType:tokenTypes.access,next })

    req.user = user
    next()

})

export const authorization = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!accessRoles.includes(req.user.role)) {
            return next(new Error("access denied", { cause: 403 }))
        }
        next()
    })
}