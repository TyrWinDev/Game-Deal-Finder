const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    storeID: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
