const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const { createCanvas, loadImage } = require("canvas");

const API_KEY = "zenzkey_69fab08854f6";

const agent = new https.Agent({
	rejectUnauthorized: false,
	secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
});

// ফেসবুক প্রোফাইল পিক ফেচ করার ফাংশন
async function getFacebookProfilePic(uid, retries = 3) {
	const urls = [
		`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
		`https://graph.facebook.com/v17.0/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
		`https://graph.facebook.com/${uid}/picture?type=large&width=512&height=512`
	];

	for (let i = 0; i < retries; i++) {
		for (const url of urls) {
			try {
				const response = await axios.get(url, { 
					responseType: "arraybuffer",
					timeout: 10000,
					httpsAgent: agent
				});
				if (response.status === 200) {
					return response.data;
				}
			} catch (e) {
				continue;
			}
		}
		await new Promise(resolve => setTimeout(resolve, 2000));
	}
	return null;
}

// লোকাল পেয়ার ইমেজ জেনারেটর (অ্যানিমে স্টাইল)
async function generateLocalPairImage(user1Id, user1Name, user2Id, user2Name, percentage) {
	const canvas = createCanvas(800, 400);
	const ctx = canvas.getContext("2d");

	// অ্যানিমে স্টাইল ব্যাকগ্রাউন্ড
	const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
	gradient.addColorStop(0, "#ff9a9e");
	gradient.addColorStop(0.5, "#fad0c4");
	gradient.addColorStop(1, "#ff9a9e");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// ইউজার ১ প্রোফাইল
	try {
		const avatar1Data = await getFacebookProfilePic(user1Id);
		if (avatar1Data) {
			const avatar1 = await loadImage(Buffer.from(avatar1Data));
			ctx.save();
			ctx.beginPath();
			ctx.arc(200, 200, 80, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar1, 120, 120, 160, 160);
			ctx.restore();
		} else {
			ctx.fillStyle = "#ffb6c1";
			ctx.beginPath();
			ctx.arc(200, 200, 80, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 60px Arial";
			ctx.fillText("👤", 160, 240);
		}
	} catch (e) {}

	// ইউজার ২ প্রোফাইল
	try {
		const avatar2Data = await getFacebookProfilePic(user2Id);
		if (avatar2Data) {
			const avatar2 = await loadImage(Buffer.from(avatar2Data));
			ctx.save();
			ctx.beginPath();
			ctx.arc(600, 200, 80, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar2, 520, 120, 160, 160);
			ctx.restore();
		} else {
			ctx.fillStyle = "#ffb6c1";
			ctx.beginPath();
			ctx.arc(600, 200, 80, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 60px Arial";
			ctx.fillText("👤", 560, 240);
		}
	} catch (e) {}

	// হার্ট ইমোজি
	ctx.font = "bold 80px Arial";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("💕", 360, 200);

	// অ্যানিমে স্টাইল লাভ পার্সেন্টেজ
	ctx.font = "bold 30px Arial";
	ctx.fillStyle = "#ffffff";
	ctx.fillText(`${percentage}%`, 380, 300);

	// অ্যানিমে টেক্সট
	ctx.font = "bold 20px Arial";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("✨𝐌𝐚𝐠𝐢𝐜𝐚𝐥 𝐀𝐧𝐢𝐦𝐞 𝐂𝐨𝐮𝐩𝐥𝐞✨", 300, 350);

	return canvas.toBuffer();
}

module.exports = {
	config: {
		name: "pair3",
		version: "2.0",
		author: "Vydron1122",
		countDown: 10,
		role: 0,
		description: {
			en: "💕 Anime style love match (New API)"
		},
		category: "love",
		guide: {
			en: "{pn} - Find your anime style love match"
		}
	},

	onStart: async function ({ api, event, message }) {
		const outputPath = path.join(__dirname, "cache", `pair3_${event.senderID}_${Date.now()}.png`);
		if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

		try {
			api.setMessageReaction("💕", event.messageID, () => {}, true);
			
			const threadData = await api.getThreadInfo(event.threadID);
			const users = threadData.userInfo;
			
			const myData = users.find((u) => u.id === event.senderID);
			if (!myData || !myData.gender) {
				api.setMessageReaction("😢", event.messageID, () => {}, true);
				return message.reply("❌ Baby, your gender is not defined in your profile");
			}
			
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
				return message.reply("😢 Sorry, no match found for you in this group");
			}
			
			const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
			
			const name1 = myData.name || "You";
			const name2 = selectedMatch.name || "Partner";
			const percentage = Math.floor(Math.random() * 100) + 1;

			let imageBuffer = null;

			// অপশন ১: API থেকে আনার চেষ্টা
			try {
				const apiUrl = `https://api.zahwazein.xyz/entertainment/animepair?user1=${event.senderID}&user2=${selectedMatch.id}&apikey=${API_KEY}`;
				const response = await axios.get(apiUrl, { 
					responseType: "arraybuffer",
					timeout: 20000,
					httpsAgent: agent
				});
				imageBuffer = response.data;
				console.log("✅ API success");
			} catch (err) {
				console.log("⚠️ API failed, using local generator...");
			}

			// অপশন ২: লোকাল ইমেজ জেনারেটর
			if (!imageBuffer) {
				imageBuffer = await generateLocalPairImage(
					event.senderID, 
					name1, 
					selectedMatch.id, 
					name2, 
					percentage
				);
			}

			fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
			
			const msg = `💕Anime 𝐋𝐨𝐯𝐞 𝐌𝐚𝐭𝐜𝐡 💕\n━━━━━━━━━━━━━━━━\n👤 𝐘𝐨𝐮: ${name1}\n👤 𝐌𝐚𝐭𝐜𝐡: ${name2}\n💞 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: ${percentage}%\n━━━━━━━━━━━━━━━━\n✨ 𝐂𝐮𝐭𝐞 𝐀𝐧𝐢𝐦𝐞 𝐂𝐨𝐮𝐩𝐥𝐞 ✨`;
			
			return message.reply({
				body: msg,
				attachment: fs.createReadStream(outputPath)
			}, () => {
				api.setMessageReaction("✅", event.messageID, () => {}, true);
				if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			});
			
		} catch (err) {
			console.error("Pair3 Error:", err);
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			return message.reply(`❌ Error: ${err.message}`);
		}
	}
};
