
module.exports = {
  config: {
    name: "slots",
    aliases: ["slot", "slt", "sl", "spin"],
    version: "1.3",
    author: "Rasin",
    prefix: false,
    countDown: 3,
    role: 0,
    description: "Slot Game",
    category: "game",
    guide: {
      en: "Use: {pn}slot <amount>"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    // Money format function
    const formatMoney = (amount) => {
      if (isNaN(amount)) return "🥹 0";
      amount = Number(amount);

      const scales = [
        { value: 1e15, suffix: 'Q', color: '' },
        { value: 1e12, suffix: 'T', color: '' },
        { value: 1e9, suffix: 'B', color: '' },
        { value: 1e6, suffix: 'M', color: '' },
        { value: 1e3, suffix: 'k', color: '' }
      ];

      const scale = scales.find(s => amount >= s.value);
      if (scale) {
        const scaledValue = amount / scale.value;
        return `${scale.color}${scaledValue.toFixed(2)}${scale.suffix}`;
      }
      return `😺 ${amount.toLocaleString()}`;
    };

    // Invalid bet check
    if (isNaN(bet) || bet <= 0) {
      return message.reply("Pleaꜱe Enter A Valid Bet Amount");
    }

    const user = await usersData.get(senderID);

    // Not enough balance
    if (user.money < bet) {
      return message.reply(`You Need ${formatMoney(bet - user.money)} More To Play`);
    }

    // Slot symbols with weight
    const symbols = [
      { emoji: "🍒", weight: 30 },
      { emoji: "🍋", weight: 25 },
      { emoji: "🍇", weight: 20 },
      { emoji: "🍉", weight: 15 },
      { emoji: "⭐", weight: 7 },
      { emoji: "7️⃣", weight: 3 }
    ];

    // Roll function
    const roll = () => {
      const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
      let random = Math.random() * totalWeight;

      for (const symbol of symbols) {
        if (random < symbol.weight) return symbol.emoji;
        random -= symbol.weight;
      }
      return symbols[0].emoji;
    };

    const slot1 = roll();
    const slot2 = roll();
    const slot3 = roll();

    let winnings = 0;
    let outcome;
    let winType = "";
    let bonus = "";

    // Jackpot cases
    if (slot1 === "7️⃣" && slot2 === "7️⃣" && slot3 === "7️⃣") {
      winnings = bet * 10;
      outcome = "🙀 Mega Jackpot! Triple 7️⃣!";
      winType = "🤞 Max Win";
      bonus = "🤠 Bonuꜱ: +3% To Your Total Balance!";
      await usersData.set(senderID, { money: user.money * 1.03 });
    } else if (slot1 === slot2 && slot2 === slot3) {
      winnings = bet * 5;
      outcome = "😘 Jackpot!\n3 Matching Symbolꜱ!";
      winType = "🎉 Big Win";
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      winnings = bet * 2;
      outcome = "😻 Nice!\n2 Matching Symbolꜱ!";
      winType = "🥳 Win";
    } else if (Math.random() < 0.5) {
      winnings = bet * 1.5;
      outcome = "😱 Lucky Spin Bonuꜱ Win!";
      winType = "😐 Small Win";
    } else {
      winnings = -bet;
      outcome = "😌 Don't Worry! Better Luck Next Time!";
      winType = "😫 Loꜱꜱ";
    }

    await usersData.set(senderID, { money: user.money + winnings });
    const finalBalance = user.money + winnings;

    const slotBox = `【 Slot Game 】\n《 ${slot1} | ${slot2} | ${slot3} 》`;
    const resultColor = winnings >= 0 ? "😻" : "🥹";
    const resultText = winnings >= 0
      ? `😍 Win: ${formatMoney(winnings)}`
      : `😫 Loꜱt: ${formatMoney(bet)}`;

    const messageContent =
`${slotBox}

😀 Reꜱult: ${outcome}
${winType ? `${winType}\n` : ""}${bonus ? `${bonus}\n` : ""}
${resultColor} ${resultText}
👀 Balance: ${formatMoney(finalBalance)}`;

    return message.reply(messageContent);
  }
};

