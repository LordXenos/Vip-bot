const axios = require('axios');
const fs = require('fs');
const { Shazam } = require('node-shazam');
const qs = require('qs');
const yts = require('yt-search');

module.exports = {
  config: {
    name: 'shazam',
    aliases: ["song"],
    description: 'Identify a song from audio/video or by search text',
    usage: 'Reply to an audio/video or type /shazam <song name>',
    category: 'media',
    cooldown: 0,
    ownerOnly: false
  },

  // Main command
  onStart: async function({ event, api, args }) {
    try {
      // ---------- If user replied to media ----------
      if (event.type === 'message_reply' && event.messageReply?.attachments?.length > 0) {
        const type = event.messageReply.attachments[0].type;
        let path;

        if (type === 'audio') path = __dirname + '/cache/song.mp3';
        else if (type === 'video') path = __dirname + '/cache/song.mp4';
        else return api.sendMessage('This is not an audio or video file.', event.threadID);

        // Download media
        const mediaUrl = event.messageReply.attachments[0].url;
        const buffer = Buffer.from((await axios.get(mediaUrl, { responseType: 'arraybuffer' })).data);
        fs.writeFileSync(path, buffer);

        // Recognize song
        const shazam = new Shazam();
        const result = await shazam.recognise(path, 'en-US');

        if (!result?.track) return api.sendMessage('❌ Could not recognize the song.', event.threadID);

        const songInfo = {
          title: result.track.title,
          artist: result.track.subtitle,
          cover: result.track.images.coverart
        };

        // Send song info & cover
        const sentMsg = await api.sendMessage({
          body: `🎵 Song: ${songInfo.title}\n👤 Artist: ${songInfo.artist}\nReply with "send" to get the audio.`,
          attachment: (await axios.get(songInfo.cover, { responseType: 'stream' })).data
        }, event.threadID);

        // Register reply listener
        if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
        global.GoatBot.onReply.set(sentMsg.messageID, {
          messageID: sentMsg.messageID,
          commandName: 'shazam',
          songName: songInfo.title,
          author: event.senderID
        });

        return;
      }

      // ---------- If user typed a search ----------
      if (args.length > 0) {
        const query = args.join(' ');
        const search = await yts(query);
        const video = search.videos[0];
        if (!video) return api.sendMessage('❌ Could not find the song on YouTube.', event.threadID);

        // Download MP3 via ssvid.net
        const mp3Data = await getMp3(video.url);
        if (!mp3Data?.dlink) return api.sendMessage('❌ Failed to get the MP3 link. Try again.', event.threadID);

        const filePath = __dirname + `/cache/${Date.now()}.mp3`;
        const response = await axios.get(mp3Data.dlink, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, Buffer.from(response.data));

        // Send audio
        const stream = fs.createReadStream(filePath);
        await api.sendMessage({ body: video.title, attachment: stream }, event.threadID);

        // Clean up
        fs.unlinkSync(filePath);
        return;
      }

      // If neither reply nor search
      return api.sendMessage('Reply to an audio/video or type /shazam <song name>', event.threadID);

    } catch (err) {
      console.error(err);
      return api.sendMessage('❌ Error while downloading the song. Please try again.', event.threadID);
    }
  },

  // Reply handler for media
  onReply: async function({ event, api, Reply }) {
    const { songName, author } = Reply;
    if (event.senderID !== author) return;
    if (event.body.toLowerCase() !== 'send') return;

    try {
      const search = await yts(songName);
      const video = search.videos[0];
      if (!video) return api.sendMessage('❌ Could not find the song on YouTube.', event.threadID);

      const mp3Data = await getMp3(video.url);
      if (!mp3Data?.dlink) return api.sendMessage('❌ Failed to get the MP3 link. Try again.', event.threadID);

      const filePath = __dirname + `/cache/${Date.now()}.mp3`;
      const response = await axios.get(mp3Data.dlink, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      const stream = fs.createReadStream(filePath);
      await api.sendMessage({ body: video.title, attachment: stream }, event.threadID);

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error(err);
      api.sendMessage('❌ Error while downloading the song. Please try again.', event.threadID);
    }
  }
};

// ------------------- Original ssvid.net helper functions -------------------
async function getInfo(url) {
  const data = qs.stringify({ query: url, cf_token: '', vt: 'youtube' });
  const config = {
    method: 'POST',
    url: 'https://ssvid.net/api/ajax/search',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
      'origin': 'https://ssvid.net',
      'referer': 'https://ssvid.net/youtube-to-mp4'
    },
    data
  };
  return (await axios.request(config)).data;
}

async function download(vidCode, KCode) {
  const data = qs.stringify({ vid: vidCode, k: KCode });
  const config = {
    method: 'POST',
    url: 'https://ssvid.net/api/ajax/convert',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
      'origin': 'https://ssvid.net',
      'referer': 'https://ssvid.net/youtube-to-mp4'
    },
    data
  };
  return (await axios.request(config)).data;
}

async function getMp3(link) {
  const info = await getInfo(link);
  const firstMp3 = Object.values(info.links.mp3)[0];
  const data = await download(info.vid, firstMp3.k);
  return data;
          }
