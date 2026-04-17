module.exports = {
    config: {
        name: 'addgcadmin',
        aliases: ['adm', 'addgcadmin'],
        version: '2.0',
        author: 'Rasin',
        prefix: true,
        description: 'Add or remove group admin',
        usages: '!admin <add|remove> <@mention or reply or name>',
        countDown: 5,
        role: 1,
        category: 'group'
    },

    onStart: async function ({ message, event, args, api, usersData }) {
        try {
            if (!event.isGroup) {
                return message.reply('This command can only be used in group chats');
            }

            if (args.length === 0) {
                return message.reply(
                    'Please reply an user message or mention'
                );
            }

            const action = args[0].toLowerCase();

            if (action !== 'add' && action !== 'remove') {
                return message.reply('Invalid action. Use "add" or "remove".');
            }

            let targetID;
            let targetName = 'User';


            if (event.messageReply) {
                targetID = event.messageReply.senderID;
            } 

            else if (Object.keys(event.mentions).length > 0) {
                targetID = Object.keys(event.mentions)[0];
                targetName = event.mentions[targetID] || 'User';
            } 

            else if (args.length > 1) {
                const query = args.slice(1).join(" ").replace(/@/g, "").trim().toLowerCase();
                
                try {
                    const threadInfo = await api.getThreadInfo(event.threadID);
                    const ids = threadInfo.participantIDs || [];
                    const matches = [];

                    for (const uid of ids) {
                        try {
                            const name = (await usersData.getName(uid)).toLowerCase();
                            if (name.includes(query)) {
                                matches.push({ uid, name });
                            }
                        } catch (err) {
                            continue;
                        }
                    }

                    if (matches.length === 0) {
                        return message.reply(`⚠️ User not found: ${args.slice(1).join(" ")}`);
                    }

                    if (matches.length > 1) {
                        const matchList = matches.map((m, i) => `${i + 1}. ${m.name}: ${m.uid}`).join('\n');
                        
                        global.adminCommandMatches = global.adminCommandMatches || {};
                        global.adminCommandMatches[event.senderID] = {
                            matches: matches,
                            action: action,
                            threadID: event.threadID,
                            timestamp: Date.now()
                        };
                        
                        return message.reply(
                            `⚠️ Multiple users found:\n${matchList}\n\n` +
                            `Reply with the number (1-${matches.length}) to ${action} admin for that user.`,
                            (err, info) => {
                                if (!err) {
                                    global.client.handleReply.push({
                                        name: this.config.name,
                                        messageID: info.messageID,
                                        author: event.senderID,
                                        matches: matches,
                                        action: action
                                    });
                                }
                            }
                        );
                    }

                    targetID = matches[0].uid;
                    targetName = matches[0].name;

                } catch (err) {
                    console.error('Error searching for user:', err);
                    return message.reply('❌ Error searching for user. Please try mentioning them or replying to their message.');
                }
            } 
            else {
                return message.reply('Please mention a user, reply to their message, or provide their name.');
            }

            if (targetID === api.getCurrentUserID()) {
                return message.reply('Cannot change admin status for the bot');
            }

            if (targetID === event.senderID) {
                return message.reply('You cannot change your own admin status');
            }

            try {
                const userInfo = await api.getUserInfo(targetID);
                if (userInfo && userInfo[targetID]) {
                    targetName = userInfo[targetID].name || targetName;
                }
            } catch (err) {
                console.log('Could not fetch user name');
            }

            const adminStatus = action === 'add' ? true : false;

            let senderName = 'Unknown';
            try {
                const senderInfo = await api.getUserInfo(event.senderID);
                if (senderInfo && senderInfo[event.senderID]) {
                    senderName = senderInfo[event.senderID].name || 'Unknown';
                }
            } catch (err) {
                console.log('Could not fetch sender name');
            }

            api.changeAdminStatus(event.threadID, [targetID], adminStatus, (err) => {
                if (err) {
                    console.error('Error changing admin status:', err);
                    
                    if (err.error && err.error.includes('not an admin')) {
                        return message.reply('❌ Failed: You are not an admin of this group.');
                    } else if (err.error && err.error.includes('not a group chat')) {
                        return message.reply('❌ Failed: This is not a group chat.');
                    } else {
                        return message.reply('❌ Failed to change admin status. Please try again later.');
                    }
                }

                const successEmoji = adminStatus ? '✅' : '🔴';
                const successAction = adminStatus ? 'promoted to' : 'removed from';
                
                message.reply(
                    `${successEmoji} Admin Status Changed!\n\n` +
                    `User: ${targetName}\n` +
                    `Action: ${successAction.toUpperCase()} ADMIN\n` +
                    `By: ${senderName}`
                );
            });

        } catch (error) {
            console.error('Error in command:', error);
            message.reply('❌ An error occurred while changing admin status.');
        }
    },

    onReply: async function ({ message, event, Reply, args, api, usersData }) {
        try {
            const { author, matches, action } = Reply;

            if (event.senderID !== author) {
                return;
            }


            const choice = parseInt(args[0]);

            if (isNaN(choice) || choice < 1 || choice > matches.length) {
                return message.reply(`Invalid choice. Please reply with a number between 1 and ${matches.length}.`);
            }

            const selectedUser = matches[choice - 1];
            const targetID = selectedUser.uid;
            const targetName = selectedUser.name;

            if (targetID === api.getCurrentUserID()) {
                return message.reply('Cannot change admin status for the bot');
            }

            if (targetID === event.senderID) {
                return message.reply('You cannot change your own admin status');
            }

            const adminStatus = action === 'add' ? true : false;

            let senderName = 'Unknown';
            try {
                const senderInfo = await api.getUserInfo(event.senderID);
                if (senderInfo && senderInfo[event.senderID]) {
                    senderName = senderInfo[event.senderID].name || 'Unknown';
                }
            } catch (err) {
                console.log('Could not fetch sender name');
            }

            api.changeAdminStatus(event.threadID, [targetID], adminStatus, (err) => {
                if (err) {
                    console.error('Error changing admin status:', err);
                    
                    if (err.error && err.error.includes('not an admin')) {
                        return message.reply('❌ Failed: You are not an admin of this group.');
                    } else if (err.error && err.error.includes('not a group chat')) {
                        return message.reply('❌ Failed: This is not a group chat.');
                    } else {
                        return message.reply('❌ Failed to change admin status. Please try again later.');
                    }
                }

                const successEmoji = adminStatus ? '✅' : '🔴';
                const successAction = adminStatus ? 'promoted to' : 'removed from';
                
                message.reply(
                    `${successEmoji} Admin Status Changed!\n\n` +
                    `User: ${targetName}\n` +
                    `Action: ${successAction.toUpperCase()} ADMIN\n` +
                    `By: ${senderName}`
                );
            });

        } catch (error) {
            console.error('Error in onReply:', error);
            message.reply('❌ An error occurred while processing your choice.');
        }
    }
}
