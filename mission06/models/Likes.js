import mongoose from "mongoose";

const LikesSchema = new mongoose.Schema(
  {
    productId: {
      type: Schema.Types.UUID,
      ref: "Product",
    },
    userId: {
      type: Schema.Types.UUID,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Likes = mongoose.model("Likes", LikesSchema);
export default Likes;
