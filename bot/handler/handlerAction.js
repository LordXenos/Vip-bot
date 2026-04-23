const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");
const fs = require("fs");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
	const handlerEvents = require(
		process.env.NODE_ENV == "development"
			? "./handlerEvents.dev.js"
			: "./handlerEvents.js"
	)(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {
		if (
			global.GoatBot.config.antiInbox == true &&
			(event.senderID == event.threadID ||
				event.userID == event.senderID ||
				event.isGroup == false) &&
			(event.senderID || event.userID || event.isGroup == false)
		) return;

		const banPath = __dirname + "/cmds/cache/thread-manage.json";
		if (fs.existsSync(banPath)) {
			const banData = JSON.parse(fs.readFileSync(banPath));
			const isBanned = banData.banList.some(t => t.id === event.threadID);
			if (isBanned) {
				if (["message", "message_reply", "message_reaction", "event"].includes(event.type)) {
					return api.sendMessage("🚫 This group is *banned* from using the bot!", event.threadID);
				}
				return;
			}
		}

		const message = createFuncMessage(api, event);

		await handlerCheckDB(usersData, threadsData, event);

		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat) return;

		const {
			onAnyEvent, onFirstChat, onStart, onChat,
			onReply, onEvent, handlerEvent, onReaction,
			typ, presence, read_receipt
		} = handlerChat;

		onAnyEvent();

		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				onFirstChat();
				onChat();
				onStart();
				onReply();
				break;

			case "event":
				handlerEvent();
				onEvent();
				break;

			case "message_reaction":
				const allowedReactions = ["🐸", "😠", "😡", "🥹"];

				if (allowedReactions.includes(event.reaction)) {
					if (event.senderID === api.getCurrentUserID()) {
						api.unsendMessage(event.messageID);
					}
				}

				onReaction();
				break;

			case "typ":
				typ();
				break;

			case "presence":
				presence();
				break;

			case "read_receipt":
				read_receipt();
				break;

			default:
				break;
		}
	};
};
