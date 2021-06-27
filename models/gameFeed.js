const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  storeID: {
    String,
  },
  thumb: {
    type: String,
    require: true,
  },
  steamAppID: {
    type: Number,
  },
  dealID: {
    type: String,
    required: true,
  },
  dealRating: {
    type: String,
    required: true,
  },
  steamRatingPercent: {
    type: String,
    required: true,
  },
  metacriticScore: {
    type: String,
    required: true,
  },
  metacriticLink: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: String,
    required: true,
  },
  dealRating: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Game", gameSchema);
