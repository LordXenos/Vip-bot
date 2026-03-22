const axios = require('axios');

module.exports = {
  config: {
    name: 'insta',
    aliases: ['instagram', 'iginfo'],
    prefix: false,
    author: 'Rasin',
    countDown: 2,
    role: 0,
    description: 'Instagram user info',
    category: 'Social Media'
  },
  
  onStart: async function ({ message, args }) {
    try {
      const username = args[0];
      if (!username) {
        return message.reply("Please provide a username");
      }
      
      const waiting = await message.reply("𝐒earching 𝐈nꜰo... 𝐏leaꜱe 𝐖ait ✨");
      
      const cleanUsername = username.replace('@', '');
      const apiUrl = `https://rasin-insta-info.vercel.app/api/insta?username=${encodeURIComponent(cleanUsername)}`;
      const res = await axios.get(apiUrl);
      
      await message.unsend(waiting.messageID);
      
      if (res.data.error) {
        return message.reply("𝐈nvalid 𝐔ꜱername 𝐎r 𝐔ꜱer 𝐍ot 𝐅ound.");
      }
      
      const data = res.data;
      
      const formatNumber = (num) => {
        if (!num) return 'N/A';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
      };
      
      let replyText = `
━━━━━ 𝐈nꜱtagram 𝐈nꜰo ━━━━━
❍ 𝐔ꜱername: @${data.username || 'N/A'}
❍ 𝐍ame: ${data.full_name || 'N/A'}
❍ 𝐔ꜱer 𝐈d: ${data.id || 'N/A'}
${data.biography ? `❍ 𝐁io: ${data.biography}` : ''}
━━━━━ 𝐒tatiꜱticꜱ ━━━━━
❍ 𝐅ollowerꜱ: ${formatNumber(data.followers)}
❍ 𝐅ollowing: ${formatNumber(data.following)}
❍ 𝐏oꜱtꜱ: ${formatNumber(data.posts)}
━━━━━ 𝐀ccount 𝐃etailꜱ ━━━━━
❍ 𝐏rivate: ${data.is_private ? 'Yes' : 'No'}
❍ 𝐕eriꜰied: ${data.is_verified ? 'Yes' : 'No'}
❍ 𝐁uꜱineꜱꜱ: ${data.is_business ? 'Yes' : 'No'}
${data.has_channel ? '❍ 𝐂hannel: Yes' : ''}
${data.external_url ? `❍ 𝐋ink: ${data.external_url}` : ''}`;

      if (data.facebook_url && data.facebook_name) {
        replyText += `
━━━━━ 𝐅acebook 𝐋inked ━━━━━
❍ 𝐍ame: ${data.facebook_name}
❍ 𝐋ink: ${data.facebook_url}`;
      }

      replyText += `
━━━━━━━━━━━━━━━━━━━
𝐏owered 𝐁y  
━━━━ 𝐑aꜱin 𝐀pi ━━━━  
𝐃eveloper: 𝐑aꜱin 𝐁b'𝐳 😩🫶🏻
━━━━━━━━━━━━━━━━━━━
`;

      if (data.profile_pic_url) {
        const attachment = await global.utils.getStreamFromURL(data.profile_pic_url);
        await message.reply({ 
          body: replyText, 
          attachment: attachment 
        });
      } else {
        await message.reply({ body: replyText });
      }
      
    } catch (err) {
      console.error('Error in insta command:', err.message);
      
      let errorMsg = "𝐒erver 𝐄rror.";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMsg += "\n𝐔ꜱer 𝐍ot 𝐅ound 𝐎r 𝐈nvalid 𝐔ꜱername.";
        } else if (err.response.status === 502) {
          errorMsg += "\n𝐈nꜱtagram 𝐒erver 𝐔nreachable.";
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
