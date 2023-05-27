const router = require("express").Router();
const {
  getAllPostsController,
  createPostController,
} = require("./../controllers/postController");
const { requireUserMiddleware } = require("./../middlewares/requireUser");

router.get("/all", requireUserMiddleware, getAllPostsController);
router.post("/create", requireUserMiddleware, createPostController);

module.exports = router;
