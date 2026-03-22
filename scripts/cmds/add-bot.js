const axios = require('axios');

module.exports = {
  config: {
    name: 'add-tcp',
    aliases: ['...addfriend', 'addtcp'],
    prefix: false,
    author: 'Rasin',
    countDown: 3,
    role: 0,
    description: 'Add friend to Free Fire account',
    category: 'Free Fire'
  },
  onStart: async function ({ message, args, event }) {
    try {
      if (args.length < 1) {
        return message.reply("❌ Please provide a UID to add\n\n📝 Usage: add-tcp <uid>");
      }

      const friendUid = args[0];
      const waiting = await message.reply("𝐀dding 𝐅riend... 𝐏leaꜱe 𝐖ait ✨");

      const uid = "4199274871";
      const password = "ACA03CF93B5FD2909D1E2BEAFB155FBA3E808BADDB6FAC047CDE7AF4D8A19936";
      
      const apiUrl = `https://danger-add-friend.vercel.app/adding_friend?uid=${uid}&password=${password}&friend_uid=${encodeURIComponent(friendUid)}`;

      const res = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      message.unsend(waiting.messageID);
      const data = res.data;

      if (data.status === 'success') {
        const replyText = `
━━━━━ 𝐅riend 𝐀dded ━━━━━
❍ 𝐀ction: ${data.action}
❍ 𝐅riend 𝐔id: ${data.friend_uid}
❍ 𝐘our 𝐔id: ${data.your_uid}
❍ 𝐑egion: ${data.your_region}
━━━━━━━━━━━━━━━━━━━
❍ ${data.message}
━━━━━━━━━━━━━━━━━━━
𝐏owered 𝐁y  
━━━━ 𝐑aꜱin 𝐀pi ━━━━  
𝐃eveloper: 𝐑aꜱin 𝐁b'𝐳 😩🫶🏻
        `;
        return message.reply(replyText);
      } else {
        return message.reply(`❌ Failed to add friend\n\n${data.message || 'Unknown error'}`);
      }

    } catch (err) {
      console.error(err);
      return message.reply(`❌ 𝐄rror 𝐎ccurred: ${err.message}`);
    }
  }
};
