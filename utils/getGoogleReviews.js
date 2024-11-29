const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config({ path: "../config.env" });

const key = process.env.GOOGLE_API_KEY;

const placeId = "ChIJLbqrGikvdTERE7xp_pBCWvg";

const body = {
  method: "GET",
  url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${key}`,
  headers: {},
};

axios(body)
  .then(function (res) {
    console.log(JSON.stringify(res.data));
  })
  .catch(function (error) {
    console.log(error);
  });
