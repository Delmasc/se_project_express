const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");

const BadRequestError = require("../errors/BadRequestError");
const ConflictError = require("../errors/ConflictError");
const NotFoundError = require("../errors/NotFoundError");

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, avatar, password, email } = req.body;

  bcrypt.hash(password, 13).then((hashedPassword) =>
    User.create({ name, avatar, password: hashedPassword, email })
      .then((user) => {
        const userObj = user.toObject();
        delete userObj.password;
        return res.status(201).send(userObj);
      })
      .catch((err) => {
        if (err.name === "ValidationError") {
          return next(new BadRequestError("invalid data"));
        }
        if (err.code === 11000) {
          return next(new ConflictError("Email Already exists"));
        }
        return next(err);
      })
  );
};

const updateCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;
  return User.findByIdAndUpdate(userId, { name, avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError("User Not Found "));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return next(new BadRequestError("invalid data"));
      }
      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("invalid data"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User Not Found"));
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
