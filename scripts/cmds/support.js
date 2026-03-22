const fs = require("fs-extra");
const path = require("path");

const SUPPORT_GC_ID = "1218533873766188"; // সাপোর্ট গ্রুপ আইডি
const ownerID = "61581548070081"; // তোর UID

// ওয়েলকাম মেসেজ লাইব্রেরি (কিউট ও র‍্যান্ডম)
const welcomeMessages = [
  "🌸 হ্যালো {name}! তোমাকে পেয়ে গ্রুপটা আরও রঙিন হয়ে গেল! 💫",
  "🎀 ওয়েলকাম {name}! তুমি এখন আমাদের পরিবারের সদস্য! 💖",
  "🦋 উড়ে এসে জড়ো হও {name}! সাপোর্ট গ্রুপে তোমাকে স্বাগতম! 🌈",
  "🍭 মিষ্টি একটা ওয়েলকাম {name}! তোমার জন্য অপেক্ষা ছিলাম! 🧸",
  "🌺 {name} জয়েন করলো! এখন থেকে আরও মজা হবে! 🎉",
  "💝 স্পেশাল ওয়েলকাম {name}! তুমি আমাদের স্পেশাল গেস্ট! 👑",
  "🌟 নতুন সদস্য {name}! গ্রুপটা এখন তোমার বাড়ি! 🏠",
  "🎈 হুররে! {name} এলো! কেক কেটে ফেলি? 🎂",
  "🧁 {name} জয়েন করেছে! সবাই মিলে ওয়েলকাম বলো! 🥳",
  "🕊️ শান্তির পায়রা {name}! সাপোর্ট গ্রুপে স্বাগতম! ☁️"
];

module.exports = {
  config: {
    name: "supportgc",
    version: "3.0",
    author: "Vydron1122",
    countDown: 5,
    role: 0, // সবাই ব্যবহার করতে পারবে
    description: {
      en: "👥 Join support group (Owner can add all members)"
    },
    category: "group",
    guide: {
      en: "{pn} - Join yourself\n{pn} all - Add all members (Owner only)\n{pn} @user - Add mentioned user (Owner only)\n{pn} UID - Add user by UID (Owner only)"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const senderID = event.senderID;
    const isOwner = senderID === ownerID;

    let targetIDs = [];

    // ============ কেইস ১: !supportgc all (শুধু ওনার জন্য) ============
    if (args[0] === "all") {
      if (!isOwner) {
        return message.reply("❌ Only my owner can add all members!");
      }

      try {
        // বর্তমান গ্রুপের সবাইকে নেওয়া
        const threadInfo = await api.getThreadInfo(event.threadID);
        targetIDs = threadInfo.participantIDs || [];

        // বাদ দিবে যারা ইতিমধ্যে সাপোর্ট গ্রুপে আছে
        const supportThreadInfo = await api.getThreadInfo(SUPPORT_GC_ID);
        const existingMembers = supportThreadInfo.participantIDs || [];

        targetIDs = targetIDs.filter(id => !existingMembers.includes(id));

        if (targetIDs.length === 0) {
          return message.reply("✅ Everyone is already in the support group!");
        }

        await message.reply(`🔄 Adding ${targetIDs.length} members to support group...`);

      } catch (error) {
        return message.reply(`❌ Error fetching members: ${error.message}`);
      }
    }

    // ============ কেইস ২: শুধু !supportgc (নিজে জয়েন) ============
    else if (args.length === 0 && !event.messageReply && Object.keys(event.mentions).length === 0) {
      targetIDs.push(senderID);
    }

    // ============ কেইস ৩: ওনার জন্য মেনশন/UID/রিপ্লাই ============
    else if (isOwner) {
      // রিপ্লাই করা মেসেজ থেকে
      if (event.messageReply) {
        targetIDs.push(event.messageReply.senderID);
      }
      // মেনশন থেকে
      else if (Object.keys(event.mentions).length > 0) {
        targetIDs = Object.keys(event.mentions);
      }
      // UID থেকে
      else if (args[0] && args[0].length > 10 && !isNaN(args[0])) {
        targetIDs.push(args[0]);
      } else {
        return message.reply("❌ Invalid format! For owner:\n• !supportgc all\n• !supportgc @user\n• !supportgc UID\n• Reply with !supportgc");
      }
    }

    // ============ বাকি সবাই এরর দেখবে ============
    else {
      return message.reply("❌ Only my owner can add others!\nYou can use: !supportgc (to join yourself)");
    }

    // টাইপিং ইন্ডিকেটর
    api.sendMessage({ typing: true }, event.threadID);

    try {
      let successCount = 0;
      let failCount = 0;
      const results = [];
      const addedUsers = [];

      for (const uid of targetIDs) {
        try {
          // ইউজারের নাম পাওয়া
          const userInfo = await api.getUserInfo(uid);
          const userName = userInfo[uid]?.name || "Unknown";

          // চেক করা যে ইতিমধ্যে গ্রুপে আছে কিনা
          try {
            const threadInfo = await api.getThreadInfo(SUPPORT_GC_ID);
            if (threadInfo.participantIDs && threadInfo.participantIDs.includes(uid)) {
              results.push(`⚠️ ${userName} already in the group!`);
              continue;
            }
          } catch (e) {}

          // গ্রুপে অ্যাড
          await api.addUserToGroup(uid, SUPPORT_GC_ID);

          addedUsers.push({ id: uid, name: userName });
          successCount++;
          results.push(`✅ ${userName} added successfully!`);

        } catch (e) {
          failCount++;
          results.push(`❌ Failed to add ${uid} - ${e.message}`);
        }

        // রেট লিমিট এড়াতে ছোট বিরতি
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      api.sendMessage({ typing: false }, event.threadID);

      // ওয়েলকাম মেসেজ পাঠানো (সফল যুক্তদের জন্য)
      if (addedUsers.length > 0) {
        setTimeout(() => {
          addedUsers.forEach(user => {
            const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            const welcomeMsg = randomWelcome.replace("{name}", user.name);
            api.sendMessage(welcomeMsg, SUPPORT_GC_ID);
          });
        }, 3000);
      }

      // রিপোর্ট মেসেজ
      let reportMsg = `📊 **Support Group Report** 📊\n`;
      reportMsg += `━━━━━━━━━━━━━━━━\n`;
      reportMsg += `✅ Added: ${successCount}\n`;
      reportMsg += `❌ Failed: ${failCount}\n`;
      reportMsg += `━━━━━━━━━━━━━━━━\n`;
      reportMsg += results.join("\n");

      return message.reply(reportMsg);

    } catch (error) {
      api.sendMessage({ typing: false }, event.threadID);
      console.error("SupportGC Error:", error);
      return message.reply(`❌ Error: ${error.message}`);
    }
  }
};