const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "file",
		version: "1.0",
		author: "Rasin",
    prefix: false,
		countDown: 5,
		role: 0,
		description: "Send bot file",
		longDescription: "Send File",
		category: "owner",
		guide: "{pn} <file path> | {pn} scripts/cmds/curl.js"
	},

	onStart: async function ({ message, args, api, event }) {
		const permission = ["100083520680035"];
		if (!permission.includes(event.senderID)) {
			return api.sendMessage("You don't have permission to use this command.", event.threadID, event.messageID);
		}

		const filePath = args.join(" ");
		if (!filePath) {
			return api.sendMessage("Please provide a file path.", event.threadID, event.messageID);
		}

		const absolutePath = path.resolve(filePath);
		if (!fs.existsSync(absolutePath)) {
			return api.sendMessage(`File not found: ${filePath}`, event.threadID, event.messageID);
		}

		const fileContent = fs.readFileSync(absolutePath, 'utf8');
		api.sendMessage({ body: fileContent }, event.threadID);
	}
};
