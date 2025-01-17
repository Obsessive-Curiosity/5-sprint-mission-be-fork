import mongoose from "mongoose";
const { Schema } = mongoose;

const LikesSchema = new mongoose.Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Likes = mongoose.model("Likes", LikesSchema);
export default Likes;
