const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placeRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpEror = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placeRoutes); //
app.use("/api/users", userRoutes); //

app.use((req, res, next) => {
  const error = new HttpEror("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    messgage: error.message || "An Unknown Error"
  });
});

mongoose
  .connect("mongodb://localhost:27017/places")
  .then(() => console.log("DB Connected."))
  .catch(err => console.log(err));

app.listen(3000, () => console.log("Server Started"));
