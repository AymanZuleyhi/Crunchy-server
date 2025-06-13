import express from "express";
import { getRecipe, userAuth, getUser } from "../middlewear/middlewear.js";
import {
  addRecipe,
  deleteRecipe,
  allRecipes,
  getMultipleRecipesByIds,
  getSingleRecipe,
  addComment,
  addToFavourites,
  likeContent,
  addReply,
  removeFromFavourites,
  filterRecipesByIngredients,
} from "../controllers/recipeController.js";

const recipeRouter = express.Router();

recipeRouter.post("/add", userAuth, getUser, addRecipe);

recipeRouter.delete("/delete", deleteRecipe);

recipeRouter.post("/single-recipe/:recipeId", getRecipe, getSingleRecipe);

recipeRouter.get("/all-recipes", allRecipes);

recipeRouter.post(
  "/get-multiple-recipes-by-id/:recipesType",
  userAuth,
  getMultipleRecipesByIds
);

recipeRouter.post(
  "/add-comment/:recipeId/",
  userAuth,
  getUser,
  getRecipe,
  addComment
);

recipeRouter.post(
  "/add-to-favourites/:recipeId",
  userAuth,
  getUser,
  addToFavourites
);

recipeRouter.post(
  `/like-comment/:recipeId/:contentId/`,
  userAuth,
  getRecipe,
  likeContent
);

recipeRouter.post(
  `/add-reply/:recipeId/:Id`,
  userAuth,
  getUser,
  getRecipe,
  addReply
);

recipeRouter.post("/filter-recipe-by-ingredients", filterRecipesByIngredients);

export default recipeRouter;
