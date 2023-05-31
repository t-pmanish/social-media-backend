const router = require("express").Router();
const {
  getAllPostsController,
  createPostController,
  likeAndUnlikePostController,
  updatePostCotroller,
  deletePostController
} = require("./../controllers/postController");
const { requireUserMiddleware } = require("./../middlewares/requireUser");

router.get("/all", requireUserMiddleware, getAllPostsController);
router.post("/create", requireUserMiddleware, createPostController);
router.post("/like", requireUserMiddleware, likeAndUnlikePostController);
router.put("/update", requireUserMiddleware, updatePostCotroller);
router.delete("/delete", requireUserMiddleware, deletePostController);

module.exports = router;
