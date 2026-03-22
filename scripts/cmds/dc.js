const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "discord",
		aliases: ["dc"],
		version: "1.3.0",
		author: "Rasin",
		countDown: 5,
		role: 0,
		description: "Gen Dc Img",
		category: "image",
		guide: {
			en: "{pn} @mention / username / FB link / UID - message\n\nExample: {pn} @Hazeyy - Hi"
		}
	},

	langs: {
		en: {
			noMention: "Please mention someone or provide username / FB link / UID",
			invalidFormat: "Invalid format! Use: {pn} @mention / username / FB link / UID - message\nExample: {pn} @Hazeyy - Hi there!",
			error: "An error occurred: %1",
			userNotFound: "User not found: %1",
			multipleUsers: "Multiple users found:\n%1",
			invalidLink: "Invalid Facebook link!"
		}
	},

	onStart: async function({ message, event, args, api, usersData, getLang, commandName }) {
		const { senderID, mentions, threadID, messageReply } = event;
		let mentionedUID;


		const findUserByName = async (query) => {
			try {
				const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
				const threadInfo = await api.getThreadInfo(threadID);
				const ids = threadInfo.participantIDs || [];
				const matches = [];

				for (const id of ids) {
					try {
						const name = (await usersData.getName(id)).toLowerCase();
						if (name.includes(cleanQuery)) matches.push({ uid: id, name });
					} catch {}
				}
				return matches;
			} catch {
				return [];
			}
		};


		let fullText = args.join(" ");


		if (messageReply) {
			mentionedUID = messageReply.senderID;

			fullText = fullText.replace(messageReply.body, "").trim();
		}

		else if (mentions && Object.keys(mentions)[0]) {
			mentionedUID = Object.keys(mentions)[0];

			for (let mentionName of Object.values(mentions)) {
				fullText = fullText.replace(`@${mentionName}`, "").trim();
			}
		}
		else if (fullText.includes("facebook.com")) {
			const match = fullText.match(/(\d{5,})/);
			if (!match) return message.reply(getLang("invalidLink"));
			mentionedUID = match[0];
		}
		else if (args[0] && /^\d+$/.test(args[0])) {
			mentionedUID = args[0];
		}

		else if (args[0]) {
			let usernameQuery = fullText.includes(" - ") ? fullText.split(" - ")[0].trim() : fullText.trim();

			const matches = await findUserByName(usernameQuery);

			if (!matches.length) return message.reply(getLang("userNotFound", usernameQuery));
			if (matches.length > 1) {
				const matchList = matches.map((m, i) => `${i + 1}. ${m.name}`).join("\n");
				return message.reply(getLang("multipleUsers", matchList));
			}

			mentionedUID = matches[0].uid;
		} 
		else return message.reply(getLang("noMention"));

		let messageContent = "";
		if (fullText.includes(" - ")) {
			messageContent = fullText.split(" - ").slice(1).join(" - ").trim();
		} else {
			messageContent = fullText.trim();
		}

		if (!messageContent) return message.reply(getLang("invalidFormat").replace("{pn}", commandName));

		let mentionedName = "User";
		if (mentionedUID) {
			try { mentionedName = (await usersData.getName(mentionedUID)) || "User"; } 
			catch { mentionedName = "User"; }
		}

		try {
			

			const avatarURL = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${mentionedUID}`;
			const colors = ["#5865F2","#57F287","#FEE75C","#EB459E","#ED4245","#ffcc99","#99ccff","#ff99cc","#cc99ff"];
			const randomColor = colors[Math.floor(Math.random() * colors.length)];
			const timestamp = new Date().toISOString();

			const apiURL = `https://api.popcat.xyz/v2/discord-message?username=${encodeURIComponent(mentionedName)}&content=${encodeURIComponent(messageContent)}&avatar=${encodeURIComponent(avatarURL)}&color=${encodeURIComponent(randomColor)}&timestamp=${encodeURIComponent(timestamp)}`;

			const response = await axios.get(apiURL, { responseType: "arraybuffer" });

			const cachePath = path.resolve(__dirname, "cache", `discord_${senderID}_${Date.now()}.png`);
			fs.writeFileSync(cachePath, Buffer.from(response.data));

			await message.reply({ attachment: fs.createReadStream(cachePath) });

			fs.unlinkSync(cachePath);
		} catch (err) {
			console.error(err);
			return message.reply(getLang("error", err.message));
		}
	}
};
