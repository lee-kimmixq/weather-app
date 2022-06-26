const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config(); // to use process.env variables (npm library)

// ================ FUNCTIONS THAT RETURN HTML ELEMENTS ==========================

const genEmptyCityCardHtml = () =>
  `<div class="col-md-6 col-lg-4 col-xl-3 card-col">
    <div class="glass-card city-card" onclick="renderCityPage(event.currentTarget)" draggable="true" onDragStart="showTrashDiv(event)" onDragEnd="hideTrashDiv()">
      <div class="loader-small"></div>
      <div class="row">
        <div class="col">
          <h2 class="cityName"></h2>
          <p class="time"></p>
        </div>
        <div class="col col-auto">
          <p class="currentTemp"></p>
        </div>
      </div>
      <div class="row">
        <div class="col-5">
          <p class="details condition"></p>
        </div>
        <div class="col">
          <p class="details maxTemp"></p>
        </div>
        <div class="col">
          <p class="details minTemp"></p>
        </div>
      </div>
    </div>
  </div>`;

// =================== FUNCTIONS THAT MANIPULATE DOM ================================

const renderEmptyCityCard = () => {
  const cityCardsContainer = document.querySelector("#cities-container");
  cityCardsContainer.innerHTML += genEmptyCityCardHtml();
};

const renderCityCardDetails = (idx, data) => {
  const cityCard = document.querySelectorAll(".city-card")[idx];

  const cityCardDetails = {
    cityName: data.location.name,
    time: data.location.localtime.split(" ")[1],
    currentTemp: `${roundToInteger(data.current.temp_c)}°`,
    condition: data.forecast.forecastday[0].day.condition.text,
    maxTemp: `Max. ${roundToInteger(
      data.forecast.forecastday[0].day.maxtemp_c
    )}°`,
    minTemp: `Min. ${roundToInteger(
      data.forecast.forecastday[0].day.mintemp_c
    )}°`,
  };

  for (const detail in cityCardDetails) {
    cityCard.querySelector(`.${detail}`).innerHTML = cityCardDetails[detail];
  }
  cityCard.id = changeSpaceToDash(data.location.name); // add id - for remove/render city.html
  cityCard.querySelector(".loader-small").classList.add("d-none"); // remove loader
};

// runs once whenever index.html is loaded
const renderAllCityCards = () => {
  const cityCardsContainer = document.querySelector("#cities-container");
  cityCardsContainer.innerHTML = "";
  const cities = getCitiesFromLocalStorage(); // retrieve local storage
  cities.forEach((city, idx) => {
    renderEmptyCityCard();
    makeApiCall({ city, idx });
  });
};

// for single view - runs once when city.html is loaded
const renderCityName = (city) => {
  document.title = `Mr. Weather - ${city}`;
  document.querySelector(".main-title").innerText = city;
};

// for single view - runs once when city.html is loaded
const renderCityDetails = (data) => {
  const cityDetails = {
    cityDate: formatDate(data.location.localtime),
    weatherIcon: `<img src="https:${data.current.condition.icon}" />`,
    cityTemp: `${roundToInteger(data.current.temp_c)}°`,
    cityCondition: data.current.condition.text,
    minCityTemp: `${roundToInteger(
      data.forecast.forecastday[0].day.mintemp_c
    )}° <br/> Min`,
    maxCityTemp: `${roundToInteger(
      data.forecast.forecastday[0].day.maxtemp_c
    )}° <br/> Max`,
    uvIndicator: `${data.current.uv} <br/> ${getUvIndex(data.current.uv)} 
    <br/> <p class="short-lh"><span class="small-text">${getUvIndex(
      data.current.uv
    )} level during all the day.</span></p>`,
    feelsLike: `${roundToInteger(data.current.feelslike_c)}°`,
    pressure: `${data.current.pressure_mb} hPa`,
  };

  for (const detail in cityDetails) {
    document.querySelector(`.${detail}`).innerHTML = cityDetails[detail];
  }
};

const toggleTrashDivDisplay = () => {
  const trashDiv = document.querySelector(".trash");
  trashDiv.classList.toggle("d-none");
  trashDiv.classList.toggle("d-flex");
};

// ================= FUNCTIONS THAT MANIPULATE LOCAL STORAGE =====================

const addCityToLocalStorage = (cityName) => {
  let weatherData = getCitiesFromLocalStorage() || [];
  localStorage.setItem(
    "weatherData",
    JSON.stringify([...weatherData, cityName])
  );
};

const removeCityFromLocalStorage = (cityToRemove) => {
  let weatherData = getCitiesFromLocalStorage() || [];
  localStorage.setItem(
    "weatherData",
    JSON.stringify(
      weatherData.filter((city) => city !== changeDashToSpace(cityToRemove))
    )
  );
};

const getCitiesFromLocalStorage = () =>
  JSON.parse(localStorage.getItem("weatherData")) || [];

// ========================= OTHER HELPERS ========================================

const formatDate = (localtime) =>
  new Date(localtime.split(" ")[0]).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const roundToInteger = (dec) => Math.round(Number(dec));
const changeSpaceToDash = (str) => str.replaceAll(" ", "-");
const changeDashToSpace = (str) => str.replaceAll("-", " ");

const getUvIndex = (uv) => {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
};

const makeApiCall = ({ city, isNew, idx, isDetailView }) => {
  axios
    .get(
      `https://api.weatherapi.com/v1/forecast.json?key=${process.env.API_KEY}&q=${city}&aqi=no`
    )
    .then(({ data }) => {
      const cities = getCitiesFromLocalStorage();
      // for single page view
      if (isDetailView) {
        renderCityDetails(data);
        return;
      }
      // block duplicates
      if (isNew && cities.includes(data.location.name))
        throw new Error("duplicate input");
      // add to local storage if new
      if (isNew) {
        addCityToLocalStorage(data.location.name);
        idx = cities.length;
      }
      renderCityCardDetails(idx, data);
    })
    .catch((err) => {
      console.log(err);
      const cards = document.querySelectorAll(".city-card");
      cards[cards.length - 1].closest(".card-col").remove();
    });
};

const addNewCityCard = (cityName) => {
  if (!cityName) return;
  renderEmptyCityCard();
  makeApiCall({ city: cityName, isNew: true });
};

module.exports = {
  renderAllCityCards,
  renderCityName,
  makeApiCall,
  addNewCityCard,
  removeCityFromLocalStorage,
  toggleTrashDivDisplay,
  changeDashToSpace,
};
