const axios = require('axios');
const fs = require('fs-extra');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "wallet"],
    version: "1.1",
    author: "Rasin",
    prefix: false,
    countDown: 5,
    role: 0,
    description: "Check balance with wallet card design",
    category: "economy",
    guide: {
      en: "{pn} balance | Check your balance with card\n"
        + "{pn} balance @user | Check others balance\n"
        + "{pn} balance <name> | Search user by name and check balance\n"
        + "{pn} balance <uid> | Check balance by user ID\n"
        + "{pn} balance [reply] | Check replied user's balance\n"
    }
  },

  langs: {
    en: {
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      error: "❌ Error generating wallet card. Please try again.",
      cardMessage: "👀 %1 Your Balance ✨\n\n🧸💵 %2"
    }
  },

  onStart: async function ({ message, event, args, usersData, api, getLang }) {
    const { senderID, messageReply, mentions } = event;

    try {
      let targetID = senderID;

      if (messageReply?.senderID && !args[0]) {
        targetID = messageReply.senderID;
      } 
      else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      }
      else if (args[0] && /^\d+$/.test(args[0])) {
        targetID = args[0];
      }
      else if (args[0]) {
        const query = args.join(" ");
        const matches = await findUserByName(api, usersData, event.threadID, query);

        if (matches.length === 0) {
          return message.reply(getLang("notFound", query.replace(/@/g, "")));
        }

        if (matches.length > 1) {
          const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
          return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
        }

        targetID = matches[0].uid;
      }

      const userData = await usersData.get(targetID);
      const userName = await usersData.getName(targetID);
      const userMoney = userData.money || 0;

      const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${targetID}`;

      const formatMoney = (amount) => {
        if (isNaN(amount)) return "$0";
        amount = Number(amount);
        const scales = [
          { value: 1e15, suffix: 'Q' },
          { value: 1e12, suffix: 'T' },
          { value: 1e9, suffix: 'B' },
          { value: 1e6, suffix: 'M' },
          { value: 1e3, suffix: 'k' }
        ];
        const scale = scales.find(s => amount >= s.value);
        if (scale) {
          const scaledValue = amount / scale.value;
          return `$${scaledValue.toFixed(1)}${scale.suffix}`;
        }
        return `$${amount.toLocaleString()}`;
      };

      const canvas = createCanvas(800, 450);
      const ctx = canvas.getContext('2d');

      const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
      bgGradient.addColorStop(0, '#0f0c29');
      bgGradient.addColorStop(0.5, '#302b63');
      bgGradient.addColorStop(1, '#24243e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 800, 450);

      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(600 + i * 20, 50 + i * 30, 80, 80);
      }
      
      ctx.strokeStyle = '#ff0080';
      ctx.lineWidth = 1;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 60, 0);
        ctx.lineTo(i * 60 + 150, 450);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const roundRect = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      roundRect(40, 40, 720, 370, 25);
      ctx.fill();
      ctx.stroke();

      const accentGradient = ctx.createLinearGradient(40, 40, 760, 40);
      accentGradient.addColorStop(0, '#00d4ff');
      accentGradient.addColorStop(0.5, '#ff0080');
      accentGradient.addColorStop(1, '#00ffaa');
      ctx.fillStyle = accentGradient;
      roundRect(40, 40, 720, 8, 25);
      ctx.fill();

      try {
        const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
        const avatar = await loadImage(Buffer.from(avatarResponse.data));
        
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(140, 160, 85, 0, Math.PI * 2);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(140, 160, 75, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff0080';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(140, 160, 68, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 72, 92, 136, 136);
        ctx.restore();
      } catch (err) {
        ctx.beginPath();
        ctx.arc(140, 160, 68, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00d4ff';
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(userName.toUpperCase(), 140, 270);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, 80);
      ctx.lineTo(300, 350);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#999999';
      ctx.fillText('💰 YOUR BALANCE', 340, 100);

      const balanceGradient = ctx.createLinearGradient(340, 110, 700, 180);
      balanceGradient.addColorStop(0, '#00d4ff');
      balanceGradient.addColorStop(0.5, '#ff0080');
      balanceGradient.addColorStop(1, '#00ffaa');
      ctx.fillStyle = balanceGradient;
      ctx.font = 'bold 80px Arial';
      ctx.fillText(formatMoney(userMoney), 340, 180);

      ctx.strokeStyle = accentGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(340, 200);
      ctx.lineTo(720, 200);
      ctx.stroke();

      const infoCards = [
        { icon: '⚡', text: 'Fast Transactions', x: 340, y: 240 },
        { icon: '🔒', text: 'Secure Wallet', x: 540, y: 240 }
      ];

      infoCards.forEach(card => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        roundRect(card.x, card.y, 160, 50, 10);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 1;
        roundRect(card.x, card.y, 160, 50, 10);
        ctx.stroke();
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#00d4ff';
        ctx.fillText(card.icon, card.x + 15, card.y + 35);
        
        ctx.font = '13px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(card.text, card.x + 50, card.y + 32);
      });

      ctx.textAlign = 'right';
      ctx.font = 'bold 18px Arial';
      const brandGradient = ctx.createLinearGradient(600, 340, 720, 340);
      brandGradient.addColorStop(0, '#00d4ff');
      brandGradient.addColorStop(1, '#ff0080');
      ctx.fillStyle = brandGradient;
      ctx.fillText('DIGITAL WALLET', 720, 345);

      const circles = [
        { x: 680, y: 90, r: 30, color: 'rgba(0, 212, 255, 0.1)' },
        { x: 730, y: 140, r: 20, color: 'rgba(255, 0, 128, 0.1)' },
        { x: 710, y: 180, r: 15, color: 'rgba(0, 255, 170, 0.1)' }
      ];

      circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();
      });

      const imagePath = path.join(__dirname, 'cache', `balance_${targetID}.png`);
      await fs.ensureDir(path.join(__dirname, 'cache'));
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(imagePath, buffer);

      message.reply({
        body: getLang("cardMessage", userName, formatMoney(userMoney)),
        attachment: fs.createReadStream(imagePath)
      }, () => fs.unlinkSync(imagePath));

    } catch (error) {
      console.error(error);
      message.reply(getLang("error"));
    }
  }
};

async function findUserByName(api, usersData, threadID, query) {
  try {
    const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
    const threadInfo = await api.getThreadInfo(threadID);
    const ids = threadInfo.participantIDs || [];
    const matches = [];

    for (const uid of ids) {
      try {
        const name = (await usersData.getName(uid)).toLowerCase();
        if (name.includes(cleanQuery)) {
          matches.push({ uid, name: await usersData.getName(uid) });
        }
      } catch {}
    }

    return matches;
  } catch {
    return [];
  }
}