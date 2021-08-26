const express = require("express");
const { check } = require("express-validator");

const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");
const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  removePlace,
} = require("../controllers/places-controller");

const router = express.Router();

router
  .route("/:placeId")
  .get(getPlaceById)
  .patch(
    checkAuth,
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    updatePlace
  )
  .delete(checkAuth, removePlace);

router.get("/user/:userId", getPlacesByUserId);

router.post(
  "/",
  checkAuth,
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);

module.exports = router;
