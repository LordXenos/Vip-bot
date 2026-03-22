const axios = require("axios");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p"],
    version: "3.0",
    author: "Ariyan",
    countDown: 5,
    role: 0,
    category: "ai",
    shortDescription: "Generate detailed visual prompt",
    longDescription: "Generate highly detailed prompt from text or replied image",
    guide: "{pn} [text] or reply to image"
  },

  onStart: async function ({ message, event, args }) {
    try {
      let imgUrl;
      let userPrompt;

      if (event.messageReply?.attachments?.[0]?.type === "photo") {
        imgUrl = event.messageReply.attachments[0].url;
      } else if (args.length > 0) {
        userPrompt = args.join(" ");
      }

      if (!imgUrl && !userPrompt) {
        return message.reply("⚠ Provide a text prompt or reply to an image.");
      }

      message.reaction("⏳", event.messageID);

      let apiUrl;

      if (imgUrl) {
        apiUrl = `https://salmon-latest-produces-exists.trycloudflare.com/api/prompt?img=${encodeURIComponent(imgUrl)}`;
      } else {
        apiUrl = `https://salmon-latest-produces-exists.trycloudflare.com/api/prompt?prompt=${encodeURIComponent(userPrompt)}`;
      }

      const res = await axios.get(apiUrl, { timeout: 90000 });

      if (!res.data || !res.data.status) {
        message.reaction("❌", event.messageID);
        return message.reply("❌ API Error: " + (res.data?.error || "Unknown error"));
      }

      message.reaction("✅", event.messageID);

      return message.reply(res.data.prompt);

    } catch (err) {
      message.reaction("❌", event.messageID);
      return message.reply("❌ Failed: " + err.message);
    }
  }
};