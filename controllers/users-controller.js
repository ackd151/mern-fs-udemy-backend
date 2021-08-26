const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

  const { name, email, password } = req.body;
  const image = req.file.path;
  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

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
    newUser = new User({
      name,
      email,
      password: hashedPassword,
      image,
      places: [],
    });
    await newUser.save();
  } catch (err) {
    return next(new HttpError("Something went wrong in db user creation", 500));
  }

  let token;
  try {
    token = jwt.sign({ userId: newUser.id, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch (err) {
    return next(new HttpError("Something went wrong in db user creation", 500));
  }

  res.status(201).json({ userId: newUser.id, email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let foundUser;
  try {
    foundUser = await User.findOne({ email: email });
  } catch (err) {
    return next("Something went wrong in db user lookup.", 500);
  }

  if (!foundUser) {
    return next(
      new HttpError("Could not identify user, check credentials.", 403)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, foundUser.password);
  } catch (err) {
    return next(
      new HttpError("Could not log you in, please check credentials.", 500)
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Could not identify user, check credentials.", 401)
    );
  }

  let token;
  try {
    token = jwt.sign({ userId: foundUser.id, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch (err) {
    return next(
      new HttpError("Could not identify user, check credentials.", 403)
    );
  }

  res.json({ userId: foundUser.id, email, token });
};

module.exports = { getUsers, signup, login };
