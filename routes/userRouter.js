const {
  followAndUnfollowUserController,
  getPostOfFollowingsController,
  getMyPostController,
  getUserPostsController,
  deleteUserProfileController,
  getMyProfileController,
  updateMyProfileController,
  getUserProfileController,
  getFeedDataController,
} = require("../controllers/userController");
const { requireUserMiddleware } = require("../middlewares/requireUser");

const router = require("express").Router();

router.post("/follow", requireUserMiddleware, followAndUnfollowUserController);
router.get(
  "/postsOfFollowings",
  requireUserMiddleware,
  getPostOfFollowingsController
);
router.get("/getMyPosts", requireUserMiddleware, getMyPostController);
router.post("/getUserPosts", requireUserMiddleware, getUserPostsController);
router.delete(
  "/deleteUserProfile",
  requireUserMiddleware,
  deleteUserProfileController
);
router.get("/getMyProfile", requireUserMiddleware, getMyProfileController);
router.put(
  "/updateMyProfile",
  requireUserMiddleware,
  updateMyProfileController
);

router.post("/getUserProfile", requireUserMiddleware, getUserProfileController);

router.get(
  "/getFeedData",
  requireUserMiddleware,
  getFeedDataController,
);

module.exports = router;
