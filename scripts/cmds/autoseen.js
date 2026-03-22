const fs = require('fs-extra');
const path = require('path');

module.exports = {
	config: {
		name: 'autoseen',
		version: '1.0.0',
		author: 'Rasin',
		countDown: 5,
		role: 2,
		description: 'Turn on/off auto seen for all messages',
		category: 'admin',
		guide: {
			en: '{pn} on | off'
		}
	},

	onStart: async function({ api, event, args, message }) {
		const pathFile = path.join(__dirname, '..', 'cache', 'autoseen.txt');
		
		const cacheDir = path.join(__dirname, '..', 'cache');
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}

		if (!fs.existsSync(pathFile)) {
			fs.writeFileSync(pathFile, 'false');
		}

		try {
			const command = args[0]?.toLowerCase();

			if (command === 'on') {
				fs.writeFileSync(pathFile, 'true');
				return message.reply('✅ Auto seen has been turned ON successfully.');
			} 
			else if (command === 'off') {
				fs.writeFileSync(pathFile, 'false');
				return message.reply('❌ Auto seen has been turned OFF successfully.');
			} 
			else {
				const currentStatus = fs.readFileSync(pathFile, 'utf-8');
				return message.reply(
					`Auto Seen Status\n\n` +
					`Current: ${currentStatus === 'true' ? '✅ ON' : '❌ OFF'}\n\n` +
					`Usage: ${this.config.name} on | off`
				);
			}
		} catch (error) {
			console.error('Auto seen error:', error);
			return message.reply('An error occurred while changing auto seen settings.');
		}
	},

	onChat: async function({ api, event }) {
		const pathFile = path.join(__dirname, '..', 'cache', 'autoseen.txt');
		
		try {
			if (!fs.existsSync(pathFile)) {
				return;
			}

			const data = fs.readFileSync(pathFile, 'utf-8');
			
			if (data === 'true') {
				api.markAsReadAll(() => {});
			}
		} catch (error) {
		}
	}
};