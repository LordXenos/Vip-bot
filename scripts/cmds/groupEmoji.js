module.exports = {
    config: {
        name: 'groupemoji',
        aliases: ['changeemoji', 'cngemoji'],
        version: '2.0',
        author: 'Rasin',
        description: 'Change the group emoji',
        usages: '!setemoji ☕',
        category: 'box',
        role: 0,
        countDown: 3,
    },

 onStart: async function ({ api, event, message, args })   {
 const emoji = args.join(' ')
 if(!emoji) {
    message.reply('You have not entered emoji 🧸')
    } else { 
        api.changeThreadEmoji(emoji, event.threadID)
         message.reply(`Successfully changed group emoji\nNew Emoji: ${emoji}`) 
}


 }
}
