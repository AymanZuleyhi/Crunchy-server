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

const questionsSchema = new mongoose.Schema(
  {
    author: {
      userId: { type: String },
      username: { type: String },
    },
    text: { type: String },
    upvotes: [String],
    replies: [replySchema],
  },
  { timestamps: true }
);

const reviewsSchema = new mongoose.Schema(
  {
    author: {
      userId: { type: String },
      username: { type: String },
    },
    rating: { type: Number },
    text: { type: String },
    upvotes: [String],
    replies: [replySchema],
  },
  { timestamps: true }
);

const recipeSchema = new mongoose.Schema(
  {
    recipeName: { type: String, required: true },
    author: {
      userId: { type: String },
      username: { type: String },
    },
    rating: { type: [Number] },
    description: { type: String },
    images: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    cookingTime: {
      name: { type: String },
      time: { type: Number },
    },
    difficultyLevel: {
      name: { type: String },
      difficulty: { type: String },
    },
    portionSize: {
      quantity: { type: String },
      value: { type: String },
    },
    nutrition: {},
    ingredients: [
      {
        name: { type: String },
        unit: { type: String },
        weight: { type: String },
      },
    ],
    cookingInstructions: [{ type: String }],
    mealType: [{ type: String }],
    dieteryPreference: [{ type: String }],
    questions: [questionsSchema],
    reviews: [reviewsSchema],
  },
  { timestamps: true }
);

const UserModel =
  mongoose.models.recipe || mongoose.model("recipe", recipeSchema);

export default UserModel;
