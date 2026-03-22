const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "backup",
        aliases: ["gitpush", "save"],
        version: "1.0",
        author: "Mahi--",
        countDown: 60,
        role: 2,
        shortDescription: { en: "Auto backup bot code to GitHub" },
        longDescription: { en: "Automatically commits and pushes all bot changes (excluding node_modules) to the configured GitHub repository." },
        category: "system",
        guide: { en: "{pn}" }
    },

    onStart: async function ({ message, api, event }) {
        const { threadID, messageID } = event;

        const config = {
            user: "Actually-Shanks",
            email: "rifat654334@gmail.com",
            token: "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",
            repo: "useless",
            repoOwner: "Actually-Shanks"
        };

        const remoteUrl = `https://${config.user}:${config.token}@github.com/${config.repoOwner}/${config.repo}.git`;

        const runCommand = (cmd) => {
            return new Promise((resolve, reject) => {
                exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
                    if (error) {
                        error.message += `\nStderr: ${stderr}`;
                        reject(error);
                        return;
                    }
                    resolve(stdout || stderr);
                });
            });
        };

        const cleanTempFiles = () => {
            const dirsToClean = [
                path.join(process.cwd(), "scripts", "cmds", "temp_phone"),
                path.join(process.cwd(), "temp"),
                path.join(process.cwd(), "cache")
            ];

            dirsToClean.forEach(dir => {
                if (fs.existsSync(dir)) {
                    try {
                        const files = fs.readdirSync(dir);
                        files.forEach(file => {
                            if (file.endsWith('.mp4') || file.endsWith('.png') || file.endsWith('.jpg')) {
                                fs.unlinkSync(path.join(dir, file));
                            }
                        });
                    } catch (e) { }
                }
            });
        };

        api.sendMessage("🔄 Starting backup process...", threadID, messageID);

        try {
            cleanTempFiles();

            const gitignoreContent = `node_modules\n.git\n*.mp4\n*.png\n*.jpg\n*.jpeg\n*.gif\n*.zip\n*.rar\n*.tar\n*.gz\n*.7z\ntemp/\ncache/\nscripts/cmds/temp_phone/\n.homohost/\n.homohost.zip`;
            fs.writeFileSync(path.join(process.cwd(), ".gitignore"), gitignoreContent);

            await runCommand(`git config user.email "${config.email}"`);
            await runCommand(`git config user.name "${config.user}"`);

            if (!fs.existsSync(path.join(process.cwd(), ".git"))) {
                await runCommand("git init");
            }

            await runCommand("git branch -M main");

            try {
                await runCommand(`git remote add origin ${remoteUrl}`);
            } catch (e) {
                await runCommand(`git remote set-url origin ${remoteUrl}`);
            }

            await runCommand("git add .");

            const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

            try {
                await runCommand(`git commit -m "Auto backup: ${timestamp}"`);
            } catch (e) {
                if (e.message.includes("nothing to commit")) {
                    return api.sendMessage("✅ No changes to commit.", threadID, messageID);
                }
            }

            try {
                await runCommand("git push -u origin main --force");
                api.sendMessage("✅ Backup successful! Code pushed to GitHub.", threadID, messageID);
            } catch (pushErr) {
                api.sendMessage("⚠️ Push failed. Re-initializing repo...", threadID, messageID);

                const gitDir = path.join(process.cwd(), ".git");
                if (fs.existsSync(gitDir)) {
                    fs.rmSync(gitDir, { recursive: true, force: true });
                }

                await runCommand("git init");
                await runCommand("git branch -M main");
                await runCommand(`git config user.email "${config.email}"`);
                await runCommand(`git config user.name "${config.user}"`);
                await runCommand(`git remote add origin ${remoteUrl}`);
                await runCommand("git add .");
                await runCommand(`git commit -m "Auto backup (Fresh): ${timestamp}"`);
                await runCommand("git push -u origin main --force");

                api.sendMessage("✅ Backup successful! (Repo re-initialized)", threadID, messageID);
            }

        } catch (err) {
            api.sendMessage(`❌ Backup failed:\n${err.message}`, threadID, messageID);
        }
    }
};
              
