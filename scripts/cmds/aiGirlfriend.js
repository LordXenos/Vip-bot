const axios = require('axios')

module.exports = {
  config: {
    name: 'aigf',
    version: '3.0.0',
    author: 'Rasin',
    prefix: false,
    countDown: 4,
    usages: 'aigf hi',
    description: 'Chat with your ai girlfriend',
    category: 'ai',
  },

  onStart: async function ({ event, args, message }) {
    try {
      const msg = args.join(" ").trim()
      if (!msg) {
        return message.reply('Ask me anything 👀')
      }

      const url = `https://kryptonite-api-library.onrender.com/api/aigf?message=${encodeURIComponent(msg)}`
      const res = await axios.get(url)

      const reply = res.data?.response
      if (!reply) return message.reply('No reply 🥲')

      message.reply(reply, (err, info) => {
        if (err || !info) return

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        })
      })

    } catch (err) {
      console.error(err)
      message.reply('Error 💔')
    }
  },

  onReply: async function ({ event, message, Reply }) {
    try {
      if (!Reply || Reply.commandName !== this.config.name) return
      if (Reply.author !== event.senderID) return

      const msg = event.body?.trim()
      if (!msg) return

      const url = `https://kryptonite-api-library.onrender.com/api/aigf?message=${encodeURIComponent(msg)}`
      const res = await axios.get(url)

      const reply = res.data?.response
      if (!reply) return

      message.reply(reply, (err, info) => {
        if (err || !info) return

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        })
      })

    } catch (err) {
      console.error(err)
    }
  }
}
