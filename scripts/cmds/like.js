const axios = require('axios')
const { getTime } = global.utils

const xhours = 12
const xms = xhours * 60 * 60 * 1000

const auth_thread = "921210833794737"

const x_api = (uid) => `https://rasin-hex-likes.vercel.app/dristybbz/likex?uid=${encodeURIComponent(uid)}`
const y_api = (uid) => `https://noobs-api.top/dipto/ff-like?uid=${encodeURIComponent(uid)}`

const NOTICE =
  `⚠️ 𝐈𝐦𝐩𝐨𝐫𝐭𝐚𝐧𝐭 𝐍𝐨𝐭𝐢𝐜𝐞\n\n` +
  `━━━━━━━━━━━━━━━━━━━\n` +
  `1️⃣ This command is now a paid feature\n` +
  `2️⃣ Free likes are no longer available\n` +
  `3️⃣ Only authorized members can use this command\n\n` +
  `Contact the bot admin to get access 🫡\n\n\nSorry Everyone 🥲`

const getMainAdminID = () => global.GoatBot?.config?.adminBot?.[0]

const processingUsers = new Set()

async function getLimitDoc(usersData) {
  const adminID = getMainAdminID()
  if (!adminID) return {}
  const doc = await usersData.get(adminID)
  return doc?.likeLimit || {}
}

async function setLimitDoc(usersData, payload) {
  const adminID = getMainAdminID()
  if (!adminID) return
  await usersData.set(adminID, { likeLimit: payload })
}

module.exports = {
  config: {
    name: 'like',
    author: 'Rasin',
    cooldown: 2,
    role: 0,
    prefix: false,
    description: 'Send Free Fire likes',
    category: 'free fire',
    usage: [
      'like <uid>           - Send likes',
      'like limit <num>     - Set limit (admin)',
      'like limit reset     - Reset limit (admin)',
      'like limit status    - Check limit status',
    ].join('\n')
  },

  onStart: async function ({ args, message, event, usersData }) {
    const subCmd = args[0]?.toLowerCase()
    const threadID = String(event.threadID)

    const isAdmin = () => {
      const adminList = global.GoatBot?.config?.adminBot || []
      return adminList.includes(event.senderID)
    }

    const isAuthorized = () => isAdmin() || threadID === auth_thread

    if (subCmd === 'limit') {
      const limitArg = args[1]?.toLowerCase()

      if (!limitArg || limitArg === 'status') {
        const limitDoc = await getLimitDoc(usersData)

        if (!limitDoc.active) {
          return message.reply(
            `𝐋𝐢𝐦𝐢𝐭 𝐒𝐭𝐚𝐭𝐮𝐬\n\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `❍ Special day is currently: 𝐎𝐅𝐅\n` +
            `❍ Likes are restricted to authorized users only.\n`
          )
        }

        const used = limitDoc.used ?? 0
        const max  = limitDoc.max  ?? 0
        const left = Math.max(0, max - used)

        return message.reply(
          `Like Limit Active\n\n` +
          `❍ 𝐋𝐢𝐦𝐢𝐭: ${max} users\n` +
          `❍ 𝐔𝐬𝐞𝐝: ${used}/${max}\n` +
          `❍ 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠: ${left} slot(s)\n` +
          `❍ 𝐒𝐞𝐭 𝐛𝐲: ${limitDoc.setBy || 'Admin'}\n` +
          `❍ 𝐃𝐚𝐭𝐞: ${limitDoc.date || 'Unknown'}\n`
        )
      }

      if (limitArg === 'reset') {
        if (!isAdmin()) {
          return message.reply(
            `⛔ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝\n\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `❍ Only bot admins can reset the limit.\n`
          )
        }

        const prevDoc = await getLimitDoc(usersData)
        if (!prevDoc.active) {
          return message.reply(
            `⚠️ 𝐍𝐨 𝐀𝐜𝐭𝐢𝐯𝐞 𝐋𝐢𝐦𝐢𝐭\n\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `❍ There is no special day currently active.\n`
          )
        }

        await setLimitDoc(usersData, { active: false })

        return message.reply(
          `✅ 𝐋𝐢𝐦𝐢𝐭 𝐑𝐞𝐬𝐞𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `❍ Special day has ended.\n` +
          `❍ Unauthorized users can no longer get free likes.\n`
        )
      }

      if (!/^\d+$/.test(limitArg)) {
        return message.reply(
          `❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐀𝐫𝐠𝐮𝐦𝐞𝐧𝐭\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `𝐔𝐬𝐚𝐠𝐞:\n` +
          `• like limit <number>\n` +
          `• like limit reset\n` +
          `• like limit status\n`
        )
      }

      if (!isAdmin()) {
        return message.reply(
          `⛔ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `❍ Only bot admins can set the limit.\n`
        )
      }

      const newMax = parseInt(limitArg)
      if (newMax < 1) return message.reply(`❌ Limit must be at least 1.`)

      const senderData = await usersData.get(event.senderID)
      const setByName  = senderData?.name || 'Admin'
      const time       = getTime("DD/MM/YYYY HH:mm:ss")
      const prevDoc    = await getLimitDoc(usersData)
      const usedSoFar  = prevDoc.active ? (prevDoc.used ?? 0) : 0

      await setLimitDoc(usersData, {
        active : true,
        max    : newMax,
        used   : usedSoFar,
        setBy  : setByName,
        date   : time,
        usedIDs: prevDoc.active ? (prevDoc.usedIDs || []) : []
      })

      return message.reply(
        `Like Limit Activated\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `❍ 𝐋𝐢𝐦𝐢𝐭: ${newMax} users\n` +
        `❍ 𝐔𝐬𝐞𝐝: ${usedSoFar}/${newMax}\n` +
        `❍ Everyone can now get free likes until slots run out!\n`
      )
    }

    if (subCmd === 'ban') {
      if (!isAdmin()) {
        return message.reply(
          `⛔ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `❍ Only bot admins can use this command.\n`
        )
      }

      let uid, reason

      if (event.type === 'message_reply') {
        uid    = event.messageReply.senderID
        reason = args.slice(1).join(' ').trim()
      } else if (Object.keys(event.mentions || {}).length > 0) {
        uid    = Object.keys(event.mentions)[0]
        reason = args.slice(1).join(' ').replace(event.mentions[uid], '').trim()
      } else if (args[1] && /^\d+$/.test(args[1])) {
        uid    = args[1]
        reason = args.slice(2).join(' ').trim()
      } else {
        return message.reply(
          `❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐒𝐲𝐧𝐭𝐚𝐱\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `𝐔𝐬𝐚𝐠𝐞:\n` +
          `• like ban @tag [reason]\n` +
          `• like ban (reply to msg) [reason]\n`
        )
      }

      if (!uid)                     return message.reply(`❌ Could not determine user.`)
      if (!reason || reason === '') reason = 'Banned from using like command'
      reason = reason.replace(/\s+/g, ' ')

      const userData   = await usersData.get(uid)
      const name       = userData.name || 'Unknown'
      const likeBanned = userData.likeBanned || {}

      if (likeBanned.status) {
        return message.reply(
          `⚠️ 𝐔𝐬𝐞𝐫 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐁𝐚𝐧𝐧𝐞𝐝\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `֎ 𝐍𝐚𝐦𝐞: ${name}\n` +
          `❍ 𝐑𝐞𝐚𝐬𝐨𝐧: ${likeBanned.reason}\n` +
          `❍ 𝐃𝐚𝐭𝐞: ${likeBanned.date}\n`
        )
      }

      const time = getTime("DD/MM/YYYY HH:mm:ss")
      await usersData.set(uid, { likeBanned: { status: true, reason, date: time } })

      return message.reply(
        `✅ 𝐔𝐬𝐞𝐫 𝐁𝐚𝐧𝐧𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `֎ 𝐍𝐚𝐦𝐞: ${name}\n` +
        `❍ 𝐑𝐞𝐚𝐬𝐨𝐧: ${reason}\n` +
        `❍ 𝐃𝐚𝐭𝐞: ${time}\n`
      )
    }

    if (subCmd === 'unban') {
      if (!isAdmin()) {
        return message.reply(
          `⛔ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `❍ Only bot admins can use this command.\n`
        )
      }

      let uid

      if (event.type === 'message_reply') {
        uid = event.messageReply.senderID
      } else if (Object.keys(event.mentions || {}).length > 0) {
        uid = Object.keys(event.mentions)[0]
      } else if (args[1] && /^\d+$/.test(args[1])) {
        uid = args[1]
      } else {
        return message.reply(
          `❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐒𝐲𝐧𝐭𝐚𝐱\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `𝐔𝐬𝐚𝐠𝐞:\n` +
          `• like unban @tag\n` +
          `• like unban (reply to msg)\n`
        )
      }

      const userData   = await usersData.get(uid)
      const name       = userData.name || 'Unknown'
      const likeBanned = userData.likeBanned || {}

      if (!likeBanned.status) {
        return message.reply(
          `⚠️ 𝐔𝐬𝐞𝐫 𝐈𝐬 𝐍𝐨𝐭 𝐁𝐚𝐧𝐧𝐞𝐝\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `֎ 𝐍𝐚𝐦𝐞: ${name}\n`
        )
      }

      await usersData.set(uid, { likeBanned: {} })

      return message.reply(
        `✅ 𝐔𝐬𝐞𝐫 𝐔𝐧𝐛𝐚𝐧𝐧𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `֎ 𝐍𝐚𝐦𝐞: ${name}\n` +
        `❍ This user can now use the like command again.\n`
      )
    }

    if (subCmd === 'banlist') {
      if (!isAdmin()) {
        return message.reply(
          `⛔ 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `❍ Only bot admins can use this command.\n`
        )
      }

      const allUsers    = await usersData.getAll()
      const bannedUsers = allUsers.filter(u => u.likeBanned && u.likeBanned.status === true)

      if (bannedUsers.length === 0) {
        return message.reply(
          `📋 𝗟𝗶𝗸𝗲 𝗕𝗮𝗻 𝗟𝗶𝘀𝘁\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `❍ No banned users found.\n`
        )
      }

      const msg = bannedUsers.map((user, index) =>
        `${index + 1}. ${user.name || 'Unknown'}\n` +
        `   ├ 𝐑𝐞𝐚𝐬𝐨𝐧: ${user.likeBanned.reason || 'No reason'}\n` +
        `   └ 𝐃𝐚𝐭𝐞: ${user.likeBanned.date || 'Unknown'}`
      ).join('\n\n')

      return message.reply(
        `📋 𝗟𝗶𝗸𝗲 𝗕𝗮𝗻 𝗟𝗶𝘀𝘁\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `𝐓𝐨𝐭𝐚𝐥: ${bannedUsers.length} user(s)\n\n` +
        `${msg}`
      )
    }

    try {
      const limitDoc   = await getLimitDoc(usersData)
      const specialDay = !!(limitDoc.active)

      if (!isAuthorized() && !specialDay) {
        return message.reply(NOTICE)
      }

      if (args.length < 1) {
        return message.reply(`❓ 𝐏ʟᴇᴀꜱᴇ 𝐏ʀᴏᴠɪᴅᴇ 𝐀 𝐔ɪᴅ`)
      }

      const ffUID = args[0]
      if (!/^\d+$/.test(ffUID)) {
        return message.reply(`❌ Invalid UID! Numbers only.`)
      }

      const senderData = await usersData.get(event.senderID)
      const likeBanned = senderData.likeBanned || {}

      if (likeBanned.status) {
        return message.reply(
          `🚫 𝐘𝐨𝐮 𝐀𝐫𝐞 𝐁𝐚𝐧𝐧𝐞𝐝\n\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `❍ 𝐑𝐞𝐚𝐬𝐨𝐧: ${likeBanned.reason}\n` +
          `❍ 𝐁𝐚𝐧𝐧𝐞𝐝 𝐎𝐧: ${likeBanned.date}\n`
        )
      }

      if (!isAdmin() && specialDay) {
        const used    = limitDoc.used    ?? 0
        const max     = limitDoc.max     ?? 0
        const usedIDs = limitDoc.usedIDs || []

        if (usedIDs.includes(event.senderID)) {
          return message.reply(
            `You already used your free slot today.\n`
          )
        }

        if (used >= max) {
          return message.reply(
            `All ${max} free slots have been used up\n\n` +
            `Contact admin for paid access 🫡\n`
          )
        }

        if (processingUsers.has(event.senderID)) {
          return message.reply(
            `𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭\n\n` +
            `Your previous request is still processing.\n`
          )
        }

        processingUsers.add(event.senderID)

        const freshDoc      = await getLimitDoc(usersData)
        const freshUsedIDs  = freshDoc.usedIDs || []
        const freshUsed     = freshDoc.used    ?? 0
        const freshMax      = freshDoc.max     ?? 0

        if (freshUsedIDs.includes(event.senderID)) {
          processingUsers.delete(event.senderID)
          return message.reply(
            `You already used your free slot today`
          )
        }

        if (freshUsed >= freshMax) {
          processingUsers.delete(event.senderID)
          return message.reply(
            `All ${freshMax} free slots have been used up\n\n` +
            `Contact admin for paid access 🫡\n`
          )
        }

        await setLimitDoc(usersData, {
          ...freshDoc,
          used   : freshUsed + 1,
          usedIDs: [...freshUsedIDs, event.senderID]
        })
      }

      const likeUsage = senderData.likeUsage || {}
      const lastUsed  = likeUsage.lastUsed   || 0
      const now       = Date.now()
      const elapsed   = now - lastUsed

      if (!isAdmin() && !specialDay && elapsed < xms) {
        const remaining = xms - elapsed
        const hours   = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

        return message.reply(
          `❍ 𝐘𝐨𝐮 𝐜𝐚𝐧 𝐨𝐧𝐥𝐲 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐨𝐧𝐜𝐞 𝐞𝐯𝐞𝐫𝐲 ${xhours} 𝐡𝐨𝐮𝐫𝐬.\n` +
          `❍ 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧: ${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬\n`
        )
      }

      const waiting = await message.reply(`𝐏ʀᴏᴄᴇꜱꜱɪɴɢ 𝐘ᴏᴜʀ 𝐑ᴇϙᴜᴇꜱᴛ`)

      let xData = null, xOk = false, xErr = null
      try {
        const xRes = await axios.get(x_api(ffUID), { timeout: 30000 })
        xData = xRes.data
        xOk   = !!(xData && xData.status)
        if (!xOk) xErr = xData?.error || 'API 1 Failed'
      } catch (e) {
        xErr = e.response?.data?.error || 'API 1 Failed'
      }

      let yData = null, yOk = false, yErr = null
      try {
        const yRes = await axios.get(y_api(ffUID), { timeout: 30000 })
        yData = yRes.data
        yOk   = !!(yData && yData.Status === 'Success')
        if (!yOk) yErr = yData?.error || 'API 2 Failed'
      } catch (e) {
        yErr = e.response?.data?.error || 'API 2 Failed'
      }

      message.unsend(waiting.messageID)
      processingUsers.delete(event.senderID)

      if (!xOk && !yOk) {
        return message.reply(
          `𝐅𝐚𝐢𝐥𝐞𝐝 𝐓𝐨 𝐒𝐞𝐧𝐝 𝐋𝐢𝐤𝐞𝐬\n\n` +
          `❍ ${xErr}\n`
        )
      }

      if (!isAdmin()) {
        await usersData.set(event.senderID, {
          likeUsage: { lastUsed: Date.now() }
        })
      }

      const nickname    = (xOk ? xData.Nickname : null) || (yOk ? yData.PlayerNickname : null) || 'Unknown'
      const xAdded      = xOk ? (xData.likes_added      ?? 0) : 0
      const yAdded      = yOk ? (yData.LikesGiven        ?? 0) : 0
      const totalAdded  = xAdded + yAdded
      const beforeLikes = xOk ? (xData.likes_before     ?? 0) : (yData?.LikesBeforeProcess ?? 0)
      const afterLikes  = yOk ? (yData.LikesAfterProcess ?? 0) : (xData?.likes_after       ?? 0)

      const finalDoc = await getLimitDoc(usersData)
      const usedNow  = finalDoc.used ?? 0
      const maxNow   = finalDoc.max  ?? 0
      const usageTag = specialDay && !isAdmin()
        ? `\n𝐔𝐬𝐚𝐠𝐞𝐬 ‹ ${usedNow}/${maxNow} ›\n`
        : ''

      return message.reply(
        `✅ 𝐋𝐢𝐤𝐞𝐬 𝐒𝐞𝐧𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲\n\n` +
        `֎ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞: ${nickname}\n` +
        `֎ 𝐔𝐈𝐃: ${ffUID}\n\n` +
        `❍ 𝐁𝐞𝐟𝐨𝐫𝐞 𝐋𝐢𝐤𝐞𝐬: ${beforeLikes}\n` +
        `❍ 𝐀𝐟𝐭𝐞𝐫 𝐋𝐢𝐤𝐞𝐬: ${afterLikes}\n` +
        `❍ 𝐓𝐨𝐭𝐚𝐥 𝐀𝐝𝐝𝐞𝐝: ${totalAdded}\n\n` +
        `${usageTag}`
      )

    } catch (err) {
      processingUsers.delete(event.senderID)
      const apiError = err.response?.data?.error
      return message.reply(`⚠️ ${apiError || err.message}\n`)
    }
  }
}
