const router = require("express").Router();
const { getAllPostsController } = require("./../controllers/postController");
const { requireUserMiddleware } = require("./../middlewares/requireUser");

router.get("/all", requireUserMiddleware, getAllPostsController);

module.exports = router;
