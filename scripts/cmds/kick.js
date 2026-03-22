module.exports = {
	config: {
		name: "kick",
		version: "3.0",
		author: "Rasin",
		countDown: 5,
		role: 1,
		description: {
			en: "Kick member out of chat box"
		},
		category: "box chat",
		guide: {
			en: "   {pn} <name>: use to kick member by name\n   {pn} [reply]: kick replied member"
		}
	},

	langs: {
		en: {
			needAdmin: "Please add admin for bot before using this feature",
			notFound: "User not found",
			multiple: "Multiple users found, please be more specific"
		}
	},

	onStart: async function ({ message, event, args, threadsData, api, getLang, usersData }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		const findUserByName = async (query) => {
			try {
				const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
				const threadInfo = await api.getThreadInfo(event.threadID);
				const ids = threadInfo.participantIDs || [];
				const matches = [];

				for (const uid of ids) {
					try {
						const name = (await usersData.getName(uid)).toLowerCase();
						if (name.includes(cleanQuery)) {
							matches.push({ uid, name });
						}
					} catch {}
				}

				return matches;
			} catch {
				return [];
			}
		};

		async function kickAndCheckError(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
			}
			catch (e) {
				message.reply(getLang("needAdmin"));
				return "ERROR";
			}
		}

		// If no args, check for reply
		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();
			await kickAndCheckError(event.messageReply.senderID);
		}
		// If args provided, search by name
		else {
			const query = args.join(" ");
			const matches = await findUserByName(query);

			if (matches.length === 0) {
				return message.reply(`${getLang("notFound")}: ${query.replace(/@/g, "")}`);
			}

			if (matches.length > 1) {
				const matchList = matches.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
				return message.reply(`${getLang("multiple")}:\n${matchList}`);
			}

			// Kick the matched user
			await kickAndCheckError(matches[0].uid);
		}
	}
};