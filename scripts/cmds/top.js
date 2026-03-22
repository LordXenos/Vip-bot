module.exports = {
  config: {
    name: "top",
    aliases: ["dhoni", "borolokx", "borolok", "jomidar"],
    version: "1.1",
    prefix: false,
    author: "Rasin",
    shortDescription: "🥇 Boroloks Leaderboard",
    longDescription: "Top users based on money ranking",
    category: "Economy",
    guide: {
      en: "{p}top [count]"
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {
      const allUsers = await usersData.getAll();

      const topCount = args[0] ? Math.min(parseInt(args[0]), 20) : 10;

      const topUsers = allUsers
        .filter(user => user.money !== undefined)
        .sort((a, b) => b.money - a.money)
        .slice(0, topCount);

      if (topUsers.length === 0) {
        return api.sendMessage("🚫 No borolok found in the server yet!", event.threadID);
      }

      let leaderboardMsg = `💸 𝗧𝗢𝗣 ${topCount} 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗠𝗢𝗡𝗘𝗬 𝗛𝗢𝗟𝗗𝗘𝗥𝗦 💸\n━━━━━━━━━━━━━━━━━━\n`;

      topUsers.forEach((user, index) => {
        const rank = index + 1;
        const name = user.name || "❔ Unknown";
        const money = formatMoney(user.money || 0);

        leaderboardMsg += `\n${rank} | ${name}\n𝗧𝗼𝘁𝗮𝗹 𝗪𝗲𝗮𝗹𝘁𝗵: ${money}`;
      });

      leaderboardMsg += `\n━━━━━━━━━━━━━━━━━━\nUse {p}top 5 / {p}top 20 to view different count`;

      api.sendMessage(leaderboardMsg, event.threadID);

    } catch (error) {
      console.error("❌ Leaderboard Error:", error);
      api.sendMessage("⚠️ Unable to fetch leaderboard. Try again later.", event.threadID);
    }
  }
};

function getRankEmoji(rank) {
  const emojis = ["👑", "🥈", "🥉",];
  if (rank === 1) return emojis[0];
  if (rank === 2) return emojis[1];
  if (rank === 3) return emojis[2];
  if (rank <= 5) return emojis[3];
  if (rank <= 10) return emojis[4];
  if (rank <= 15) return emojis[5];
  return emojis[6];
}

function formatMoney(amount) {
  if (amount >= 1e15) return (amount / 1e15).toFixed(2) + " QT";
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + " T";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + " B";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + " M";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + " K";
  return amount.toString();
}
