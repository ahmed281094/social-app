import multer from "multer"
import fs from "fs"
import path from "path"
export const fileTypes = {
    image: ["image/jpeg", "image/png", "image/gif"],
    pdf: ["application/pdf"],
    doc: ["application/msword"],
    docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    video: ["video/mp4"],
    audio: ["audio/mp3"],
    zip: ["application/zip"]
}

export const multerLocal = (customValidation = [],customPath="generals") => {

    const fullPath =path.resolve("./src/uploads",customPath)
if (!fs.existsSync(fullPath)){
    fs.mkdirSync(fullPath, { recursive: true})
}

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null,fullPath )
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + file.originalname)
        }
    })

    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('InValid file format', false))
        }
    }

    const upload = multer({ storage, fileFilter })
    return upload
}

export const multerHost = (customValidation = []) => {
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('InValid file format', false))
        }
    }

    const upload = multer({ storage, fileFilter })
    return upload
}