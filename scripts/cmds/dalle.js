const axios = require("axios");
const { createReadStream } = require("fs");
const { writeFile } = require("fs/promises");
const path = require("path");

module.exports = {
  config: {
    name: "dalle",
    aliases: ['imagine'],
    version: "1.0.0",
    prefix: false,
    author: "Rasin",
    countDown: 10,
    role: 2,
    description: "Gen Image Using DALL-E 3",
    category: "image generation",
    guide: {
      en: "   {pn}dalle [prompt]"
    },
  },

  onStart: async function ({ event, args, message, api }) {
    const rasinAPI = "https://rasin-apis.onrender.com/api/rasin/dalle";
    const prompt = args.join(" ");

    if (!prompt) return message.reply("Please provide a prompt!");

    try {
      const startTime = Date.now();
      const waitMessage = await message.reply("𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞...");
      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const apiUrl = `${rasinAPI}?prompt=${encodeURIComponent(prompt)}&apikey=rs_646sp6jj-vawq-1w25-rflw-z8`;
      const res = await axios.get(apiUrl);

      const dalleImages = res.data?.dalle;

      if (!dalleImages || dalleImages.length === 0) {
        return message.reply("No images returned!");
      }

      const imageBuffers = [];

      for (let i = 0; i < dalleImages.length; i++) {
        const imgRes = await axios.get(dalleImages[i].url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(imgRes.data, "binary");
        const filePath = path.join(__dirname, `/tmp/dalle_img_${i}.png`);
        await writeFile(filePath, buffer);
        imageBuffers.push(createReadStream(filePath));
      }

      const time = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      message.unsend(waitMessage.messageID);

      message.reply({
        body: `✅ 𝐇𝐞𝐫𝐞 𝐚𝐫𝐞 𝐲𝐨𝐮𝐫 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐢𝐦𝐚𝐠𝐞𝐬 (${time}s)`,
        attachment: imageBuffers
      });

    } catch (e) {
      console.error(e);
      message.reply(`❌ Error: ${e.message || "Something went wrong!"}`);
    }
  }
};