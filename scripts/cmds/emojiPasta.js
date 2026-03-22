const axios = require('axios')

module.exports = {
    config: {
        name: 'emojipasta',
        aliases: ['epasta'],
        version: '2.0',
        prefix: false,
        author: 'Rasin',
        description: 'Turn your text into a funny mess of emojis!',
        countDown: 3,
        role: 0,
        category: 'fun',
        usages: ['emojipasta Hello I am Rasin']

    },

    onStart: async function ({ event , args, message })
    {
        try {

            const msg = args.join(" ")
            if(!msg) {
                return message.reply('Please provide sentence')
            }

            const api = `https://api.popcat.xyz/v2/emojipasta?text=${encodeURIComponent(msg)}`
            const arshi = await axios.get(api)
            const dristy = arshi.data.message.text

            return message.reply(dristy)

        } catch (error) {
            console.error('Error:', error)
            return message.reply('An error')
        }
    }
}