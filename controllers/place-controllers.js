const HttpError = require("../models/http-error");
const uuid = require("uuid");
const { validationResult } = require("express-validator");

const Place = require("../models/places");

const getCoordiantes = require("../utils/location");

let DUMMY_PLACES = [
  {
    id: "P1",
    title: "Empire State Building",
    description: "lorem",
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1"
  }
];

module.exports.getPlacesById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Something Went Wrong..", 500);

    return next(err);
  }

  if (!place) {
    const error = new HttpError("Could Not Find a place for Provided Id", 404);
    return next(error);

    throw new HttpError("Could Not find a place with the id", 400);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

module.exports.getPlaceByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  console.log(userId);

  let place;

  try {
    place = await Place.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Fetching Failed Try again Later:", 500);
    return next(err);
  }
  if (!place || place.length === 0) {
    return next(new HttpError("Could not find a place with the user id", 404));
  }

  res.json({ place: place.map(e => e.toObject({ getters: true })) });
};

module.exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError("Missing Parameters", 402));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordiantes(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    id: uuid.v4(),
    title,
    description,
    location: coordinates,
    address,
    image: "url",
    creator
  });

  try {
    await createdPlace.save();
  } catch (error) {
    const err = new HttpError("Cannot Save, Something Went Wrong", 500);
    return next(err);
  }

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({
    place: createdPlace
  });
};

module.exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Missing Parameters", 402);
  }
  const placeId = req.params.pid;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findByIdAndUpdate(placeId);
    // place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Could not find place", 500);
    return next(err);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err = new HttpError("Could not Save", 500);
    return next(err);
  }
  res.status(200).json({
    place: place.toObject({ getters: true })
  });
};

module.exports.deletePlace = async (req, res, next) => {
  const pid = req.params.pid;

  let place;
  try {
    // place = await Place.deleteOne(pid);
    place = await Place.findById(pid);
  } catch (error) {
    const err = new HttpError("Could not find place", 500);
    return next(err);
  }

  try {
    await place.remove();
  } catch (error) {
    const err = new HttpError("Could not Save", 500);
    return next(err);
  }

  res.status(200).json({ message: "Place deleted.." });
};
