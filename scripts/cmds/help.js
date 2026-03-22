const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu"],
    version: "2.1",
    author: "Rasin",
    prefix: false,
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Displays a list of commands or details for a specific command"
    },
    longDescription: {
      en: "Provides a list of all available commands or detailed information about a specific command"
    },
    category: "info",
    guide: {
      en: "help [page_number | command_name]"
    }
  },
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const { commands, aliases } = global.GoatBot;
    const totalCommands = commands.size;
    
    if (args.length > 0 && isNaN(args[0])) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      
      if (!command) {
        return api.sendMessage(`❌ Command "${commandName}" not found.`, threadID, messageID);
      }
      
      const config = command.config;
      const guide = config.guide?.en || "No usage guide available.";
      const description = config.longDescription?.en || config.shortDescription?.en || config.longDescription || config.shortDescription || config.description || "No description available.";
      
      const response =
        "🌻✨ ⋆˚✿˖°────୨ᰔ୧────°˖✿˚⋆ 🌷🧸\n\n✦ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 ✦\n\n" +
        `❏ 𝐍𝐚𝐦𝐞: ${config.name}\n` +
        `❏ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${config.aliases?.join(", ") || "None"}\n` +
        `❏ 𝐏𝐫𝐞𝐟𝐢𝐱 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝: ${config.prefix}\n` +
        `❏ 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${description}\n` +
        `❏ 𝐔𝐬𝐚𝐠𝐞: ${guide}\n` +
        `❏ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${config.version || "1.0"}\n` +
        `❏ 𝐀𝐮𝐭𝐡𝐨𝐫: ${config.author || "Unknown"}♡🧸🎀\n` +
        `❏ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧: ${config.countDown || 0}s\n` +
        `❏ 𝐑𝐨𝐥𝐞: ${config.role || 0}\n\n🧸🎀 ⋆˚✿˖°────୨ᰔ୧────°˖✿˚⋆ ✨🌻`
      
      return api.sendMessage(response, threadID, messageID);
    }
    
    const categories = {};
    for (const [name, cmd] of commands) {
      if (!categories[cmd.config.category]) {
        categories[cmd.config.category] = [];
      }
      categories[cmd.config.category].push(name);
    }
    
    const categoriesArray = Object.entries(categories);
    const itemsPerPage = 7;
    const totalPages = Math.ceil(categoriesArray.length / itemsPerPage);
    
  
    let page = args.length > 0 ? parseInt(args[0]) : 1;
    
  
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    
  
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, categoriesArray.length);
    const pageCategories = categoriesArray.slice(startIndex, endIndex);
    

    let responseMessage = `ᥫ᭡ 🧸🎀𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭 🧸🎀 ᥫ᭡\n\n🎀 ˚✿˖°────୨ᰔ୧────°˖✿ 🌻\n\n❍ Pᴀɢᴇ ${page}/${totalPages}\n\n`;
    
    for (const [category, cmds] of pageCategories) {
      responseMessage += `┌─❏ ${smallCaps(category)}\n`;
      const perLine = 2;
      for (let i = 0; i < cmds.length; i += perLine) {
        const row = cmds.slice(i, i + perLine).map(c => `❍ ${c}`).join("   ");
        responseMessage += `│  ${row}\n`;
      }
      responseMessage += "└──────────────⚬\n";
    }
    
    responseMessage +=
      "\n╭───────────────⚬\n" +
      `│ Cᴜʀʀᴇɴᴛʟʏ, Tʜᴇ Bᴏᴛ Hᴀs [${totalCommands}] \n│ Cᴏᴍᴍᴀɴᴅs 😘🎀\n` +
      `│ Usᴇ Hᴇʟᴘ (Cᴍᴅ) ᴛᴏ Gᴇᴛ Mᴏʀᴇ \n│ Dᴇᴛᴀɪʟs ☕\n` +
      `│ Usᴇ Hᴇʟᴘ [Pᴀɢᴇ] Tᴏ Sᴇᴇ Oᴛʜᴇʀ \n│ Pᴀɢᴇs 🌷\n` +
      "╰───────────────⚬\n\n🌻👀 ˚✿˖°────୨ᰔ୧────°˖✿˚ 🧸✨";
    
    const imagePath = path.join(__dirname, "...", "..", "rasin", "cutie.jpg");
    
    try {
      if (fs.existsSync(imagePath)) {
        return api.sendMessage({
          body: responseMessage,
          attachment: fs.createReadStream(imagePath)
        }, threadID, messageID);
      } else {
        console.error("Image not found at:", imagePath);
        return api.sendMessage(responseMessage, threadID, messageID);
      }
    } catch (error) {
      console.error("Error loading image:", error);
      return api.sendMessage(responseMessage, threadID, messageID);
    }
  }
};

function smallCaps(text) {
  const map = {
    a: "a", b: "b", c: "c", d: "d", e: "e", f: "ꜰ", g: "g",
    h: "h", i: "i", j: "j", k: "k", l: "l", m: "m", n: "n",
    o: "o", p: "p", q: "q", r: "r", s: "s", t: "t", u: "u",
    v: "v", w: "w", x: "x", y: "y", z: "z",
    A: "a", B: "b", C: "c", D: "d", E: "e", F: "ꜰ", G: "g",
    H: "h", I: "i", J: "j", K: "k", L: "l", M: "m", N: "n",
    O: "o", P: "p", Q: "q", R: "r", S: "s", T: "t", U: "u",
    V: "v", W: "w", X: "x", Y: "y", Z: "z"
  };
  return text.split("").map(c => map[c] || c).join("");
}