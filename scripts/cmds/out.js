module.exports = {
	config: {
		name: "out",
		author: "Unknown",
		role: 2, 
		shortDescription: "Make the bot leave the group",
		category: "admin",
		guide: "{pn} confirm",
		countDown: 10 
	},
	
	onStart: async function ({ api, event, args, message }) {
		const threadID = event.threadID;
		
		try {

			const threadInfo = await api.getThreadInfo(threadID);
			
			if (!threadInfo.isGroup) {
				return message.reply("❌ This command can only be used in group chats.");
			}
			

			if (args[0] !== "confirm") {
				return message.reply(
					"⚠️ Are you sure you want me to leave this group?\n\n" +
					"Type: !out confirm\n\n" +
					"⏰ This helps prevent accidental removals."
				);
			}
			
			await message.reply("Valo theko sobai 🥹🫶🏻....Tata");
			
			setTimeout(() => {
				api.removeUserFromGroup(api.getCurrentUserID(), threadID);
			}, 3000);
			
		} catch (error) {
			console.error("Error in out command:", error);
			return message.reply("❌ An error occurred while trying to leave the group.");
		}
	}
};
