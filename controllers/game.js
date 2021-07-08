const axios = require("axios");
const searchURL = "https://www.cheapshark.com/api/1.0/games?title=";

const dealsURL = "https://www.cheapshark.com/api/1.0/games?id=";
const storesURL = "https://www.cheapshark.com/api/1.0/stores";
const imageURL = "https://www.giantbomb.com/api/search/?api_key=";
const subscriptionKey = process.env.GB_KEY;

module.exports = {
  getResults: async (req, res) => {
    let searchKeyword;
    const titles = [];
    const cheapest = [];
    const images = [];
    const gameID = [];
    searchKeyword = req.query.game_title;
    titles.length = 0;
    cheapest.length = 0;
    images.length = 0;
    gameID.length = 0;
    axios
      .get(searchURL + searchKeyword)
      .then(function (response) {
        // handle success
        for (let i = 0; i < response.data.length; ++i) {
          titles.push(response.data[i]["external"]);
          cheapest.push(response.data[i]["cheapest"]);
          images.push(response.data[i]["thumb"]);
          gameID.push(response.data[i]["gameID"]);
        }
      })
      .catch(function (error) {
        // handle error
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
  },
  getDeals: async (req, res) => {
    let image;
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
          selectedTitle = responseDeals.data.info.title;
          cheapestPriceEver = responseDeals.data.cheapestPriceEver.price;
          retailPrice = responseDeals.data["deals"][0]["retailPrice"];
          for (let i = 0; i < responseDeals.data.deals.length; ++i) {
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
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
        axios
          .get(
            imageURL +
              encodeURIComponent(selectedTitle + "&resources=medium_url"),
            {
              headers: {
                GB_API_KEY: subscriptionKey,
              },
            }
          )
          .then((responseImage) => {
            image = responseImage.data.value[0].thumbnailUrl;
          })
          .catch(function (error) {
            console.log(error);
          })
          .get(function () {
            res.render("deals", {
              image: image,
              selectedTitle: selectedTitle,
              retailPrice: retailPrice,
              cheapestPriceEver: cheapestPriceEver,
              deals: deals,
            });
          });
      });
  },
};
