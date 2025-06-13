import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    author: {
      userId: { type: String },
      username: { type: String },
    },
    text: { type: String },
  },
  { timestamps: true }
);

const newsFeedSchema = new mongoose.Schema(
  {
    author: {
      userId: { type: String },
      username: { type: String },
    },
    text: {
      type: String,
    },
    photos: [String],
    replies: [replySchema],
    upvotes: [String],
  },
  { timestamps: true }
);

const NewsFeedModel =
  mongoose.models.newsFeed || mongoose.model("news-feed", newsFeedSchema);

export default NewsFeedModel;
