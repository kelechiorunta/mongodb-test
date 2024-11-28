import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
//   username: { type: String, required: false },
//   email: { type: String, required: false },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'videos' }, // Reference to GridFS file
});

const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

export default Video;