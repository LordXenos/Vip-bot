const axios = require("axios");

module.exports = {
  config: {
    name: "weather",
    aliases: ["w", "clima"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "info",
    shortDescription: {
      en: "Get weather information for any city",
    },
    guide: {
      en: "{pn} <city>\nExample: {pn} Dhaka",
    },
  },

  onStart: async function ({ args, api, event, message }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          "Please provide a city name!",
          event.threadID,
          event.messageID
        );
      }

      const city = args.join(" ");

      const msg = await api.sendMessage(
        `⭐ Searching weather data for "${city}"...`,
        event.threadID
      );

      const apiUrl = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.current_condition || data.current_condition.length === 0) {
        message.unsend(msg.messageID);
        return api.sendMessage(
          `✘ City "${city}" not found!\nPlease check the spelling and try again.`,
          event.threadID,
          event.messageID
        );
      }

      const current = data.current_condition[0];
      const location = data.nearest_area[0];
      const weather = data.weather[0];

      let result = `⭐ WEATHER REPORT ⭐\n\n`;
      result += `֎ Location: ${location.areaName[0].value}, ${location.country[0].value}\n`;
      result += `֎ Region: ${location.region[0].value}\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      result += `❍ CURRENT CONDITIONS:\n`;
      result += `❍ Temperature: ${current.temp_C}°C / ${current.temp_F}°F\n`;
      result += `❍ Feels Like: ${current.FeelsLikeC}°C / ${current.FeelsLikeF}°F\n`;
      result += `❍ Condition: ${current.weatherDesc[0].value}\n`;
      result += `❍ Humidity: ${current.humidity}%\n`;
      result += `❍ Wind: ${current.windspeedKmph} km/h ${current.winddir16Point}\n`;
      result += `❍ Pressure: ${current.pressure} mb\n`;
      result += `❍ Visibility: ${current.visibility} km\n`;
      result += `❍ UV Index: ${current.uvIndex}\n\n`;

      result += `❍ TODAY'S FORECAST:\n`;
      result += `❍ Max Temp: ${weather.maxtempC}°C / ${weather.maxtempF}°F\n`;
      result += `❍ Min Temp: ${weather.mintempC}°C / ${weather.mintempF}°F\n`;
      result += `❍ Sunrise: ${weather.astronomy[0].sunrise}\n`;
      result += `❍ Sunset: ${weather.astronomy[0].sunset}\n\n`;

      result += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      result += `❍ Last Updated: ${current.observation_time}`;

      message.unsend(msg.messageID);

      await api.sendMessage(
        result,
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "✘ Failed to fetch weather data! Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};