// imports
const router = require("express").Router();
const {
  loginController,
  signupController,
  refreshAccessTokenController,
} = require("./../controllers/authController");

// defining router for authentication
router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/refresh", refreshAccessTokenController);

// exporting routers
module.exports = router;
