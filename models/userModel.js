import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  pictures: {
    profile: { type: String, default: "" },
    cover: { type: String, default: "" },
  },
  age: { type: Number, default: 0 },
  gender: { type: String, default: "" },
  country: { type: String, default: "" },
  surname: { type: String, default: "" },
  phone: {
    country: { type: String, default: "" },
    number: { type: String },
  },
  socialLinks: {
    facebook: {
      type: String,
      default: "https://www.facebook.com/your-profile",
    },
    instagram: {
      type: String,
      default: "https://www.instagram.com/your-profile",
    },
    twitter: {
      type: String,
      default: "https://twitter.com/your-profile",
    },
    youtube: {
      type: String,
      default: "https://www.youtube.com/c/your-channel",
    },
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    twoFactorAuthentication: { type: Boolean, default: false },
    isSecurityQuestions: { type: Boolean, default: false },
    loginOtp: { type: String, default: "" },
    loginOtpExpiresAt: { type: String, default: "" },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpiresAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpiresAt: { type: Number, default: 0 },
    twoFactorOtp: { type: String, default: "" },
    resetTwoFactorOtp: { type: String, default: 0 },
    securityQuestionsOtp: { type: String, default: "" },
    securityQuestionOtpExpiresAt: { type: Number, default: 0 },
  },
  securityQuestions: [
    {
      question: { type: String },
      answer: { type: String },
    },
  ],
  following: {
    type: [String],
  },
  recipes: {
    uploaded: { type: [String] },
    favourites: { type: [String] },
  },
  posts: {
    uploaded: { type: [String] },
    favourites: { type: [String] },
    hidden: { type: [String] },
  },
});

const UserModel = mongoose.models.user || mongoose.model("user", userSchema);

export default UserModel;
