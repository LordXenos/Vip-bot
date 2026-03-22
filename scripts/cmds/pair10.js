const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Mahmud API বেস URL
const baseApiUrl = async () => {
	const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
	return base.data.mahmud;
};

module.exports = {
	config: {
		name: "pair10",
		version: "1.0",
		author: "Vydron1122",
		countDown: 10,
		role: 0,
		description: {
			en: "💕 Moonlight romance couple style with profile pictures (Style 10)"
		},
		category: "love",
		guide: {
			en: "{pn} - Find your moonlight love match"
		}
	},

	langs: {
		en: {
			noGender: "❌ Baby, your gender is not defined in your profile",
			noMatch: "😢 Sorry, no match found for you in this group",
			success: "💕 𝐌𝐨𝐨𝐧𝐥𝐢𝐠𝐡𝐭 𝐑𝐨𝐦𝐚𝐧𝐜𝐞 💕\n━━━━━━━━━━━━━━━━\n👤 𝐘𝐨𝐮: %1\n👤 𝐌𝐚𝐭𝐜𝐡: %2\n💞 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: %3%\n━━━━━━━━━━━━━━━━\n✨ 𝐒𝐭𝐚𝐫𝐥𝐢𝐭 𝐍𝐢𝐠𝐡𝐭 ✨",
			error: "❌ Error: %1"
		}
	},

	onStart: async function ({ api, event, message, getLang }) {
		const outputPath = path.join(__dirname, "cache", `pair10_${event.senderID}_${Date.now()}.png`);
		if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

		try {
			api.setMessageReaction("🌙", event.messageID, () => {}, true);
			
			const threadData = await api.getThreadInfo(event.threadID);
			const users = threadData.userInfo;
			
			const myData = users.find((u) => u.id === event.senderID);
			if (!myData || !myData.gender) return message.reply(getLang("noGender"));
			
			const myGender = myData.gender.toUpperCase();
			
			let matchCandidates = [];
			if (myGender === "MALE") {
				matchCandidates = users.filter((u) => u.gender === "FEMALE" && u.id !== event.senderID);
			} else if (myGender === "FEMALE") {
				matchCandidates = users.filter((u) => u.gender === "MALE" && u.id !== event.senderID);
			} else {
				matchCandidates = users.filter((u) => u.id !== event.senderID);
			}
			
			if (matchCandidates.length === 0) {
				api.setMessageReaction("😢", event.messageID, () => {}, true);
				return message.reply(getLang("noMatch"));
			}
			
			const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
			
			const name1 = myData.name || "You";
			const name2 = selectedMatch.name || "Partner";
			const percentage = Math.floor(Math.random() * 100) + 1;
			
			const apiUrl = await baseApiUrl();
			
			// Mahmud API - style=10 (Moonlight Romance Theme)
			const { data } = await axios.get(`${apiUrl}/api/pair/mahmud`, {
				params: {
					user1: event.senderID,
					user2: selectedMatch.id,
					style: 10  // style 10 = moonlight romance theme
				},
				responseType: "arraybuffer",
				timeout: 30000
			});
			
			fs.writeFileSync(outputPath, Buffer.from(data));
			
			return message.reply({
				body: getLang("success", name1, name2, percentage),
				attachment: fs.createReadStream(outputPath)
			}, () => {
				api.setMessageReaction("✅", event.messageID, () => {}, true);
				if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			});
			
		} catch (err) {
			console.error("Pair10 Error:", err);
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			return message.reply(getLang("error", err.message));
		}
	}
};