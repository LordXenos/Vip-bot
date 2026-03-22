const axios = require("axios");

// লোকাল ব্যাকআপ রোস্ট (যখন API fail করবে)
const localRoasts = [
  "@{name}, তোর সেলফি দেখে পারদ -১০ ডিগ্রিতে নেমে গেছে 🥶",
  "@{name}, তোর ফেস দেখে কান্না জমে বরফ হয়ে গেছে ❄️",
  "@{name}, তোর এই লুক দেখে নাইট কিং বলল, 'মাই ব্রাদার' 🥶",
  "@{name}, তোর ডার্কনেস দেখে শ্যাডো পালিয়েছে 🖤",
  "@{name}, সিগমা রুল ১: তোর ছবি কখনও জুম করো না 👑"
];

const localTips = [
  "stay cold 🥶",
  "sigma never cry 🗿",
  "darkness is home 🖤",
  "ice in veins ❄️",
  "lonely but powerful 👑",
  "grind in silence 💪"
];

// AI রোস্ট জেনারেট
async function getAIRoast(name) {
  try {
    // ফ্রি ইনসাল্ট API (কোন API key লাগে না)
    const response = await axios.get("https://evilinsult.com/generate_insult.php?lang=en&type=json");
    const insult = response.data.insult;

    // র‍্যান্ডম টিপ
    const tip = localTips[Math.floor(Math.random() * localTips.length)];

    return `@${name} ${insult}, ${tip}`;
  } catch (error) {
    // API fail করলে লোকাল ইউজ কর
    const randomRoast = localRoasts[Math.floor(Math.random() * localRoasts.length)];
    const randomTip = localTips[Math.floor(Math.random() * localTips.length)];
    return `${randomRoast.replace("@{name}", name)}, ${randomTip}`;
  }
}

module.exports = {
  config: {
    name: "roast",
    version: "5.0",
    author: "Vydron1122",
    countDown: 5,
    role: 0,
    description: {
      en: "🔥 AI Generated roasts (infinite new captions)"
    },
    category: "fun",
    guide: {
      en: "{pn} [@mention] (reply to a message)"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    let targetID;
    let targetName;

    try {
      // টার্গেট আইডি সেট
      if (event.messageReply) {
        targetID = event.messageReply.senderID;
      }
      else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }
      else if (args[0] && args[0].length > 10 && !isNaN(args[0])) {
        targetID = args[0];
      } else {
        targetID = event.senderID;
      }

      // ইউজারের নাম
      try {
        const userInfo = await api.getUserInfo(targetID);
        targetName = userInfo[targetID]?.name || "Unknown";
      } catch (e) {
        targetName = "Unknown";
      }

      // ওয়েট মেসেজ
      const waitMsg = await message.reply("⏳ Generating AI roast... 🔥");

      // AI রোস্ট জেনারেট
      const roastText = await getAIRoast(targetName);

      return api.editMessage(roastText, waitMsg.messageID, event.threadID);

    } catch (error) {
      console.error("Roast Error:", error);
      return message.reply(`❌ Error: ${error.message || 'Something went wrong!'}`);
    }
  }
};