/**
 * @author NTKhang
 * Enhanced GoatBot with Advanced Features
 */

process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const axios = require("axios");
const fs = require("fs-extra");
const google = require("googleapis").google;
const nodemailer = require("nodemailer");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static('public'));
const port = process.env.PORT || 3000;
const { execSync } = require('child_process');
const log = require('./logger/log.js');
const path = require("path");
const os = require('os');

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

// ———————————————— ENHANCED LOGGING SYSTEM ———————————————— //
const activityLogs = [];
const MAX_LOGS = 100;

function addActivityLog(type, message) {
	const logEntry = {
		type,
		message,
		timestamp: new Date().toISOString(),
		time: new Date().toLocaleTimeString()
	};
	activityLogs.unshift(logEntry);
	if (activityLogs.length > MAX_LOGS) activityLogs.pop();
}

// ———————————————— PERFORMANCE METRICS ———————————————— //
const performanceMetrics = {
	requests: 0,
	errors: 0,
	startTime: Date.now(),
	cpuHistory: [],
	memoryHistory: []
};

setInterval(() => {
	const cpuUsage = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(2);
	const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
	
	performanceMetrics.cpuHistory.push(parseFloat(cpuUsage));
	performanceMetrics.memoryHistory.push(memoryUsage);
	
	if (performanceMetrics.cpuHistory.length > 60) performanceMetrics.cpuHistory.shift();
	if (performanceMetrics.memoryHistory.length > 60) performanceMetrics.memoryHistory.shift();
}, 5000);

function validJSON(pathDir) {
	try {
		if (!fs.existsSync(pathDir))
			throw new Error(`File "${pathDir}" not found`);
		execSync(`npx jsonlint "${pathDir}"`, { stdio: 'pipe' });
		return true;
	}
	catch (err) {
		let msgError = err.message;
		msgError = msgError.split("\n").slice(1).join("\n");
		const indexPos = msgError.indexOf("    at");
		msgError = msgError.slice(0, indexPos != -1 ? indexPos - 1 : msgError.length);
		throw new Error(msgError);
	}
}

const { NODE_ENV } = process.env;
const dirConfig = path.normalize(`${__dirname}/config.json`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands.json`);
const dirAccount = path.normalize(`${__dirname}/account.txt`);

for (const pathDir of [dirConfig, dirConfigCommands]) {
	try {
		validJSON(pathDir);
	}
	catch (err) {
		log.error("CONFIG", `Invalid JSON file "${pathDir.replace(__dirname, "")}":\n${err.message.split("\n").map(line => `  ${line}`).join("\n")}\nPlease fix it and restart bot`);
		process.exit(0);
	}
}

const config = require(dirConfig);
if (config.whiteListMode?.whiteListIds && Array.isArray(config.whiteListMode.whiteListIds))
	config.whiteListMode.whiteListIds = config.whiteListMode.whiteListIds.map(id => id.toString());
const configCommands = require(dirConfigCommands);

global.GoatBot = {
	startTime: Date.now() - process.uptime() * 1000,
	commands: new Map(),
	eventCommands: new Map(),
	commandFilesPath: [],
	eventCommandsFilesPath: [],
	aliases: new Map(),
	onFirstChat: [],
	onChat: [],
	onEvent: [],
	onReply: new Map(),
	onReaction: new Map(),
	onAnyEvent: [],
	config,
	configCommands,
	envCommands: {},
	envEvents: {},
	envGlobal: {},
	reLoginBot: function () { },
	Listening: null,
	oldListening: [],
	callbackListenTime: {},
	storage5Message: [],
	fcaApi: null,
	botID: null
};

global.db = {
	allThreadData: [],
	allUserData: [],
	allDashBoardData: [],
	allGlobalData: [],
	threadModel: null,
	userModel: null,
	dashboardModel: null,
	globalModel: null,
	threadsData: null,
	usersData: null,
	dashBoardData: null,
	globalData: null,
	receivedTheFirstMessage: {}
};

global.client = {
	dirConfig,
	dirConfigCommands,
	dirAccount,
	countDown: {},
	cache: {},
	database: {
		creatingThreadData: [],
		creatingUserData: [],
		creatingDashBoardData: [],
		creatingGlobalData: []
	},
	commandBanned: configCommands.commandBanned
};

const utils = require("./utils.js");
global.utils = utils;
const { colors } = utils;

global.temp = {
	createThreadData: [],
	createUserData: [],
	createThreadDataError: [],
	filesOfGoogleDrive: {
		arraybuffer: {},
		stream: {},
		fileNames: {}
	},
	contentScripts: {
		cmds: {},
		events: {}
	}
};

const watchAndReloadConfig = (dir, type, prop, logName) => {
	let lastModified = fs.statSync(dir).mtimeMs;
	let isFirstModified = true;

	fs.watch(dir, (eventType) => {
		if (eventType === type) {
			const oldConfig = global.GoatBot[prop];

			setTimeout(() => {
				try {
					if (isFirstModified) {
						isFirstModified = false;
						return;
					}
					if (lastModified === fs.statSync(dir).mtimeMs) {
						return;
					}
					global.GoatBot[prop] = JSON.parse(fs.readFileSync(dir, 'utf-8'));
					log.success(logName, `Reloaded ${dir.replace(process.cwd(), "")}`);
					addActivityLog('success', `${logName} configuration reloaded`);
				}
				catch (err) {
					log.warn(logName, `Can't reload ${dir.replace(process.cwd(), "")}`);
					global.GoatBot[prop] = oldConfig;
					addActivityLog('error', `Failed to reload ${logName}`);
				}
				finally {
					lastModified = fs.statSync(dir).mtimeMs;
				}
			}, 200);
		}
	});
};

watchAndReloadConfig(dirConfigCommands, 'change', 'configCommands', 'CONFIG COMMANDS');
watchAndReloadConfig(dirConfig, 'change', 'config', 'CONFIG');

global.GoatBot.envGlobal = global.GoatBot.configCommands.envGlobal;
global.GoatBot.envCommands = global.GoatBot.configCommands.envCommands;
global.GoatBot.envEvents = global.GoatBot.configCommands.envEvents;

const getText = global.utils.getText;

// ———————————————— AUTO RESTART ———————————————— //
if (config.autoRestart) {
	const time = config.autoRestart.time;
	if (!isNaN(time) && time > 0) {
		utils.log.info("AUTO RESTART", getText("Goat", "autoRestart1", utils.convertTime(time, true)));
		setTimeout(() => {
			utils.log.info("AUTO RESTART", "Restarting...");
			addActivityLog('warning', 'Auto-restart initiated');
			process.exit(2);
		}, time);
	}
	else if (typeof time == "string" && time.match(/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/gmi)) {
		utils.log.info("AUTO RESTART", getText("Goat", "autoRestart2", time));
		const cron = require("node-cron");
		cron.schedule(time, () => {
			utils.log.info("AUTO RESTART", "Restarting...");
			addActivityLog('warning', 'Scheduled restart initiated');
			process.exit(2);
		});
	}
}

(async () => {
	const { gmailAccount } = config.credentials;
	const { email, clientId, clientSecret, refreshToken } = gmailAccount;
	const OAuth2 = google.auth.OAuth2;
	const OAuth2_client = new OAuth2(clientId, clientSecret);
	OAuth2_client.setCredentials({ refresh_token: refreshToken });
	let accessToken;
	
	try {
		accessToken = await OAuth2_client.getAccessToken();
	}
	catch (err) {
		throw new Error(getText("Goat", "googleApiTokenExpired"));
	}
	
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		service: 'Gmail',
		auth: {
			type: 'OAuth2',
			user: email,
			clientId,
			clientSecret,
			refreshToken,
			accessToken
		}
	});

	async function sendMail({ to, subject, text, html, attachments }) {
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			service: 'Gmail',
			auth: {
				type: 'OAuth2',
				user: email,
				clientId,
				clientSecret,
				refreshToken,
				accessToken
			}
		});
		const mailOptions = {
			from: email,
			to,
			subject,
			text,
			html,
			attachments
		};
		const info = await transporter.sendMail(mailOptions);
		return info;
	}

	global.utils.sendMail = sendMail;
	global.utils.transporter = transporter;

	const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
	const currentVersion = require("./package.json").version;
	if (compareVersion(version, currentVersion) === 1) {
		utils.log.master("NEW VERSION", getText(
			"Goat",
			"newVersionDetected",
			colors.gray(currentVersion),
			colors.hex("#eb6a07", version),
			colors.hex("#eb6a07", "node update")
		));
		addActivityLog('info', `New version available: ${version}`);
	}

	const parentIdGoogleDrive = await utils.drive.checkAndCreateParentFolder("GoatBot");
	utils.drive.parentID = parentIdGoogleDrive;
	
	require(`./bot/login/login.js`);
})();

function compareVersion(version1, version2) {
	const v1 = version1.split(".");
	const v2 = version2.split(".");
	for (let i = 0; i < 3; i++) {
		if (parseInt(v1[i]) > parseInt(v2[i]))
			return 1;
		if (parseInt(v1[i]) < parseInt(v2[i]))
			return -1;
	}
	return 0;
}

// ———————————————— ENHANCED API ENDPOINTS ———————————————— //

// Middleware for logging requests
app.use((req, res, next) => {
	performanceMetrics.requests++;
	addActivityLog('info', `${req.method} ${req.path}`);
	next();
});

// Main dashboard
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

// Appstate management
app.get('/appstate', (req, res) => {
	res.sendFile(__dirname + '/public/appstate.html');
});

// System statistics API
app.get("/api/stats", (req, res) => {
	const uptime = process.uptime();
	const hours = Math.floor(uptime / 3600);
	const minutes = Math.floor((uptime % 3600) / 60);
	
	res.json({
		cpu: (os.loadavg()[0] * 100 / os.cpus().length).toFixed(2),
		memoryUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
		memoryTotal: Math.round(os.totalmem() / 1024 / 1024),
		freeMem: Math.round(os.freemem() / 1024 / 1024),
		uptime: `${hours}h ${minutes}m`,
		platform: os.platform(),
		nodeVersion: process.version,
		arch: os.arch(),
		cpuCores: os.cpus().length,
		performanceMetrics: {
			requests: performanceMetrics.requests,
			errors: performanceMetrics.errors,
			cpuHistory: performanceMetrics.cpuHistory,
			memoryHistory: performanceMetrics.memoryHistory
		}
	});
});

// NEW: Activity logs API
app.get("/api/logs", (req, res) => {
	const limit = parseInt(req.query.limit) || 50;
	res.json({
		logs: activityLogs.slice(0, limit),
		total: activityLogs.length
	});
});


app.get("/api/metrics", (req, res) => {
	res.json({
		uptime: process.uptime(),
		requests: performanceMetrics.requests,
		errors: performanceMetrics.errors,
		cpuHistory: performanceMetrics.cpuHistory,
		memoryHistory: performanceMetrics.memoryHistory,
		avgCpu: performanceMetrics.cpuHistory.length > 0 
			? (performanceMetrics.cpuHistory.reduce((a, b) => a + b, 0) / performanceMetrics.cpuHistory.length).toFixed(2)
			: 0,
		avgMemory: performanceMetrics.memoryHistory.length > 0
			? Math.round(performanceMetrics.memoryHistory.reduce((a, b) => a + b, 0) / performanceMetrics.memoryHistory.length)
			: 0
	});
});


app.get("/api/health", (req, res) => {
	const health = {
		status: 'healthy',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		memory: {
			used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
			total: Math.round(os.totalmem() / 1024 / 1024),
			percentage: ((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(2)
		},
		cpu: {
			usage: (os.loadavg()[0] * 100 / os.cpus().length).toFixed(2),
			cores: os.cpus().length
		}
	};
	

	if (health.memory.percentage > 90 || health.cpu.usage > 90) {
		health.status = 'warning';
	}
	
	res.json(health);
});


app.post("/api/restart", (req, res) => {
	addActivityLog('warning', 'Manual restart requested');
	res.json({ message: "Bot is restarting..." });
	setTimeout(() => {
		process.exit(2);
	}, 1000);
});


app.post("/api/appstate", (req, res) => {
	const { appstate } = req.body;
	if (!appstate) {
		performanceMetrics.errors++;
		addActivityLog('error', 'Appstate update failed: No data provided');
		return res.status(400).json({ error: "Appstate is required" });
	}

	fs.writeFile('account.txt', appstate, (err) => {
		if (err) {
			performanceMetrics.errors++;
			console.error("Error saving appstate:", err);
			addActivityLog('error', 'Failed to save appstate');
			return res.status(500).json({ error: "Failed to save appstate" });
		}

		fs.readFile('account.txt', 'utf8', (readErr, data) => {
			if (readErr || !data) {
				performanceMetrics.errors++;
				addActivityLog('error', 'Failed to verify appstate');
				return res.status(500).json({ error: "Failed to verify appstate" });
			}

			addActivityLog('success', 'Appstate updated successfully');
			res.json({ success: true });

			log.info("Restarting system after appstate update...");
			setTimeout(() => {
				process.exit(2);
			}, 1000);
		});
	});
});


app.post("/api/logs/clear", (req, res) => {
	activityLogs.length = 0;
	addActivityLog('info', 'Activity logs cleared');
	res.json({ success: true, message: 'Logs cleared' });
});


app.get("/api/export", (req, res) => {
	const report = {
		timestamp: new Date().toISOString(),
		system: {
			platform: os.platform(),
			arch: os.arch(),
			nodeVersion: process.version,
			uptime: process.uptime()
		},
		performance: {
			requests: performanceMetrics.requests,
			errors: performanceMetrics.errors,
			cpuHistory: performanceMetrics.cpuHistory,
			memoryHistory: performanceMetrics.memoryHistory
		},
		recentLogs: activityLogs.slice(0, 20)
	};
	
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Disposition', `attachment; filename=goatbot-report-${Date.now()}.json`);
	res.json(report);
});


app.use((err, req, res, next) => {
	performanceMetrics.errors++;
	addActivityLog('error', `Server error: ${err.message}`);
	console.error(err.stack);
	res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
	console.log(`Bot is running on port ${port}`);
	addActivityLog('success', `Server started on port ${port}`);
});