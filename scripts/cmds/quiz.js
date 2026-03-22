const axios = require("axios");

const rasin = `https://quiz69.onrender.com`;

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "2.0",
    author: "Rasin",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{p}quiz [lang] [category]\nEx: {p}quiz bn funny\nEx: {p}quiz en physics",
  },

  onStart: async function ({ api, event, usersData, args }) {
    const inputLang = args[0]?.toLowerCase() || "bn";
    const inputCat = args[1]?.toLowerCase() || "random";
    const lang = inputLang === "en" ? "english" : "bangla";
    const category = inputCat || ['random','funny'];
    const timeout = 300;

    try {
      const res = await axios.get(`${rasin}/api/quiz?lang=${lang}&type=${category}`);
      const quizData = res.data.quiz?.[0];

      if (!quizData) return api.sendMessage("😵 No quiz data found!", event.threadID);

      const { question, option_a, option_b, option_c, option_d, answer: correctAnswer } = quizData;

      const namePlayer = await usersData.getName(event.senderID);
      const quizText = {
        body: `\n❓ Qns: ${question}\n├‣ 𝐀) ${option_a}\n├‣ 𝐁) ${option_b}\n├‣ 𝐂) ${option_c}\n├‣ 𝐃) ${option_d}\n\nReply To Thiꜱ Meꜱꜱage With Your Reply`
      };

      api.sendMessage(
        quizText,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            type: "reply",
            commandName: module.exports.config.name,
            author: event.senderID,
            correctAnswer,
            messageID: info.messageID,
            nameUser: namePlayer,
            attempts: 0,
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, timeout * 1000);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error fetching quiz data.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    const { author, correctAnswer, nameUser } = Reply;
    if (event.senderID !== author)
      return api.sendMessage("👀 Don't touch other's quiz!", event.threadID, event.messageID);

    const maxAttempts = 2;
    const userAns = event.body?.trim().toLowerCase();

    if (Reply.attempts >= maxAttempts) {
      await api.unsendMessage(Reply.messageID);
      return api.sendMessage(`❌ ${nameUser}, you failed!\n✅ Correct Answer: ${correctAnswer.toUpperCase()}`, event.threadID, event.messageID);
    }

    if (userAns === correctAnswer.toLowerCase()) {
      await api.unsendMessage(Reply.messageID);
      const rewardCoins = 300;
      const rewardExp = 100;
      const userData = await usersData.get(author);
      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data,
      });

      return api.sendMessage(`✅ Correct, ${nameUser}!\n💰 +${rewardCoins} Coins\n🌟 +${rewardExp} EXP\nKeep it up!`, event.threadID, event.messageID);
    } else {
      Reply.attempts += 1;
      global.GoatBot.onReply.set(Reply.messageID, Reply);
      return api.sendMessage(`❌ Wrong Answer.\nAttempts left: ${maxAttempts - Reply.attempts}`, event.threadID, event.messageID);
    }
  },
};
