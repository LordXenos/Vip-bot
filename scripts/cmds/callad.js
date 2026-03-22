const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "callad",
		aliases: ["call", "called"],
		version: "2.0",
		author: "Rasin", 
		prefix: true,
		countDown: 5,
		role: 0,
		description:"send report, feedback, bug,... to admin bot",
		category: "admin",
		guide: {
			en: "   {pn} <message>"
		}
	},

	langs: {
		en: {
			missingMessage: "◆ Pleaꜱe Enter The Meꜱꜱage You Want To Send To Admin",
			sendByUser: "\n◆ Sent From Uꜱer",
			content: "\n\n◆ Content\n\n━━━━━━━━━━━━━━\n\n%1\n\n━━━━━━━━━━━━━━\n\n◆ Reply Thiꜱ Meꜱꜱage To Send Meꜱꜱage To Uꜱer",
			success: "◆ Sent Your Meꜱꜱage To Admin Group Succeꜱꜱfully!",
			failed: "◆ An Error Occurred While Sending Your Meꜱꜱage To Admin Group\n◆ Check Conꜱole For More Detailꜱ",
			reply: "◈ Reply From Admin %1:\n━━━━━━━━━━━━━━━━━\n\n%2\n\n━━━━━━━━━━━━━━━━━\n◆ Reply Thiꜱ Meꜱꜱage To Continue Sending Meꜱꜱage To Admin",
			replySuccess: "◆ Sent Your Reply To Admin Succeꜱꜱfully!",
			feedback: "◈ Feedback From Uꜱer %1:\n◆ Uꜱer ID: %2%3\n\n◆ Content:\n━━━━━━━━━━━━━━━━━\n%4\n━━━━━━━━━━━━━━━━━\n◆ Reply Thiꜱ Meꜱꜱage To Send Meꜱꜱage To Uꜱer",
			replyUserSuccess: "◆ Sent Your Reply To Uꜱer Succeꜱꜱfully!",
			noAdminGroup: "◆ Bot Haꜱ No Admin Group Configured At The Moment"
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;
		
		if (!config.adminGroup)
			return message.reply(getLang("noAdminGroup"));
			
		if (!args[0])
			return message.reply(getLang("missingMessage"));
			
		const { senderID, threadID, isGroup } = event;
		const senderName = await usersData.getName(senderID);
		
		const msg = "◈ Call Admin ◈\n━━━━━━━━━━━━"
			+ `\n◆ Uꜱer Name: ${senderName}`

		const formMessage = {
			body: msg + getLang("content", args.join(" ")),
			mentions: [{
				id: senderID,
				tag: senderName
			}],
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		try {
			const messageSend = await api.sendMessage(formMessage, config.adminGroup);
			
			global.GoatBot.onReply.set(messageSend.messageID, {
				commandName,
				messageID: messageSend.messageID,
				threadID,
				messageIDSender: event.messageID,
				type: "userCallAdmin"
			});
			
			return message.reply(getLang("success"));
		}
		catch (err) {
			log.err("CALL ADMIN", err);
			return message.reply(getLang("failed"));
		}
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		switch (type) {
			case "userCallAdmin": {
				const formMessage = {
					body: getLang("reply", senderName, args.join(" ")),
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err)
						return message.err(err);
					message.reply(getLang("replyUserSuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "adminReply"
					});
				}, messageIDSender);
				break;
			}
			case "adminReply": {
				let sendByGroup = "";
				if (isGroup) {
					
					
				}
				const formMessage = {
					body: getLang("feedback", senderName, event.senderID, args.join(" ")),
					mentions: [{
						id: event.senderID,
						tag: senderName
					}],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err)
						return message.err(err);
					message.reply(getLang("replySuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}
			default: {
				break;
			}
		}
	}
};
