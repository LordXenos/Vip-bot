const { log } = global.utils;

module.exports = {
	config: {
		name: "creategroup",
		aliases: ["newgroup", "makegroup", "gcreate"],
		version: "1.1",
		author: "Rasin",
		prefix: true,
		countDown: 15,
		role: 0,
		description: "Create a new Facebook Messenger group chat with specified participants",
		category: "group",
		guide: {
			en: "   {pn} <group name> | <uid1> <uid2> <uid3>... - Create a group with name and user IDs\n"
				+ "   {pn} <group name> | @mention @mention - Create a group by mentioning users\n"
				+ "   {pn} <group name> | <name1> <name2> - Create a group by searching names\n"
				+ "   {pn} <group name> - Create a group with yourself (requires reply with UIDs)\n"
				+ "   Note: Minimum 1 other participant required (cannot add only yourself or bot)"
		}
	},

	langs: {
		en: {
			missingGroupName: "◆ Please Provide A Group Name\n◆ Usage: {pn} <group name> | <uid1> <uid2>",
			missingParticipants: "◆ Please Provide At Least 1 Participant UID\n◆ Usage: {pn} <group name> | <uid1> <uid2>",
			invalidUID: "◆ Invalid User ID: %1\n◆ User IDs Must Be Numeric",
			creatingGroup: "◆ Creating Group Chat...\n◆ Group Name: %1\n◆ Participants: %2",
			success: "◆ Group Created Successfully!\n━━━━━━━━━━━━━━━━━\n◆ Group Name: %1\n◆ Group ID: %2\n◆ Total Members: %3\n◆ Creator: %4",
			failed: "◆ Failed To Create Group\n◆ Error: %1",
			userUnavailable: "◆ Failed To Create Group\n━━━━━━━━━━━━━━━━━\n◆ Error: One or more users are unavailable\n◆ Possible Reasons:\n   • User blocked the bot\n   • User has strict privacy settings\n   • User's account is restricted\n   • Bot lacks permission to add this user\n\n◆ Try:\n   • Adding different users\n   • Asking users to unblock the bot\n   • Using users who have interacted with the bot before",
			invalidFormat: "◆ Invalid Format\n◆ Use: {pn} <group name> | <uid1> <uid2>",
			tooFewParticipants: "◆ Not Enough Participants\n◆ Minimum 2 Users Required (Including Yourself)",
			duplicateUIDs: "◆ Duplicate User IDs Removed\n◆ Unique Participants: %1",
			notFound: "◆ User '%1' not found in this conversation",
			multiple: "◆ Multiple users found with name '%1':\n%2\n\n◆ Please use their UID or be more specific.",
			searchingUsers: "◆ Searching for users...",
			foundUser: "◆ Found: %1 (%2)"
		}
	},

	onStart: async function ({ args, message, event, api, getLang, commandName, usersData }) {
		try {
			const input = args.join(" ");
			
			if (!input) {
				return message.reply(getLang("missingGroupName").replace("{pn}", commandName));
			}

			const parts = input.split("|");
			
			if (parts.length < 1) {
				return message.reply(getLang("invalidFormat").replace("{pn}", commandName));
			}

			const groupName = parts[0].trim();
			
			if (!groupName) {
				return message.reply(getLang("missingGroupName").replace("{pn}", commandName));
			}

			let participantIDs = [];

			if (event.mentions && Object.keys(event.mentions).length > 0) {
				const mentionedUIDs = Object.keys(event.mentions);
				participantIDs.push(...mentionedUIDs);
				console.log("Found mentions:", mentionedUIDs);
			}
			
			const senderID = event.senderID || event.userID;
			console.log("Sender ID:", senderID);
			if (senderID && !participantIDs.includes(senderID)) {
				participantIDs.push(senderID);
				console.log("Added sender to participants");
			}

			if (parts.length > 1) {
				const uidString = parts.slice(1).join("|").trim();
				const rawUIDs = uidString.match(/\d{10,}/g);
				
				if (rawUIDs && rawUIDs.length > 0) {
					console.log("Found UIDs in text:", rawUIDs);
					participantIDs.push(...rawUIDs);
				} else if (uidString) {
					const searchMsg = await message.reply(getLang("searchingUsers"));
					
					const nameQueries = uidString.split(/\s+/).filter(q => q.trim().length > 0);
					
					for (const query of nameQueries) {
						const matches = await findUserByName(api, usersData, event.threadID, query);
						
						if (matches.length === 0) {
							message.unsend(searchMsg.messageID);
							return message.reply(getLang("notFound", query.replace(/@/g, "")));
						}
						
						if (matches.length > 1) {
							message.unsend(searchMsg.messageID);
							const matchList = matches.map(m => `   • ${m.name}: ${m.uid}`).join('\n');
							return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
						}
						
						participantIDs.push(matches[0].uid);
						console.log(getLang("foundUser", matches[0].name, matches[0].uid));
					}
					
					if (searchMsg && searchMsg.messageID) {
						message.unsend(searchMsg.messageID);
					}
				}
			}

			if (participantIDs.length === 0 && event.messageReply) {
				const replyBody = event.messageReply.body || "";
				const uidMatches = replyBody.match(/\d+/g);
				if (uidMatches) {
					participantIDs.push(...uidMatches);
				}
			}

			const originalCount = participantIDs.length;
			participantIDs = [...new Set(participantIDs)];
			
			console.log("Participants after dedup:", participantIDs);
			
			if (originalCount > participantIDs.length) {
				await message.reply(getLang("duplicateUIDs", participantIDs.length));
			}

			const botID = api.getCurrentUserID();
			participantIDs = participantIDs.filter(id => id !== botID);
			
			console.log("Participants after bot filter:", participantIDs);
			console.log("Bot ID:", botID);

			if (participantIDs.length < 2) {
				return message.reply(
					getLang("tooFewParticipants") + 
					`\n◆ Debug: Found ${participantIDs.length} unique participant(s)` +
					`\n◆ Tip: You need to mention at least one OTHER person besides yourself`
				);
			}

			const participantNames = [];
			for (const uid of participantIDs.slice(0, 5)) {
				try {
					const userData = await usersData.get(uid);
					participantNames.push(userData.name || uid);
				} catch {
					participantNames.push(uid);
				}
			}
			
			const displayNames = participantNames.join(", ") + 
				(participantIDs.length > 5 ? ` +${participantIDs.length - 5} more` : "");

			const creatingMsg = await message.reply(
				getLang("creatingGroup", groupName, displayNames)
			);

			api.createNewGroup(participantIDs, groupName, async (err, threadID) => {
				try {
					if (creatingMsg && creatingMsg.messageID) {
						message.unsend(creatingMsg.messageID);
					}

					if (err) {
						log.err("CREATEGROUP COMMAND", err);
						
						const errorStr = JSON.stringify(err);
						if (errorStr.includes("isn't available") || errorStr.includes("is_not_critical")) {
							return message.reply(getLang("userUnavailable"));
						}
						
						let errorMsg = err.error || err.message || JSON.stringify(err);
						if (errorMsg.length > 500) {
							errorMsg = errorMsg.substring(0, 500) + "...";
						}
						return message.reply(getLang("failed", errorMsg));
					}

					let creatorName;
					try {
						const creatorData = await usersData.get(event.senderID);
						creatorName = creatorData.name || "Unknown";
					} catch {
						creatorName = "Unknown";
					}

					const successMsg = getLang(
						"success",
						groupName,
						threadID,
						participantIDs.length + 1,
						creatorName
					);

					await message.reply(successMsg);

					try {
						await api.sendMessage(
							`◆ Welcome To The Group!\n━━━━━━━━━━━━━━━━━\n◆ Group: ${groupName}\n◆ Created By: ${creatorName}\n◆ Members: ${participantIDs.length + 1}`,
							threadID
						);
					} catch (welcomeErr) {
						log.err("CREATEGROUP WELCOME", welcomeErr);
					}

				} catch (callbackErr) {
					log.err("CREATEGROUP CALLBACK", callbackErr);
					return message.reply(getLang("failed", callbackErr.message));
				}
			});

		} catch (err) {
			log.err("CREATEGROUP COMMAND", err);
			
			let errorMsg = err.error || err.message || JSON.stringify(err);
			return message.reply(getLang("failed", errorMsg));
		}
	}
};

async function findUserByName(api, usersData, threadID, query) {
	try {
		const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
		const threadInfo = await api.getThreadInfo(threadID);
		const ids = threadInfo.participantIDs || [];
		const matches = [];

		for (const uid of ids) {
			try {
				const name = (await usersData.getName(uid)).toLowerCase();
				if (name.includes(cleanQuery)) {
					matches.push({ uid, name: await usersData.getName(uid) });
				}
			} catch {}
		}

		return matches;
	} catch {
		return [];
	}
}