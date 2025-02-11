//GLOBAL VAR
let currentCity = ""; //store current city for nav clicks

//GETWEATHER FUNCTION--fetches city name from input field, gets lat and long
function getWeather() {
  const city = document.getElementById("city").value; //GRAB city name
  currentCity = city; //update the global var with users city
  //console.log("city: ", city);

  if (!city) {
    //EMPTY input consequence
    alert("Please enter a city.");
    return;
  }

  //CREATE URL for geocoding API to convert into lat and long
  const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

  //FETCH geocoding data
  fetch(apiUrl)
    .then((response) => response.json()) //converted response to JSON
    .then((geocodingData) => {
      //CHECK if geocoding API returned results
      if (!geocodingData.results || geocodingData.results.length === 0) {
        alert("Error: city not found.");
        return;
      }

      //GRAB lat and long from geocoding data
      const {latitude, longitude} = geocodingData.results[0];
      //console.log("lat,long ", geocodingData.results[0]);

      //FETCH temperature data 
      fetchTemperature(latitude, longitude);
    })
    .catch((error) => { //ERROR catch fetch data
      console.error("Error fetching data:", error);
      alert(
        "An error occurred fetching data."
      );
    });
}

//FETCH TEMPERATURE DATA, create URL for temp api using lat and long
function fetchTemperature(latitude, longitude) {
  const temperatureUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto`;

  fetch(temperatureUrl)
    .then((response) => response.json()) //convert response to JSON
    .then((temperatureData) => {
      displayTemperature(temperatureData);
    })
    .catch((error) => {
      console.error("Error fetching temperature data:", error);
      alert(
        "Error: fetching temperature data. Please try again."
      );
    });
}

//FETCH WEATHER CONDITIONS DATA
function fetchConditions(latitude, longitude) {
  const conditionsUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=weathercode&timezone=auto`;

  fetch(conditionsUrl)
    .then((response) => response.json()) //convert response to JSON
    .then((conditionsData) => {
      displayConditions(conditionsData);
    })
    .catch((error) => {
      console.error("Error fetching conditions data:", error);
      alert(
        "Error: fetching conditions data. Please try again."
      );
    });
}

//DISPLAY TEMPERATURE DATA in html elmnts
function displayTemperature(temperatureData) {
  const tempDiv = document.getElementById("temp-div");
  const weatherInfo = document.getElementById("weather-info");

  //CLEAR previous data
  tempDiv.innerHTML = "";
  weatherInfo.innerHTML = "";

  //EXTRACT current temperature, convert to F
  const currentTemp = temperatureData.hourly.temperature_2m[0] * 1.8 + 32;
  tempDiv.innerHTML = `<p>${currentTemp.toFixed(1)}°F</p>`; // Display temperature with 1 decimal place
}

//DISPLAY WEATHER CONDITIONS DATA in html elmts
function displayConditions(conditionsData) {
  const weatherInfo = document.getElementById("weather-info");

  //CLEAR previous data
  weatherInfo.innerHTML = "";

  //EXTRACT current weather condition
  const currentWeatherCode = conditionsData.hourly.weathercode[0];
  const weatherDescription = getWeatherDescription(currentWeatherCode);
  weatherInfo.innerHTML = `<p>${weatherDescription}</p>`;
}

//FUNCTION getWeatherDescription maps weather codes to weather descriptions
function getWeatherDescription(weatherCode){
  const weatherDescriptions ={
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };

  return weatherDescriptions[weatherCode];
}

//NAVIGATION CLICK HANDLERS
document.getElementById("nav-temperature").addEventListener("click", () => {
  if (!currentCity) {
    alert("Enter a city.");
    return;
  }
  getWeather(); //Fetch temperature data
});

document.getElementById("nav-conditions").addEventListener("click", () => {
  if (!currentCity) {
    alert("Enter a city.");
    return;
  }

 //CREATE URL for the geocoding API, Convert city to lat and long
 const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${currentCity}&count=1&language=en&format=json`;

 //FETCH geocoding data
 fetch(geocodingUrl)
   .then((response) => response.json())
   .then((geocodingData) => {
     //CHECK if geocoding API returned results
     if (!geocodingData.results || geocodingData.results.length === 0) {
       alert("City not found. Please try again.");
       return;
     }

     //EXTRACT lat and long from geocoding data
     const {latitude, longitude} = geocodingData.results[0];

     //FETCH conditions data
     fetchConditions(latitude, longitude);
   })
   .catch((error) => {
     //geocoding data error catch
     console.error("Error fetching geocoding data:", error);
     alert("An error occurred. Please try again.");
   });
});
