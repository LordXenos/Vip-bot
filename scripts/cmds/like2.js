const axios = require('axios');

const cooldowns = new Map();

const apix = `https://arshi-secret-like.onrender.com`

// mode Configuration = 'maintenance', 'normal', or 'fun'
const mode = 'normal';

module.exports = {
  config: {
    name: 'yoyoyoyoyo',
    author: 'Rasin',
    cooldown: 2,
    role: 0,
    prefix: false,
    description: 'Send likes to Free Fire player profiles',
    category: 'Free Fire',
    usage: 'like <uid>'
  },

  onStart: async function({ event, args, message, api }) {
    try {
      if (mode === 'maintenance') {
        return message.reply(
          `𝐌ᴀɪɴᴛᴇɴᴀɴᴄᴇ\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n\n` +
          `𝐓ʜᴇ 𝐅ʀᴇᴇ 𝐅ɪʀᴇ 𝐋ɪᴋᴇ 𝐀ᴘɪ 𝐈ꜱ 𝐂ᴜʀʀᴇɴᴛʟʏ 𝐔ɴᴅᴇʀ 𝐌ᴀɪɴᴛᴇɴᴀɴᴄᴇ\n\n` +
          `𝐖ᴇ'ʟʟ 𝐁ᴇ 𝐁ᴀᴄᴋ 𝐒ᴏᴏɴ\n\n` +
          `𝐒ᴛᴀʏ 𝐓ᴜɴᴇᴅ 𝐅ᴏʀ 𝐔ᴘᴅᴀᴛᴇꜱ\n\n` +
          `━━━━━━━━━━━━━━━━━━━`
        );
      }

      if (args.length < 1) {
        return message.reply(`𝐏ʟᴇᴀꜱᴇ 𝐏ʀᴏᴠɪᴅᴇ 𝐀 𝐔ɪᴅ`);
      }

      const uid = args[0];
      
      if (!/^\d+$/.test(uid)) {
        return message.reply("𝐈ɴᴠᴀʟɪᴅ 𝐔ɪᴅ! 𝐏ʟᴇᴀꜱᴇ 𝐄ɴᴛᴇʀ 𝐍ᴜᴍʙᴇʀꜱ 𝐎ɴʟʏ.");
      }

      if (mode === 'normal') {
        const key = `${event.senderID}_${uid}`;
        const now = Date.now();
        const cooldownTime = 12 * 60 * 60 * 1000;

        if (cooldowns.has(key)) {
          const lastUsed = cooldowns.get(key);
          const timeLeft = cooldownTime - (now - lastUsed);
          
          if (timeLeft > 0) {
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            return message.reply(
              `𝐂ᴏᴏʟᴅᴏᴡɴ 𝐀ᴄᴛɪᴠᴇ\n\n` +
              `━━━━━━━━━━━━━━━━━━━\n\n` +
              `𝐓ɪᴍᴇ 𝐑ᴇᴍᴀɪɴɪɴɢ: ${hoursLeft}ʜ ${minutesLeft}ᴍ\n\n` +
              `𝐘ᴏᴜ 𝐂ᴀɴ 𝐎ɴʟʏ 𝐒ᴇɴᴅ 𝐋ɪᴋᴇꜱ 𝐓ᴏ 𝐓ʜᴇ 𝐒ᴀᴍᴇ 𝐔ɪᴅ 𝐎ɴᴄᴇ 𝐄ᴠᴇʀʏ 𝟏𝟐 𝐇ᴏᴜʀꜱ\n\n` +
              `𝐓ʀʏ 𝐀 𝐃ɪꜰꜰᴇʀᴇɴᴛ 𝐔ɪᴅ 𝐎ʀ 𝐖ᴀɪᴛ 𝐅ᴏʀ 𝐓ʜᴇ 𝐂ᴏᴏʟᴅᴏᴡɴ 𝐓ᴏ 𝐄ɴᴅ\n\n` +
              `━━━━━━━━━━━━━━━━━━━`
            );
          }
        }
      }

      const waiting = await message.reply(
        `𝐏ʀᴏᴄᴇꜱꜱɪɴɢ 𝐘ᴏᴜʀ 𝐑ᴇϙᴜᴇꜱᴛ...\n`
      );

      // ============== NORMAL MODE ==============
      if (mode === 'normal') {
        const apiUrl = `${apix}/like?uid=${encodeURIComponent(uid)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        
        message.unsend(waiting.messageID);

        const data = response.data;

        if (!data.success) {
          if (data.status === -1 || (data.ban_info && data.ban_info.account_status === "Banned ⛔")) {
            const banInfo = data.ban_info || {};
            const contact = data.contact || {};

            const infoUrl = `https://rasin-hex-info.vercel.app/get?uid=${encodeURIComponent(uid)}`;
             const response = await axios.get(infoUrl, { timeout: 30000 });
             const data1 = response.data;
            if (!data1.success || !data1.data || !data1.data.basicInfo) {
          return message.reply(
            `𝐅ᴀɪʟᴇᴅ 𝐓ᴏ 𝐅ᴇᴛᴄʜ 𝐏ʟᴀʏᴇʀ 𝐈ɴꜰᴏʀᴍᴀᴛɪᴏɴ\n\n` +
            `𝐏ʟᴇᴀꜱᴇ 𝐂ʜᴇᴄᴋ 𝐓ʜᴇ 𝐔ɪᴅ 𝐀ɴᴅ 𝐓ʀʏ 𝐀ɢᴀɪɴ.\n` +
            `━━━━━━━━━━━━━━━━━━━`
          );
        }
              

           const basicInfo = data1.data.basicInfo;

            return message.reply(
              `🚫 𝐀ᴄᴄᴏᴜɴᴛ 𝐁ᴀɴɴᴇᴅ 🚫\n\n` +
              `━━━━━━━━━━━━━━━━━━━\n\n` +
              `𝐍ᴀᴍᴇ: ${basicInfo.nickname || 'Unknown'}\n`+
              `𝐒ᴛᴀᴛᴜꜱ: ${banInfo.account_status || 'Banned ⛔'}\n` +
              `𝐑ᴇᴀꜱᴏɴ: ${banInfo.reason || 'Account violated terms of service'}\n\n` +
              `𝐘ᴏᴜʀ 𝐔ɪᴅ 𝐇ᴀꜱ 𝐁ᴇᴇɴ 𝐁ᴀɴɴᴇᴅ 𝐅ʀᴏᴍ 𝐔ꜱɪɴɢ 𝐓ʜɪꜱ 𝐒ᴇʀᴠɪᴄᴇ\n\n` +
              `━━━━━━━━━━━━━━━━━━━\n\n` +
              `𝐈ꜰ 𝐘ᴏᴜ 𝐁ᴇʟɪᴇᴠᴇ 𝐓ʜɪꜱ 𝐈ꜱ 𝐀 𝐌ɪꜱᴛᴀᴋᴇ:\n` +
              `𝐂ᴏɴᴛᴀᴄᴛ: ${contact.developer || 'Rasin'}\n` +
              `𝐅ᴀᴄᴇʙᴏᴏᴋ: ${contact.facebook || 'Rasin Bb\'z'}\n` +
              `━━━━━━━━━━━━━━━━━━━`
            );
          }

          if (data.message && data.message.includes("Daily limit reached")) {
            return message.reply(
              `𝐃ᴀɪʟʏ 𝐋ɪᴍɪᴛ 𝐑ᴇᴀᴄʜᴇᴅ\n\n` +
              `━━━━━━━━━━━━━━━━━━━\n\n` +
              `𝐋ɪᴋᴇꜱ 𝐔ꜱᴇᴅ: ${data.upgrade_info?.likes_used || 'N/A'}/${data.upgrade_info?.limit || 'N/A'}\n` +
              `𝐑ᴇꜱᴇᴛ 𝐈ɴ: ${data.upgrade_info?.reset_in || 'N/A'}\n\n` +
              `𝐖ᴀɴᴛ 𝐔ɴʟɪᴍɪᴛᴇᴅ 𝐋ɪᴋᴇꜱ? 𝐂ᴏɴᴛᴀᴄᴛ 𝐓ʜᴇ 𝐃ᴇᴠᴇʟᴏᴘᴇʀ 𝐅ᴏʀ 𝐏ʀᴇᴍɪᴜᴍ 𝐀ᴄᴄᴇꜱꜱ\n\n` +
              `𝐃ᴇᴠᴇʟᴏᴘᴇʀ: ${data.contact?.developer || 'Rasin'}\n` +
              `𝐅ᴀᴄᴇʙᴏᴏᴋ: ${data.contact?.facebook || 'Rasin Bb\'z'}\n` +
              `━━━━━━━━━━━━━━━━━━━`
            );
          }
          
          return message.reply(
            `𝐅ᴀɪʟᴇᴅ 𝐓ᴏ 𝐒ᴇɴᴅ 𝐋ɪᴋᴇꜱ\n\n` +
            `𝐄ʀʀᴏʀ: ${data.error || data.message || 'Unknown error'}\n` +
            `━━━━━━━━━━━━━━━━━━━`
          );
        }

        const playerInfo = data.player_info;
        const result = data.result
        
        if (!playerInfo || !result) {
          return message.reply("𝐅ᴀɪʟᴇᴅ 𝐓ᴏ 𝐅ᴇᴛᴄʜ 𝐏ʟᴀʏᴇʀ 𝐈ɴꜰᴏʀᴍᴀᴛɪᴏɴ. 𝐏ʟᴇᴀꜱᴇ 𝐂ʜᴇᴄᴋ 𝐓ʜᴇ 𝐔ɪᴅ 𝐀ɴᴅ 𝐓ʀʏ 𝐀ɢᴀɪɴ.");
        }

        const key = `${event.senderID}_${uid}`;
        const now = Date.now();
        cooldowns.set(key, now);

        const isPremium = data.account_type === "Pʀᴇᴍɪᴜᴍ ⭐" || data.premium_status;
        
        let replyText = `━━━━━ 𝐏ʟᴀʏᴇʀ 𝐈ɴꜰᴏ ━━━━━\n`;
        replyText += `֎ 𝐍ᴀᴍᴇ: ${playerInfo.nickname || 'Unknown'}\n`;
        replyText += `֎ 𝐔ɪᴅ: ${playerInfo.uid || uid}\n`;
        replyText += `֎ 𝐑ᴇɢɪᴏɴ: ${playerInfo.region || 'Bangladesh'}\n`;
        replyText += `֎ 𝐀ᴄᴄᴏᴜɴᴛ: ${isPremium ? '𝐏ʀᴇᴍɪᴜᴍ ⭐' : '𝐅ʀᴇᴇ'}\n\n`;

        replyText += `━━━━━ 𝐋ɪᴋᴇ 𝐒ᴇɴᴅ 𝐑ᴇꜱᴜʟᴛ ━━━━━\n`;
        replyText += `❍ 𝐀ᴅᴅᴇᴅ 𝐋ɪᴋᴇꜱ: ${result.likes_added || 0}\n`;
        replyText += `❍ 𝐁ᴇꜰᴏʀᴇ 𝐋ɪᴋᴇꜱ: ${result.likes_before || 0}\n`;
        replyText += `❍ 𝐀ꜰᴛᴇʀ 𝐋ɪᴋᴇꜱ: ${result.likes_after || 0}\n\n`;

        if (isPremium) {
          replyText += `━━━━━ 𝐏ʀᴇᴍɪᴜᴍ 𝐀ᴄᴄᴏᴜɴᴛ ━━━━━\n`;
          replyText += `❏ 𝐍ᴏ 𝐃ᴀɪʟʏ 𝐋ɪᴍɪᴛꜱ\n`;
          replyText += `❏ 𝐍ᴏ 𝐂ᴏᴏʟᴅᴏᴡɴ\n\n`;
        } else {
          const usage = data.usage;
          if (usage) {
            replyText += `━━━━━ 𝐔ꜱᴀɢᴇ 𝐒ᴛᴀᴛꜱ ━━━━━\n`;
            replyText += `𝐔ꜱᴇᴅ 𝐓ᴏᴅᴀʏ: ${usage.likes_used_today}/${usage.daily_limit}\n`;
            replyText += `𝐑ᴇᴍᴀɪɴɪɴɢ: ${usage.remaining}\n`;
            replyText += `𝐑ᴇꜱᴇᴛ 𝐈ɴ: ${usage.reset_in}\n\n`;
            
            replyText += `━━━━━ 𝐏ʀᴇᴍɪᴜᴍ 𝐓ɪᴘ ━━━━━\n`;
            replyText += `𝐔ᴘɢʀᴀᴅᴇ 𝐓ᴏ 𝐏ʀᴇᴍɪᴜᴍ 𝐅ᴏʀ:\n\n`;
            replyText += `❍ 𝐔ɴʟɪᴍɪᴛᴇᴅ 𝐃ᴀɪʟʏ 𝐋ɪᴋᴇꜱ\n`;
            replyText += `❍ 𝐍ᴏ 𝐂ᴏᴏʟᴅᴏᴡɴ 𝐑ᴇꜱᴛʀɪᴄᴛɪᴏɴꜱ\n`;
            replyText += `❍ 𝐅ᴀꜱᴛᴇʀ 𝐏ʀᴏᴄᴇꜱꜱɪɴɢ\n`;
            replyText += `❍ 𝐏ʀɪᴏʀɪᴛʏ 𝐒ᴜᴘᴘᴏʀᴛ\n\n`;
            replyText += `𝐂ᴏɴᴛᴀᴄᴛ 𝐑ᴀꜱɪɴ 𝐅ᴏʀ 𝐏ʀᴇᴍɪᴜᴍ!\n\n`;
          }
        }

        const contact = data.contact || data.developer;
        if (contact) {
          replyText += `━━━━━━━━━━━━━━━━━━━\n`;
          replyText += `𝐏ᴏᴡᴇʀᴇᴅ 𝐁ʏ\n`;
          replyText += `━━━━━ 𝐑ᴀꜱɪɴ 𝐀ᴘɪ ━━━━━\n`;
          replyText += `𝐃ᴇᴠᴇʟᴏᴘᴇʀ: ${contact.name || contact.developer || 'Rasin Bb\'z'}\n`;
        }

        return message.reply(replyText);
      }

      // ============== FUN MODE (FAKE LIKES) ==============
      if (mode === 'fun') {
        const infoUrl = `https://rasin-hex-info.vercel.app/get?uid=${encodeURIComponent(uid)}`;
        const response = await axios.get(infoUrl, { timeout: 30000 });
        
        message.unsend(waiting.messageID);

        const data = response.data;

        if (!data.success || !data.data || !data.data.basicInfo) {
          return message.reply(
            `𝐅ᴀɪʟᴇᴅ 𝐓ᴏ 𝐅ᴇᴛᴄʜ 𝐏ʟᴀʏᴇʀ 𝐈ɴꜰᴏʀᴍᴀᴛɪᴏɴ\n\n` +
            `𝐏ʟᴇᴀꜱᴇ 𝐂ʜᴇᴄᴋ 𝐓ʜᴇ 𝐔ɪᴅ 𝐀ɴᴅ 𝐓ʀʏ 𝐀ɢᴀɪɴ.\n` +
            `━━━━━━━━━━━━━━━━━━━`
          );
        }

        const basicInfo = data.data.basicInfo;
        const currentLikes = basicInfo.liked || 0;
        
        const fakeLikesAdded = Math.floor(Math.random() * (10000 - 300 + 1)) + 300;
        const newLikes = currentLikes + fakeLikesAdded;

        let replyText = `━━━━━ 𝐏ʟᴀʏᴇʀ 𝐈ɴꜰᴏ ━━━━━\n`;
        replyText += `𝐍ᴀᴍᴇ: ${basicInfo.nickname || 'Unknown'}\n`;
        replyText += `𝐔ɪᴅ: ${basicInfo.accountId || uid}\n`;
        replyText += `𝐑ᴇɢɪᴏɴ: ${basicInfo.region || 'Unknown'}\n`;
        replyText += `𝐋ᴇᴠᴇʟ: ${basicInfo.level || 'N/A'}\n`;
        replyText += `𝐑ᴀɴᴋ: ${basicInfo.rank || 'N/A'}\n\n`;

        replyText += `━━━━━ 𝐋ɪᴋᴇ 𝐒ᴇɴᴅ 𝐑ᴇꜱᴜʟᴛ ━━━━━\n`;
        replyText += `𝐀ᴅᴅᴇᴅ 𝐋ɪᴋᴇꜱ: ${fakeLikesAdded}\n`;
        replyText += `𝐁ᴇꜰᴏʀᴇ 𝐋ɪᴋᴇꜱ: ${currentLikes}\n`;
        replyText += `𝐀ꜰᴛᴇʀ 𝐋ɪᴋᴇꜱ: ${newLikes}\n\n`;

        replyText += `━━━━━ 𝐒ᴛᴀᴛᴜꜱ ━━━━━\n`;
        replyText += `✅ 𝐋ɪᴋᴇꜱ 𝐒ᴇɴᴛ 𝐒ᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ!\n`;
        replyText += `⚡ 𝐏ʀᴏᴄᴇꜱꜱᴇᴅ 𝐈ɴ ${(Math.random() * (2.5 - 1.2) + 1.2).toFixed(2)}ꜱ\n\n`;

        replyText += `━━━━━━━━━━━━━━━━━━━\n`;
        replyText += `𝐏ᴏᴡᴇʀᴇᴅ 𝐁ʏ\n`;
        replyText += `━━━━━ 𝐑ᴀꜱɪɴ 𝐀ᴘɪ ━━━━━\n`;
        replyText += `𝐃ᴇᴠᴇʟᴏᴘᴇʀ: Rasin Bb'z\n`;

        return message.reply(replyText);
      }

    } catch (err) {
      console.error("Like command error:", err);
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        return message.reply(
          `𝐑ᴇϙᴜᴇꜱᴛ 𝐓ɪᴍᴇᴅ 𝐎ᴜᴛ\n\n` +
          `𝐓ʜᴇ 𝐀ᴘɪ 𝐈ꜱ 𝐓ᴀᴋɪɴɢ 𝐓ᴏᴏ 𝐋ᴏɴɢ 𝐓ᴏ 𝐑ᴇꜱᴘᴏɴᴅ. 𝐏ʟᴇᴀꜱᴇ 𝐓ʀʏ 𝐀ɢᴀɪɴ 𝐈ɴ 𝐀 𝐅ᴇᴡ 𝐌ᴏᴍᴇɴᴛꜱ.\n` +
          `━━━━━━━━━━━━━━━━━━━`
        );
      }
      
      if (err.response) {
        return message.reply(
          `𝐀ᴘɪ 𝐄ʀʀᴏʀ\n\n` +
          `𝐒ᴛᴀᴛᴜꜱ: ${err.response.status}\n` +
          `𝐌ᴇꜱꜱᴀɢᴇ: ${err.response.data?.error || 'Unknown error'}\n` +
          `━━━━━━━━━━━━━━━━━━━`
        );
      }
      
      return message.reply(
        `𝐀ɴ 𝐔ɴᴇxᴘᴇᴄᴛᴇᴅ 𝐄ʀʀᴏʀ 𝐎ᴄᴄᴜʀʀᴇᴅ\n\n` +
        `𝐓ʜᴇ 𝐀ᴘɪ 𝐌ɪɢʜᴛ 𝐁ᴇ 𝐔ɴᴅᴇʀ 𝐌ᴀɪɴᴛᴇɴᴀɴᴄᴇ 𝐎ʀ 𝐓ᴇᴍᴘᴏʀᴀʀɪʟʏ 𝐔ɴᴀᴠᴀɪʟᴀʙʟᴇ.\n` +
        `𝐏ʟᴇᴀꜱᴇ 𝐓ʀʏ 𝐀ɢᴀɪɴ 𝐋ᴀᴛᴇʀ.\n` +
        `━━━━━━━━━━━━━━━━━━━`
      );
    }
  }
};