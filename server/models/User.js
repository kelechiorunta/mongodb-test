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
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'file' }, // Reference to GridFS file
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

// Pre-save hook to hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
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