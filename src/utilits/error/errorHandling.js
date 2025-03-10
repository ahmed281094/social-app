

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.message = message
    }
}

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((error) => {
            return next(error);
        })
    }
}

export const globalErrorHandling = (err, req, res, next) => {
    if (process.env.MODE == "DEV") {
        return res.status(err["cause"] || 400).json({
            message: err.message,
            stack: err.stack,
        })
    }
    return res.status(err["cause"] || 400).json({
        message: err.message
    })

}