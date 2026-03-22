const Canvas = require("canvas");
const fs = require("fs");

let deltaNext;
const expToLevel = (exp, deltaNextLevel = deltaNext) => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
const levelToExp = (level, deltaNextLevel = deltaNext) => Math.floor(((Math.pow(level, 2) - level) * deltaNextLevel) / 2);

module.exports = {
	config: {
		name: "rank",
		version: "3.0",
		author: "Rasin",
		countDown: 5,
		role: 0,
		description: {
			en: "View your level or the level of the person by name"
		},
		category: "rank",
		guide: {
			en: "   {pn} [empty | <name> | reply]"
		},
		envConfig: {
			deltaNext: 5
		}
	},

	onStart: async function ({ message, event, usersData, threadsData, commandName, envCommands, api, args }) {
		deltaNext = envCommands[commandName].deltaNext;
		let targetUsers = [];

		const findUserByName = async (query) => {
			try {
				const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
				const threadInfo = await api.getThreadInfo(event.threadID);
				const ids = threadInfo.participantIDs || [];
				const matches = [];

				for (const uid of ids) {
					try {
						const name = (await usersData.getName(uid)).toLowerCase();
						if (name.includes(cleanQuery)) {
							matches.push({ uid, name });
						}
					} catch {}
				}

				return matches;
			} catch {
				return [];
			}
		};

		if (event.messageReply?.senderID && !args[0]) {
			targetUsers = [event.messageReply.senderID];
		}
		else if (args[0]) {
			const query = args.join(" ");
			const matches = await findUserByName(query);

			if (matches.length === 0) {
				return message.reply(`😵 User Not Found ✨\nNo user found with name: ${query.replace(/@/g, "")}`);
			}

			if (matches.length > 1) {
				const matchList = matches.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
				return message.reply(`😅 Multiple Users Found ✨\nPlease be more specific:\n${matchList}`);
			}

			targetUsers = [matches[0].uid];
		}
		else {
			targetUsers = [event.senderID];
		}

		const attachments = [];
		for (const userID of targetUsers) {
			const cardPath = await module.exports.createRankCard(userID, usersData, threadsData, api);
			attachments.push(fs.createReadStream(cardPath));
		}

		message.reply({ attachment: attachments }, () => {
			targetUsers.forEach(userID => {
				const path = `./cache/rank_${userID}.png`;
				if (fs.existsSync(path)) fs.unlinkSync(path);
			});
		});
	},

	createRankCard: async function(userID, usersData, threadsData, api) {
		const cacheDir = './cache';
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}

		const { exp, name } = await usersData.get(userID);
		const levelUser = expToLevel(exp || 0, deltaNext);
		const expNextLevel = levelToExp(levelUser + 1, deltaNext) - levelToExp(levelUser, deltaNext);
		const currentExp = expNextLevel - (levelToExp(levelUser + 1, deltaNext) - (exp || 0));

		const allUser = await usersData.getAll();
		allUser.sort((a, b) => (b.exp || 0) - (a.exp || 0));
		const rank = allUser.findIndex(user => user.userID == userID) + 1;

	
		const width = 1200;
		const height = 400;
		const canvas = Canvas.createCanvas(width, height);
		const ctx = canvas.getContext('2d');

	
		const bgGradient = ctx.createLinearGradient(0, 0, width, height);
		bgGradient.addColorStop(0, '#1a1a2e');
		bgGradient.addColorStop(0.5, '#16213e');
		bgGradient.addColorStop(1, '#0f3460');
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, width, height);

		ctx.globalAlpha = 0.1;
		ctx.fillStyle = '#00d9ff';
		ctx.beginPath();
		ctx.arc(100, 350, 150, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(width - 100, 50, 200, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1;

		const cardX = 40;
		const cardY = 40;
		const cardWidth = width - 80;
		const cardHeight = height - 80;
		const radius = 20;


		ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 10;

		ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
		module.exports.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius);
		ctx.fill();


		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;


		ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
		ctx.lineWidth = 2;
		module.exports.roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius);
		ctx.stroke();


		const avatarSize = 180;
		const avatarX = cardX + 60;
		const avatarY = cardY + (cardHeight - avatarSize) / 2;

		try {
			const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${userID}`;
			const avatar = await Canvas.loadImage(avatarUrl);
			
		
			ctx.shadowColor = '#00d9ff';
			ctx.shadowBlur = 30;
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			ctx.fillStyle = '#00d9ff';
			ctx.fill();
			ctx.shadowBlur = 0;
			
			
			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
			ctx.restore();
			
	
			ctx.strokeStyle = '#00d9ff';
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			ctx.stroke();
		} catch (e) {
		
			ctx.fillStyle = '#1a1a2e';
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
			ctx.fill();
		}


		const infoX = avatarX + avatarSize + 60;
		const infoY = cardY + 60;

	
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 48px Arial';
		ctx.fillText(module.exports.truncateText(ctx, name, 500), infoX, infoY);

	
		const levelBadgeX = infoX;
		const levelBadgeY = infoY + 30;
		const levelBadgeWidth = 120;
		const levelBadgeHeight = 50;

		const levelGradient = ctx.createLinearGradient(levelBadgeX, levelBadgeY, levelBadgeX + levelBadgeWidth, levelBadgeY);
		levelGradient.addColorStop(0, '#00d9ff');
		levelGradient.addColorStop(1, '#0099cc');
		ctx.fillStyle = levelGradient;
		module.exports.roundRect(ctx, levelBadgeX, levelBadgeY, levelBadgeWidth, levelBadgeHeight, 25);
		ctx.fill();

		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 24px Arial';
		ctx.textAlign = 'center';
		ctx.fillText(`LEVEL ${levelUser}`, levelBadgeX + levelBadgeWidth / 2, levelBadgeY + 33);
		ctx.textAlign = 'left';

	
		const rankBadgeX = levelBadgeX + levelBadgeWidth + 20;
		const rankBadgeY = levelBadgeY;
		const rankBadgeWidth = 150;
		const rankBadgeHeight = 50;

		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		module.exports.roundRect(ctx, rankBadgeX, rankBadgeY, rankBadgeWidth, rankBadgeHeight, 25);
		ctx.fill();

		ctx.strokeStyle = '#00d9ff';
		ctx.lineWidth = 2;
		module.exports.roundRect(ctx, rankBadgeX, rankBadgeY, rankBadgeWidth, rankBadgeHeight, 25);
		ctx.stroke();

		ctx.fillStyle = '#00d9ff';
		ctx.font = 'bold 24px Arial';
		ctx.textAlign = 'center';
		ctx.fillText(`RANK #${rank}`, rankBadgeX + rankBadgeWidth / 2, rankBadgeY + 33);
		ctx.textAlign = 'left';

	
		const barX = infoX;
		const barY = levelBadgeY + levelBadgeHeight + 40;
		const barWidth = cardWidth - (infoX - cardX) - 60;
		const barHeight = 40;


		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		module.exports.roundRect(ctx, barX, barY, barWidth, barHeight, 20);
		ctx.fill();

	
		const progressPercent = (currentExp / expNextLevel) * 100;
		const progressWidth = (barWidth * progressPercent) / 100;

		const progressGradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
		progressGradient.addColorStop(0, '#00ff88');
		progressGradient.addColorStop(0.5, '#00d9ff');
		progressGradient.addColorStop(1, '#0099cc');
		ctx.fillStyle = progressGradient;
		module.exports.roundRect(ctx, barX, barY, progressWidth, barHeight, 20);
		ctx.fill();


		ctx.strokeStyle = '#00d9ff';
		ctx.lineWidth = 2;
		module.exports.roundRect(ctx, barX, barY, barWidth, barHeight, 20);
		ctx.stroke();

	
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 20px Arial';
		ctx.textAlign = 'center';
		const progressText = `${currentExp} / ${expNextLevel} XP`;
		ctx.fillText(progressText, barX + barWidth / 2, barY + 27);


		ctx.fillStyle = '#00ff88';
		ctx.font = 'bold 24px Arial';
		ctx.fillText(`${progressPercent.toFixed(1)}%`, barX + barWidth / 2, barY - 15);

		
		const statsY = barY + barHeight + 30;
		
		
		ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
		ctx.font = '20px Arial';
		ctx.textAlign = 'left';
		ctx.fillText('Total EXP:', barX, statsY);
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 24px Arial';
		ctx.fillText(`${exp || 0}`, barX + 120, statsY);

	
		const nextLevelX = barX + 350;
		ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
		ctx.font = '20px Arial';
		ctx.fillText('Next Level:', nextLevelX, statsY);
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 24px Arial';
		ctx.fillText(`${expNextLevel - currentExp} XP`, nextLevelX + 130, statsY);

		const buffer = canvas.toBuffer('image/png');
		const path = `./cache/rank_${userID}.png`;
		fs.writeFileSync(path, buffer);
		return path;
	},

	roundRect: function(ctx, x, y, width, height, radius) {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	},

	truncateText: function(ctx, text, maxWidth) {
		if (ctx.measureText(text).width <= maxWidth) return text;
		while (ctx.measureText(text + '...').width > maxWidth) {
			text = text.slice(0, -1);
		}
		return text + '...';
	},

	onChat: async function ({ usersData, event }) {
		let { exp } = await usersData.get(event.senderID);
		if (isNaN(exp) || typeof exp != "number")
			exp = 0;
		try {
			await usersData.set(event.senderID, {
				exp: exp + 1
			});
		}
		catch (e) { }
	}

};