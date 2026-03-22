const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "adminUpdate",
		version: "2.0.0",
		author: "Rasin",
		category: "events"
	},

	langs: {
		en: {
			addAdmin: "",
			removeAdmin: "",
			changeIcon: "",
			callStarted: "",
			callEnded: "",
			userJoinedCall: "",
			changeColor: "",
			changeNickname: "",
			changeThreadName: ""
		}
	},

	onStart: async ({ threadsData, usersData, message, event, api, getLang }) => {
		const types = [
			"log:thread-admins",
			"log:thread-name",
			"log:user-nickname",
			"log:thread-icon",
			"log:thread-call",
			"log:thread-color"
		];
		
		if (!types.includes(event.logMessageType))
			return;

		return async function () {
			const { threadID, logMessageType, logMessageData, logMessageBody } = event;
			const threadData = await threadsData.get(threadID);

			if (threadData.settings?.adminUpdate === false)
				return;

			const cacheDir = path.join(__dirname, "cache");
			await fs.ensureDir(cacheDir);
			const iconPath = path.join(cacheDir, "emoji.json");
			
			if (!fs.existsSync(iconPath)) {
				await fs.writeJson(iconPath, {});
			}

			try {
				const fontPaths = [
					{ path: 'C:\\Windows\\Fonts\\seguisb.ttf', family: 'Segoe' },
					{ path: 'C:\\Windows\\Fonts\\segoeui.ttf', family: 'Segoe' },
					{ path: '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', family: 'Noto' },
					{ path: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', family: 'DejaVu' }
				];

				for (const font of fontPaths) {
					try {
						if (fs.existsSync(font.path)) {
							registerFont(font.path, { family: font.family });
							break;
						}
					} catch (e) {
						continue;
					}
				}
			} catch (fontErr) {
				console.log("Font registration error:", fontErr.message);
			}

			try {
				switch (logMessageType) {
					case "log:thread-admins": {
						const isPromotion = logMessageData.ADMIN_EVENT === "add_admin";
						const userName = await usersData.getName(logMessageData.TARGET_ID);
						const userID = logMessageData.TARGET_ID;

						const canvas = createCanvas(800, 400);
						const ctx = canvas.getContext('2d');

						const bgGradient = ctx.createLinearGradient(0, 0, 800, 400);
						if (isPromotion) {
							bgGradient.addColorStop(0, '#6a11cb');
							bgGradient.addColorStop(0.5, '#2575fc');
							bgGradient.addColorStop(1, '#00c6ff');
						} else {
							bgGradient.addColorStop(0, '#434343');
							bgGradient.addColorStop(1, '#000000');
						}
						ctx.fillStyle = bgGradient;
						ctx.fillRect(0, 0, 800, 400);

						ctx.globalAlpha = 0.1;
						const circles = [
							{ x: 100, y: 100, r: 80 },
							{ x: 700, y: 80, r: 100 },
							{ x: 150, y: 320, r: 60 },
							{ x: 650, y: 350, r: 70 }
						];
						circles.forEach(c => {
							ctx.fillStyle = '#ffffff';
							ctx.beginPath();
							ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
							ctx.fill();
						});
						ctx.globalAlpha = 1;

						ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
						ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
						ctx.lineWidth = 2;
						const cardX = 50, cardY = 50, cardW = 700, cardH = 300, radius = 20;
						ctx.beginPath();
						ctx.moveTo(cardX + radius, cardY);
						ctx.lineTo(cardX + cardW - radius, cardY);
						ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
						ctx.lineTo(cardX + cardW, cardY + cardH - radius);
						ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
						ctx.lineTo(cardX + radius, cardY + cardH);
						ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
						ctx.lineTo(cardX, cardY + radius);
						ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
						ctx.closePath();
						ctx.fill();
						ctx.stroke(); 

						try {
							const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${userID}`;
							const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
							const avatar = await loadImage(Buffer.from(avatarResponse.data));

							const avatarSize = 120;
							const avatarX = 130;
							const avatarY = 200;


							ctx.shadowColor = isPromotion ? '#ffd700' : '#ff4444';
							ctx.shadowBlur = 30;
							ctx.beginPath();
							ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
							ctx.fillStyle = '#ffffff';
							ctx.fill();
							ctx.shadowBlur = 0;


							ctx.save();
							ctx.beginPath();
							ctx.arc(avatarX, avatarY, avatarSize / 2 - 5, 0, Math.PI * 2);
							ctx.closePath();
							ctx.clip();
							ctx.drawImage(avatar, avatarX - avatarSize / 2 + 5, avatarY - avatarSize / 2 + 5, avatarSize - 10, avatarSize - 10);
							ctx.restore();


							ctx.strokeStyle = isPromotion ? '#ffd700' : '#ff4444';
							ctx.lineWidth = 5;
							ctx.beginPath();
							ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
							ctx.stroke();
						} catch (err) {

							ctx.fillStyle = '#2a2a3e';
							ctx.beginPath();
							ctx.arc(130, 200, 60, 0, Math.PI * 2);
							ctx.fill();
						}

						ctx.font = '60px Arial';
						ctx.textAlign = 'center';
						ctx.fillText(isPromotion ? '👑' : '❌', 130, 130);


						ctx.font = 'bold 48px Segoe, Noto, DejaVu, sans-serif';
						const titleGrad = ctx.createLinearGradient(280, 140, 700, 140);
						if (isPromotion) {
							titleGrad.addColorStop(0, '#ffd700');
							titleGrad.addColorStop(1, '#ffed4e');
						} else {
							titleGrad.addColorStop(0, '#ff4444');
							titleGrad.addColorStop(1, '#cc0000');
						}
						ctx.fillStyle = titleGrad;
						ctx.textAlign = 'left';
						ctx.fillText(isPromotion ? 'PROMOTED!' : 'REMOVED', 280, 140);


						ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
						ctx.lineWidth = 2;
						ctx.beginPath();
						ctx.moveTo(280, 160);
						ctx.lineTo(720, 160);
						ctx.stroke();


						ctx.font = 'bold 36px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = '#ffffff';
						let displayName = userName;
						if (ctx.measureText(displayName).width > 420) {
							while (ctx.measureText(displayName + '...').width > 420) {
								displayName = displayName.slice(0, -1);
							}
							displayName += '...';
						}
						ctx.fillText(displayName, 280, 210);

						ctx.font = 'italic 24px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
						ctx.fillText(isPromotion ? 'New Admin Privileges Granted' : 'Admin Privileges Revoked', 280, 245);


						ctx.font = '30px Arial';
						ctx.fillText(isPromotion ? '⭐' : '🔒', 280, 300);
						ctx.fillText(isPromotion ? '✨' : '💔', 650, 300);

						// Footer
						ctx.font = 'bold 20px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
						ctx.textAlign = 'center';
						ctx.fillText(isPromotion ? 'Welcome to the admin team!' : 'Thank you for your service', 400, 320);

						const cachePath = path.join(cacheDir, `admin_${userID}_${Date.now()}.png`);
						const buffer = canvas.toBuffer('image/png');
						await fs.writeFile(cachePath, buffer);


						message.reply({
							attachment: fs.createReadStream(cachePath)
						}, () => {
							try {
								if (fs.existsSync(cachePath)) {
									fs.unlinkSync(cachePath);
								}
							} catch (err) {
								console.error("Error cleaning cache:", err);
							}
						});
						break;
					}

					case "log:thread-icon": {
						const preIcon = await fs.readJson(iconPath);
						const newIcon = logMessageData.thread_icon || "👍";
						const originalIcon = preIcon[threadID] || "❓";

						// Create canvas for icon change
						const canvas = createCanvas(600, 350);
						const ctx = canvas.getContext('2d');

						// Background
						const bgGradient = ctx.createRadialGradient(300, 175, 50, 300, 175, 400);
						bgGradient.addColorStop(0, '#ff9a56');
						bgGradient.addColorStop(0.5, '#ff6a88');
						bgGradient.addColorStop(1, '#ff99ac');
						ctx.fillStyle = bgGradient;
						ctx.fillRect(0, 0, 600, 350);

						// Decorative patterns
						ctx.globalAlpha = 0.1;
						for (let i = 0; i < 8; i++) {
							ctx.strokeStyle = '#ffffff';
							ctx.lineWidth = 2;
							ctx.beginPath();
							ctx.arc(300, 175, 50 + i * 30, 0, Math.PI * 2);
							ctx.stroke();
						}
						ctx.globalAlpha = 1;

						// Main card
						ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
						ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
						ctx.lineWidth = 3;
						ctx.beginPath();
						ctx.roundRect(50, 50, 500, 250, 25);
						ctx.fill();
						ctx.stroke();

						// Title
						ctx.font = 'bold 40px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = '#ffffff';
						ctx.textAlign = 'center';
						ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
						ctx.shadowBlur = 10;
						ctx.fillText('EMOJI CHANGED', 300, 110);
						ctx.shadowBlur = 0;

						// Old icon
						ctx.font = '80px Arial';
						ctx.fillText(originalIcon, 180, 210);
						
						// Arrow
						ctx.font = 'bold 50px Arial';
						ctx.fillText('→', 300, 210);
						
						// New icon
						ctx.font = '80px Arial';
						ctx.fillText(newIcon, 420, 210);

						// Footer
						ctx.font = 'italic 20px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
						ctx.fillText('Group emoji updated!', 300, 270);

						const cachePath = path.join(cacheDir, `icon_${threadID}_${Date.now()}.png`);
						const buffer = canvas.toBuffer('image/png');
						await fs.writeFile(cachePath, buffer);

						preIcon[threadID] = newIcon;
						await fs.writeJson(iconPath, preIcon);

						message.reply({
							attachment: fs.createReadStream(cachePath)
						}, () => {
							try {
								if (fs.existsSync(cachePath)) {
									fs.unlinkSync(cachePath);
								}
							} catch (err) {
								console.error("Error cleaning cache:", err);
							}
						});
						break;
					}

					case "log:thread-name": {
						const newThreadName = logMessageData.name || "No name";

						// Create canvas for name change
						const canvas = createCanvas(800, 300);
						const ctx = canvas.getContext('2d');

						// Background
						const bgGradient = ctx.createLinearGradient(0, 0, 800, 300);
						bgGradient.addColorStop(0, '#667eea');
						bgGradient.addColorStop(1, '#764ba2');
						ctx.fillStyle = bgGradient;
						ctx.fillRect(0, 0, 800, 300);

						// Decorative elements
						ctx.globalAlpha = 0.15;
						ctx.fillStyle = '#ffffff';
						ctx.fillRect(0, 0, 400, 300);
						ctx.globalAlpha = 1;

						// Main card
						ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
						ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
						ctx.lineWidth = 3;
						ctx.beginPath();
						ctx.roundRect(40, 40, 720, 220, 20);
						ctx.fill();
						ctx.stroke();

						// Icon
						ctx.font = '70px Arial';
						ctx.textAlign = 'center';
						ctx.fillText('📝', 120, 150);

						// Title
						ctx.font = 'bold 36px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = '#ffffff';
						ctx.textAlign = 'left';
						ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
						ctx.shadowBlur = 8;
						ctx.fillText('GROUP NAME CHANGED', 200, 110);
						ctx.shadowBlur = 0;

						// New name
						ctx.font = 'bold 32px Segoe, Noto, DejaVu, sans-serif';
						const nameGrad = ctx.createLinearGradient(200, 160, 740, 160);
						nameGrad.addColorStop(0, '#ffd700');
						nameGrad.addColorStop(1, '#ffed4e');
						ctx.fillStyle = nameGrad;
						
						let displayName = newThreadName;
						if (ctx.measureText(displayName).width > 520) {
							while (ctx.measureText(displayName + '...').width > 520) {
								displayName = displayName.slice(0, -1);
							}
							displayName += '...';
						}
						ctx.fillText(displayName, 200, 160);

						// Subtitle
						ctx.font = 'italic 22px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
						ctx.fillText('New group identity!', 200, 200);

						// Decorative stars
						ctx.font = '25px Arial';
						ctx.fillText('✨', 170, 160);
						ctx.fillText('⭐', 720, 200);

						const cachePath = path.join(cacheDir, `name_${threadID}_${Date.now()}.png`);
						const buffer = canvas.toBuffer('image/png');
						await fs.writeFile(cachePath, buffer);


						message.reply({
							attachment: fs.createReadStream(cachePath)
						}, () => {
							try {
								if (fs.existsSync(cachePath)) {
									fs.unlinkSync(cachePath);
								}
							} catch (err) {
								console.error("Error cleaning cache:", err);
							}
						});
						break;
					}

					case "log:thread-call": {
						if (logMessageData.event === "group_call_started") {
							const userName = await usersData.getName(logMessageData.caller_id);
							const userID = logMessageData.caller_id;
							const isVideo = logMessageData.video;

							// Create canvas for call started
							const canvas = createCanvas(700, 350);
							const ctx = canvas.getContext('2d');

							// Background gradient
							const bgGradient = ctx.createLinearGradient(0, 0, 700, 350);
							bgGradient.addColorStop(0, '#00b09b');
							bgGradient.addColorStop(1, '#96c93d');
							ctx.fillStyle = bgGradient;
							ctx.fillRect(0, 0, 700, 350);

							// Decorative rings
							ctx.globalAlpha = 0.1;
							for (let i = 1; i <= 4; i++) {
								ctx.strokeStyle = '#ffffff';
								ctx.lineWidth = 3;
								ctx.beginPath();
								ctx.arc(350, 175, i * 60, 0, Math.PI * 2);
								ctx.stroke();
							}
							ctx.globalAlpha = 1;

							// Main card
							ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
							ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
							ctx.lineWidth = 3;
							ctx.beginPath();
							ctx.roundRect(40, 40, 620, 270, 20);
							ctx.fill();
							ctx.stroke();

							// Call icon with animation circles
							ctx.font = '80px Arial';
							ctx.textAlign = 'center';
							ctx.fillStyle = '#ffffff';
							ctx.fillText(isVideo ? '📹' : '📞', 130, 150);

							// Pulsing circles around icon
							ctx.globalAlpha = 0.3;
							ctx.strokeStyle = '#ffffff';
							ctx.lineWidth = 3;
							ctx.beginPath();
							ctx.arc(130, 120, 70, 0, Math.PI * 2);
							ctx.stroke();
							ctx.beginPath();
							ctx.arc(130, 120, 90, 0, Math.PI * 2);
							ctx.stroke();
							ctx.globalAlpha = 1;

							// Title
							ctx.font = 'bold 38px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = '#ffffff';
							ctx.textAlign = 'left';
							ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
							ctx.shadowBlur = 8;
							ctx.fillText('CALL STARTED', 230, 100);
							ctx.shadowBlur = 0;

							// Call type badge
							ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
							ctx.beginPath();
							ctx.roundRect(230, 115, isVideo ? 150 : 130, 35, 18);
							ctx.fill();
							
							ctx.font = 'bold 20px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = '#ffffff';
							ctx.fillText(isVideo ? '📹 Video Call' : '📞 Voice Call', 245, 140);

							// Divider
							ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
							ctx.lineWidth = 2;
							ctx.beginPath();
							ctx.moveTo(230, 165);
							ctx.lineTo(620, 165);
							ctx.stroke();

							// User name
							ctx.font = 'bold 32px Segoe, Noto, DejaVu, sans-serif';
							const nameGrad = ctx.createLinearGradient(230, 200, 620, 200);
							nameGrad.addColorStop(0, '#ffd700');
							nameGrad.addColorStop(1, '#ffed4e');
							ctx.fillStyle = nameGrad;
							
							let displayName = userName;
							if (ctx.measureText(displayName).width > 370) {
								while (ctx.measureText(displayName + '...').width > 370) {
									displayName = displayName.slice(0, -1);
								}
								displayName += '...';
							}
							ctx.fillText(displayName, 230, 210);

							// Status
							ctx.font = 'italic 22px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
							ctx.fillText('is calling the group...', 230, 245);

							// Footer with animated dots
							ctx.font = 'bold 18px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
							ctx.textAlign = 'center';
							ctx.fillText('Join the conversation!', 350, 285);

							const cachePath = path.join(cacheDir, `call_start_${userID}_${Date.now()}.png`);
							const buffer = canvas.toBuffer('image/png');
							await fs.writeFile(cachePath, buffer);


							message.reply({
								attachment: fs.createReadStream(cachePath)
							}, () => {
								try {
									if (fs.existsSync(cachePath)) {
										fs.unlinkSync(cachePath);
									}
								} catch (err) {
									console.error("Error cleaning cache:", err);
								}
							});
						}
						else if (logMessageData.event === "group_call_ended") {
							const callDuration = logMessageData.call_duration;
							const hours = Math.floor(callDuration / 3600);
							const minutes = Math.floor((callDuration - (hours * 3600)) / 60);
							const seconds = callDuration - (hours * 3600) - (minutes * 60);
							const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
							const isVideo = logMessageData.video;

							// Create canvas for call ended
							const canvas = createCanvas(700, 300);
							const ctx = canvas.getContext('2d');

							// Background gradient (darker/ended theme)
							const bgGradient = ctx.createLinearGradient(0, 0, 700, 300);
							bgGradient.addColorStop(0, '#485563');
							bgGradient.addColorStop(1, '#29323c');
							ctx.fillStyle = bgGradient;
							ctx.fillRect(0, 0, 700, 300);

							// Decorative elements
							ctx.globalAlpha = 0.1;
							ctx.fillStyle = '#ffffff';
							for (let i = 0; i < 20; i++) {
								ctx.beginPath();
								ctx.arc(Math.random() * 700, Math.random() * 300, Math.random() * 3, 0, Math.PI * 2);
								ctx.fill();
							}
							ctx.globalAlpha = 1;

							// Main card
							ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
							ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
							ctx.lineWidth = 3;
							ctx.beginPath();
							ctx.roundRect(40, 40, 620, 220, 20);
							ctx.fill();
							ctx.stroke();

							// Call ended icon
							ctx.font = '70px Arial';
							ctx.textAlign = 'center';
							ctx.fillStyle = '#ff6b6b';
							ctx.fillText('📵', 120, 140);

							// Title
							ctx.font = 'bold 36px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = '#ffffff';
							ctx.textAlign = 'left';
							ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
							ctx.shadowBlur = 8;
							ctx.fillText('CALL ENDED', 200, 100);
							ctx.shadowBlur = 0;

							// Call type
							ctx.font = 'italic 22px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
							ctx.fillText(isVideo ? 'Video Call' : 'Voice Call', 200, 130);

							// Duration box
							ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
							ctx.beginPath();
							ctx.roundRect(200, 150, 450, 70, 15);
							ctx.fill();

							// Clock icon
							ctx.font = '40px Arial';
							ctx.fillText('⏱️', 230, 195);

							// Duration label
							ctx.font = 'bold 18px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
							ctx.textAlign = 'left';
							ctx.fillText('Duration:', 280, 180);

							// Duration time
							ctx.font = 'bold 32px Segoe, Noto, DejaVu, sans-serif';
							const timeGrad = ctx.createLinearGradient(280, 205, 600, 205);
							timeGrad.addColorStop(0, '#4facfe');
							timeGrad.addColorStop(1, '#00f2fe');
							ctx.fillStyle = timeGrad;
							ctx.fillText(timeFormat, 280, 210);

							const cachePath = path.join(cacheDir, `call_end_${Date.now()}.png`);
							const buffer = canvas.toBuffer('image/png');
							await fs.writeFile(cachePath, buffer);


							message.reply({
								attachment: fs.createReadStream(cachePath)
							}, () => {
								try {
									if (fs.existsSync(cachePath)) {
										fs.unlinkSync(cachePath);
									}
								} catch (err) {
									console.error("Error cleaning cache:", err);
								}
							});
						}
						else if (logMessageData.joining_user) {
							const userName = await usersData.getName(logMessageData.joining_user);
							const userID = logMessageData.joining_user;
							const isVideo = logMessageData.group_call_type === "1";

							// Create canvas for user joined
							const canvas = createCanvas(650, 300);
							const ctx = canvas.getContext('2d');

							// Background gradient
							const bgGradient = ctx.createLinearGradient(0, 0, 650, 300);
							bgGradient.addColorStop(0, '#56ab2f');
							bgGradient.addColorStop(1, '#a8e063');
							ctx.fillStyle = bgGradient;
							ctx.fillRect(0, 0, 650, 300);

							// Decorative waves
							ctx.globalAlpha = 0.1;
							ctx.strokeStyle = '#ffffff';
							ctx.lineWidth = 2;
							for (let i = 0; i < 5; i++) {
								ctx.beginPath();
								for (let x = 0; x < 650; x += 10) {
									const y = 150 + Math.sin((x + i * 30) / 30) * 20;
									if (x === 0) ctx.moveTo(x, y);
									else ctx.lineTo(x, y);
								}
								ctx.stroke();
							}
							ctx.globalAlpha = 1;

							// Main card
							ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
							ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
							ctx.lineWidth = 3;
							ctx.beginPath();
							ctx.roundRect(40, 40, 570, 220, 20);
							ctx.fill();
							ctx.stroke();

							try {
								const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${userID}`;
								const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
								const avatar = await loadImage(Buffer.from(avatarResponse.data));

								ctx.save();
								ctx.beginPath();
								ctx.arc(120, 150, 50, 0, Math.PI * 2);
								ctx.closePath();
								ctx.clip();
								ctx.drawImage(avatar, 70, 100, 100, 100);
								ctx.restore();


								ctx.strokeStyle = '#4ade80';
								ctx.lineWidth = 4;
								ctx.beginPath();
								ctx.arc(120, 150, 50, 0, Math.PI * 2);
								ctx.stroke();
							} catch (err) {
								ctx.fillStyle = '#2a2a3e';
								ctx.beginPath();
								ctx.arc(120, 150, 50, 0, Math.PI * 2);
								ctx.fill();
							}


							ctx.fillStyle = '#4ade80';
							ctx.beginPath();
							ctx.arc(160, 130, 15, 0, Math.PI * 2);
							ctx.fill();
							ctx.font = '16px Arial';
							ctx.fillText('✓', 155, 135);

							// Title
							ctx.font = 'bold 32px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = '#ffffff';
							ctx.textAlign = 'left';
							ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
							ctx.shadowBlur = 8;
							ctx.fillText('JOINED CALL', 210, 100);
							ctx.shadowBlur = 0;

							// Call type badge
							ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
							ctx.beginPath();
							ctx.roundRect(210, 115, isVideo ? 140 : 120, 30, 15);
							ctx.fill();
							
							ctx.font = 'bold 18px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = '#ffffff';
							ctx.fillText(isVideo ? '📹 Video' : '📞 Voice', 220, 137);

							// User name
							ctx.font = 'bold 28px Segoe, Noto, DejaVu, sans-serif';
							const nameGrad = ctx.createLinearGradient(210, 175, 580, 175);
							nameGrad.addColorStop(0, '#ffd700');
							nameGrad.addColorStop(1, '#ffed4e');
							ctx.fillStyle = nameGrad;
							
							let displayName = userName;
							if (ctx.measureText(displayName).width > 350) {
								while (ctx.measureText(displayName + '...').width > 350) {
									displayName = displayName.slice(0, -1);
								}
								displayName += '...';
							}
							ctx.fillText(displayName, 210, 175);

							// Status
							ctx.font = 'italic 20px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
							ctx.fillText('joined the conversation', 210, 205);

							// Welcome message
							ctx.font = 'bold 16px Segoe, Noto, DejaVu, sans-serif';
							ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
							ctx.textAlign = 'center';
							ctx.fillText('🎉 Welcome to the call!', 325, 240);

							const cachePath = path.join(cacheDir, `call_join_${userID}_${Date.now()}.png`);
							const buffer = canvas.toBuffer('image/png');
							await fs.writeFile(cachePath, buffer);


							message.reply({
								attachment: fs.createReadStream(cachePath)
							}, () => {
								try {
									if (fs.existsSync(cachePath)) {
										fs.unlinkSync(cachePath);
									}
								} catch (err) {
									console.error("Error cleaning cache:", err);
								}
							});
						}
						break;
					}

					case "log:thread-color": {
						break;
					}

					case "log:user-nickname": {
						const { participant_id, nickname } = logMessageData;
						const userName = await usersData.getName(participant_id);
						const userID = participant_id;
						const nicknameText = nickname && nickname.length > 0 ? nickname : "Original Name";


						const canvas = createCanvas(750, 350);
						const ctx = canvas.getContext('2d');

						const bgGradient = ctx.createLinearGradient(0, 0, 750, 350);
						bgGradient.addColorStop(0, '#fa709a');
						bgGradient.addColorStop(1, '#fee140');
						ctx.fillStyle = bgGradient;
						ctx.fillRect(0, 0, 750, 350);

						ctx.globalAlpha = 0.1;
						for (let i = 0; i < 10; i++) {
							ctx.fillStyle = '#ffffff';
							ctx.beginPath();
							ctx.arc(Math.random() * 750, Math.random() * 350, Math.random() * 50 + 20, 0, Math.PI * 2);
							ctx.fill();
						}
						ctx.globalAlpha = 1;

						ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
						ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
						ctx.lineWidth = 3;
						ctx.beginPath();
						ctx.roundRect(40, 40, 670, 270, 20);
						ctx.fill();
						ctx.stroke();

						try {
							const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${userID}`;
							const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
							const avatar = await loadImage(Buffer.from(avatarResponse.data));

							ctx.save();
							ctx.beginPath();
							ctx.arc(130, 175, 60, 0, Math.PI * 2);
							ctx.closePath();
							ctx.clip();
							ctx.drawImage(avatar, 70, 115, 120, 120);
							ctx.restore();

							ctx.shadowColor = '#ffd700';
							ctx.shadowBlur = 15;
							ctx.strokeStyle = '#ffd700';
							ctx.lineWidth = 5;
							ctx.beginPath();
							ctx.arc(130, 175, 60, 0, Math.PI * 2);
							ctx.stroke();
							ctx.shadowBlur = 0;
						} catch (err) {
							ctx.fillStyle = '#2a2a3e';
							ctx.beginPath();
							ctx.arc(130, 175, 60, 0, Math.PI * 2);
							ctx.fill();
						}


						ctx.font = '40px Arial';
						ctx.textAlign = 'center';
						ctx.fillStyle = '#ffffff';
						ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
						ctx.shadowBlur = 5;
						ctx.fillText('✏️', 170, 150);
						ctx.shadowBlur = 0;

						ctx.font = 'bold 38px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = '#ffffff';
						ctx.textAlign = 'left';
						ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
						ctx.shadowBlur = 8;
						ctx.fillText('NICKNAME CHANGED', 230, 100);
						ctx.shadowBlur = 0;


						ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
						ctx.lineWidth = 2;
						ctx.beginPath();
						ctx.moveTo(230, 115);
						ctx.lineTo(680, 115);
						ctx.stroke();

						// User name label
						ctx.font = 'bold 22px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
						ctx.fillText('User:', 230, 150);

						// User name
						ctx.font = 'bold 26px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = '#ffffff';
						let displayUserName = userName;
						if (ctx.measureText(displayUserName).width > 400) {
							while (ctx.measureText(displayUserName + '...').width > 400) {
								displayUserName = displayUserName.slice(0, -1);
							}
							displayUserName += '...';
						}
						ctx.fillText(displayUserName, 300, 150);

						// Arrow
						ctx.font = 'bold 35px Arial';
						ctx.fillText('↓', 230, 195);

						// Nickname box
						ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
						ctx.beginPath();
						ctx.roundRect(230, 205, 450, 70, 15);
						ctx.fill();

						// Nickname label
						ctx.font = 'bold 20px Segoe, Noto, DejaVu, sans-serif';
						ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
						ctx.textAlign = 'left';
						ctx.fillText('New Nickname:', 250, 235);

						// Nickname text
						ctx.font = 'bold 30px Segoe, Noto, DejaVu, sans-serif';
						const nicknameGrad = ctx.createLinearGradient(250, 260, 650, 260);
						nicknameGrad.addColorStop(0, '#4ade80');
						nicknameGrad.addColorStop(1, '#3b82f6');
						ctx.fillStyle = nicknameGrad;
						
						let displayNickname = nicknameText;
						if (ctx.measureText(displayNickname).width > 410) {
							while (ctx.measureText(displayNickname + '...').width > 410) {
								displayNickname = displayNickname.slice(0, -1);
							}
							displayNickname += '...';
						}
						ctx.fillText(displayNickname, 250, 263);

						// Decorative stars
						ctx.font = '25px Arial';
						ctx.fillStyle = '#ffffff';
						ctx.fillText('✨', 680, 250);

						const cachePath = path.join(cacheDir, `nickname_${userID}_${Date.now()}.png`);
						const buffer = canvas.toBuffer('image/png');
						await fs.writeFile(cachePath, buffer);


						message.reply({
							attachment: fs.createReadStream(cachePath)
						}, () => {
							try {
								if (fs.existsSync(cachePath)) {
									fs.unlinkSync(cachePath);
								}
							} catch (err) {
								console.error("Error cleaning cache:", err);
							}
						});
						break;
					}
				}
			} catch (error) {
				console.error("Error in adminUpdate event:", error);
			}
		};
	}
};