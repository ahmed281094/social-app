import connectionDB from "./DB/DBconnection.js"
import commentRouter from "./modules/comment/comment.controller.js"
import postRouter from "./modules/post/post.controller.js"
import userRouter from "./modules/user/user.controller.js"
import { globalErrorHandling } from "./utilits/error/errorHandling.js"
import cors from "cors"
import path from "path"
import { rateLimit } from 'express-rate-limit'
const limiter = rateLimit({
  limit:5,
  windowMs: 15 * 60 * 1000, 
  message: {error:"Too many requests from this IP, please try again in 15 minutes."},
  handler:
  (req, res, next) => {
    return next(new Error("Too many requests from this IP, please try again in 15 minutes.",{cause:429}))
  }
})
const bootstrap = (app, express) => {
  app.use(cors())
  app.use(limiter)
  app.use("/uploads",express.static(path.resolve("src/uploads")))
    app.use(express.json())
  app.use("/users",userRouter)
  app.use("/posts",postRouter)
  app.use("/comments",commentRouter)
    connectionDB()
    app.use("*", (req, res, next) => {
        return next(new Error(`no url found ${req.originalUrl}`))
    })
    app.use(globalErrorHandling)
}

export default bootstrap