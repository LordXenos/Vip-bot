module.exports = {
  config: {
    name: "roast",
    author: "Rasin",
    countDown: 10,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Absolutely roasted",
    },
    guide: {
      en: "{pn} or reply to someone's message",
    },
  },

  onStart: async function ({ args, api, event }) {
    try {
      let id, name;
      
      if (event.messageReply) {
        id = event.messageReply.senderID;
      } else {
        id = event.senderID;
      }

      const info = await api.getUserInfo(id);
      name = info[id]?.name || "Unknown User";

      const roasts = [
        `${name}, your IQ test came back negative 💀`,
        `${name} is the human version of a participation trophy 🏆`,
        `If ${name}'s brain was dynamite, there wouldn't be enough to blow their nose 🧨`,
        `${name} brings everyone so much joy... when they leave the room 🚪`,
        `${name}'s so dense, light bends around them 🌑`,
        `${name} is proof that evolution can go in reverse 🦍`,
        `I'd agree with ${name}, but then we'd both be wrong 🤷`,
        `${name}'s the reason the gene pool needs a lifeguard 🏊`,
        `${name} has delusions of adequacy`,
        `If ${name} was any slower, they'd be going backwards ⏪`,
        `${name}'s elevator doesn't go to the top floor 🏢`,
        `Somewhere out there is a tree tirelessly producing oxygen for ${name}. They owe it an apology 🌳`,
        `${name}'s the type to study for a COVID test and still fail 🦠`,
        `${name} couldn't pour water out of a boot with instructions on the heel 👢`,
        `${name} is why aliens won't visit us 👽`,
        `${name}'s so fake, even China denied making them 🏭`,
        `${name} has a face made for radio and a voice made for silent films 📻`,
        `${name}'s personality is like a white crayon - useless 🖍️`,
        `${name} is what happens when you order a person from Wish 📦`,
        `${name}'s the type to get locked in a grocery store and starve to death 🛒`,
        `I've seen more life in a retirement home than in ${name}'s DMs 💬`,
        `${name}'s so boring, their own reflection falls asleep 😴`,
        `${name} is the human equivalent of a software update nobody asked for 💾`,
        `If ${name} was a spice, they'd be flour 🍞`,
        `${name}'s the reason shampoo has instructions 🧴`,
        `${name}'s WiFi signal is stronger than their personality 📶`,
        `${name} makes Internet Explorer look fast 🐌`,
        `${name}'s the human equivalent of a 'Skip Ad' button ⏭️`,
        `${name} is why Noah left two of everything... except them 🚢`,
        `${name}'s such a clown, even the circus rejected their application 🎪`,
      ];

      const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

      const msg = await api.sendMessage(
        `👽`,
        event.threadID
      );

      await new Promise(r => setTimeout(r, 2500));

      await api.editMessage(
        `💀 ROASTED 💀\n\n${randomRoast}\n\n😈 Destruction Level: 100%\n\n⚠️ Disclaimer: This is just for fun!`,
        msg.messageID
      );

    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "❌ Error roasting! Even the bot couldn't handle it 😂",
        event.threadID,
        event.messageID
      );
    }
  },
};