var keyDownEvent = new KeyboardEvent("keydown", {
  key: "ArrowLeft",
  keyCode: 37,
  code: "ArrowLeft",
  which: 37,
});

document.dispatchEvent(keyDownEvent);
const classNameSuffix = document
  .querySelector('div[data-name="legend"]')
  .className.split("-")[1]
  .split(" ")[0];

let meet = 0;

function monitorChange() {
  var conditionMet = checkCondition();

  if (conditionMet) {
    var keyUpEvent = new KeyboardEvent("keyup", {
      key: "ArrowLeft",
      keyCode: 37,
      code: "ArrowLeft",
      which: 37,
    });
    document.dispatchEvent(keyUpEvent);
    console.log(
      document.querySelectorAll(
        `div[data-name="legend-source-item"] .valueValue-${classNameSuffix}`
      )[17].innerText
    );
    console.log(
      document.querySelectorAll(
        `div[data-name="legend-series-item"] .valueValue-${classNameSuffix}`
      )[2].innerText
    );
  } else {
    requestAnimationFrame(monitorChange);
  }
}

function checkCondition() {
  let similarValue = document.querySelectorAll(
    `div[data-name="legend-source-item"] .valueValue-${classNameSuffix}`
  )[17].innerText;
  let highValue = document.querySelectorAll(
    `div[data-name="legend-series-item"] .valueValue-${classNameSuffix}`
  )[2].innerText;
  return similarValue == highValue;
}
monitorChange();
/*

var keyUpEvent = new KeyboardEvent("keyup", {
  key: "ArrowLeft",
  keyCode: 37,
  code: "ArrowLeft",
  which: 37,
});

const classNameSuffix = document
  .querySelector('div[data-name="legend"]')
  .className.split("-")[1]
  .split(" ")[0];
let similarData = document.querySelectorAll(
  `div[data-name="legend-source-item"] .valueValue-${classNameSuffix}`
)[17].innerText;
let lowData = document.querySelectorAll(
  `div[data-name="legend-series-item"] .valueValue-${classNameSuffix}`
)[4].innerText;

console.log(similarData);
console.log(lowData);
while (similarData != lowData) {
  similarData = document.querySelectorAll(
    `div[data-name="legend-source-item"] .valueValue-${classNameSuffix}`
  )[17].innerText;
  lowData = document.querySelectorAll(
    `div[data-name="legend-series-item"] .valueValue-${classNameSuffix}`
  )[4].innerText;

  console.log(similarData);
  console.log(lowData);
}
document.dispatchEvent(keyUpEvent);
*/
