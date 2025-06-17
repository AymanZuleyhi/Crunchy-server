import UserModel from "../models/userModel.js";

const getUserData = async (req, res) => {
  const { user } = req.body;

  console.log("Hi", user);
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
      following,
      recipes,
      posts,
    } = user;

    const userInfo = {
      _id: user._id,
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
      recipes,
      posts,
      following,
      isVerified: user.verification.isVerified,
      twoFactorAuthentication: user.verification.twoFactorAuthentication,
      isSecurityQuestions: user.verification.isSecurityQuestions,
    };

    return res.json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "There was an issue while trying to get the user data.",
      error: error,
    });
  }
};

const getAllUsers = async (req, res) => {
  const { user } = req.body;

  if (!user) {
    return res.json({
      success: false,
      message: "The user is required.",
    });
  }

  try {
    // Get all of the users who the user is not following. Also exclude the user himself.
    const users = await UserModel.find({
      _id: { $nin: [user.following, user._id] },
    });

    if (!users) {
      return res.json({
        success: false,
        message: "Could not get all of the users.",
      });
    }

    const filteredUsers = users.map((user) => {
      return {
        userId: user._id,
        name: user.name,
        picture: user.pictures.profile,
      };
    });

    return res.json({
      success: true,
      message: "Succesfully got all of the users",
      users: filteredUsers,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There's been an issue while trying to get all of the users.",
    });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "Could not find a user with the provided id.",
      });
    }

    return res.json({
      success: true,
      user: user,
      message: "The user has been succesfully retreived.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to get the user.",
    });
  }
};

const getUsersById = async (req, res) => {
  const { userIds } = req.body;

  if (!userIds) {
    return res.json({
      success: false,
      message: "A list of user ids is reuquired.",
    });
  }

  try {
    const users = await UserModel.find({ _id: userIds });

    if (!users) {
      return res.json({
        success: false,
        message: "Could not find the users with the provided ids.",
      });
    }

    return res.json({
      success: true,
      message: "The users have been retreived succesfully!",
      users: users,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to get all of the users.",
    });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "Could not delete the account.",
      });
    }

    res.json({
      success: true,
      message: "Your account was succesfully deleted.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There's been an issue while trying to delete your account.",
      error: error.message,
    });
  }
};

const followUser = async (req, res) => {
  const { userId } = req.params;
  const { user } = req.body;

  try {
    if (user.following.includes(userId)) {
      user.following = user.following.filter((id) => id !== userId);
    } else {
      user.following.unshift(userId);
    }

    await user.save();

    return res.json({
      success: true,
      message: `The user has been ${
        user.following.includes(userId) ? "followed" : "unfollowed"
      } succesfully!`,
      follow: user.following.includes(userId) ? false : true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while checking if you follow the user.",
    });
  }
};

const changePicture = async (req, res) => {
  const { type } = req.params;
  const { user, photo } = req.body;

  try {
    if (type === "profile-picture") {
      user.pictures.profile = photo.url;
    } else {
      user.pictures.cover = photo.url;
    }

    await user.save();

    return res.json({
      success: true,
      message: `Your ${
        type === "profile-picture" ? "profile picture" : "cover photo"
      } has been updated!`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "There was an issue while trying to updat the picture.",
    });
  }
};

const removeCoverProfilePhoto = async (req, res) => {
  const { user, type } = req.body;

  if (!type) {
    return res.json({
      success: false,
      message: "The type of the photo is required.",
    });
  }

  try {
    if (type === "cover") {
      user.pictures.cover = "";
    } else {
      user.pictures.profile = "";
    }

    await user.save();

    return res.json({
      success: true,
      message: `Your ${type} photo was removed succesfully!`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `There was an issue while trying to remove the ${type} photo.`,
    });
  }
};

export {
  getUserData,
  getAllUsers,
  getUserById,
  getUsersById,
  deleteUser,
  followUser,
  changePicture,
  removeCoverProfilePhoto,
};
