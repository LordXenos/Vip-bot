const axios = require('axios');
module.exports = {
  config: {
    name: 'tcp',
    aliases: [ 'control'],
    prefix: false,
    author: 'Rasin',
    countDown: 2,
    role: 0,
    description: 'Control Rasin X Bot',
    category: 'Free Fire'
  },
  onStart: async function ({ message, args }) {
    try {
      const baseUrl = 'https://rasin-hex-pro.onrender.com';
      const action = args[0]?.toLowerCase();

      if (!action) {
        return message.reply(`
━━━━ 𝐑aꜱin 𝐗 𝐁ot 𝐂ontrol ━━━━

𝐔ꜱage:
❍ tcp join <teamcode>
❍ tcp emote <name/id> [uid]
❍ tcp group <2-6> [uid]
❍ tcp leave
❍ tcp spam <uid> [count]
❍ tcp lag <teamcode> [count]
❍ tcp info <uid>
❍ tcp status

𝐄moteꜱ:
heart, rose, king, ak, scar, mp40, m10, xm8, famas, ump, m4a1, m1887, m60, thompson

━━━━━━━━━━━━━━━━━━━━
`);
      }

      let apiUrl;
      let waitMsg;

      switch (action) {
        case 'join':
          const teamcode = args[1];
          if (!teamcode) return message.reply("𝐏rovide 𝐓eam 𝐂ode");
          waitMsg = await message.reply("𝐉oining 𝐓eam...");
          apiUrl = `${baseUrl}/join?teamcode=${teamcode}`;
          break;

        case 'emote':
          const emote = args[1];
          if (!emote) return message.reply("𝐏rovide 𝐄mote 𝐍ame/𝐈d");
          
          const emoteUid = args[2];
          waitMsg = await message.reply(emoteUid ? "𝐒ending 𝐄mote..." : "𝐒ending 𝐄mote 𝐓o 𝐒ender...");
      
          if (emoteUid) {
            apiUrl = isNaN(emote) 
              ? `${baseUrl}/emote?name=${emote}&uid=${emoteUid}`
              : `${baseUrl}/emote?id=${emote}&uid=${emoteUid}`;
          } else {
            apiUrl = isNaN(emote)
              ? `${baseUrl}/emote?name=${emote}`
              : `${baseUrl}/emote?id=${emote}`;
          }
          break;

        case 'group':
          const groupSize = args[1];
          if (!groupSize || !['2','3','4','5','6'].includes(groupSize)) {
            return message.reply("𝐕alid 𝐒ize: 2, 3, 4, 5, 6");
          }
          
          const groupUid = args[2];
          waitMsg = await message.reply("👥 𝐂reating 𝐆roup...");
          apiUrl = groupUid 
            ? `${baseUrl}/group?type=${groupSize}&uid=${groupUid}`
            : `${baseUrl}/group?type=${groupSize}`;
          break;

        case 'leave':
          waitMsg = await message.reply("𝐋eaving 𝐒quad...");
          apiUrl = `${baseUrl}/leave`;
          break;

        case 'spam':
          const spamUid = args[1];
          const spamCount = args[2] || '30';
          if (!spamUid) return message.reply("𝐏rovide 𝐔id");
          waitMsg = await message.reply(`𝐒pamming ${spamCount} 𝐈nviteꜱ...`);
          apiUrl = `${baseUrl}/spam?uid=${spamUid}&count=${spamCount}`;
          break;

        case 'lag':
          const lagTeamcode = args[1];
          const lagCount = args[2] || '500';
          if (!lagTeamcode) return message.reply("𝐏rovide 𝐓eam 𝐂ode");
          waitMsg = await message.reply(`⚡ 𝐋aunching 𝐋ag 𝐀ttack (${lagCount}x)...`);
          apiUrl = `${baseUrl}/lag?teamcode=${lagTeamcode}&count=${lagCount}`;
          break;

        case 'info':
          const infoUid = args[1];
          if (!infoUid) return message.reply("𝐏rovide 𝐔id");
          waitMsg = await message.reply("𝐒earching 𝐈nꜰo...");
          apiUrl = `${baseUrl}/info?uid=${infoUid}`;
          break;

        case 'status':
          waitMsg = await message.reply("𝐂hecking 𝐒tatuꜱ...");
          apiUrl = `${baseUrl}/status`;
          break;

        default:
          return message.reply("𝐈nvalid 𝐀ction. 𝐔ꜱe: tcp");
      }

      const res = await axios.get(apiUrl, { timeout: 30000 });
      await message.unsend(waitMsg.messageID);

      const data = res.data;
      let replyText = '';

      if (action === 'info' && data.success) {
        const account = data.data?.AccountInfo || {};
        const profile = data.data?.socialinfo || {};
        
        replyText = `
━━━━━ 𝐏layer 𝐈nꜰo ━━━━━
❍ 𝐍ame: ${account.Name || 'N/A'}
❍ 𝐔id: ${infoUid}
❍ 𝐋evel: ${account.Level || 'N/A'}
❍ 𝐑egion: ${account.Region || 'N/A'}
❍ 𝐁r 𝐑ank: ${account.BrRankPoint || 'N/A'}
❍ 𝐂ꜱ 𝐑ank: ${account.CsRankPoint || 'N/A'}
❍ 𝐋ikeꜱ: ${account.Likes || 'N/A'}
❍ 𝐁io: ${profile.signature || 'N/A'}
━━━━━━━━━━━━━━━━━━━
`;
      } else if (data.success) {
        replyText = `
❍ 𝐒ucceꜱꜱ!
`;
      } else {
        replyText = `𝐅ailed: ${data.message || 'Unknown error'}`;
      }

      const resultMsg = await message.reply({ body: replyText });

      setTimeout(() => {
        message.unsend(resultMsg.messageID);
      }, 60000);

    } catch (err) {
      console.error('Error:', err.message);
      return message.reply(`𝐄rror: ${err.message}\n𝐌aybe 𝐀pi 𝐃own 𝐎r 𝐈nvalid 𝐑equeꜱt.`);
    }
  }
};
