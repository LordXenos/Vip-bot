module.exports = {
  config: {
    name: "pending",
    aliases: ['pend', 'pen'],
    version: "1.2",
    author: "Rasin",
    countDown: 3,
    prefix: false,
    role: 2,
    shortDescription: {
      en: "manage pending group requests"
    },
    longDescription: {
      en: "Approve or reject pending group requests in spam list or unapproved groups"
    },
    category: "admin",
    guide: {
      en: "{pn}pending - view pending list\n{pn}pending approve <numbers> - approve selected groups\n{pn}pending approve all - approve all pending groups\n{pn}pending cancel <numbers> - reject selected groups"
    }
  },

  langs: {
    en: {
      invalidNumber: "❍ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗜𝗻𝗽𝘂𝘁\n━━━━━━━━━━━━━━\n\n» %1 iꜱ not a valid number. pleaꜱe enter numberꜱ only 😶‍🌫️🎀",
      cancelSuccess: "❍ 𝗥𝗲𝗾𝘂𝗲𝘀𝘁 𝗖𝗮𝗻𝗰𝗲𝗹𝗹𝗲𝗱\n━━━━━━━━━━━━━━\n\n» ꜱucceꜱꜱꜰully rejected %1 group reQueꜱt(ꜱ) 🥹🎀",
      approveSuccess: "❍ 𝗚𝗿𝗼𝘂𝗽 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱\n━━━━━━━━━━━━━━\n\n» ꜱucceꜱꜱꜰully approved [ %1 ] group(ꜱ) 😌🎀",
      approvingAll: "❍ 𝗔𝗽𝗽𝗿𝗼𝘃𝗶𝗻𝗴 𝗔𝗹𝗹 𝗚𝗿𝗼𝘂𝗽𝘀\n━━━━━━━━━━━━━━\n\n» approving %1 groupꜱ... pleaꜱe wait 🎀",
      cantGetPendingList: "❍ 𝗘𝗿𝗿𝗼𝗿\n━━━━━━━━━━━━━━\n\n» ꜰailed to get pending liꜱt. try again later 😶‍🌫️🎀",
      returnListPending: "❍ 𝗣𝗲𝗻𝗱𝗶𝗻𝗴 𝗚𝗿𝗼𝘂𝗽𝘀 (%1)\n━━━━━━━━━━━━━━\n\n%2\n\n» reply with:\n» 'approve <numberꜱ>' to approve\n» 'approve all' to approve all\n» 'cancel <numberꜱ>' to reject\n\nexample:\n» pending approve 1 2 3 🎀",
      returnListClean: "❍ 𝗡𝗼 𝗣𝗲𝗻𝗱𝗶𝗻𝗴 𝗚𝗿𝗼𝘂𝗽𝘀\n━━━━━━━━━━━━━━\n\n» currently no groupꜱ in pending liꜱt 😶‍🌫️🎀",
      noSelection: "❍ 𝗠𝗶𝘀𝘀𝗶𝗻𝗴 𝗜𝗻𝗽𝘂𝘁\n━━━━━━━━━━━━━━\n\n» pleaꜱe ꜱpeciꜰy which groupꜱ to proceꜱꜱ.\n» example: pending approve 1 2 3 🥹🎀",
      instruction: "❍ 𝗜𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀\n━━━━━━━━━━━━━━\n\n1. view pending groupꜱ: '{pn}'\n2. approve: '{pn} approve <numberꜱ>'\n3. approve all: '{pn} approve all'\n4. reject: '{pn} cancel <numberꜱ>'\n\nexampleꜱ:\n» {pn} approve 1 2 3\n» {pn} approve all\n» {pn} cancel 4 5 😌🎀"
    }
  },

  onStart: async function({ api, event, getLang, commandName, args }) {
    const input = event.body;
    const { threadID, messageID } = event;
    
    if (input && (
      input.trim().toLowerCase().includes('pending') || 
      input.trim().toLowerCase().includes('pend') || 
      input.trim().toLowerCase().includes('pen')))

    if (args[0]?.toLowerCase() === 'help') {
      return api.sendMessage(getLang("instruction").replace(/{pn}/g, commandName), threadID, messageID);
    }

    try {
      const [spam, pending] = await Promise.all([
        api.getThreadList(100, null, ["OTHER"]).catch(() => []),
        api.getThreadList(100, null, ["PENDING"]).catch(() => [])
      ]);
      
      const list = [...spam, ...pending]
        .filter(group => group.isSubscribed && group.isGroup)
        .map((group, index) => ({
          ...group,
          displayIndex: index + 1
        }));

      if (list.length === 0) {
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);
      }

      const msg = list.map(group => 
        `╭───────────────\n` +
        `│ ${group.displayIndex}. ${group.name || 'Unnamed Group'}\n` +
        `│ 👀 Members: ${group.participantIDs.length}\n` +
        `│ 🎀 ID: ${group.threadID}\n` +
        `╰───────────────`
      ).join('\n\n');

      const replyMsg = await api.sendMessage(
        getLang("returnListPending", list.length, msg).replace(/{pn}/g, commandName),
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              pending: list
            });
          }
        },
        messageID
      );

      setTimeout(() => {
        if (global.GoatBot.onReply.has(replyMsg.messageID)) {
          global.GoatBot.onReply.delete(replyMsg.messageID);
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error(error);
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  },

  onReply: async function({ api, event, Reply, getLang, commandName }) {
    if (String(event.senderID) !== String(Reply.author)) return;

    const { body, threadID, messageID } = event;
    const args = body.trim().split(/\s+/);
    const action = args[0]?.toLowerCase();

    if (!action || (action !== 'approve' && action !== 'cancel')) {
      return api.sendMessage(
        getLang("noSelection").replace(/{pn}/g, commandName),
        threadID,
        messageID
      );
    }

    if (action === 'approve' && args[1]?.toLowerCase() === 'all') {
      const totalGroups = Reply.pending.length;
      
      const sentMsg = await api.sendMessage(
        getLang("approvingAll", totalGroups),
        threadID,
        messageID
      );

      let approvedMessages = "";
      let successCount = 0;

      for (let i = 0; i < Reply.pending.length; i++) {
        const group = Reply.pending[i];
        
        try {
          const groupInfo = await api.getThreadInfo(group.threadID);
          const adminCount = groupInfo.adminIDs?.length || 0;
          const maleCount = groupInfo.userInfo?.filter(u => u.gender === 1).length || 0;
          const femaleCount = groupInfo.userInfo?.filter(u => u.gender === 2).length || 0;
          
          await api.sendMessage(
            "Group Haꜱ Been Approved Succeꜱꜱꜰully 🎀👀\nType Help To View All Commandꜱ",
            group.threadID
          );
          
          successCount++;
          
          approvedMessages += `\n━━━━━━━━━━━━━━━━━━\n\nAccepted Group ${successCount}\n╭───✦ Group Info ✦───╮\n├‣ Name: ${groupInfo.threadName || 'Unnamed Group'}\n├‣ Thread ID: ${group.threadID}\n├‣ Emoji: ${groupInfo.emoji || '👍'}\n├‣ Approval Mode: ${groupInfo.approvalMode ? 'Enabled' : 'Disabled'}\n├‣ Admins: ${adminCount}\n├‣ Members: ${groupInfo.participantIDs.length}\n├‣ Invite Link: ${groupInfo.inviteLink?.link || 'N/A'}\n╰───────────────────⧕`;

          await api.editMessage(
            `❍ 𝗔𝗽𝗽𝗿𝗼𝘃𝗶𝗻𝗴 𝗔𝗹𝗹 𝗚𝗿𝗼𝘂𝗽𝘀\n━━━━━━━━━━━━━━\n\n» Progress: ${successCount}/${totalGroups} ${approvedMessages}`,
            sentMsg.messageID
          );

          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`Failed to process ${group.threadID}:`, error);
        }
      }

      await api.editMessage(
        `❍ 𝗔𝗹𝗹 𝗚𝗿𝗼𝘂𝗽𝘀 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱\n━━━━━━━━━━━━━━\n\n» Successfully approved ${successCount}/${totalGroups} groups! 🎀${approvedMessages}`,
        sentMsg.messageID
      );

      if (global.GoatBot.onReply.has(Reply.messageID)) {
        global.GoatBot.onReply.delete(Reply.messageID);
      }
      return;
    }

    const numbers = args.slice(1).map(num => parseInt(num)).filter(num => !isNaN(num));
    
    if (numbers.length === 0) {
      return api.sendMessage(getLang("invalidNumber", "empty selection"), threadID, messageID);
    }

    const invalidNumbers = numbers.filter(num => num <= 0 || num > Reply.pending.length);
    if (invalidNumbers.length > 0) {
      return api.sendMessage(
        getLang("invalidNumber", invalidNumbers.join(', ')),
        threadID,
        messageID
      );
    }

    const selectedGroups = numbers.map(num => Reply.pending[num - 1]);
    
    if (action === 'approve') {
      try {
        await api.unsendMessage(Reply.messageID);
      } catch (error) {
        console.error('Failed to unsend message:', error);
      }

      let successCount = 0;
      let currentMsgID = null;

      for (let i = 0; i < selectedGroups.length; i++) {
        const group = selectedGroups[i];
        
        try {
          const groupInfo = await api.getThreadInfo(group.threadID);
          const adminCount = groupInfo.adminIDs?.length || 0;
          const maleCount = groupInfo.userInfo?.filter(u => u.gender === 1).length || 0;
          const femaleCount = groupInfo.userInfo?.filter(u => u.gender === 2).length || 0;
          
          await api.sendMessage(
            "Group Haꜱ Been Approved Succeꜱꜱꜰully 🎀👀\nType Help To View All Commandꜱ",
            group.threadID
          );
          
          successCount++;
          
          const currentGroupMsg = `Accepted Group ${successCount}\n╭───✦ Group Info ✦───╮\n├‣ Name: ${groupInfo.threadName || 'Unnamed Group'}\n├‣ Thread ID: ${group.threadID}\n├‣ Emoji: ${groupInfo.emoji || '👍'}\n├‣ Approval Mode: ${groupInfo.approvalMode ? 'Enabled' : 'Disabled'}\n├‣ Admins: ${adminCount}\n├‣ Members: ${groupInfo.participantIDs.length}\n├‣ Invite Link: ${groupInfo.inviteLink?.link || 'N/A'}\n╰───────────────────⧕`;

          if (currentMsgID === null) {
            const sentMsg = await api.sendMessage(currentGroupMsg, threadID, messageID);
            currentMsgID = sentMsg.messageID;
          } else {
            await api.editMessage(currentGroupMsg, currentMsgID);
          }

          if (i < selectedGroups.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
        } catch (error) {
          console.error(`Failed to process ${group.threadID}:`, error);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      if (currentMsgID) {
        await api.editMessage(
          `❍ 𝗔𝗹𝗹 𝗚𝗿𝗼𝘂𝗽𝘀 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱\n━━━━━━━━━━━━━━\n\n» Successfully approved ${successCount}/${selectedGroups.length} groups! 🎀`,
          currentMsgID
        );
      }

    } else {
      let successCount = 0;
      for (const group of selectedGroups) {
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
          successCount++;
        } catch (error) {
          console.error(`Failed to process ${group.threadID}:`, error);
        }
      }
      
      api.sendMessage(getLang("cancelSuccess", successCount), threadID, messageID);
    }

    if (global.GoatBot.onReply.has(Reply.messageID)) {
      global.GoatBot.onReply.delete(Reply.messageID);
    }
  }
};

