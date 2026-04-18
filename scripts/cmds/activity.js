const Canvas = require("canvas");
const fs = require("fs");

module.exports = {
	config: {
		name: "activity",
		version: "2.0",
		author: "Rasin",
		countDown: 5,
		role: 0,
		description: "View group activity leaderboard",
		category: "box chat",
		guide: {
			en: "   {pn}: View group activity leaderboard"
		}
	},

	langs: {
		en: {
			noData: "No activity data available for this group."
		}
	},

	onStart: async function ({ message, threadsData, event, api, getLang }) {
		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		const { members } = threadData;
		const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;

		let sortedMembers = [];
		for (const user of members) {
			if (!usersInGroup.includes(user.userID)) continue;
			sortedMembers.push({
				name: user.name,
				count: user.count || 0,
				uid: user.userID
			});
		}

		sortedMembers.sort((a, b) => b.count - a.count);
		
		if (sortedMembers.length === 0) {
			return message.reply(getLang("noData"));
		}

		const imagePath = await module.exports.createLeaderboard(sortedMembers, api);
		
		message.reply({ attachment: fs.createReadStream(imagePath) }, () => {
			if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
		});
	},

	createLeaderboard: async function(members, api) {
		const cacheDir = './cache';
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}

		const width = 1400;
		const topMembers = members.slice(0, 3);
		const listMembers = members.slice(3, 13);
		const height = 1000 + (listMembers.length * 85);

		const canvas = Canvas.createCanvas(width, height);
		const ctx = canvas.getContext('2d');


		const bgGradient = ctx.createRadialGradient(width / 2, 300, 0, width / 2, 300, width);
		bgGradient.addColorStop(0, '#1e0533');
		bgGradient.addColorStop(0.5, '#0a0015');
		bgGradient.addColorStop(1, '#000000');
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, width, height);


		ctx.globalAlpha = 0.15;
		const orb1 = ctx.createRadialGradient(200, 200, 0, 200, 200, 300);
		orb1.addColorStop(0, '#ff00ff');
		orb1.addColorStop(1, 'transparent');
		ctx.fillStyle = orb1;
		ctx.fillRect(0, 0, width, height);

		const orb2 = ctx.createRadialGradient(width - 200, 400, 0, width - 200, 400, 400);
		orb2.addColorStop(0, '#00ffff');
		orb2.addColorStop(1, 'transparent');
		ctx.fillStyle = orb2;
		ctx.fillRect(0, 0, width, height);

		ctx.globalAlpha = 1;

		ctx.strokeStyle = 'rgba(138, 43, 226, 0.1)';
		ctx.lineWidth = 1;
		for (let i = 0; i < width; i += 50) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, height);
			ctx.stroke();
		}
		for (let i = 0; i < height; i += 50) {
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(width, i);
			ctx.stroke();
		}

		ctx.shadowColor = '#ff00ff';
		ctx.shadowBlur = 40;
		const titleGradient = ctx.createLinearGradient(0, 80, width, 80);
		titleGradient.addColorStop(0, '#ff00ff');
		titleGradient.addColorStop(0.5, '#00ffff');
		titleGradient.addColorStop(1, '#ff00ff');
		ctx.fillStyle = titleGradient;
		ctx.font = 'bold 72px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('⚡ ACTIVITY LEADERBOARD ⚡', width / 2, 100);
		ctx.shadowBlur = 0;


		ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
		ctx.font = '28px Arial';
		ctx.fillText('ELITE PERFORMERS OF THE MONTH', width / 2, 150);

		const podiumStartY = 220;
		const championBoxWidth = 380;
		const championBoxHeight = 520;
		const spacing = 40;
		const startX = (width - (championBoxWidth * 3 + spacing * 2)) / 2;


		const champions = [
			{ member: topMembers[1], rank: 2, x: startX, height: 480, color1: '#00d9ff', color2: '#00b3e6', glowColor: '#00d9ff' },
			{ member: topMembers[0], rank: 1, x: startX + championBoxWidth + spacing, height: 520, color1: '#ff00ff', color2: '#cc00cc', glowColor: '#ff00ff' },
			{ member: topMembers[2], rank: 3, x: startX + (championBoxWidth + spacing) * 2, height: 440, color1: '#00ff88', color2: '#00cc66', glowColor: '#00ff88' }
		];

		for (const champ of champions) {
			if (!champ.member) continue;
			
			const boxY = podiumStartY + (championBoxHeight - champ.height);
			

			ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
			ctx.shadowBlur = 10;
			ctx.shadowOffsetY = 5;
			

			const cardGradient = ctx.createLinearGradient(champ.x, boxY, champ.x, boxY + champ.height);
			cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
			cardGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
			ctx.fillStyle = cardGradient;
			module.exports.roundRect(ctx, champ.x, boxY, championBoxWidth, champ.height, 30);
			ctx.fill();


			ctx.shadowBlur = 0;
			ctx.shadowOffsetY = 0;
			ctx.strokeStyle = champ.glowColor;
			ctx.lineWidth = 4;
			module.exports.roundRect(ctx, champ.x, boxY, championBoxWidth, champ.height, 30);
			ctx.stroke();

			const badgeY = boxY + 30;
			const badgeSize = 70;
			
			const badgeGradient = ctx.createLinearGradient(
				champ.x + championBoxWidth / 2 - badgeSize / 2, 
				badgeY,
				champ.x + championBoxWidth / 2 + badgeSize / 2, 
				badgeY + badgeSize
			);
			badgeGradient.addColorStop(0, champ.color1);
			badgeGradient.addColorStop(1, champ.color2);
			ctx.fillStyle = badgeGradient;
			ctx.beginPath();
			ctx.arc(champ.x + championBoxWidth / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = '#000';
			ctx.font = 'bold 40px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(`#${champ.rank}`, champ.x + championBoxWidth / 2, badgeY + badgeSize / 2 + 15);

			const avatarSize = 180;
			const avatarY = badgeY + 90;
			const centerX = champ.x + championBoxWidth / 2;

			ctx.strokeStyle = champ.glowColor;
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
			ctx.stroke();

			try {
				const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${champ.member.uid}`;
				const avatar = await Canvas.loadImage(avatarUrl);
				
				ctx.save();
				ctx.beginPath();
				ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(avatar, centerX - avatarSize / 2, avatarY, avatarSize, avatarSize);
				ctx.restore();
			} catch (e) {
				ctx.fillStyle = '#1a1a2e';
				ctx.beginPath();
				ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
				ctx.fill();
			}


			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 28px Arial';
			const nameY = avatarY + avatarSize + 40;
			const nameText = module.exports.truncateText(ctx, champ.member.name, championBoxWidth - 40);
			ctx.fillText(nameText, centerX, nameY);

			const countBoxY = nameY + 30;
			const countBoxHeight = 60;
			
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			module.exports.roundRect(ctx, champ.x + 30, countBoxY, championBoxWidth - 60, countBoxHeight, 15);
			ctx.fill();

			const countGradient = ctx.createLinearGradient(champ.x + 30, countBoxY, champ.x + championBoxWidth - 30, countBoxY);
			countGradient.addColorStop(0, champ.color1);
			countGradient.addColorStop(1, champ.color2);
			ctx.fillStyle = countGradient;
			ctx.font = 'bold 36px Arial';
			ctx.fillText(`${champ.member.count.toLocaleString()}`, centerX, countBoxY + 42);

			ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
			ctx.font = '18px Arial';
			ctx.fillText('MESSAGES', centerX, countBoxY - 10);
		}


		const listStartY = podiumStartY + championBoxHeight + 80;
		
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.font = 'bold 42px Arial';
		ctx.textAlign = 'left';
		ctx.fillText('🏆 TOP CONTRIBUTORS', 80, listStartY);

		for (let i = 0; i < listMembers.length; i++) {
			const member = listMembers[i];
			const rank = i + 4;
			const itemY = listStartY + 80 + (i * 85);
			const itemHeight = 75;
			const itemX = 80;
			const itemWidth = width - 160;

			ctx.shadowColor = 'rgba(138, 43, 226, 0.5)';
			ctx.shadowBlur = 15;
			
			const itemGradient = ctx.createLinearGradient(itemX, itemY, itemX + itemWidth, itemY);
			itemGradient.addColorStop(0, 'rgba(138, 43, 226, 0.2)');
			itemGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
			itemGradient.addColorStop(1, 'rgba(0, 212, 255, 0.2)');
			ctx.fillStyle = itemGradient;
			module.exports.roundRect(ctx, itemX, itemY, itemWidth, itemHeight, 20);
			ctx.fill();

			ctx.strokeStyle = 'rgba(138, 43, 226, 0.5)';
			ctx.lineWidth = 2;
			module.exports.roundRect(ctx, itemX, itemY, itemWidth, itemHeight, 20);
			ctx.stroke();
			ctx.shadowBlur = 0;

			const rankGradient = ctx.createLinearGradient(itemX + 30, itemY, itemX + 30, itemY + itemHeight);
			rankGradient.addColorStop(0, '#ff00ff');
			rankGradient.addColorStop(1, '#00ffff');
			ctx.fillStyle = rankGradient;
			ctx.font = 'bold 32px Arial';
			ctx.textAlign = 'left';
			ctx.fillText(`#${rank}`, itemX + 30, itemY + 48);

			const avatarSize = 55;
			const avatarX = itemX + 140;
			const avatarY = itemY + 10;

			try {
				const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${member.uid}`;
				const avatar = await Canvas.loadImage(avatarUrl);
				
				ctx.save();
				ctx.beginPath();
				ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
				ctx.restore();

				ctx.strokeStyle = '#00ffff';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
				ctx.stroke();
			} catch (e) {
				ctx.fillStyle = '#1a1a2e';
				ctx.beginPath();
				ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
				ctx.fill();
			}

			// Name
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 26px Arial';
			const nameText = module.exports.truncateText(ctx, member.name, 500);
			ctx.fillText(nameText, avatarX + avatarSize + 25, itemY + 48);

			// Progress bar
			const barX = avatarX + avatarSize + 580;
			const barY = itemY + 20;
			const maxBarWidth = 350;
			const barHeight = 35;
			const maxCount = members[0].count;
			const percentage = (member.count / maxCount) * 100;
			const barWidth = Math.max((percentage / 100) * maxBarWidth, 30);

			// Dynamic color based on percentage
			let barColor1, barColor2, textColor;
			if (percentage >= 50) {
				// High activity - Green/Cyan
				barColor1 = '#00ff88';
				barColor2 = '#00ffcc';
				textColor = '#00ff88';
			} else if (percentage >= 20) {
				// Medium activity - Cyan/Blue
				barColor1 = '#00d9ff';
				barColor2 = '#0099ff';
				textColor = '#00d9ff';
			} else if (percentage >= 5) {
				// Low activity - Purple/Pink
				barColor1 = '#ff00ff';
				barColor2 = '#ff6b9d';
				textColor = '#ff00ff';
			} else {
				// Very low activity - Dark purple
				barColor1 = '#8b00ff';
				barColor2 = '#6600cc';
				textColor = '#8b00ff';
			}

			// Bar background
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			module.exports.roundRect(ctx, barX, barY, maxBarWidth, barHeight, 17.5);
			ctx.fill();

			// Bar fill with dynamic gradient
			const barGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
			barGradient.addColorStop(0, barColor1);
			barGradient.addColorStop(1, barColor2);
			ctx.fillStyle = barGradient;
			module.exports.roundRect(ctx, barX, barY, barWidth, barHeight, 17.5);
			ctx.fill();

			// Percentage text with glow
			ctx.shadowColor = textColor;
			ctx.shadowBlur = 10;
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 18px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(`${percentage.toFixed(0)}%`, barX + maxBarWidth / 2, barY + 24);
			ctx.shadowBlur = 0;

			// Count with matching color
			ctx.fillStyle = textColor;
			ctx.font = 'bold 28px Arial';
			ctx.textAlign = 'right';
			ctx.fillText(member.count.toLocaleString(), itemX + itemWidth - 30, itemY + 48);
		}

		const buffer = canvas.toBuffer('image/png');
		const path = `./cache/leaderboard_${Date.now()}.png`;
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

	onChat: async function ({ usersData, threadsData, event }) {
		const { senderID, threadID } = event;
		const members = await threadsData.get(threadID, "members");
		const findMember = members.find(user => user.userID == senderID);
		
		if (!findMember) {
			members.push({
				userID: senderID,
				name: await usersData.getName(senderID),
				nickname: null,
				inGroup: true,
				count: 1
			});
		}
		else {
			findMember.count += 1;
		}
		await threadsData.set(threadID, members, "members");
	}
};
