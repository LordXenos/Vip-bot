const axios = require("axios");

module.exports = {
  config: {
    name: "dictionary",
    aliases: ["dict", "define", "meaning"],
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "education",
    shortDescription: {
      en: "Get word definitions, pronunciation, and examples",
    },
    guide: {
      en: "{pn} <word>\nExample: {pn} serendipity",
    },
  },

  onStart: async function ({ args, api, event, message }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(
          "Please provide a word to define!",
          event.threadID,
          event.messageID
        );
      }

      const word = args[0].toLowerCase();

      const msg = await api.sendMessage(
        `⭐ Looking up "${word}"...`,
        event.threadID
      );

      const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const response = await axios.get(apiUrl);
      const data = response.data[0];

      if (!data) {
        message.unsend(msg.messageID);
        return api.sendMessage(
          `✘ No definition found for "${word}".\nPlease check the spelling and try again.`,
          event.threadID,
          event.messageID
        );
      }

      let result = `⭐ DICTIONARY ⭐\n\n`;
      result += `֎ Word: ${data.word}\n`;
      
      if (data.phonetic) {
        result += `֎ Pronunciation: ${data.phonetic}\n`;
      }
      
      result += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;


      const meaningsToShow = data.meanings.slice(0, 3);
      
      meaningsToShow.forEach((meaning, index) => {
        result += `❍ ${meaning.partOfSpeech.toUpperCase()}:\n`;
        

        const defsToShow = meaning.definitions.slice(0, 2);
        
        defsToShow.forEach((def, defIndex) => {
          result += `${defIndex + 1}. ${def.definition}\n`;
          
          if (def.example) {
            result += `   Example: "${def.example}"\n`;
          }
        });
        
        if (meaning.synonyms && meaning.synonyms.length > 0) {
          const synonyms = meaning.synonyms.slice(0, 5).join(", ");
          result += `   Synonyms: ${synonyms}\n`;
        }
        
        result += `\n`;
      });

      if (data.sourceUrls && data.sourceUrls.length > 0) {
        result += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        result += `❍ Source: ${data.sourceUrls[0]}`;
      }

      message.unsend(msg.messageID);

      await api.sendMessage(
        result,
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 404) {
        return api.sendMessage(
          `✘ Word not found in dictionary!\nPlease check the spelling.`,
          event.threadID,
          event.messageID
        );
      }
      return api.sendMessage(
        "✘ Failed to fetch dictionary data! Please try again.",
        event.threadID,
        event.messageID
      );
    }
  },
};