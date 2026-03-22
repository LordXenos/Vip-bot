const axios = require('axios');

module.exports = {
  config: {
    name: "p",
    aliases: ["prompt"],
    version: "1.3",
    author: "Rasin",
    countDown: 5,
    role: 0,
    longDescription: {
      vi: "",
      en: "Get prompts"
    },
    category: "image"
  },
  onStart: async function ({ message, event, args }) {
    try {
      const promptText = args.join(" ").trim();
      let imageUrl;
      let response;

      if (event.type === "message_reply") {
        const attach = event.messageReply.attachments?.[0];
        if (attach && ["photo", "sticker"].includes(attach.type)) {
          imageUrl = attach.url;
        } else {
          return message.reply("Reply must be an image");
        }
      } 
      else if (args[0]?.match(/https?:\/\/.*\.(?:png|jpg|jpeg|webp)/i)) {
        imageUrl = args[0];
      } 
      else if (!promptText) {
        return message.reply("Reply to an image");
      }

      if (imageUrl) {
        response = await axios.get(`https://arshi-prompt-api.vercel.app/api/prompt?url=${encodeURIComponent(imageUrl)}`);
        const description = response.data.prompt;
        return message.reply(description);
      }

    
    } catch (error) {
      console.error(error.response?.data || error.message);
      message.reply(`❌ | An error occurred: ${error.message}`);
    }
  }
};
