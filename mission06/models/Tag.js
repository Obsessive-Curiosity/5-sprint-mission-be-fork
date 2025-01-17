import mongoose from "mongoose";
const { Schema } = mongoose;

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
});

const Tag = mongoose.model("Tag", TagSchema);
export default Tag;
