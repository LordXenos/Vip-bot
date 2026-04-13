const moment = require('moment-timezone');
const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: 'hbd',
    author: 'Rasin',
    cooldown: 1,
    role: 0,
    prefix: false,
    description: 'Special birthday wish',
    category: 'special',
    usage: 'hbd'
  },

  onStart: async function({ event, message, api, threadsData, getLang }) {
    try {
      const now = moment.tz('Asia/Dhaka');
      const currentDate = now.date();
      const currentMonth = now.month() + 1;
      
      const birthdayDate = 5;
      const birthdayMonth = 3;

      if (currentMonth === birthdayMonth && currentDate === birthdayDate) {
        const countdownStart = await message.reply(
          `Yoooooo Siyam 🫶🏻\n\n` +
          `Only a few seconds left now...`
        );

        const countdownMessageID = countdownStart.messageID;
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const countdownNumbers = ['5', '4', '3', '2', '1'];
        
        for (let i = 0; i < countdownNumbers.length; i++) {
          try {
            await api.editMessage(countdownNumbers[i], countdownMessageID);
          } catch (error) {
            await message.reply(countdownNumbers[i]);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const birthdayMessage = `
━━━━━━━━━━━━━━━━━━━
🎂 𝐒𝐩𝐞𝐜𝐢𝐚𝐥 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐖𝐢𝐬𝐡 🎂
━━━━━━━━━━━━━━━━━━━

𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 Siyam! ✨

𝐎𝐧 𝐭𝐡𝐢𝐬 𝐬𝐩𝐞𝐜𝐢𝐚𝐥 𝐝𝐚𝐲, 𝐦𝐚𝐲 𝐀𝐥𝐥𝐚𝐡 𝐒𝐖𝐓 𝐛𝐥𝐞𝐬𝐬 𝐲𝐨𝐮 𝐰𝐢𝐭𝐡 𝐞𝐧𝐝𝐥𝐞𝐬𝐬 𝐡𝐚𝐩𝐩𝐢𝐧𝐞𝐬𝐬, 𝐠𝐨𝐨𝐝 𝐡𝐞𝐚𝐥𝐭𝐡, 𝐚𝐧𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬 𝐢𝐧 𝐞𝐯𝐞𝐫𝐲 𝐞𝐧𝐝𝐞𝐚𝐯𝐨𝐫. 𝐘𝐨𝐮'𝐫𝐞 𝐧𝐨𝐭 𝐣𝐮𝐬𝐭 𝐚𝐧 𝐚𝐦𝐚𝐳𝐢𝐧𝐠 𝐩𝐞𝐫𝐬𝐨𝐧, 𝐛𝐮𝐭 𝐚𝐥𝐬𝐨 𝐬𝐨𝐦𝐞𝐨𝐧𝐞 𝐰𝐡𝐨 𝐛𝐫𝐢𝐧𝐠𝐬 𝐣𝐨𝐲 𝐚𝐧𝐝 𝐥𝐢𝐠𝐡𝐭 𝐭𝐨 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐚𝐫𝐨𝐮𝐧𝐝 𝐲𝐨𝐮. 💫

𝐘𝐨𝐮𝐫 𝐤𝐢𝐧𝐝𝐧𝐞𝐬𝐬 𝐚𝐧𝐝 𝐬𝐢𝐦𝐩𝐥𝐢𝐜𝐢𝐭𝐲 𝐚𝐫𝐞 𝐰𝐡𝐚𝐭 𝐦𝐚𝐤𝐞 𝐲𝐨𝐮 𝐬𝐩𝐞𝐜𝐢𝐚𝐥. 𝐌𝐚𝐲 𝐭𝐡𝐢𝐬 𝐧𝐞𝐰 𝐲𝐞𝐚𝐫 𝐨𝐟 𝐲𝐨𝐮𝐫 𝐥𝐢𝐟𝐞 𝐛𝐞 𝐟𝐢𝐥𝐥𝐞𝐝 𝐰𝐢𝐭𝐡 𝐞𝐯𝐞𝐧 𝐦𝐨𝐫𝐞 𝐚𝐜𝐡𝐢𝐞𝐯𝐞𝐦𝐞𝐧𝐭𝐬, 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 𝐦𝐞𝐦𝐨𝐫𝐢𝐞𝐬, 𝐚𝐧𝐝 𝐰𝐨𝐧𝐝𝐞𝐫𝐟𝐮𝐥 𝐦𝐨𝐦𝐞𝐧𝐭𝐬! 🎊

𝐌𝐚𝐲 𝐀𝐥𝐥𝐚𝐡 𝐠𝐫𝐚𝐧𝐭 𝐲𝐨𝐮:
✨ 𝐀 𝐥𝐢𝐟𝐞 𝐟𝐮𝐥𝐥 𝐨𝐟 𝐛𝐚𝐫𝐚𝐤𝐚𝐡
✨ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 𝐢𝐧 𝐛𝐨𝐭𝐡 𝐝𝐮𝐧𝐢𝐚 𝐚𝐧𝐝 𝐚𝐤𝐡𝐢𝐫𝐚𝐡
✨ 𝐒𝐭𝐫𝐞𝐧𝐠𝐭𝐡 𝐭𝐨 𝐚𝐜𝐡𝐢𝐞𝐯𝐞 𝐚𝐥𝐥 𝐲𝐨𝐮𝐫 𝐝𝐫𝐞𝐚𝐦𝐬
✨ 𝐉𝐨𝐲 𝐢𝐧 𝐞𝐯𝐞𝐫𝐲 𝐦𝐨𝐦𝐞𝐧𝐭
✨ 𝐋𝐨𝐯𝐞 𝐟𝐫𝐨𝐦 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐚𝐫𝐨𝐮𝐧𝐝 𝐲𝐨𝐮

𝐊𝐞𝐞𝐩 𝐬𝐦𝐢𝐥𝐢𝐧𝐠, 𝐤𝐞𝐞𝐩 𝐬𝐡𝐢𝐧𝐢𝐧𝐠, 𝐚𝐧𝐝 𝐤𝐞𝐞𝐩 𝐛𝐞𝐢𝐧𝐠 𝐭𝐡𝐞 𝐚𝐦𝐚𝐳𝐢𝐧𝐠 𝐩𝐞𝐫𝐬𝐨𝐧 𝐲𝐨𝐮 𝐚𝐫𝐞! 🫶🏻

🎈 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 SIYAM ! 🎈

𝐘𝐨𝐮'𝐫𝐞 𝐭𝐫𝐮𝐥𝐲 𝐨𝐧𝐞 𝐢𝐧 𝐚 𝐦𝐢𝐥𝐥𝐢𝐨𝐧! 💎

━━━━━━━━━━━━━━━━━━━
🎂 𝐄𝐧𝐣𝐨𝐲 𝐘𝐨𝐮𝐫 𝐒𝐩𝐞𝐜𝐢𝐚𝐥 𝐃𝐚𝐲! 🎂
━━━━━━━━━━━━━━━━━━━

𝐖𝐢𝐭𝐡 𝐥𝐨𝐯𝐞 𝐚𝐧𝐝 𝐫𝐞𝐬𝐩𝐞𝐜𝐭,
𝐘𝐨𝐮𝐫 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 & 𝐅𝐚𝐦𝐢𝐥𝐲 🫶🏻`;

        await message.reply(birthdayMessage);

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const sendToAllGroups = await message.reply(
          `━━━━━━━━━━━━━━━━━━━\n` +
          `𝐒𝐞𝐧𝐝𝐢𝐧𝐠 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐖𝐢𝐬𝐡\n` +
          `━━━━━━━━━━━━━━━━━━━\n\n` +
          `𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭𝐢𝐧𝐠 𝐭𝐨 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐬...\n` +
          `𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭... ⏳`
        );

        const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
        
        const formSend = {
          body: birthdayMessage,
          attachment: await getStreamsFromAttachment(
            [
              ...event.attachments,
              ...(event.messageReply?.attachments || [])
            ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
          )
        };

        let sendSuccess = 0;
        const sendError = [];
        const delayPerGroup = 250;

        for (const thread of allThreadID) {
          const tid = thread.threadID;
          try {
            await api.sendMessage(formSend, tid);
            sendSuccess++;
            await new Promise(resolve => setTimeout(resolve, delayPerGroup));
          }
          catch (e) {
            sendError.push(tid);
          }
        }

        await message.unsend(sendToAllGroups.messageID);
        
        let reportMsg = `𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐑𝐞𝐩𝐨𝐫𝐭 \n\n`;
        reportMsg += `✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐬𝐞𝐧𝐭 𝐭𝐨: ${sendSuccess} 𝐠𝐫𝐨𝐮𝐩𝐬\n`;
        
        if (sendError.length > 0) {
          reportMsg += `❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝: ${sendError.length} 𝐠𝐫𝐨𝐮𝐩𝐬\n`;
        }
        
        reportMsg += `\n🎉 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐰𝐢𝐬𝐡 𝐛𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝!\n`;
        reportMsg += `━━━━━━━━━━━━━━━━━━━`;

        return message.reply(reportMsg);

      } else if (currentMonth === birthdayMonth && currentDate < birthdayDate) {
        const daysLeft = birthdayDate - currentDate;
        return message.reply(
          `━━━━━━━━━━━━━━\n` +
          `𝐂𝐨𝐮𝐧𝐭𝐝𝐨𝐰𝐧\n` +
          `━━━━━━━━━━━━━━\n\n` +
          `𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐃𝐚𝐭𝐞: ${currentDate} march ${now.year()}\n\n` +
          `siyam 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐢𝐬 𝐜𝐨𝐦𝐢𝐧𝐠 𝐬𝐨𝐨𝐧! 🎉\n\n` +
          `𝐎𝐧𝐥𝐲 ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} 𝐥𝐞𝐟𝐭!\n\n` +
          `𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐰𝐢𝐥𝐥 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐥𝐥𝐲 𝐛𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐚 𝐬𝐩𝐞𝐜𝐢𝐚𝐥 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐰𝐢𝐬𝐡 𝐭𝐨 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧 5 march! 🎂\n\n` +
          `━━━━━━━━━━━━━━━━━━━`
        );

      } else if (currentMonth === birthdayMonth && currentDate > birthdayDate) {
        return message.reply(
          `━━━━━━━━━━━━━━━━━━━\n` +
          `𝐘𝐨𝐮 𝐌𝐢𝐬𝐬𝐞𝐝 𝐈𝐭!\n` +
          `━━━━━━━━━━━━━━━━━━━\n\n` +
          `𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐃𝐚𝐭𝐞: ${currentDate} march${now.year()}\n\n` +
          `Siyam'𝐬 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐰𝐚𝐬 𝐨𝐧 5th march! 🎂\n\n` +
          `𝐓𝐡𝐞 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜 𝐛𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐨𝐧𝐥𝐲 𝐰𝐨𝐫𝐤𝐬 𝐨𝐧 𝐡𝐢𝐬 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲.\n\n` +
          `𝐒𝐞𝐞 𝐲𝐨𝐮 𝐧𝐞𝐱𝐭 𝐲𝐞𝐚𝐫! 🎉\n\n` +
          `━━━━━━━━━━━━━━━━━━━`
        );

      } else {
        const monthsLeft = currentMonth < birthdayMonth ? 
          (birthdayMonth - currentMonth) : 
          (12 - currentMonth + birthdayMonth);
        
        return message.reply(
          `━━━━━━━━━━━━━━━━━━━\n` +
          `📅 𝐍𝐨𝐭 𝐘𝐞𝐭! 📅\n` +
          `━━━━━━━━━━━━━━━━━━━\n\n` +
          `𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐃𝐚𝐭𝐞: ${currentDate} ${now.format('MMMM')} ${now.year()}\n\n` +
          `siyam 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐢𝐬 𝐨𝐧 5 march.\n\n` +
          `𝐀𝐛𝐨𝐮𝐭 ${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'} 𝐭𝐨 𝐠𝐨!\n\n` +
          `𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐰𝐢𝐥𝐥 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐥𝐥𝐲 𝐛𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐭𝐨 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 𝐨𝐧 5 march! 🎂\n\n` +
          `━━━━━━━━━━━━━━━━━━━`
        );
      }

    } catch (err) {
      console.error("error:", err);
      return message.reply(
        `━━━━━━━━━━━━━━━━━━━\n` +
        `❌ 𝐄𝐫𝐫𝐨𝐫 𝐎𝐜𝐜𝐮𝐫𝐫𝐞𝐝 ❌\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐭𝐡𝐞 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.\n\n` +
        `𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.\n\n` +
        `━━━━━━━━━━━━━━━━━━━`
      );
    }
  }
};
