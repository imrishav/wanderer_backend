const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "testers"
  }
];

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Failed!!Try again", 500);
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Failed!!Try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User Exist ", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: "url",
    password,
    places: []
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError("Something Went Wrong", 500);
    return next(err);
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Failed!!Try again", 500);
    return next(error);
  }

  let validUser;
  try {
    validUser = await User.findOne({ email: email, password: password });
  } catch (error) {
    const err = new HttpError("User Name or Password is Wrong", 400);
    return next(err);
  }

  if (!validUser) {
    const error = new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    );

    return next(error);
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
