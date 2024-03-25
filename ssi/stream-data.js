const { ssi } = require("../configs");
const client = require("../ssi-fcdata");
const axios = require("axios");

let token =
  "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJhdWQiOiAiNjRmOGYzYzY0MjExNDViNjgyNjNlMTZiNzk4OTdhMTAiLAogICJpYXQiOiAxNzExMzc1MzYwLAogICJleHAiOiAxNzExNDA0MTYwLAogICJzY29wZSI6IHsKICAgICJJcCI6IHsKICAgICAgIklwQWRyZXNzIjogIiIsCiAgICAgICJJc1ZhbGlkIjogdHJ1ZQogICAgfSwKICAgICJUYXJnZXQiOiBbCiAgICAgIHsKICAgICAgICAiVGFyZ2V0SWQiOiAiMGMyZTRhN2JlZDYxNDdiMzllZTdmM2UyZTcyNGNiMzIiLAogICAgICAgICJUYXJnZXRVcmwiOiAiaHR0cHM6Ly9mYy10cmFkZWFwaS5zc2kuY29tLnZuIiwKICAgICAgICAiQ29ubmVjdGlvbk5hbWUiOiAiRkNUcmFkaW5nIgogICAgICB9LAogICAgICB7CiAgICAgICAgIlRhcmdldElkIjogIjVkMWI4OWNiZDc3YTQ1ZTQ5MzkyOWFhMTZlZWM5N2M1IiwKICAgICAgICAiVGFyZ2V0VXJsIjogImh0dHBzOi8vZmMtZGF0YS5zc2kuY29tLnZuIiwKICAgICAgICAiQ29ubmVjdGlvbk5hbWUiOiAiRkNEYXRhIgogICAgICB9CiAgICBdCiAgfSwKICAiY2xpIjogIlVzZXJBcHAyNzUwNzciLAogICJzdWIiOiAiMjc1MDc3Igp9.P7UBIY3cCOh93MnkSEMMx5_pDEiitoKl1BjZmI2eJfW5mmjvsBM_vPAmdqXIzZP-b8Apv7FD9z0q7fQWZ_UiDA8FoXZdIsnCtH1b3gbwmLnvpDF4-E4lXAMioSoaodDVIAOYJuWT1owBmVFm5Efu8-mFCxr4e9iZMYUY2405WDspggm8hJ5ICDpWbN7DrqTezTr0x-7gBe271jRSnR8cmEVYDfIlD2vGbNMqADHuVykhAidqcqC_mqNDKB-QOvzI7iIuXUiHA5vTSYv_fzQq6mayhi5eSRnYkOgeYWu0iy_9NvOlXvSoHLdrjJA22utrcecTWw4O-cQYX1s8MdU6xw";
axios.interceptors.request.use(function (axios_config) {
  axios_config.headers.Authorization = token;
  return axios_config;
});

let i = 0;

console.log("Connecting to " + ssi.HubUrl);

client.initStream({
  url: ssi.HubUrl,
  token: token,
});
client.bind(client.events.onData, function (message) {
  try {
    let parsedObject = JSON.parse(message);
    let parsedContent = JSON.parse(parsedObject.Content);
    if (parsedContent.Symbol) {
      console.log("Message " + i++ + " received: ");
      console.log(parsedContent);
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
});
client.bind(client.events.onConnected, function () {
  client.switchChannel("X-QUOTE:ALL");
});
client.start();
