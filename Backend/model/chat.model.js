import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tittle: {
        type: String,
        required: true,
        default: 'New Chat',
        trim: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

}, {
    timestamps: true
});
const chatModel = mongoose.model('Chat', chatSchema);
export default chatModel;