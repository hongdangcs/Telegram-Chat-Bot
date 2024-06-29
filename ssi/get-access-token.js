const axios = require("axios");
const { ssi } = require("../configs");
let data = JSON.stringify({
  consumerID: ssi.consumerID,
  consumerSecret: ssi.consumerSecret,
});

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://fc-data.ssi.com.vn/api/v2/Market/AccessToken",
  headers: {
    "Content-Type": "application/json",
  },
  data: data,
};

async function getAccessToken() {
  let accessToken = "";
  await axios
    .request(config)
    .then((response) => {
      accessToken = response.data.data.accessToken;
      console.log("get access token successful");
    })
    .catch((error) => {
      console.log(error);
    });
  return accessToken;
}

module.exports = getAccessToken;
