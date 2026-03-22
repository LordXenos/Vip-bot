module.exports = {
  config: {
    name: "story",
    aliases: [],
    version: "2.4.73",
    author: "Rasin",
    countDown: 3,
    role: 2,
    shortDescription: "Complete story management - reply, react, seen, add, delete",
    longDescription: "Comprehensive story management with support for replies, reactions, marking as seen, adding stories, and deleting stories",
    category: "owner",
    guide: {
      en: "   {pn} react <storyID> <reaction> -> react to story\n"
         + "   {pn} seen <storyID> -> mark story as seen\n"
         + "   {pn} add <attachment> -> add new story\n"
         + "   {pn} delete <storyID> -> delete your story\n"
         + "   {pn} check -> check your stories\n"
         + "   Reply with photo/video to add story"
    }
  },

  langs: {
    en: {
      loading: "❍ Processing your story request...",
      success: "❍ Story operation completed successfully",
      error: "❍ An error occurred: %1",
      invalidStoryId: "❍ Invalid story ID provided",
      noMessage: "❍ No message provided for reply",
      replySuccess: "❍ Reply sent to story successfully",
      reactSuccess: "❍ Reaction added to story successfully",
      seenSuccess: "❍ Story marked as seen successfully",
      storyAdded: "❍ Story added successfully",
      storyDeleted: "❍ Story deleted successfully",
      noStories: "❍ No stories found in your account",
      selectOption: "❍ Select an option:\n❍ 1 - Reply to story\n❍ 2 - React to story\n❍ 3 - Mark as seen\n❍ 4 - Check all stories\n❍ 5 - Delete story"
    }
  },

  onStart: async function ({ event, message, api, args, getLang, commandName }) {
    try {
      if (args.length === 0) {
        return message.reply(module.exports.config.guide.en);
      }

      const action = args[0].toLowerCase();

      switch (action) {
        case 'react':
          return await module.exports.handleStoryReaction(args, api, message, getLang);

        case 'seen':
          return await module.exports.handleStorySeen(args, api, message, getLang);

        case 'add':
          return await module.exports.handleAddStory(args, api, message, getLang, event);

        case 'delete':
          return await module.exports.handleDeleteStory(args, api, message, getLang);

        case 'check':
          return await module.exports.handleCheckStories(api, message, getLang, event);

        default:
          return message.reply(module.exports.config.guide.en);
      }

    } catch (error) {
      console.error("Story command error:", error);
      return message.reply(getLang("error", error.message));
    }
  },

  handleStoryReaction: async function (args, api, message, getLang) {
    if (args.length < 3) {
      return message.reply("❍ Usage: story react <storyID> <reaction>");
    }

    const storyID = args[1];
    const reaction = args[2];

    try {
      const result = await new Promise((resolve, reject) => {
        api.setStoryReaction(storyID, reaction, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      let replyx = `${getLang("reactSuccess")}\n`;
      replyx += `❍ Story ID: ${result.story_id}\n`;
      replyx += `❍ Reaction: ${result.reaction}\n`;
      replyx += `❍ Time: ${new Date(result.timestamp).toLocaleString()}`;

      return message.reply(replyx);
    } catch (error) {
      return message.reply(getLang("error", error.message));
    }
  },

  handleStorySeen: async function (args, api, message, getLang) {
    if (args.length < 2) {
      return message.reply("❍ Usage: story seen <storyID>");
    }

    const storyID = args[1];

    try {
      const result = await new Promise((resolve, reject) => {
        api.setStorySeen(storyID, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      let replyx = `${getLang("seenSuccess")}\n`;
      replyx += `❍ Story ID: ${result.story_id}\n`;
      replyx += `❍ Bucket ID: ${result.bucket_id}\n`;
      replyx += `❍ Seen Time: ${new Date(result.seen_time).toLocaleString()}`;

      return message.reply(replyx);
    } catch (error) {
      return message.reply(getLang("error", error.message));
    }
  },

  handleAddStory: async function (args, api, message, getLang, event) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return message.reply("❍ Reply to a photo/video to add as story or use: story add with attachment");
    }

    const attachment = event.messageReply.attachments[0];

    if (!['photo', 'video'].includes(attachment.type)) {
      return message.reply("❍ Only photo and video attachments are supported for stories");
    }

    try {
      const attachmentStream = await global.utils.getStreamFromURL(attachment.url);

      const result = await new Promise((resolve, reject) => {
        api.storyManager({ action: 'add', attachment: attachmentStream }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      let replyx = `${getLang("storyAdded")}\n`;
      replyx += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      replyx += `❍ Story ID: ${result.story_id}\n`;
      replyx += `❍ Photo ID: ${result.photoID}\n`;
      replyx += `❍ Success: ${result.success ? 'Yes' : 'No'}\n`;
      replyx += `❍ Created: ${new Date().toLocaleString()}\n`;
      replyx += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      replyx += `❍ Save this Story ID for future reference: ${result.story_id}`;

      return message.reply(replyx);

    } catch (error) {
      return message.reply(getLang("error", error.message));
    }
  },

  handleDeleteStory: async function (args, api, message, getLang) {
    if (args.length < 2) {
      return message.reply("❍ Usage: story delete <storyID>");
    }

    const storyID = args[1];

    try {
      const result = await new Promise((resolve, reject) => {
        api.storyManager({ action: 'delete', storyID: storyID }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      let replyx = `${getLang("storyDeleted")}\n`;
      replyx += `❍ Deleted Story IDs: ${result.deleted_story_ids.join(', ')}\n`;
      replyx += `❍ Success: ${result.success ? 'Yes' : 'No'}\n`;
      replyx += `❍ Deleted: ${new Date().toLocaleString()}`;

      return message.reply(replyx);
    } catch (error) {
      return message.reply(getLang("error", error.message));
    }
  },

  handleCheckStories: async function (api, message, getLang, event) {
    try {
      const result = await new Promise((resolve, reject) => {
        api.storyManager({ action: 'check' }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      if (!result || (!result.stories && !result.count) || (result.stories && result.stories.length === 0) || (result.count === 0)) {
        return message.reply(getLang("noStories"));
      }

      const stories = result.stories || [];
      const storyCount = result.count || stories.length;

      let replyx = `❍ Your Stories (${storyCount}):\n`;
      replyx += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      if (stories.length > 0) {
        stories.slice(0, 10).forEach((story, index) => {
          replyx += `❍ ${index + 1}. Story ID: ${story.id}\n`;
          replyx += `   ❍ Created: ${new Date(story.creation_time * 1000).toLocaleString()}\n`;
          replyx += `   ❍ Attachments: ${story.attachments ? story.attachments.length : 0}\n`;
          if (story.bucket_id) {
            replyx += `   ❍ Bucket ID: ${story.bucket_id}\n`;
          }
          replyx += `\n`;
        });

        if (stories.length > 10) {
          replyx += `❍ ... and ${stories.length - 10} more stories\n\n`;
        }
      } else if (storyCount > 0) {
        replyx += `❍ You have ${storyCount} stories available\n`;
        replyx += `❍ Try refreshing or check your Facebook app\n\n`;
      }

      replyx += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      replyx += `❍ Total Stories: ${storyCount}\n`;
      replyx += `❍ Retrieved: ${new Date().toLocaleString()}`;

      return message.reply({
        body: replyx
      }, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            stories: stories,
            type: 'story_list'
          });
        }
      });

    } catch (error) {
      return message.reply(getLang("error", error.message));
    }
  },

  onReply: async function ({ message, event, Reply, getLang, api }) {
    const { storyID, stories, type } = Reply;
    const input = event.body.trim();

    if (type === 'options') {
      switch (input) {
        case '1':
        case '1️⃣':
          return message.reply(`❍ Send your reply message for story: ${storyID}`);

        case '2':
        case '2️⃣':
          return message.reply("❍ Send reaction emoji (👍, ❤️, 😂, 😮, 😢, 😡, 😶) or type (like, love, haha, wow, sad, angry, hudai)");

        case '3':
        case '3️⃣':
          try {
            await new Promise((resolve, reject) => {
              api.setStorySeen(storyID, (err, data) => {
                if (err) reject(err);
                else resolve(data);
              });
            });
            return message.reply(getLang("seenSuccess"));
          } catch (error) {
            return message.reply(getLang("error", error.message));
          }

        case '4':
        case '4️⃣':
          return await module.exports.handleCheckStories(api, message, getLang, event);

        case '5':
        case '5️⃣':
          return message.reply(`❍ Send story ID to delete (current: ${storyID})`);
      }

      const reactionMap = {
        '👍': 'like',
        '❤️': 'love',
        '😂': 'haha',
        '😮': 'wow',
        '😢': 'sad',
        '😡': 'angry',
        '😶': 'hudai'
      };

      if (reactionMap[input] || ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'hudai'].includes(input.toLowerCase())) {
        const reaction = reactionMap[input] || input.toLowerCase();
        try {
          await new Promise((resolve, reject) => {
            api.setStoryReaction(storyID, reaction, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          return message.reply(getLang("reactSuccess"));
        } catch (error) {
          return message.reply(getLang("error", error.message));
        }
      }

      if (input.length > 0) {
        try {
          await new Promise((resolve, reject) => {
            api.sendStoryReply(storyID, input, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          return message.reply(getLang("replySuccess"));
        } catch (error) {
          return message.reply(getLang("error", error.message));
        }
      }
    }

    if (type === 'story_list') {
      const storyIndex = parseInt(input) - 1;
      if (storyIndex >= 0 && storyIndex < stories.length) {
        const selectedStory = stories[storyIndex];
        let storyInfo = `❍ Story Details:\n`;
        storyInfo += `❍ ID: ${selectedStory.id}\n`;
        storyInfo += `❍ Created: ${new Date(selectedStory.creation_time * 1000).toLocaleString()}\n`;
        storyInfo += `❍ Attachments: ${selectedStory.attachments.length}\n`;
        storyInfo += `❍ Bucket ID: ${selectedStory.bucket_id}\n\n`;
        storyInfo += `❍ Options: reply ${selectedStory.id} <message> or react ${selectedStory.id} <reaction>`;

        return message.reply(storyInfo);
      }
    }
  }
};