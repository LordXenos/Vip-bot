module.exports = {
  config: {
    name: "balance2",
    aliases: ["bal2", "money", "taka"],
    version: "3.1",
    author: "Rasin",
    prefix: true,
    countDown: 3,
    role: 0,
    description: "Balance",
    category: "economy",
    guide: {
      en: "{pn} balance | Check your balance\n"
        + "{pn} balance <name> | Check others by name\n"
        + "{pn} balance t <name> amount | Transfer by name\n"
        + "{pn} balance [reply] | Check replied user's balance\n"
    }
  },

  onStart: async function ({ message, event, args, usersData, prefix, api }) {
    const { senderID, messageReply, threadID } = event;

    const formatMoney = (amount) => {
      if (isNaN(amount)) return "$0";
      amount = Number(amount);
      const scales = [
        { value: 1e15, suffix: 'Q' },
        { value: 1e12, suffix: 'T' },
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'k' }
      ];
      const scale = scales.find(s => amount >= s.value);
      if (scale) {
        const scaledValue = amount / scale.value;
        return `$${scaledValue.toFixed(1)}${scale.suffix}`;
      }
      return `$${amount.toLocaleString()}`;
    };

    const createFlatDisplay = (title, contentLines) => {
      return `😍 ${title} ✨\n` + 
        contentLines.map(line => `${line}`).join('\n') + '\n';
    };


    const findUserByName = async (query) => {
      try {

        const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
        
        const threadInfo = await api.getThreadInfo(threadID);
        const ids = threadInfo.participantIDs || [];
        const matches = [];

        for (const uid of ids) {
          try {
            const name = (await usersData.getName(uid)).toLowerCase();
            if (name.includes(cleanQuery)) {
              matches.push({ uid, name });
            }
          } catch {}
        }

        return matches;
      } catch {
        return [];
      }
    };

    if (args[0]?.toLowerCase() === 't') {
      let targetID = messageReply?.senderID;
      let amount;

      const lastArg = args[args.length - 1];
      amount = parseFloat(lastArg);

      if (isNaN(amount)) {
        return message.reply(createFlatDisplay("Invalid Uꜱage", [
          `Uꜱe: ${prefix}balance t <name> <amount>`
        ]));
      }


      if (!targetID) {
        const nameQuery = args.slice(1, -1).join(" ");
        
        if (!nameQuery) {
          return message.reply(createFlatDisplay("Invalid Uꜱage", [
            `Uꜱe: ${prefix}balance t <name> <amount>`
          ]));
        }

        const matches = await findUserByName(nameQuery);

        if (matches.length === 0) {
          return message.reply(createFlatDisplay("User Not Found", [
            `No user found with name: ${nameQuery.replace(/@/g, "")}`
          ]));
        }

        if (matches.length > 1) {
          const matchList = matches.map(m => `• ${m.name}`).join('\n');
          return message.reply(createFlatDisplay("Multiple Uꜱerꜱ Found", [
            `Please be more ꜱpeciꜰic:\n${matchList}`
          ]));
        }

        targetID = matches[0].uid;
      }

      if (amount <= 0) return message.reply(createFlatDisplay("Error", ["Amount muꜱt be poꜱitive"]));
      if (senderID === targetID) return message.reply(createFlatDisplay("Error", ["You can't ꜱend money to yourꜱelꜰ"]));

      const [sender, receiver] = await Promise.all([
        usersData.get(senderID),
        usersData.get(targetID)
      ]);

      if (sender.money < amount) {
        return message.reply(createFlatDisplay("Inꜱuꜰꜰicient Balance", [
          `You Need ${formatMoney(amount - sender.money)} More`
        ]));
      }

      await Promise.all([
        usersData.set(senderID, { money: sender.money - amount }),
        usersData.set(targetID, { money: receiver.money + amount })
      ]);

      const receiverName = await usersData.getName(targetID);
      return message.reply(createFlatDisplay("Money Tranꜱꜰer Complete 🥹 🎀", [
        `😺 To: ${receiverName}`,
        `✌ Sent: ${formatMoney(amount)}`,
        `🤗 Your New Balance: ${formatMoney(sender.money - amount)}`
      ]));
    }

    if (messageReply?.senderID && !args[0]) {
      const targetID = messageReply.senderID;
      const name = await usersData.getName(targetID);
      const money = await usersData.get(targetID, "money");
      return message.reply(createFlatDisplay(`${name}'ꜱ Balance 😌`, [
        `🎀 Balance: ${formatMoney(money)}`
      ]));
    }

    if (args[0]) {
      const query = args.join(" ");
      const matches = await findUserByName(query);

      if (matches.length === 0) {
        return message.reply(createFlatDisplay("User Not Found", [
          `No user found with name: ${query.replace(/@/g, "")}`
        ]));
      }

      if (matches.length > 1) {
        const balances = await Promise.all(
          matches.map(async (match) => {
            const money = await usersData.get(match.uid, "money");
            return `${match.name}: ${formatMoney(money)}`;
          })
        );
        return message.reply(createFlatDisplay("Multiple Uꜱerꜱ Found", balances));
      }

      const targetID = matches[0].uid;
      const name = await usersData.getName(targetID);
      const money = await usersData.get(targetID, "money");
      return message.reply(createFlatDisplay(`${name}'ꜱ Balance 😌`, [
        `🎀 Balance: ${formatMoney(money)}`
      ]));
    }

    const userMoney = await usersData.get(senderID, "money");
    return message.reply(createFlatDisplay("🤗 Your Balance", [
      `💵 ${formatMoney(userMoney)}`,
    ]));
  }
};