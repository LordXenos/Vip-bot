const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'outgc',
    author: 'vydron1122',
    version: '4.0',
    description: 'বট যেসব গ্রুপে আছে তার তালিকা দেখায় এবং সিরিয়াল নম্বর দিয়ে লিভ নেয়',
    category: 'system',
    guide: '{pn} [page/all]',
    role: 2, // শুধু অ্যাডমিন
    countDown: 5,
    hide: false
  },

  onStart: async function ({ api, event, args, message, threadsData, usersData, dashBoardData }) {
    const permission = global.GoatBot.config?.ADMINBOT || ["61581548070081"];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage('❌ আপনি এই কমান্ড ব্যবহার করার অনুমতি পাননি!', event.threadID, event.messageID);
    }

    const input = args[0]?.toLowerCase();
    
    try {
      // threadsData থেকে সব গ্রুপের তথ্য নেওয়া
      let allThreads = await threadsData.getAll();
      
      // শুধু গ্রুপ ফিল্টার করা
      const groupThreads = allThreads.filter(thread => thread.threadType === 1 || thread.isGroup);
      
      if (groupThreads.length === 0) {
        return api.sendMessage('❌ বর্তমানে বট কোনো গ্রুপে সংযুক্ত নেই!', event.threadID, event.messageID);
      }

      // ALL কমান্ড হ্যান্ডেল
      if (input === 'all') {
        return this.handleAllLeave(api, event, groupThreads, threadsData);
      }

      // পৃষ্ঠা ক্যালকুলেশন
      const page = parseInt(args[0]) || 1;
      const perPage = 15;
      const totalPages = Math.ceil(groupThreads.length / perPage);
      
      if (page > totalPages) {
        return api.sendMessage(`❌ সর্বোচ্চ পৃষ্ঠা সংখ্যা ${totalPages}`, event.threadID, event.messageID);
      }

      const startIndex = (page - 1) * perPage;
      const endIndex = Math.min(startIndex + perPage, groupThreads.length);
      const currentPageThreads = groupThreads.slice(startIndex, endIndex);

      // মেসেজ তৈরি
      let msg = `╭─────────────────╮\n`;
      msg += `│  📋 গ্রুপ তালিকা  │\n`;
      msg += `╰─────────────────╯\n\n`;
      msg += `📌 পৃষ্ঠা: ${page}/${totalPages}\n`;
      msg += `🔢 মোট গ্রুপ: ${groupThreads.length}\n`;
      msg += `─────────────────────\n\n`;
      
      for (let i = 0; i < currentPageThreads.length; i++) {
        const thread = currentPageThreads[i];
        const serial = startIndex + i + 1;
        const threadName = thread.threadName || thread.name || 'নামহীন গ্রুপ';
        const memberCount = thread.members ? Object.keys(thread.members).length : thread.participantIDs?.length || '?';
        const prefix = thread.data?.prefix || global.GoatBot.config?.PREFIX || '!';
        
        msg += `${serial}. ${threadName}\n`;
        msg += `   👥 সদস্য: ${memberCount}\n`;
        msg += `   🆔 ${thread.threadID}\n`;
        msg += `   📌 প্রিফিক্স: ${prefix}\n\n`;
      }

      msg += `─────────────────────\n`;
      msg += `✅ **ব্যবহার**:\n`;
      msg += `• রিপ্লাই দিয়ে সিরিয়াল দিন\n`;
      msg += `  যেমন: ১  (একক)\n`;
      msg += `  যেমন: ১ ৩ ৫ (একাধিক)\n`;
      msg += `  যেমন: ১-৫ (রেঞ্জ)\n`;
      msg += `• নতুন পৃষ্ঠা: !outgc ২\n`;
      msg += `• সব লিভ: !outgc all\n`;
      msg += `─────────────────────\n`;
      msg += `📌 পৃষ্ঠা: ${page}/${totalPages}`;

      return api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) return console.error(error);
        
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          groupList: groupThreads,
          messageID: info.messageID,
          totalPages: totalPages,
          currentPage: page
        });
      }, event.messageID);

    } catch (error) {
      console.error('outgc কমান্ডে ত্রুটি:', error);
      return api.sendMessage('❌ গ্রুপ তালিকা আনার সময় ত্রুটি হয়েছে।', event.threadID, event.messageID);
    }
  },

  handleAllLeave: async function (api, event, groupThreads, threadsData) {
    const totalGroups = groupThreads.length;
    
    const confirmMsg = await api.sendMessage(
      `⚠️ **সতর্কতা** ⚠️\n\n` +
      `আপনি কি নিশ্চিত সবগুলো (${totalGroups}টি) গ্রুপ থেকে লিভ নিতে চান?\n\n` +
      `✅ হ্যাঁ - "yes"\n` +
      `❌ না - "no"\n\n` +
      `(৩০ সেকেন্ডের মধ্যে উত্তর দিন)`,
      event.threadID
    );

    global.GoatBot.onReply.set(confirmMsg.messageID, {
      commandName: this.config.name,
      author: event.senderID,
      groupList: groupThreads,
      threadsData: threadsData,
      type: 'confirm_all_leave',
      messageID: confirmMsg.messageID
    });
  },

  onReply: async function ({ api, event, Reply, threadsData }) {
    const { author, groupList, type, currentPage, totalPages, threadsData: oldThreadsData } = Reply;

    if (event.senderID !== author) return;

    const input = event.body.trim().toLowerCase();

    // সব গ্রুপ ছাড়ার কনফার্মেশন
    if (type === 'confirm_all_leave') {
      if (input === 'yes' || input === 'হ্যাঁ' || input === 'ha') {
        api.sendMessage(`⏳ প্রক্রিয়াকরণ চলছে... ${groupList.length}টি গ্রুপ থেকে লিভ নেওয়া হচ্ছে...`, event.threadID);
        
        let success = 0;
        let fail = 0;
        let failedGroups = [];

        for (const thread of groupList) {
          try {
            await api.removeUserFromGroup(api.getCurrentUserID(), thread.threadID);
            
            // ডাটাবেজ থেকে গ্রুপ তথ্য ডিলিট
            try {
              await threadsData.delete(thread.threadID);
            } catch (dbErr) {
              console.error(`ডাটাবেজ ডিলিট ত্রুটি: ${thread.threadID}`, dbErr);
            }
            
            success++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            fail++;
            failedGroups.push(thread.threadName || thread.name || thread.threadID);
            console.error(`Error leaving ${thread.threadID}:`, error);
          }
        }

        let resultMsg = `📊 **লিভ নেওয়ার ফলাফল**\n\n`;
        resultMsg += `✅ সফল: ${success}টি গ্রুপ\n`;
        resultMsg += `❌ ব্যর্থ: ${fail}টি গ্রুপ\n`;
        
        if (failedGroups.length > 0) {
          resultMsg += `\n⚠️ ব্যর্থ গ্রুপসমূহ:\n`;
          failedGroups.slice(0, 5).forEach((name, i) => {
            resultMsg += `${i+1}. ${name}\n`;
          });
          if (failedGroups.length > 5) {
            resultMsg += `... এবং আরও ${failedGroups.length - 5}টি\n`;
          }
        }

        return api.sendMessage(resultMsg, event.threadID);
      } else {
        return api.sendMessage('✅ সব গ্রুপ থেকে লিভ নেওয়া বাতিল করা হয়েছে।', event.threadID);
      }
    }

    // পৃষ্ঠা নম্বর চেক
    if (!isNaN(input) && parseInt(input) > 0) {
      const pageNum = parseInt(input);
      if (pageNum <= totalPages) {
        return this.onStart({ api, event, args: [pageNum.toString()], threadsData });
      } else {
        return api.sendMessage(`❌ ভ্যালিড পৃষ্ঠা নম্বর দিন (১-${totalPages})`, event.threadID);
      }
    }

    // সিরিয়াল নাম্বার পার্স করা
    const serials = parseSerialInput(input, groupList.length);
    
    if (serials.length === 0) {
      return api.sendMessage('❌ সঠিক সিরিয়াল নাম্বার দিন (যেমন: ১, ১ ৩ ৫, অথবা ১-৫)', event.threadID);
    }

    const uniqueSerials = [...new Set(serials)].sort((a, b) => a - b);
    const validSerials = uniqueSerials.filter(s => s >= 1 && s <= groupList.length);
    
    if (validSerials.length === 0) {
      return api.sendMessage(`❌ ভ্যালিড সিরিয়াল নাম্বার দিন (১-${groupList.length})`, event.threadID);
    }

    const selectedGroups = validSerials.map(s => ({
      serial: s,
      threadID: groupList[s-1].threadID,
      name: groupList[s-1].threadName || groupList[s-1].name || 'নামহীন গ্রুপ'
    }));

    const confirmMsg = await api.sendMessage(
      `⚠️ **নিশ্চিতকরণ** ⚠️\n\n` +
      `আপনি কি নিম্নলিখিত ${selectedGroups.length}টি গ্রুপ থেকে লিভ নিতে চান?\n\n` +
      selectedGroups.map(g => `${g.serial}. ${g.name}`).join('\n') +
      `\n\n✅ "হ্যাঁ" অথবা "yes"\n` +
      `❌ বাতিল - যেকোনো কিছু`,
      event.threadID
    );

    global.GoatBot.onReply.set(confirmMsg.messageID, {
      commandName: this.config.name,
      author: event.senderID,
      selectedGroups: selectedGroups,
      threadsData: threadsData,
      type: 'confirm_leave',
      messageID: confirmMsg.messageID,
      currentPage: currentPage
    });
  },

  onReplyConfirm: async function ({ api, event, Reply, threadsData }) {
    const { author, selectedGroups, type, currentPage } = Reply;

    if (event.senderID !== author) return;

    const input = event.body.trim().toLowerCase();

    if (type === 'confirm_leave') {
      if (input === 'yes' || input === 'হ্যাঁ' || input === 'ha') {
        let success = 0;
        let fail = 0;
        let results = '';

        for (const group of selectedGroups) {
          try {
            await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
            
            // ডাটাবেজ থেকে গ্রুপ তথ্য ডিলিট
            try {
              await threadsData.delete(group.threadID);
            } catch (dbErr) {
              console.error(`ডাটাবেজ ডিলিট ত্রুটি: ${group.threadID}`, dbErr);
            }
            
            results += `✅ ${group.serial}. ${group.name}\n`;
            success++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            results += `❌ ${group.serial}. ${group.name}\n`;
            fail++;
          }
        }

        let finalMsg = `📊 **লিভ নেওয়ার ফলাফল**\n\n`;
        finalMsg += results;
        finalMsg += `\n✅ সফল: ${success}টি\n`;
        finalMsg += `❌ ব্যর্থ: ${fail}টি`;

        if (success > 0 && currentPage) {
          finalMsg += `\n💡 আবার তালিকা দেখতে: !outgc ${currentPage}`;
        }

        return api.sendMessage(finalMsg, event.threadID);
      } else {
        return api.sendMessage('✅ লিভ নেওয়া বাতিল করা হয়েছে।', event.threadID);
      }
    }
  }
};

// সিরিয়াল নাম্বার পার্স করার ফাংশন
function parseSerialInput(input, maxSerial) {
  const serials = [];
  
  // কমা সেপারেটেড
  if (input.includes(',')) {
    input.split(',').forEach(part => {
      const num = parseInt(part.trim());
      if (!isNaN(num)) serials.push(num);
    });
  }
  // স্পেস সেপারেটেড
  else if (input.includes(' ')) {
    input.split(' ').forEach(part => {
      const num = parseInt(part);
      if (!isNaN(num)) serials.push(num);
    });
  }
  // রেঞ্জ (যেমন: ১-৫)
  else if (input.includes('-')) {
    const [start, end] = input.split('-').map(n => parseInt(n));
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      for (let i = start; i <= end; i++) {
        serials.push(i);
      }
    }
  }
  // একক নাম্বার
  else {
    const num = parseInt(input);
    if (!isNaN(num)) serials.push(num);
  }
  
  return serials.filter(s => s >= 1 && s <= maxSerial);
}