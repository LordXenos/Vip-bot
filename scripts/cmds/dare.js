module.exports = {
  config: {
    name: 'dare',
    author: 'Rasin',
    countDown: 3,
    role: 0,
    prefix: true,
    description: 'Get a random dare',
    category: 'fun',
    guide: {
      en: '{pn} or {pn} @mention or {pn} (reply to message)'
    }
  },

  onStart: async function({ event, message, usersData }) {
    try {
      let targetName;
      
      if (event.messageReply) {
        targetName = await usersData.getName(event.messageReply.senderID);
      } 
      else if (Object.keys(event.mentions || {}).length > 0) {
        const mentionId = Object.keys(event.mentions)[0];
        targetName = await usersData.getName(mentionId);
      } 
      else {
        targetName = await usersData.getName(event.senderID);
      }

      const dares = [
        '𝐒ᴇɴᴅ 𝐀 ꜰʟɪʀᴛʏ 𝐦ᴇꜱꜱᴀɢᴇ 𝐭ᴏ ʏᴏᴜʀ ᴄʀᴜꜱʜ!',
        '𝐂ʜᴀɴɢᴇ ʏᴏᴜʀ ɴᴀᴍᴇ ᴛᴏ "𝐈\'ᴍ 𝐒ɪɴɢʟᴇ" ꜰᴏʀ 24 ʜᴏᴜʀꜱ!',
        '𝐏ᴏꜱᴛ ᴀ ꜱᴇʟꜰɪᴇ ᴡɪᴛʜ ᴀ ꜰᴜɴɴʏ ꜰᴀᴄᴇ!',
        '𝐓ᴇʟʟ ʏᴏᴜʀ ʙɪɢɢᴇꜱᴛ ꜱᴇᴄʀᴇᴛ!',
        '𝐃ᴀɴᴄᴇ ᴡɪᴛʜᴏᴜᴛ ᴍᴜꜱɪᴄ ꜰᴏʀ 1 ᴍɪɴᴜᴛᴇ!',
        '𝐂ᴀʟʟ ʏᴏᴜʀ ᴄʀᴜꜱʜ ᴀɴᴅ ꜱᴀʏ "𝐈 ʟᴏᴠᴇ ʏᴏᴜ"!',
        '𝐏ᴏꜱᴛ "𝐈\'ᴍ ɪɴ ʟᴏᴠᴇ ᴡɪᴛʜ ᴍʏ ʙᴇꜱᴛ ꜰʀɪᴇɴᴅ" ᴏɴ ʏᴏᴜʀ ꜱᴛᴀᴛᴜꜱ!',
        '𝐒ɪɴɢ ᴀ ʟᴏᴠᴇ ꜱᴏɴɢ ᴀɴᴅ ꜱᴇɴᴅ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ!',
        '𝐂ᴏɴꜰᴇꜱꜱ ʏᴏᴜʀ ꜰᴇᴇʟɪɴɢꜱ ᴛᴏ ꜱᴏᴍᴇᴏɴᴇ!',
        '𝐂ʜᴀɴɢᴇ ʏᴏᴜʀ ᴘʀᴏꜰɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴛᴏ ᴀ ꜰᴜɴɴʏ ᴍᴇᴍᴇ!',
        '𝐓ᴇxᴛ ʏᴏᴜʀ ᴇx ᴀɴᴅ ꜱᴀʏ "𝐈 ᴍɪꜱꜱ ʏᴏᴜ"!',
        '𝐏ᴏꜱᴛ ᴀ ᴄʜɪʟᴅʜᴏᴏᴅ ᴘʜᴏᴛᴏ ᴏꜰ ʏᴏᴜʀꜱᴇʟꜰ!',
        '𝐃ᴏ 20 ᴘᴜꜱʜ-ᴜᴘꜱ ʀɪɢʜᴛ ɴᴏᴡ!',
        '𝐒ᴘᴇᴀᴋ ɪɴ ᴀɴ ᴀᴄᴄᴇɴᴛ ꜰᴏʀ 10 ᴍɪɴᴜᴛᴇꜱ!',
        '𝐋ɪᴋᴇ ᴀʟʟ ʏᴏᴜʀ ᴄʀᴜꜱʜ\'ꜱ ᴘᴏꜱᴛꜱ!'
      ];

      const randomDare = dares[Math.floor(Math.random() * dares.length)];
      
      const replyMsg = 
        `🎲 Dare Challenge 🎲\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `👤 ${targetName}\n\n` +
        `${randomDare}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `Will you accept the dare? 😏`;

      return message.reply(replyMsg);

    } catch (error) {
      console.error('Dare command error:', error);
      return message.reply('❌ An error occurred!');
    }
  }
};