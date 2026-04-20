const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notice1",
		aliases: ["notify", "noti", "notice"],
		version: "2.0",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "Gửi thông báo từ admin đến all box",
			en: "Send notification from admin to all box"
		},
		category: "owner",
		guide: {
			en: "{pn} <message>\nYou can also reply to a message with attachments to include them in the notification"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	langs: {
		vi: {
			missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi đến tất cả các nhóm",
			notification: "Thông báo từ admin bot đến tất cả nhóm chat (không phản hồi tin nhắn này)",
			sendingNotification: "Bắt đầu gửi thông báo từ admin bot đến %1 nhóm chat",
			sentNotification: "✅ Đã gửi thông báo đến %1 nhóm thành công",
			errorSendingNotification: "Có lỗi xảy ra khi gửi đến %1 nhóm:\n%2"
		},
		en: {
			missingMessage: "Please enter the message you want to send to all groups",
			notification: "━━━━━━━━━━━━━━━━━━\n🔔 𝐌eꜱꜱage 𝐅rom 𝐁ot 𝐀dmin 🔔\n━━━━━━━━━━━━━━━━━━",
			sendingNotification: "📤 Start sending notification from admin bot to %1 chat groups",
			sentNotification: "✅ Sent notification to %1 groups successfully",
			errorSendingNotification: "❌ An error occurred while sending to %1 groups:\n%2",
			withAttachments: "📎 Including %1 attachment(s)"
		}
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
		const { delayPerGroup } = envCommands[commandName];
		
		// Check if message content exists
		if (!args[0])
			return message.reply(getLang("missingMessage"));

		// Collect attachments from both the current message and replied message
		const attachments = [
			...event.attachments,
			...(event.messageReply?.attachments || [])
		].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type));

		// Get attachment streams
		const attachmentStreams = await getStreamsFromAttachment(attachments);

		// Prepare the notification message
		const messageBody = `${getLang("notification")}\n\n📝 𝐌eꜱꜱage:\n${args.join(" ")}\n\n━━━━━━━━━━━━━━━━━━`;

		const formSend = {
			body: messageBody,
			attachment: attachmentStreams
		};

		// Get all group threads where bot is a member
		const allThreadID = (await threadsData.getAll()).filter(t => 
			t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
		);

		// Notify about sending process
		const attachmentInfo = attachments.length > 0 ? `\n${getLang("withAttachments", attachments.length)}` : "";
		message.reply(getLang("sendingNotification", allThreadID.length) + attachmentInfo);

		let sendSucces = 0;
		const sendError = [];
		const wattingSend = [];

		// Send notifications to all groups
		for (const thread of allThreadID) {
			const tid = thread.threadID;
			try {
				wattingSend.push({
					threadID: tid,
					pending: api.sendMessage(formSend, tid)
				});
				await new Promise(resolve => setTimeout(resolve, delayPerGroup));
			}
			catch (e) {
				sendError.push(tid);
			}
		}

		// Wait for all sends to complete
		for (const sended of wattingSend) {
			try {
				await sended.pending;
				sendSucces++;
			}
			catch (e) {
				const { errorDescription } = e;
				if (!sendError.some(item => item.errorDescription == errorDescription))
					sendError.push({
						threadIDs: [sended.threadID],
						errorDescription
					});
				else
					sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
			}
		}

		// Prepare result message
		let msg = "";
		if (sendSucces > 0)
			msg += getLang("sentNotification", sendSucces) + "\n";
		if (sendError.length > 0)
			msg += getLang("errorSendingNotification", 
				sendError.reduce((a, b) => a + b.threadIDs.length, 0), 
				sendError.reduce((a, b) => a + `\n - ${b.errorDescription}\n  + ${b.threadIDs.join("\n  + ")}`, "")
			);
		
		message.reply(msg);
	}
};
