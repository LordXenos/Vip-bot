const ALLOWED_USER = "61581548070081"; // শুধু এই ইউজার কমান্ড চালাতে পারবে

module.exports = {
	config: {
		name: "setcount",
		version: "1.0",
		author: "Vydron1122",
		countDown: 5,
		role: 0,
		description: {
			en: "Set message count for a user (Authorized user only)"
		},
		category: "owner",
		guide: {
			en: "{pn} [@mention/uid] [amount]\n{pn} [amount] (reply to user message)"
		}
	},

	onStart: async function ({ message, event, args, api, threadsData }) {
		const senderID = event.senderID;
		const { threadID } = event;

		// শুধু নির্দিষ্ট ইউজার চেক
		if (senderID !== ALLOWED_USER) {
			return message.reply("❌ You are not authorized to use this command!");
		}

		try {
			let targetID;
			let amount;

			// কেইস ১: রিপ্লাই করে setcount amount
			if (event.messageReply && args.length === 1) {
				targetID = event.messageReply.senderID;
				amount = parseInt(args[0]);

				if (isNaN(amount) || amount < 0) {
					return message.reply("❌ Please enter a valid number!");
				}
			}
			// কেইস ২: setcount @mention/uid amount
			else if (args.length >= 2) {
				// মেনশন থেকে আইডি নেওয়া
				if (Object.keys(event.mentions).length > 0) {
					targetID = Object.keys(event.mentions)[0];
					amount = parseInt(args[1]);
				} 
				// UID থেকে আইডি নেওয়া
				else {
					targetID = args[0];
					amount = parseInt(args[1]);
				}

				if (isNaN(amount) || amount < 0) {
					return message.reply("❌ Please enter a valid number!");
				}

				// UID ভ্যালিডেশন
				if (targetID.length < 10 || isNaN(targetID)) {
					return message.reply("❌ Please enter a valid UID or mention a user!");
				}
			} 
			else {
				return message.reply(
					"❌ Invalid format!\n\n" +
					"Usage:\n" +
					"• !setcount @mention/uid [amount]\n" +
					"• !setcount [amount] (reply to user message)"
				);
			}

			// থ্রেড ডাটা পাওয়া
			const threadData = await threadsData.get(threadID);
			const { members } = threadData;
			
			// টার্গেট ইউজার খোঁজা
			const findMember = members.find(user => user.userID == targetID);
			
			if (!findMember) {
				// ইউজার না থাকলে নতুন যোগ করা
				let userName = "Unknown";
				try {
					const userInfo = await api.getUserInfo(targetID);
					userName = userInfo[targetID]?.name || "Unknown";
				} catch (e) {}
				
				members.push({
					userID: targetID,
					name: userName,
					nickname: null,
					inGroup: true,
					count: amount
				});
				
				await threadsData.set(threadID, members, "members");
				
				// ইউজারের নাম পাওয়া
				let userName2 = "Unknown";
				try {
					const userInfo = await api.getUserInfo(targetID);
					userName2 = userInfo[targetID]?.name || "Unknown";
				} catch (e) {}
				
				const msg = `📊 **Message Count Updated** 📊\n\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`👤 **User:** ${userName2}\n` +
							`🆔 **UID:** ${targetID}\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`📨 **New Count:** ${amount.toLocaleString()}\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`✅ **Updated by:** Authorized User\n` +
							`━━━━━━━━━━━━━━━━\n` +
							`✨ Done, baby!`;
				
				return message.reply(msg);
			}
			
			// পুরনো কাউন্ট সংরক্ষণ
			const oldCount = findMember.count || 0;
			
			// নতুন কাউন্ট সেট
			findMember.count = amount;
			
			// ডাটাবেস আপডেট
			await threadsData.set(threadID, members, "members");

			// ইউজারের নাম পাওয়া
			let userName = "Unknown";
			try {
				const userInfo = await api.getUserInfo(targetID);
				userName = userInfo[targetID]?.name || "Unknown";
			} catch (e) {}

			// সফল মেসেজ
			const msg = `📊 **Message Count Updated** 📊\n\n` +
						`━━━━━━━━━━━━━━━━\n` +
						`👤 **User:** ${userName}\n` +
						`🆔 **UID:** ${targetID}\n` +
						`━━━━━━━━━━━━━━━━\n` +
						`📨 **Old Count:** ${oldCount.toLocaleString()}\n` +
						`📨 **New Count:** ${amount.toLocaleString()}\n` +
						`━━━━━━━━━━━━━━━━\n` +
						`✅ **Updated by:** Authorized User\n` +
						`━━━━━━━━━━━━━━━━\n` +
						`✨ Done, baby!`;

			return message.reply(msg);

		} catch (error) {
			console.error("Setcount Error:", error);
			return message.reply(`❌ Error: ${error.message}`);
		}
	}
};