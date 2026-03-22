const axios = require("axios");

const API_BASE = "https://flux-api-ariyan.vercel.app";

module.exports = {
  config: {
    name: "flux",
    aliases: ["fx"],
    version: "1.0",
    author: "Ariyan",
    role: 0,
    category: "image",
    guide: {
      en: "{pn} a cute anime cat"
    }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      return message.reply("Example: -flux a cute anime cat");
    }

    let waitMsg;

    try {
      waitMsg = await message.reply("Generating image... Please wait");

      const res = await axios.get(
        `${API_BASE}/generate?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 120000 }
      );

      if (!res.data?.status || !res.data?.image) {
        throw new Error("Invalid API response");
      }

      if (waitMsg?.messageID) {
        await message.unsend(waitMsg.messageID);
      }

      return message.reply({
        body: `Flux Image Generated\n\nPrompt: ${prompt}`,
        attachment: await global.utils.getStreamFromURL(res.data.image)
      });

    } catch (err) {
      if (waitMsg?.messageID) {
        await message.unsend(waitMsg.messageID);
      }

      return message.reply(
        "Image generation failed. Try again in a few seconds."
      );
    }
  }
};