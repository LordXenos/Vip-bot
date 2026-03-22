module.exports = {
    config: {
        name: 'bio',
        aliases: ['changebio'],
        author: 'Rasin',
        version: '2.0',
        countDown: 2,
        prefix: true, 
        description: 'Change the bot account bio',
        role: 2,
        usages: '!bio Hello World!',
        category: 'admin'
    },

    onStart: async function ({ api, event, message, args }) {
        const bio = args.join(' ')
        if(!bio) {
            return message.reply('Please provide text!')
        }

        const rasin = await api.changeBio(bio, event.threadID )
        return message.reply('Successfully changed bio')

    }
}