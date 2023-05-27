const Post = require("../models/Post");
const User = require("../models/User");
const { successMessage, errorMessage } = require("./../utils/responseWrapper");

// note on each api call we got id as require user is middleware for us which gives user id

const getAllPostsController = async (req, res) => {
  console.log("PostController called!");
  console.log("user cmes after middleware confirmation is - ", req._id);
  return res.send(successMessage(200, "These ara all posts!"));
};

const createPostController = async (req, res) => {
  console.log("createPostController Called");
  try {
    const { caption } = req.body;
    const userId = req._id;

    const user = await User.findById(userId);

    if (!caption) {
      res.send(errorMessage(400, "Caption is required"));
    }

    // creating a post
    const post = await Post.create({
      owner: userId,
      caption,
    });

    // now saving this post to user who created
    // in any user there is field of posts : mean has record of his posts
    // so putting post id(_id) into user posts array

    user.posts.push(post._id);

    await user.save();

    return res.send(successMessage(201, post));
  } catch (error) {
    res.send(errorMessage(500, error.message));
  }
};

module.exports = {
  getAllPostsController,
  createPostController,
};
