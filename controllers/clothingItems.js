const clothingItems = require("../models/clothingItem");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

const getClothingItems = (req, res, next) => {
  clothingItems
    .find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      return next(new BadRequestError("invalid data"));
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  clothingItems
    .findById(itemId)
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NotFoundError;
      throw error;
    })
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        return next(
          new ForbiddenError("You do not have permission to delete this item")
        );
      }
      return item.deleteOne().then(() => res.send(item));
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return next(new BadRequestError("invalid data"));
      }
      if (err.statusCode === NotFoundError) {
        return next(new NotFoundError("User Not Found"));
      }
      return next(err);
    });
};

const createItem = (req, res, next) => {
  const owner = req.user._id;
  const { name, weather, imageUrl } = req.body;
  clothingItems
    .create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("invalid data"));
      }
      return next(err);
    });
};

const likeItem = (req, res, next) => {
  clothingItems
    .findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NotFoundError;
      throw error;
    })
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return next(new BadRequestError("invalid data"));
      }
      if (err.statusCode === NotFoundError) {
        return next(new NotFoundError("User Not Found"));
      }
      return next(err);
    });
};

const dislikeItem = (req, res, next) =>
  clothingItems
    .findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NotFoundError;
      throw error;
    })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return next(new BadRequestError("invalid data"));
      }
      if (err.statusCode === NotFoundError) {
        return next(new NotFoundError("User Not Found"));
      }
      return next(err);
    });

module.exports = {
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
  getClothingItems,
};
