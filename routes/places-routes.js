const express = require("express");
const { check } = require("express-validator");

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
    [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
    updatePlace
  )
  .delete(removePlace);

router.get("/user/:userId", getPlacesByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);

module.exports = router;
