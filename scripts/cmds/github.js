const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "github",
    aliases: ["gh", "git"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "info",
    shortDescription: {
      en: "Get GitHub user information",
    },
    guide: {
      en: "{pn} <username>\nExample: {pn} torvalds",
    },
  },

  onStart: async function ({ args, api, event, message }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          "Please provide a GitHub username!",
          event.threadID,
          event.messageID
        );
      }

      const username = args[0];

      const msg = await api.sendMessage(
        `⭐ Searching for GitHub user "${username}"...`,
        event.threadID
      );

      const headers = {
        'User-Agent': 'GoatBot-v3',
        'Accept': 'application/vnd.github.v3+json'
      };

      const userUrl = `https://api.github.com/users/${username}`;
      const userResponse = await axios.get(userUrl, { headers });
      const user = userResponse.data;

      if (user.message === "Not Found") {
        message.unsend(msg.messageID);
        return api.sendMessage(
          `✘ User "${username}" not found on GitHub!`,
          event.threadID,
          event.messageID
        );
      }

      let result = `⭐ USER INFO ⭐\n\n`;
      result += `֎ Name: ${user.name || user.login}\n`;
      result += `֎ Username: @${user.login}\n\n`;
      result += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      if (user.bio) {
        result += `❍ Bio: ${user.bio}\n\n`;
      }

      if (user.company) {
        result += `❍ Company: ${user.company}\n`;
      }

      if (user.location) {
        result += `❍ Location: ${user.location}\n`;
      }

      if (user.blog) {
        result += `❍ Website: ${user.blog}\n`;
      }

      if (user.twitter_username) {
        result += `❍ Twitter: @${user.twitter_username}\n`;
      }

      result += `\n❍ STATISTICS:\n`;
      result += `❍ Public Repos: ${user.public_repos}\n`;
      result += `❍ Public Gists: ${user.public_gists}\n`;
      result += `❍ Followers: ${user.followers}\n`;
      result += `❍ Following: ${user.following}\n\n`;

      result += `❍ Created: ${new Date(user.created_at).toLocaleDateString()}\n`;
      result += `❍ Updated: ${new Date(user.updated_at).toLocaleDateString()}\n\n`;

      result += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      result += `❍ Profile: ${user.html_url}`;

      const imagePath = path.join(__dirname, "cache", `github_${username}_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(imagePath);
      
      const imageResponse = await axios({
        url: user.avatar_url,
        method: 'GET',
        responseType: 'stream'
      });

      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      message.unsend(msg.messageID);

      await api.sendMessage(
        {
          body: result,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID,
        event.messageID
      );

      fs.unlinkSync(imagePath);

    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 404) {
        return api.sendMessage(
          `✘ User not found on GitHub!`,
          event.threadID,
          event.messageID
        );
      }
      return api.sendMessage(
        "✘ Failed to fetch GitHub data! Please try again.",
        event.threadID,
        event.messageID
      );
    }
  },
};