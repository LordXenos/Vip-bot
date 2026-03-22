const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const https = require("https");

const agent = new https.Agent({
	rejectUnauthorized: false,
	secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
});

// কিউট ফন্টের জন্য (সিস্টেম ফন্ট ফলব্যাক)
let cuteFont = "40px 'Comic Sans MS', 'Chalkboard SE', 'Apple Color Emoji', 'Arial', sans-serif";
let nameFont = "30px 'Comic Sans MS', 'Chalkboard SE', 'Apple Color Emoji', 'Arial', sans-serif";
let captionFont = "25px 'Comic Sans MS', 'Chalkboard SE', 'Apple Color Emoji', 'Arial', sans-serif";

// প্রোফাইল পিক ফেচ
async function getFacebookProfilePic(uid) {
	const urls = [
		`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
		`https://graph.facebook.com/${uid}/picture?type=large&width=512&height=512`
	];

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
	return null;
}

// র‍্যান্ডম লাভ ক্যাপশন
const loveCaptions = [
	"💕 Two hearts, one love 💕",
	"🌹 Meant to be together 🌹",
	"✨ A match made in heaven ✨",
	"🌸 Love is in the air 🌸",
	"💘 Perfect Pair 💘",
	"🎀 Cute Couple Alert 🎀",
	"💞 Soulmates Forever 💞",
	"🌟 You + Me = Love 🌟"
];

module.exports = {
	config: {
		name: "pair5",
		version: "1.0",
		author: "Vydron1122",
		countDown: 10,
		role: 0,
		description: {
			en: "💕 Cute couple photo with profile pics and love percentage"
		},
		category: "love",
		guide: {
			en: "{pn} - Find your cute couple match"
		}
	},

	onStart: async function ({ api, event, message }) {
		const outputPath = path.join(__dirname, "cache", `pair5_${event.senderID}_${Date.now()}.png`);
		if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

		try {
			api.setMessageReaction("💕", event.messageID, () => {}, true);
			
			const threadData = await api.getThreadInfo(event.threadID);
			const users = threadData.userInfo;
			
			const myData = users.find((u) => u.id === event.senderID);
			if (!myData || !myData.gender) {
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
				return message.reply("😢 Sorry, no match found for you in this group");
			}
			
			const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
			
			const name1 = myData.name || "You";
			const name2 = selectedMatch.name || "Partner";
			const percentage = Math.floor(Math.random() * 100) + 1;
			const randomCaption = loveCaptions[Math.floor(Math.random() * loveCaptions.length)];

			// ========== ক্যানভাস তৈরি ==========
			const canvas = createCanvas(800, 600);
			const ctx = canvas.getContext("2d");

			// ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট (রোমান্টিক)
			const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
			gradient.addColorStop(0, "#FFB6C1"); // হালকা গোলাপি
			gradient.addColorStop(0.5, "#FFC0CB"); // গোলাপি
			gradient.addColorStop(1, "#FFB6C1"); // হালকা গোলাপি
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// হার্ট ইফেক্ট ব্যাকগ্রাউন্ডে
			ctx.globalAlpha = 0.2;
			for (let i = 0; i < 15; i++) {
				ctx.font = "50px Arial";
				ctx.fillStyle = "#FF1493";
				ctx.fillText("❤️", Math.random() * canvas.width, Math.random() * canvas.height);
				ctx.fillText("🌹", Math.random() * canvas.width, Math.random() * canvas.height);
			}
			ctx.globalAlpha = 1;

			// ========== বাম পাশে প্রোফাইল পিক (ছেলে) ==========
			try {
				const avatar1Data = await getFacebookProfilePic(event.senderID);
				if (avatar1Data) {
					const avatar1 = await loadImage(Buffer.from(avatar1Data));
					
					// বৃত্তাকার ফ্রেম
					ctx.save();
					ctx.beginPath();
					ctx.arc(250, 250, 120, 0, Math.PI * 2);
					ctx.closePath();
					ctx.clip();
					ctx.drawImage(avatar1, 130, 130, 240, 240);
					ctx.restore();
					
					// ফ্রেমের বর্ডার
					ctx.strokeStyle = "#FF1493";
					ctx.lineWidth = 5;
					ctx.beginPath();
					ctx.arc(250, 250, 122, 0, Math.PI * 2);
					ctx.stroke();
				} else {
					ctx.fillStyle = "#87CEEB";
					ctx.beginPath();
					ctx.arc(250, 250, 120, 0, Math.PI * 2);
					ctx.fill();
					ctx.fillStyle = "#FFFFFF";
					ctx.font = "bold 60px Arial";
					ctx.fillText("👨", 200, 300);
				}
			} catch (e) {
				console.log("Avatar 1 error:", e);
			}

			// ========== ডান পাশে প্রোফাইল পিক (মেয়ে) ==========
			try {
				const avatar2Data = await getFacebookProfilePic(selectedMatch.id);
				if (avatar2Data) {
					const avatar2 = await loadImage(Buffer.from(avatar2Data));
					
					ctx.save();
					ctx.beginPath();
					ctx.arc(550, 250, 120, 0, Math.PI * 2);
					ctx.closePath();
					ctx.clip();
					ctx.drawImage(avatar2, 430, 130, 240, 240);
					ctx.restore();
					
					ctx.strokeStyle = "#FF1493";
					ctx.lineWidth = 5;
					ctx.beginPath();
					ctx.arc(550, 250, 122, 0, Math.PI * 2);
					ctx.stroke();
				} else {
					ctx.fillStyle = "#FFB6C1";
					ctx.beginPath();
					ctx.arc(550, 250, 120, 0, Math.PI * 2);
					ctx.fill();
					ctx.fillStyle = "#FFFFFF";
					ctx.font = "bold 60px Arial";
					ctx.fillText("👩", 500, 300);
				}
			} catch (e) {
				console.log("Avatar 2 error:", e);
			}

			// ========== নাম ==========
			ctx.font = nameFont;
			ctx.fillStyle = "#8B008B";
			ctx.fillText(name1.length > 15 ? name1.substring(0, 12) + "..." : name1, 190, 420);
			ctx.fillText(name2.length > 15 ? name2.substring(0, 12) + "..." : name2, 490, 420);

			// ========== হার্ট ইমোজি মাঝখানে ==========
			ctx.font = "bold 70px Arial";
			ctx.fillStyle = "#FF1493";
			ctx.fillText("❤️", 370, 250);

			// ========== লাভ পার্সেন্টেজ (নিচে) ==========
			ctx.fillStyle = "#FFFFFF";
			ctx.shadowColor = "#FF1493";
			ctx.shadowBlur = 10;
			ctx.beginPath();
			ctx.arc(400, 500, 50, 0, Math.PI * 2);
			ctx.fill();
			ctx.shadowBlur = 0;

			ctx.font = "bold 35px Arial";
			ctx.fillStyle = "#8B008B";
			ctx.fillText(`${percentage}%`, 365, 520);

			// ========== লাভ ক্যাপশন (সবচেয়ে নিচে) ==========
			ctx.font = captionFont;
			ctx.fillStyle = "#8B008B";
			ctx.fillText(randomCaption, 250, 570);

			// ========== রোজ ছড়ানো ==========
			ctx.font = "30px Arial";
			ctx.fillStyle = "#FF1493";
			ctx.fillText("🌹", 100, 100);
			ctx.fillText("🌹", 700, 100);
			ctx.fillText("🌹", 100, 550);
			ctx.fillText("🌹", 700, 550);

			// ========== ইমেজ সেভ ==========
			const imageBuffer = canvas.toBuffer();
			fs.writeFileSync(outputPath, imageBuffer);

			const msg = `💕 𝐂𝐮𝐭𝐞 𝐂𝐨𝐮𝐩𝐥𝐞 💕\n━━━━━━━━━━━━━━━━\n👤 𝐘𝐨𝐮: ${name1}\n👤 𝐌𝐚𝐭𝐜𝐡: ${name2}\n💞 𝐋𝐨𝐯𝐞: ${percentage}%\n━━━━━━━━━━━━━━━━\n✨ ${randomCaption} ✨`;
			
			return message.reply({
				body: msg,
				attachment: fs.createReadStream(outputPath)
			}, () => {
				api.setMessageReaction("✅", event.messageID, () => {}, true);
				if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			});
			
		} catch (err) {
			console.error("Pair5 Error:", err);
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			return message.reply(`❌ Error: ${err.message}`);
		}
	}
};