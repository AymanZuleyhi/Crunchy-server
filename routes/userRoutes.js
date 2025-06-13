import express from "express";
import { userAuth, getUser } from "../middlewear/middlewear.js";
import {
  getUserData,
  getAllUsers,
  getUserById,
  getUsersById,
  deleteUser,
  followUser,
  changePicture,
  removeCoverProfilePhoto,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUser, getUserData);

userRouter.post("/get-all-users", userAuth, getUser, getAllUsers);

userRouter.post("/get-users-by-id", getUsersById);

userRouter.get("/get-user-by-id/:userId", getUserById);

userRouter.post("/delete", userAuth, deleteUser);

userRouter.post("/follow-user/:userId", userAuth, getUser, followUser);

userRouter.post("/update-picture/:type", userAuth, getUser, changePicture);

userRouter.post(
  "/remove-cover-profile-photo",
  userAuth,
  getUser,
  removeCoverProfilePhoto
);

export default userRouter;
