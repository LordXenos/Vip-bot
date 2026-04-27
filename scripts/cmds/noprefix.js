const fs = require("fs-extra");

module.exports = {
  config: {
    name: "noprefix",
    aliases: ["np"],
    version: "1.0",
    author: "SIFAT",
    countDown: 5,
    role: 2,
    description: "Toggle no-prefix mode with Uptime display",
    category: "system",
    usage: "{pn} [on | off | admin on]"
  },

  onStart: async function ({ message, args }) {
    const { config } = global.GoatBot;
    const prefix = config.prefix || "!";
    const pathConfig = global.client.dirConfig;
    const line = "━━━━━━━━━━━━━━";

    // Uptime Calculation Logic
    const time = process.uptime();
    const days = Math.floor(time / (24 * 60 * 60));
    const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    const seconds = Math.floor(time % 60);
    const uptimeString = `${days > 0 ? days + "d " : ""}${hours}h ${minutes}m ${seconds}s`;

    const currentMode = config.noPrefix === "adminOnly" ? "ADMIN ONLY" : 
                        config.noPrefix === true ? "ON (EVERYONE)" : "OFF";

    // --- Status Dashboard ---
    if (!args[0] || args[0].toLowerCase() === "status") {
      return message.reply(
        `[ NO-PREFIX SYSTEM ]\n` +
        `${line}\n` +
        `● Mode: ${currentMode}\n` +
        `● Default Prefix: ${prefix}\n` +
        `${line}\n` +
        `Commands:\n` +
        `» np on (Enable for all)\n` +
        `» np admin on (Admins only)\n` +
        `» np off (Disable all)\n` +
        `${line}\n` +
        `Uptime: ${uptimeString}`
      );
    }

    // --- Logic Implementation ---
    const arg1 = args[0].toLowerCase();
    const arg2 = args[1] ? args[1].toLowerCase() : "";
    let target;

    if (arg1 === "admin" && arg2 === "on") target = "adminOnly";
    else if (arg1 === "on") target = true;
    else if (arg1 === "off") target = false;
    else return message.reply("❌ Invalid! Use: on, admin on, or off.");

    if (config.noPrefix === target) {
      return message.reply(`⚠️ Mode is already set to ${currentMode}`);
    }

    try {
      config.noPrefix = target;
      fs.writeFileSync(pathConfig, JSON.stringify(config, null, 2));

      const newMode = target === "adminOnly" ? "ADMIN ONLY" : 
                      target === true ? "ON (EVERYONE)" : "OFF";

      return message.reply(
        `[ CONFIG UPDATED ]\n` +
        `${line}\n` +
        `● New Mode: ${newMode}\n` +
        `${line}\n` 
      );
    } catch (err) {
      return message.reply(`❌ Error: ${err.message}`);
    }
  }
};
