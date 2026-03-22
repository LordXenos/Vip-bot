module.exports = {
  config: {
    name: "bank",
    aliases: [],
    version: "2.0",
    author: "Developer Raꜱin",
    countDown: 5,
    role: 0,
    description: "𝘿𝙞𝙜𝙞𝙩𝙖𝙡 𝘽𝙖𝙣𝙠: wallet 💼 | bank 🏦 | loan 💳",
    category: "economy",
    guide: {
      en: "{pn} balance\n{pn} deposit <amount>\n{pn} withdraw <amount>\n{pn} loan\n{pn} preloan\n{pn} top"
    }
  },

  formatMoney(amount) {
    if (amount === 0) return "0";
    const abs = Math.abs(amount);
    if (abs >= 1e15) return (amount / 1e15).toFixed(2).replace(/\.00$/, "") + "💥Qt";
    if (abs >= 1e12) return (amount / 1e12).toFixed(2).replace(/\.00$/, "") + "🌪️Treelion";
    if (abs >= 1e9) return (amount / 1e9).toFixed(2).replace(/\.00$/, "") + "🔥Bilon";
    if (abs >= 1e6) return (amount / 1e6).toFixed(2).replace(/\.00$/, "") + "💸Milon";
    if (abs >= 1e3) return (amount / 1e3).toFixed(2).replace(/\.00$/, "") + "💰K";
    return amount.toString();
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const senderID = event.senderID;
      const cmd = args[0]?.toLowerCase();
      if (!cmd) {
        return message.reply(
          "🏦 𝗕𝗔𝗡𝗞 𝗠𝗘𝗡𝗨\n\n" +
          "🔍 balance – check your wallet & bank\n" +
          "💰 depoꜱit <amount> – to bank\n" +
          "🏧 withdraw <amount> – to wallet\n" +
          "💳 loan – get money\n" +
          "💼 preloan – repay your loan\n" +
          "👑 top – richeꜱt bankerꜱ"
        );
      }

      let userData = await usersData.get(senderID);
      if (!userData.data) userData.data = {};
      if (!userData.data.bankdata) userData.data.bankdata = { bank: 0, loan: 0 };
      
      let wallet = userData.money || 0;
      let bankData = userData.data.bankdata;
      const format = this.formatMoney;

      if (cmd === "balance") {
        return message.reply(
          `📊 your account ꜱummary:\n\n` +
          `💼 wallet: ${format(wallet)}\n` +
          `🏦 bank: ${format(bankData.bank)}\n` +
          `💳 loan: ${format(bankData.loan)}`
        );
      }

      if (cmd === "deposit") {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return message.reply("⚠️ pleaꜱe enter a valid amount to depoꜱit.");
        }
        if (wallet < amount) {
          return message.reply(`🚫 you only have ${format(wallet)} in your wallet.`);
        }
        wallet -= amount;
        bankData.bank += amount;
        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });
        return message.reply(
          `✅ depoꜱited: ${format(amount)}\n` +
          `🏦 new bank: ${format(bankData.bank)}\n` +
          `💼 wallet: ${format(wallet)}`
        );
      }

      if (cmd === "withdraw") {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return message.reply("⚠️ enter a valid amount to withdraw.");
        }
        if (bankData.bank < amount) {
          return message.reply(`🚫 you only have ${format(bankData.bank)} in bank.`);
        }
        bankData.bank -= amount;
        wallet += amount;
        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });
        return message.reply(
          `💸 withdrawn: ${format(amount)}\n` +
          `💼 wallet: ${format(wallet)}\n` +
          `🏦 bank: ${format(bankData.bank)}`
        );
      }

      if (cmd === "loan") {
        const loanLimit = 1000000;
        if (bankData.loan > 0) {
          return message.reply(
            `❌ you already owe: ${format(bankData.loan)}\n🧾 pay it back ꜰirꜱt.`
          );
        }
        bankData.loan = loanLimit;
        wallet += loanLimit;
        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });
        return message.reply(
          `💳 loan approved!\n💼 ${format(loanLimit)} added to wallet.`
        );
      }

      if (cmd === "preloan") {
        if (bankData.loan === 0) {
          return message.reply("✅ no active loan. you’re ꜰree 💅");
        }
        if (wallet < bankData.loan) {
          return message.reply(`🚫 you need ${format(bankData.loan)} to pay back.`);
        }
        wallet -= bankData.loan;
        bankData.loan = 0;
        await usersData.set(senderID, {
          money: wallet,
          data: userData.data
        });
        return message.reply("🎉 loan cleared. you’re debt ꜰree 💸");
      }

      if (cmd === "top") {
        const allUsers = await usersData.getAll();
        const topUsers = allUsers
          .filter(u => u?.data?.bankdata?.bank > 0)
          .sort((a, b) => b.data.bankdata.bank - a.data.bankdata.bank)
          .slice(0, 10);

        if (topUsers.length === 0) {
          return message.reply("❌ no top bankerꜱ ꜰound.");
        }

        let msg = "👑 top 𝟭𝟬 bankerꜱ 🏆\n━━━━━━━━━━━━━━━\n";
        for (let i = 0; i < topUsers.length; i++) {
          const user = topUsers[i];
          const emoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "💼";
          msg += `${emoji} ${i + 1}. ${user.name || "unknown"} → ${format(user.data.bankdata.bank)}\n`;
        }

        return message.reply(msg.trim());
      }

      return message.reply("❓ invalid command. try: balance, depoꜱit, withdraw, loan, preloan, top");

    } catch (error) {
      console.error("❌ bank error:", error);
      return message.reply("💥 network error. try again later.");
    }
  }
};