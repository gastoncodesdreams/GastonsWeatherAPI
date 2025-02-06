
//FETCH AND DISPLAY DATA
async function getWeather() {
    const city = document.getElementById('city').value; //GRAB city name 

    if (!city) {    //EMPTY input consequence
        alert('Please enter a city');
        return;
    }

    //CREATE URL for the geocoding API, Convert city to lat and long
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

    try {
        //FETCH data from API
        const geocodingResponse = await fetch(geocodingUrl);
        const geocodingData = await geocodingResponse.json();

        //CHECK if geocoding API returned results
        if (!geocodingData.results || geocodingData.results.length === 0) {
            alert('City not found. Please try again.');
            return;
        }

        //EXTRACT lat and long from geocoding data
        const { latitude, longitude } = geocodingData.results[0];

        //CREATE URL for the weather API using the lat and long
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,windspeed_10m&timezone=auto`;
        //FETCH weather data from the API
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        //DISPLAY weather data
        displayWeather(weatherData);
    } catch (error) { //ERROR catch during fetch process
        console.error('Error fetching weather data:', error);
        alert('An error occurred while fetching weather data. Please try again.');
    }
}
//DISPLAY weather data
function displayWeather(weatherData) {
    //GRAB HTML elements where data will be displayed
    const tempDiv = document.getElementById('temp-div');
    const weatherInfo = document.getElementById('weather-info');
    const hourlyForecast = document.getElementById('hourly-forecast');

    //CLEAR previous data
    tempDiv.innerHTML = '';
    weatherInfo.innerHTML = '';
    hourlyForecast.innerHTML = '';

    //EXTRACT current weather data (from first entry in the hourly array)
    const currentTemp = weatherData.hourly.temperature_2m[0];
    const currentWeatherCode = weatherData.hourly.weathercode[0];
    const currentWindSpeed = weatherData.hourly.windspeed_10m[0];

    //DISPLAY current temperature
    tempDiv.innerHTML = `<p>${currentTemp}°C</p>`;

    //GET weather description based on weather code, and display
    const weatherDescription = getWeatherDescription(currentWeatherCode);
    weatherInfo.innerHTML = `<p>${weatherDescription}</p><p>Wind: ${currentWindSpeed} km/h</p>`;

    //PREPARE hourly forecast (next 24 hours)
    const hourlyData = weatherData.hourly.time.slice(0, 24).map((time, index) => ({
        time,
        temp: weatherData.hourly.temperature_2m[index],
        weatherCode: weatherData.hourly.weathercode[index],
    }));

    //LOOP through hourly data, create HTML elements to display each hour's forecast
    hourlyData.forEach((hour) => {
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <p>${new Date(hour.time).getHours()}:00</p>
            <p>${hour.temp}°C</p>
            <p>${getWeatherDescription(hour.weatherCode)}</p>
        `;
        hourlyForecast.appendChild(hourlyItem);
    });
}
//FUNCTION getWeatherDescription maps weather codes to weather descriptions
function getWeatherDescription(weatherCode) {
    const weatherDescriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };

    return weatherDescriptions[weatherCode] || 'Unknown weather';
}