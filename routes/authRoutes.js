import express from "express";
import { userAuth, getUser } from "../middlewear/middlewear.js";
import {
  register,
  login,
  logout,
  verifyAccount,
  isAuthenticated,
  sendPasswordResetOtp,
  resetPassword,
  updateInformation,
  checkPasswordOtp,
  send2faOtp,
  check2faOtp,
  sendOtp,
  setSecurityQuestions,
  sendForgottenPasswordOtp,
  checkForgottenPasswordOtp,
  getSecurityQuestions,
  checkSecurityQuestions,
  setNewPassword,
  checkInformation,
  checkLoginOtp,
} from "../controllers/authController.js";

const authRouter = express.Router();

// Endpoints
authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/check-login-2fa-otp", checkLoginOtp);

authRouter.post("/change-info", userAuth, getUser, updateInformation);

// Check email or password.
authRouter.post("/check-information", checkInformation);

// OTP
authRouter.post("/send-otp/:flowType", sendOtp);

authRouter.post("/check-confirm-account-otp", verifyAccount);

authRouter.get("/is-authenticated", userAuth, isAuthenticated);

// Reset password
authRouter.post("/reset-otp", userAuth, sendPasswordResetOtp);

authRouter.post("/reset-password", userAuth, resetPassword);

// 2FA
authRouter.post("/2fa-otp", userAuth, send2faOtp);

authRouter.post("/check-2fa-otp", check2faOtp);

authRouter.post("/check-change-password-otp", checkPasswordOtp);

// Security questions
authRouter.post("/send-forgotten-password-otp", sendForgottenPasswordOtp);

authRouter.post(
  "/set-security-questions",
  userAuth,
  getUser,
  setSecurityQuestions
);

authRouter.post("/check-forgotten-password-otp", checkForgottenPasswordOtp);

authRouter.post("/get-security-questions", getSecurityQuestions);

authRouter.post("/check-security-questions", checkSecurityQuestions);

authRouter.post("/set-new-password", setNewPassword);

export default authRouter;
