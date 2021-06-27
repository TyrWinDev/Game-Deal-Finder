var axios = require("axios");

var config = {
  method: "get",
  url: "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15",
  headers: {},
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
