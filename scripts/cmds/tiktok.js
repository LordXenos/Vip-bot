const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "tiktok",
		version: "7.0",
		author: "Vydron1122",
		countDown: 10,
		role: 0,
		description: {
			en: "🎵 Search and download TikTok videos by keyword"
		},
		category: "media",
		guide: {
			en: "{pn} [search title]"
		},
		aliases: ["tiksr", "tt", "tik"]
	},

	onStart: async function ({ message, event, args, api }) {
		const searchQuery = args.join(" ");
		
		if (!searchQuery) {
			return message.reply("❌ Please enter a search title!\nExample: !tiktok goku 4k");
		}

		const waitMsg = await message.reply(`🔍 Searching for "${searchQuery}"...`);

		try {
			// ফ্রি API (RAPIDAPI ছাড়া)
			const response = await axios.get(`https://weeb-api.vercel.app/tiktok-search?query=${encodeURIComponent(searchQuery)}`);
			
			if (!response.data || response.data.length === 0) {
				throw new Error("No videos found");
			}

			const video = response.data[0];
			
			// ভিডিও ডাউনলোড
			const cacheDir = path.join(__dirname, "cache");
			if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
			
			const filePath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);
			
			const videoResponse = await axios.get(video.video, { 
				responseType: "stream",
				timeout: 20000
			});

			const writer = fs.createWriteStream(filePath);
			videoResponse.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on('finish', resolve);
				writer.on('error', reject);
			});

			await api.unsendMessage(waitMsg.messageID);

			return message.reply({
				body: `🎵 **TikTok Video** 🎵\n━━━━━━━━━━━━━━━━\n🔍 **Search:** ${searchQuery}\n📹 **Title:** ${video.title || 'No title'}\n👤 **Author:** ${video.author || 'Unknown'}\n━━━━━━━━━━━━━━━━\n✨ Enjoy!`,
				attachment: fs.createReadStream(filePath)
			});

		} catch (error) {
			console.error("TikTok Error:", error);
			
			if (waitMsg?.messageID) {
				try { await api.unsendMessage(waitMsg.messageID); } catch (e) {}
			}

			return message.reply(
				`❌ Failed: ${error.message || 'Try another keyword'}`
			);
		}
	}
};