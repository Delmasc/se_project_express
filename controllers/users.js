const User = require("../models/user");

const {
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
} = require("../utils/errors");

// Get /users

const getUsers = (req, res) => {
  console.log("Retrieving all users");
  return User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while retrieving users" });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  console.log("Creating user with data:", req.body);
  return User.create({ name, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      console.error(err);
      console.log(err.name);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid user data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error creating user" });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      console.log(err.name);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      } else if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid user ID" });
      } else {
        return res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "Error has occured in the server" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error retrieving user" });
    });
};

module.exports = { getUsers, createUser, getUser };
