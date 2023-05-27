const { successMessage, errorMessage } = require("./../utils/responseWrapper");

const getAllPostsController = async (req, res) => {
  console.log("PostController called!");
  console.log("user cmes after middleware confirmation is - ", req._id);
  return res.send(successMessage(200, "These ara all posts!"));
};

module.exports = {
  getAllPostsController,
};
