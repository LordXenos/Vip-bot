const os = require("os");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

// ফাইল পাথ
const vipFile = path.join(__dirname, "..", "..", "vip.json");
const bannedFile = path.join(__dirname, "..", "..", "banned.json");
const blockFile = path.join(__dirname, "..", "..", "blocked.json");

module.exports = {
  config: {
    name: "information",
    version: "2.0",
    author: "Vydron1122",
    countDown: 5,
    role: 0,
    description: {
      en: "📊 Bot status - Groups, Users, VIP, Block, Ban, Friends & more"
    },
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event, usersData, threadsData, api }) {
    const startPing = Date.now();
    const waitMsg = await message.reply("⏳ Fetching bot status...");

    try {
      // ============ বেসিক ইনফো ============
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      // গ্রুপ ও ইউজার কাউন্ট
      const totalGroups = allThreads.filter(t => t.isGroup).length;
      const totalUsers = allUsers.length;

      // ============ ভিআইপি কাউন্ট ============
      let vipUsers = [];
      try {
        if (fs.existsSync(vipFile)) {
          vipUsers = JSON.parse(fs.readFileSync(vipFile, "utf8"));
        }
      } catch (e) {
        console.error("VIP file error:", e);
      }
      const vipCount = vipUsers.length;

      // ============ বান ইউজার কাউন্ট ============
      let bannedUsers = [];
      try {
        if (fs.existsSync(bannedFile)) {
          bannedUsers = JSON.parse(fs.readFileSync(bannedFile, "utf8"));
        }
      } catch (e) {
        console.error("Banned file error:", e);
      }
      const bannedCount = bannedUsers.length;

      // ============ ব্লক ইউজার কাউন্ট ============
      let blockedUsers = [];
      try {
        if (fs.existsSync(blockFile)) {
          blockedUsers = JSON.parse(fs.readFileSync(blockFile, "utf8"));
        }
      } catch (e) {
        console.error("Block file error:", e);
      }
      const blockedCount = blockedUsers.length;

      // ============ ফ্রেন্ড কাউন্ট ============
      let friendCount = 0;
      try {
        const friends = await api.getFriendsList();
        friendCount = friends.length;
      } catch (e) {
        console.error("Friend fetch error:", e);
      }

      // ============ পিং ক্যালকুলেশন ============
      const ping = Date.now() - startPing;

      // ============ আপটাইম ============
      const uptime = process.uptime();
      const uptimeStr = formatUptime(uptime);

      // ============ মেমোরি ইউসেজ ============
      const memoryUsage = process.memoryUsage();
      const usedMemory = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

      // ============ প্ল্যাটফর্ম ইনফো ============
      const platform = os.platform();
      const nodeVersion = process.version;

      // ============ টাইম (ঢাকা) ============
      const now = moment().tz("Asia/Dhaka").format("🕒 DD/MM/YYYY - hh:mm:ss A");

      // ============ অ্যাডমিন লিস্ট ============
      const adminIDs = global.GoatBot?.config?.adminBot || ["100016306893842"];

      // ============ স্ট্যাটাস মেসেজ বিল্ড ============
      let msg = `╔══════════════════╗\n`;
      msg += `     📊 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 📊\n`;
      msg += `╚══════════════════╝\n\n`;

      msg += `⏰ ${now}\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;

      msg += `🌐 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬: ${totalGroups}\n`;
      msg += `👤 𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬: ${totalUsers}\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;

      msg += `👑 𝐕𝐈𝐏 𝐔𝐬𝐞𝐫𝐬: ${vipCount}\n`;
      msg += `🚫 𝐁𝐚𝐧𝐧𝐞𝐝 𝐔𝐬𝐞𝐫𝐬: ${bannedCount}\n`;
      msg += `🔇 𝐁𝐥𝐨𝐜𝐤𝐞𝐝 𝐔𝐬𝐞𝐫𝐬: ${blockedCount}\n`;
      msg += `💞 𝐅𝐫𝐢𝐞𝐧𝐝𝐬: ${friendCount}\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;

      msg += `📶 𝐏𝐢𝐧𝐠: ${ping}ms\n`;
      msg += `⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeStr}\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;

      msg += `💾 𝐑𝐀𝐌 𝐔𝐬𝐞𝐝: ${usedMemory} MB / ${totalMemory} GB\n`;
      msg += `🖥️ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}\n`;
      msg += `⚙️ 𝐍𝐨𝐝𝐞: ${nodeVersion}\n`;
      msg += `━━━━━━━━━━━━━━━━\n`;

      msg += `💻 𝐀𝐝𝐦𝐢𝐧 𝐋𝐢𝐬𝐭:\n`;
      for (let i = 0; i < adminIDs.length; i++) {
        try {
          const name = await api.getUserInfo(adminIDs[i]);
          const adminName = name[adminIDs[i]]?.name || "Unknown";
          msg += `  ${i + 1}. ${adminName}\n`;
        } catch {
          msg += `  ${i + 1}. Admin ID: ${adminIDs[i]}\n`;
        }
      }
      msg += `━━━━━━━━━━━━━━━━\n`;

      msg += `📌 𝐓𝐲𝐩𝐞: /help 𝐟𝐨𝐫 𝐦𝐨𝐫𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n`;
      msg += `╔══════════════════╗\n`;
      msg += `     ✨ 𝐁𝐚𝐛𝐲, 𝐈'𝐦 𝐡𝐞𝐫𝐞 𝐟𝐨𝐫 𝐲𝐨𝐮 ✨\n`;
      msg += `╚══════════════════╝`;

      return api.editMessage(msg, waitMsg.messageID, event.threadID);

    } catch (error) {
      console.error("Status Error:", error);
      return api.editMessage(`❌ Error: ${error.message}`, waitMsg.messageID, event.threadID);
    }
  }
};

// আপটাইম ফরম্যাট ফাংশন
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}
