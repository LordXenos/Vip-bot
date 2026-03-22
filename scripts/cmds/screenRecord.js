const fs = require('fs-extra');
const path = require('path');

module.exports = {
	config: {
		name: "record",
		aliases: ["rec", "screenrecord"],
		version: "5.0",
		author: "Rasin",
		countDown: 10,
		role: 2,
		description: {
			en: "Record a website screen"
		},
		category: "admin",
		guide: {
			en: "{pn} <url> -d <seconds>\n\n"
				+ "Examples:\n"
				+ "{pn} https://fast.com -d 10\n"
				+ "{pn} https://google.com -d 5"
		}
	},

	onStart: async function ({ message, args, event, api }) {
		let puppeteer;
		let browser;
		let page;
		const frames = [];
		let framesDir = "";

		try {
			try {
				puppeteer = require('puppeteer');
			} catch (err) {
				return message.reply("❌ Puppeteer is not installed!\n\nInstall with:\nnpm install puppeteer @ffmpeg-installer/ffmpeg fluent-ffmpeg");
			}

			let ffmpegPath;
			let ffmpeg;
			try {
				ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
				ffmpeg = require('fluent-ffmpeg');
				ffmpeg.setFfmpegPath(ffmpegPath);
			} catch (err) {
				return message.reply("❌ FFmpeg not installed!\n\nInstall with:\nnpm install @ffmpeg-installer/ffmpeg fluent-ffmpeg");
			}

			let url = "";
			let duration = 10;
			let fps = 10;

			if (args[0] && !args[0].startsWith('-')) {
				url = args[0];
			}

			const dIndex = args.indexOf('-d');
			if (dIndex !== -1 && args[dIndex + 1]) {
				duration = parseInt(args[dIndex + 1]) || 10;
			}

			if (!url) {
				return message.reply("Usage: .record <url> -d <seconds>\n\nExample: .record https://fast.com -d 10");
			}

			if (!url.startsWith('http://') && !url.startsWith('https://')) {
				url = 'https://' + url;
			}

			if (duration > 30) duration = 30;
			if (duration < 1) duration = 1;

			const totalFrames = duration * fps;

			const processingMsg = await message.reply(`🎥 Capturing Screen.. Please wait`);
			
			browser = await puppeteer.launch({
				headless: 'new',
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-dev-shm-usage',
					'--disable-web-security',
					'--autoplay-policy=no-user-gesture-required'
				]
			});

			page = await browser.newPage();
			await page.setViewport({ width: 1280, height: 720 });
			await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

			let pageTitle = url;
			try {
				await page.goto(url, { 
					waitUntil: 'domcontentloaded',
					timeout: 40000 
				});
				await new Promise(r => setTimeout(r, 2000));
				pageTitle = await page.title().catch(() => url);
			} catch (err) {
				console.log("Navigation issue, continuing anyway...");
				pageTitle = await page.title().catch(() => url);
			}

			try {
				await api.editMessage(
					`🎥 Capturing Screen... Please wait`,
					processingMsg.messageID
				);
			} catch (e) {}

			const timestamp = Date.now();
			framesDir = path.join(__dirname, 'cache', `frames_${timestamp}`);
			await fs.ensureDir(framesDir);


			const frameDelay = 1000 / fps;
			let capturedFrames = 0;

			for (let i = 0; i < totalFrames; i++) {
				const framePath = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
				
				try {
					await page.screenshot({ 
						path: framePath,
						type: 'png'
					});
					frames.push(framePath);
					capturedFrames++;
				} catch (err) {
					console.error(`Failed to capture frame ${i}:`, err.message);
				}

		
				if (i < totalFrames - 1) {
					await new Promise(resolve => setTimeout(resolve, frameDelay));
				}
			}

	
			await browser.close();
			browser = null;

			if (capturedFrames < 10) {
				throw new Error("Too few frames captured. Recording failed.");
			}

	
			const videoPath = path.join(__dirname, 'cache', `recording_${timestamp}.mp4`);

			await new Promise((resolve, reject) => {
				ffmpeg()
					.input(path.join(framesDir, 'frame_%05d.png'))
					.inputFPS(fps)
					.videoCodec('libx264')
					.outputOptions([
						'-pix_fmt yuv420p',
						'-preset fast',
						'-crf 23'
					])
					.output(videoPath)
					.on('end', () => {
						console.log('Video created successfully');
						resolve();
					})
					.on('error', (err) => {
						console.error('FFmpeg error:', err);
						reject(err);
					})
					.run();
			});

		
			const stats = await fs.stat(videoPath);
			if (stats.size < 1000) {
				throw new Error("Video file is too small");
			}

			
			await message.reply({
				body: ``,
				attachment: fs.createReadStream(videoPath)
			});

			setTimeout(async () => {
				try {
					await fs.remove(framesDir);
					await fs.unlink(videoPath);
				} catch (e) {
					console.error('Cleanup error:', e);
				}
			}, 120000);

		} catch (error) {
			if (browser) {
				await browser.close().catch(() => {});
			}

			if (framesDir) {
				try {
					await fs.remove(framesDir);
				} catch (e) {}
			}

			console.error("Screen Recording Error:", error);

			let errorMsg = "❌ Recording failed!\n\n";

			if (error.message.includes('timeout') || error.message.includes('Timed out')) {
				errorMsg += "Page load timeout\n\nTips:\n• Try a simpler/faster website\n• Check your internet connection\n• Some sites block automation";
			} else if (error.message.includes('Too few frames')) {
				errorMsg += "Failed to capture enough frames\n• Try a different website\n• Check if site is accessible";
			} else if (error.message.includes('net::ERR')) {
				errorMsg += "Cannot reach website\n• Check URL spelling\n• Site might be down";
			} else {
				errorMsg += `Error: ${error.message}`;
			}

			return message.reply(errorMsg);
		}
	}
};

