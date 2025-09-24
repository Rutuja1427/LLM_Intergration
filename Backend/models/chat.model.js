import mongoose,{Schema} from "mongoose";

const chatSchema = new Schema({
    usermessage: {
        type: String,
        required: true
    },
    botmessage: {
        type: String,
        required: true
    }
}, { timestamps: true })    

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
