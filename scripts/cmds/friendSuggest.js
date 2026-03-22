module.exports = {
  config: {
    name: "suggest",
    aliases: ["friendsuggestion", "suggestion"],
    version: "1.0",
    prefix: true,
    role: 2,
    author: "Rasin",
    description: "Get friend suggestions from Facebook",
    category: "utility",
    countDown: 5,
    guide: {
      en: "{pn} - "
    }
  },

  onStart: async function ({ event, message, args, api }) {
    const { threadID, messageID, senderID } = event;
    const count = 10;

    message.reply("» Finding friend suggestions, please wait...");

    try {
      const suggestions = await new Promise((resolve, reject) => {
        api.suggestFriend(count, null, (err, data) => {
          if (err) return reject(err);
          resolve(data);
        });
      });

      if (!suggestions || !suggestions.suggestions || suggestions.suggestions.length === 0) {
        return message.reply("× No friend suggestions available at the moment.");
      }

      const friendList = suggestions.suggestions.slice(0, 10);

      let replyx = `» 𝐅riend 𝐒uggeꜱtionꜱ\n\n`;
      replyx += `╭─────────────⭓\n`;
      replyx += `├‣ 𝐓otal: ${friendList.length} people\n`;
      replyx += `╰─────────────⭓\n\n`;

      for (let i = 0; i < friendList.length; i++) {
        const friend = friendList[i];
        const index = i + 1;

        replyx += `${index}. ${friend.name}\n`;
        replyx += `   » UID: ${friend.id}\n`;
        
        if (friend.mutualFriends) {
          replyx += `   » ${friend.mutualFriends}\n`;
        }
        
        replyx += `\n`;
      }

      replyx += `\n» Reply with numbers (e.g., 1, 2, 3) to send friend requests`;

      return message.reply(replyx, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: senderID,
            suggestions: friendList
          });
        }
      });

    } catch (err) {
      console.error("Error fetching friend suggestions:", err);
      
      let errorMsg = "× Failed to fetch friend suggestions.";
      
      if (err.error) {
        if (err.error.includes("Invalid response")) {
          errorMsg = "× Unable to get suggestions. Please try again later.";
        } else {
          errorMsg = `× Error: ${err.error}`;
        }
      } else if (err.message) {
        errorMsg = `× Error: ${err.message}`;
      }

      return message.reply(errorMsg);
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (String(event.senderID) !== String(Reply.author)) {
      return message.reply("× Only the person who requested suggestions can reply.");
    }

    const { threadID, messageID, body } = event;
    const args = body.trim().split(/\s+/);

    const numbers = args.map(num => parseInt(num)).filter(num => !isNaN(num));

    if (numbers.length === 0) {
      return message.reply("× Invalid reply. Please send numbers ");
    }

    const invalidNumbers = numbers.filter(num => num <= 0 || num > Reply.suggestions.length);
    if (invalidNumbers.length > 0) {
      return message.reply(`× Invalid number(s): ${invalidNumbers.join(', ')}. Valid range: 1-${Reply.suggestions.length}`);
    }

    const selectedFriends = numbers.map(num => Reply.suggestions[num - 1]);

    let results = [];
    let successCount = 0;

    for (const friend of selectedFriends) {
      try {
        const userInfo = await api.getUserInfo(friend.id);
        const userData = userInfo[friend.id];
        const gender = userData?.gender === 2 ? "Male" : userData?.gender === 1 ? "Female" : "Unknown";

        const result = await new Promise((resolve, reject) => {
          api.sendFriendRequest(friend.id, (err, data) => {
            if (err) return reject(err);
            resolve(data);
          });
        });

        if (result.success) {
          results.push(`╭─────────────⭓\n├‣ Name: ${friend.name}\n├‣ ID: ${friend.id}\n├‣ Gender: ${gender}\n╰─────────────⭓`);
          successCount++;
        } else if (result.friendshipStatus === "ARE_FRIENDS") {
          results.push(`╭─────────────⭓\n├‣ Name: ${friend.name}\n├‣ ID: ${friend.id}\n├‣ Status: Already friends\n╰─────────────⭓`);
        } else if (result.friendshipStatus === "OUTGOING_REQUEST") {
          results.push(`╭─────────────⭓\n├‣ Name: ${friend.name}\n├‣ ID: ${friend.id}\n├‣ Status: Request already sent\n╰─────────────⭓`);
        } else {
          results.push(`╭─────────────⭓\n├‣ Name: ${friend.name}\n├‣ ID: ${friend.id}\n├‣ Status: ${result.friendshipStatus}\n╰─────────────⭓`);
        }
      } catch (err) {
        results.push(`╭─────────────⭓\n├‣ Name: ${friend.name}\n├‣ ID: ${friend.id}\n├‣ Status: Failed\n╰─────────────⭓`);
        console.error(`Error sending request to ${friend.id}:`, err);
      }
    }

    let replyx = results.join('\n\n');
    
    if (successCount > 0) {
      replyx += `\n\nFriend Request Successfully!`;
    }

    message.reply(replyx);

    if (global.GoatBot.onReply.has(Reply.messageID)) {
      global.GoatBot.onReply.delete(Reply.messageID);
    }
  }
};