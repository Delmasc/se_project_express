const clothingItems = require("../models/clothingItem");
const {
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
} = require("../utils/errors");

const getClothingItems = (req, res) => {
  clothingItems
    .find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred while retrieving clothing items" });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  clothingItems
    .findByIdAndDelete(itemId)
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then(() => {
      res.status(200).send({ message: "Item deleted successfully" });
    })
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

const createItem = (req, res) => {
  const owner = req.user._id;
  const { name, weather, imageUrl } = req.body;

  clothingItems
    .create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item data" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error creating clothing item" });
    });
};

const likeItem = (req, res) =>
  clothingItems
    .findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      } else if (err.statusCode === NOT_FOUND) {
        res.status(NOT_FOUND).send({ message: err.message });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR)
          .send({ message: "An error has occurred on the server" });
      }
    });

const dislikeItem = (req, res) =>
  clothingItems
    .findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      res.send({ data: item });
    })
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

module.exports = {
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
  getClothingItems,
};
