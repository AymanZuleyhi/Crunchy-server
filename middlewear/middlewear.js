import jwt from "jsonwebtoken";
import RecipeModel from "../models/recipeModel.js";
import UserModel from "../models/userModel.js";
import { filterUserData } from "../helpers/helpers.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  console.log("This is the token", token);

  if (!token) {
    return res.send({ success: false, message: "The token does not exist." });
  }

  try {
    // Decode the token and check if it matches.
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decodedToken.userId) {
      req.body.userId = decodedToken.userId;
    } else {
      return res.send({
        success: false,
        message: "Not authorised, logg in again.",
      });
    }

    next();
  } catch (error) {
    return res.send({ success: false, message: "The token does not exist." });
  }
};

const getRecipe = async (req, res, next) => {
  const { recipeId } = req.params;

  if (!recipeId) {
    return res.json({ success: false, message: "The recipe ID is required." });
  }

  try {
    // Get the recipe.
    const recipe = await RecipeModel.findOne({ _id: recipeId });

    // Check if the recipe exists.
    if (!recipeId) {
      return res.json({
        success: false,
        message: "Recipe with this ID does not exist.",
      });
    }

    // If the recipe exists.
    req.body.recipe = recipe;
    next();
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to get the recipe.",
      error: error,
    });
  }
};

const getUser = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "Could not find a user with the provided id.",
      });
    }

    req.body.user = user;
    next();
  } catch (error) {
    res.json({
      success: false,
      message: "There's been an issue while trying to get the user.",
    });
  }
};

export { userAuth, getRecipe, getUser };
