const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "1.0",
    prefix: false,
    author: "Rasin",
    countDown: 1,
    role: 2,
    description: "Stylishly Manage Friend Requests",
    longDescription: "Accept Or Reject Friend Requests With A Cool Interface",
    category: "utility",
    guide: {
      en: "{Pn} [Add|Del] [Number|All]"
    }
  },

  onReply: async function ({ message, Reply, event, api, commandName }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;
    const args = event.body.trim().toLowerCase().split(/\s+/);

    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    }
    else if (args[0] === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    }
    else {
      return api.sendMessage("❌ Oops! Invalid Command. Use: <Add|Del> <Number|All>", event.threadID, event.messageID);
    }

    let targetIDs = args.slice(1);

    if (args[1] === "all") {
      targetIDs = Array.from({ length: listRequest.length }, (_, i) => i + 1);
    }

    const newTargetIDs = [];
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const user = listRequest[parseInt(stt) - 1];
      if (!user) {
        failed.push(`🚫 Can't Find Request #${stt}`);
        continue;
      }
      form.variables.input.friend_requester_id = user.node.id;
      form.variables = JSON.stringify(form.variables);
      newTargetIDs.push(user);
      promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
      form.variables = JSON.parse(form.variables);
    }

    const results = await Promise.allSettled(promiseFriends);
    
    results.forEach((result, index) => {
      const user = newTargetIDs[index];
      if (result.status === "fulfilled" && !JSON.parse(result.value).errors) {
        success.push(`✅ ${user.node.name} (${user.node.id})`);
      } else {
        failed.push(`❌ ${user.node.name} (${user.node.id})`);
      }
    });

    let replyMsg = "";
    if (success.length > 0) {
      replyMsg += `✨ Successfully ${args[0] === 'add' ? 'Accepted' : 'Rejected'} ${success.length} Request(s):\n${success.join("\n")}\n\n`;
    }
    if (failed.length > 0) {
      replyMsg += `⚠️ Failed To Process ${failed.length} Request(s):\n${failed.join("\n")}`;
    }

    if (replyMsg) {
      api.sendMessage(replyMsg, event.threadID, event.messageID);
    } else {
      api.unsendMessage(messageID);
      api.sendMessage("❌ No Valid Requests Were Processed.", event.threadID);
    }

    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };
      
      const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;
      
      if (!listRequest || listRequest.length === 0) {
        return api.sendMessage("🌟 You Have No Pending Friend Requests!", event.threadID);
      }

      let msg = "🌈 Friend Requests List:\n\n";
      listRequest.forEach((user, index) => {
        msg += `🔹 ${index + 1}. ${user.node.name}\n`;
        msg += `   🆔: ${user.node.id}\n`;
        msg += `   🔗: ${user.node.url.replace("www.facebook", "fb")}\n`;
        msg += `   ⏰: ${moment(user.time * 1000).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n\n`;
      });

      msg += "💡 How To Respond:\n"
           + "• 'Add <Number>' To Accept A Request\n"
           + "• 'Del <Number>' To Reject A Request\n"
           + "• 'Add All' To Accept All\n"
           + "• 'Del All' To Reject All\n\n"
           + "⏳ This Menu Will Auto-Delete In 2 Minutes";

      api.sendMessage(msg, event.threadID, (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          unsendTimeout: setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 2 * 60 * 1000) // 2 minutes
        });
      }, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Oops! Something Went Wrong While Fetching Requests.", event.threadID);
    }
  }
};
