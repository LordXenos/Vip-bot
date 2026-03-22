const fs = require("fs-extra");

module.exports = {
	config: {
		name: "restart",
		version: "1.2",
		author: "Rasin",
		prefix: false,
		countDown: 5,
		role: 2,
		description: {
			en: "Reꜱtart Bot"
		},
		category: "owner",
		guide: {
			en: "   {pn}: Reꜱtart Bot"
		}
	},

	langs: {
	
		en: {
			restartting: "Restarting... Pleaꜱe Wait 👀🙌🏻"
		}
	},

	onLoad: function ({ api }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			api.sendMessage(`🎀 | Bot Haꜱ Succeꜱꜱfully Reꜱtarted 👊🏻\n⏰ | Time: ${(Date.now() - time) / 1000}s`, tid);
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event, getLang }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
		await message.reply(getLang("restartting"));
		process.exit(2);
	}
};
