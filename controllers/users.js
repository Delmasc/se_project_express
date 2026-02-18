const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const bcrypt = require("bcryptjs");

const {
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
  CONFLICT,
} = require("../utils/errors");

// Get /users

const getUsers = (req, res) => {
  return User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while retrieving users" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      res.status(BAD_REQUEST).send({ message: "Invalid email or password" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, password, email } = req.body;
  bcrypt.hash(password, 13).then((hashedPassword) => {
    return User.create({ name, avatar, password: hashedPassword, email })
      .then((user) => {
        const userObj = user.toObject();
        delete userObj.password;
        return res.status(201).send(userObj);
      })
      .catch((err) => {
        console.error(err);
        if (err.name === "ValidationError") {
          return res.status(BAD_REQUEST).send({ message: "Invalid user data" });
        }
        if (err.code === 11000) {
          return res.status(CONFLICT).send({ message: "Email already exists" });
        }
        return res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "Error creating user" });
      });
  });
};

const updateCurrentUser = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;
  return User.findByIdAndUpdate(userId, { name, avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid user data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error updating user" });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Invalid user ID" });
      } else if (err.statusCode === NOT_FOUND) {
        res.status(NOT_FOUND).send({ message: err.message });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
