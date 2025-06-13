import express from "express";
import {
  commentPost,
  createNewPost,
  getAllPosts,
  likePost,
  addRemoveFromFavourites,
  hideShowPost,
  getPostsById,
} from "../controllers/newsFeedController.js";
import { userAuth } from "../middlewear/middlewear.js";
import { getUser } from "../middlewear/middlewear.js";

const newsFeedRouter = express.Router();

newsFeedRouter.post("/all-posts/:type", userAuth, getUser, getAllPosts);

newsFeedRouter.post("/get-posts-by-id", getPostsById);

newsFeedRouter.post("/new-post", userAuth, getUser, createNewPost);

newsFeedRouter.post("/like-post/:postId", userAuth, likePost);

newsFeedRouter.post("/comment-post/:postId", userAuth, getUser, commentPost);

newsFeedRouter.post(
  "/add-remove-from-favourites/:postId",
  userAuth,
  getUser,
  addRemoveFromFavourites
);

newsFeedRouter.post("/show-hide-post/:postId", userAuth, getUser, hideShowPost);

export default newsFeedRouter;
