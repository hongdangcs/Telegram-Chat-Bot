const getAccessToken = require("./ssi/get-access-token");

getAccessToken().then((accessToken) => {
  console.log(accessToken);
});
