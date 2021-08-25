const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { getUsers, signup, login } = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

router.get("/", getUsers);
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("password").isLength({ min: 6 }),
    check("email").normalizeEmail().isEmail(),
  ],
  signup
);
router.post("/login", login);

module.exports = router;
