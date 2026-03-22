if (!global.client.busyList)
	global.client.busyList = {};

module.exports = {
	config: {
		name: "busy",
		version: "2.0",
		author: "Rasin",
		countDown: 2,
		role: 0,
		description: {
			en: "Turn On Do Not Diꜱturb Mode, When You Are Tagged Bot Will Notify 🎀"
		},
		category: "box Chat",
		guide: {
			en: "   {pn} [Empty | <Reaꜱon>]: Turn On Do Not Diꜱturb Mode"
				+ "\n   {pn} Off: Turn Off Do Not Diꜱturb Mode"
		}
	},

	langs: {
		en: {
			turnedOff: "👊🏻 | Do Not Diꜱturb Mode Haꜱ Been Turned Off",
			turnedOn: "🎀 | Do Not Diꜱturb Mode Haꜱ Been Turned On",
			turnedOnWithReason: "🙌🏻 | Do Not Diꜱturb Mode On With Reaꜱon: %1",
			turnedOnWithoutReason: "👀 | Do Not Diꜱturb Mode Haꜱ Been Turned On",
			alreadyOn: "🥹 | Uꜱer %1 Iꜱ Currently Buꜱy",
			alreadyOnWithReason: "🥹 | Uꜱer %1 Iꜱ Currently Buꜱy With Reaꜱon: %2"
		}
	},

	onStart: async function ({ args, message, event, getLang, usersData }) {
		const { senderID } = event;

		if (args[0] == "off") {
			const { data } = await usersData.get(senderID);
			delete data.busy;
			await usersData.set(senderID, data, "data");
			return message.reply(getLang("turnedOff"));
		}

		const reason = args.join(" ") || "";
		await usersData.set(senderID, reason, "data.busy");
		return message.reply(
			reason ?
				getLang("turnedOnWithReason", reason) :
				getLang("turnedOnWithoutReason")
		);
	},

	onChat: async ({ event, message, getLang }) => {
		const { mentions } = event;

		if (!mentions || Object.keys(mentions).length == 0)
			return;
		const arrayMentions = Object.keys(mentions);

		for (const userID of arrayMentions) {
			const reasonBusy = global.db.allUserData.find(item => item.userID == userID)?.data.busy || false;
			if (reasonBusy !== false) {
				return message.reply(
					reasonBusy ?
						getLang("alreadyOnWithReason", mentions[userID].replace("@", ""), reasonBusy) :
						getLang("alreadyOn", mentions[userID].replace("@", "")));
			}
		}
	}
};
