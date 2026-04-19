const axios = require('axios');

module.exports = {
  config: {
    name: 'ffinfo',
    aliases: ['ffinfo', 'playerinfo'],
    prefix: false,
    author: 'Rasin',
    countDown: 2,
    role: 0,
    description: 'Free Fire player info',
    category: 'game'
  },
  
  onStart: async function ({ message, args }) {
    try {
      const uid = args[0];
      if (!uid) {
        return message.reply("Please provide a uid");
      }

      const waiting = await message.reply("𝐅etching 𝐈nꜰo... 𝐏leaꜱe 𝐖ait ✨");
      
      const apiUrl = `https://rasin-hex-info.vercel.app/get?uid=${encodeURIComponent(uid)}`;
      const res = await axios.get(apiUrl);
      
      await message.unsend(waiting.messageID);

      if (!res.data.success) {
        return message.reply("𝐈nvalid 𝐔id 𝐎r 𝐏layer 𝐍ot 𝐅ound.");
      }

      const data = res.data.data;
      const basicInfo = data.basicInfo || {};
      const clanInfo = data.clanBasicInfo || {};
      const captainInfo = data.captainBasicInfo || {};
      const petInfo = data.petInfo || {};
      const socialInfo = data.socialInfo || {};
      const creditInfo = data.creditScoreInfo || {};
      
      const lang = typeof socialInfo.language === "string"
        ? socialInfo.language.replace("Language_", "")
        : socialInfo.language || 'N/A';
      
      const gender = typeof socialInfo.gender === "string"
        ? socialInfo.gender.replace("Gender_", "")
        : socialInfo.gender || 'N/A';
      
      const rankShow = typeof socialInfo.rankShow === "string"
        ? socialInfo.rankShow.replace("RankShow_", "")
        : socialInfo.rankShow || 'N/A';
      
      const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      const formatNumber = (num) => {
        if (!num) return 'N/A';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };
      
      const replyText = `
━━━━━ 𝐀ccount 𝐈nꜰo ━━━━━
❍ 𝐍ame: ${basicInfo.nickname || 'N/A'}
❍ 𝐔id: ${uid}
❍ 𝐋evel: ${basicInfo.level || 'N/A'}
❍ 𝐑egion: BD
❍ 𝐁r 𝐑ank: ${basicInfo.rank || 'N/A'}
❍ 𝐁r 𝐑ank 𝐏ointꜱ: ${formatNumber(basicInfo.rankingPoints)}
❍ 𝐂ꜱ 𝐑ank: ${basicInfo.csRank || 'N/A'}
❍ 𝐂ꜱ 𝐑ank 𝐏ointꜱ: ${formatNumber(basicInfo.csRankingPoints)}
❍ 𝐄xp: ${formatNumber(basicInfo.exp)}
❍ 𝐋ikeꜱ: ${formatNumber(basicInfo.liked)}
❍ 𝐁adgeꜱ: ${basicInfo.badgeCnt || 'N/A'}
❍ 𝐒eaꜱon 𝐈d: ${basicInfo.seasonId || 'N/A'}
❍ 𝐑eleaꜱe 𝐕erꜱion: ${basicInfo.releaseVersion || 'N/A'}
❍ 𝐂redit 𝐒core: ${creditInfo.creditScore || 'N/A'}
❍ 𝐂reated: ${formatDate(basicInfo.createAt)}
❍ 𝐋aꜱt 𝐋ogin: ${formatDate(basicInfo.lastLoginAt)}

━━━━━ 𝐏roꜰile 𝐈nꜰo ━━━━━
❍ 𝐁io: ${socialInfo.signature || 'N/A'}
❍ 𝐋anguage: ${lang}
❍ 𝐑ank 𝐒how: ${rankShow}
${socialInfo.battleTag && socialInfo.battleTag.length > 0 ? `❍ 𝐁attle 𝐓agꜱ: ${socialInfo.battleTag.map((tag, i) => tag.replace('PlayerBattleTagID_', '') + ' (' + (socialInfo.battleTagCount[i] || 0) + ')').join(', ')}` : ''}

━━━━━ 𝐂lan 𝐈nꜰo ━━━━━
❍ 𝐍ame: ${clanInfo.clanName || 'N/A'}
❍ 𝐂lan 𝐈d: ${clanInfo.clanId || 'N/A'}
❍ 𝐋evel: ${clanInfo.clanLevel || 'N/A'}
❍ 𝐌emberꜱ: ${clanInfo.memberNum || 'N/A'}/${clanInfo.capacity || 'N/A'}
❍ 𝐂aptain 𝐔id: ${clanInfo.captainId || 'N/A'}

━━━━━ 𝐂lan 𝐂aptain ━━━━━
❍ 𝐍ame: ${captainInfo.nickname || 'N/A'}
❍ 𝐔id: ${captainInfo.accountId || 'N/A'}
❍ 𝐋evel: ${captainInfo.level || 'N/A'}
❍ 𝐋ikeꜱ: ${formatNumber(captainInfo.liked)}
❍ 𝐁r 𝐑ank: ${captainInfo.rank || 'N/A'} (${formatNumber(captainInfo.rankingPoints)} pts)
❍ 𝐂ꜱ 𝐑ank: ${captainInfo.csRank || 'N/A'} (${formatNumber(captainInfo.csRankingPoints)} pts)
❍ 𝐁adgeꜱ: ${captainInfo.badgeCnt || 'N/A'}
❍ 𝐂reated: ${formatDate(captainInfo.createAt)}
❍ 𝐋aꜱt 𝐋ogin: ${formatDate(captainInfo.lastLoginAt)}

━━━━━ 𝐏et 𝐈nꜰo ━━━━━
❍ 𝐍ame: ${petInfo.petName || 'N/A'}
❍ 𝐃eꜱcription: ${petInfo.petDescription || 'N/A'}
❍ 𝐏et 𝐈d: ${petInfo.id || 'N/A'}
❍ 𝐋evel: ${petInfo.level || 'N/A'}
❍ 𝐄xp: ${petInfo.exp || 'N/A'}
❍ 𝐒kin 𝐈d: ${petInfo.skinId || 'N/A'}
❍ 𝐒elected 𝐒kill: ${petInfo.selectedSkillId || 'N/A'}
❍ 𝐈ꜱ 𝐒elected: ${petInfo.isSelected ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━
𝐏owered 𝐁y  
━━━━ ... 𝐀pi ━━━━  
𝐃eveloper: 𝗦𝗶𝘆𝗮𝗺🌸🦋 
━━━━━━━━━━━━━━━━━━━
𝐓hiꜱ 𝐌eꜱꜱage 𝐖ill 𝐁e 𝐔nꜱent 𝐈n 𝟏 𝐌inute
`;

      const infoMsg = await message.reply({ body: replyText });
      
      setTimeout(() => {
        message.unsend(infoMsg.messageID);
      }, 60000);
      
    } catch (err) {
      console.error('Error in info command:', err.message);
      
      let errorMsg = "𝐒erver 𝐄rror.";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMsg += "\n𝐏layer 𝐍ot 𝐅ound 𝐎r 𝐈nvalid 𝐔id.";
        } else if (err.response.status === 502) {
          errorMsg += "\n𝐆ame 𝐒erver 𝐔nreachable.";
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
