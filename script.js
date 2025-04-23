const apiKey = "367459dba669f6e9a1a71ebc21a4310a";
const weatherContainer = document.getElementById("weather-container");
const cityInput = document.getElementById("city");
const tempDiv = document.getElementById("temp-div");
const weatherInfo = document.getElementById("weather-info");
const hourlyForecastDiv = document.getElementById("hourly-forecast");
const fiveDayForecastDiv = document.getElementById("five-day-forecast");
const weatherIcon = document.getElementById("weather-icon");

// Custom icon mapping
const iconMap = {
    atmosphere: "images/atmosphere.svg",
    clear: "images/clear.svg",
    clouds: "images/clouds.svg",
    drizzle: "images/drizzle.svg",
    rain: "images/rain.svg",
    snow: "images/snow.svg",
    thunderstorm: "images/thunderstorm.svg",
};

function getWeatherByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            getHourlyForecast(lat, lon);
            getFiveDayForecast(lat, lon);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Could not retrieve weather data. Please try again.");
        });
}

function getWeather() {
    const city = cityInput.value;
    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayCurrentWeather(data);

                const historyItem = {
                    city: city,
                    temperature: data.main.temp,
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    date: new Date().toLocaleString(),
                };

                let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
                searchHistory.push(historyItem);
                localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Could not retrieve weather data. Please try again.");
        });
}

function displayCurrentWeather(data) {
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const condition = data.weather[0].main.toLowerCase();
    const iconPath = iconMap[condition] || "icons/default.svg";

    tempDiv.innerHTML = `<h3>${temperature}°C</h3>`;
    weatherInfo.innerHTML = `<p>${description}</p>`;
    weatherIcon.src = iconPath;

    const timezoneOffset = data.timezone;
    const localTime = new Date(Date.now() + timezoneOffset * 1000).toLocaleString([], { timeZone: "UTC", timeZoneName: "short" });
    document.getElementById("local-time").innerHTML = `<p>Local Time: ${localTime}</p>`;
}

function getHourlyForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list.slice(0, 8));
        })
        .catch(error => {
            console.error("Error fetching hourly forecast:", error);
        });
}

function displayHourlyForecast(hourlyData) {
    hourlyForecastDiv.innerHTML = "";
    hourlyData.forEach(hour => {
        const time = new Date(hour.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = hour.main.temp;
        const condition = hour.weather[0].main.toLowerCase();
        const iconPath = iconMap[condition] || "icons/default.svg";

        hourlyForecastDiv.innerHTML += `
            <div>
                <p>${time} - ${temp}°C</p>
                <img src="${iconPath}" alt="weather icon">
            </div>`;
    });
}

function getFiveDayForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const dailyData = filterFiveDayForecast(data.list);
            displayFiveDayForecast(dailyData);
        })
        .catch(error => {
            console.error("Error fetching 5-day forecast:", error);
        });
}

function filterFiveDayForecast(forecastData) {
    return forecastData.filter(forecast => forecast.dt_txt.includes("12:00:00"));
}

function displayFiveDayForecast(dailyData) {
    fiveDayForecastDiv.innerHTML = "";
    dailyData.forEach(day => {
        const date = new Date(day.dt_txt).toDateString();
        const temp = day.main.temp;
        const condition = day.weather[0].main.toLowerCase();
        const iconPath = iconMap[condition] || "icons/default.svg";

        fiveDayForecastDiv.innerHTML += `
            <div>
                <p>${date} - ${temp}°C</p>
                <img src="${iconPath}" alt="weather icon">
            </div>`;
    });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoordinates(lat, lon);
        }, () => {
            alert("Geolocation is not supported or permission denied. Please enter a city manually.");
        });
    } else {
        alert("Geolocation is not supported by this browser. Please enter a city manually.");
    }
}

window.onload = function () {
    getLocation();
};

document.getElementById("city").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getWeather();
    }
});
