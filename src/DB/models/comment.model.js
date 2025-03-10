import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    refId:{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },
    onModel:{
        type: String,
        required: true,
        enum: ['Post', 'Comment']
    },
    // commentId:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Comment'
    // },
    deletedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachments:[{
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
        toObject:{virtuals:true},
        toJSON: { virtuals: true },
        timestamps: true 
    }
)

commentSchema.virtual("reply",{

    ref: 'Comment',
    localField: '_id',
    foreignField: 'refId'
})


const commentModel = mongoose.model('Comment', commentSchema)

export default commentModel