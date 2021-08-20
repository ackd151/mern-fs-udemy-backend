const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  image: {
    type: String,
    required: true,
  },
  places: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],
});

userSchema.plugin(uniqueValidator);

module.exports = model("User", userSchema);
