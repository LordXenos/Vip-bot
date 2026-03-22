const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const axios = require('axios');

async function createLeaderboardCard(arraySort, page, totalPages, totalGroupMsgs) {
	const cacheDir = './cache';
	if (!fs.existsSync(cacheDir)) {
		fs.mkdirSync(cacheDir, { recursive: true });
	}
	
	const itemsPerPage = 10;
	const startIndex = (page - 1) * itemsPerPage;
	const pageData = arraySort.slice(startIndex, startIndex + itemsPerPage);
	
	const canvas = createCanvas(600, 100 + pageData.length * 70 + 100);
	const ctx = canvas.getContext('2d');


	const bgGradient = ctx.createLinearGradient(0, 0, 600, canvas.height);
	bgGradient.addColorStop(0, '#B8A4E5');
	bgGradient.addColorStop(0.5, '#A8B8E5');
	bgGradient.addColorStop(1, '#B8A4E5');
	ctx.fillStyle = bgGradient;
	ctx.fillRect(0, 0, 600, canvas.height);


	ctx.globalAlpha = 0.1;
	const circles = [
		{x: 100, y: 80, r: 60},
		{x: 500, y: 100, r: 80},
		{x: 150, y: canvas.height - 100, r: 50},
		{x: 480, y: canvas.height - 80, r: 70}
	];
	circles.forEach(c => {
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
		ctx.fill();
	});
	ctx.globalAlpha = 1;


	const cardX = 30;
	const cardY = 30;
	const cardWidth = 540;
	const cardHeight = canvas.height - 60;
	const radius = 20;

	
	ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
	ctx.shadowBlur = 20;
	ctx.shadowOffsetY = 8;


	ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
	ctx.beginPath();
	ctx.moveTo(cardX + radius, cardY);
	ctx.lineTo(cardX + cardWidth - radius, cardY);
	ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
	ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
	ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
	ctx.lineTo(cardX + radius, cardY + cardHeight);
	ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
	ctx.lineTo(cardX, cardY + radius);
	ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
	ctx.closePath();
	ctx.fill();

	
	ctx.shadowBlur = 0;
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
	ctx.lineWidth = 2;
	ctx.stroke();

	ctx.font = 'bold 36px Arial';
	ctx.fillStyle = '#7B68EE';
	ctx.textAlign = 'center';
	ctx.fillText('🏆 LEADERBOARD 🏆', 300, 75);

	ctx.font = '16px Arial';
	ctx.fillStyle = '#666666';
	ctx.fillText(`Page ${page}/${totalPages} • Total Msgs: ${totalGroupMsgs}`, 300, 100);


	let currentY = 140;
	
	for (let i = 0; i < pageData.length; i++) {
		const user = pageData[i];
		const itemY = currentY + i * 70;
		
	
		ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
		const itemRadius = 15;
		ctx.beginPath();
		ctx.moveTo(cardX + 20 + itemRadius, itemY);
		ctx.lineTo(cardX + cardWidth - 40 - itemRadius, itemY);
		ctx.quadraticCurveTo(cardX + cardWidth - 40, itemY, cardX + cardWidth - 40, itemY + itemRadius);
		ctx.lineTo(cardX + cardWidth - 40, itemY + 50 - itemRadius);
		ctx.quadraticCurveTo(cardX + cardWidth - 40, itemY + 50, cardX + cardWidth - 40 - itemRadius, itemY + 50);
		ctx.lineTo(cardX + 20 + itemRadius, itemY + 50);
		ctx.quadraticCurveTo(cardX + 20, itemY + 50, cardX + 20, itemY + 50 - itemRadius);
		ctx.lineTo(cardX + 20, itemY + itemRadius);
		ctx.quadraticCurveTo(cardX + 20, itemY, cardX + 20 + itemRadius, itemY);
		ctx.closePath();
		ctx.fill();

		const borderGradient = ctx.createLinearGradient(cardX + 20, itemY, cardX + cardWidth - 40, itemY);
		if (user.stt === 1) {
			borderGradient.addColorStop(0, '#FFD700');
			borderGradient.addColorStop(1, '#FFA500');
		} else if (user.stt === 2) {
			borderGradient.addColorStop(0, '#C0C0C0');
			borderGradient.addColorStop(1, '#A8A8A8');
		} else if (user.stt === 3) {
			borderGradient.addColorStop(0, '#CD7F32');
			borderGradient.addColorStop(1, '#A0522D');
		} else {
			borderGradient.addColorStop(0, '#9370DB');
			borderGradient.addColorStop(1, '#7B68EE');
		}
		ctx.strokeStyle = borderGradient;
		ctx.lineWidth = 3;
		ctx.stroke();

		try {
			const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${user.uid}`;
			const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 5000 });
			const avatar = await loadImage(Buffer.from(avatarResponse.data));
			
			const avatarSize = 40;
			const avatarX = cardX + 35;
			const avatarY = itemY + 5;
			
			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
			ctx.restore();
			
	
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
			ctx.stroke();
		} catch (err) {
		
			const avatarSize = 40;
			const avatarX = cardX + 35;
			const avatarY = itemY + 5;
			ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
			ctx.beginPath();
			ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
			ctx.fill();
		}


		ctx.font = 'bold 20px Arial';
		ctx.fillStyle = '#333333';
		ctx.textAlign = 'left';
		ctx.fillText(`#${user.stt}`, cardX + 90, itemY + 30);

	
		ctx.font = '18px Arial';
		ctx.fillStyle = '#222222';
		let displayName = user.name;
		if (ctx.measureText(displayName).width > 250) {
			while (ctx.measureText(displayName + '...').width > 250) {
				displayName = displayName.slice(0, -1);
			}
			displayName += '...';
		}
		ctx.fillText(displayName, cardX + 140, itemY + 30);

	
		ctx.font = 'bold 16px Arial';
		ctx.fillStyle = '#9370DB';
		ctx.textAlign = 'right';
		ctx.fillText(`${user.count} msgs`, cardX + cardWidth - 60, itemY + 30);
	}

	const footerY = currentY + pageData.length * 70 + 20;
	ctx.font = 'italic 14px Arial';
	ctx.fillStyle = '#888888';
	ctx.textAlign = 'center';
	ctx.fillText("Type '!count all [number]' to see next page", 300, footerY);

	const buffer = canvas.toBuffer('image/png');
	const cachePath = `./cache/leaderboard_${Date.now()}.png`;
	fs.writeFileSync(cachePath, buffer);
	return cachePath;
}

async function createActivityCard(userData, userID, api, totalGroupMsgs, totalMembers) {
	const cacheDir = './cache';
	if (!fs.existsSync(cacheDir)) {
		fs.mkdirSync(cacheDir, { recursive: true });
	}
	
	const canvas = createCanvas(600, 350);
	const ctx = canvas.getContext('2d');

	const bgGradient = ctx.createLinearGradient(0, 0, 600, 350);
	bgGradient.addColorStop(0, '#B8A4E5');
	bgGradient.addColorStop(0.5, '#A8B8E5');
	bgGradient.addColorStop(1, '#B8A4E5');
	ctx.fillStyle = bgGradient;
	ctx.fillRect(0, 0, 600, 350);

	ctx.globalAlpha = 0.1;
	const circles = [
		{x: 100, y: 80, r: 60},
		{x: 500, y: 100, r: 80},
		{x: 150, y: 280, r: 50},
		{x: 480, y: 270, r: 70}
	];
	circles.forEach(c => {
		ctx.fillStyle = '#ffffff';
		ctx.beginPath();
		ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
		ctx.fill();
	});
	ctx.globalAlpha = 1;

	const cardX = 60;
	const cardY = 60;
	const cardWidth = 480;
	const cardHeight = 230;
	const radius = 20;

	ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
	ctx.shadowBlur = 20;
	ctx.shadowOffsetY = 8;

	ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
	ctx.beginPath();
	ctx.moveTo(cardX + radius, cardY);
	ctx.lineTo(cardX + cardWidth - radius, cardY);
	ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
	ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
	ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
	ctx.lineTo(cardX + radius, cardY + cardHeight);
	ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
	ctx.lineTo(cardX, cardY + radius);
	ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
	ctx.closePath();
	ctx.fill();

	ctx.shadowBlur = 0;
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
	ctx.lineWidth = 2;
	ctx.stroke();

	ctx.shadowColor = 'rgba(123, 104, 238, 0.3)';
	ctx.shadowBlur = 10;
	ctx.fillStyle = '#7B68EE';
	ctx.font = 'bold 32px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(userData.name.toUpperCase(), 300, 115);
	ctx.shadowBlur = 0;

	try {
		const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${userID}`;
		const avatar = await loadImage(avatarUrl);
		
		const avatarX = 110;
		const avatarY = 140;
		const avatarSize = 120;
		
		ctx.save();
		ctx.beginPath();
		ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
		ctx.restore();
		
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
		ctx.stroke();
		
		ctx.strokeStyle = 'rgba(123, 104, 238, 0.4)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 5, 0, Math.PI * 2);
		ctx.stroke();
	} catch (e) {
		ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
		ctx.beginPath();
		ctx.arc(170, 200, 60, 0, Math.PI * 2);
		ctx.fill();
	}

	const statsX = 270;
	const statsY = 150;
	
	const contribution = totalGroupMsgs > 0 ? ((userData.count / totalGroupMsgs) * 100).toFixed(1) : 0;

	ctx.fillStyle = '#333333';
	ctx.font = '20px Arial';
	ctx.textAlign = 'left';

	
	ctx.fillText('🏆 Rank: #' + userData.stt, statsX, statsY);
	

	ctx.fillText('🎀 messages: ' + userData.count, statsX, statsY + 35);
	

	ctx.fillText('⭐ Contribution: ' + contribution + '%', statsX, statsY + 70);

	ctx.fillStyle = 'rgba(168, 184, 229, 0.2)';
	ctx.fillRect(cardX + 10, cardY + cardHeight - 30, cardWidth - 20, 20);
	
	ctx.fillStyle = '#666666';
	ctx.font = '14px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(`Total Group Msgs: ${totalGroupMsgs} • Members: ${totalMembers}`, 300, cardY + cardHeight - 15);

	const buffer = canvas.toBuffer('image/png');
	const path = `./cache/activity_${userID}.png`;
	fs.writeFileSync(path, buffer);
	return path;
}

module.exports = {
	config: {
		name: "count",
		version: "3.0",
		author: "Rasin",
		countDown: 5,
		role: 0,
		description: "View the number of messages with activity card",
		category: "box chat",
		guide: {
			en: "   {pn}: view your message count with activity card"
				+ "\n   {pn} @tag: view tagged user's activity card"
				+ "\n   {pn} <name>: search user by name and view activity card"
				+ "\n   {pn} <uid>: view activity card by user ID"
				+ "\n   {pn} all: view all members' message count"
		}
	},

	langs: {
		en: {
			count: "Number of messages of members:",
			endMessage: "Those who do not have a name in the list have not sent any messages.",
			page: "Page [%1/%2]",
			reply: "Reply to this message with the page number to view more",
			result: "%1 rank %2 with %3 messages",
			yourResult: "You are ranked %1 and have sent %2 messages in this group",
			invalidPage: "Invalid page number",
			notFound: "User '%1' not found in this conversation",
			multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific."
		}
	},

	onStart: async function ({ args, threadsData, message, event, api, commandName, getLang, usersData }) {
		const { threadID, senderID } = event;
		const threadData = await threadsData.get(threadID);
		const { members } = threadData;
		const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
		let arraySort = [];
		
		for (const user of members) {
			if (!usersInGroup.includes(user.userID))
				continue;
			const charac = "️️️️️️️️️️️️️️️️️";
			arraySort.push({
				name: user.name.includes(charac) ? `Uid: ${user.userID}` : user.name,
				count: user.count,
				uid: user.userID,
				dailyCount: user.dailyCount || {}
			});
		}
		
		let stt = 1;
		arraySort.sort((a, b) => b.count - a.count);
		arraySort.map(item => item.stt = stt++);

		const totalGroupMsgs = arraySort.reduce((sum, user) => sum + user.count, 0);
		const totalMembers = usersInGroup.length;

		if (args[0]) {
			if (args[0].toLowerCase() == "all") {
				let page = parseInt(args[1]) || 1;
				const itemsPerPage = 10;
				const totalPages = Math.ceil(arraySort.length / itemsPerPage);
				
				if (page < 1) page = 1;
				if (page > totalPages) page = totalPages;

				const leaderboardPath = await createLeaderboardCard(arraySort, page, totalPages, totalGroupMsgs);
				await message.reply({ attachment: fs.createReadStream(leaderboardPath) });
				fs.unlinkSync(leaderboardPath);
				return;
			}
			else if (event.mentions && Object.keys(event.mentions).length > 0) {
				for (const id in event.mentions) {
					const findUser = arraySort.find(item => item.uid == id);
					const cardPath = await createActivityCard(findUser, id, api, totalGroupMsgs, totalMembers);
					await message.reply({ attachment: fs.createReadStream(cardPath) });
					fs.unlinkSync(cardPath);
				}
			}
			else if (/^\d+$/.test(args[0])) {
				const targetID = args[0];
				const findUser = arraySort.find(item => item.uid == targetID);
				if (findUser) {
					const cardPath = await createActivityCard(findUser, targetID, api, totalGroupMsgs, totalMembers);
					await message.reply({ attachment: fs.createReadStream(cardPath) });
					fs.unlinkSync(cardPath);
				} else {
					return message.reply(getLang("notFound", targetID));
				}
			}
			else {
				const query = args.join(" ");
				const matches = await findUserByName(api, usersData, threadID, query);

				if (matches.length === 0) {
					return message.reply(getLang("notFound", query.replace(/@/g, "")));
				}

				if (matches.length > 1) {
					const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
					return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
				}

				const targetID = matches[0].uid;
				const findUser = arraySort.find(item => item.uid == targetID);
				if (findUser) {
					const cardPath = await createActivityCard(findUser, targetID, api, totalGroupMsgs, totalMembers);
					await message.reply({ attachment: fs.createReadStream(cardPath) });
					fs.unlinkSync(cardPath);
				} else {
					return message.reply(getLang("notFound", query));
				}
			}
		}
		else {
			const findUser = arraySort.find(item => item.uid == senderID);
			const cardPath = await createActivityCard(findUser, senderID, api, totalGroupMsgs, totalMembers);
			await message.reply({ attachment: fs.createReadStream(cardPath) });
			fs.unlinkSync(cardPath);
		}
	},

	onReply: ({ message, event, Reply, commandName, getLang }) => {
		const { senderID, body } = event;
		const { author, splitPage } = Reply;
		if (author != senderID)
			return;
		const page = parseInt(body);
		if (isNaN(page) || page < 1 || page > splitPage.totalPage)
			return message.reply(getLang("invalidPage"));
		let msg = getLang("count");
		const endMessage = getLang("endMessage");
		const arraySort = splitPage.allPage[page - 1];
		for (const item of arraySort) {
			if (item.count > 0)
				msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
		}
		msg += getLang("page", page, splitPage.totalPage)
			+ "\n" + getLang("reply")
			+ "\n\n" + endMessage;
		message.reply(msg, (err, info) => {
			if (err)
				return message.err(err);
			message.unsend(Reply.messageID);
			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				splitPage,
				author: senderID
			});
		});
	},

	onChat: async ({ usersData, threadsData, event }) => {
		const { senderID, threadID } = event;
		const members = await threadsData.get(threadID, "members");
		const findMember = members.find(user => user.userID == senderID);
		const today = new Date().toDateString();
		
		if (!findMember) {
			members.push({
				userID: senderID,
				name: await usersData.getName(senderID),
				nickname: null,
				inGroup: true,
				count: 1,
				dailyCount: { [today]: 1 }
			});
		}
		else {
			findMember.count += 1;
			if (!findMember.dailyCount) findMember.dailyCount = {};
			findMember.dailyCount[today] = (findMember.dailyCount[today] || 0) + 1;
		}
		await threadsData.set(threadID, members, "members");
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