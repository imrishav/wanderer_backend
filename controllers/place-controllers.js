const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const uuid = require("uuid");
const { validationResult } = require("express-validator");

const Place = require("../models/places");
const User = require("../models/user");

const getCoordiantes = require("../utils/location");

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

  // let place;
  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    const err = new HttpError("Fetching Failed Try again Later:", 500);
    return next(err);
  }
  if (!userWithPlaces || userWithPlaces.length === 0) {
    return next(new HttpError("Could not find a place with the user id", 404));
  }

  res.json({
    place: userWithPlaces.places.map(e => e.toObject({ getters: true }))
  });
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
    title,
    description,
    address,
    location: coordinates,
    image: "url",
    creator
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError("Cannot Save, Something Went Wrongsss", 500);
    return next(err);
  }

  if (!user) {
    const err = new HttpError("Could Not Find user", 404);
    return next(err);
  }

  try {
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // await createdPlace.save({ session: sess });
    // user.places.push(createdPlace);
    // await user.save({ session: sess });
    // await sess.commitTransaction();

    await createdPlace.save();
    user.places.push(createdPlace);
    await user.save();
  } catch (error) {
    const err = new HttpError(error, 500);
    return next(err);
  }

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
    place = await Place.findById(pid).populate("creator");
  } catch (error) {
    const err = new HttpError("Could not find place", 500);
    return next(err);
  }

  if (!place) {
    const error = new HttpError("Could not find the place", 404);
    return next(error);
  }

  try {
    // await place.remove();
    place.creator.places.pull(place);
    await place.creator.save();
  } catch (error) {
    const err = new HttpError("Could not Save", 500);
    return next(err);
  }

  res.status(200).json({ message: "Place deleted.." });
};
