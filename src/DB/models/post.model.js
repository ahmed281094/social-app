import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachments: [{
        secure_url: String,
        public_id: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isDeleted: Boolean,
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true},
        timestamps: true
    }
)

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId"
})


const postModel = mongoose.model('Post', postSchema)

export default postModel