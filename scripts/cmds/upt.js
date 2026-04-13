const os = require("os")
const { bold } = require("fontstyles")
const fs = require("fs-extra");


module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", 'upt'],
    version: "1.4",
    author: "Rasin",
    role: 0,
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function({ message, usersData, threadsData }) {
    const uptime = process.uptime()
    const formattedUptime = formatMilliseconds(uptime * 1000)

    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2)

    const systemInfo = {
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      cpu: `${os.cpus()[0].model}(${os.cpus().length} cores)`,
      loadAvg: os.loadavg().map(l => l.toFixed(2)).join(" | "),
      botUptime: formattedUptime,
      systemUptime: formatUptime(os.uptime()),
      processMemory: prettyBytes(process.memoryUsage().rss),
      totalMemory: prettyBytes(totalMemory),
      usedMemory: prettyBytes(usedMemory),
      memoryUsagePercent
    }

    const users = await usersData.getAll()
    const groups = await threadsData.getAll()

    const response =
`🎀 ⋆˚✿°────୨ᰔ୧────°✿˚ ✨

🕊️🥀  𝐁𝐨𝐭 𝐒𝐭𝐚𝐭𝐮𝐬  🤍✨

ᥫ᭡ 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞 : ${systemInfo.botUptime} ⏳
ᥫ᭡ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐔𝐩𝐭𝐢𝐦𝐞 : ${systemInfo.systemUptime} 🕰️
ᥫ᭡ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬 𝐌𝐞𝐦𝐨𝐫𝐲 : ${systemInfo.processMemory} 💫
ᥫ᭡ 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐨𝐫𝐲 : ${systemInfo.totalMemory} 🧠
ᥫ᭡ 𝐔𝐬𝐞𝐝 𝐌𝐞𝐦𝐨𝐫𝐲 : ${systemInfo.usedMemory} ( ${systemInfo.memoryUsagePercent}% 𝐔𝐬𝐞𝐝 )

ᰔ 𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬 : ${users.length} 🧸
ᰔ 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬 : ${groups.length} 🌸

🎀˚✿ 𝐁𝐨𝐭 Owner :
୨ᰔ୧ ❤️‍🩹SIYAM 🌸🦋 ୨ᰔ୧

🎀✨ ˚✿°───୨ᰔ୧───°✿˚ 🫶🏻`

    message.reply({ body: response, attachment: fs.createReadStream(__dirname + '/rasin/cutiee0.jpg')})
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secondsRemaining = Math.floor(seconds % 60)
  return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`
}

function formatMilliseconds(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`
}

function prettyBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}
