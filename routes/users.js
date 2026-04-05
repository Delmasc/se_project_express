const router = require("express").Router();
const { updateCurrentUser, getCurrentUser } = require("../controllers/users");
const auth = require("../middlewares/auth");
const {
  validateGetCurrentUser,
  validateUpdateCurrentUser,
} = require("../middlewares/validations");

router.use(auth);

router.get("/me", validateGetCurrentUser, getCurrentUser);
router.patch("/me", validateUpdateCurrentUser, updateCurrentUser);

module.exports = router;
