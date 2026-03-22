const axios = require('axios')
const { getStreamFromURL } = global.utils;
const fs = require("fs-extra");

module.exports = {
    config: {
        name: 'owner',
        version: 'v2',
        author: 'Rasin',
        role: 0,
        countDown: 3,
        prefix: false,
        category: 'owner',
        description: 'Show owner information'
    },
onStart: async function ({ api, message, args, event }) {

    const info = `🎀 𝐎ᴡɴᴇʀ 𝐈ɴꜰᴏ ✨
❍ ɴᴀᴍᴇ : ᴛᴀꜱʙɪᴜʟ ɪꜱʟᴀᴍ ʀᴀꜱɪɴ 🥹💗
❍ ᴀɢᴇ : ᴘʀɪᴠᴀᴛᴇ 
❍ ꜰʀᴏᴍ : ʙᴀɴɢʟᴀᴅᴇꜱʜ  🇧🇩
❍ ᴄɪᴛʏ: ᴅʜᴀᴋᴀ 
❍ ᴀᴅᴅʀᴇꜱꜱ: ꜱᴀᴠᴀʀ, ᴅʜᴀᴋᴀ
❍ ᴡᴏʀᴋ : ꜱᴛᴜᴅᴇɴᴛ
❍ ᴄʟᴀꜱꜱ : ᴘʀɪᴠᴀᴛᴇ
❍ ʀᴇʟᴀᴛɪᴏɴꜱʜɪᴘ : ꜱɪɴɢʟᴇ
❍ ʀᴇʟɪɢɪᴏɴ : ɪꜱʟᴀᴍ
❍ ᴋᴀʟᴇᴍᴀ: لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ
❍ ʀᴏʟᴇ: ʙᴀᴄᴋ-ᴇɴᴅ ᴡᴇʙ ᴅᴇᴠᴇʟᴏᴘᴇʀ

🎯 ᴅʀᴇᴀᴍ : ʙᴇ ᴀ ʙᴀᴄᴋ-ᴇɴᴅ ᴡᴇʙ ᴅᴇᴠᴇʟᴏᴘᴇʀ 
😺 ғᴀᴠ ᴘᴇʀꜱᴏɴ : ᴍʏ ᴍᴏᴛʜᴇʀ 🫶🏻
🥹 ᴄʀᴜꜱʜ : ɴᴇᴇᴅ 🙃
🚫 ᴇx : 0 — ʙᴇᴄᴀᴜꜱᴇ ɴᴏ ᴏɴᴇ ᴅᴀʀᴇᴅ
😺 ᴛɪᴍᴇ ᴘᴀꜱꜱ : Dᴇᴠʟᴏᴘᴇʀ, NᴏᴅᴇJꜱ Dᴇᴠʟᴏᴘᴇʀ, Mᴀᴋɪɴɢ, Dᴇᴠʟᴏᴘɪɴɢ`


await message.reply({
    body: info,
    attachment: fs.createReadStream(
        __dirname + '/rasin/owner.jpg'
    )
})
}
}
