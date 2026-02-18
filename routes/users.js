const router = require("express").Router();
const { updateCurrentUser, getCurrentUser } = require("../controllers/users");
const auth = require("../middlewares/auth");

router.use(auth);



router.get("/me", getCurrentUser);
router.patch("/me", updateCurrentUser);

module.exports = router;
