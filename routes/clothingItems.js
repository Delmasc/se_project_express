const router = require("express").Router();

const {
  deleteItem,
  getClothingItems,
  createItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

// Create, Post, Delete

router.get("/", getClothingItems);
router.post("/", createItem);
router.put("/:itemId/likes", likeItem);
router.delete("/:itemId/likes", dislikeItem);
router.delete("/:itemId", deleteItem);

module.exports = router;
