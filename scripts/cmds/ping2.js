module.exports = {
  config: {
    name: "ping2",
    version: "1.0.0",
    author: "Replit Agent",
    countDown: 5,
    role: 0,
    shortDescription: "Check user ping",
    longDescription: "A command to check the latency between the user's message and the bot's response.",
    category: "system",
    guide: {
      en: "{p}ping2"
    }
  },

  onStart: async function ({ message, api, event }) {
    // user message timestamp
    const userTime = event.timestamp;

    // bot reply করার সময়
    const now = Date.now();

    const userPing = now - userTime;

    const sent = await message.reply("⏳ Checking user ping...");

    await api.editMessage(
      `🟢 User Ping\n𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐓𝐢𝐦𝐞:⚡ ${userPing}ms`,
      sent.messageID
    );
  }
};
