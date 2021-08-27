const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
// Import routes
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();
app.use(bodyParser.json());
app.use(
  "/uploads/images",
  //   express.static(path.join(__dirname, "uploads/images"))
  express.static(path.join("uploads", "images"))
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Mount routes
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// catch all route
app.use((req, res, next) => {
  throw new HttpError("No such route.", 404);
});

// Error handler
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

// Connect DB
mongoose.connect(
  `mongodb+srv://${process.env.ATLAS_USER}:${process.env.ATLAS_PASSWORD}@cluster0.svzuz.mongodb.net/${process.env.ATLAS_DB_NAME},?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("MongoDB connected");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(5000, console.log(`Listening on port ${PORT}`));
