const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair3",
    author: 'Rasin',
    prefix: false,
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get to know your partner",
    },
    longDescription: {
      en: "Know your destiny and know who you will complete your life with",
    },
    category: "love",
    guide: {
      en: "{pn}"
    }
  },
  
  onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
    const { loadImage, createCanvas } = require("canvas");
    let pathImg = __dirname + "/assets/pair_result.png";
    let pathAvt1 = __dirname + "/assets/avatar1.png";
    let pathAvt2 = __dirname + "/assets/avatar2.png";
    
    var id1 = event.senderID;
    var name1 = await usersData.getName(id1);
    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var all = ThreadInfo.userInfo;
    
    var gender1;
    for (let c of all) {
      if (c.id == id1) {
        gender1 = c.gender;
        break;
      }
    }
    
    const botID = api.getCurrentUserID();
    let ungvien = [];
    
    if (gender1 == "FEMALE") {
      for (let u of all) {
        if (u.gender == "MALE" && u.id !== id1 && u.id !== botID) {
          ungvien.push(u.id);
        }
      }
    } else if (gender1 == "MALE") {
      for (let u of all) {
        if (u.gender == "FEMALE" && u.id !== id1 && u.id !== botID) {
          ungvien.push(u.id);
        }
      }
    } else {
      for (let u of all) {
        if (u.id !== id1 && u.id !== botID) {
          ungvien.push(u.id);
        }
      }
    }
    
    if (ungvien.length === 0) {
      return api.sendMessage("❌ No suitable pair found in this group!", event.threadID, event.messageID);
    }
    
    var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    var name2 = await usersData.getName(id2);
    
    var rd1 = Math.floor(Math.random() * 100) + 1;
    var cc = ["0", "-1", "99.99", "-99", "-100", "101", "0.01"];
    var rd2 = cc[Math.floor(Math.random() * cc.length)];
    var djtme = [`${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd2}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`];
    var tile = djtme[Math.floor(Math.random() * djtme.length)];
    
    try {
      let getAvt1 = (await axios.get(
        `https://arshi-facebook-pp.vercel.app/api/pp?uid=${id1}`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt1, Buffer.from(getAvt1, "utf-8"));
      
      let getAvt2 = (await axios.get(
        `https://arshi-facebook-pp.vercel.app/api/pp?uid=${id2}`,
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(pathAvt2, Buffer.from(getAvt2, "utf-8"));
      let backgroundPath = __dirname + '/rasin/pair.jpg';
      let baseImage = await loadImage(backgroundPath);
      let baseAvt1 = await loadImage(pathAvt1);
      let baseAvt2 = await loadImage(pathAvt2);
      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseAvt1, 111, 175, 330, 330);
      ctx.drawImage(baseAvt2, 1018, 173, 330, 330);
      
      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      
      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);
      
      return api.sendMessage({
        body: `✨ A beautiful connection has been found ✨
    
${name1} ♡ ${name2}

Your hearts resonate at ${tile}% 💫

May this bond bring joy and warmth to your journey together 💗💫`,
        mentions: [
          { tag: `${name2}`, id: id2 },
          { tag: `${name1}`, id: id1 }
        ],
        attachment: fs.createReadStream(pathImg)
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID);
      
    } catch (error) {
      console.error("Error in pair command:", error);
      return api.sendMessage("❌ An error occurred while creating the pair image. Please try again!", event.threadID, event.messageID);
    }
  }
}