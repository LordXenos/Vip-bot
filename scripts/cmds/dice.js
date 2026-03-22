const fs = require("fs-extra");
const path = require("path");

// ========== র‍্যাঙ্কিং ফাইল ==========
const rankFile = path.join(__dirname, "..", "..", "gameRank.json");

// ডেইলি লিমিট স্টোর করার ফাইল
const dailyLimitFile = path.join(__dirname, "..", "..", "dailyDiceLimit.json");

const ownerID = "61581548070081";
const DAILY_LIMIT = 30;
const MAX_BET = 10000000;
const MIN_BET = 200;

// ========== র‍্যাঙ্ক আপডেট ফাংশন ==========
async function updateGameRank(userId, userName, betAmount, winAmount, isWin) {
	try {
		let data = {};
		if (fs.existsSync(rankFile)) {
			data = JSON.parse(fs.readFileSync(rankFile, "utf8"));
		} else {
			data = { slot: {}, dice: {}, word: {} };
		}
		
		if (!data.dice) data.dice = {};
		if (!data.dice[userId]) {
			data.dice[userId] = {
				name: userName,
				totalPlayed: 0,
				totalWins: 0,
				totalLoss: 0,
				totalBet: 0,
				totalWinAmount: 0,
				highestWin: 0,
				lastPlayed: new Date().toISOString()
			};
		}
		
		const user = data.dice[userId];
		user.totalPlayed += 1;
		user.totalBet += betAmount;
		user.lastPlayed = new Date().toISOString();
		
		if (isWin) {
			user.totalWins += 1;
			user.totalWinAmount += winAmount;
			if (winAmount > user.highestWin) {
				user.highestWin = winAmount;
			}
		} else {
			user.totalLoss += 1;
		}
		
		fs.writeFileSync(rankFile, JSON.stringify(data, null, 2));
	} catch (e) {
		console.error("Rank update error:", e);
	}
}

// ========== নম্বর পার্স ফাংশন ==========
function parseAmount(input) {
	if (!input || typeof input !== "string") return null;
	input = input.toString().toLowerCase().trim();
	const multipliers = {
		'k': 1e3, 'm': 1e6, 'b': 1e9, 't': 1e12,
		'qa': 1e15, 'qi': 1e18, 'sx': 1e21, 'sp': 1e24,
		'o': 1e27, 'n': 1e30, 'd': 1e33, 'dc': 1e33
	};
	const match = input.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/);
	if (!match) return null;
	const num = parseFloat(match[1]);
	const unit = match[2];
	if (isNaN(num) || num < 0) return null;
	if (!unit) return Math.floor(num);
	const multiplier = multipliers[unit];
	if (!multiplier) return null;
	return Math.floor(num * multiplier);
}

// ========== ফরম্যাট মানি ==========
function formatMoney(amount) {
	if (amount >= 1e33) return (amount / 1e33).toFixed(2) + ' DC';
	if (amount >= 1e30) return (amount / 1e30).toFixed(2) + ' N';
	if (amount >= 1e27) return (amount / 1e27).toFixed(2) + ' O';
	if (amount >= 1e24) return (amount / 1e24).toFixed(2) + ' SP';
	if (amount >= 1e21) return (amount / 1e21).toFixed(2) + ' SX';
	if (amount >= 1e18) return (amount / 1e18).toFixed(2) + ' QI';
	if (amount >= 1e15) return (amount / 1e15).toFixed(2) + ' QA';
	if (amount >= 1e12) return (amount / 1e12).toFixed(2) + ' T';
	if (amount >= 1e9) return (amount / 1e9).toFixed(2) + ' B';
	if (amount >= 1e6) return (amount / 1e6).toFixed(2) + ' M';
	if (amount >= 1e3) return (amount / 1e3).toFixed(2) + ' K';
	return amount.toString();
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

module.exports = {
	config: {
		name: "dice",
		version: "4.0",
		author: "Vydron1122",
		countDown: 5,
		role: 0,
		description: { en: "🎲 Play dice game (Daily limit 30 bets, Owner unlimited)" },
		category: "game",
		guide: { en: "{pn} <amount>\nExamples: {pn} 5000, {pn} 10k, {pn} 5.5m" }
	},

	onStart: async function ({ message, event, args, usersData, api }) {
		const senderID = event.senderID;
		const isOwner = senderID === ownerID;
		const rawAmount = args[0];
		
		if (!rawAmount) {
			return message.reply("❌ Please enter bet amount!\nExamples: !dice 5000, !dice 10k, !dice 5.5m");
		}

		const betAmount = parseAmount(rawAmount);
		if (betAmount === null || betAmount < MIN_BET) {
			return message.reply("❌ Invalid amount or minimum bet is 200!\nExamples: 5000, 10k, 5.5m");
		}

		if (!isOwner && betAmount > MAX_BET) {
			return message.reply("❌ Maximum bet is 10M baby! 💋");
		}

		const limitCheck = checkDailyLimit(senderID);
		if (!isOwner && !limitCheck.allowed) {
			return message.reply(`❌ Daily limit exceeded! You have used ${DAILY_LIMIT}/${DAILY_LIMIT} bets today.`);
		}

		api.sendMessage({ typing: true }, event.threadID);

		try {
			const userData = await usersData.get(senderID);
			if (!userData) {
				api.sendMessage({ typing: false }, event.threadID);
				return message.reply("❌ Your data not found!");
			}

			const userBalance = userData.money || 0;
			if (userBalance < betAmount) {
				api.sendMessage({ typing: false }, event.threadID);
				return message.reply(`❌ You don't have enough money!\nYour balance: ${formatMoney(userBalance)}`);
			}

			// ইউজারের নাম
			let userName = "Unknown";
			try {
				const userInfo = await api.getUserInfo(senderID);
				userName = userInfo[senderID]?.name || "Unknown";
			} catch (e) {}

			// গেম ক্যালকুলেশন
			const winPercent = Math.random() * 100;
			let resultType = "lose";
			let multiplier = 0;

			if (winPercent < 2) {
				resultType = "rareJackpot";
				multiplier = Math.floor(Math.random() * 91) + 10;
			}
			else if (winPercent < 7) {
				resultType = "mediumJackpot";
				multiplier = Math.floor(Math.random() * 3) + 3;
			}
			else if (winPercent < 40) {
				resultType = "win";
				multiplier = 2;
			}

			const winAmount = betAmount * multiplier;
			const isWin = winAmount > 0;
			
			// ব্যালেন্স আপডেট
			userData.money = isWin ? userBalance + winAmount : userBalance - betAmount;
			await usersData.set(senderID, userData);

			// ===== র‍্যাঙ্ক আপডেট =====
			await updateGameRank(senderID, userName, betAmount, winAmount, isWin);

			// ডেইলি কাউন্ট আপডেট
			if (!isOwner) updateDailyCount(senderID);

			api.sendMessage({ typing: false }, event.threadID);

			// লিমিট ইনফো
			const newLimitCheck = checkDailyLimit(senderID);
			const limitInfo = isOwner ? "∞" : `${newLimitCheck.remaining}/${DAILY_LIMIT}`;

			// ডাইস রোল
			const symbols = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
			const diceFace = [symbols[Math.floor(Math.random() * 6)], symbols[Math.floor(Math.random() * 6)]].join(" ");

			// মেসেজ
			const base = `🎀 • ɪ ᴛʜʀᴏᴡ ᴛʜᴇ ᴅɪᴄᴇ ғᴏʀ ʏᴏᴜ, ʙᴀʙʏ\n━━━━━━━━━━━━━━\n🎲 ʀᴇsᴜʟᴛ: ${diceFace}\n💰 ʙᴇᴛ: ${formatMoney(betAmount)}\n`;
			let resultMsg = "";

			if (resultType === "rareJackpot") {
				resultMsg = base + `✨✨ ʀᴀʀᴇ ᴊᴀᴄᴋᴘᴏᴛ! ✨✨\nʏᴏᴜ ᴡᴏɴ ${formatMoney(winAmount)} (${multiplier}x)`;
			} else if (resultType === "mediumJackpot") {
				resultMsg = base + `🎉 ᴍᴇᴅɪᴜᴍ ᴊᴀᴄᴋᴘᴏᴛ!\nʏᴏᴜ ᴡᴏɴ ${formatMoney(winAmount)} (${multiplier}x)`;
			} else if (resultType === "win") {
				resultMsg = base + `🥳 ʏᴏᴜ ᴡᴏɴ!\nʏᴏᴜ ɢᴏᴛ ${formatMoney(winAmount)} (2x)`;
			} else {
				resultMsg = base + `😢 ʏᴏᴜ ʟᴏsᴛ ${formatMoney(betAmount)}`;
			}

			return message.reply(resultMsg + `\n━━━━━━━━━━━━━━\n💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(userData.money)}\n🎲 𝐃𝐚𝐢𝐥𝐲 𝐋𝐢𝐦𝐢𝐭: ${limitInfo}`);

		} catch (error) {
			api.sendMessage({ typing: false }, event.threadID);
			console.error("Dice Error:", error);
			return message.reply(`❌ Error: ${error.message}`);
		}
	}
};