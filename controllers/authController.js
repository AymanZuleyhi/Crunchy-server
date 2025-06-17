import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import { sendEmail } from "../config/nodemailer.js";
import { generateOtp } from "../helpers/helpers.js";

const checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if an account with this email exists.
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.send({
        success: false,
        message: "An account with this email does not exist.",
      });
    }

    return res.json({
      success: true,
      message: "An OTP has been sent to your email.",
    });
  } catch (error) {
    res.send({
      success: false,
      message: "There was an issue while trying to cehck if the email exists.",
      error: error.message,
    });
  }
};

const register = async (req, res) => {
  // Get the name, email, and password.
  const { name, email, password } = req.body;

  // Check if one of them is missing.
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing details, name, email, and password are required.",
    });
  }

  try {
    // Check if an account exists with the given email.
    const emailIsTaken = await UserModel.findOne({ email });
    if (emailIsTaken) {
      return res.send({
        success: false,
        message: "Email is already taken.",
      });
    }

    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user.
    const user = new UserModel({ name, email, password: hashedPassword });
    await user.save();

    // Create a JWT.
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Send the token in a HTTP cookie.
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send an email.
    sendEmail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Crunchy!👋",
      text: `Welcome to Crunchy ${name}, we're happy you're here! 😁`,
    });

    return res.send({
      success: true,
      message: "The account has been succesfully created.",
    });
  } catch (error) {
    res.send({
      success: false,
      message: `Error while creating a new user. ${error.message}`,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.send({
        status: false,
        message: "A user does not exist with this email.",
      });
    }

    // Compare the hashes password to the provided password.
    if (await bcrypt.compare(password, user.password)) {
      // Password matches.

      // Create a JWT.
      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      // Send the token in a HTTP cookie.
      console.log(process.env.NODE_ENV);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        // secure: process.env.NODE_ENV === "production",
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.send({
        success: true,
        email: user.email,
        twoFactorAuthentication: user.verification.twoFactorAuthentication,
        message: "You are logged in!",
      });
    } else {
      return res.send({
        status: false,
        message: "The password doesn't match.",
      });
    }
  } catch (error) {
    return res.send({
      status: false,
      message: `An error occured while trying to log in.`,
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    // Remove the token.
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    res.send({ success: true, message: "Logged out." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Couldn't logg the user out.",
    });
  }
};

const updateInformation = async (req, res) => {
  const { user, userDataCopy } = req.body;

  if (!userDataCopy) {
    return res.json({
      success: false,
      message: "The userDataCopy is required.",
    });
  }

  try {
    const {
      name,
      email,
      bio,
      pictures,
      age,
      gender,
      country,
      surname,
      phone,
      socialLinks,
    } = userDataCopy;

    user.name = name;
    user.email = email;
    user.bio = bio;
    user.pictures = pictures;
    user.age = age;
    user.gender = gender;
    user.country = country;
    user.surname = surname;
    user.phone = phone;
    user.socialLinks = socialLinks;

    await user.save();

    return res.json({
      success: true,
      message: "Succesfully updated user information.",
    });
  } catch (error) {
    res.json({
      success: false,
      message:
        "There was an issue while trying to change the user information.",
      error: error.message,
    });
  }
};

const sendOtp = async (req, res) => {
  const { flowType } = req.params;
  const { email } = req.body;

  if (!flowType || !email) {
    return res.json({
      success: false,
      message: "The flow type and email are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "A user with the provided email could not be found.",
      });
    }

    if (user.verification.isVerified && flowType === "confirm-account") {
      return res.json({
        success: false,
        message: "You are already verified.",
      });
    }

    const otp = generateOtp();

    let otpPath;
    let otpExpiresAt;

    switch (flowType) {
      case "confirm-account": {
        otpPath = "verifyOtp";
        otpExpiresAt = "verifyOtpExpiresAt";
        break;
      }
      case "change-password": {
        otpPath = "resetOtp";
        otpExpiresAt = "resetOtpExpiresAt";
        break;
      }
      case "2fa": {
        otpPath = "twoFactorOtp";
        otpExpiresAt = "resetTwoFactorOtp";
        break;
      }
      case "login-2fa": {
        otpPath = "loginOtp";
        otpExpiresAt = "loginOtpExpiresAt";
      }
    }

    user.verification[otpPath] = otp;
    user.verification[otpExpiresAt] = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your account.",
      text: `Here is your 6 digit OTP ${otp}. Go back to the website and enter it there.`,
    });

    return res.json({
      success: true,
      message: "A 6-digit OTP was sent to your email.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an error while sending your OTP.",
      error: error.message,
    });
  }
};

const sendVerifyOtp = async (req, res) => {
  const { userId, email } = req.body;

  try {
    // Check if the user is already verified.
    const user = await UserModel.findOne({ _id: userId });

    if (user.verification.isVerified) {
      return res.send({
        success: false,
        message: "The user is already verified.",
      });
    }

    // Generate a OTP.
    const otp = generateOtp();

    // Change the otp and otp experation time in the user.
    user.verification.verifyOtp = otp;
    user.verification.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // Make it expire in 24h.

    await user.save(); // Save the user to the db.

    // Send an email with the OTP.
    sendEmail({
      from: process.env.SENDER_EMAIL,
      to: email ? email : user.email,
      subject: "Verify your account.",
      text: `Here is your 6 digit OTP ${otp}. Go back to the website and enter it there.`,
    });

    return res.send({
      success: true,
      message: "Your OTP has been sent to your email.",
    });
  } catch (error) {
    return res.send({ success: false, message: "Could not send OTP." });
  }
};

const verifyAccount = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.send({
      success: false,
      message: "The email and otp are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "A user with the provided email could not be found.",
      });
    }

    if (
      user.verification.verifyOtp === "" ||
      user.verification.verifyOtp !== otp
    ) {
      return res.send({ success: false, message: "Invalid OTP." });
    }

    if (user.verification.verifyOtpExpiresAt < Date.now) {
      return res.send({ success: false, message: "The OTP has expired." });
    }

    user.verification.isVerified = true;
    user.verification.verifyOtp = "";
    user.verification.verifyOtpExpiresAt = 0;

    await user.save();

    return res.send({
      success: true,
      message: "Your account has been successfully verified!",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "There's been an issue while trying to veirify the account.",
      error: error.message,
    });
  }
};

const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({
      success: false,
      message:
        "There's been a problem while trying to check if the user is authenticated.",
      error: error,
    });
  }
};

const checkInformation = async (req, res) => {
  const { email, flowType, userInput } = req.body;

  if (!flowType || !userInput) {
    return res.json({
      success: false,
      message: "Type, information, and the user are required.",
    });
  }

  try {
    const user = await UserModel.findOne({
      email: flowType === "2fa" ? email : userInput,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "A user with the provided email could not be found.",
      });
    }

    // If we're changing the password, check the provided email.
    if (flowType === "change-password" && user.email !== userInput) {
      return res.json({
        success: false,
        message: "An account with the provided email does not exist.",
      });
    }

    // If we're settings 2fa, check the password.
    if (flowType === "2fa") {
      if (!(await bcrypt.compare(userInput, user.password))) {
        return res.json({
          success: false,
          message: "The password is not correct.",
        });
      }
    }

    return res.json({
      success: true,
      message: "Success!",
      email: user.email,
    });
  } catch (errpr) {
    res.json({
      success: false,
      message:
        "There's been an issue while trying to check the provided information.",
    });
  }
};

// Password reset
const sendPasswordResetOtp = async (req, res) => {
  const { userId } = req.body;

  try {
    // Get the user.
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.send({ success: false, message: "User does not exist." });
    }

    const otp = generateOtp();

    user.verification.resetOtp = otp;
    user.verification.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password reset OTP.",
      text: `Your OTP is ${otp}.`,
    });

    return res.json({
      success: true,
      message: "An OTP has been sent to your email.",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "There's been an issue while trying to send.",
      error: error,
    });
  }
};

const checkPasswordOtp = async (req, res) => {
  const { email, flowType, otp } = req.body;

  if (!email || !flowType || !otp) {
    return res.json({
      success: false,
      message: "The email, flow type, and the OTP are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "A user with the provided email could not be found.",
      });
    }

    if (user.verification.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "The provided OTP does not match.",
      });
    }

    user.resetOtp = "";
    user.resetOtpExpiresAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "The OTP you have entered is correct.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There's been an issue while trying to verify the OTP.",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { oldPassword, newPassword, userId } = req.body;

  if (!oldPassword || !newPassword) {
    return res.send({
      success: false,
      message: "The old password and the new password are required.",
    });
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.send({
        success: false,
        message: "No user exists with this email.",
      });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.json({
        success: false,
        message: "The old password is not correct.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset succesfully.",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "There's been an issue while trying to reset the password.",
      error: error,
    });
  }
};

// 2FA
const send2faOtp = async (req, res) => {
  const { userId } = req.body;

  try {
    // Get the user.
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.send({ success: false, message: "User does not exist." });
    }

    const otp = generateOtp();

    user.verification.resetOtp = otp;
    user.verification.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password reset OTP.",
      text: `Your OTP is ${otp}.`,
    });

    return res.json({
      success: true,
      message: "An OTP has been sent to your email.",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "There's been an issue while trying to send.",
      error: error,
    });
  }
};

const check2faOtp = async (req, res) => {
  const { email, flowType, otp } = req.body;

  if (!email || !flowType || !otp) {
    return res.json({
      success: false,
      message: "The email, flow type, and the otp are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "A user with the provided email could not be found.",
      });
    }

    if (otp !== user.verification.twoFactorOtp) {
      return res.json({
        success: false,
        message: "Incorrect OTP.",
      });
    }

    if (user.verification.resetTwoFactorOtp < Date.now()) {
      return res.json({
        success: false,
        message: "The OTP has expired.",
      });
    }

    user.verification.twoFactorAuthentication =
      user.verification.twoFactorAuthentication === true ? false : true;
    user.verification.twoFactorOtp = "";
    user.verification.resetTwoFactorOtp = "";

    await user.save();

    return res.json({
      success: true,
      message: `Two factor authentication has been ${
        user.verification.twoFactorAuthentication ? "enabled" : "disabled"
      }`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to verify your OTP.",
    });
  }
};

const setSecurityQuestions = async (req, res) => {
  const { user, selectedQuestions } = req.body;

  if (!user || !selectedQuestions) {
    return res.json({
      success: false,
      message: "The user and security questions are required.",
    });
  }

  try {
    for (const question of selectedQuestions) {
      const encryptedAnswer = await bcrypt.hash(question.answer, 10);

      user.securityQuestions.push({
        question: question.question,
        answer: encryptedAnswer,
      });
    }

    user.verification.isSecurityQuestions = true;

    await user.save();

    return res.json({
      success: true,
      message: "Your security questions have been saved!",
    });
  } catch (error) {
    res.json({
      success: false,
      message:
        "There was an issue while trying to add all of the security questions.",
      error: error.message,
    });
  }
};

const sendForgottenPasswordOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "A user with this email does not exist.",
      });
    }

    const otp = generateOtp();

    user.verification.securityQuestionsOtp = otp;
    user.verification.securityQuestionOtpExpiresAt =
      Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your account.",
      text: `Here is your 6 digit OTP ${otp}. Go back to the website and enter it there.`,
    });

    return res.json({
      success: true,
      message: "A 6-digit OTP was sent to your email.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There's been an issue while trying to send the OTP.",
      error: error.message,
    });
  }
};

const checkForgottenPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Could not find a user with the provided email.",
      });
    }

    if (otp !== user.verification.securityQuestionsOtp) {
      return res.json({
        success: false,
        message: "Incorrect OTP.",
      });
    }

    if (user.verification.securityQuestionOtpExpiresAt < Date.now()) {
      return res.json({
        success: false,
        message: "The OTP has expired.",
      });
    }

    user.verification.securityQuestionsOtp = "";
    user.verification.securityQuestionOtpExpiresAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "OTP has been succesfully verified.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an error while trying to validate the OTP.",
    });
  }
};

const getSecurityQuestions = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Could not find a user with the provided email.",
      });
    }

    return res.json({
      success: true,
      questions: user.securityQuestions,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to get the security questions.",
    });
  }
};

const checkSecurityQuestions = async (req, res) => {
  const { email, securityQuestions } = req.body;

  if (!email || !securityQuestions) {
    return res.json({
      success: false,
      message: "The email and the security questions are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Could not find a user with the provided email.",
      });
    }

    const checkVailidty = [];

    for (const question of user.securityQuestions) {
      const encryptedAnswer = question.answer;

      const questionFromTheFrontEnd = securityQuestions.find(
        (eachQuestion) => eachQuestion.question === question.question
      );

      const isMatch = await bcrypt.compare(
        questionFromTheFrontEnd.answer,
        encryptedAnswer
      );

      checkVailidty.push(isMatch);
    }

    if (checkVailidty.includes(false)) {
      return res.json({
        success: false,
        message: "One or more of the answers do not match.",
      });
    }

    return res.json({
      success: true,
      message: "Your answers match! You can now set your new password",
    });
  } catch (error) {
    res.json({
      success: false,
      message:
        "There was an issue while trying to check the security questions.",
      error: error.message,
    });
  }
};

const setNewPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.json({
      success: false,
      message: "The email and password are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "Could not find a user with the provided email.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.json({
      success: true,
      message: "Your new password has been set!",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to change the password",
      error: error.message,
    });
  }
};

const checkLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.json({
      success: false,
      message: "The email and OTP are required.",
    });
  }

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "Could not find the user with the provided email.",
      });
    }

    if (otp !== user.verification.loginOtp) {
      return res.json({
        success: false,
        message: "Incorrect OTP.",
      });
    }

    if (user.verification.loginOtpResetsAt < Date.now()) {
      return res.json({
        success: false,
        message: "The OTP has expired.",
      });
    }

    user.verification.loginOtp = "";
    user.verification.loginOtpExpiresAt = "";

    await user.save();

    return res.json({
      success: true,
      message: "You are logged in!",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to check your login OTP.",
      error: error.message,
    });
  }
};

export {
  register,
  login,
  logout,
  checkEmail,
  sendVerifyOtp,
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
};
