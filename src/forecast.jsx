import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faCloud,
  faCloudSun,
  faCloudShowersHeavy,
  faCloudRain,
  faSnowflake,
  faBolt,
  faSmog,
  faCloudMoonRain,
} from "@fortawesome/free-solid-svg-icons";

const WeatherNow = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bgClass, setBgClass] = useState(
    "bg-gradient-to-br from-blue-400 to-blue-600"
  );
  const getWeatherIcon = (skyCondition) => {
    switch (skyCondition) {
      case "Clear Sky":
        return faSun;
      case "Partly Cloudy":
        return faCloudSun;
      case "Foggy":
        return faSmog;
      case "Drizzle":
      case "Rainy":
        return faCloudRain;
      case "Rain Showers":
        return faCloudShowersHeavy;
      case "Snowy":
      case "Snow Showers":
        return faSnowflake;
      case "Thunderstorm":
        return faBolt;
      default:
        return faCloud;
    }
  };

  const getSkyCondition = (code) => {
    if (code === 0) return "Clear Sky";
    if (code === 1 || code === 2 || code === 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 85 && code <= 86) return "Snow Showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Overcast";
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude } = geoData.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m`
      );
      const weatherData = await weatherResponse.json();

      const weathercode = weatherData.current_weather.weathercode;
      const skyCondition = getSkyCondition(weathercode);

      setWeather({
        temperature: weatherData.current_weather.temperature,
        windspeed: weatherData.current_weather.windspeed,
        humidity: weatherData.hourly.relativehumidity_2m[0],
        precipitation: weatherData.hourly.precipitation_probability[0],
        weathercode,
        skyCondition,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weather) {
      const code = weather.weathercode;
      if (code === 0) {
        setBgClass("bg-clear-sky");
      } else if (code >= 1 && code <= 3) {
        setBgClass("bg-partly-cloudy");
      } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        setBgClass("bg-rainy");
      } else if (code >= 71 && code <= 77) {
        setBgClass("bg-snowy");
      } else if (code >= 95 && code <= 99) {
        setBgClass("bg-thunderstorm");
      } else {
        setBgClass("bg-overcast");
      }
    }
  }, [weather]);

  return (
    <div className={`container ${bgClass} transition-all duration-1000`}>
      <div className="weather-card animate__animated animate__fadeIn">
        <h1 className="title text-4xl font-bold mb-4">Weather Now</h1>
        <div className="input-container flex items-center mb-6">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input bg-white rounded-l-md py-2 px-4 flex-1 focus:outline-none"
          />
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="search-button bg-blue-500 hover:bg-blue-600 text-white rounded-r-md py-2 px-4 transition-colors duration-300"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="error-message bg-red-500 text-white px-4 py-2 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        {weather && (
          <div className="weather-info animate__animated animate__fadeIn">
            <h2 className="text-2xl font-bold mb-2">{city}</h2>
            <div className="temperature flex items-center justify-center text-6xl font-bold mb-6">
              <FontAwesomeIcon
                icon={getWeatherIcon(weather.skyCondition)}
                className="text-yellow-400 mr-4"
              />
              {weather.temperature}°C
            </div>
            {/* Center the sky condition */}
            <div className="sky-condition text-xl font-semibold mb-4 py-4 bg-white/20 rounded-md text-center">
              {weather.skyCondition}
            </div>
            <div className="details flex flex-col md:flex-row justify-between text-lg">
              <span>Wind: {weather.windspeed} km/h</span>
              <span>Humidity: {weather.humidity}%</span>
              <span>Precipitation: {weather.precipitation}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherNow;
