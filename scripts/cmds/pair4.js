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

// অ্যানিমে ক্যারেক্টার ইমেজ (বিভিন্ন কাপল)
const animeCharacters = {
	boy1: "https://i.imgur.com/XqUeFbT.png", // অ্যানিমে ছেলে ১
	girl1: "https://i.imgur.com/vQyqQjH.png", // অ্যানিমে মেয়ে ১
	boy2: "https://i.imgur.com/RqFzQkB.png", // অ্যানিমে ছেলে ২
	girl2: "https://i.imgur.com/LmYcQqF.png", // অ্যানিমে মেয়ে ২
	boy3: "https://i.imgur.com/WqTqYbG.png", // অ্যানিমে ছেলে ৩
	girl3: "https://i.imgur.com/KrYcVnM.png"  // অ্যানিমে মেয়ে ৩
};

// ফেসবুক প্রোফাইল পিক ফেচ
async function getFacebookProfilePic(uid, retries = 3) {
	const urls = [
		`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
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
				return response.data;
			} catch (e) {}
		}
		await new Promise(resolve => setTimeout(resolve, 2000));
	}
	return null;
}

// লোকাল পেয়ার ইমেজ জেনারেটর (অ্যানিমে ক্যারেক্টার সহ)
async function generateLocalPairImage(user1Id, user1Name, user2Id, user2Name, percentage, gender1, gender2) {
	const canvas = createCanvas(1000, 600);
	const ctx = canvas.getContext("2d");

	// ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট
	const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
	gradient.addColorStop(0, "#FFB6C1");
	gradient.addColorStop(0.5, "#FFC0CB");
	gradient.addColorStop(1, "#FFB6C1");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// হার্ট ইফেক্ট
	ctx.globalAlpha = 0.1;
	for (let i = 0; i < 10; i++) {
		ctx.font = "40px Arial";
		ctx.fillStyle = "#FF1493";
		ctx.fillText("❤️", Math.random() * canvas.width, Math.random() * canvas.height);
	}
	ctx.globalAlpha = 1;

	// ইউজার ১ এর অ্যানিমে ক্যারেক্টার (ছেলে)
	try {
		const boyChar = await loadImage(animeCharacters.boy1);
		ctx.drawImage(boyChar, 50, 150, 200, 250);
	} catch (e) {}

	// ইউজার ২ এর অ্যানিমে ক্যারেক্টার (মেয়ে)
	try {
		const girlChar = await loadImage(animeCharacters.girl1);
		ctx.drawImage(girlChar, 750, 150, 200, 250);
	} catch (e) {}

	// প্রোফাইল পিক ফ্রেম - বাম পাশে
	ctx.fillStyle = "#FFFFFF";
	ctx.shadowColor = "#FF1493";
	ctx.shadowBlur = 15;
	ctx.beginPath();
	ctx.arc(300, 300, 70, 0, Math.PI * 2);
	ctx.fill();
	ctx.shadowBlur = 0;

	// ইউজার ১ এর প্রোফাইল পিক
	try {
		const avatar1Data = await getFacebookProfilePic(user1Id);
		if (avatar1Data) {
			const avatar1 = await loadImage(Buffer.from(avatar1Data));
			ctx.save();
			ctx.beginPath();
			ctx.arc(300, 300, 65, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar1, 235, 235, 130, 130);
			ctx.restore();
		} else {
			ctx.fillStyle = "#FF69B4";
			ctx.beginPath();
			ctx.arc(300, 300, 65, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#FFFFFF";
			ctx.font = "bold 40px Arial";
			ctx.fillText("👤", 275, 325);
		}
	} catch (e) {}

	// প্রোফাইল পিক ফ্রেম - ডান পাশে
	ctx.fillStyle = "#FFFFFF";
	ctx.shadowColor = "#FF1493";
	ctx.shadowBlur = 15;
	ctx.beginPath();
	ctx.arc(700, 300, 70, 0, Math.PI * 2);
	ctx.fill();
	ctx.shadowBlur = 0;

	// ইউজার ২ এর প্রোফাইল পিক
	try {
		const avatar2Data = await getFacebookProfilePic(user2Id);
		if (avatar2Data) {
			const avatar2 = await loadImage(Buffer.from(avatar2Data));
			ctx.save();
			ctx.beginPath();
			ctx.arc(700, 300, 65, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar2, 635, 235, 130, 130);
			ctx.restore();
		} else {
			ctx.fillStyle = "#FF69B4";
			ctx.beginPath();
			ctx.arc(700, 300, 65, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#FFFFFF";
			ctx.font = "bold 40px Arial";
			ctx.fillText("👤", 675, 325);
		}
	} catch (e) {}

	// নাম
	ctx.font = "bold 20px Arial";
	ctx.fillStyle = "#8B008B";
	ctx.fillText(user1Name.length > 12 ? user1Name.substring(0, 10) + "..." : user1Name, 240, 400);
	ctx.fillText(user2Name.length > 12 ? user2Name.substring(0, 10) + "..." : user2Name, 640, 400);

	// লাভ পার্সেন্টেজ ব্যাজ
	ctx.fillStyle = "#FF1493";
	ctx.shadowColor = "#FF69B4";
	ctx.shadowBlur = 10;
	ctx.beginPath();
	ctx.arc(500, 300, 50, 0, Math.PI * 2);
	ctx.fill();
	ctx.shadowBlur = 0;

	ctx.font = "bold 30px Arial";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(`${percentage}%`, 460, 320);

	// হার্ট ইমোজি
	ctx.font = "bold 60px Arial";
	ctx.fillStyle = "#FF1493";
	ctx.fillText("💕", 470, 200);

	// ফুটার টেক্সট
	ctx.font = "bold 25px Arial";
	ctx.fillStyle = "#8B008B";
	ctx.fillText("✨ Anime Love Story ✨", 350, 500);

	return canvas.toBuffer();
}

module.exports = {
	config: {
		name: "pair4",
		version: "2.0",
		author: "Vydron1122",
		countDown: 10,
		role: 0,
		description: {
			en: "💕 Anime character love match with profile pics"
		},
		category: "love",
		guide: {
			en: "{pn} - Find your anime love match"
		}
	},

	onStart: async function ({ api, event, message }) {
		const outputPath = path.join(__dirname, "cache", `pair4_${event.senderID}_${Date.now()}.png`);
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

			// অপশন ১: API থেকে আনার চেষ্টা
			let imageBuffer = null;
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
				console.log("⚠️ API failed, using local anime generator...");
			}

			// অপশন ২: লোকাল অ্যানিমে ইমেজ জেনারেটর
			if (!imageBuffer) {
				imageBuffer = await generateLocalPairImage(
					event.senderID, 
					name1, 
					selectedMatch.id, 
					name2, 
					percentage,
					myGender,
					selectedMatch.gender
				);
			}

			fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
			
			const msg = `💕 𝐀𝐧𝐢𝐦𝐞 𝐂𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫 𝐋𝐨𝐯𝐞 💕\n━━━━━━━━━━━━━━━━\n👤 𝐘𝐨𝐮: ${name1}\n👤 𝐌𝐚𝐭𝐜𝐡: ${name2}\n💞 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: ${percentage}%\n━━━━━━━━━━━━━━━━\n✨ 𝐀𝐧𝐢𝐦𝐞 𝐂𝐨𝐮𝐩𝐥𝐞 ✨`;
			
			return message.reply({
				body: msg,
				attachment: fs.createReadStream(outputPath)
			}, () => {
				api.setMessageReaction("✅", event.messageID, () => {}, true);
				if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			});
			
		} catch (err) {
			console.error("Pair4 Error:", err);
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			return message.reply(`❌ Error: ${err.message}`);
		}
	}
};