const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: 'admin',
		aliases: [],
		prefix: true,
		author: 'Rasin',
		countDown: 5,
		role: 2,
		description: 'Add, Remove, Edit Admin Role',
		category: 'box Chat',
		guide: {
			en: "{pn} add @mention - Add mentioned user as admin"
				+ "\n{pn} add <name> - Search and add user as admin"
				+ "\n{pn} add <uid> - Add user by UID as admin"
				+ "\n{pn} remove @mention - Remove mentioned admin"
				+ "\n{pn} remove <name> - Search and remove admin"
				+ "\n{pn} remove <uid> - Remove admin by UID"
				+ "\n{pn} list - Show all admins"
		}
	},

	langs: {
		en: {
			invalidUsage: "❌ Usage: add/remove/list <uid/name/@mention>",
			invalidAction: "❌ Invalid action. Use: add, remove, or list",
			noUidProvided: "❌ Please provide UID, @tag user, or name to add admin role",
			noUidRemove: "❌ Please provide UID, @tag user, or name to remove admin role",
			processing: "⏳ Processing...",
			notFound: "User '%1' not found in this conversation",
			multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
			additionTitle: "\n━━━━━ 𝐀𝐃𝐌𝐈𝐍 𝐀𝐃𝐃𝐈𝐓𝐈𝐎𝐍 ━━━━━",
			added: "\n✅ 𝐀𝐝𝐝𝐞𝐝 %1 𝐀𝐝𝐦𝐢𝐧(𝐬):\n%2",
			alreadyAdmin: "\n\n⚠️ 𝐀lready 𝐀𝐝𝐦𝐢𝐧 (%1):\n%2",
			removalTitle: "\n━━━━━ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐀𝐋 ━━━━━",
			removed: "\n✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 %1 𝐀𝐝𝐦𝐢𝐧(𝐬):\n%2",
			notAdmin: "\n\n𝐍𝐨𝐭 𝐀𝐝𝐦𝐢𝐧 (%1):\n%2",
			divider: "\n━━━━━━━━━━━━━━━━━━━",
			noAdmins: "No admins found",
			listTitle: "\n━━━━━ 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓 ━━━━━\n",
			error: "❌ Error occurred while processing admin command"
		}
	},

	onStart: async function ({ api, message, args, event, usersData, getLang }) {
		try {
			if (args.length < 1) {
				return message.reply(getLang("invalidUsage"));
			}

			const action = args[0].toLowerCase();
			
			switch (action) {
				case 'add':
				case '-a':
					return await handleAddAdmin({ api, message, args, event, usersData, getLang });
				case 'remove':
				case '-r':
					return await handleRemoveAdmin({ api, message, args, event, usersData, getLang });
				case 'list':
				case '-l':
					return await handleListAdmin({ message, usersData, getLang });
				default:
					return message.reply(getLang("invalidAction"));
			}
		} catch (err) {
			console.error(err);
			return message.reply(getLang("error"));
		}
	}
};

async function handleAddAdmin({ api, message, args, event, usersData, getLang }) {
	if (args.length < 2) {
		return message.reply(getLang("noUidProvided"));
	}

	const waiting = await message.reply(getLang("processing"));
	
	let uids = [];
	if (Object.keys(event.mentions).length > 0) {
		uids = Object.keys(event.mentions);
	} else if (event.messageReply) {
		uids.push(event.messageReply.senderID);
	} else if (!isNaN(args[1])) {
		uids = args.slice(1).filter(arg => !isNaN(arg));
	} else {
		const query = args.slice(1).join(" ");
		const matches = await findUserByName(api, usersData, event.threadID, query);

		if (matches.length === 0) {
			message.unsend(waiting.messageID);
			return message.reply(getLang("notFound", query.replace(/@/g, "")));
		}

		if (matches.length > 1) {
			message.unsend(waiting.messageID);
			const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
			return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
		}

		uids.push(matches[0].uid);
	}

	const adminIds = [];
	const addedIds = [];

	for (const uid of uids) {
		if (config.adminBot.includes(uid)) {
			adminIds.push(uid);
		} else {
			addedIds.push(uid);
			config.adminBot.push(uid);
		}
	}

	writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
	message.unsend(waiting.messageID);

	const getNames = await Promise.all(
		uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
	);

	let replyText = getLang("additionTitle");
	if (addedIds.length > 0) {
		const addedNames = getNames.filter(x => addedIds.includes(x.uid));
		const namesList = addedNames.map(x => `❍ ${x.name} (${x.uid})`).join("\n");
		replyText += getLang("added", addedIds.length, namesList);
	}
	if (adminIds.length > 0) {
		const adminList = adminIds.map(uid => `❍ ${uid}`).join("\n");
		replyText += getLang("alreadyAdmin", adminIds.length, adminList);
	}
	replyText += getLang("divider");

	return message.reply(replyText);
}

async function handleRemoveAdmin({ api, message, args, event, usersData, getLang }) {
	if (args.length < 2) {
		return message.reply(getLang("noUidRemove"));
	}

	const waiting = await message.reply(getLang("processing"));

	let uids = [];
	if (Object.keys(event.mentions).length > 0) {
		uids = Object.keys(event.mentions);
	} else if (event.messageReply) {
		uids.push(event.messageReply.senderID);
	} else if (!isNaN(args[1])) {
		uids = args.slice(1).filter(arg => !isNaN(arg));
	} else {
		const query = args.slice(1).join(" ");
		const matches = await findUserByName(api, usersData, event.threadID, query);

		if (matches.length === 0) {
			message.unsend(waiting.messageID);
			return message.reply(getLang("notFound", query.replace(/@/g, "")));
		}

		if (matches.length > 1) {
			message.unsend(waiting.messageID);
			const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
			return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
		}

		uids.push(matches[0].uid);
	}

	const removedIds = [];
	const notAdminIds = [];

	for (const uid of uids) {
		if (config.adminBot.includes(uid)) {
			removedIds.push(uid);
			config.adminBot.splice(config.adminBot.indexOf(uid), 1);
		} else {
			notAdminIds.push(uid);
		}
	}

	writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
	message.unsend(waiting.messageID);

	const getNames = await Promise.all(
		removedIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
	);

	let replyText = getLang("removalTitle");
	if (removedIds.length > 0) {
		const namesList = getNames.map(x => `❍ ${x.name} (${x.uid})`).join("\n");
		replyText += getLang("removed", removedIds.length, namesList);
	}
	if (notAdminIds.length > 0) {
		const notAdminList = notAdminIds.map(uid => `❍ ${uid}`).join("\n");
		replyText += getLang("notAdmin", notAdminIds.length, notAdminList);
	}
	replyText += getLang("divider");

	return message.reply(replyText);
}

async function handleListAdmin({ message, usersData, getLang }) {
	if (config.adminBot.length === 0) {
		return message.reply(getLang("noAdmins"));
	}

	const getNames = await Promise.all(
		config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
	);

	const listText = getLang("listTitle") + getNames.map((x, i) =>`✦ ${x.name}\n❏ UID: ${x.uid}`).join("\n\n");
	return message.reply(listText);
}

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