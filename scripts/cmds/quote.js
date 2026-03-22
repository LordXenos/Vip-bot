const axios = require("axios");

module.exports = {
  config: {
    name: "quote",
    aliases: ["quotes", "inspire"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Get random inspirational quotes",
    },
    guide: {
      en: "{pn}\nGet a random inspirational quote!",
    },
  },

  onStart: async function ({ api, event, message }) {
    try {
      const msg = await api.sendMessage(
        `⭐ Searching a random quote...`,
        event.threadID
      );

      const apiUrl = "https://api.quotable.io/random";
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.content) {
        message.unsend(msg.messageID);
        return api.sendMessage(
          `✘ Failed to fetch quote!`,
          event.threadID,
          event.messageID
        );
      }

      let result = `⭐ INSPIRATIONAL QUOTE ⭐\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      result += `"${data.content}"\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      result += `❍ Author: ${data.author}\n`;
      
      if (data.tags && data.tags.length > 0) {
        result += `❍ Tags: ${data.tags.join(", ")}\n`;
      }

      message.unsend(msg.messageID);

      await api.sendMessage(
        result,
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "✘ Failed to fetch quote! Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};