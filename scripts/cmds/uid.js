const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
    config: {
        name: "uid",
        version: "2.0",
        prefix: false,
        author: "NTKhang",
        countDown: 5,
        role: 0,
        description: {
            en: "View facebook user id of user"
        },
        category: "info",
        guide: {
            en: "   {pn}: use to view your facebook user id"
                + "\n   {pn} <name>: view facebook user id by name"
                + "\n   {pn} <profile link>: view facebook user id of profile link"
                + "\n   Reply to someone's message with the command to view their facebook user id"
        }
    },

    langs: {
        en: {
            syntaxError: "Please enter the name of the person you want to view uid or leave it blank to view your own uid",
            notFound: "User not found",
            multiple: "Multiple users found"
        }
    },

    onStart: async function ({api, message, event, args, getLang, usersData }) {
        const findUserByName = async (query) => {
            try {
                const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
                const threadInfo = await api.getThreadInfo(event.threadID);
                const ids = threadInfo.participantIDs || [];
                const matches = [];

                for (const uid of ids) {
                    try {
                        const name = (await usersData.getName(uid)).toLowerCase();
                        if (name.includes(cleanQuery)) {
                            matches.push({ uid, name });
                        }
                    } catch {}
                }

                return matches;
            } catch {
                return [];
            }
        };

        if (event.messageReply)
            return api.shareContact(event.messageReply.senderID, event.messageReply.senderID, event.threadID);
        
        if (!args[0])
            return api.shareContact(event.senderID, event.senderID, event.threadID);
        

        if (args[0].match(regExCheckURL)) {
            let msg = '';
            for (const link of args) {
                try {
                    const uid = await findUid(link);
                    msg += `${link} => ${uid}\n`;
                }
                catch (e) {
                    msg += `${link} (ERROR) => ${e.message}\n`;
                }
            }
            message.reply(msg);
            return;
        }

        const query = args.join(" ");
        const matches = await findUserByName(query);

        if (matches.length === 0) {
            return message.reply(`${getLang("notFound")}: ${query.replace(/@/g, "")}`);
        }

        if (matches.length > 1) {
            const matchList = matches.map(m => `${m.name}: ${m.uid}`).join('\n');
            return message.reply(`${getLang("multiple")}:\n${matchList}`);
        }

        const targetUID = matches[0].uid;
        return api.shareContact(targetUID, targetUID, event.threadID);
    }
};