const { getTime, drive } = global.utils;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "Rasin",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "🌻👀 ˚✿˖°────୨ᰔ୧────°˖✿˚ 🧸\nMɪʀᴀᴀᴀ 👀🫶🏻\nCᴏɴɴᴇᴄᴛᴇᴅ Sᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ 🌸\n\nι'м Mιяα 🧸🎀\nYᴏᴜʀ Pᴇʀꜱᴏɴᴀʟ Bʙ'ᴢ  🧸✨\nPʀᴇғɪx : !\nUsᴇ !Hᴇʟᴘ Tᴏ Sᴇᴇ Aʟʟ Aᴠᴀɪʟᴀʙʟᴇ Cᴏᴍᴍᴀɴᴅꜱ 🧸🎀\n\n🎀˚✿ 𝐎𝐰𝐧𝐞𝐝 𝐛𝐲 𝐑𝐚𝐬𝐢𝐧 🧸✨\nFᴏʀ Tᴇᴄʜɴɪᴄᴀʟ Iꜱsᴜᴇs \nUꜱᴇ !Cᴀʟʟᴀᴅ\nOʀ Cᴏɴᴛᴀᴄᴛ ☁️\nhttps://www.facebook.com/your.bbz.xyz/ \n\n🧸🎀 ⋆˚✿°────୨ᰔ୧────°✿˚ ✨",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `🎀 𝙰𝚜𝚜𝚊𝚕𝚊𝚖𝚞𝚊𝚕𝚊𝚒𝚔𝚞𝚖 {userName} ✨

🌸 ᴏɴ ʙᴇʜᴀʟꜰ ᴏꜰ [ {boxName} ] ᴡᴇ ᴀʀᴇ ꜱᴏ ʜᴀᴘᴘʏ ᴛᴏ ʜᴀᴠᴇ ʏᴏᴜ ʜᴇʀᴇ 💫  

🖤 ᴛʜɪꜱ ɢʀᴏᴜᴘ ɪꜱ ɴᴏᴛ ᴊᴜꜱᴛ ᴀ ᴄʜᴀᴛ, ɪᴛ'ꜱ ᴀ ꜰᴀᴍɪʟʏ ᴡʜᴇʀᴇ ʏᴏᴜ ᴄᴀɴ ꜱʜᴀʀᴇ ʏᴏᴜʀ ᴛʜᴏᴜɢʜᴛꜱ, ꜱᴘʀᴇᴀᴅ ʜᴀᴘᴘɪɴᴇꜱꜱ, ᴀɴᴅ ᴍᴀᴋᴇ ᴜɴꜰᴏʀɢᴇᴛᴛᴀʙʟᴇ ᴍᴇᴍᴏʀɪᴇꜱ 🖤  

😸 ʏᴏᴜʀ ᴘʀᴇꜱᴇɴᴄᴇ ɪꜱ ᴀ ᴅᴇʟɪɢʜᴛ ꜰᴏʀ ᴜꜱ, ꜱᴏ ꜰᴇᴇʟ ꜰʀᴇᴇ ᴛᴏ ᴠɪʙᴇ, ᴄᴏɴɴᴇᴄᴛ, ᴀɴᴅ ꜱᴘʀᴇᴀᴅ ꜱᴍɪʟᴇꜱ 🌈  

✨ ᴊᴜꜱᴛ ᴇɴᴊᴏʏ ᴇᴠᴇʀʏ ꜱᴇᴄᴏɴᴅ ᴏꜰ ᴛʜɪꜱ ᴍᴏᴍᴇɴᴛꜱ, ʙᴇᴄᴀᴜꜱᴇ ʟɪꜰᴇ ɪꜱ ᴀʟʟ ᴀʙᴏᴜᴛ ᴠɪʙᴇꜱ ᴀɴᴅ ᴍᴇᴍᴏʀɪᴇꜱ 🖤

💫 𝙾𝚗𝚌𝚎 𝚊𝚐𝚊𝚒𝚗, 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝚃𝙾 𝚃𝙷𝙴 𝙵𝙰𝙼𝙸𝙻𝚈 ✨`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					
					try {
						const botGifPath = path.join(__dirname, "/rasin/bot.gif");
						
						if (fs.existsSync(botGifPath)) {
							return message.send({
								body: getLang("welcomeMessage", prefix),
								attachment: fs.createReadStream(botGifPath)
							});
						} else {
							console.log("Bot GIF not found at:", botGifPath);
							return message.send(getLang("welcomeMessage", prefix));
						}
					} catch (error) {
						console.error("Error sending bot GIF:", error);
						return message.send(getLang("welcomeMessage", prefix));
					}
				}
				
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};


				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					
					if (userName.length == 0) return;
					
					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					try {
						const cacheDir = path.join(__dirname, "cache");
						await fs.ensureDir(cacheDir);

						// Register fonts with Unicode support
						try {
							const fontPaths = [
								// Windows fonts with Unicode support
								{ path: 'C:\\Windows\\Fonts\\seguisb.ttf', family: 'Segoe' },
								{ path: 'C:\\Windows\\Fonts\\segoeui.ttf', family: 'Segoe' },
								{ path: 'C:\\Windows\\Fonts\\arialuni.ttf', family: 'ArialUni' },
								{ path: 'C:\\Windows\\Fonts\\msyh.ttc', family: 'MSYahei' },
								{ path: 'C:\\Windows\\Fonts\\NotoSans-Bold.ttf', family: 'Noto' },
								// Linux Noto fonts
								{ path: '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', family: 'Noto' },
								{ path: '/usr/share/fonts/truetype/noto/NotoSansBengali-Bold.ttf', family: 'Noto' },
								// DejaVu has good Unicode coverage
								{ path: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', family: 'DejaVu' },
								{ path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu' },
								// Liberation fonts
								{ path: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', family: 'Liberation' },
								// macOS
								{ path: '/System/Library/Fonts/Supplemental/Arial Unicode.ttf', family: 'ArialUni' }
							];
							
							let fontRegistered = false;
							for (const font of fontPaths) {
								try {
									if (fs.existsSync(font.path)) {
										registerFont(font.path, { family: font.family });
										console.log(`Registered font: ${font.family}`);
										fontRegistered = true;
										break;
									}
								} catch (e) {
									continue;
								}
							}
							
							if (!fontRegistered) {
								console.log("⚠️ No Unicode font found!");
								console.log("Windows: Download Noto Sans from https://fonts.google.com/noto");
								console.log("Or use Segoe UI (already installed): Copy C:\\Windows\\Fonts\\seguisb.ttf to your bot folder");
							}
						} catch (fontErr) {
							console.log("Font registration error:", fontErr.message);
						}

						const welcomeCards = [];
						const threadInfo = await api.getThreadInfo(threadID);
						const memberCount = threadInfo.participantIDs.length;

						for (const user of dataAddedParticipants) {
							if (dataBanned.some((item) => item.id == user.userFbId))
								continue;

							const canvas = createCanvas(1000, 600);
							const ctx = canvas.getContext('2d');

							const bgGradient = ctx.createRadialGradient(500, 300, 100, 500, 300, 600);
							bgGradient.addColorStop(0, '#ff6b9d');
							bgGradient.addColorStop(0.5, '#c06c84');
							bgGradient.addColorStop(1, '#6c5b7b');
							ctx.fillStyle = bgGradient;
							ctx.fillRect(0, 0, 1000, 600);

							ctx.globalAlpha = 0.15;
							const bubbles = [
								{x: 150, y: 100, r: 80},
								{x: 850, y: 150, r: 120},
								{x: 200, y: 450, r: 60},
								{x: 800, y: 500, r: 90},
								{x: 500, y: 100, r: 70}
							];
							bubbles.forEach(b => {
								const bubbleGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
								bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
								bubbleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
								ctx.fillStyle = bubbleGrad;
								ctx.beginPath();
								ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
								ctx.fill();
							});
							ctx.globalAlpha = 1;

							ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
							ctx.lineWidth = 3;
							for (let i = 0; i < 5; i++) {
								ctx.beginPath();
								for (let x = 0; x < 1000; x += 20) {
									const y = 100 + i * 100 + Math.sin(x / 50 + i) * 30;
									if (x === 0) ctx.moveTo(x, y);
									else ctx.lineTo(x, y);
								}
								ctx.stroke();
							}

							ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
							ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
							ctx.lineWidth = 3;
							ctx.beginPath();
							ctx.moveTo(100, 120);
							ctx.lineTo(900, 80);
							ctx.quadraticCurveTo(950, 80, 950, 130);
							ctx.lineTo(950, 500);
							ctx.quadraticCurveTo(950, 550, 900, 550);
							ctx.lineTo(100, 520);
							ctx.quadraticCurveTo(50, 520, 50, 470);
							ctx.lineTo(50, 170);
							ctx.quadraticCurveTo(50, 120, 100, 120);
							ctx.closePath();
							ctx.fill();
							ctx.stroke();

							const stripGradient = ctx.createLinearGradient(0, 0, 1000, 600);
							stripGradient.addColorStop(0, '#ffd700');
							stripGradient.addColorStop(0.5, '#ff1493');
							stripGradient.addColorStop(1, '#00ffff');
							ctx.fillStyle = stripGradient;
							ctx.beginPath();
							ctx.moveTo(50, 120);
							ctx.lineTo(950, 80);
							ctx.lineTo(950, 100);
							ctx.lineTo(50, 140);
							ctx.closePath();
							ctx.fill();

							try {
								const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${user.userFbId}`;
								const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
								const avatar = await loadImage(Buffer.from(avatarResponse.data));

								const hexSize = 110;
								const hexX = 250;
								const hexY = 300;

								ctx.save();
								ctx.beginPath();
								for (let i = 0; i < 6; i++) {
									const angle = (Math.PI / 3) * i;
									const x = hexX + hexSize * Math.cos(angle);
									const y = hexY + hexSize * Math.sin(angle);
									if (i === 0) ctx.moveTo(x, y);
									else ctx.lineTo(x, y);
								}
								ctx.closePath();
								ctx.clip();
								ctx.drawImage(avatar, hexX - hexSize, hexY - hexSize, hexSize * 2, hexSize * 2);
								ctx.restore();

								ctx.shadowColor = '#ffd700';
								ctx.shadowBlur = 20;
								ctx.strokeStyle = '#ffd700';
								ctx.lineWidth = 5;
								ctx.beginPath();
								for (let i = 0; i < 6; i++) {
									const angle = (Math.PI / 3) * i;
									const x = hexX + hexSize * Math.cos(angle);
									const y = hexY + hexSize * Math.sin(angle);
									if (i === 0) ctx.moveTo(x, y);
									else ctx.lineTo(x, y);
								}
								ctx.closePath();
								ctx.stroke();
								ctx.shadowBlur = 0;

								ctx.strokeStyle = 'rgba(255, 20, 147, 0.6)';
								ctx.lineWidth = 3;
								ctx.beginPath();
								for (let i = 0; i < 6; i++) {
									const angle = (Math.PI / 3) * i;
									const x = hexX + (hexSize + 15) * Math.cos(angle);
									const y = hexY + (hexSize + 15) * Math.sin(angle);
									if (i === 0) ctx.moveTo(x, y);
									else ctx.lineTo(x, y);
								}
								ctx.closePath();
								ctx.stroke();

							} catch (err) {
								const hexSize = 110;
								const hexX = 250;
								const hexY = 300;
								ctx.fillStyle = '#2a2a3e';
								ctx.beginPath();
								for (let i = 0; i < 6; i++) {
									const angle = (Math.PI / 3) * i;
									const x = hexX + hexSize * Math.cos(angle);
									const y = hexY + hexSize * Math.sin(angle);
									if (i === 0) ctx.moveTo(x, y);
									else ctx.lineTo(x, y);
								}
								ctx.closePath();
								ctx.fill();
							}

							ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
							ctx.fillRect(450, 150, 480, 80);
							
							ctx.shadowColor = '#ffd700';
							ctx.shadowBlur = 15;
							ctx.font = 'bold 56px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
							const welcomeGrad = ctx.createLinearGradient(450, 180, 900, 180);
							welcomeGrad.addColorStop(0, '#ffffff');
							welcomeGrad.addColorStop(1, '#ffd700');
							ctx.fillStyle = welcomeGrad;
							ctx.textAlign = 'left';
							ctx.fillText('WELCOME', 480, 210);
							ctx.shadowBlur = 0;

							ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
							ctx.fillRect(450, 250, 480, 90);

							ctx.font = 'bold 42px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
							const nameGrad = ctx.createLinearGradient(450, 280, 900, 280);
							nameGrad.addColorStop(0, '#ff1493');
							nameGrad.addColorStop(0.5, '#00ffff');
							nameGrad.addColorStop(1, '#ffd700');
							ctx.fillStyle = nameGrad;
							
							let displayName = user.fullName;
							ctx.font = 'bold 38px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
							if (ctx.measureText(displayName).width > 440) {
								while (ctx.measureText(displayName + '...').width > 440) {
									displayName = displayName.slice(0, -1);
								}
								displayName += '...';
							}
							ctx.fillText(displayName, 480, 295);

							ctx.font = 'italic 22px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
							ctx.fillStyle = '#ffffff';
							ctx.fillText('New Member Joined!', 480, 325);

							ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
							ctx.fillRect(450, 360, 200, 60);
							ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
							ctx.lineWidth = 2;
							ctx.strokeRect(450, 360, 200, 60);

							ctx.font = 'bold 12px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
							ctx.fillStyle = '#00ffff';
							ctx.fillText('TOTAL MEMBERS', 470, 380);
							
							ctx.font = 'bold 20px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
							ctx.fillStyle = '#ffffff';
							ctx.fillText(`👥 ${memberCount}`, 470, 405);

							ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
							ctx.lineWidth = 3;
							ctx.beginPath();
							ctx.moveTo(450, 450);
							ctx.lineTo(930, 450);
							ctx.stroke();

							const stars = [
								{x: 460, y: 480, size: 20},
								{x: 700, y: 490, size: 16},
								{x: 900, y: 475, size: 18}
							];
							
							stars.forEach(star => {
								ctx.font = `${star.size}px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif`;
								ctx.fillStyle = '#ffd700';
								ctx.fillText('⭐', star.x, star.y);
							});

							ctx.font = 'bold 22px Segoe, Noto, ArialUni, MSYahei, DejaVu, sans-serif';
							const footerGrad = ctx.createLinearGradient(450, 515, 800, 515);
							footerGrad.addColorStop(0, '#ff1493');
							footerGrad.addColorStop(1, '#00ffff');
							ctx.fillStyle = footerGrad;
							ctx.fillText('Hope You Enjoy Your Stay! 🎉', 450, 515);

							const cachePath = path.join(cacheDir, `welcome_${user.userFbId}_${Date.now()}.png`);
							const buffer = canvas.toBuffer('image/png');
							await fs.writeFile(cachePath, buffer);
							welcomeCards.push(fs.createReadStream(cachePath));
						}

						if (welcomeCards.length > 0) {
							form.attachment = welcomeCards;
						}
					} catch (error) {
						console.error("Error generating welcome card:", error);
					}

					await message.send(form);

					try {
						const cacheDir = path.join(__dirname, "cache");
						if (fs.existsSync(cacheDir)) {
							const files = fs.readdirSync(cacheDir);
							files.forEach(file => {
								if (file.startsWith("welcome_") && file.endsWith(".png")) {
									fs.unlinkSync(path.join(cacheDir, file));
								}
							});
						}
					} catch (err) {
						console.error("Error cleaning cache:", err);
					}

					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};