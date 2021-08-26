const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const Place = require("../models/place");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

const getPlaceById = async (req, res, next) => {
  const { placeId } = req.params;

  let foundPlace;
  try {
    foundPlace = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find place.", 500)
    );
  }
  if (!foundPlace) {
    return next(
      new HttpError("Could not find a place for the provided ID.", 404)
    );
  }

  res.json({ place: foundPlace.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const { userId } = req.params;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find places in DB", 500)
    );
  }
  if (!places.length > 0) {
    return next(
      new HttpError("Could not find places for the provided user ID.", 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  // Validate
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError(
        "Invalid inputs submitted, please verify your entries.",
        422
      )
    );
  }

  const { title, address, description, creator } = req.body;
  const location = getCoordsForAddress(address);

  const createdPlace = new Place({
    title,
    address,
    description,
    location,
    image: req.file.path,
    creator,
  });

  // Fetch user
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong in db fetch user for place creation.",
        500
      )
    );
  }
  if (!user) {
    return next(new HttpError("User not found", 500));
  }

  // Push place to user and save both
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError(
        "Creating place failed, please verify data and try again.",
        500
      )
    );
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError(
        "Invalid inputs submitted, please verify your entries.",
        422
      )
    );
  }

  const { placeId } = req.params;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place.", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const removePlace = async (req, res, next) => {
  const { placeId } = req.params;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError("Something went wrong in db remove.", 500));
  }

  if (!place) {
    return next(
      new HttpError("Something went wrong in db remove find place.", 404)
    );
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Something went wrong in db remove session.", 500)
    );
  }

  // Remove static image file
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Place deleted." });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  removePlace,
};
