const { getTime } = global.utils;

module.exports = {
	config: {
		name: "antiout",
		version: "1.0",
		author: "Rasin",
		category: "events"
	},

	langs: {
		vi: {
			userLeft: "Nghe này, {userName}! Nhóm này như một băng đảng!\nĐể rời nhóm, bạn cần sự cho phép của admin!\nBạn đã rời mà không xin phép – bây giờ tôi đã thêm bạn lại theo phong cách mafia",
			userBlocked: "Sorry boss, I couldn't add back the member\n{userName} has blocked the bot or doesn't have messenger option enabled, so I couldn't add them back 😞"
		},
		en: {
			userLeft: "Antiout mode {userName} has been re-added to the group",
			userBlocked: "Cannot re-add {userName}\nUser has blocked the bot or doesn't have messenger option enabled 😞"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe") {
			return async function () {
				const { threadID, logMessageData, author } = event;
				
				const threadData = await threadsData.get(threadID);
				const antioutEnabled = threadData.data.antiout !== false;
				
				if (!antioutEnabled) {
					return;
				}
				
				if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
					return;
				}

				const leftUserFbId = logMessageData.leftParticipantFbId;
				let userName;
				
				try {
					const userData = await usersData.get(leftUserFbId);
					userName = userData.name;
				} catch (err) {
					try {
						const userInfo = await api.getUserInfo(leftUserFbId);
						userName = userInfo[leftUserFbId].name;
					} catch (error) {
						userName = "User";
					}
				}
				
				const isSelfleft = (author == leftUserFbId);

				if (isSelfleft) {
					api.addUserToGroup(leftUserFbId, threadID, (error, info) => {
						if (error) {
							return message.send(
								getLang("userBlocked").replace(/\{userName\}/g, userName)
							);
						} else {
							return message.send(
								getLang("userLeft").replace(/\{userName\}/g, userName)
							);
						}
					});
				}
			};
		}
	}
};