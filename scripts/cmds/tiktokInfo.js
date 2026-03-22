const axios = require('axios');

module.exports = {
  config: {
    name: 'tiktok',
    aliases: ['ttinfo', 'tiktokinfo'],
    prefix: false,
    author: 'Rasin',
    countDown: 2,
    role: 0,
    description: 'TikTok user info',
    category: 'Social Media'
  },
  
  onStart: async function ({ message, args }) {
    try {
      const username = args[0];
      if (!username) {
        return message.reply("Please provide a TikTok username");
      }

      const waiting = await message.reply("𝐒earching 𝐓iktok 𝐈nꜰo... 𝐏leaꜱe 𝐖ait ✨");
      
      const cleanUsername = username.replace('@', '');
      const apiUrl = `https://rasin-hex-tiktok-info.vercel.app/api/info?username=${encodeURIComponent(cleanUsername)}`;
      const res = await axios.get(apiUrl);
      
      await message.unsend(waiting.messageID);

      if (!res.data.success) {
        return message.reply("𝐈nvalid 𝐔ꜱername 𝐎r 𝐔ꜱer 𝐍ot 𝐅ound.");
      }

      const data = res.data.data;
      
      const replyText = `
━━━━━ 𝐓iktok 𝐈nꜰo ━━━━━
❍ 𝐔ꜱername: ${data.username || 'N/A'}
❍ 𝐍ame: ${data.name || 'N/A'}
❍ 𝐔ꜱer 𝐈d: ${data.id || 'N/A'}
❍ 𝐑egion: ${data.region || 'N/A'}
❍ 𝐁io: ${data.bio || 'N/A'}

━━━━━ 𝐒tatiꜱticꜱ ━━━━━
❍ 𝐅ollowerꜱ: ${data.followers || 'N/A'}
❍ 𝐅ollowing: ${data.following || 'N/A'}
❍ 𝐋ikeꜱ: ${data.likes || 'N/A'}
❍ 𝐕ideoꜱ: ${data.videos || 'N/A'}

━━━━━ 𝐀ccount 𝐃etailꜱ ━━━━━
❍ 𝐂reated: ${data.accountCreated || 'N/A'}

━━━━━━━━━━━━━━━━━━━
𝐏owered 𝐁y  
━━━━ 𝐑aꜱin 𝐀pi ━━━━  
𝐃eveloper: 𝐑aꜱin 𝐁b'𝐳 😩🫶🏻
━━━━━━━━━━━━━━━━━━━
`;

      await message.reply({ body: replyText });
      
    } catch (err) {
      console.error('Error in tiktok command:', err.message);
      
      let errorMsg = "𝐒erver 𝐄rror.";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMsg += "\n𝐔ꜱer 𝐍ot 𝐅ound 𝐎r 𝐈nvalid 𝐔ꜱername.";
        } else if (err.response.status === 502) {
          errorMsg += "\n𝐓iktok 𝐒erver 𝐔nreachable.";
        } else if (err.response.status === 500) {
          errorMsg += "\n𝐒erver 𝐄rror. 𝐏leaꜱe 𝐓ry 𝐀gain 𝐋ater.";
        }
      } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        errorMsg += "\n𝐑eϙueꜱt 𝐓imed 𝐎ut.";
      } else {
        errorMsg += "\n𝐌aybe 𝐀pi 𝐋imit 𝐑eached 𝐎r 𝐍etwork 𝐄rror.";
      }
      
      return message.reply(errorMsg);
    }
  }
};
