const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const HttpError = require("../models/http-error");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password").populate("places");
  } catch (err) {
    return next(new HttpError("Something went wrong in db get users", 500));
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  // Check req.body valid
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid credentials submitted.", 422));
  }

  const { username, email, password } = req.body;
  const image =
    "https://www.wolfhooker.com/wp-content/uploads/2019/02/176-1763433_user-account-profile-avatar-person-male-icon-icon-user-account.png.jpeg";

  // Look for existing email in db
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return next(
        new HttpError("A user with the provided email already exists", 422)
      );
    }
  } catch (err) {
    return next(new HttpError("Something went wrong in db email lookup", 500));
  }

  // Create new user
  let newUser;
  try {
    newUser = new User({ name: username, email, password, image });
    await newUser.save();
  } catch (err) {
    return next(new HttpError("Something went wrong in db user creation", 500));
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let foundUser;
  try {
    foundUser = await User.findOne({ email: email });
  } catch (err) {
    return next("Something went wrong in db user lookup.", 500);
  }

  if (!foundUser || foundUser.password !== password.toString()) {
    return next(
      new HttpError("Counld not identidy user, check credentials.", 401)
    );
  }

  res.status(200).json({ message: "Logged in!" });
};

module.exports = { getUsers, signup, login };
