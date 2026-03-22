const axios = require("axios");

module.exports = {
  config: {
    name: "joke",
    aliases: ["j", "funny"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Get random jokes from various categories",
    },
    guide: {
      en: "{pn} [category]\nCategories: programming, misc, dark, pun, spooky, christmas\nExample: {pn} programming",
    },
  },

  onStart: async function ({ args, api, event, message }) {
    try {
      let category = "Any";
      const validCategories = ["programming", "misc", "dark", "pun", "spooky", "christmas"];
      
      if (args.length > 0) {
        const inputCategory = args[0].toLowerCase();
        if (validCategories.includes(inputCategory)) {
          category = inputCategory.charAt(0).toUpperCase() + inputCategory.slice(1);
        }
      }

      const msg = await api.sendMessage(
        `⭐ Finding a joke...`,
        event.threadID
      );

      const apiUrl = `https://v2.jokeapi.dev/joke/${category}?blacklistFlags=nsfw,religious,political,racist,sexist,explicit`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.error) {
        message.unsend(msg.messageID);
        return api.sendMessage(
          `✘ Failed to fetch joke!\n${data.message || 'Unknown error'}`,
          event.threadID,
          event.messageID
        );
      }

      let result = `⭐ JOKE TIME ⭐\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      if (data.type === "single") {
        result += `${data.joke}\n\n`;
      } else {
        result += `${data.setup}\n\n`;
        result += `➜ ${data.delivery}\n\n`;
      }

      result += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      result += `❍ Category: ${data.category}\n`;
      result += `❍ ID: #${data.id}`;

      message.unsend(msg.messageID);

      await api.sendMessage(
        result,
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "✘ Failed to fetch joke! Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};