const queryString = require("query-string");
const {
  renderAllCityCards,
  renderCityName,
  makeApiCall,
  addNewCityCard,
  removeCityFromLocalStorage,
  toggleTrashDivDisplay,
  changeDashToSpace,
} = require("./helper.js");

const currentPathArr = window.location.pathname.split("/");
const currentPath = currentPathArr[currentPathArr.length - 1];

// =========================== EVENT LISTENER =====================================

// triggers plus/search button click on 'enter'
document.addEventListener("keyup", function (event) {
  if (event.key === "Enter") document.querySelector("#add-city-btn").click();
});

// =========================== GLOBAL FUNCTIONS =====================================

// attached to click listener on each city card > redirects to city details page
global.renderCityPage = ({ id }) => {
  location.href = `./city.html?city=${id}`;
};

// on drag start - show the trash div, set data (to know which card to remove later on)
global.showTrashDiv = (e) => {
  toggleTrashDivDisplay();
  e.dataTransfer.setData("Text", e.currentTarget.id);
};

// on drag end - hide the trash div
global.hideTrashDiv = () => toggleTrashDivDisplay();

global.onTrashDragOver = (e) => e.preventDefault();

// on drag drop (into trash) - remove card dom, remove from local storage
global.onTrashDrop = (e) => {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("Text");
  document.querySelector(`#${cardId}`).closest(".card-col").remove();
  removeCityFromLocalStorage(cardId);
};

// attached to click listener on plus/search button
global.onButtonClick = () => {
  const inputDiv = document.querySelector("#input-div");
  const plusBtn = document.querySelector("#plus-btn");
  const searchBtn = document.querySelector("#search-btn");
  const inputField = document.querySelector("input");

  // if in search mode > add new card and reset value
  if (!inputDiv.classList.contains("d-none")) {
    addNewCityCard(document.querySelector("input").value);
    inputField.value = "";
  }

  inputDiv.classList.toggle("d-none");
  plusBtn.classList.toggle("d-none");
  searchBtn.classList.toggle("d-none");
  inputField.focus();
};

// ==================== FOR INDEX.HTML (MAIN PAGE) ==============================

if (!currentPath || currentPath === "index.html") {
  renderAllCityCards();
}

// ==================== FOR CITY.HTML (DETAILS PAGE) ==============================

if (currentPath === "city.html") {
  const { city } = queryString.parse(location.search); // get current city (from query)
  renderCityName(changeDashToSpace(city));
  makeApiCall({ city: changeDashToSpace(city), isDetailView: true });
}
