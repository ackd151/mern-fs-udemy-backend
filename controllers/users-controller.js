const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const DUMMY_USERS = [
  {
    id: "u1",
    name: "John Doe",
    email: "jDoe@gmail.com",
    password: 123456,
  },
  {
    id: "u2",
    name: "Test",
    email: "test@test.com",
    password: 123456,
  },
];

const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid credentials submitted.", 422);
  }

  const { username, email, password } = req.body;

  const emailExists = DUMMY_USERS.find((user) => user.email === email);
  if (emailExists) {
    throw new HttpError(
      "An account with the provided email already exists",
      422
    );
  }

  const createdUser = {
    id: uuid(),
    name: username,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const foundUser = DUMMY_USERS.find((user) => user.email === email);

  if (!foundUser || foundUser.password !== password) {
    throw new HttpError("Counld not identidy user, check credentials.", 401);
  }

  res.status(200).json({ message: "Logged in!" });
};

module.exports = { getUsers, signup, login };
