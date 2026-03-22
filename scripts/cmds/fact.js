const axios = require("axios");

module.exports = {
  config: {
    name: "fact",
    aliases: ["facts", "randomfact"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Get random interesting facts",
    },
    guide: {
      en: "{pn}\nGet a random fact!",
    },
  },

  onStart: async function ({ api, event, message }) {
    try {
      const msg = await api.sendMessage(
        `⭐ Searching a random fact...`,
        event.threadID
      );

      const apiUrl = "https://uselessfacts.jsph.pl/random.json?language=en";
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.text) {
        message.unsend(msg.messageID);
        return api.sendMessage(
          `✘ Failed to fetch fact!`,
          event.threadID,
          event.messageID
        );
      }

      let result = `⭐ RANDOM FACT ⭐\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      result += `${data.text}\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      result += `❍ Source: ${data.source || 'Unknown'}\n`;
      result += `❍ ID: ${data.id}`;

      message.unsend(msg.messageID);

      await api.sendMessage(
        result,
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "✘ Failed to fetch fact! Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};