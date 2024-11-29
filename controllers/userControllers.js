const User = require("../models/user.model");
const createToken = require("../utils/createToken");
const isEmailValid = require("../helpers/isEmailValid");
const isPasswordValid = require("../helpers/isPasswordValid");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const jwt = require('jsonwebtoken');

exports.validateSignup = (req, res, next) => {
  try {
    isEmailValid(req.body.email);

    if (req.body.password != req.body.confirmPassword) {
      throw Error("the passwords aren't the same");
    }

    isPasswordValid(req.body.password);
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: error.message,
    });
  }

  next();
};

exports.validateSignin = (req, res, next) => {
  try {
    isEmailValid(req.body.email);
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: error.message,
    });
  }

  next();
};

exports.signUp = (req, res, next) => {
  console.log(req.body)
  if (req.body.password != req.body.confirmPassword) {
    return next(new AppError("password aren't the same", 404));
  }

  User.signup(req.body.email, req.body.password)
    .then((user) => {
      const token = createToken(user._id);
      return res.json({
        status: "success",
        token,
        data: {
          email: user.email,
          id: user._id,
        },
      });
    })
    .catch((err) => {
      return res.status(401).json({
        status: "failed",
        message: err.message,
      });
    });
};

exports.logIn = (req, res) => {
  User.login(req.body.email, req.body.password)
    .then(async (user) => {
      const token = createToken(user._id);
      console.log(token)
      const {_id} = jwt.verify(token, process.env.SECRET_JWT)


      return res.json({
        status: "success",
        token,
        data: {
          email: user.email,
          id: user._id,
        },
      });
    })
    .catch((err) => {
      return res.status(401).json({
        status: "failed",
        message: err.message,
      });
    });
};

exports.getUser = (req, res) => {
  User.get(req.body.email)
    .then(async (user) => {
      return res.json({
        status: "success",
        data: {
          email: user.email,
          id: user._id,
          password: user.password,
        },
      });
    })
    .catch((err) => {
      return res.status(401).json({
        status: "failed",
        message: err.message,
      });
    });
};

exports.deleteUser = (req, res) => {
  User.delete(req.body.email)
    .then(async (user) => {
      return res.json({
        status: "success",
        data: {
          email: user.email,
          id: user._id
        },
      });
    })
    .catch((err) => {
      return res.status(401).json({
        status: "failed", 
        message: err.message,
      });
    });
};

