module.exports = {
  config: {
    name: "ping2",
    version: "1.0.0",
    author: "Replit Agent",
    countDown: 5,
    role: 0,
    shortDescription: "Simple ping command",
    longDescription: "A simple ping command to check bot latency.",
    category: "Utility",
    guide: {
      en: "{p}ping2"
    }
  },

  onStart: async function ({ message }) {
    const timeStart = Date.now();
    const sent = await message.reply("Ping...");
    const ms = Date.now() - timeStart;
    await sent.edit(`🟢 Ping\n⚡ ${ms}ms`);
  }
};