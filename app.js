const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const redis = require("redis");

const placeRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpEror = require("./models/http-error");

const app = express();
const client = redis.createClient({
  host: "redisnode-server", //Docker Compose services name.
  port: 6379,
});
client.set("visits", 0);

app.use(bodyParser.json());

// app.use((req,res,next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With, Content-Type, Accept, Authorization');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH,DELETE');
//   next();
// })

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.get("/red", (req, res) => {
  client.get("visits", (err, visits) => {
    res.send("Number of visits is " + visits);
    client.set("visits", parseInt(visits) + 1);
  });
});

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
    messgage: error.message || "An Unknown Error",
  });
});

mongoose
  // .connect("mongodb://localhost:27017/wanderer") local server
  .connect("mongodb://mongo:27017/wanderer") //docker server
  // .connect("mongodb://places:rishav21@ds011452.mlab.com:11452/places")
  .then(() => console.log("DB Connected."))
  .catch((err) => console.log(err));

app.listen(3001, () => console.log("Server Started at 3001"));
