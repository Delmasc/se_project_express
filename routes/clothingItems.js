const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  deleteItem,
  getClothingItems,
  createItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const {
  validateGetClothingItems,
  validateId,
  validateCreateItem,
} = require("../middlewares/validations");

// Create, Post, Delete

router.get("/", validateGetClothingItems, getClothingItems);
router.use(auth);
router.post("/", validateCreateItem, createItem);
router.put("/:itemId/likes", validateId, likeItem);
router.delete("/:itemId/likes", validateId, dislikeItem);
router.delete("/:itemId", validateId, deleteItem);

module.exports = router;
