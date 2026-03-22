const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: "Showing bot prefix",
		category: "config",
		guide: {
			vi: "   {pn} <new prefix>: thay đổi prefix mới trong box chat của bạn"
				+ "\n   Ví dụ:"
				+ "\n    {pn} #"
				+ "\n\n   {pn} <new prefix> -g: thay đổi prefix mới trong hệ thống bot (chỉ admin bot)"
				+ "\n   Ví dụ:"
				+ "\n    {pn} # -g"
				+ "\n\n   {pn} reset: thay đổi prefix trong box chat của bạn về mặc định",
			en: "   {pn} <new prefix>: change new prefix in your box chat"
				+ "\n   Example:"
				+ "\n    {pn} #"
				+ "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)"
				+ "\n   Example:"
				+ "\n    {pn} # -g"
				+ "\n\n   {pn} reset: change prefix in your box chat to default"
		}
	},

	langs: {
		en: {
			reset: "Your prefix has been reset to default: %1",
			onlyAdmin: "Only admin can change prefix of system bot",
			confirmGlobal: "Please react to this message to confirm change prefix of system bot",
			confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
			successGlobal: "Changed prefix of system bot to: %1",
			successThisThread: "Changed prefix in your box chat to: %1",
			myPrefix: "🧸🎀 ⋆˚✿°────୨ᰔ୧────°✿˚ ✨🌸\n\n❤‍🩹 𝐇𝐞𝐲 𝐂𝐮𝐭𝐢𝐞 𝐏𝐢𝐞 🍫\n🎀 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐌𝐲 𝐋𝐨𝐯𝐞𝐥𝐲 𝐏𝐫𝐞𝐟𝐢𝐱 𝐟𝐨𝐫 𝐘𝐨𝐮 💗\n\n𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱 : %1\n\n𝐆𝐫𝐨𝐮𝐩 𝐏𝐫𝐞𝐟𝐢𝐱 : %2\n\n🎀˚✿ 𝐎𝐰𝐧𝐞𝐝 𝐛𝐲 𝐑𝐚𝐬𝐢𝐧 🧸✨\n\n🎀✨ ˚✿°────୨ᰔ୧────°✿˚ 🫶🏻🧸"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g")
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		else
			formSet.setGlobal = false;

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
	if (event.body && event.body.toLowerCase() === "prefix")
		return () => {
			return message.reply({
				body: getLang(
					"myPrefix",
					global.GoatBot.config.prefix,
					utils.getPrefix(event.threadID)
				),
				attachment: fs.createReadStream(
					__dirname + "/rasin/cutiee.jpg"
				)
			});
		};
}

};