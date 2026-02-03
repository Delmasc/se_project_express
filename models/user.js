const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The "name" field must be filled in'],
    minlength: [2, 'The minimum length of the "name" field is 2'],
    maxlength: [30, 'The maximum length of the "name" field is 30'],
  },
  avatar: {
    type: String,
    required: [true, "The avatar field is required"],
    validate: {
      validator: (value) => validator.isURL(value),
      message: "You must provide a valid URL",
    },
  },
});

module.exports = mongoose.model("user", userSchema);
