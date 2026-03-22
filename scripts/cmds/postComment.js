const { getStreamsFromAttachment, log } = global.utils;

module.exports = {
	config: {
		name: "postcomment",
		aliases: ["comment", "fbcomment", "cmtpost"],
		version: "1.0",
		author: "Rasin",
		prefix: true,
		countDown: 10,
		role: 0,
		description: "Comment on a Facebook post with text, attachments, mentions, or stickers",
		category: "social",
		guide: {
			en: "   {pn} <postID> <text> - Comment on a post\n"
				+ "   {pn} <postID> <text> [reply to message] - Comment with attachments\n"
				+ "   {pn} reply <postID> <commentID> <text> - Reply to a comment\n"
				+ "   {pn} sticker <postID> <stickerID> - Comment with a sticker"
		}
	},

	langs: {
		en: {
			missingPostID: "◆ Pleaꜱe Provide A Poꜱt ID\n◆ Uꜱage: {pn} <postID> <text>",
			missingText: "◆ Pleaꜱe Enter Your Comment Text",
			missingCommentID: "◆ Pleaꜱe Provide A Comment ID To Reply\n◆ Uꜱage: {pn} reply <postID> <commentID> <text>",
			missingStickerID: "◆ Pleaꜱe Provide A Sticker ID\n◆ Uꜱage: {pn} sticker <postID> <stickerID>",
			commenting: "◆ Poꜱting Your Comment...",
			success: "◆ Comment Poꜱted Succeꜱꜱfully!\n━━━━━━━━━━━━━━━━━\n◆ Comment ID: %1\n◆ Poꜱt URL: %2\n◆ Total Commentꜱ: %3",
			replySuccess: "◆ Reply Poꜱted Succeꜱꜱfully!\n━━━━━━━━━━━━━━━━━\n◆ Comment ID: %1\n◆ Poꜱt URL: %2\n◆ Total Commentꜱ: %3",
			stickerSuccess: "◆ Sticker Comment Poꜱted Succeꜱꜱfully!\n━━━━━━━━━━━━━━━━━\n◆ Comment ID: %1\n◆ Poꜱt URL: %2",
			failed: "◆ Failed To Poꜱt Comment\n◆ Error: %1",
			uploadingAttachments: "◆ Uploading Attachmentꜱ...",
			invalidPostID: "◆ Invalid Poꜱt ID Format",
			invalidCommentID: "◆ Invalid Comment ID Format"
		}
	},

	onStart: async function ({ args, message, event, api, getLang, commandName }) {
		try {
			const subCommand = args[0]?.toLowerCase();
			let commentData = {};
			let postID = null;
			let replyCommentID = null;

			if (subCommand === "reply") {
				if (!args[1]) return message.reply(getLang("missingPostID").replace("{pn}", commandName));
				if (!args[2]) return message.reply(getLang("missingCommentID").replace("{pn}", commandName));
				
				postID = args[1];
				replyCommentID = args[2];
				const text = args.slice(3).join(" ");
				
				if (!text && !event.messageReply?.attachments?.length && !event.attachments?.length) {
					return message.reply(getLang("missingText"));
				}
				
				commentData = {
					body: text || ""
				};
			}
			else if (subCommand === "sticker") {
				if (!args[1]) return message.reply(getLang("missingPostID").replace("{pn}", commandName));
				if (!args[2]) return message.reply(getLang("missingStickerID").replace("{pn}", commandName));
				
				postID = args[1];
				const stickerID = args[2];
				
				commentData = {
					sticker: stickerID
				};
			}
			else {
				if (!args[0]) return message.reply(getLang("missingPostID").replace("{pn}", commandName));
				
				postID = args[0];
				const text = args.slice(1).join(" ");
				
				if (!text && !event.messageReply?.attachments?.length && !event.attachments?.length) {
					return message.reply(getLang("missingText"));
				}
				
				commentData = {
					body: text || ""
				};
			}

			if (!/^\d+$/.test(postID) && !postID.includes("_") && !postID.startsWith("pfbid")) {
				return message.reply(getLang("invalidPostID"));
			}

			if (replyCommentID && !/^\d+$/.test(replyCommentID) && !replyCommentID.includes("_") && !replyCommentID.startsWith("pfbid")) {
				return message.reply(getLang("invalidCommentID"));
			}

			const attachments = [
				...(event.attachments || []),
				...(event.messageReply?.attachments || [])
			];

			if (attachments.length > 0 && !commentData.sticker) {
				await message.reply(getLang("uploadingAttachments"));
				commentData.attachment = await getStreamsFromAttachment(attachments);
			}

			const commentingMsg = await message.reply(getLang("commenting"));

			let result;
			if (replyCommentID) {
				result = await api.createCommentPost(commentData, postID, replyCommentID);
			} else {
				result = await api.createCommentPost(commentData, postID);
			}

			let successMsg;
			if (commentData.sticker) {
				successMsg = getLang("stickerSuccess", result.id, result.url);
			} else if (replyCommentID) {
				successMsg = getLang("replySuccess", result.id, result.url, result.count);
			} else {
				successMsg = getLang("success", result.id, result.url, result.count);
			}

			await message.reply(successMsg);
			message.unsend(commentingMsg.messageID);

		} catch (err) {
			log.err("POSTCOMMENT COMMAND", err);
			
			let errorMsg = err.error || err.message || JSON.stringify(err);
			
			return message.reply(getLang("failed", errorMsg));
		}
	}
};
