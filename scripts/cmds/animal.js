const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const animalsFile = path.join(__dirname, "..", "..", "animals.json");
const rankFile = path.join(__dirname, "..", "..", "gameRank.json");
const dailyLimitFile = path.join(__dirname, "..", "..", "dailyAnimalLimit.json");

const ownerID = "61581548070081";
const DAILY_LIMIT = 30;
const COMMAND_DELAY = 3000; // ৩ সেকেন্ড (ন্যূনতম)

// ডিফল্ট অ্যানিমেল লিস্ট
const defaultAnimals = {
	"Tiger": "https://i.imgur.com/yKvvKJu.jpeg",
	"Lion": "https://i.imgur.com/Ru4xUkc.jpeg",
	"Wolf": "https://i.imgur.com/v2onCg4.jpeg",
	"Rabbit": "https://i.imgur.com/yKvvKJu.jpeg",
	"Fox": "https://i.imgur.com/claBsTf.jpeg",
	"Cat": "https://i.imgur.com/c3i61V8.jpeg",
	"Dog": "https://i.imgur.com/p0Gg4tc.jpeg",
	"Cow": "https://i.imgur.com/oUMBRXF.jpeg",
	"Parrot": "https://i.imgur.com/iOwUzp5.jpeg",
	"Duck": "https://i.imgur.com/qWIESv5.jpeg",
	"Swan": "https://i.imgur.com/iTojzsX.jpeg",
	"Donkey": "https://i.imgur.com/61lKVxK.jpeg",
	"Pig": "https://i.imgur.com/fcEpYFm.jpeg",
	"Deer": "https://i.imgur.com/RMUSDOa.jpeg"
};

// ========== অ্যানিমেল ডাটা লোড/সেভ ==========
async function loadAnimals() {
	if (!fs.existsSync(animalsFile)) {
		fs.writeFileSync(animalsFile, JSON.stringify(defaultAnimals, null, 2));
		return defaultAnimals;
	}
	return JSON.parse(fs.readFileSync(animalsFile, "utf8"));
}

async function saveAnimals(animals) {
	fs.writeFileSync(animalsFile, JSON.stringify(animals, null, 2));
}

// ========== ডেইলি লিমিট চেক ==========
function checkDailyLimit(userId) {
	if (userId === ownerID) return { allowed: true, remaining: "∞" };
	try {
		let data = {};
		const today = new Date().toDateString();
		if (fs.existsSync(dailyLimitFile)) {
			data = JSON.parse(fs.readFileSync(dailyLimitFile, "utf8"));
		}
		if (!data[userId] || data[userId].date !== today) {
			data[userId] = { date: today, count: 0 };
			fs.writeFileSync(dailyLimitFile, JSON.stringify(data, null, 2));
			return { allowed: true, remaining: DAILY_LIMIT };
		}
		const remaining = DAILY_LIMIT - data[userId].count;
		return { 
			allowed: remaining > 0, 
			remaining: remaining > 0 ? remaining : 0,
			count: data[userId].count
		};
	} catch (e) {
		return { allowed: true, remaining: DAILY_LIMIT };
	}
}

function updateDailyCount(userId) {
	if (userId === ownerID) return;
	try {
		let data = {};
		const today = new Date().toDateString();
		if (fs.existsSync(dailyLimitFile)) {
			data = JSON.parse(fs.readFileSync(dailyLimitFile, "utf8"));
		}
		if (!data[userId] || data[userId].date !== today) {
			data[userId] = { date: today, count: 1 };
		} else {
			data[userId].count += 1;
		}
		fs.writeFileSync(dailyLimitFile, JSON.stringify(data, null, 2));
	} catch (e) {}
}

// ========== র‍্যাঙ্ক আপডেট ফাংশন ==========
async function updateGameRank(userId, userName, isWin) {
	try {
		let data = {};
		if (fs.existsSync(rankFile)) {
			data = JSON.parse(fs.readFileSync(rankFile, "utf8"));
		} else {
			data = { slot: {}, dice: {}, word: {}, animal: {} };
		}
		
		if (!data.animal) data.animal = {};
		if (!data.animal[userId]) {
			data.animal[userId] = {
				name: userName,
				totalPlayed: 0,
				totalWins: 0,
				totalLoss: 0,
				lastPlayed: new Date().toISOString()
			};
		}
		
		const user = data.animal[userId];
		user.totalPlayed += 1;
		user.lastPlayed = new Date().toISOString();
		
		if (isWin) {
			user.totalWins += 1;
		} else {
			user.totalLoss += 1;
		}
		
		fs.writeFileSync(rankFile, JSON.stringify(data, null, 2));
	} catch (e) {
		console.error("Rank update error:", e);
	}
}

// ========== ইমেজ ডাউনলোড ফাংশন ==========
async function downloadImage(url, retries = 3) {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await axios.get(url, { 
				responseType: "arraybuffer",
				timeout: 10000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				}
			});
			return response.data;
		} catch (error) {
			console.log(`Download attempt ${i + 1} failed:`, error.message);
			if (i === retries - 1) throw error;
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	}
}

module.exports = {
	config: {
		name: "animal",
		version: "4.1",
		author: "Vydron1122",
		countDown: 5, // কনফিগ কাউন্টডাউন
		role: 0,
		description: {
			en: "🐾 Guess the animal from picture (Daily limit 30)"
		},
		category: "game",
		guide: {
			en: "{pn} - Play animal guessing game\n{pn} add [name] [image url] - Add new animal (Admin only)"
		}
	},

	onStart: async function ({ message, event, args, api, usersData }) {
		const { threadID, messageID, senderID } = event;
		
		// ** ৩-৫ সেকেন্ড ডিলে **
		await new Promise(resolve => setTimeout(resolve, COMMAND_DELAY + Math.floor(Math.random() * 2000)));

		const animals = await loadAnimals();

		// অ্যাডমিন কমান্ড: !animal add name url
		if (args[0]?.toLowerCase() === "add") {
			if (senderID !== ownerID) {
				return message.reply("❌ Only admin can add new animals!");
			}

			if (args.length < 3) {
				return message.reply("❌ Usage: !animal add [name] [image url]\nExample: !animal add Elephant https://i.imgur.com/xxx.jpg");
			}

			const name = args[1];
			const url = args[2];

			if (!url.startsWith("http")) {
				return message.reply("❌ Please provide a valid image URL!");
			}

			animals[name] = url;
			await saveAnimals(animals);

			return message.reply(`✅ New animal added: **${name}**\nNow total ${Object.keys(animals).length} animals in the game!`);
		}

		// ডেইলি লিমিট চেক
		const limitCheck = checkDailyLimit(senderID);
		if (!limitCheck.allowed && senderID !== ownerID) {
			return message.reply(`❌ Daily limit exceeded! You have used ${DAILY_LIMIT}/${DAILY_LIMIT} games today.\nCome back tomorrow! 🐾`);
		}

		// গেম খেলা
		const animalNames = Object.keys(animals);
		const randomAnimal = animalNames[Math.floor(Math.random() * animalNames.length)];
		const imageUrl = animals[randomAnimal];

		const waitMsg = await message.reply("⏳ Loading animal image...");

		try {
			const cacheDir = path.join(__dirname, "cache");
			if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
			
			const filePath = path.join(cacheDir, `animal_${Date.now()}.jpg`);
			
			const imageData = await downloadImage(imageUrl);
			fs.writeFileSync(filePath, Buffer.from(imageData));

			if (waitMsg?.messageID) {
				try { await api.unsendMessage(waitMsg.messageID); } catch (e) {}
			}

			// ডেইলি কাউন্ট আপডেট
			updateDailyCount(senderID);

			const newLimitCheck = checkDailyLimit(senderID);
			const limitInfo = senderID === ownerID ? "∞" : `${newLimitCheck.remaining}/${DAILY_LIMIT}`;

			const msg = await message.reply({
				body: `🐾 **Guess the animal!** 🐾\n━━━━━━━━━━━━━━━━\nReply to this message with the animal name to win!\n\n✅ Win: +$300 & +200exp\n❌ Lose: -$100\n━━━━━━━━━━━━━━━━\n🎯 Daily Limit: ${limitInfo}`,
				attachment: fs.createReadStream(filePath)
			});

			global.GoatBot.onReply.set(msg.messageID, {
				commandName: "animal",
				author: senderID,
				messageID: msg.messageID,
				correctAnimal: randomAnimal,
				imagePath: filePath
			});

		} catch (error) {
			console.error("Animal game error:", error);
			
			if (waitMsg?.messageID) {
				try { await api.unsendMessage(waitMsg.messageID); } catch (e) {}
			}

			let errorMsg = "❌ Failed to load animal image.\n";
			if (error.message.includes("429")) {
				errorMsg += "🔄 Too many requests. Please try again in a few moments.";
			} else {
				errorMsg += `⚠️ ${error.message}`;
			}

			return message.reply(errorMsg);
		}
	},

	onReply: async ({ message, event, Reply, api, usersData }) => {
		const { author, correctAnimal, imagePath } = Reply;
		const { senderID, threadID, messageID, body } = event;

		if (senderID !== author) return;

		setTimeout(() => {
			if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
		}, 5000);

		const userAnswer = body.trim();
		const isCorrect = userAnswer.toLowerCase() === correctAnimal.toLowerCase();

		let userName = "Unknown";
		try {
			const userInfo = await api.getUserInfo(senderID);
			userName = userInfo[senderID]?.name || "Unknown";
		} catch (e) {}

		const userData = await usersData.get(senderID);
		let resultMsg = "";

		if (isCorrect) {
			userData.money = (userData.money || 0) + 300;
			userData.exp = (userData.exp || 0) + 200;
			await usersData.set(senderID, userData);
			
			await updateGameRank(senderID, userName, true);
			
			resultMsg = `✅ **Correct!** 🎉\n━━━━━━━━━━━━━━━━\nThe animal was: **${correctAnimal}**\n\n💰 +$300\n✨ +200exp\n━━━━━━━━━━━━━━━━\nNew Balance: $${userData.money}`;
		} else {
			userData.money = (userData.money || 0) - 100;
			await usersData.set(senderID, userData);
			
			await updateGameRank(senderID, userName, false);
			
			resultMsg = `❌ **Wrong!** 😢\n━━━━━━━━━━━━━━━━\nThe animal was: **${correctAnimal}**\n\n💸 -$100\n━━━━━━━━━━━━━━━━\nNew Balance: $${userData.money}`;
		}

		await api.editMessage(resultMsg, Reply.messageID, threadID);
	}
};