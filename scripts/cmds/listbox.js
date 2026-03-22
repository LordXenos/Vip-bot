module.exports = {
  config: {
    name: 'listbox',
    aliases: ['listgroup', 'listgroups'],
    prefix: false,
    author: 'Rasin',
    countDown: 3,
    role: 2,
    description: 'List thread bot participated',
    category: 'System',
    guide: {
      en: '{pn} - Shows all groups the bot is in'
    }
  },

  onStart: async function({ api, event, message, threadsData }) {
    try {
      const inbox = await api.getThreadList(100, null, ['INBOX']);
      const list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
      
      let listthread = [];
      
      for (const groupInfo of list) {
        try {
          const data = await api.getThreadInfo(groupInfo.threadID);
          listthread.push({
            id: groupInfo.threadID,
            name: groupInfo.name || 'Unnamed Group',
            sotv: data.userInfo.length
          });
        } catch (err) {
          console.error(`Error getting info for ${groupInfo.threadID}:`, err);
        }
      }
      
      const listbox = listthread.sort((a, b) => b.sotv - a.sotv);
      
      let msg = '━━━━━ 𝐋iꜱt 𝐎ꜰ 𝐆roupꜱ ━━━━━\n\n';
      let groupid = [];
      
      for (let i = 0; i < listbox.length; i++) {
        const group = listbox[i];
        msg += `${i + 1}. ${group.name}\n`;
        msg += `❍ 𝐓hread 𝐈d: ${group.id}\n`;
        msg += `❍ 𝐌emberꜱ: ${group.sotv}\n\n`;
        groupid.push(group.id);
      }
      
      msg += '━━━━━━━━━━━━━━━━━━━\n';
      msg += '𝐑eply 𝐖ith:\n';
      msg += '❍ "out <number>" 𝐓o 𝐋eave 𝐓hat 𝐆roup\n';
      msg += '❍ "ban <number>" 𝐓o 𝐁an 𝐓hat 𝐆roup\n';
      msg += '━━━━━━━━━━━━━━━━━━━\n';
      msg += '⏳ 𝐓hiꜱ 𝐌eꜱꜱage 𝐖ill 𝐁e 𝐔nꜱent 𝐈n 𝟏 𝐌inute';
      
      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          groupid,
          type: 'reply'
        });
        
  
        setTimeout(() => {
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }, 60000);
      });
      
    } catch (error) {
      console.error(error);
      return message.reply('❌ 𝐀n 𝐄rror 𝐎ccurred 𝐖hile 𝐅etching 𝐆roup 𝐋iꜱt.');
    }
  },

  onReply: async function({ api, event, Reply, message, threadsData }) {
    if (parseInt(event.senderID) !== parseInt(Reply.author)) return;
    
    const args = event.body.trim().split(" ");
    const command = args[0].toLowerCase();
    const index = parseInt(args[1]) - 1;
    
    if (isNaN(index) || index < 0 || index >= Reply.groupid.length) {
      return message.reply('❌ 𝐈nvalid 𝐍umber. 𝐏leaꜱe 𝐑eply 𝐖ith 𝐀 𝐕alid 𝐆roup 𝐍umber.');
    }
    
    const idgr = Reply.groupid[index];
    
    try {
      switch (command) {
        case "ban":
          {
            const threadData = await threadsData.get(idgr);
            threadData.banned = true;
            await threadsData.set(idgr, threadData);
            
            const banMsg = await message.reply(`━━━━━ 𝐁an 𝐒ucceꜱꜱꜰul ━━━━━\n❍ 𝐓hread 𝐈d: ${idgr}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝐓hiꜱ 𝐆roup 𝐇aꜱ 𝐁een 𝐁anned`);
            
          
            setTimeout(() => {
              message.unsend(banMsg.messageID);
            }, 60000);
            break;
          }
          
        case "out":
          {
            const threadInfo = await threadsData.get(idgr);
            const threadName = threadInfo.threadName || 'Unknown';
            
            await api.removeUserFromGroup(api.getCurrentUserID(), idgr);
            const outMsg = await message.reply(`━━━━━ 𝐋eꜰt 𝐆roup ━━━━━\n❍ 𝐍ame: ${threadName}\n❍ 𝐓hread 𝐈d: ${idgr}\n━━━━━━━━━━━━━━━━━━━\n✨ 𝐒ucceꜱꜱꜰully 𝐋eꜰt 𝐓he 𝐆roup`);
            
      
            setTimeout(() => {
              message.unsend(outMsg.messageID);
            }, 60000);
            break;
          }
          
        default:
          return message.reply('❌ 𝐈nvalid 𝐂ommand. 𝐔ꜱe "out" 𝐎r "ban" 𝐅ollowed 𝐁y 𝐓he 𝐆roup 𝐍umber.');
      }
      
  
      global.GoatBot.onReply.delete(Reply.messageID);
      
    } catch (error) {
      console.error(error);
      return message.reply(`❌ 𝐄rror 𝐎ccurred 𝐖hile 𝐏erꜰorming 𝐀ction 𝐎n 𝐆roup ${idgr}`);
    }
  }
};
