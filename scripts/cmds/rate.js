module.exports = {
  config: {
    name: "rate",
    aliases: ["rating"],
    version: "1.0",
    author: "Nisanxnx",
    countDown: 5,
    role: 0,
    shortDescription: "Random Rate",
    category: "fun",
    guide: "{p}{n} @tag"
  },

  onStart: async function ({ event, message, usersData }) {
    let mention = Object.keys(event.mentions)[0] || event.senderID;
    const userName = await usersData.getName(mention);

    const rating = Math.floor(Math.random() * 101); // 0-100%
    const messages = [
      `${userName} Todayy ${rating}% Cutee! 😍`,
      `${userName} Her/Him Smartness Rating: ${rating}% 🔥`,
      `${userName} is ${rating}% funny! 😂`,
      `${userName} Style Rating: ${rating}% ✨`
    ];

    const finalMessage = messages[Math.floor(Math.random() * messages.length)];
    message.reply(finalMessage);
  }
};