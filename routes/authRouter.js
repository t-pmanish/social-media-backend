// imports
const router = require("express").Router();
const {
  loginController,
  signupController,
  refreshAccessTokenController,
  logoutController
} = require("./../controllers/authController");

// defining router for authentication
router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/refresh", refreshAccessTokenController);
router.post("/logout", logoutController);

// exporting routers
module.exports = router;
