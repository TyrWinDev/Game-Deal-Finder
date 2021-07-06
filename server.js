const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const path = require("path");
const axios = require("axios");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");

//CheapShark API URLs
//Search
const searchURL = "https://www.cheapshark.com/api/1.0/games?title=";
//Deals
const dealsURL = "https://www.cheapshark.com/api/1.0/games?id=";
//Stores
const storesURL = "https://www.cheapshark.com/api/1.0/stores";

//Microsoft conginitive Image Search Using Bing
// const imageURL
//GET THIS API LATER

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

//Using EJS for views
app.set("view engine", "ejs");

//Acces the view files from any directory
app.set("views", path.join(__dirname, "/views"));

//Static Folder
app.use(express.static("public"));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//Verifies the request are made via https
app.use(function (req, res, next) {
  if (req.get("X-Fowarded-Proto") == "https" || req.hostname == "localhost") {
    // if http request
    next();
  } else {
    //If not https request, then redirect to https
    res.redirect("https://" + req.headers.host + req.url);
  }
});

//Game Search Controller
app.get("/results", function (req, res) {
  let searchKeyword;
  const titles = [];
  const cheapest = [];
  const images = [];
  const gameID = [];

  searchkeyword = req.query.game_title;
  titles.length = 0;
  cheapest.length = 0;
  images.length = 0;
  gameID.length = 0;
  axios
    .get(searchURL + searchKeyword)
    .then(function (response) {
      for (let i = 0; i < response.data.length; i++) {
        titles.push(response.data[i]["external"]);
        cheapest.push(response.data[i]["cheapest"]);
        images.push(response.data[i]["thumb"]);
        gameID.push(response.data[i]["gameID"]);
      }
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {
      res.render("results", {
        searchKeyword: searchKeyword,
        titles: titles,
        lowestPrice: cheapest,
        image: images,
        gameID: gameID,
      });
    });
});

//Deals Controller
app.get("/deals/:id", function (req, res) {
  let Image;
  let id;
  let selectedTitle;
  let cheapestPriceEver;
  let deals = [];
  let storeID;
  let dealID;
  let price;
  let retailPrice;
  let savings;
  let storeName;

  id = req.params.id;
  deals.length = 0;
  selectedTitle = "";
  axios
    .all([axios.get(dealsURL + id), axios.get(storesURL)])
    .then(
      axios.spread((responseDeals, responseStore) => {
        selectedTitle = responseDeals.data.info.titles;
        cheapestPriceEver = responseDeals.data.cheapestPriceEver.price;
        retailPrice = responseDeals.data["deals"][0]["retailPrice"];
        for (let i = 0; i < responseDeals.data.deals.length; i++) {
          storeID = responseDeals.data["deals"][i]["storeID"];
          dealID = responseDeals.data["deals"][i]["dealID"];
          price = responseDeals.data["deals"][i]["price"];
          savings = responseDeals.data["deals"][i]["savings"];
          storeName = responseStore.data[storeID - 1]["storeName"];
          deals.push({
            storeID: storeID,
            dealID: dealID,
            currentPrice: price,
            retailPrice: retailPrice,
            savings: savings,
            storeName: storeName,
          });
        }
      })
    )
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {
      axios
        .get(imageURL + encodeURIComponent(selectedTitle + "PC game"), {
          headers: {
            "Ocp-Apim-Subscription-Key": subscriptionKey,
          },
        })
        .then((responseImage) => {
          image = responseImage.data.value[0].thumbnailUrl;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          res.render("deals", {
            image: image,
            selectedTitle: selectedTitle,
            retailPrice: retailPrice,
            cheapestPriceEver: cheapestPriceEver,
            deals: deals,
          });
        });
    });
});

//404 Render
app.get("*", function (req, res) {
  res.render("404");
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/post", postRoutes);

//Server Running
app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");
});
