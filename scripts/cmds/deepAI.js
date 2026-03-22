const axios = require('axios')


const gpt = 'https://rasin-apis.onrender.com/api/rasin/deepai'

module.exports = {
    config: {
        name: 'deepai',
        version: '3.0.0',
        author: 'Rasin',
        description: 'Chat with Deep AI',
        prefix: false,
        role: 0,
        usages: 'deepai hi',
        category: 'ai',
        countDown: 3
    },
onStart: async function ({ message, event, args }) {
     
    const msg = args.join(" ")
    if (!msg) {
        return message.reply('Ask me anything')
    }

    const a = `${gpt}?message=${encodeURIComponent(msg)}}&apikey=rs_646sp6jj-vawq-1w25-rflw-z8`
    const d = await axios.get(a)
    const r = d.data.reply
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

    const a = `${gpt}?message=${encodeURIComponent(msg)}}&apikey=rs_646sp6jj-vawq-1w25-rflw-z8`
    const d = await axios.get(a)
    const r = d.data.reply

    message.reply(r, (_,info) => {
        if(!info) return

        global.GoatBot.onReply.set(info.messageID,  {
            commandName: this.config.name,
            author: event.senderID
        })
    })


}
}