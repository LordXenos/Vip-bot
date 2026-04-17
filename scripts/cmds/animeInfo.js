const axios = require("axios");

module.exports = {
  config: {
    name: "myanimelist",
    aliases: ["mal", "myanimelist"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "entertainment",
    shortDescription: {
      en: "Search anime information from MyAnimeList",
    },
    guide: {
      en: "{pn} <anime name>\nExample: {pn} One Piece",
    },
  },

  onStart: async function ({ args, api, event }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          "Please provide an anime name to search!",
          event.threadID,
          event.messageID
        );
      }

      const query = args.join(" ");

      const msg = await api.sendMessage(
        `⭐ Searching for "${query}"...`,
        event.threadID
      );

      const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`;
      const response = await axios.get(searchUrl);

      if (!response.data.data || response.data.data.length === 0) {
        return api.editMessage(
          `✘ No anime found for "${query}".\nTry a different name.`,
          msg.messageID
        );
      }

      const anime = response.data.data[0];

      let result = `⭐ ANIME INFO ⭐\n\n`;
      result += `֎ ${anime.title}\n`;
      
      if (anime.title_english && anime.title_english !== anime.title) {
        result += `֎ ${anime.title_english}\n`;
      }
      
      result += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      result += `❍ TYPE: ${anime.type || 'N/A'}\n`;
      result += `❍ Episodes: ${anime.episodes || 'N/A'}\n`;
      result += `❍ Duration: ${anime.duration || 'N/A'}\n`;
      result += `❍ Status: ${anime.status || 'N/A'}\n`;
      
      if (anime.aired && anime.aired.string) {
        result += `❍ Aired: ${anime.aired.string}\n`;
      }
      
      if (anime.season && anime.year) {
        result += `❍ Season: ${anime.season} ${anime.year}\n`;
      }

      result += `\n❍ RATINGS:\n`;
      result += `❍ Score: ${anime.score || 'N/A'}/10\n`;
      result += `❍ Scored by: ${anime.scored_by?.toLocaleString() || 'N/A'} users\n`;
      result += `❍ Rank: #${anime.rank || 'N/A'}\n`;
      result += `❍ Popularity: #${anime.popularity || 'N/A'}\n`;

      if (anime.rating) {
        result += `\n❍ Rating: ${anime.rating}\n`;
      }

      if (anime.genres && anime.genres.length > 0) {
        const genres = anime.genres.map(g => g.name).join(", ");
        result += `\n❍ Genres:\n${genres}\n`;
      }

      if (anime.synopsis) {
        let synopsis = anime.synopsis;
        if (synopsis.length > 400) {
          synopsis = synopsis.substring(0, 400) + "...";
        }
        result += `\n❍ Synopsis:\n${synopsis}\n`;
      }

      result += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
      result += `❍ Link: ${anime.url}`;

      await api.editMessage(result, msg.messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "✘ Failed to fetch anime data! Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
