const fs = require("fs-extra");

// নম্বর পার্স করার ফাংশন (K, M, B, T, QA, QI, SX, SP, O, N, DC)
function parseAmount(input) {
  if (!input || typeof input !== "string") return null;

  input = input.toString().toLowerCase().trim();

  // মাল্টিপ্লায়ার ডিফাইন
  const multipliers = {
    'k': 1e3,
    'm': 1e6,
    'b': 1e9,
    't': 1e12,
    'qa': 1e15,
    'qi': 1e18,
    'sx': 1e21,
    'sp': 1e24,
    'o': 1e27,
    'n': 1e30,
    'd': 1e33,
    'dc': 1e33  // decillion
  };

  // রেগুলার এক্সপ্রেশন - সংখ্যা এবং ইউনিট আলাদা করা
  const match = input.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/);
  if (!match) return null;

  const num = parseFloat(match[1]);
  const unit = match[2];

  if (isNaN(num) || num < 0) return null;

  // ইউনিট না থাকলে সরাসরি সংখ্যা রিটার্ন
  if (!unit) return Math.floor(num);

  // ইউনিট থাকলে মাল্টিপ্লাই
  const multiplier = multipliers[unit];
  if (!multiplier) return null;

  return Math.floor(num * multiplier);
}

// নম্বর ফরম্যাট করার ফাংশন (মানি স্টাইলে)
function formatMoney(amount) {
  if (amount >= 1e33) return (amount / 1e33).toFixed(2) + ' DC';
  if (amount >= 1e30) return (amount / 1e30).toFixed(2) + ' N';
  if (amount >= 1e27) return (amount / 1e27).toFixed(2) + ' O';
  if (amount >= 1e24) return (amount / 1e24).toFixed(2) + ' SP';
  if (amount >= 1e21) return (amount / 1e21).toFixed(2) + ' SX';
  if (amount >= 1e18) return (amount / 1e18).toFixed(2) + ' QI';
  if (amount >= 1e15) return (amount / 1e15).toFixed(2) + ' QA';
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + ' T';
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + ' B';
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + ' M';
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + ' K';
  return amount.toString();
}

module.exports = {
  config: {
    name: "sendmoney",
    version: "2.0",
    author: "Vydron1122",
    countDown: 5,
    role: 0,
    description: {
      en: "💸 Send money to another user (2% transaction fee) - Supports K,M,B,T,QA,QI,SX,SP,O,N,DC"
    },
    category: "economy",
    guide: {
      en: "{pn} [@mention/uid] [amount]\n{pn} [amount] (reply to user message)\nExamples:\n  {pn} @user 5000\n  {pn} @user 10k\n  {pn} @user 5.5m\n  {pn} @user 2.3b\n  {pn} @user 1.5qa\n  {pn} @user 7.8dc"
    },
    aliases: ["balancetransfer", "balt", "send", "pay"]
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const senderID = event.senderID;

    // টাইপিং ইন্ডিকেটর
    api.sendMessage({ typing: true }, event.threadID);

    try {
      let targetID;
      let amount;
      let rawAmount;

      // কেইস ১: রিপ্লাই করে sendmoney amount
      if (event.messageReply && args.length === 1) {
        targetID = event.messageReply.senderID;
        rawAmount = args[0];
        amount = parseAmount(rawAmount);

        if (amount === null || amount <= 0) {
          api.sendMessage({ typing: false }, event.threadID);
          return message.reply(`❌ Invalid amount! Please use valid format like: 5000, 10k, 5.5m, 2.3b, 1.5qa, 7.8dc etc.`);
        }
      }
      // কেইস ২: sendmoney @mention/uid amount
      else if (args.length >= 2) {
        // মেনশন থেকে আইডি নেওয়া
        if (Object.keys(event.mentions).length > 0) {
          targetID = Object.keys(event.mentions)[0];
          rawAmount = args[1];
        } 
        // UID থেকে আইডি নেওয়া
        else {
          targetID = args[0];
          rawAmount = args[1];
        }

        amount = parseAmount(rawAmount);

        if (amount === null || amount <= 0) {
          api.sendMessage({ typing: false }, event.threadID);
          return message.reply(`❌ Invalid amount! Please use valid format like: 5000, 10k, 5.5m, 2.3b, 1.5qa, 7.8dc etc.`);
        }

        // UID ভ্যালিডেশন
        if (targetID.length < 10 || isNaN(targetID)) {
          api.sendMessage({ typing: false }, event.threadID);
          return message.reply("❌ Please enter a valid UID or mention a user!");
        }
      } 
      else {
        api.sendMessage({ typing: false }, event.threadID);
        return message.reply(
          "❌ Invalid format!\n\n" +
          "Usage:\n" +
          "• !sendmoney @mention/uid [amount]\n" +
          "• !sendmoney [amount] (reply to user message)\n" +
          "• !balance transfer @mention/uid [amount]\n" +
          "• !balance send @mention/uid [amount]\n\n" +
          "💰 Amount formats: 5000, 10k, 5.5m, 2.3b, 1.5t, 7qa, 3.2qi, 8.1sx, 4.6dc\n" +
          "(k=thousand, m=million, b=billion, t=trillion, qa=quadrillion, qi=quintillion, sx=sextillion, dc=decillion)"
        );
      }

      // নিজেকে টাকা পাঠানো যাবে না
      if (targetID === senderID) {
        api.sendMessage({ typing: false }, event.threadID);
        return message.reply("❌ You cannot send money to yourself!");
      }

      // সেন্ডারের ডাটা
      const senderData = await usersData.get(senderID);
      if (!senderData) {
        api.sendMessage({ typing: false }, event.threadID);
        return message.reply("❌ Your data not found!");
      }

      const senderBalance = senderData.money || 0;

      // টাকার পরিমাণ চেক
      if (senderBalance < amount) {
        api.sendMessage({ typing: false }, event.threadID);
        return message.reply(`❌ You don't have enough money!\nYour balance: ${formatMoney(senderBalance)} ($${senderBalance.toLocaleString()})`);
      }

      // টার্গেট ইউজারের ডাটা
      let targetData = await usersData.get(targetID);
      if (!targetData) {
        // ইউজার না থাকলে নতুন বানানো
        targetData = {
          money: 0,
          exp: 0,
          name: "Unknown"
        };
      }

      // ২% ট্রানজেকশন ফি ক্যালকুলেশন
      const feePercentage = 2;
      const feeAmount = Math.floor((amount * feePercentage) / 100);
      const amountAfterFee = amount - feeAmount;
      const totalDeduction = amount; // সেন্ডার থেকে amount কাটা হবে, ফি সহ

      // চেক করা যে ফি দেওয়ার পরেও পর্যাপ্ত টাকা আছে কিনা
      if (senderBalance < totalDeduction) {
        api.sendMessage({ typing: false }, event.threadID);
        return message.reply(`❌ You need ${formatMoney(totalDeduction)} (including ${feePercentage}% fee) but you have only ${formatMoney(senderBalance)}`);
      }

      // ব্যালেন্স আপডেট
      senderData.money = senderBalance - totalDeduction;
      targetData.money = (targetData.money || 0) + amountAfterFee;

      // ডাটা সেভ
      await usersData.set(senderID, senderData);
      await usersData.set(targetID, targetData);

      // ইউজারের নাম পাওয়া
      let senderName = "You";
      try {
        const senderInfo = await api.getUserInfo(senderID);
        senderName = senderInfo[senderID]?.name || "You";
      } catch (e) {}

      let targetName = "Unknown";
      try {
        const targetInfo = await api.getUserInfo(targetID);
        targetName = targetInfo[targetID]?.name || "Unknown";
      } catch (e) {}

      api.sendMessage({ typing: false }, event.threadID);

      // সফল মেসেজ
      const msg = `💸 **Money Sent Successfully!**\n\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `👤 From: ${senderName}\n` +
                  `👤 To: ${targetName}\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `💰 Amount Sent: ${formatMoney(amount)} ($${amount.toLocaleString()})\n` +
                  `💳 Transaction Fee (${feePercentage}%): ${formatMoney(feeAmount)} ($${feeAmount.toLocaleString()})\n` +
                  `📦 Receiver Gets: ${formatMoney(amountAfterFee)} ($${amountAfterFee.toLocaleString()})\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `💵 Your New Balance: ${formatMoney(senderData.money)} ($${senderData.money.toLocaleString()})\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `✨ Thank you for using sendmoney, baby!`;

      return message.reply(msg);

    } catch (error) {
      api.sendMessage({ typing: false }, event.threadID);
      console.error("Sendmoney Error:", error);
      return message.reply(`❌ Error: ${error.message}`);
    }
  }
};
