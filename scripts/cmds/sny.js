const fs = require("fs-extra");
const path = require("path");

const snyFile = path.join(__dirname, "..", "..", "snyData.json");
const AUTHORIZED_UID = "100065590940242"; // শুধু এই ইউজার কমান্ড চালাতে পারবে

// ইনসাল্ট লাইব্রেরি (যখন AI fail করবে)
const insultReplies = [
	"🤡 @{name} তুই এটা লিখলি? সিগমারা এটা পড়েও কান্না চেপে রাখে 🗿",
	"🥶 @{name} তোর কথা শুনে থার্মোমিটারও বলল, 'বস, অনেক ঠান্ডা!' ❄️",
	"💀 @{name} তুই যা বললি, সেটা ডার্কনেসের কাছেও ডার্ক লাগে 🖤",
	"👑 @{name} সিগমা রুল ৬৯: তোর মত মানুষকে ইগনোর করাই বেস্ট 🚶",
	"🦇 @{name} তোর কথা শুনে ব্যাটম্যানও কেপ মুড়িয়ে পালিয়েছে 🦹",
	"🗿 @{name} তুই কথা বলছিস? সিগমারা চুপ করে কষ্ট হজম করে 💪",
	"⚰️ @{name} তোর লজিক দেখে মৃতরাও হাসছে 😂",
	"🥀 @{name} তুই যা বললি, সেটা ইনসাল্ট না কমেডি? 🤔"
];

// বাংলিশ/অন্যান্য ভাষার জন্য রিপ্লাই
const banglaReplies = [
	"📖 @{name} Don't you know english properly?? you're too illiterate. 🤡",
	"🗣️ @{name} Speak English, this is Sigma territory. 🥶",
	"🌍 @{name} English please, we're not in your village. 👑"
];

module.exports = {
	config: {
		name: "sny",
		version: "3.1",
		author: "Vydron1122",
		countDown: 5,
		role: 0,
		description: {
			en: "🎯 Savage Notification System - Target a user for auto replies"
		},
		category: "owner",
		guide: {
			en: "{pn} @user on - Target a user\n{pn} off - Turn off SNY"
		}
	},

	onStart: async function ({ message, event, args, api }) {
		const senderID = event.senderID;
		
		// শুধু অথরাইজড ইউজার চেক
		if (senderID !== AUTHORIZED_UID) {
			return message.reply("❌ You are not authorized to use this command!");
		}

		// অফ কমান্ড
		if (args[0] === "off") {
			await fs.writeFile(snyFile, JSON.stringify({ enabled: false, target: null }, null, 2));
			return message.reply("✅ SNY system turned off!");
		}

		// টার্গেট সেট করা
		let targetID;
		if (Object.keys(event.mentions).length > 0) {
			targetID = Object.keys(event.mentions)[0];
		} else if (args[0] && args[0].length > 10 && !isNaN(args[0])) {
			targetID = args[0];
		} else {
			return message.reply("❌ Please mention a user or provide UID!\nUsage: !sny @user on  or  !sny off");
		}

		if (args[1] === "on") {
			await fs.writeFile(snyFile, JSON.stringify({ enabled: true, target: targetID }, null, 2));
			
			const userInfo = await api.getUserInfo(targetID);
			const targetName = userInfo[targetID]?.name || "Unknown";
			
			return message.reply(
				`🎯 𝐒𝐍𝐘 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃 🎯\n` +
				`━━━━━━━━━━━━━━\n` +
				`𝐓𝐚𝐫𝐠𝐞𝐭: ${targetName}\n` +
				`𝐌𝐨𝐝𝐞: 𝐒𝐢𝐠𝐦𝐚 𝐑𝐞𝐩𝐥𝐢𝐞𝐬\n` +
				`━━━━━━━━━━━━━━\n` +
				`❄️ 𝐂𝐨𝐥𝐝 𝐫𝐞𝐩𝐥𝐢𝐞𝐬 𝐢𝐧𝐜𝐨𝐦𝐢𝐧𝐠...`
			);
		}
	},

	onChat: async ({ event, api }) => {
		try {
			// SNY ডাটা পড়া
			if (!fs.existsSync(snyFile)) return;
			const snyData = JSON.parse(fs.readFileSync(snyFile, "utf8"));
			
			// চেক করা যে SNY চালু আছে এবং টার্গেট ম্যাচ করে কিনা
			if (!snyData.enabled || snyData.target !== event.senderID) return;

			const message = event.body || "";
			if (!message) return;

			// ইউজারের নাম
			const userInfo = await api.getUserInfo(event.senderID);
			const userName = userInfo[event.senderID]?.name || "User";

			// বাংলিশ চেক (বাংলা অক্ষর আছে কিনা)
			const isBanglish = /[ক-হ]|[ড়-ৎ]|[০-৯]|[\u0980-\u09FF]/i.test(message);

			let reply = "";

			if (isBanglish) {
				// বাংলিশ/বাংলা দেখলে স্পেশাল রিপ্লাই
				reply = banglaReplies[Math.floor(Math.random() * banglaReplies.length)];
			} else {
				// ইংরেজি মেসেজের জন্য ইনসাল্ট
				reply = insultReplies[Math.floor(Math.random() * insultReplies.length)];
			}

			reply = reply.replace("@{name}", userName);

			// টাইপিং ইফেক্ট দিয়ে রিপ্লাই পাঠানো
			api.sendMessage({ typing: true }, event.threadID);
			
			setTimeout(() => {
				api.sendMessage({ typing: false }, event.threadID);
				api.sendMessage(reply, event.threadID, event.messageID);
			}, 2000);

		} catch (error) {
			console.error("SNY AI Error:", error);
		}
	}
};
