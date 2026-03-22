const axios = require("axios");
module.exports = {
  config: {
    name: "spy",
    aliases: ["whoishe", "whoami"],
    version: "2.0",
    prefix: false,
    role: 0,
    author: "Rasin",
    Description: "Get user information",
    category: "information",
    countDown: 3,
  },
  onStart: async function ({
    event,
    message,
    usersData,
    api,
    args,
  }) {
    const uid1 = event.senderID;
    let uid;

    const findUserByName = async (query) => {
      try {
        const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
        const threadInfo = await api.getThreadInfo(event.threadID);
        const ids = threadInfo.participantIDs || [];
        const matches = [];

        for (const id of ids) {
          try {
            const name = (await usersData.getName(id)).toLowerCase();
            if (name.includes(cleanQuery)) {
              matches.push({ uid: id, name });
            }
          } catch {}
        }

        return matches;
      } catch {
        return [];
      }
    };

    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    }

    else if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      }
      else if (args[0].match(/profile\.php\?id=(\d+)/)) {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        uid = match[1];
      }
      else {
        const query = args.join(" ");
        const matches = await findUserByName(query);

        if (matches.length === 0) {
          return message.reply(`😵 𝐔ꜱer 𝐍ot 𝐅ound ✨\n𝐍o uꜱer ꜰound with name: ${query.replace(/@/g, "")}`);
        }

        if (matches.length > 1) {
          const matchList = matches.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
          return message.reply(`😅 𝐌ultiple 𝐔ꜱerꜱ 𝐅ound ✨\n𝐏leaꜱe be more ꜱpeciꜰic:\n${matchList}`);
        }

        uid = matches[0].uid;
      }
    }
    else {
      uid = uid1;
    }

    const userInfo = await api.getUserInfo(uid);
    const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${uid}`;
    
    let genderText;
    switch (userInfo[uid].gender) {
      case 1:
        genderText = "𝐆irl🙋🏻‍♀️";
        break;
      case 2:
        genderText = "𝐁oy🙋🏻‍♂️";
        break;
      default:
        genderText = "𝐆ay🤷🏻‍♂️";
    }

    const money = (await usersData.get(uid)).money;
    const allUser = await usersData.getAll();
    const rank = allUser.slice().sort((a, b) => b.exp - a.exp).findIndex(user => user.userID === uid) + 1;
    const moneyRank = allUser.slice().sort((a, b) => b.money - a.money).findIndex(user => user.userID === uid) + 1;
    const position = userInfo[uid].type;

    const userInformation = `
╭────[ 𝐔ꜱer 𝐈nꜰo ]
├‣ 𝐍ame: ${userInfo[uid].name}
├‣ 𝐆ender: ${genderText}
├‣ 𝐔id: ${uid}
├‣ 𝐂laꜱꜱ: ${position ? position?.toUpperCase() : "𝐍ormal 𝐔ꜱer🥺"}
├‣ 𝐔ꜱername: ${userInfo[uid].vanity ? userInfo[uid].vanity : "𝐍one"}
├‣ 𝐏roꜰile 𝐔rl: ${userInfo[uid].profileUrl}
├‣ 𝐁irthday: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "𝐏rivate"}
├‣ 𝐍ickname: ${userInfo[uid].alternateName || "𝐍one"}
╰‣ 𝐅riend 𝐖ith 𝐁ot: ${userInfo[uid].isFriend ? "𝐘eꜱ✅" : "𝐍o❎"}
`;

    try {
      const avatarStream = await global.utils.getStreamFromURL(avatarUrl);
      message.reply({
        body: userInformation,
        attachment: avatarStream,
      });
    } catch (error) {
      console.error("Error fetching avatar:", error.message);
      message.reply(userInformation);
    }
  },
};

function formatMoney(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}