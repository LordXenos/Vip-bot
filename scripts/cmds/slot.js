const fs = require("fs-extra");
const path = require("path");

// ========== র‍্যাঙ্কিং ফাইল ==========
const rankFile = path.join(__dirname, "..", "..", "gameRank.json");

// গত রেজাল্ট স্টোর করার ফাইল
const lastResultFile = path.join(__dirname, "..", "..", "lastSlotResult.json");
// ডেইলি লিমিট স্টোর করার ফাইল
const dailyLimitFile = path.join(__dirname, "..", "..", "dailySlotLimit.json");

const ownerID = "100027192704821";
const DAILY_LIMIT = 30;

// ========== র‍্যাঙ্ক আপডেট ফাংশন ==========
async function updateGameRank(userId, userName, betAmount, winAmount, isWin) {
	try {
		let data = {};
		if (fs.existsSync(rankFile)) {
			data = JSON.parse(fs.readFileSync(rankFile, "utf8"));
		} else {
			data = { slot: {}, dice: {}, word: {} };
		}
		
		if (!data.slot) data.slot = {};
		if (!data.slot[userId]) {
			data.slot[userId] = {
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
		
		const user = data.slot[userId];
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

// ========== গত রেজাল্ট ফাংশন ==========
function getLastResult(userId) {
	try {
		if (!fs.existsSync(lastResultFile)) return null;
		const data = fs.readFileSync(lastResultFile, "utf8");
		const json = JSON.parse(data);
		return json[userId] || null;
	} catch (e) {
		return null;
	}
}

function saveLastResult(userId, result) {
	try {
		let data = {};
		if (fs.existsSync(lastResultFile)) {
			data = JSON.parse(fs.readFileSync(lastResultFile, "utf8"));
		}
		data[userId] = result;
		fs.writeFileSync(lastResultFile, JSON.stringify(data, null, 2));
	} catch (e) {
		console.error("Error saving last result:", e);
	}
}

// ========== ডেইলি লিমিট ফাংশন ==========
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

// ========== স্লট রেজাল্ট জেনারেট (তোমার চাওয়া অনুযায়ী) ==========
function generateSlotResult() {
	const rand = Math.random() * 100;
	
	// 0.1% - 0.5% chance for epic jackpot (100x)
	if (rand < 0.3) {
		return { type: "epic", symbols: ['❤️', '❤️', '❤️'], multiplier: 100 };
	}
	// 1.5% chance for rare jackpot (10x)
	else if (rand < 1.8) {
		return { type: "rare", symbols: generateWinSymbols('❤️'), multiplier: 10 };
	}
	// 3% chance for medium jackpot (3x-5x)
	else if (rand < 4.8) {
		const multi = Math.floor(Math.random() * 3) + 3; // 3-5
		const symbol = ['💙', '💛'][Math.floor(Math.random() * 2)];
		return { type: "medium", symbols: generateWinSymbols(symbol), multiplier: multi };
	}
	// 25% chance for normal win (2x)
	else if (rand < 29.8) {
		const symbol = ['❤️', '💙', '💛', '🤎'][Math.floor(Math.random() * 4)];
		return { type: "win", symbols: generateWinSymbols(symbol), multiplier: 2 };
	}
	// 70% chance for lose
	else {
		return { type: "lose", symbols: generateLoseSymbols(), multiplier: 0 };
	}
}

function generateWinSymbols(winningSymbol) {
	const symbols = ['❤️', '💙', '💛', '🤎', '🖤'];
	let result = [
		winningSymbol,
		winningSymbol,
		symbols[Math.floor(Math.random() * symbols.length)]
	];
	return shuffleArray(result);
}

function generateLoseSymbols() {
	let result = [];
	for (let i = 0; i < 3; i++) {
		result.push(['💙', '💛', '🤎', '🖤'][Math.floor(Math.random() * 4)]);
	}
	// যদি ২টা সেম হয়ে যায় তাহলে আবার জেনারেট
	if (hasTwoSame(result)) {
		return generateLoseSymbols();
	}
	return result;
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function hasTwoSame(arr) {
	const counts = {};
	arr.forEach(item => counts[item] = (counts[item] || 0) + 1);
	return Object.values(counts).some(count => count >= 2);
}

function getRandomWinMessage() {
	const messages = [
		"𝐍𝐨𝐭 𝐛𝐚𝐝 𝐟𝐨𝐫 𝐚 𝐬𝐭𝐚𝐫𝐭, 𝐛𝐚𝐛𝐞! ✨",
		"𝐋𝐮𝐜𝐤𝐲 𝐲𝐨𝐮! 𝐊𝐞𝐞𝐩 𝐠𝐨𝐢𝐧𝐠! 💫",
		"𝐓𝐡𝐞 𝐬𝐥𝐨𝐭𝐬 𝐥𝐨𝐯𝐞 𝐲𝐨𝐮 𝐭𝐨𝐝𝐚𝐲! 💕",
		"𝐖𝐨𝐰𝐳𝐞𝐫! 𝐀𝐧𝐨𝐭𝐡𝐞𝐫 𝐨𝐧𝐞! 🎰"
	];
	return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomLoseMessage() {
	const messages = [
		"𝐁𝐞𝐭𝐭𝐞𝐫 𝐥𝐮𝐜𝐤 𝐧𝐞𝐱𝐭 𝐭𝐢𝐦𝐞, 𝐬𝐰𝐞𝐞𝐭𝐡𝐞𝐚𝐫𝐭! 💔",
		"𝐃𝐨𝐧'𝐭 𝐰𝐨𝐫𝐫𝐲, 𝐥𝐨𝐯𝐞 𝐢𝐬 𝐬𝐭𝐢𝐥𝐥 𝐚 𝐣𝐚𝐜𝐤𝐩𝐨𝐭! 💋",
		"𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧, 𝐦𝐲 𝐥𝐮𝐜𝐤𝐲 𝐜𝐡𝐚𝐫𝐦! 🍀",
		"𝐎𝐡 𝐧𝐨! 𝐓𝐡𝐞 𝐬𝐥𝐨𝐭𝐬 𝐚𝐫𝐞 𝐛𝐞𝐢𝐧𝐠 𝐦𝐞𝐚𝐧 𝐭𝐨𝐝𝐚𝐲! 😘"
	];
	return messages[Math.floor(Math.random() * messages.length)];
}

function formatSlotResult(result, betAmount, winAmount, newBalance, limitInfo, isOwner) {
	const resultStr = `[ ${result.symbols.join(' | ')} ]`;
	const limitText = isOwner ? "∞" : `${limitInfo}`;
	
	if (result.type === "epic") {
		return (
			`>🎀\n` +
			`👑👑 𝐄𝐏𝐈𝐂 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 👑👑\n` +
			`𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatMoney(winAmount)} with three ❤️ symbols, Baby!\n` +
			`𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: ${resultStr}\n` +
			`𝐓𝐡𝐢𝐬 𝐢𝐬 𝐥𝐞𝐠𝐞𝐧𝐝𝐚𝐫𝐲! 💎\n` +
			`━━━━━━━━━━━━━━\n` +
			`💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(newBalance)}\n` +
			`🎰 𝐃𝐚𝐢𝐥𝐲 𝐋𝐢𝐦𝐢𝐭: ${limitText}`
		);
	}
	
	if (result.type === "rare") {
		return (
			`>🎀\n` +
			`✨✨ 𝐑𝐀𝐑𝐄 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 ✨✨\n` +
			`𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatMoney(winAmount)} with three ❤️ symbols, Baby!\n` +
			`𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: ${resultStr}\n` +
			`𝐁𝐮𝐲 𝐦𝐞 𝐬𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐧𝐢𝐜𝐞? 💋\n` +
			`━━━━━━━━━━━━━━\n` +
			`💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(newBalance)}\n` +
			`🎰 𝐃𝐚𝐢𝐥𝐲 𝐋𝐢𝐦𝐢𝐭: ${limitText}`
		);
	}
	
	if (result.type === "medium") {
		return (
			`>🎀\n` +
			`🎉 𝐌𝐞𝐝𝐢𝐮𝐦 𝐉𝐚𝐜𝐤𝐩𝐨𝐭! 🎉\n` +
			`𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatMoney(winAmount)} (${result.multiplier}x)\n` +
			`𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: ${resultStr}\n` +
			`━━━━━━━━━━━━━━\n` +
			`💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(newBalance)}\n` +
			`🎰 𝐃𝐚𝐢𝐥𝐲 𝐋𝐢𝐦𝐢𝐭: ${limitText}`
		);
	}
	
	if (result.type === "win") {
		return (
			`>🎀\n` +
			`• 𝐘𝐚𝐲! 𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatMoney(winAmount)}\n` +
			`• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: ${resultStr}\n` +
			`• ${getRandomWinMessage()}\n` +
			`━━━━━━━━━━━━━━\n` +
			`💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(newBalance)}\n` +
			`🎰 𝐃𝐚𝐢𝐥𝐲 𝐋𝐢𝐦𝐢𝐭: ${limitText}`
		);
	}
	
	return (
		`>🎀\n` +
		`• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 ${formatMoney(betAmount)}\n` +
		`• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: ${resultStr}\n` +
		`• ${getRandomLoseMessage()}\n` +
		`━━━━━━━━━━━━━━\n` +
		`💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(newBalance)}\n` +
		`🎰 𝐃𝐚𝐢𝐥𝐲 𝐋𝐢𝐦𝐢𝐭: ${limitText}`
	);
}

module.exports = {
	config: {
		name: "slot",
		version: "5.0",
		author: "Vydron1122",
		countDown: 5,
		role: 0,
		description: { en: "🎰 Play slot game with epic jackpot (0.3% chance)" },
		category: "game",
		guide: { en: "{pn} <amount>\nExamples: {pn} 5000, {pn} 10k, {pn} 5.5m" }
	},

	onStart: async function ({ message, event, args, usersData, api }) {
		const senderID = event.senderID;
		const isOwner = senderID === ownerID;
		const rawAmount = args[0];
		
		if (!rawAmount) {
			return message.reply("❌ Please enter bet amount!\nExamples: !slot 5000, !slot 10k, !slot 5.5m");
		}

		const betAmount = parseAmount(rawAmount);
		if (betAmount === null || betAmount < 200) {
			return message.reply("❌ Invalid amount or minimum bet is 200!\nExamples: 5000, 10k, 5.5m");
		}

		if (!isOwner && betAmount > 10000000) {
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

			// গত রেজাল্ট
			let lastResult = getLastResult(senderID);
			let result;
			let attempts = 0;
			const maxAttempts = 50;

			do {
				result = generateSlotResult();
				attempts++;
			} while (JSON.stringify(result.symbols) === JSON.stringify(lastResult) && attempts < maxAttempts);

			saveLastResult(senderID, result.symbols);

			if (!isOwner) {
				updateDailyCount(senderID);
			}

			const winAmount = betAmount * result.multiplier;
			const isWin = winAmount > 0;
			
			userData.money = isWin ? userBalance + winAmount : userBalance - betAmount;
			await usersData.set(senderID, userData);

			// র‍্যাঙ্ক আপডেট
			await updateGameRank(senderID, userName, betAmount, winAmount, isWin);

			api.sendMessage({ typing: false }, event.threadID);

			const newLimitCheck = checkDailyLimit(senderID);
			const limitInfo = isOwner ? "∞" : `${newLimitCheck.remaining}/${DAILY_LIMIT}`;

			const messageText = formatSlotResult(result, betAmount, winAmount, userData.money, limitInfo, isOwner);
			return message.reply(messageText);

		} catch (error) {
			api.sendMessage({ typing: false }, event.threadID);
			console.error("Slot Error:", error);
			return message.reply(`❌ Error: ${error.message}`);
		}
	}
};