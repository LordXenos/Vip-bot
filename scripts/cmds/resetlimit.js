const fs = require("fs-extra");
const path = require("path");

// গেম লিমিট ফাইল গুলো
const gameFiles = {
	slot: path.join(__dirname, "..", "..", "dailySlotLimit.json"),
	dice: path.join(__dirname, "..", "..", "dailyDiceLimit.json"),
	animal: path.join(__dirname, "..", "..", "dailyAnimalLimit.json")
};

const AUTHORIZED_UID = "100065590940242";

module.exports = {
	config: {
		name: "resetlimit",
		version: "2.0",
		author: "Vydron1122",
		countDown: 5,
		role: 0,
		description: {
			en: "🔄 Reset daily game limits (Slot/Dice/Animal) - Authorized only"
		},
		category: "owner",
		guide: {
			en: "{pn} [game] [all/@mention/uid] - Reset limits\n" +
				 "Example: {pn} slot all - Reset all slot limits\n" +
				 "{pn} dice @user - Reset specific user's dice limit\n" +
				 "{pn} animal (reply) - Reset replied user's animal limit"
		}
	},

	onStart: async function ({ message, event, args, api }) {
		const senderID = event.senderID;

		// শুধু অনুমোদিত ইউজার চেক
		if (senderID !== AUTHORIZED_UID) {
			return message.reply("❌ You are not authorized to use this command!");
		}

		// আর্গুমেন্ট চেক
		if (args.length < 1) {
			return message.reply(
				"❌ Please specify a game!\n\n" +
				"📌 **Available games:** slot, dice, animal\n" +
				"📌 **Options:** all, @mention, UID, or reply to a message\n\n" +
				"**Examples:**\n" +
				"• !resetlimit slot all - Reset all slot limits\n" +
				"• !resetlimit dice @user - Reset dice limit for mentioned user\n" +
				"• !resetlimit animal (reply to user) - Reset animal limit for replied user\n" +
				"• !resetlimit slot 1234567890 - Reset slot limit for specific UID"
			);
		}

		const game = args[0].toLowerCase();
		
		// গেম চেক
		if (!gameFiles[game]) {
			return message.reply(`❌ Invalid game! Available: slot, dice, animal`);
		}

		try {
			const gameFile = gameFiles[game];
			
			// ফাইল আছে কিনা চেক
			if (!fs.existsSync(gameFile)) {
				return message.reply(`📁 No ${game} limit data found. Creating new file...`);
			}

			let data = JSON.parse(fs.readFileSync(gameFile, "utf8"));
			let targetUsers = [];
			let resetCount = 0;

			// ========== রিপ্লাই থেকে ইউজার আইডি নেওয়া ==========
			if (event.messageReply) {
				const repliedUser = event.messageReply.senderID;
				targetUsers.push(repliedUser);
			}
			// ========== মেনশন থেকে ইউজার আইডি নেওয়া ==========
			else if (Object.keys(event.mentions).length > 0) {
				targetUsers = Object.keys(event.mentions);
			}
			// ========== UID দেওয়া থাকলে ==========
			else if (args[1] && args[1].length > 10 && !isNaN(args[1])) {
				targetUsers.push(args[1]);
			}
			// ========== "all" দেওয়া থাকলে সব রিসেট ==========
			else if (args[1] && args[1].toLowerCase() === "all") {
				resetCount = Object.keys(data).length;
				data = {};
			}
			else {
				return message.reply(
					"❌ Please specify a target!\n\n" +
					"**Options:**\n" +
					"• all - Reset all users\n" +
					"• @mention - Reset mentioned user(s)\n" +
					"• UID - Reset specific UID\n" +
					"• Reply to a message - Reset that user"
				);
			}

			// নির্দিষ্ট ইউজার(রা) রিসেট
			if (targetUsers.length > 0) {
				for (const uid of targetUsers) {
					if (data[uid]) {
						delete data[uid];
						resetCount++;
					}
				}
			}

			// ফাইল সেভ
			fs.writeFileSync(gameFile, JSON.stringify(data, null, 2));

			// ইউজারের নাম (যদি মেনশন/রিপ্লাই থাকে)
			let userNames = "";
			if (targetUsers.length > 0) {
				for (const uid of targetUsers) {
					try {
						const userInfo = await api.getUserInfo(uid);
						const name = userInfo[uid]?.name || "Unknown";
						userNames += `• ${name} (${uid})\n`;
					} catch (e) {
						userNames += `• ${uid}\n`;
					}
				}
			}

			let msg = `🔄 **Daily Limit Reset Complete** 🔄\n`;
			msg += `━━━━━━━━━━━━━━━━\n`;
			msg += `🎮 **Game:** ${game.toUpperCase()}\n`;
			msg += `📊 **Users affected:** ${resetCount}\n`;
			
			if (userNames) {
				msg += `━━━━━━━━━━━━━━━━\n`;
				msg += `👤 **Users:**\n${userNames}`;
			}
			
			msg += `━━━━━━━━━━━━━━━━\n`;
			msg += `✨ Done, baby!`;

			return message.reply(msg);

		} catch (error) {
			console.error("ResetLimit Error:", error);
			return message.reply(`❌ Error: ${error.message}`);
		}
	}
};
