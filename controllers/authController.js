// dependecies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// required fiels
const User = require("./../models/User");
const { successMessage, errorMessage } = require("./../utils/responseWrapper");

const signupController = async (req, res) => {
  console.log("signup Controller Called");

  try {
    // getting data
    const { email, password } = req.body;

    // required field check
    if (!email || !password) {
      return res.status(400).send(errorMessage(400, "All field are required"));
    }

    // ALready registered
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res
        .status(409)
        .send(errorMessage(409, "Already registered with email! Try another"));
    }

    // now we can create user

    // 1) password -> HASH password -> provided by bcrypt -> async function
    // 2) Then save this password

    const hash_pasaword = await bcrypt.hash(password, 10); // (field to be encrypt , number of rounds)

    const user = await User.create({
      // here no need to save -> another method to create user & save
      email,
      password: hash_pasaword,
    });

    // now send resposne
    return res.send(successMessage(201, { user }));
  } catch (error) {
    return res.send(errorMessage(400, error));
  }
};

const loginController = async (req, res) => {
  console.log("login Controller Called");
  try {
    // getting data
    const { email, password } = req.body;

    // required field check
    if (!email || !password) {
      return res.status(400).send(errorMessage(400, "All field are required!"));
    }

    // registred or not -> Note -> Only one user with this email

    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(404).send(errorMessage(404, "User not registered!"));
    }

    // password match
    // 1) decrypt password -> await bcrypt.compare(old_password,new_password)
    // 2) check matching

    const is_password_matched = await bcrypt.compare(
      password, // new password
      userExists.password // old password
    );

    if (!is_password_matched) {
      return res.send(errorMessage(403, "Password not matched!"));
    }

    // now we can way user is valid

    // now generate access token -> jwt.sign (payload,secrst_key) -> used for api call -> sent to frontEnd
    const access_token = await generateAccessToken({
      _id: userExists._id,
    });

    // send to client side -> in very secure manner -> set into cookies -> used when access_token expires
    const refresh_token = await generateRefreshToken({
      _id: userExists._id,
    });

    // by setting this cookies as jwt (refresh_token) we can make use of it to generate new access_token
    res.cookie("jwt", refresh_token, {
      // setting refresh token to our frontEnd in  cookies -> backend to frontEnd set something
      httpOnly: true,
      secure: true,
    });

    // The send to frontEnd -> front end make use this for api call or others
    return res.send(successMessage(200, { access_token }));
    // store access this token -> then further any subsequesnt reqest we can send this access_token for verification /  validation
  } catch (error) {
    return res.send(errorMessage(400, error));
  }
};

// insternal function -> to generate access token

const generateAccessToken = async (data) => {
  try {
    const access_token = await jwt.sign(
      data,
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "1m" }
    ); // jwt.sign(data,secret_key,{expiresIn:xm s})
    return access_token;
  } catch (error) {
    console.log("from generate access token error", error);
    return error;
  }
};

const generateRefreshToken = async (data) => {
  try {
    const refresh_token = await jwt.sign(
      data,
      process.env.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: "1y" }
    ); // jwt.sign(data,secret_key,{expiresIn:xm s}) // saved in client end
    return refresh_token;
  } catch (error) {
    console.log("from generate refresh token error", error);
    return error;
  }
};

// This API Called by frontEnd  -> By REACT -> silently -> using axios interceptor
// if we noticed that access token expires then int the interceptor only we can call refresh tokena api and
//Then using this new access token we go mforward to do our next task or api call

const refreshAccessTokenController = async (req, res) => {
  console.log("RefreshAccessToken Controller Called");

  // intially get refresh token from client -> from cookies we will be calling -> for now api testing passed through body request of API
  // const { refresh_token } = req.body;

  // Now we can get refresh token from our cookies
  // first check is refresh_token (jwt) is present or not

  const cookies = req.cookies; // already set into frontEnd cookies so we can get it from cookies

  if (!cookies.jwt) {
    return res.send(errorMessage(401, "Refresh Token is required in cookies"));
  }

  // 401 mean -> RT Not getted -> refresh token not is in cookies -> logout
  // 401 mean -> RT expires -> Or Invalid
  // 200 means -> ok -> get the token and valid

  const refresh_token = cookies.jwt;

  // if (!refresh_token) {
  //   res.status(401).json({
  //     success: false,
  //     error: "Refresh Token is required",
  //   });
  //   return;
  // }
  // in futute this refresh token access from cookies -> going to be get api call only -> for getting refresh for frontend by calling backend api to send new access token

  // 1) this will refresh token validity
  // 2) generate new access token and send

  // validity check -> that refresh has not expires

  try {
    const decode_refresh_token = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET_KEY
    ); // this will verify and decode

    // generate another access token and send it to client

    const _id = decode_refresh_token._id;

    const new_access_token = await generateAccessToken({ _id });

    // use this access token form frontEnd to refresh expires access token and go forwards to do anything
    return res.send(successMessage(200, { new_access_token }));
  } catch (error) {
    // invalid or expires
    return res.send(errorMessage(401, `Invalid refresh token/ key , ${error}`));
  }
};

module.exports = {
  loginController,
  signupController,
  refreshAccessTokenController,
};
