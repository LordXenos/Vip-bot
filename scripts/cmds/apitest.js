const axios = require("axios");
const fs = require("fs");
const path = require("path");

const urlRegex = /^(.*?\b)?https?:\/\/[\w.-]+(:\d+)?(\/[\w-./?%&=+]*)?(\b.*)?$/i;
const tempDir = path.join(__dirname, "cache");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

function getExtensionFromContentType(contentType) {
  if (!contentType) return "txt";
  const typeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/ogg": "mp3",
    "audio/wav": "mp3",
    "audio/aac": "mp3",
    "audio/flac": "mp3",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "mp4"
  };
  return typeMap[contentType.split(";")[0]] || "txt";
}

async function sendFile(message, fileExt, data, caption) {
  const filePath = path.join(tempDir, `file_${Date.now()}.${fileExt}`);
  fs.writeFileSync(filePath, data);
  const sent = await message.reply({
    body: caption,
    attachment: fs.createReadStream(filePath),
  });
  fs.unlinkSync(filePath);
  setTimeout(() => sent.unsend(), 180000);
}

module.exports = {
  config: {
    name: "apitest",
    version: "1.0.0",
    author: "Rasin",
    prefix: false,
    countDown: 4,
    role: 2,
    description: {
      en: "Api test",
    },
    category: "API TEST",
    guide: {
      en: "   {pn}apitest (get, post) url"
    },
  },

  onStart: async function ({ message, event, args, role }) {
    if (!args.length) {
      return message.reply(
        "𝚄𝚜𝚊𝚐𝚎:\n𝙶𝙴𝚃: 𝚊𝚙𝚒𝚝𝚎𝚜𝚝 <𝚞𝚛𝚕>\n𝙿𝙾𝚂𝚃: 𝚊𝚙𝚒𝚝𝚎𝚜𝚝 <𝚞𝚛𝚕> <𝚙𝚘𝚜𝚝_𝚍𝚊𝚝𝚊>\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: \n𝚊𝚙𝚒𝚝𝚎𝚜𝚝 𝚑𝚝𝚝𝚙𝚜://𝚎𝚡𝚊𝚖𝚙𝚕𝚎.𝚌𝚘𝚖/𝚊𝚙𝚒/𝚌𝚑𝚊𝚝?𝚚=𝚑𝚎𝚕𝚕𝚘 (𝙶𝙴𝚃)\n𝚊𝚙𝚒𝚝𝚎𝚜𝚝 𝚑𝚝𝚝𝚙𝚜://𝚎𝚡𝚊𝚖𝚙𝚕𝚎.𝚌𝚘𝚖/𝚊𝚙𝚒/𝚌𝚑𝚊𝚝 𝚚=𝚑𝚎𝚕𝚕𝚘&𝚞𝚒𝚍=1 (𝙿𝙾𝚂𝚃)"
      );
    }

    let url = args[0]?.replace(/\(\.\)/g, ".") || "";
    if (!urlRegex.test(url)) return message.reply("𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝙰𝚙𝚒 𝚄𝚁𝙻");

    const isPost = args.length >= 2;
    let postData = isPost ? args.slice(1).join(" ") : null;

    try {
      const options = {
        method: isPost ? "POST" : "GET",
        url,
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "*/*"
        }
      };

      if (isPost && postData) {
        try {
          postData = JSON.parse(postData);
          options.data = postData;
          options.headers["Content-Type"] = "application/json";
        } catch {
          options.data = new URLSearchParams(postData);
          options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
      }

      const { data, headers } = await axios(options);
      const contentType = headers["content-type"] || "";
      const fileExt = getExtensionFromContentType(contentType);

      if (contentType.includes("json")) {
        const jsonData = JSON.parse(data.toString());
        const formatted = JSON.stringify(jsonData, null, 2);
        return formatted.length > 4000
          ? sendFile(message, "txt", formatted, "📄 𝙻𝚊𝚛𝚐𝚎 𝙹𝚂𝙾𝙽 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚊𝚝𝚝𝚊𝚌𝚑𝚎𝚍.")
          : message.reply(formatted);
      }

      if (/image|video|audio|gif/.test(contentType)) {
        return sendFile(message, fileExt, data, `😶‍🌫️ 𝙷𝚎𝚛𝚎'𝚜 𝚢𝚘𝚞𝚛 ${fileExt.toUpperCase()}:`);
      }

      return sendFile(message, "txt", data.toString(), "📄 𝙽𝚘𝚗-𝙹𝚂𝙾𝙽 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚊𝚝𝚝𝚊𝚌𝚑𝚎𝚍.");
    } catch (error) {
      let errMsg = `𝙰𝚗 𝚎𝚛𝚛𝚘𝚛: ${error.message}`;
      if (error.response) {
        errMsg += `\nStatus: ${error.response.status}`;
        if (error.response.data) {
          errMsg += `\nResponse: ${error.response.data.toString().slice(0, 400)}`;
        }
      }
      message.reply(errMsg);
    }
  }
};