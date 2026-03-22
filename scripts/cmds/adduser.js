const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "adduser",
    version: "1.5",
    author: "Rasin",
    countDown: 5,
    role: 1,
    description: "Add Uꜱer To Your Box Chat Seamlessly",
    category: "box Chat",
    guide: "{pn} [Link Proꜰile | Uid]"
  },

  langs: {
    en: {
      alreadyInGroup: "Already In Group",
      successAdd: "- Successfully Added %1 Member(s) To The Group",
      failedAdd: "- Failed To Add %1 Member(s) To The Group",
      approve: "- Added %1 Member(s) To The Approval List",
      invalidLink: "Please Enter A Valid Facebook Link",
      cannotGetUid: "Cannot Retrieve Uid For This Uꜱer",
      linkNotExist: "This Proꜰile Url Does Not EⱭxist",
      cannotAddUser: "Bot Iꜱ Blocked Or This Uꜱer Blocked Strangers From Adding To Group"
    }
  },

  onStart: async function ({ message, api, event, args, threadsData, getLang }) {
    const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();

    const success = [
      { type: "success", uids: [] },
      { type: "waitApproval", uids: [] }
    ];
    const failed = [];

    function checkErrorAndPush(messageError, item) {
      item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
      const findType = failed.find(error => error.type == messageError);
      if (findType) findType.uids.push(item);
      else failed.push({ type: messageError, uids: [item] });
    }

    const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;
    for (const item of args) {
      let uid;
      let continueLoop = false;

      if (isNaN(item) && regExMatchFB.test(item)) {
        for (let i = 0; i < 10; i++) {
          try { uid = await findUid(item); break; }
          catch (err) {
            if (err.name == "SlowDown" || err.name == "CannotGetData") { await sleep(1000); continue; }
            else if (i == 9 || (err.name != "SlowDown" && err.name != "CannotGetData")) {
              checkErrorAndPush(
                err.name == "InvalidLink" ? getLang('invalidLink') :
                err.name == "CannotGetData" ? getLang('cannotGetUid') :
                err.name == "LinkNotExist" ? getLang('linkNotExist') :
                err.message,
                item
              );
              continueLoop = true; break;
            }
          }
        }
      } else if (!isNaN(item)) uid = item;
      else continue;

      if (continueLoop) continue;

      if (members.some(m => m.userID == uid && m.inGroup)) checkErrorAndPush(getLang("alreadyInGroup"), item);
      else {
        try {
          await api.addUserToGroup(uid, event.threadID);
          if (approvalMode === true && !adminIDs.includes(botID)) success[1].uids.push(uid);
          else success[0].uids.push(uid);
        } catch (err) { checkErrorAndPush(getLang("cannotAddUser"), item); }
      }
    }

    const lengthUserSuccess = success[0].uids.length;
    const lengthUserWaitApproval = success[1].uids.length;
    const lengthUserError = failed.length;

    let msg = "";
    if (lengthUserSuccess) msg += `${getLang("successAdd", lengthUserSuccess)}\n`;
    if (lengthUserWaitApproval) msg += `${getLang("approve", lengthUserWaitApproval)}\n`;
    if (lengthUserError) msg += `${getLang("failedAdd", failed.reduce((a, b) => a + b.uids.length, 0))} ${failed.reduce((a, b) => a += `\n    + ${b.uids.join('\n       ')}: ${b.type}`, "")}`;

    await message.reply(msg);
  }
};
