const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cat2",
    aliases: ["kitty", "meow"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Get random cat images",
    },
    guide: {
      en: "{pn}\nGet a random cat picture!",
    },
  },

  onStart: async function ({ api, event, message }) {
    try {
      const msg = await api.sendMessage(
        `⭐ Searching a random cat...`,
        event.threadID
      );

      const apiUrl = "https://api.thecatapi.com/v1/images/search";
      const response = await axios.get(apiUrl);
      const data = response.data[0];

      if (!data || !data.url) {
        message.unsend(msg.messageID);
        return api.sendMessage(
          `✘ Failed to fetch cat image!`,
          event.threadID,
          event.messageID
        );
      }

      // Download cat image
      const imagePath = path.join(__dirname, "cache", `cat_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(imagePath);
      
      const imageResponse = await axios({
        url: data.url,
        method: 'GET',
        responseType: 'stream'
      });

      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      message.unsend(msg.messageID);

      let result = `⭐ RANDOM CAT ⭐\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      result += `❍ Here's your random cat! 🐱\n`;
      
      if (data.breeds && data.breeds.length > 0) {
        result += `❍ Breed: ${data.breeds[0].name}\n`;
      }

      await api.sendMessage(
        {
          body: result,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID,
        event.messageID
      );

      fs.unlinkSync(imagePath);

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "✘ Failed to fetch cat image! Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
