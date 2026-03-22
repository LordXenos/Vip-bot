const axios = require("axios");

module.exports = {
  config: {
    name: "flux",
    version: "1.0.0",
    prefix: false,
    author: "Rasin",
    countDown: 5,
    role: 0,
    description: "Flux",
    category: "image generation",
    guide: {
      en: "   {pn}flux [prompt]"
    },
  },

  onStart: async function ({ event, args, message, api }) {
    const rasinAPI = "https://rasin-apis.onrender.com/api/rasin/flux";

    try {
      const prompt = args.join(" ");
      if (!prompt) {
        return message.reply("Please provide a prompt!");
      }

      const startTime = Date.now();
      const waitMessage = await message.reply("𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞...");
      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const apiurl = `${rasinAPI}?prompt=${encodeURIComponent(prompt)}&apikey=rs_3gb6nkf4-hzxd-8phe-904z-i1`;
      const response = await axios.get(apiurl, { responseType: "stream" });

      const time = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      message.unsend(waitMessage.messageID);

      message.reply({
        body: `✅ 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐢𝐦𝐚𝐠𝐞`,
        attachment: response.data,
      });
    } catch (e) {
      console.error(e);
      message.reply(`Error: ${e.message || "Failed to generate image. Please try again later."}`);
    }
  }
};