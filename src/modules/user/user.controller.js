import { Router } from "express";
import { confirmEmail, dashboard, forgetPassword, login, loginWithGmail, refreshToken, replaceEmail, resetPassword, shareProfile, signUp, updateEmail, updatePassword, updateProfile, updateRole } from "./user.service.js";
import { validation } from "../../middleWare/validation.js";
import { confirmEmailSchema, forgetPasswordSchema, loginSchema, refreshTokenSchema, replaceEmailSchema, resetPasswordSchema, shareProfileSchema, signUpSchema, updateEmailSchema, updatePasswordSchema, updateProfileSchema } from "./user.validation.js";
import { fileTypes, multerHost, multerLocal } from "../../middleWare/multer.js";
import { authentcation, authorization } from "../../middleWare/auth.js";
import { roleTypes } from "../../DB/models/user.model.js";




const userRouter = Router()

// userRouter.post('/signUp',multerLocal(fileTypes.image,"user").fields([
//     {name: 'image', maxCount: 1},
//     {name: 'images', maxCount: 5}
// ]),
// signUp)
// userRouter.post('/signUp',multerHost(fileTypes.image).array("images",3),signUp)
userRouter.post('/signUp',
    multerHost(fileTypes.image).single("image"),
    validation(signUpSchema),
    signUp
)
userRouter.patch('/confirmEmail', validation(confirmEmailSchema), confirmEmail)
userRouter.post('/login', validation(loginSchema), login)
userRouter.get('/refreshToken', validation(refreshTokenSchema), refreshToken)
userRouter.patch('/forgetPassword', validation(forgetPasswordSchema), forgetPassword)
userRouter.patch('/resetPassword', validation(resetPasswordSchema), resetPassword)

userRouter.patch('/updatePassword', validation(updatePasswordSchema), authentcation, updatePassword)

userRouter.post('/loginWithGmail', loginWithGmail)
userRouter.patch('/updateProfile',
    multerHost(fileTypes.image).single("image"),
    validation(updateProfileSchema),
    authentcation,
    updateProfile,
)

userRouter.get('/shareProfile/:id',
    validation(shareProfileSchema),
    authentcation,
    shareProfile,
)

userRouter.patch('/updateEmail',
    validation(updateEmailSchema),
    authentcation,
    updateEmail,
)
userRouter.patch('/replaceEmail',
    validation(replaceEmailSchema),
    authentcation,
    replaceEmail,
)


userRouter.get('/dashboard',
      authentcation,
      authorization([roleTypes.admin,roleTypes.superAdmin]),
      dashboard
    )




userRouter.patch('/dashboard/updateRole/:userId', 
     authentcation,
     authorization([roleTypes.admin,roleTypes.superAdmin]),
     updateRole
    )
export default userRouter


