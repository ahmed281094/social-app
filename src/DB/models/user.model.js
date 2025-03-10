import mongoose from "mongoose";

export const genderTypes = {
    male: 'male',
    female: 'female'
}
export const roleTypes = {
    admin: 'admin',
    user: 'user',
    superAdmin:"superAdmin"
}
export const providerTypes = {
    system: 'system',
    google: 'google'
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowecase: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        // required: function (data) {
        //     return data.provider == providerTypes.google ? false : true
        // },
        minlength: 8,
        trim: true
    },
    phone: {
        type: String,
        // required: true,
        trim: true,

    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        required: true,
        default: roleTypes.user
    },
    image:{
        secure_url: String,
        public_id: String
    },
    coverImage: [{
        secure_url: String,
        public_id: String
    }],
    changePasswordAt: Date,
    otpEmail: String,
    tempEmail: String,
    otpNewEmail: String,
    otpPassword: String,
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    viewers:[{
        userId:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
        time:[Date]
     
    }]
},
    { timestamps: true }
)
const userModel = mongoose.model('User', userSchema)

export default userModel