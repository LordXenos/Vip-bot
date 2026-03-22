const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "couple",
		aliases: ["love"],
		version: "1.0.0",
		author: "Rasin",
		countDown: 5,
		role: 0,
		description: "Couple with someone",
		category: "image",
		guide: {
			en: "{pn} @mention\n\nExample: {pn} @Hazeyy"
		}
	},

	langs: {
		en: {
			noMention: "Please mention someone",
			processing: "Oky wait 😾🫶🏻",
			error: "An error occurred: %1"
		}
	},

	onStart: async function({ message, event, getLang }) {
		const { senderID, mentions } = event;
		const mention = Object.keys(mentions || {});

		if (!mention[0]) {
			return message.reply(getLang("noMention"));
		}

		const mentionedUID = mention[0];

		try {
			const processingMsg = await message.reply(getLang("processing"));

			const senderAvatarURL = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${senderID}`;
			const mentionedAvatarURL = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${mentionedUID}`;

			const apiURL = `https://api.popcat.xyz/v2/ship?user1=${encodeURIComponent(senderAvatarURL)}&user2=${encodeURIComponent(mentionedAvatarURL)}`;

			const response = await axios.get(apiURL, { responseType: "arraybuffer" });
			
			const cachePath = path.resolve(__dirname, "cache", `ship_${senderID}_${Date.now()}.png`);
			fs.writeFileSync(cachePath, Buffer.from(response.data));

			await message.reply({
				attachment: fs.createReadStream(cachePath)
			});

			await message.unsend(processingMsg.messageID);
			fs.unlinkSync(cachePath);
		}
		catch (err) {
			console.error(err);
			return message.reply(getLang("error", err.message));
		}
	}
};