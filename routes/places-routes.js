const express = require('express')

const router = express.Router()

const {
  getPlacesById,
  getPlaceByUserId,
  createPlace,
  updatePlace,
  deletePlace
} = require('../controllers/place-controllers')

router.get('/:pid', getPlacesById)

router.get('/user/:uid', getPlaceByUserId)

router.post('/', createPlace)

router.patch('/:pid', updatePlace)

router.delete('/:pid', deletePlace)

module.exports = router
