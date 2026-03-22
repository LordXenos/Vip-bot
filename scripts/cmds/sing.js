const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API = "https://screenshot-etc-deviation-causing.trycloudflare.com";

module.exports = {
  config: {
    name: "sing",
    version: "8.0",
    author: "ariyan",
    role: 0,
    category: "media",
    countDown: 3
  },

  onStart: async function ({ args, message }) {
    const query = args.join(" ").trim();
    if (!query) return;

    try {
      if (query.startsWith("http"))
        return send(query, message);

      const id = await first(query + " official audio topic");
      if (!id) return;

      send(`https://youtube.com/watch?v=${id}`, message);
    } catch {}
  }
};

async function send(url, message) {
  try {
    const file = path.join(__dirname, "cache", Date.now() + ".mp3");
    await fs.promises.mkdir(path.dirname(file), { recursive: true });

    const res = await axios({
      method: "GET",
      url: `${API}/download?url=${encodeURIComponent(url)}&type=audio`,
      responseType: "stream",
      timeout: 600000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
        "Connection": "keep-alive"
      }
    });

    await new Promise((ok, err) => {
      const w = fs.createWriteStream(file);
      res.data.pipe(w);
      w.on("finish", ok);
      w.on("error", err);
    });

    await message.reply({ attachment: fs.createReadStream(file) });
    fs.unlink(file, () => {});
  } catch {}
}

async function first(q) {
  try {
    const { data } = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
    const raw = data.split("var ytInitialData = ")[1]?.split(";</script>")[0];
    if (!raw) return null;

    const json = JSON.parse(raw);
    let id = null;

    (function scan(o) {
      if (id || !o || typeof o !== "object") return;
      if (o.videoRenderer?.videoId) id = o.videoRenderer.videoId;
      for (const k in o) scan(o[k]);
    })(json);

    return id;
  } catch {
    return null;
  }
}