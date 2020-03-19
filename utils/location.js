const axios = require("axios");
const HttpError = require("../models/http-error");

const API = "AIzaSyB69gAsjEpG0HeVcx7cvvB8_ImBxTLaAF8";

module.exports = async function getCoordantiates(address) {
  const address2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=AIzaSyB69gAsjEpG0HeVcx7cvvB8_ImBxTLaAF8`;
  const response = await axios.get(address2);

  const data = response.data;

  //   return data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError("No Result Found", 404);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;
  return coordinates;
};
