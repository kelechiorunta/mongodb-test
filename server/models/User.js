import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: { type: String, required: false, default: 'Anonymous User'  },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    picture: { type: String, required: false, default:''},
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'videos' }, // Reference to GridFS file
    pictureId: { type: mongoose.Schema.Types.ObjectId, ref: 'pictures' }, // Reference to GridFS file
    placeholderId: { type: mongoose.Schema.Types.ObjectId, ref: 'pictures' },
    profilePicId: { type: mongoose.Schema.Types.ObjectId, ref: 'pictures' },
    profilePlaceholderId: { type: mongoose.Schema.Types.ObjectId, ref: 'pictures' },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'file' }, // Reference to GridFS file
    propertyPlaceholderCollections: [ {type: mongoose.Schema.Types.ObjectId, ref: 'properties' }],
    propertyPictureCollections: [ {type: mongoose.Schema.Types.ObjectId, ref: 'properties' }],
    otp: {
        type: String,
        default: 'otp'
        // required: true,
      },
      expireAt: {
        type: Date,
        default: () => new Date(Date.now() + 300 * 1000), // Set to 5 minutes from now
      },
    resetPasswordToken: { type: String },
    resetPasswordExpires: {type: Date },
});

// Pre-save hook to enforce picCollections limit and hash the password
userSchema.pre('save', async function (next) {
    // Enforce the maximum number of images in picCollections
    if ((this.propertyPlaceholderCollections.length > 3) || (this.propertyPictureCollections.length > 3)) {
        return next(new Error("You cannot save more than three images in picCollections."));
    }

    // Hash the password if it is modified
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
});

// Method to check if entered password matches the hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure unique email index
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;