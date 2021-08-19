const express = require("express");
const bodyParser = require("body-parser");

const HttpError = require("./models/http-error");
// Initialize routes
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

// Mount routes
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// catch all route
app.use((req, res, next) => {
  throw new HttpError("No such route.", 404);
});

// Error handler
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(5000, console.log(`Listening on port ${PORT}`));
