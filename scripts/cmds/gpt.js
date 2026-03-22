const axios = require('axios')


const gpt = 'https://kryptonite-api-library.onrender.com/api/gpt4-convo'

module.exports = {
    config: {
        name: 'gpt',
        version: '3.0.0',
        author: 'Rasin',
        description: 'Chat with GPT-4 (Conversational)',
        prefix: false,
        role: 0,
        usages: 'gpt hi',
        category: 'ai',
        countDown: 3
    },
onStart: async function ({ message, event, args }) {
     
    const msg = args.join(" ")
    if (!msg) {
        return message.reply('Ask me anything')
    }

    const a = `${gpt}?prompt=${encodeURIComponent(msg)}&uid=88`
    const d = await axios.get(a)
    const r = d.data.response
    if(!r) {
        return message.reply('No reply !')
    }

      message.reply(r, (err, info) => {
        if (err || !info) return

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        })
      })


},

onReply: async function ({ event, message, Reply }) {
    if(!Reply || Reply.commandName !== this.config.name) return 
    if(Reply.author  !== event.senderID  ) return

    const msg = event.body?.trim()
    if(!msg) return

    const a = `${gpt}?prompt=${encodeURIComponent(msg)}&uid=88`
    const d = await axios.get(a)
    const r = d.data.response

    message.reply(r, (_,info) => {
        if(!info) return

        global.GoatBot.onReply.set(info.messageID,  {
            commandName: this.config.name,
            author: event.senderID
        })
    })


}
}