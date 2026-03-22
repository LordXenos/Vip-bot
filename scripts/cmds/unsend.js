module.exports = {
	config: {
		name: "unsend",
		aliases: ['u', 'uns', 'remove'],
		version: "1.2",
		prefix: false,
		author: "Rasin",
		countDown: 4,
		role: 0,
		description: {
			en: "Unsend bot message"
		},
		category: "box chat",
		guide: {
			en: "reply the message you want to unsend and call the command {pn}"
		}
	},

	langs: {
		en: {
			syntaxError: "Please reply the message you want to unsend 👀"
		}
	},

	onStart: async function ({ message, event, api, getLang }) {
		if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
			return message.reply(getLang("syntaxError"));
		message.unsend(event.messageReply.messageID);
	}
};