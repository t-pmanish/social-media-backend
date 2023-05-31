const Post = require("../models/Post");
const User = require("../models/User");
const { successMessage, errorMessage } = require("./../utils/responseWrapper");

// note on each api call we got id as require user is middleware for us which gives user id

const getAllPostsController = async (req, res) => {
  console.log("getAllPostController called!");

  try {

    // console.log("user comes after middleware confirmation is - ", req._id);

     return res.send(successMessage(200, {posts:await Post.find()}));
    
  } catch (error) {
     return res.send(errorMessage(500,error.message))
  }
  
};

const createPostController = async (req, res) => {
  console.log("createPostController Called");
  try {
    // letter we also get images url from third party so that we have to save in our body
    const { caption } = req.body;
    const userId = req._id; // middleware giving us this for logged in userid

    const user = await User.findById(userId); // to save this postId to this posts array

    if (!caption) {
      res.send(errorMessage(400, "Caption is required"));
    }

    // creating a post -> automatic saved to mongoDB
    const post = await Post.create({
      owner: userId,
      caption,
    });

    // now saving this post to user who created
    // in any user there is field of posts : mean has record of his posts
    // so putting post id(_id) into user posts array

    user.posts.push(post._id); // this loggedIn user created this post so adding post id to it posts array
    await user.save(); // and saved to user profile

    return res.send(successMessage(201, post));
  } catch (error) {
    return res.send(errorMessage(500, error.message)); // server side issue
  }
};

const likeAndUnlikePostController = async (req, res) => {
  console.log("likeAndUnlikePostController Called!");

  // taking postId -> as we click on post like button it will liked or unliked
  // if not liked then add like
  // like already then unlike post

  // not like -> add loggedIn userId into Post Scheama -> likes array
  // already like -> remove  loggedIn userId from Post Schema -> likes array

  try {
    const { postId } = req.body;

    if (!postId) {
      return res.send(errorMessage(404, "PostId not found!"));
    }

    const currentUserId = req._id; // from middleware -> loggedIn user userId -> currentUserId

    const post = await Post.findById(postId);

    if (!post) {
      res.send(errorMessage(401, "Post not found"));
    }

    // post -> owner , post_id ,
    if (post.likes.includes(currentUserId)) {
      // already likes this post
      // dislike -> ny removing userId from post likes array

      // 1) first finding index number of that user into likes array of this post
      const index = post.likes.indexOf(currentUserId);

      // 2) remove this index element
      post.likes.splice(index, 1);

      await post.save();

      return res.send(successMessage(200, "Post Unliked !"));
    } else {
      // like this post now
      // add userId to this post like array

      post.likes.push(currentUserId);

      await post.save();

      return res.send(successMessage(200, "Post liked !"));
    }
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};

const updatePostCotroller = async (req, res) => {
  console.log("updatePostController Called");

  try {
    const { postId, caption } = req.body;
    const currentUserId = req._id;

    if (!postId || !caption) {
      return res.send(errorMessage(404, "Post Id and caption Not Found!"));
    }

    const post = await Post.findById(postId); // current user post

    if (!post) {
      return res.send(successMessage(404, "Post Not found!"));
    }

    // is post  of current user -> or someone lese want to update

    if (post.owner.toString() != currentUserId) {
      return res.send(errorMessage(403, "ONly owner can update their post!"));
    }

    // for now update caption
    // later upodating image -? clooudinary , mongoDb gridFS , s3 bucket

    if (caption) {
      post.caption = caption;
    }

    await post.save();

    return res.send(successMessage(200, { post }));
  } catch (error) {
    return res.end(errorMessage(500, error.message));
  }
};

const deletePostController = async (req, res) => {
  console.log("deletePostController Called!");
  try {
    const { postId } = req.body;
    const currentUserId = req._id;

    if (!postId) {
      return res.send(errorMessage(404, "Post Id Not Found!"));
    }

    const post = await Post.findById(postId); // current user post
    const currentUser = await User.findById(currentUserId); // current user

    if (!post) {
      return res.send(successMessage(404, "Post Not found!"));
    }

    // is post  of current user -> or someone lese want to delete

    if (post.owner.toString() !== currentUserId) {
      return res.send(errorMessage(403, "Only owner can delete their post!"));
    }

    // owner has post array so delete this post from hist post array

    const index = currentUser.posts.indexOf(postId);
    currentUser.posts.splice(index, 1);

    await currentUser.save();
    // await post.remove();

    await Post.deleteOne({ _id: postId }); // Delete the post using deleteOne()

    return res.send(successMessage(200, "Post Deleted Successfully"));
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};

module.exports = {
  getAllPostsController,
  createPostController,
  likeAndUnlikePostController,
  updatePostCotroller,
  deletePostController,
  
};

// 
