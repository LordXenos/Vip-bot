module.exports = {
  config: {
    name: 'truth',
    author: 'Rasin',
    countDown: 3,
    role: 0,
    prefix: true,
    description: 'Get a random truth question',
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

      const truths = [
        '𝐖ʜᴏ ᴡᴀꜱ ʏᴏᴜʀ ꜰɪʀꜱᴛ ᴄʀᴜꜱʜ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ᴍᴏꜱᴛ ᴇᴍʙᴀʀʀᴀꜱꜱɪɴɢ ᴛʜɪɴɢ ʏᴏᴜ\'ᴠᴇ ᴅᴏɴᴇ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ʟɪᴇᴅ ᴛᴏ ʏᴏᴜʀ ʙᴇꜱᴛ ꜰʀɪᴇɴᴅ?',
        '𝐖ʜᴀᴛ\'ꜱ ʏᴏᴜʀ ʙɪɢɢᴇꜱᴛ ꜱᴇᴄʀᴇᴛ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ʜᴀᴅ ᴀ ᴄʀᴜꜱʜ ᴏɴ ᴀ ꜰʀɪᴇɴᴅ\'ꜱ ᴘᴀʀᴛɴᴇʀ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ᴍᴏꜱᴛ ᴄʜɪʟᴅɪꜱʜ ᴛʜɪɴɢ ʏᴏᴜ ꜱᴛɪʟʟ ᴅᴏ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ᴄʜᴇᴀᴛᴇᴅ ᴏɴ ꜱᴏᴍᴇᴏɴᴇ?',
        '𝐖ʜᴀᴛ\'ꜱ ʏᴏᴜʀ ʙɪɢɢᴇꜱᴛ ꜰᴇᴀʀ?',
        '𝐖ʜᴏ ᴅᴏ ʏᴏᴜ ʜᴀᴠᴇ ᴀ ᴄʀᴜꜱʜ ᴏɴ ʀɪɢʜᴛ ɴᴏᴡ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ᴡᴏʀꜱᴛ ᴛʜɪɴɢ ʏᴏᴜ\'ᴠᴇ ᴇᴠᴇʀ ᴅᴏɴᴇ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ꜱᴛᴀʟᴋᴇᴅ ꜱᴏᴍᴇᴏɴᴇ ᴏɴ ꜱᴏᴄɪᴀʟ ᴍᴇᴅɪᴀ?',
        '𝐖ʜᴀᴛ\'ꜱ ʏᴏᴜʀ ᴍᴏꜱᴛ ᴇᴍʙᴀʀʀᴀꜱꜱɪɴɢ ɴɪᴄᴋɴᴀᴍᴇ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ʜᴀᴅ ᴀ ʀᴏᴍᴀɴᴛɪᴄ ᴅʀᴇᴀᴍ ᴀʙᴏᴜᴛ ꜱᴏᴍᴇᴏɴᴇ ʜᴇʀᴇ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ᴍᴏꜱᴛ ᴇxᴘᴇɴꜱɪᴠᴇ ᴛʜɪɴɢ ʏᴏᴜ\'ᴠᴇ ꜱᴛᴏʟᴇɴ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ᴘʀᴇᴛᴇɴᴅᴇᴅ ᴛᴏ ʙᴇ ꜱɪᴄᴋ ᴛᴏ ꜱᴋɪᴘ ꜱᴄʜᴏᴏʟ/ᴡᴏʀᴋ?',
        '𝐖ʜᴀᴛ\'ꜱ ʏᴏᴜʀ ᴡᴇɪʀᴅᴇꜱᴛ ʜᴀʙɪᴛ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ʙᴇᴇɴ ɪɴ ʟᴏᴠᴇ ᴡɪᴛʜ ᴛᴡᴏ ᴘᴇᴏᴘʟᴇ ᴀᴛ ᴏɴᴄᴇ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ʟᴀꜱᴛ ʟɪᴇ ʏᴏᴜ ᴛᴏʟᴅ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ꜱɴᴏᴏᴘᴇᴅ ᴛʜʀᴏᴜɢʜ ꜱᴏᴍᴇᴏɴᴇ\'ꜱ ᴘʜᴏɴᴇ?',
        '𝐖ʜᴀᴛ\'ꜱ ʏᴏᴜʀ ᴍᴏꜱᴛ ɪʀʀᴀᴛɪᴏɴᴀʟ ꜰᴇᴀʀ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ʙᴀᴅᴍᴏᴜᴛʜᴇᴅ ᴀ ꜰʀɪᴇɴᴅ ʙᴇʜɪɴᴅ ᴛʜᴇɪʀ ʙᴀᴄᴋ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ᴍᴏꜱᴛ ᴊᴇᴀʟᴏᴜꜱ ʏᴏᴜ\'ᴠᴇ ᴇᴠᴇʀ ʙᴇᴇɴ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ᴘʀᴇᴛᴇɴᴅᴇᴅ ᴛᴏ ʟɪᴋᴇ ᴀ ɢɪꜰᴛ ʏᴏᴜ ʜᴀᴛᴇᴅ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ᴍᴏꜱᴛ ɪᴍᴍᴀᴛᴜʀᴇ ᴛʜɪɴɢ ʏᴏᴜʀ ᴘᴀʀᴇɴᴛꜱ ꜱᴛɪʟʟ ᴅᴏ ꜰᴏʀ ʏᴏᴜ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ᴘʀᴀᴄᴛɪᴄᴇᴅ ᴋɪꜱꜱɪɴɢ ɪɴ ᴀ ᴍɪʀʀᴏʀ?',
        '𝐖ʜᴀᴛ\'ꜱ ʏᴏᴜʀ ɢᴜɪʟᴛɪᴇꜱᴛ ᴘʟᴇᴀꜱᴜʀᴇ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ʜᴀᴅ ᴀ ᴄʀᴜꜱʜ ᴏɴ ᴀ ᴛᴇᴀᴄʜᴇʀ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ᴍᴏꜱᴛ ᴄʀɪɴɢᴇ ᴛʜɪɴɢ ʏᴏᴜ\'ᴠᴇ ᴅᴏɴᴇ ꜰᴏʀ ᴀᴛᴛᴇɴᴛɪᴏɴ?',
        '𝐇ᴀᴠᴇ ʏᴏᴜ ᴇᴠᴇʀ ʀᴇᴀᴅ ꜱᴏᴍᴇᴏɴᴇ\'ꜱ ᴅɪᴀʀʏ?',
        '𝐖ʜᴀᴛ\'ꜱ ᴛʜᴇ ʟᴏɴɢᴇꜱᴛ ʏᴏᴜ\'ᴠᴇ ɢᴏɴᴇ ᴡɪᴛʜᴏᴜᴛ ꜱʜᴏᴡᴇʀɪɴɢ?'
      ];

      const randomTruth = truths[Math.floor(Math.random() * truths.length)];
      
      const replyMsg = 
        `🤔 Truth Question 🤔\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `👤 ${targetName}\n\n` +
        `${randomTruth}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `Answer honestly! 😏`;

      return message.reply(replyMsg);

    } catch (error) {
      console.error('Truth command error:', error);
      return message.reply('❌ An error occurred!');
    }
  }
};