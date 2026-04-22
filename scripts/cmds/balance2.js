 module.exports = {
	config: {
		name: "balance2",
		aliases: ["bal 2"],
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "xem số tiền hiện có của bạn hoặc người được tag",
			en: "view your money or the money of the tagged person"
		},
		category: "economy",
		guide: {
			vi: "   {pn}: xem số tiền của bạn"
				+ "\n   {pn} <@tag>: xem số tiền của người được tag"
				+ "\n   {pn} [reply]: xem số tiền của người bạn reply",
			en: "   {pn}: view your money"
				+ "\n   {pn} <@tag>: view the money of the tagged person"
				+ "\n   {pn} [reply]: view the money of the person you reply to"
		}
	},

	langs: {
		vi: {
			money: "Bạn đang có %1$",
			moneyOf: "%1 đang có %2$"
		},
		en: {
			money: "𝐁𝐚𝐛𝐲✨, 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 %1$",
			moneyOf: "%1 has %2$"
		}
	},

	// Helper function to format numbers into short form
	formatMoney: function (amount) {
		if (amount === undefined || amount === null) return "0"; // Handle case when money is undefined or null
		if (amount >= 1e12) return (amount / 1e12).toFixed(1) + 't';
		if (amount >= 1e9) return (amount / 1e9).toFixed(1) + 'b';
		if (amount >= 1e6) return (amount / 1e6).toFixed(1) + 'm';
		if (amount >= 1e3) return (amount / 1e3).toFixed(1) + 'k';
		return amount.toString();
	},

	onStart: async function ({ message, usersData, event, getLang }) {
		let targetUserID = event.senderID;  // Default to the command caller's ID

		// Check if the message is a reply
		if (event.messageReply) {
			targetUserID = event.messageReply.senderID;
		}

		// Check if the message mentions someone
		if (Object.keys(event.mentions).length > 0) {
			const uids = Object.keys(event.mentions);
			let msg = "";
			for (const uid of uids) {
				const userMoney = await usersData.get(uid, "money");

				// If no money found for the user, handle it
				const formattedMoney = this.formatMoney(userMoney || 0);
				msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), formattedMoney) + '\n';
			}
			return message.reply(msg);
		}

		// Get money of the person who replied or the sender
		const userData = await usersData.get(targetUserID);

		// If userData is undefined or money is not defined, handle it
		const money = userData ? userData.money : 0;
		const formattedMoney = this.formatMoney(money);
		message.reply(getLang("money", formattedMoney));
	}
};
