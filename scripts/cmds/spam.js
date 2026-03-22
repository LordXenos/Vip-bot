module.exports = {
	config: {
		name: "spam",
		version: "1.0",
		author: "MILAN",
		countDown: 0,
		role: 2,
		description: "Do spam in a loop of any text",
		category: "goatbot",
		guide:  {
			en: "{pn} <TextToSpam> <Number of times to spam>"
		}
	},  
	onStart: async function ({ api, event, args }) {
const permission = global.GoatBot.config.DEV;
const fuck = args.join(" ");
  if (!permission.includes(event.senderID)) {
   api.sendMessage(fuck, event.threadID, event.messageID) 
    return;
  }

  var message = args[0];
  var length = args[1] || 5;

 if (!message)
return api.sendMessage(`🔰 | Type the text that you want to spam.. `, event.threadID, event.messageID);
	var k = function (k) { api.sendMessage(k, event.threadID)};
for (i = 0; i < `${length}`; i++) 
{ k(`${message}`);} 
 }
};
