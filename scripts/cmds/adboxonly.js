module.exports = {
  config: {
    name: "onlyadminbox",
    aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
    version: "1.3",
    author: "Rasin",
    countDown: 2,
    prefix: false,
    role: 1,
    description: "Turn On/Oꜰꜰ Only Admin Oꜰ Group Can Uꜱe Bot",
    category: "box Chat",
    guide: "{pn} [On | Off]: Turn On/Oꜰꜰ The Mode Only Admin Oꜰ Group Can Uꜱe Bot\n{pn} Noti [On | Off]: Turn On/Oꜰꜰ Notification When Uꜱer Iꜱ Not Admin Oꜰ Group"
  },

  langs: {
    en: {
      turnedOn: "Successfully Turned On Only Admin Mode",
      turnedOff: "Successfully Turned Oꜰꜰ Only Admin Mode",
      turnedOnNoti: "Successfully Turned On Notification For Non-Admin Uꜱers",
      turnedOffNoti: "Successfully Turned Oꜰꜰ Notification For Non-Admin Uꜱers",
      syntaxError: "❌ Syntax Error! Uꜱe {pn} On Or {pn} Off Only"
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    let isSetNoti = false;
    let value;
    let keySetData = "data.onlyAdminBox";
    let indexGetVal = 0;

    if (args[0]?.toLowerCase() === "noti") {
      isSetNoti = true;
      indexGetVal = 1;
      keySetData = "data.hideNotiMessageOnlyAdminBox";
    }

    if (args[indexGetVal]?.toLowerCase() === "on") value = true;
    else if (args[indexGetVal]?.toLowerCase() === "off") value = false;
    else return message.reply(getLang("syntaxError"));

    await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

    if (isSetNoti)
      return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
    else
      return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
  }
};
