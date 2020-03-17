const HttpError = require('../models/http-error')
const uuid = require('uuid')

let DUMMY_PLACES = [
  {
    id: 'P1',
    title: 'Empire State Building',
    description: 'lorem',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
]

module.exports.getPlacesById = (req, res, next) => {
  const placeId = req.params.pid

  const places = DUMMY_PLACES.filter(p => {
    return p.id === placeId
  })

  if (!places || places.length === 0) {
    throw new HttpError('Could Not find a place with the id', 400)
  }

  res.json({ places })
}

module.exports.getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid

  console.log(userId)

  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId
  })
  if (!place) {
    return next(new HttpError('Could not find a place with the user id', 400))
  }

  res.json({ place })
}

module.exports.createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body

  const createdPlace = {
    id: uuid.v4(),
    title,
    description,
    location: coordinates,
    address,
    creator
  }

  DUMMY_PLACES.push(createdPlace)

  res.status(201).json({
    place: createdPlace
  })
}

module.exports.updatePlace = (req, res, next) => {
  const placeId = req.params.pid
  const { title, description } = req.body

  const place = { ...DUMMY_PLACES.find(p => p.pid === placeId) }
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
  place.title = title
  place.description = description

  DUMMY_PLACES[placeIndex] = place
  res.status(200).json({
    place: place
  })
}

module.exports.deletePlace = (req, res, next) => {
  const placeId = req.params.pid

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== pid)
  res.status(200).json({ message: 'Place deleted..' })
}
