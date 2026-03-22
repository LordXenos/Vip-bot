const fs = require("fs-extra");
const path = require("path");

const rankFile = path.join(__dirname, "..", "..", "gameRank.json");

// গেম র‍্যাঙ্ক ডাটা স্ট্রাকচার ইনিশিয়ালাইজ
async function initRankData() {
	if (!fs.existsSync(rankFile)) {
		const initialData = {
			slot: {},      // স্লট গেমের ডাটা
			dice: {},      // ডাইস গেমের ডাটা
			word: {},      // ওয়ার্ড গেমের ডাটা
			// নতুন গেম এখানে যোগ করবে
		};
		fs.writeFileSync(rankFile, JSON.stringify(initialData, null, 2));
		return initialData;
	}
	return JSON.parse(fs.readFileSync(rankFile, "utf8"));
}

// গেম র‍্যাঙ্ক আপডেট ফাংশন
async function updateGameRank(gameName, userId, userName, winAmount, isWin) {
	const data = await initRankData();
	
	if (!data[gameName]) data[gameName] = {};
	if (!data[gameName][userId]) {
		data[gameName][userId] = {
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
	
	const user = data[gameName][userId];
	user.totalPlayed += 1;
	user.totalBet += betAmount || 0;
	user.lastPlayed = new Date().toISOString();
	
	if (isWin) {
		user.totalWins += 1;
		user.totalWinAmount += winAmount || 0;
		if (winAmount > user.highestWin) {
			user.highestWin = winAmount;
		}
	} else {
		user.totalLoss += 1;
	}
	
	fs.writeFileSync(rankFile, JSON.stringify(data, null, 2));
	return user;
}

// র‍্যাঙ্কিং জেনারেট ফাংশন
function generateRanking(data, gameName, limit = 10) {
	const players = Object.entries(data[gameName] || {})
		.map(([uid, info]) => ({
			uid,
			...info
		}))
		.sort((a, b) => b.totalWinAmount - a.totalWinAmount || b.totalWins - a.totalWins)
		.slice(0, limit);
	
	return players;
}

module.exports = {
	config: {
		name: "gamerank",
		version: "1.0",
		author: "Vydron1122",
		countDown: 5,
		role: 0,
		description: {
			en: "🎮 View game rankings for slot, dice, word games"
		},
		category: "game",
		guide: {
			en: "{pn} slot - View slot game rankings\n{pn} dice - View dice game rankings\n{pn} word - View word game rankings\n{pn} [game] [@mention/uid] - View specific player's stats"
		}
	},

	onStart: async function ({ message, event, args, api }) {
		const data = await initRankData();
		const gameName = args[0]?.toLowerCase();
		
		if (!gameName || !['slot', 'dice', 'word'].includes(gameName)) {
			return message.reply(
				"❌ Please specify a game!\n\n" +
				"Available games:\n" +
				"• !gamerank slot - Slot machine rankings\n" +
				"• !gamerank dice - Dice game rankings\n" +
				"• !gamerank word - Word game rankings\n\n" +
				"To view specific player: !gamerank [game] @mention/uid"
			);
		}

		// নির্দিষ্ট প্লেয়ারের স্ট্যাটস দেখানো
		if (args[1]) {
			let targetID;
			if (Object.keys(event.mentions).length > 0) {
				targetID = Object.keys(event.mentions)[0];
			} else if (args[1].length > 10 && !isNaN(args[1])) {
				targetID = args[1];
			}

			if (targetID) {
				const playerData = data[gameName]?.[targetID];
				if (!playerData) {
					return message.reply(`❌ No data found for this player in ${gameName} game.`);
				}

				let userName = playerData.name;
				try {
					const userInfo = await api.getUserInfo(targetID);
					userName = userInfo[targetID]?.name || playerData.name;
				} catch (e) {}

				const winRate = ((playerData.totalWins / playerData.totalPlayed) * 100).toFixed(1);
				
				const msg = `🎮 **${gameName.toUpperCase()} Game Stats** 🎮\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`👤 **Player:** ${userName}\n` +
							`🆔 **UID:** ${targetID}\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`📊 **Total Played:** ${playerData.totalPlayed}\n` +
							`✅ **Total Wins:** ${playerData.totalWins}\n` +
							`❌ **Total Loss:** ${playerData.totalLoss}\n` +
							`📈 **Win Rate:** ${winRate}%\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`💰 **Total Bet:** ${formatMoney(playerData.totalBet)}\n` +
							`💵 **Total Win Amount:** ${formatMoney(playerData.totalWinAmount)}\n` +
							`🏆 **Highest Win:** ${formatMoney(playerData.highestWin)}\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`🕐 **Last Played:** ${new Date(playerData.lastPlayed).toLocaleString()}`;
				
				return message.reply(msg);
			}
		}

		// র‍্যাঙ্কিং দেখানো
		const rankings = generateRanking(data, gameName, 15);
		
		if (rankings.length === 0) {
			return message.reply(`📊 No rankings available for ${gameName} game yet.`);
		}

		let msg = `🎮 **${gameName.toUpperCase()} GAME RANKINGS** 🎮\n`;
		msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

		rankings.forEach((player, index) => {
			const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎮";
			const winRate = ((player.totalWins / player.totalPlayed) * 100).toFixed(1);
			
			msg += `${medal} **#${index + 1}** ${player.name}\n`;
			msg += `   └ 🏆 Wins: ${player.totalWins} | 💰 Won: ${formatMoney(player.totalWinAmount)}\n`;
			msg += `   └ 📊 Win Rate: ${winRate}% | 🎯 Played: ${player.totalPlayed}\n`;
			if (index < rankings.length - 1) msg += `   ━━━━━━━━━━━━━━━━━━━━\n`;
		});

		msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
		msg += `📌 Use !gamerank ${gameName} @user to view specific player stats`;

		return message.reply(msg);
	}
};

// মানি ফরম্যাট ফাংশন
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