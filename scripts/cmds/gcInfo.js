const axios = require("axios");

module.exports = {
	config: {
		name: "gcinfo",
		aliases: ["groupinfo"],
		version: "1.0.0",
		author: "Rasin",
        prefix: false,
		countDown: 5,
		role: 0,
		description: "Get information about the current thread/group",
		category: "info",
		guide: {
			en: "{pn}\n\nExample: {pn}"
		}
	},

	langs: {
		en: {
			threadInfo: "━━━━━━━━━━━━━\n𝐆roup 𝐈nꜰormation\n━━━━━━━━━━━━━\n\n❍ 𝐍ame: %1\n\n❍ 𝐓hread 𝐈d: %2\n\n❍ 𝐓otal 𝐌emberꜱ: %3\n❍ 𝐀dminꜱ: %7\n\n❍ 𝐓otal 𝐌eꜱꜱageꜱ: %8\n\n❍ 𝐄moji: %9\n\n❍ 𝐂reated: %10\n\n━━━━━━━━━━━━",
			error: "𝐀n 𝐄rror 𝐎ccurred: %1",
			notGroup: "𝐓hiꜱ 𝐂ommand 𝐂an 𝐎nly 𝐁e 𝐔ꜱed 𝐈n 𝐆roup 𝐂hatꜱ!"
		}
	},

	onStart: async function({ message, event, api, getLang, threadsData }) {
		const { threadID, isGroup } = event;

		if (!isGroup) {
			return message.reply(getLang("notGroup"));
		}

		try {
			const threadInfo = await api.getThreadInfo(threadID);
			const threadData = await threadsData.get(threadID);

			const threadName = threadInfo.threadName || "Unnamed Group";

			const totalMembers = threadInfo.participantIDs.length;

			const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
			const totalAdmins = adminIDs.length;

			let maleCount = 0;
			let femaleCount = 0;
			let unknownCount = 0;

			const userInfos = await api.getUserInfo(threadInfo.participantIDs);
			
			for (const uid of threadInfo.participantIDs) {
				const userInfo = userInfos[uid];
				if (userInfo && userInfo.gender !== undefined) {
					if (userInfo.gender === 2 || userInfo.gender === "MALE") {
						maleCount++;
					} else if (userInfo.gender === 1 || userInfo.gender === "FEMALE") {
						femaleCount++;
					} else {
						unknownCount++;
					}
				} else {
					unknownCount++;
				}
			}

			const messageCount = threadInfo.messageCount || "N/A";

			const emoji = threadInfo.emoji

			let createdDate = "Unknown";
			if (threadInfo.timestamp) {
				const date = new Date(parseInt(threadInfo.timestamp));
				if (!isNaN(date.getTime())) {
					createdDate = date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric"
					});
				}
			}
			let threadImage = null;
			if (threadInfo.imageSrc) {
				try {
					const imageResponse = await axios.get(threadInfo.imageSrc, {
						responseType: "stream"
					});
					threadImage = imageResponse.data;
				} catch (err) {
					console.error("Error fetching thread image:", err);
				}
			}

			const infoMessage = getLang(
				"threadInfo",
				threadName,
				threadID,
				totalMembers,
				maleCount,
				femaleCount,
				unknownCount,
				totalAdmins,
				messageCount,
				emoji,
				createdDate
			);

			if (threadImage) {
				return message.reply({
					body: infoMessage,
					attachment: threadImage
				});
			} else {
				return message.reply(infoMessage);
			}

		} catch (err) {
			console.error(err);
			return message.reply(getLang("error", err.message));
		}
	}
};