const fs = require("fs-extra");
const path = require("path");

// নম্বর পার্স করার ফাংশন
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

// ফরম্যাট মানি ফাংশন
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

module.exports = {
	config: {
		name: "setmoney",
		version: "3.0",
		author: "Vydron1122",
		countDown: 5,
		role: 0,
		description: {
			en: "💰 Set money for a user (Authorized user only)"
		},
		category: "owner",
		guide: {
			en: "{pn} [@mention/uid] [amount]\n{pn} [amount] (reply to user message)\nExamples: {pn} @user 5000, {pn} @user 10k, {pn} @user 5.5m"
		}
	},

	onStart: async function ({ message, event, args, usersData, api }) {
		const senderID = event.senderID;
		const AUTHORIZED_UID = "100065590940242"; // ** নতুন UID আপডেট করা হয়েছে **

		// ওনার চেক
		if (senderID !== AUTHORIZED_UID) {
			return message.reply("❌ You are not authorized to use this command, baby!");
		}

		// টাইপিং ইন্ডিকেটর
		api.sendMessage({ typing: true }, event.threadID);

		try {
			let targetID;
			let amount;
			let rawAmount;

			// কেইস ১: রিপ্লাই করে setmoney amount
			if (event.messageReply && args.length === 1) {
				targetID = event.messageReply.senderID;
				rawAmount = args[0];
				amount = parseAmount(rawAmount);

				if (amount === null || amount < 0) {
					api.sendMessage({ typing: false }, event.threadID);
					return message.reply(`❌ Invalid amount! Use: 5000, 10k, 5.5m, 2.3b etc.`);
				}
			}
			// কেইস ২: setmoney @mention/uid amount
			else if (args.length >= 2) {
				// মেনশন থেকে আইডি নেওয়া
				if (Object.keys(event.mentions).length > 0) {
					targetID = Object.keys(event.mentions)[0];
					rawAmount = args[1];
				} 
				// UID থেকে আইডি নেওয়া
				else {
					targetID = args[0];
					rawAmount = args[1];
				}

				amount = parseAmount(rawAmount);

				if (amount === null || amount < 0) {
					api.sendMessage({ typing: false }, event.threadID);
					return message.reply(`❌ Invalid amount! Use: 5000, 10k, 5.5m, 2.3b etc.`);
				}

				// UID ভ্যালিডেশন
				if (targetID.length < 10 || isNaN(targetID)) {
					api.sendMessage({ typing: false }, event.threadID);
					return message.reply("❌ Please enter a valid UID or mention a user!");
				}
			} 
			else {
				api.sendMessage({ typing: false }, event.threadID);
				return message.reply(
					"❌ Invalid format!\n\n" +
					"Usage:\n" +
					"• !setmoney @mention/uid [amount]\n" +
					"• !setmoney [amount] (reply to user message)"
				);
			}

			// ইউজার ডাটা আপডেট
			let userData = await usersData.get(targetID);
			if (!userData) {
				// ইউজার না থাকলে নতুন বানানো
				userData = {
					money: 0,
					exp: 0
				};
			}

			const oldMoney = userData.money || 0;
			userData.money = amount;
			await usersData.set(targetID, userData);

			// ইউজারের নাম পাওয়া
			let userName = "Unknown";
			try {
				const userInfo = await api.getUserInfo(targetID);
				userName = userInfo[targetID]?.name || "Unknown";
			} catch (e) {
				console.error("Error getting user name:", e);
			}

			api.sendMessage({ typing: false }, event.threadID);

			// সফল মেসেজ
			const msg = `💰 **Money Updated Successfully!**\n\n` +
						`━━━━━━━━━━━━━━━━\n` +
						`👤 User: ${userName}\n` +
						`🆔 UID: ${targetID}\n` +
						`━━━━━━━━━━━━━━━━\n` +
						`💵 Old Balance: ${formatMoney(oldMoney)}\n` +
						`💵 New Balance: ${formatMoney(amount)}\n` +
						`━━━━━━━━━━━━━━━━\n` +
						`✨ Done, baby!`;

			return message.reply(msg);

		} catch (error) {
			api.sendMessage({ typing: false }, event.threadID);
			console.error("Setmoney Error:", error);
			return message.reply(`❌ Error: ${error.message}`);
		}
	}
};
