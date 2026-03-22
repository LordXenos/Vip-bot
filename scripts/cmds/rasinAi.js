const axios = require('axios');

const api = `https://rasin-ai.onrender.com/api/rasin`

module.exports = {
  config: {
    name: 'rasinai',
    aliases: ['rasin-ai'],
    prefix: true,
    author: 'Rasin',
    countDown: 2,
    role: 0,
    description: '( 𝗥𝗮𝘀𝗶𝗻 𝗔𝗜 x 𝗜𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻 x 𝗜𝗺𝗮𝗴𝗲 𝗖𝗹𝗮𝘀𝘀𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 x 𝗔𝘂𝗱𝗶𝗼 𝗔𝗻𝗮𝗹𝘆𝘇𝗲𝗿 )',
    category: 'ai'
  },

  onStart: async function ({ message, args, event }) {
    try {
      if (event.type === "message_reply" && event.messageReply.attachments?.[0]?.type === "audio") {
        const audioUrl = event.messageReply.attachments[0].url;
        const userMsg = args.join(" ") || "Transcribe this audio and provide both Bengali and English translations regardless of the audio language.";
        const waiting = await message.reply("🎧 | " + formatFont("Rasin AI analyzing audio, please wait..."));
        
        const apiUrl = `${api}/audio?message=${encodeURIComponent(userMsg)}&url=${encodeURIComponent(audioUrl)}`;
        const res = await axios.get(apiUrl);
        message.unsend(waiting.messageID);

        const replyText = res.data.reply;

        return message.reply({
          body: "🎧 𝗥𝗮𝘀𝗶𝗻 𝗔𝗜 | 𝗔𝘂𝗱𝗶𝗼 𝗔𝗻𝗮𝗹𝘆𝘇𝗲𝗿\n\n" + formatFont(replyText),
        }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }

      if (event.type === "message_reply" && event.messageReply.attachments?.[0]?.type === "photo") {
        const imgUrl = event.messageReply.attachments[0].url;
        const waiting = await message.reply("📷 | " + formatFont("Rasin AI recognizing image, please wait..."));
        const apiUrl = `${api}/image?message=describe+this+image&url=${encodeURIComponent(imgUrl)}`;
        const res = await axios.get(apiUrl);
        message.unsend(waiting.messageID);

        const replyText = res.data.reply;

        return message.reply({
          body: "📷 𝗥𝗮𝘀𝗶𝗻 𝗔𝗜 | 𝗜𝗺𝗮𝗴𝗲 𝗿𝗲𝗰𝗼𝗴𝗻𝗶𝘁𝗶𝗼𝗻\n\n" + formatFont(replyText),
        }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }

      const msg = args.join(" ");
      if (!msg) return message.reply('Ask me anything');

      const thinking = await message.reply("🗨️ | " + formatFont("Rasin AI is thinking..."));
      const url = `${api}/chat?message=${encodeURIComponent(msg)}&uid=${event.senderID}`;
      const response = await axios.get(url);
      const data = response.data;
      message.unsend(thinking.messageID);

      if (data.generatedImage) {
        return message.reply({
          body: data.message,
          attachment: await global.utils.getStreamFromURL(data.generatedImage)
        }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      } else {
        const replyText = data.message;
        return message.reply(
          "🎓 𝗥𝗮𝘀𝗶𝗻 𝗔𝗜\n\n" + formatFont(replyText),
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
          }
        );
      }

    } catch (err) {
      console.error(err);
      message.reply("Server error, try again later! 🥹");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    try {
      if (event.attachments?.[0]?.type === "audio") {
        const audioUrl = event.attachments[0].url;
        const userMsg = event.body || "Transcribe this audio and provide both Bengali and English translations regardless of the audio language.";
        const waiting = await message.reply("🎧 | " + formatFont("Rasin AI analyzing audio, please wait..."));
        
        const apiUrl = `${api}/audio?message=${encodeURIComponent(userMsg)}&url=${encodeURIComponent(audioUrl)}`;
        const res = await axios.get(apiUrl);
        message.unsend(waiting.messageID);

        const replyText = res.data.reply;

        return message.reply({
          body: "🎧 𝗥𝗮𝘀𝗶𝗻 𝗔𝗜 | 𝗔𝘂𝗱𝗶𝗼 𝗔𝗻𝗮𝗹𝘆𝘇𝗲𝗿\n\n" + formatFont(replyText),
        }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }

      if (event.attachments?.[0]?.type === "photo") {
        const imgUrl = event.attachments[0].url;
        const waiting = await message.reply("📷 | " + formatFont("Rasin AI recognizing image, please wait..."));
        const apiUrl = `${api}/image?message=describe+this+image&url=${encodeURIComponent(imgUrl)}`;
        const res = await axios.get(apiUrl);
        message.unsend(waiting.messageID);

        const replyText = res.data.reply;

        return message.reply({
          body: "📷 𝗥𝗮𝘀𝗶𝗻 𝗔𝗜 | 𝗜𝗺𝗮𝗴𝗲 𝗿𝗲𝗰𝗼𝗴𝗻𝗶𝘁𝗶𝗼𝗻\n\n" + formatFont(replyText),
          attachment: await global.utils.getStreamFromURL(imgUrl)
        }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }

      const msg = event.body;
      if (!msg) return;

      const thinking = await message.reply("🗨️ | " + formatFont("Rasin AI is thinking..."));
      const url = `${api}/chat?message=${encodeURIComponent(msg)}&uid=${Reply?.uid || event.senderID}`;
      const response = await axios.get(url);
      const data = response.data;
      message.unsend(thinking.messageID);

      if (data.generatedImage) {
        return message.reply({
          body: data.message,
          attachment: await global.utils.getStreamFromURL(data.generatedImage)
        }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      } else {
        const replyText = data.message;
        return message.reply(
          "🎓 𝗥𝗮𝘀𝗶𝗻 𝗔𝗜\n\n" + formatFont(replyText),
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
          }
        );
      }

    } catch (err) {
      console.error(err);
      message.reply("Error 🥹");
    }
  }
};

function formatFont(text) {
  const fontMapping = {
    a: "a", b: "b", c: "c", d: "d", e: "e", f: "f", g: "g", h: "h", i: "i", j: "j", k: "k", l: "l", m: "m",
    n: "n", o: "o", p: "p", q: "q", r: "r", s: "s", t: "t", u: "u", v: "v", w: "w", x: "x", y: "y", z: "z",
    A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", G: "G", H: "H", I: "I", J: "J", K: "K", L: "L", M: "M",
    N: "N", O: "O", P: "P", Q: "Q", R: "R", S: "S", T: "T", U: "U", V: "V", W: "W", X: "X", Y: "Y", Z: "Z"
  };
  return String(text).split('').map(c => fontMapping[c] || c).join('');
}
