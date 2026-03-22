const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "adminonly",
    aliases: ["adonly", "onlyad", "onlyadmin"],
    version: "1.5",
    author: "Rasin",
    countDown: 5,
    role: 2,
    description: "Turn On/Oꜰꜰ Only Admin Can Uꜱe Bot",
    category: "owner",
    guide: "   {pn} [On | Off]: Turn On/Oꜰꜰ Only Admin Can Uꜱe Bot\n   {pn} Noti [On | Off]: Turn On/Oꜰꜰ The Notiꜰication When Uꜱer Iꜱ Not Admin"
  },

  langs: {
    en: {
      turnedOn: "Turned On The Mode Only Admin Can Uꜱe Bot",
      turnedOff: "Turned Oꜰꜰ The Mode Only Admin Can Uꜱe Bot",
      turnedOnNoti: "Turned On The Notiꜰication When Uꜱer Iꜱ Not Admin",
      turnedOffNoti: "Turned Oꜰꜰ The Notiꜰication When Uꜱer Iꜱ Not Admin"
    }
  },

  onStart: function ({ args, message, getLang }) {
    let isSetNoti = false;
    let value;
    let indexGetVal = 0;

    if (args[0].toLowerCase() == "noti") {
      isSetNoti = true;
      indexGetVal = 1;
    }

    if (args[indexGetVal].toLowerCase() == "on") value = true;
    else if (args[indexGetVal].toLowerCase() == "off") value = false;
    else return message.SyntaxError();

    if (isSetNoti) {
      config.hideNotiMessage.adminOnly = !value;
      message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
    } else {
      config.adminOnly.enable = value;
      message.reply(getLang(value ? "turnedOn" : "turnedOff"));
    }

    fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
  }
};
