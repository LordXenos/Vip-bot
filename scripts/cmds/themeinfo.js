const axios = require("axios");

module.exports = {
  config: {
    name: "themeinfo",
    version: "2.4.71",
    author: "Rasin",
    countDown: 3,
    role: 2,
    description: "Get current thread theme info with direct image",
    category: "owner",
    guide: {
      en: "{pn} - Get current thread theme info with image"
    }
  },

  onStart: async function({ message, api, event }) {
    try {
      const info = await api.getThreadInfo(event.threadID);
      const themeID = info?.threadTheme?.id;

      if (!themeID) return message.reply("❌ This thread has no custom theme set.");

      const theme = await api.getThreadTheme(themeID);

      let msg = `Theme Information:\n`;
      msg += `ID: ${theme.id}\n`;
      msg += `Name: ${theme.name}\n`;
      msg += `Description: ${theme.description}\n`;
      msg += `Colors: ${theme.colors.join(", ")}\n`;

      const attachments = [];

      if (theme.backgroundImage) {
        try {
          const response = await axios.get(theme.backgroundImage, { responseType: "stream" });
          attachments.push(response.data);
        } catch (err) {
          console.log("Failed to load background image:", err);
          msg += `Background Image: Failed to load\n`;
        }
      }

      if (attachments.length > 0) {
        return message.reply({ body: msg, attachment: attachments });
      } else {
        return message.reply(msg);
      }

    } catch (err) {
      console.error(err);
      return message.reply("❌ An error occurred: " + err.message);
    }
  }
};