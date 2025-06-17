import RecipeModel from "../models/recipeModel.js";

const addRecipe = async (req, res) => {
  const { user, recipe } = req.body;

  if (!user || !recipe) {
    return res.json({
      success: false,
      message: "The user and recipe are required.",
    });
  }

  const {
    recipeName,
    description,
    images,
    cookingTime,
    difficultyLevel,
    portionSize,
    nutrition,
    ingredients,
    cookingInstructions,
    mealType,
    dieteryPreference,
  } = recipe;

  // Double-check the provided information.
  if (
    recipeName.length === 0 ||
    description.length === 0 ||
    images.length === 0 ||
    ingredients.length === 0 ||
    cookingInstructions.length === 0
  ) {
    return res.json({
      success: false,
      message: "Some of the required information is missing.",
    });
  }

  try {
    // Create the recipe, and add the user's id as the author.
    const newRecipe = new RecipeModel({
      recipeName,
      author: { userId: user._id, username: user.name },
      description,
      images,
      cookingTime,
      portionSize,
      difficultyLevel,
      portionSize,
      nutrition,
      ingredients,
      cookingInstructions,
      mealType,
      dieteryPreference,
    });

    await newRecipe.save();

    // Add the recipe._id to the user's uploaded recipes array.
    user.recipes.uploaded.push(newRecipe._id);

    await user.save();

    return res.json({
      success: true,
      message: "The recipe was succesfully uploaded!",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There's been an error while trying to upload a new recipe.",
      error: error.message,
    });
  }
};

const deleteRecipe = async (req, res) => {
  const { recipeId } = req.body;

  try {
    // Get the recipe by it's id & delete it.
    const recipe = await RecipeModel.findByIdAndDelete(recipeId);

    return res.json({
      success: true,
      message: "The recipe has been succesfully deleted.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to delete a recipe.",
    });
  }
};

const getSingleRecipe = async (req, res) => {
  const { recipe, sortQuestions, sortReviews } = req.body;

  const sortItems = (items, sort) => {
    if (!sort) {
      return items;
    }

    switch (sort) {
      case "Oldest": {
        return items.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
      case "Newest": {
        return items.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
      case "Most popular": {
        return items.sort((a, b) => b.upvotes.length - a.upvotes.length);
      }
      case "Least popular": {
        return items.sort((a, b) => a.upvotes.length - b.upvotes.length);
      }
    }
  };

  recipe.questions = sortItems(recipe.questions, sortQuestions);
  recipe.reviews = sortItems(recipe.reviews, sortReviews);

  try {
    return res.json({
      success: true,
      recipe: recipe,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to fetch the recipe.",
      error: error.message,
    });
  }
};

const allRecipes = async (req, res) => {
  const { limit, skip } = req.query;

  try {
    const allRecipesLength = await RecipeModel.find().countDocuments();

    const recipes = await RecipeModel.find().limit(limit).skip(skip);

    if (!recipes) {
      return res.json({
        success: false,
        message: "Could not get all of the recipes.",
      });
    }

    return res.send({
      success: true,
      message: "Recipes have been fetches succesfully!",
      recipes: recipes,
      allRecipesLength: allRecipesLength,
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "There was an error while trying to get all of the recipes.",
      error: error.message,
    });
  }
};

const getMultipleRecipesByIds = async (req, res) => {
  const { recipeIds } = req.body;
  const { recipesType } = req.params;

  if (!recipeIds || !recipesType) {
    return res.json({
      success: false,
      message: "The user and type are required.",
    });
  }

  try {
    const recipes = await RecipeModel.find({ _id: recipeIds });

    if (!recipes) {
      return res.json({
        success: false,
        message: "Could not get the recipes with the provided ids.",
      });
    }

    return res.json({
      success: true,
      message: "The recipes were retrieved succesfully!",
      recipes: recipes,
    });
  } catch (error) {
    res.json({
      success: false,
      message:
        "There was an issue while trying to retrieve all of the recipes by their id.",
    });
  }
};

const getRecipes = async (req, res) => {
  console.log("Hello");
};

const addComment = async (req, res) => {
  const { recipeId } = req.params;
  const { type, user, recipe, text, rating } = req.body;

  if (!recipeId || !type || !user || !text) {
    return res.json({
      success: false,
      message: "Type, userId, userInput, and the rating are required.",
    });
  }

  try {
    const question = {
      author: { userId: user._id, username: user.name },
      text: text,
      replies: [],
      upvotes: [],
    };

    if (type === "review") {
      question.rating = rating;
    }

    if (type === "question") {
      recipe.questions.unshift(question);
    } else {
      recipe.reviews.unshift(question);
      recipe.rating.push(rating);
    }

    await recipe.save();

    return res.json({
      success: true,
      message: `Your ${
        type === "question" ? "question" : "review"
      } has been succesfully added.`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue adding your review.",
      error: error.message,
    });
  }
};

const addToFavourites = async (req, res) => {
  const { recipeId } = req.params;
  const { user } = req.body;

  if (!recipeId || !user) {
    return res.json({
      success: false,
      message: "The recipeId and the user are required.",
    });
  }

  try {
    if (user.recipes.favourites.includes(recipeId)) {
      user.recipes.favourites = user.recipes.favourites.filter(
        (id) => id !== recipeId
      );
    } else {
      user.recipes.favourites.push(recipeId);
    }

    await user.save();

    return res.json({
      success: true,
      message: `The recipe has been ${
        user.recipes.favourites.includes(recipeId) ? "added to" : "remove from"
      } your favourites.`,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const removeFromFavourites = async (req, res) => {
  console.log(req.body);
};

const likeContent = async (req, res) => {
  const { contentId } = req.params;
  const { type, userId, recipe } = req.body;

  if (!contentId || !userId || !recipe) {
    return res.json({
      success: false,
      message: "The question Id, userId, and recipe are required.",
    });
  }

  try {
    const content =
      recipe[type === "question" ? "questions" : "reviews"].id(contentId);

    if (content.upvotes.includes(userId)) {
      content.upvotes = content.upvotes.filter((id) => id !== userId);
    } else {
      content.upvotes.push(userId);
    }

    await recipe.save();

    return res.json({
      success: true,
      message: "Success",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to like the content.",
      error: error.message,
    });
  }
};

const addReply = async (req, res) => {
  const { Id } = req.params;
  const { user, recipe, type, text } = req.body;

  if (!Id || !user || !recipe || !text) {
    return res.json({
      success: false,
      message: "Missing required fields: Id, user, recipe, or text.",
    });
  }

  try {
    let question = recipe[type === "question" ? "questions" : "reviews"].id(Id);

    question.replies.unshift({
      author: { userId: user._id, username: user.name },
      text: text,
    });

    await recipe.save();

    return res.json({
      success: true,
      message: "Your reply was left succesfully!",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to leave a reply.",
      error: error.message,
    });
  }
};

const filterRecipesByIngredients = async (req, res) => {
  console.log("hi");
};

export {
  addToFavourites,
  addComment,
  addRecipe,
  deleteRecipe,
  allRecipes,
  getMultipleRecipesByIds,
  getSingleRecipe,
  likeContent,
  addReply,
  removeFromFavourites,
  getRecipes,
  filterRecipesByIngredients,
};
