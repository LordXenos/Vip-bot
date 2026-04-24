const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Shazam } = require('node-shazam');

const fonts = {
  bold: (text) => {
    if (!text) return "";
    const str = String(text);
    const map = {
      'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
      'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
      '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
    };
    return str.split('').map(char => map[char] || char).join('');
  }
};

const getLayout = () => {
  const layouts = [
    { h: "☁️ ⋆⁺₊⋆ ───── ୨ 🌸 ୧ ───── ⋆⁺₊⋆ ☁️", f: "☁️ ⋆⁺₊⋆ ───── ୨ 🍼 ୧ ───── ⋆⁺₊⋆ ☁️", icon: "🎧" },
    { h: "🍓 ━━━━━━━ 🍓🍼🍓 ━━━━━━━ 🍓", f: "🍓 ━━━━━━━ 🍰✨🍰 ━━━━━━━ 🍓", icon: "🎵" },
    { h: "🩰 ━━━━━━━ 🎀 ━━━━━━━ 🩰", f: "🌸━━━━━━━ ✨ ━━━━━━━ 🩰", icon: "💿" },
    { h: "🐾 ⋆⁺₊⋆ ──────── ୨ 🐾 ୧ ──────── ⋆⁺₊⋆ 🐾", f: "🐾 ⋆⁺₊⋆ ──────── ୨ 🧁 ୧ ──────── ⋆⁺₊⋆ 🐾", icon: "🎶" }
  ];
  return layouts[Math.floor(Math.random() * layouts.length)];
};

module.exports = {
  config: {
    name: 'find',
    aliases: ["Shazam", "findsong"],
    version: "2.6",
    author: "Rafi chowdhury",
    role: 0,
    countDown: 5,
    description: "Identify and download songs",
    category: "media",
    guide: { en: "{pn} <song name> OR Reply to audio/video." }
  },

  onStart: async function({ event, api, args, commandName }) {
    const ui = getLayout();

    try {
      if (event.type === 'message_reply' && event.messageReply?.attachments?.length > 0) {
        const type = event.messageReply.attachments[0].type;
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        let filePath;
        if (type === 'audio') filePath = path.join(cacheDir, `shazam_${Date.now()}.mp3`);
        else if (type === 'video') filePath = path.join(cacheDir, `shazam_${Date.now()}.mp4`);
        else return api.sendMessage(`❌ ${fonts.bold("𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐚𝐮𝐝𝐢𝐨 𝐨𝐫 𝐯𝐢𝐝𝐞𝐨 𝐟𝐢𝐥𝐞.")}`, event.threadID, event.messageID);

        const mediaUrl = event.messageReply.attachments[0].url;
        const buffer = Buffer.from((await axios.get(mediaUrl, { responseType: 'arraybuffer' })).data);
        fs.writeFileSync(filePath, buffer);

        const shazam = new Shazam();
        const result = await shazam.recognise(filePath, 'en-US');

        try { fs.unlinkSync(filePath); } catch (_) {}

        if (!result?.track) return api.sendMessage(`❌ ${fonts.bold("𝐂𝐨𝐮𝐥𝐝𝐧'𝐭 𝐫𝐞𝐜𝐨𝐠𝐧𝐢𝐳𝐞 𝐭𝐡𝐞 𝐬𝐨𝐧𝐠.")}`, event.threadID, event.messageID);

        const songTitle = result.track.title || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
        const artist = result.track.subtitle || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
        const coverUrl = result.track.images?.coverart;

        let releaseDate = "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
        let album = "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
        let genre = result.track.genres?.primary || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";

        const songSection = result.track.sections?.find(sec => sec.type === 'SONG');
        if (songSection && songSection.metadata) {
          const releaseMeta = songSection.metadata.find(m => m.title === 'Released');
          if (releaseMeta) releaseDate = releaseMeta.text;
          const albumMeta = songSection.metadata.find(m => m.title === 'Album');
          if (albumMeta) album = albumMeta.text;
        }

        let coverAttachment = null;
        if (coverUrl) {
          const coverStream = await axios.get(coverUrl, { responseType: 'stream' });
          coverStream.data.path = "cover.jpg";
          coverAttachment = coverStream.data;
        }

        const infoMessage = 
          `${ui.h}\n` +
          `      ${ui.icon} ${fonts.bold("𝐒𝐨𝐧𝐠 𝐈𝐝𝐞𝐧𝐭𝐢𝐟𝐢𝐞𝐝")} ${ui.icon}\n\n` +
          `🎵 ${fonts.bold("𝐓𝐢𝐭𝐥𝐞")}   : ${fonts.bold(songTitle)}\n` +
          `👤 ${fonts.bold("𝐀𝐫𝐭𝐢𝐬𝐭")}  : ${artist}\n` +
          `💿 ${fonts.bold("𝐀𝐥𝐛𝐮𝐦")}   : ${album}\n` +
          `📅 ${fonts.bold("𝐑𝐞𝐥𝐞𝐚𝐬𝐞")} : ${releaseDate}\n` +
          `🎶 ${fonts.bold("𝐆𝐞𝐧𝐫𝐞")}   : ${genre}\n\n` +
          `📥 ${fonts.bold("𝐑𝐞𝐚𝐜𝐭 ❤️‍🩹 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐚𝐮𝐝𝐢𝐨")}\n` +
          `${ui.f}`;

        api.sendMessage({
          body: infoMessage,
          attachment: coverAttachment
        }, event.threadID, (err, info) => {
          if (err) return console.error(err);
          
          if (!global.GoatBot.onReaction) global.GoatBot.onReaction = new Map();
          global.GoatBot.onReaction.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            songName: `${songTitle} ${artist}`,
            author: event.senderID
          });
        });

        return;
      }

      if (args.length > 0) {
        const query = args.join(' ');
        return downloadAndSendAudio(query, api, event);
      }

      return api.sendMessage(`❌ ${fonts.bold("𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐮𝐝𝐢𝐨/𝐯𝐢𝐝𝐞𝐨 𝐨𝐫 𝐬𝐞𝐚𝐫𝐜𝐡 𝐰𝐢𝐭𝐡 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.")}`, event.threadID, event.messageID);

    } catch (err) {
      console.error("[shazam]", err);
      return api.sendMessage(`❌ ${fonts.bold("𝐄𝐫𝐫𝐨𝐫 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐭𝐡𝐞 𝐫𝐞𝐪𝐮𝐞𝐬𝐭.")}`, event.threadID, event.messageID);
    }
  },

  onReaction: async function({ event, api, Reaction }) {
    const { songName, author, messageID } = Reaction;
    
    if (event.reaction !== '❤️‍🩹') return;
    if (event.userID !== author) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    
    await downloadAndSendAudio(songName, api, event);
    
    global.GoatBot.onReaction.delete(messageID);
  }
};

async function downloadAndSendAudio(query, api, event) {
  const { threadID, messageID } = event;
  let tempAudioPath;

  try {
    const res = await axios.get(`https://azadx69x-all-apis-top.vercel.app/api/sing?song=${encodeURIComponent(query)}`, { timeout: 20000 });
    const data = res.data;

    if (!data.success || !data.audio?.url) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ ${fonts.bold("𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐞𝐭𝐜𝐡 𝐚𝐮𝐝𝐢𝐨 𝐔𝐑𝐋.")}`, threadID, messageID);
    }

    const title = data.info?.title || query;
    const artist = data.info?.artist || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐀𝐫𝐭𝐢𝐬𝐭";
    const audioUrl = data.audio.url;

    // FIX: Using arraybuffer to bypass stream abortion from cheap servers
    const audioRes = await axios({
      method: 'GET',
      url: audioUrl,
      responseType: 'arraybuffer',
      timeout: 120000, // 2 minutes timeout for slow API
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*'
      }
    });

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    tempAudioPath = path.join(cacheDir, `shazam_result_${Date.now()}.mp3`);

    fs.writeFileSync(tempAudioPath, Buffer.from(audioRes.data));

    const successMsg = 
      `🎧 ${fonts.bold("𝐀𝐮𝐝𝐢𝐨 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝")}\n\n` +
      `🎵 ${fonts.bold(title)}\n` +
      `👤 ${artist}`;

    await api.sendMessage({
      body: successMsg,
      attachment: fs.createReadStream(tempAudioPath)
    }, threadID, messageID);

    api.setMessageReaction("✅", messageID, () => {}, true);

  } catch (err) {
    console.error("[shazam audio fetch]", err.message);
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(`❌ ${fonts.bold("𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐦𝐮𝐬𝐢𝐜:")} ${err.message}`, threadID, messageID);
  } finally {
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      try { fs.unlinkSync(tempAudioPath); } catch (_) {}
    }
  }
}
