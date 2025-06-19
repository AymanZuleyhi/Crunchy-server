import NewsFeedModel from "../models/newsFeedModel.js";

const getAllPosts = async (req, res) => {
  const { type } = req.params;
  const { limit, skip } = req.query;
  const { user } = req.body;

  if (!type || !limit || !skip) {
    return res.jon({
      success: false,
      message: "The type, limit, and skip are required.",
    });
  }

  let filter;

  switch (type) {
    case "all": {
      filter = { _id: { $nin: user.posts.hidden } };
      break;
    }
    case "hot": {
      filter = {};
      break;
    }
    case "new": {
      filter = {
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      };
      break;
    }
    case "following": {
      filter = { ["author.userId"]: { $in: user.following } };
      break;
    }
    case "saved": {
      filter = { _id: { $in: user.posts.favourites } };
      break;
    }
    case "hidden": {
      filter = { _id: { $in: user.posts.hidden } };
      break;
    }
  }

  try {
    const allPosts = await NewsFeedModel.countDocuments(filter);

    const posts = await NewsFeedModel.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ date: -1 });

    if (!posts) {
      return res.json({
        success: false,
        message: "Could not get all of the posts.",
      });
    }

    return res.json({
      success: true,
      message: "All posts are showing succesfully!",
      posts: posts,
      allPosts: allPosts,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Could not fetch all of the recipes.",
      error: error.message,
    });
  }
};

const getPostsById = async (req, res) => {
  const { postIds } = req.body;

  if (!postIds) {
    return res.json({
      success: false,
      message: "The post id's are required.",
    });
  }

  try {
    const posts = await NewsFeedModel.find({ _id: postIds });

    if (!posts || posts.length === 0) {
      return res.json({
        success: false,
        message:
          "There's been an issue while trying to get the posts by their ids.",
      });
    }

    return res.json({
      success: true,
      message: "Succesfully retrieved all of the posts by their ids.",
      posts: posts,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to get all of the posts.",
    });
  }
};

const createNewPost = async (req, res) => {
  const { text, photos, userId, user } = req.body;

  if (!text || !photos || !userId || !user) {
    return res.json({
      success: false,
      message: "The post, photo, userId, and the user are required.",
    });
  }

  try {
    const newPost = new NewsFeedModel({
      author: { userId, username: user.name },
      text: text,
      photos: photos,
      replies: [],
      upvotes: [],
    });

    await newPost.save();

    // Get the id of the new post and add it to the user.posts.
    const publishedPost = await NewsFeedModel.findById(newPost._id);

    user.posts.uploaded.push(publishedPost._id);

    await user.save();

    return res.json({
      success: true,
      message: "Your post was published succesfully!",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to add a new post.",
      error: error.message,
    });
  }
};

const likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!postId || !userId) {
    return res.json({
      success: false,
      message: "The postId and the userId are required.",
    });
  }

  try {
    const post = await NewsFeedModel.findById(postId);

    if (!post) {
      return res.json({
        success: false,
        message: "Could not get the post with the provided id.",
      });
    }

    if (post.upvotes.includes(userId)) {
      post.upvotes = post.upvotes.filter((id) => id !== userId);
    } else {
      post.upvotes.push(userId);
    }

    await post.save();

    return res.json({
      success: true,
      message: "Post has been updated.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to like the post.",
    });
  }
};

const commentPost = async (req, res) => {
  const { postId } = req.params;
  const { text, userId, user } = req.body;

  if (!postId || !text || !userId || !user) {
    return res.json({
      success: false,
      message: "The postId, comment, userId, and the user are required.",
    });
  }

  try {
    const post = await NewsFeedModel.findById(postId);

    if (!post) {
      return res.json({
        success: false,
        message: "A post with the provided ID could not be found.",
      });
    }

    const newComment = {
      author: { userId, username: user.name },
      text: text,
    };

    post.replies.unshift(newComment);

    await post.save();

    return res.json({
      success: true,
      message: "Your comment was succesfully added!",
    });
  } catch (error) {
    res.json({
      success: false,
      message:
        "There was an issue while trying to leave a comment on the post.",
      error: error.message,
    });
  }
};

const addRemoveFromFavourites = async (req, res) => {
  const { postId } = req.params;
  const { user } = req.body;

  if (!postId || !user) {
    return res.json({
      success: false,
      message: "The postId, and the user are required.",
    });
  }

  try {
    if (user.posts.favourites.includes(postId)) {
      user.posts.favourites = user.posts.favourites.filter(
        (id) => id !== postId
      );
    } else {
      user.posts.favourites.unshift(postId);
    }

    await user.save();

    return res.json({
      success: true,
      message: `The post was ${
        user.posts.favourites.includes(postId) ? "added to" : "removed from"
      } your favourites.`,
    });
  } catch (error) {
    res.json({
      success: false,
      message:
        "There's been an issue while trying to add or remove the post from favourites.",
      errror: error.message,
    });
  }
};

const hideShowPost = async (req, res) => {
  const { postId } = req.params;
  const { user } = req.body;

  try {
    if (user.posts.hidden.includes(postId)) {
      user.posts.hidden = user.posts.hidden.filter((post) => post !== postId);
    } else {
      user.posts.hidden.unshift(postId);
    }

    await user.save();

    return res.json({
      success: true,
      message: `The post was ${
        user.posts.hidden.includes(postId) ? "added to" : "removed from"
      } your feed.`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There's been an issue while trying to show or hide the post.",
    });
  }
};

export {
  getAllPosts,
  getPostsById,
  createNewPost,
  likePost,
  commentPost,
  addRemoveFromFavourites,
  hideShowPost,
};
