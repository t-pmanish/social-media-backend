//  this middleware check that in authorization header we get the access_token or not -> set on each api call / at one time (axios) on authorizatio header
// if we get the access token then we send as user wants otherwise it measn user is not logged in or not valid user -> logout
// getKepper-> Middleware

const User = require("../models/User");
const { successMessage, errorMessage } = require("./../utils/responseWrapper");
const jwt = require("jsonwebtoken");

const requireUserMiddleware = async (req, res, next) => {
  console.log("Require user middleware called!");

  // verfication
  // Note -> authorization headers sends from frontEnd
  // 1) access_token is present or not in header authorization -> accessing from authorization header
  // 2) valid access token or not

  // req.headers.authorization = "Bearer access_token"

  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.send(errorMessage(401, "Authorization header is required!"));
  }

  // authorization headder is available mean check for validity

  const access_token = req.headers.authorization.split(" ")[1]; // gives array ->['Bearer' , 'access_token']

  // validate access token

  

  try {
    const decoded_access_token = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN_SECRET_KEY
    );
    // jst.verify(access_token, secret_key) // validation or expires or not

    // put userid(_id) from access_from to request for cotrollers

    // console.log(
    //   "From require user middleware - decoded & verified access token - ",
    //   decoded_access_token
    // );

    req._id = decoded_access_token._id; // updated / putting (only thing u can get are which u have passed as time of singing to jwt.sign -> payload u have passed)

   
    // not need to handle
    // also check that user has been deleted or not ?
    // because access_token is vaid till 15 min 
    // this ncheck also needed

    const user = await User.findById(req._id)

    if(!user){
      return res.send(errorMessage(404,'User Deleted! | User Not Found!'))
    }

    next();

    // now call for next or do rest of your work as ur are allowed
  } catch (error) {
    // invalid or expires
    return res.send(errorMessage(401, "Invalid Access Key / Token!"));
  }

  // Valid user only want needed resource u can give it
};

module.exports = {
  requireUserMiddleware,
};
