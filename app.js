const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const statusMsg = document.getElementById('status-msg');

const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const tempVal = document.getElementById('temp-val');
const weatherDesc = document.getElementById('weather-desc');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const feelsLike = document.getElementById('feels-like');
const pressure = document.getElementById('pressure');
const weatherIcon = document.getElementById('weather-icon');

currentDate.textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
});

async function fetchWeatherByCity(city) {
    if (!city) return;
    statusMsg.textContent = "Fetching weather data...";
    
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            statusMsg.textContent = "City not found. Try another location.";
            return;
        }

        const loc = geoData.results[0];
        cityName.textContent = `${loc.name}, ${loc.country_code ? loc.country_code.toUpperCase() : ''}`;
        await getWeatherData(loc.latitude, loc.longitude);
        statusMsg.textContent = "";
    } catch (err) {
        statusMsg.textContent = "Unable to fetch weather. Please retry.";
    }
}

async function getWeatherData(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        const current = data.current;
        tempVal.textContent = Math.round(current.temperature_2m);
        feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;

        const code = current.weather_code;
        if (code === 0) {
            weatherDesc.textContent = "Clear Sky";
            weatherIcon.className = "fa-solid fa-sun weather-icon";
        } else if (code >= 1 && code <= 3) {
            weatherDesc.textContent = "Partly Cloudy";
            weatherIcon.className = "fa-solid fa-cloud-sun weather-icon";
        } else if (code >= 51 && code <= 67) {
            weatherDesc.textContent = "Rain Showers";
            weatherIcon.className = "fa-solid fa-cloud-rain weather-icon";
        } else if (code >= 95) {
            weatherDesc.textContent = "Thunderstorm";
            weatherIcon.className = "fa-solid fa-bolt weather-icon";
        } else {
            weatherDesc.textContent = "Overcast";
            weatherIcon.className = "fa-solid fa-cloud weather-icon";
        }
    } catch (err) {
        statusMsg.textContent = "Weather details could not be updated.";
    }
}

function detectLocation() {
    if (!navigator.geolocation) {
        statusMsg.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    statusMsg.textContent = "Accessing device location...";
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            cityName.textContent = "Current Location";
            await getWeatherData(latitude, longitude);
            statusMsg.textContent = "";
        },
        () => {
            statusMsg.textContent = "Location permission denied. Type city manually.";
        }
    );
}

searchBtn.addEventListener('click', () => fetchWeatherByCity(cityInput.value.trim()));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeatherByCity(cityInput.value.trim());
});
geoBtn.addEventListener('click', detectLocation);
