const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

const { successMessage, errorMessage } = require("../utils/responseWrapper");
const { mapPostOutput } = require("../utils/utils");

const followAndUnfollowUserController = async (req, res) => {
  console.log("FollowUserCOntr");

  try {
    // getting id of user to b folllowed

    const { userIdToFollow } = req.body; // yeah valid heah ?
    const currentUserId = req._id; // logged user

    if (!userIdToFollow) {
      return res.send(errorMessage(404, "UserToFollowId not found!"));
    }

    if (currentUserId === userIdToFollow) {
      // user can't follow it self
      return res.send(errorMessage(409, "User can't follow himself!"));
    }

    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      // no need to apply this check -> but good to have all things from backend
      return res.send(errorMessage(404, "User To Follow Not Found!"));
    }

    // actually current user wants to follow this userToFollow
    // check already follow or not

    if (currentUser.followings.includes(userIdToFollow)) {
      // current user already following this cliked user -> userToFollow

      // so do unfollow
      const index = currentUser.followings.indexOf(userIdToFollow);
      currentUser.followings.splice(index, 1);

      // but also userToFollow -> already has this user in his followers list so remove current user from that'
      const index2 = userToFollow.followers.indexOf(currentUserId);
      userToFollow.followers.splice(index2, 1);

      //save both user
      await currentUser.save();
      await userToFollow.save();

      return res.send(successMessage(200, {user:userToFollow}));
    } else {
      // current user wants to follow this userToFollow

      currentUser.followings.push(userIdToFollow);
      userToFollow.followers.push(currentUserId);

      await currentUser.save();
      await userToFollow.save();

      return res.send(successMessage(200, {user:userToFollow}));
    }
  } catch (error) {
    return res.send(successMessage(500, error.message));
  }
};

// In frontEnd to show all post of my followings user (loggedInUser)
const getPostOfFollowingsController = async (req, res) => {
  try {
    const currentUserId = req._id;

    const currentUser = await User.findById(currentUserId);

    // going to all post check if ownerId !=  followingsId of currentUserId's
    // mean of owner( creator id) is in the list of  current user followings == post of current user Followings

    const posts = await Post.find({
      owner: {
        $in: currentUser.followings,
      },
    });

    return res.send(successMessage(200, { posts }));
  } catch (error) {
    return res.send(successMessage(500, error.message));
  }
};

const getMyPostController = async (req, res) => {
  console.log("getMyPostController Called!");

  // giving us current user posts ->
  // user should be logged in

  try {
    const userId = req._id; // curretn user Id

    if (!userId) {
      return res.send(errorMessage(404, "User is Not Logged in!"));
    }

    const currentUser = await User.findById(userId); // current user

    if (!currentUser) {
      return res.send(errorMessage(404, "User Not Found"));
    }

    // take all post and return it
    // also populate users inside it who liked this post
    const posts = await Post.find({ owner: userId }).populate("likes");

    return res.send(successMessage(200, { posts }));
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};

const getUserPostsController = async (req, res) => {
  console.log("getUserPostsController Called");
  // let we are getting userId from body

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.send(errorMessage(404, "UserId required!"));
    }

    const userCliked = await User.findById(userId);

    if (!userCliked) {
      return res.send(errorMessage(404, "User Not Found!"));
    }

    // all posts of user
    const posts = await Post.find({ owner: userId }).populate("likes");

    return res.send(successMessage(200, { posts }));
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};

const deleteUserProfileController = async (req, res) => {
  console.log("deleteUserProfileController!");

  // first of all user should be logged in !
  // apply require middleware

  try {
    const userId = req._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.send(errorMessage(404, "User To Deleted Not Found!"));
    }

    // step to delete user

    // (1) delete from User table
    await User.deleteOne({ _id: userId });

    // (2) also delete from followers list of user for them this(current / logged ) followed them

    //const allUser = await User.find();
    // allUser.forEach(async (user) => {
    //   const index = user.followings.indexOf(userId);
    //   user.followings.splice(index, 1);
    //   await user.save();
    // });

    await User.updateMany(
      { followings: userId },
      { $pull: { followings: userId } }
    );

    // (3) also delete from followings list of user who all follow this current user
    // allUser.forEach(async (user) => {
    //   const index = user.followers.indexOf(userId);
    //   user.followers.splice(index, 1);
    //   await user.save();
    // });

    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );

    // (4) also delete all posts of this user
    await Post.deleteMany({ owner: userId });

    // (5) also remove this user from posts like array for them user like their post

    // const posts = await Post.find();
    // posts.forEach(async (post) => {
    //   const index = post.likes.indexOf(userId);
    //   post.likes.splice(index, 1);
    //   await post.save();
    // });
    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });

    // 6) also remove user jwt (refresh token)m from cookies
    // remover cookies from

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    }); // -> jwt -> refresh_token

    // 7) and from frontEnd logout user and send to sginup user

    return res.send(successMessage(200, "User Profile Deleted Successfully!"));
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};

const getMyProfileController = async (req, res) => {
  try {
    const userId = req._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.send(errorMessage(404, "User Not Found!"));
    }

    return res.send(successMessage(200, { user }));
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};

const updateMyProfileController = async (req, res) => {
  console.log("updateMyProfileController Called");

  try {
    const { name, bio, userImg } = req.body; // uerImg -> base64 encoded

    const user = await User.findById(req._id);
    if (!user) {
      return res.send(errorMessage(404, "User Not Found!"));
    }

    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }

    if (userImg) {
      // base64 -> images
      // cloudinary -> images can be uplodeded

      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "socialMediaUserProfileImage",
        api_key: process.env.CLOUD_API_KEY,
      });

      // console.log(cloudImg);

      user.avatar = {
        publicId: cloudImg.public_id,
        url: cloudImg.secure_url,
      };
    }

    await user.save();

    return res.send(successMessage(200, { user }));
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};

const getUserProfileController = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });

    if (!user) {
      return res.send(errorMessage(404, "User Not Found!"));
    }

    const fullPosts = user.posts;

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    return res.send(successMessage(200, { ...user._doc, posts }));
  } catch (error) {
    return res.send(errorMessage(500, error.message));
  }
};


const  getFeedDataController = async (req, res) => {
  try {
    const currentUserId = req._id;

    const currentUser = await User.findById(currentUserId).populate('followings');

    // going to all post check if ownerId !=  followingsId of currentUserId's
    // mean of owner( creator id) is in the list of  current user followings == post of current user Followings

    const fullPosts = await Post.find({
      owner: {
        $in: currentUser.followings,
      },
    }).populate('owner');

    const posts = fullPosts.map(item => mapPostOutput(item,req._id)).reverse()

    const followingsId = currentUser.followings.map(item => item._id)

    followingsId.push(req._id)
    
    const suggestions = await User.find({
      _id:{
        $nin:followingsId
      }
    })

    return res.send(successMessage(200 , {...currentUser._doc ,suggestions , posts }));
    
  } catch (error) {
    return res.send(successMessage(500, error.message));
  }
};

module.exports = {
  followAndUnfollowUserController,
  getPostOfFollowingsController,
  getMyPostController,
  getUserPostsController,
  deleteUserProfileController,
  getMyProfileController,
  updateMyProfileController,
  getUserProfileController,
  getFeedDataController

  // getMyPost -> current user post
  // deleteMyProfile -> OSM ->
  // getUserPost -> particuler post -> base don userId
};

// findById -> log(N) -> B+ Trees 2^32 -> 32
// find -> O(N)
