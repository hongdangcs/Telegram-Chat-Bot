const axios = require("axios");
const { ssi } = require("../configs");

// Returns "Bearer <accessToken>"; throws if SSI rejects the credentials.
async function getAccessToken() {
  const response = await axios.post(
    "https://fc-data.ssi.com.vn/api/v2/Market/AccessToken",
    {
      consumerID: ssi.consumerID,
      consumerSecret: ssi.consumerSecret,
    }
  );
  const accessToken = response.data?.data?.accessToken;
  if (!accessToken) {
    throw new Error(response.data?.message || "SSI returned no access token");
  }
  return "Bearer " + accessToken;
}

module.exports = getAccessToken;
