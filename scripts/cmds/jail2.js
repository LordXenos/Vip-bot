const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "jail2",
		aliases: ["jailv2"],
		version: "1.1.0",
		author: "Rasin",
		prefix: false,
		countDown: 5,
		role: 0,
		description: "Put someone in jail",
		category: "fun",
		guide: {
			en: "{pn} @mention - Jail mentioned user"
				+ "\n{pn} <name> - Search and jail user by name"
				+ "\n{pn} <uid> - Jail user by ID"
				+ "\n{pn} [reply] - Jail replied user"
				+ "\n\nExample: {pn} @Hazeyy or {pn} Hazeyy"
		}
	},

	langs: {
		en: {
			noMention: "Please mention, reply, or enter a name of someone to jail",
			processing: "👀",
			error: "An error occurred: %1",
			notFound: "User '%1' not found in this conversation",
			multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific."
		}
	},

	onStart: async function({ message, event, getLang, args, api, usersData }) {
		const { senderID, mentions, messageReply } = event;
		const mention = Object.keys(mentions || {});
		let mentionedUID;

		if (mention[0]) {
			mentionedUID = mention[0];
		}
		else if (messageReply) {
			mentionedUID = messageReply.senderID;
		}
		else if (args[0] && /^\d+$/.test(args[0])) {
			mentionedUID = args[0];
		}
		else if (args[0]) {
			const query = args.join(" ");
			const matches = await findUserByName(api, usersData, event.threadID, query);

			if (matches.length === 0) {
				return message.reply(getLang("notFound", query.replace(/@/g, "")));
			}

			if (matches.length > 1) {
				const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
				return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
			}

			mentionedUID = matches[0].uid;
		}
		else {
			return message.reply(getLang("noMention"));
		}

		try {
			const processingMsg = await message.reply(getLang("processing"));

			const avatarURL = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${mentionedUID}`;

			const apiURL = `https://api.popcat.xyz/v2/jail?image=${encodeURIComponent(avatarURL)}`;

			const response = await axios.get(apiURL, { responseType: "arraybuffer" });
			
			const cachePath = path.resolve(__dirname, "cache", `jail_${senderID}_${Date.now()}.png`);
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

async function findUserByName(api, usersData, threadID, query) {
	try {
		const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
		const threadInfo = await api.getThreadInfo(threadID);
		const ids = threadInfo.participantIDs || [];
		const matches = [];

		for (const uid of ids) {
			try {
				const name = (await usersData.getName(uid)).toLowerCase();
				if (name.includes(cleanQuery)) {
					matches.push({ uid, name: await usersData.getName(uid) });
				}
			} catch {}
		}

		return matches;
	} catch {
		return [];
	}
}
