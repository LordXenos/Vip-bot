const axios = require("axios");

module.exports = {
  config: {
    name: "covid",
    aliases: ["corona", "covid19"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "info",
    shortDescription: {
      en: "Get COVID-19 statistics",
    },
    guide: {
      en: "{pn} [country]\nExample: {pn} Bangladesh\nLeave empty for worldwide stats",
    },
  },

  onStart: async function ({ args, api, event }) {
    try {
      const msg = await api.sendMessage(
        "⭐ Fetching COVID-19 statistics...",
        event.threadID
      );

      let apiUrl = "https://disease.sh/v3/covid-19/all";
      let isGlobal = true;

      if (args.length > 0) {
        const country = args.join(" ");
        apiUrl = `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}`;
        isGlobal = false;
      }

      const response = await axios.get(apiUrl);
      const data = response.data;

      let result = `⭐ COVID-19 STATISTICS ⭐\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      if (isGlobal) {
        result += `֎ Worldwide Data\n`;
      } else {
        result += `֎ ${data.country}\n`;
        if (data.countryInfo && data.countryInfo.iso2) {
          result += `֎ Flag: ${data.countryInfo.iso2}\n`;
        }
      }

      result += `֎ Updated: ${new Date(data.updated).toLocaleString()}\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      result += `❍ TOTAL STATISTICS:\n`;
      result += `❍ Cases: ${data.cases.toLocaleString()}\n`;
      result += `❍ Deaths: ${data.deaths.toLocaleString()}\n`;
      result += `❍ Recovered: ${data.recovered.toLocaleString()}\n`;
      result += `❍ Active: ${data.active.toLocaleString()}\n`;
      result += `❍ Critical: ${data.critical.toLocaleString()}\n\n`;

      result += `❍ TODAY:\n`;
      result += `❍ Cases: ${data.todayCases.toLocaleString()}\n`;
      result += `❍ Deaths: ${data.todayDeaths.toLocaleString()}\n`;
      result += `❍ Recovered: ${data.todayRecovered.toLocaleString()}\n\n`;

      result += `❍ VACCINATION:\n`;
      result += `❍ Tests: ${data.tests.toLocaleString()}\n`;
      result += `❍ Population: ${data.population.toLocaleString()}\n\n`;

      result += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      result += `⚠ Stay safe and follow health guidelines!`;

      await api.editMessage(result, msg.messageID);

    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 404) {
        return api.editMessage(
          "✘ Country not found! Please check the spelling and try again.",
          msg.messageID
        );
      }
      return api.editMessage(
        "✘ Failed to fetch COVID-19 data! Please try again later.",
        msg.messageID
      );
    }
  },
};