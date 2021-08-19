const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    address: "20 W 34th St, New York, NY 10001",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Made up Place",
    address: "20 W 34th St, New York, NY 10001",
    description: "Apparently near the Empire State Building...",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const { placeId } = req.params;
  const place = DUMMY_PLACES.find((place) => place.id === placeId);

  if (!place) {
    throw new HttpError("Could not find a place for the provided ID.", 404);
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const { userId } = req.params;
  const places = DUMMY_PLACES.filter((place) => place.creator === userId);

  if (!places.length > 0) {
    return next(
      new HttpError("Could not find places for the provided user ID.", 404)
    );
  }

  res.json({ places });
};

const createPlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError(
      "Invalid inputs submitted, please verify your entries.",
      422
    );
  }

  const { title, address, description, creator, coordinates } = req.body;

  // Validate

  const createdPlace = {
    id: uuid(),
    title,
    address,
    description,
    creator,
    location: coordinates,
  };

  DUMMY_PLACES.unshift(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError(
      "Invalid inputs submitted, please verify your entries.",
      422
    );
  }

  const { placeId } = req.params;
  const foundPlace = { ...DUMMY_PLACES.find((place) => place.id === placeId) };
  const foundPlaceIndex = DUMMY_PLACES.findIndex(
    (place) => place.id === placeId
  );
  const { title, description } = req.body;

  if (!foundPlace) {
    throw new HttpError("Place not found for the provided ID", 404);
  }

  foundPlace.title = title;
  foundPlace.description = description;

  DUMMY_PLACES[foundPlaceIndex] = foundPlace;

  res.status(200).json({ place: foundPlace });
};

const removePlace = (req, res, next) => {
  const { placeId } = req.params;
  const placeIndex = DUMMY_PLACES.find((place, index) => {
    place.id === placeId;
    return index;
  });
  if (!placeIndex) {
    throw new HttpError("Place not found for the provided ID", 404);
  }
  DUMMY_PLACES.splice(placeIndex, 1);
  res.status(200).json({ message: "Place deleted." });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  removePlace,
};
