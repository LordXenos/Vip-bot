const fs = require("fs-extra");
const path = require("path");
const { OpenAI } = require("openai");
const moment = require('moment-timezone');
const nullAndUndefined = [undefined, null];

let aiClient = null;
let conversationHistory = {};
const aiMessageTracker = new Map();

function initializeAI(config) {
	if (!config.rasinAI?.apiKey) {
		console.warn("Hugging Face API key not found in config.json");
		return;
	}
	
	try {
		aiClient = new OpenAI({
			baseURL: "https://router.huggingface.co/v1",
			apiKey: config.rasinAI.apiKey,
		});
	} catch (err) {
		console.error("❌ Failed to initialize AI client:", err.message);
	}
}

async function getReplyx(userMessage, userId, botName = "GoatBot V3") {
	if (!aiClient) return null;
	
	if (!conversationHistory[userId]) {
		conversationHistory[userId] = [];
	}
	
	const promptx = `You are GoatBot AI, an advanced assistant for a Facebook Messenger chatbot. Be friendly, helpful, and conversational. You can understand and respond in English`;

	conversationHistory[userId].push({ role: "user", content: userMessage });
	
	if (conversationHistory[userId].length > 10) {
		conversationHistory[userId] = conversationHistory[userId].slice(-10);
	}
	
	try {
		const chatCompletion = await aiClient.chat.completions.create({
			model: "meta-llama/Llama-3.1-8B-Instruct",
			messages: [
				{ role: "system", content: promptx },
				...conversationHistory[userId]
			],
			temperature: 0.7,
			max_tokens: 500,
		});
		
		const response = chatCompletion.choices[0].message.content;
		conversationHistory[userId].push({ role: "assistant", content: response });
		
		return response;
	} catch (err) {
		console.error("AI Error:", err.response?.data || err.message);
		return null;
	}
}

function clearUserHistory(userId) {
	delete conversationHistory[userId];
}

global.goatAI = {
	getResponse: getReplyx,
	clearHistory: clearUserHistory,
	isAvailable: () => aiClient !== null,
	trkMsg: (messageID, userId) => {
		aiMessageTracker.set(messageID, { userId, timestamp: Date.now() });
	},
	isAIMessage: (messageID) => aiMessageTracker.has(messageID)
};

let bioInitialized = false;

function initializeAutoBio(api, config) {
	if (bioInitialized) return;
	
	if (!config.autoBio?.enabled) {
		return;
	}

	const { bio } = config.autoBio;
	
	if (!bio || typeof bio !== 'string') {
		console.warn("⚠️ Bio text not configured in config.json");
		return;
	}
	
	bioInitialized = true;

	function processBio(bioText, config) {
		const timeZone = config.timeZone || 'Asia/Dhaka';
		const now = moment().tz(timeZone);
		
		return bioText
			.replace(/\{time\}/g, now.format('HH:mm:ss'))
			.replace(/\{date\}/g, now.format('DD/MM/YYYY'))
			.replace(/\{day\}/g, now.format('dddd'))
			.replace(/\{botName\}/g, config.nickNameBot || 'GoatBot')
			.replace(/\{prefix\}/g, config.prefix || '!');
	}

	(async () => {
		try {
			const processedBio = processBio(bio, config);
			await api.changeBio(processedBio, false);
			console.log(`✅ Bio updated`);
		} catch (err) {
			console.error("❌ Failed to update bio:", err.message);
		}
	})();
}

global.botBioSystem = {
	toggle: (api, config) => {
		config.autoBio.enabled = !config.autoBio.enabled;
		if (config.autoBio.enabled) {
			bioInitialized = false;
			initializeAutoBio(api, config);
		} else {
			if (bioUpdateInterval) {
				clearInterval(bioUpdateInterval);
				bioUpdateInterval = null;
				bioInitialized = false;
			}
		}
		return config.autoBio.enabled;
	},
	getStatus: (config) => config.autoBio?.enabled || false,
	updateNow: async (api, config) => {
		if (!config.autoBio?.bio) return false;
		try {
			const timeZone = config.timeZone || 'Asia/Dhaka';
			const now = moment().tz(timeZone);
			const processedBio = config.autoBio.bio
				.replace(/\{time\}/g, now.format('HH:mm:ss'))
				.replace(/\{date\}/g, now.format('DD/MM/YYYY'))
				.replace(/\{day\}/g, now.format('dddd'))
				.replace(/\{botName\}/g, config.nickNameBot || 'GoatBot')
				.replace(/\{prefix\}/g, config.prefix || '!');
			await api.changeBio(processedBio, false);
			return true;
		} catch (err) {
			console.error("Failed to update bio:", err);
			return false;
		}
	},
	restart: (api, config) => {
		if (bioUpdateInterval) {
			clearInterval(bioUpdateInterval);
			bioUpdateInterval = null;
		}
		bioInitialized = false;
		if (config.autoBio?.enabled) {
			initializeAutoBio(api, config);
		}
	}
};

function getType(obj) {
	return Object.prototype.toString.call(obj).slice(8, -1);
}

function getRole(threadData, senderID) {
	const adminBot = global.GoatBot.config.adminBot || [];
	if (!senderID)
		return 0;
	const adminBox = threadData ? threadData.adminIDs || [] : [];
	return adminBot.includes(senderID) ? 2 : adminBox.includes(senderID) ? 1 : 0;
}

function getText(type, reason, time, targetID, lang) {
	const utils = global.utils;
	if (type == "userBanned")
		return utils.getText({ lang, head: "handlerEvents" }, "userBanned", reason, time, targetID);
	else if (type == "threadBanned")
		return utils.getText({ lang, head: "handlerEvents" }, "threadBanned", reason, time, targetID);
	else if (type == "onlyAdminBox")
		return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBox");
	else if (type == "onlyAdminBot")
		return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBot");
}

function replaceShortcutInLang(text, prefix, commandName) {
	return text
		.replace(/\{(?:p|prefix)\}/g, prefix)
		.replace(/\{(?:n|name)\}/g, commandName)
		.replace(/\{pn\}/g, `${prefix}${commandName}`);
}

function getRoleConfig(utils, command, isGroup, threadData, commandName) {
	let roleConfig;
	if (utils.isNumber(command.config.role)) {
		roleConfig = {
			onStart: command.config.role
		};
	}
	else if (typeof command.config.role == "object" && !Array.isArray(command.config.role)) {
		if (!command.config.role.onStart)
			command.config.role.onStart = 0;
		roleConfig = command.config.role;
	}
	else {
		roleConfig = {
			onStart: 0
		};
	}

	if (isGroup)
		roleConfig.onStart = threadData.data.setRole?.[commandName] ?? roleConfig.onStart;

	for (const key of ["onChat", "onStart", "onReaction", "onReply"]) {
		if (roleConfig[key] == undefined)
			roleConfig[key] = roleConfig.onStart;
	}

	return roleConfig;
}

function isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, lang) {
	const config = global.GoatBot.config;
	const { adminBot, hideNotiMessage } = config;

	const infoBannedUser = userData.banned;
	if (infoBannedUser.status == true) {
		const { reason, date } = infoBannedUser;
		if (hideNotiMessage.userBanned == false)
			message.reply(getText("userBanned", reason, date, senderID, lang));
		return true;
	}

	if (
		config.adminOnly.enable == true
		&& !adminBot.includes(senderID)
		&& !config.adminOnly.ignoreCommand.includes(commandName)
	) {
		if (hideNotiMessage.adminOnly == false)
			message.reply(getText("onlyAdminBot", null, null, null, lang));
		return true;
	}

	if (isGroup == true) {
		if (
			threadData.data.onlyAdminBox === true
			&& !threadData.adminIDs.includes(senderID)
			&& !(threadData.data.ignoreCommanToOnlyAdminBox || []).includes(commandName)
		) {
			if (!threadData.data.hideNotiMessageOnlyAdminBox)
				message.reply(getText("onlyAdminBox", null, null, null, lang));
			return true;
		}

		const infoBannedThread = threadData.banned;
		if (infoBannedThread.status == true) {
			const { reason, date } = infoBannedThread;
			if (hideNotiMessage.threadBanned == false)
				message.reply(getText("threadBanned", reason, date, threadID, lang));
			return true;
		}
	}
	return false;
}

function createGetText2(langCode, pathCustomLang, prefix, command) {
	const commandType = command.config.countDown ? "command" : "command event";
	const commandName = command.config.name;
	let customLang = {};
	let getText2 = () => { };
	if (fs.existsSync(pathCustomLang))
		customLang = require(pathCustomLang)[commandName]?.text || {};
	if (command.langs || customLang || {}) {
		getText2 = function (key, ...args) {
			let lang = command.langs?.[langCode]?.[key] || customLang[key] || "";
			lang = replaceShortcutInLang(lang, prefix, commandName);
			for (let i = args.length - 1; i >= 0; i--)
				lang = lang.replace(new RegExp(`%${i + 1}`, "g"), args[i]);
			return lang || `❌ Can't find text on language "${langCode}" for ${commandType} "${commandName}" with key "${key}"`;
		};
	}
	return getText2;
}

module.exports = function (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) {
	initializeAI(global.GoatBot.config);
	initializeAutoBio(api, global.GoatBot.config);
	
	return async function (event, message) {

		const { utils, client, GoatBot } = global;
		const { getPrefix, removeHomeDir, log, getTime } = utils;
		const { config, configCommands: { envGlobal, envCommands, envEvents } } = GoatBot;
		const { autoRefreshThreadInfoFirstTime } = config.database;
		let { hideNotiMessage = {} } = config;

		const { body, messageID, threadID, isGroup } = event;

		if (!threadID)
			return;

		try {
    api.markAsReadAll((err) => {
        if (err) console.error("markAsReadAll error:", err);
    });
} catch (err) {
    // Silently ignore errors
}


		const senderID = event.userID || event.senderID || event.author;

		let threadData = global.db.allThreadData.find(t => t.threadID == threadID);
		let userData = global.db.allUserData.find(u => u.userID == senderID);

		if (!userData && !isNaN(senderID))
			userData = await usersData.create(senderID);

		if (!threadData && !isNaN(threadID)) {
			if (global.temp.createThreadDataError.includes(threadID))
				return;
			threadData = await threadsData.create(threadID);
			global.db.receivedTheFirstMessage[threadID] = true;
		}
		else {
			if (
				autoRefreshThreadInfoFirstTime === true
				&& !global.db.receivedTheFirstMessage[threadID]
			) {
				global.db.receivedTheFirstMessage[threadID] = true;
				await threadsData.refreshInfo(threadID);
			}
		}

		if (typeof threadData.settings.hideNotiMessage == "object")
			hideNotiMessage = threadData.settings.hideNotiMessage;

		const prefix = getPrefix(threadID);
		const role = getRole(threadData, senderID);
		
		const parameters = {
			api, usersData, threadsData, message, event,
			userModel, threadModel, prefix, dashBoardModel,
			globalModel, dashBoardData, globalData, envCommands,
			envEvents, envGlobal, role,
			removeCommandNameFromBody: function removeCommandNameFromBody(body_, prefix_, commandName_) {
				if ([body_, prefix_, commandName_].every(x => nullAndUndefined.includes(x)))
					throw new Error("Please provide body, prefix and commandName to use this function, this function without parameters only support for onStart");
				for (let i = 0; i < arguments.length; i++)
					if (typeof arguments[i] != "string")
						throw new Error(`The parameter "${i + 1}" must be a string, but got "${getType(arguments[i])}"`);

				return body_.replace(new RegExp(`^${prefix_}(\\s+|)${commandName_}`, "i"), "").trim();
			}
		};
		const langCode = threadData.data.lang || config.language || "en";

		function createMessageSyntaxError(commandName) {
			message.SyntaxError = async function () {
				return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "commandSyntaxError", prefix, commandName));
			};
		}

		function findCommand(input, prefix) {
			if (!input) return null;

			let commandName = "";
			let args = [];
			let usedPrefix = false;
			let bodyWithoutCommand = "";

			if (input.startsWith(prefix)) {
				usedPrefix = true;
				const argsArray = input.slice(prefix.length).trim().split(/ +/);
				commandName = argsArray.shift().toLowerCase();
				args = argsArray;
				bodyWithoutCommand = input.replace(new RegExp(`^${prefix}(\\s+|)${commandName}`, "i"), "").trim();
			} else {
				const argsArray = input.trim().split(/ +/);
				commandName = argsArray.shift().toLowerCase();
				args = argsArray;
				bodyWithoutCommand = input.replace(new RegExp(`^${commandName}`, "i"), "").trim();
			}

			let command = GoatBot.commands.get(commandName) || GoatBot.commands.get(GoatBot.aliases.get(commandName));
			
			if (!command) {
				const aliasesData = threadData.data.aliases || {};
				for (const cmdName in aliasesData) {
					if (aliasesData[cmdName].includes(commandName)) {
						command = GoatBot.commands.get(cmdName);
						break;
					}
				}
			}

			if (!command) return null;

			const requiresPrefix = command.config.prefix !== false;

			if (requiresPrefix && !usedPrefix) return null;

			return {
				command,
				commandName: command.config.name,
				args,
				usedPrefix,
				bodyWithoutCommand
			};
		}

		let isUserCallCommand = false;
		async function onStart() {
			if (!body)
				return;
			
			const dateNow = Date.now();
			
			const commandInfo = findCommand(body, prefix);
			
			if (!commandInfo) {
				if (body.startsWith(prefix) && !hideNotiMessage.commandNotFound) {
					const args = body.slice(prefix.length).trim().split(/ +/);
					const inputCommandName = args.shift().toLowerCase();
					return await message.reply(
						inputCommandName ?
							utils.getText({ lang: langCode, head: "handlerEvents" }, "commandNotFound", inputCommandName, prefix) :
							utils.getText({ lang: langCode, head: "handlerEvents" }, "commandNotFound2", prefix)
					);
				}
				return;
			}

			const { command, commandName, args, usedPrefix, bodyWithoutCommand } = commandInfo;

			function removeCommandNameFromBody(body_, prefix_, commandName_) {
				if (arguments.length) {
					if (typeof body_ != "string")
						throw new Error(`The first argument (body) must be a string, but got "${getType(body_)}"`);
					if (typeof prefix_ != "string")
						throw new Error(`The second argument (prefix) must be a string, but got "${getType(prefix_)}"`);
					if (typeof commandName_ != "string")
						throw new Error(`The third argument (commandName) must be a string, but got "${getType(commandName_)}"`);

					if (body_.startsWith(prefix_)) {
						return body_.replace(new RegExp(`^${prefix_}(\\s+|)${commandName_}`, "i"), "").trim();
					} else {
						return body_.replace(new RegExp(`^${commandName_}`, "i"), "").trim();
					}
				}
				else {
					return bodyWithoutCommand;
				}
			}
			
			if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
				return;
				
			const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
			const needRole = roleConfig.onStart;

			if (needRole > role) {
				if (!hideNotiMessage.needRoleToUseCmd) {
					if (needRole == 1)
						return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdmin", commandName));
					else if (needRole == 2)
						return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminBot2", commandName));
				}
				else {
					return true;
				}
			}
			
			if (!client.countDown[commandName])
				client.countDown[commandName] = {};
			const timestamps = client.countDown[commandName];
			let getCoolDown = command.config.countDown;
			if (!getCoolDown && getCoolDown != 0 || isNaN(getCoolDown))
				getCoolDown = 1;
			const cooldownCommand = getCoolDown * 1000;
			if (timestamps[senderID]) {
				const expirationTime = timestamps[senderID] + cooldownCommand;
				if (dateNow < expirationTime)
					return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "waitingForCommand", ((expirationTime - dateNow) / 1000).toString().slice(0, 3)));
			}
			
			const time = getTime("DD/MM/YYYY HH:mm:ss");
			isUserCallCommand = true;
			try {
				(async () => {
					const analytics = await globalData.get("analytics", "data", {});
					if (!analytics[commandName])
						analytics[commandName] = 0;
					analytics[commandName]++;
					await globalData.set("analytics", analytics, "data");
				})();

				createMessageSyntaxError(commandName);
				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
				await command.onStart({
					...parameters,
					args,
					commandName,
					getLang: getText2,
					removeCommandNameFromBody
				});
				timestamps[senderID] = dateNow;
				log.info("CALL COMMAND", `${commandName} | ${userData.name} | ${senderID} | ${threadID} | ${args.join(" ")}`);
			}
			catch (err) {
				log.err("CALL COMMAND", `An error occurred when calling the command ${commandName}`, err);
				return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
			}
		}


async function onChat() {
	const allOnChat = GoatBot.onChat || [];
	const args = body ? body.split(/ +/) : [];
	
	if (body && !event.messageReply && config.aiAssistant?.enabled && aiClient) {
		const goatAI = config.aiAssistant?.goatAI || [];
		
		const messageWords = body.trim().toLowerCase().split(/\s+/);
		const firstWord = messageWords[0];
		
		const shouldRespond = goatAI.some(word => 
			word.toLowerCase() === firstWord
		);

		if (shouldRespond) {
			let thinkingMsg;
			let typingInterval;

			try {
				thinkingMsg = await message.reply("𝗚𝗼𝗮𝘁𝗕𝗼𝘁 𝗔𝗜 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴.");

				const dots = [
					"𝗚𝗼𝗮𝘁𝗕𝗼𝘁 𝗔𝗜 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴..",
					"𝗚𝗼𝗮𝘁𝗕𝗼𝘁 𝗔𝗜 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴..."
				];
				let i = 0;

				typingInterval = setInterval(() => {
					try {
						api.editMessage(dots[i % dots.length], thinkingMsg.messageID);
					} catch (e) {}
					i++;
				}, 700);

				const userQuery = messageWords.slice(1).join(' ') || body;
				
				const aiResponse = await getReplyx(
					userQuery,
					senderID,
					config.botName || "GoatBot v3"
				);

				clearInterval(typingInterval);

				if (aiResponse) {
					try {
						await api.editMessage(
							`𝗚𝗢𝗔𝗧𝗕𝗢𝗧 𝗔𝗜\n─────────\n\n${aiResponse}`,
							thinkingMsg.messageID
						);
						global.goatAI.trkMsg(thinkingMsg.messageID, senderID);
					} catch (e) {
						const sent = await message.reply(
							`𝗚𝗢𝗔𝗧𝗕𝗢𝗧 𝗔𝗜\n─────────\n\n${aiResponse}`
						);
						if (sent?.messageID) {
							global.goatAI.trkMsg(sent.messageID, senderID);
						}
					}
					return;
				}
			} catch (err) {
				if (typingInterval) clearInterval(typingInterval);
				console.error("AI Chat Error:", err);
			}
		}
	}

	for (const key of allOnChat) {
		const command = GoatBot.commands.get(key);
		if (!command)
			continue;
		const commandName = command.config.name;

		const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
		const needRole = roleConfig.onChat;
		if (needRole > role)
			continue;

		const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
		const time = getTime("DD/MM/YYYY HH:mm:ss");
		createMessageSyntaxError(commandName);

		if (getType(command.onChat) == "Function") {
			const defaultOnChat = command.onChat;
			command.onChat = async function () {
				return defaultOnChat(...arguments);
			};
		}

		command.onChat({
			...parameters,
			isUserCallCommand,
			args,
			commandName,
			getLang: getText2
		})
			.then(async (handler) => {
				if (typeof handler == "function") {
					if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
						return;
					try {
						await handler();
						log.info("onChat", `${commandName} | ${userData.name} | ${senderID} | ${threadID} | ${args.join(" ")}`);
					}
					catch (err) {
						await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred2", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
					}
				}
			})
			.catch(err => {
				log.err("onChat", `An error occurred when calling the command onChat ${commandName}`, err);
			});
	}
}


		async function onAnyEvent() {
			const allOnAnyEvent = GoatBot.onAnyEvent || [];
			let args = [];
			if (typeof event.body == "string" && event.body.startsWith(prefix))
				args = event.body.split(/ +/);

			for (const key of allOnAnyEvent) {
				if (typeof key !== "string")
					continue;
				const command = GoatBot.commands.get(key);
				if (!command)
					continue;
				const commandName = command.config.name;
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				createMessageSyntaxError(commandName);

				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/events/${langCode}.js`, prefix, command);

				if (getType(command.onAnyEvent) == "Function") {
					const defaultOnAnyEvent = command.onAnyEvent;
					command.onAnyEvent = async function () {
						return defaultOnAnyEvent(...arguments);
					};
				}

				command.onAnyEvent({
					...parameters,
					args,
					commandName,
					getLang: getText2
				})
					.then(async (handler) => {
						if (typeof handler == "function") {
							try {
								await handler();
								log.info("onAnyEvent", `${commandName} | ${senderID} | ${userData.name} | ${threadID}`);
							}
							catch (err) {
								message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred7", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
								log.err("onAnyEvent", `An error occurred when calling the command onAnyEvent ${commandName}`, err);
							}
						}
					})
					.catch(err => {
						log.err("onAnyEvent", `An error occurred when calling the command onAnyEvent ${commandName}`, err);
					});
			}
		}

		async function onFirstChat() {
			const allOnFirstChat = GoatBot.onFirstChat || [];
			const args = body ? body.split(/ +/) : [];

			for (const itemOnFirstChat of allOnFirstChat) {
				const { commandName, threadIDsChattedFirstTime } = itemOnFirstChat;
				if (threadIDsChattedFirstTime.includes(threadID))
					continue;
				const command = GoatBot.commands.get(commandName);
				if (!command)
					continue;

				itemOnFirstChat.threadIDsChattedFirstTime.push(threadID);
				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				createMessageSyntaxError(commandName);

				if (getType(command.onFirstChat) == "Function") {
					const defaultOnFirstChat = command.onFirstChat;
					command.onFirstChat = async function () {
						return defaultOnFirstChat(...arguments);
					};
				}

				command.onFirstChat({
					...parameters,
					isUserCallCommand,
					args,
					commandName,
					getLang: getText2
				})
					.then(async (handler) => {
						if (typeof handler == "function") {
							if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
								return;
							try {
								await handler();
								log.info("onFirstChat", `${commandName} | ${userData.name} | ${senderID} | ${threadID} | ${args.join(" ")}`);
							}
							catch (err) {
								await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred2", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
							}
						}
					})
					.catch(err => {
						log.err("onFirstChat", `An error occurred when calling the command onFirstChat ${commandName}`, err);
					});
			}
		}

		async function onReply() {
			if (!event.messageReply)
				return;
			
			const repMsgID = event.messageReply.messageID;
		if (global.goatAI.isAIMessage(repMsgID) && body && aiClient) {
	let thinkingMsg;
	let typingInterval;

	try {
		thinkingMsg = await message.reply("𝗚𝗼𝗮𝘁𝗕𝗼𝘁 𝗔𝗜 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴.");

		const dots = ["𝗚𝗼𝗮𝘁𝗕𝗼𝘁 𝗔𝗜 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴..",
		              "𝗚𝗼𝗮𝘁𝗕𝗼𝘁 𝗔𝗜 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴..."];
		let i = 0;

		typingInterval = setInterval(() => {
			if (!thinkingMsg?.messageID) return;

			try {
				api.editMessage(dots[i % dots.length], thinkingMsg.messageID);
			} catch (e) {
			}
			i++;
		}, 700);

		const aiResponse = await getReplyx(
			body,
			senderID,
			config.botName || "GoatBot v3"
		);

		clearInterval(typingInterval);

		if (aiResponse) {
			try {
				await api.editMessage(
					`𝗚𝗢𝗔𝗧𝗕𝗢𝗧 𝗔𝗜\n─────────\n\n${aiResponse}`,
					thinkingMsg.messageID
				);
				global.goatAI.trkMsg(thinkingMsg.messageID, senderID);
			} catch (e) {
				const sent = await message.reply(
					`𝗚𝗢𝗔𝗧𝗕𝗢𝗧 𝗔𝗜\n─────────\n\n${aiResponse}`
				);
				if (sent?.messageID) {
					global.goatAI.trkMsg(sent.messageID, senderID);
				}
			}
		}
		return;

	} catch (err) {
		if (typingInterval) clearInterval(typingInterval);
		console.error("AI onReply Error:", err);
	}
}



			
			const { onReply } = GoatBot;
			const Reply = onReply.get(event.messageReply.messageID);
			if (!Reply)
				return;
			Reply.delete = () => onReply.delete(messageID);
			const commandName = Reply.commandName;
			if (!commandName) {
				message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "cannotFindCommandName"));
				return log.err("onReply", `Can't find command name to execute this reply!`, Reply);
			}
			const command = GoatBot.commands.get(commandName);
			if (!command) {
				message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "cannotFindCommand", commandName));
				return log.err("onReply", `Command "${commandName}" not found`, Reply);
			}

			const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
			const needRole = roleConfig.onReply;
			if (needRole > role) {
				if (!hideNotiMessage.needRoleToUseCmdOnReply) {
					if (needRole == 1)
						return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminToUseOnReply", commandName));
					else if (needRole == 2)
						return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminBot2ToUseOnReply", commandName));
				}
				else {
					return true;
				}
			}

			const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
			const time = getTime("DD/MM/YYYY HH:mm:ss");
			try {
				if (!command)
					throw new Error(`Cannot find command with commandName: ${commandName}`);
				const args = body ? body.split(/ +/) : [];
				createMessageSyntaxError(commandName);
				if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
					return;
				await command.onReply({
					...parameters,
					Reply,
					args,
					commandName,
					getLang: getText2
				});
				log.info("onReply", `${commandName} | ${userData.name} | ${senderID} | ${threadID} | ${args.join(" ")}`);
			}
			catch (err) {
				log.err("onReply", `An error occurred when calling the command onReply ${commandName}`, err);
				await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred3", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
			}
		}

		async function onReaction() {
			const { onReaction } = GoatBot;
			const Reaction = onReaction.get(messageID);
			if (!Reaction)
				return;
			Reaction.delete = () => onReaction.delete(messageID);
			const commandName = Reaction.commandName;
			if (!commandName) {
				message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "cannotFindCommandName"));
				return log.err("onReaction", `Can't find command name to execute this reaction!`, Reaction);
			}
			const command = GoatBot.commands.get(commandName);
			if (!command) {
				message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "cannotFindCommand", commandName));
				return log.err("onReaction", `Command "${commandName}" not found`, Reaction);
			}

			const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
			const needRole = roleConfig.onReaction;
			if (needRole > role) {
				if (!hideNotiMessage.needRoleToUseCmdOnReaction) {
					if (needRole == 1)
						return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminToUseOnReaction", commandName));
					else if (needRole == 2)
						return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminBot2ToUseOnReaction", commandName));
				}
				else {
					return true;
				}
			}

			const time = getTime("DD/MM/YYYY HH:mm:ss");
			try {
				if (!command)
					throw new Error(`Cannot find command with commandName: ${commandName}`);
				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
				const args = [];
				createMessageSyntaxError(commandName);
				if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
					return;
				await command.onReaction({
					...parameters,
					Reaction,
					args,
					commandName,
					getLang: getText2
				});
				log.info("onReaction", `${commandName} | ${userData.name} | ${senderID} | ${threadID} | ${event.reaction}`);
			}
			catch (err) {
				log.err("onReaction", `An error occurred when calling the command onReaction ${commandName}`, err);
				await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred4", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
			}
		}

		async function handlerEvent() {
			const { author } = event;
			const allEventCommand = GoatBot.eventCommands.entries();
			for (const [key] of allEventCommand) {
				const getEvent = GoatBot.eventCommands.get(key);
				if (!getEvent)
					continue;
				const commandName = getEvent.config.name;
				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/events/${langCode}.js`, prefix, getEvent);
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				try {
					const handler = await getEvent.onStart({
						...parameters,
						commandName,
						getLang: getText2
					});
					if (typeof handler == "function") {
						await handler();
						log.info("EVENT COMMAND", `Event: ${commandName} | ${author} | ${userData.name} | ${threadID}`);
					}
				}
				catch (err) {
					log.err("EVENT COMMAND", `An error occurred when calling the command event ${commandName}`, err);
					await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred5", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
				}
			}
		}

		async function onEvent() {
			const allOnEvent = GoatBot.onEvent || [];
			const args = [];
			const { author } = event;
			for (const key of allOnEvent) {
				if (typeof key !== "string")
					continue;
				const command = GoatBot.commands.get(key);
				if (!command)
					continue;
				const commandName = command.config.name;
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				createMessageSyntaxError(commandName);

				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/events/${langCode}.js`, prefix, command);

				if (getType(command.onEvent) == "Function") {
					const defaultOnEvent = command.onEvent;
					command.onEvent = async function () {
						return defaultOnEvent(...arguments);
					};
				}

				command.onEvent({
					...parameters,
					args,
					commandName,
					getLang: getText2
				})
					.then(async (handler) => {
						if (typeof handler == "function") {
							try {
								await handler();
								log.info("onEvent", `${commandName} | ${author} | ${userData.name} | ${threadID}`);
							}
							catch (err) {
								message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred6", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
								log.err("onEvent", `An error occurred when calling the command onEvent ${commandName}`, err);
							}
						}
					})
					.catch(err => {
						log.err("onEvent", `An error occurred when calling the command onEvent ${commandName}`, err);
					});
			}
		}

		async function presence() {
			// Your code here
		}

		async function read_receipt() {
			// Your code here
		}

		async function typ() {
			// Your code here
		}

		return {
			onAnyEvent,
			onFirstChat,
			onChat,
			onStart,
			onReaction,
			onReply,
			onEvent,
			handlerEvent,
			presence,
			read_receipt,
			typ
		};
	};
};