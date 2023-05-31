const {
  followAndUnfollowUserController,
  getPostOfFollowingsController,
  getMyPostController,
  getUserPostsController,
  deleteUserProfileController
} = require("../controllers/userController");
const { requireUserMiddleware } = require("../middlewares/requireUser");

const router = require("express").Router();

router.post("/follow", requireUserMiddleware, followAndUnfollowUserController);
router.get("/postsOfFollowings", requireUserMiddleware, getPostOfFollowingsController);
router.get("/getMyPosts", requireUserMiddleware, getMyPostController);
router.post("/getUserPosts", requireUserMiddleware, getUserPostsController);
router.delete("/deleteUserProfile", requireUserMiddleware, deleteUserProfileController);


module.exports = router;
