const axios = require("axios");
const url = `https://nusrat-is-my-mine-onlyyyyyyyyyyyyyyyy.onrender.com`;

module.exports = {
  config: {
    name: "teach",
    aliases: ['teach'],
    version: "2.0",
    author: "Rasin",
    prefix: false,
    role: 0,
    category: "Simsimi",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function({ message, event, api }) {
    await this.rasin(event.senderID, message, api);
  },

  onReply: async function({ message, event, Reply, api }) {
    if (Reply.type === "answerQ") {
      const userReply = event.body.trim();
      
      if (!userReply) {
        return message.reply("Please provide a valid answer!");
      }

      try {
        const userName = await this.getUserName(event.senderID, api);
        
        const response = await axios.get(`${url}/api/teach`, {
          params: {
            ask: Reply.qns,
            reply: userReply,
            sender: userName
          }
        });

        if (response.data.status === "success") {
          message.reply({
            body: `🧸 ⋆˚✿°───୨ᰔ୧───°✿˚ ✨🌸

✿ 𝐓𝐞𝐚𝐜𝐡𝐢𝐧𝐠 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 🥹🎀  

✦ 𝐓𝐞𝐚𝐜𝐡 ✦  
ᰔ ${Reply.qns}

✦ 𝐑𝐞𝐩𝐥𝐲 ✦  
ᰔ ${userReply}

✦ 𝐓𝐞𝐚𝐜𝐡𝐞𝐫 ✦  
🧸 ${userName}
`
          });
          
          this.rasin(event.senderID, message, api);
        } else {
          message.reply(`Failed to save: ${response.data.message || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error saving teach:", error);
        
        if (error.response && error.response.status === 403) {
          message.reply("🚫 18+ content is not allowed! Keep it clean 😒🤙🏻");
        } else if (error.response) {
          message.reply(`Error: ${error.response.data?.message || error.response.statusText}`);
        } else {
          message.reply("Error saving your answer. Try again later.");
        }
      }
    }
  },

  rasin: async function(userID, message, api) {
    try {
      const res = await axios.get(`${url}/api/qns`);
      
      if (res.data.status === "error") {
        return message.reply(`❌ ${res.data.message}`);
      }

      const qns = res.data.question;
      const available = res.data.available_qns || 0;
      const teacher = res.data.teacher || "Anonymous";

      message.reply({
        body: `🧸🎀 ⋆˚✿°────୨ᰔ୧────°✿˚ ✨🌸

❓ 𝐘𝐨𝐮𝐫 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧  

${qns}


✦ 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧 : ${available.toLocaleString()} 
 
🎀 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫
`
      }, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "answerQ",
            author: userID,
            qns: qns,
            messageID: info.messageID
          });
        }
      });
    } catch (err) {
      console.error("Error:", err);
      message.reply("Error.. Please try again later.");
    }
  },

  getUserName: async function(userID, api) {
    try {
      const userInfo = await api.getUserInfo(userID);
      return userInfo[userID]?.name || "Anonymous";
    } catch {
      return "Anonymous";
    }
  }
};
