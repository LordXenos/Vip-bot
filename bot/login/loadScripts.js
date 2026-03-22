const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs-extra");
const path = require("path");
const exec = (cmd, options) => new Promise((resolve, reject) => {
    require("child_process").exec(cmd, options, (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout);
    });
});
const { log, loading, getText, removeHomeDir } = global.utils;
const chalk = require("chalk");
const { GoatBot } = global;
const { configCommands } = GoatBot;
const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
const packageAlready = [];
const spinner = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
let count = 0;

const gradient = [chalk.hex("#00F5FF"), chalk.hex("#FF00FF"), chalk.hex("#FFD700")];

function gradientText(text) {
    return text.split('').map((c, i) => gradient[i % gradient.length](c)).join('');
}

module.exports = async function (api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, createLine) {
    // —————————————— LOAD ALIASES —————————————— //
    const aliasesData = await globalData.get('setalias', 'data', []);
    if (aliasesData) {
        for (const data of aliasesData) {
            const { aliases, commandName } = data;
            for (const alias of aliases) {
                if (GoatBot.aliases.has(alias)) throw new Error(chalk.red(`Alias "${alias}" already exists in command "${commandName}"`));
                GoatBot.aliases.set(alias, commandName);
            }
        }
    }

    const folders = ["cmds", "events"];
    let text, setMap, typeEnvCommand;

    for (const folderModules of folders) {
        const headerTitle = folderModules === "cmds" ? "LOAD RASIN COMMANDS" : "LOAD EVENT COMMANDS";
        console.log(`
${chalk.hex("#FF00FF")('╔════════════════════════════════════════════════╗')}
${gradientText('║             ░▒▓ ' + headerTitle + ' ▓▒░        ║')}
${chalk.hex("#FF00FF")('╚════════════════════════════════════════════════╝')}
        `);

        if (folderModules === "cmds") {
            text = "command";
            typeEnvCommand = "envCommands";
            setMap = "commands";
        } else {
            text = "event command";
            typeEnvCommand = "envEvents";
            setMap = "eventCommands";
        }

        const fullPathModules = path.normalize(process.cwd() + `/scripts/${folderModules}`);
        const Files = readdirSync(fullPathModules).filter(file =>
            file.endsWith(".js") &&
            !file.endsWith("eg.js") &&
            (process.env.NODE_ENV === "development" ? true : !file.match(/(dev)\.js$/g)) &&
            !configCommands[folderModules === "cmds" ? "commandUnload" : "commandEventUnload"]?.includes(file)
        );

        let commandLoadSuccess = 0;
        const commandError = [];

        for (const file of Files) {
            const pathCommand = path.normalize(fullPathModules + "/" + file);
            try {
                // ————————————— CHECK PACKAGE DEPENDENCIES ————————————— //
                const contentFile = readFileSync(pathCommand, "utf8");
                let allPackage = contentFile.match(regExpCheckPackage);

                if (allPackage) {
                    allPackage = allPackage.map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
                        .filter(p => !p.startsWith("/") && !p.startsWith("./") && !p.startsWith("../") && !p.startsWith(__dirname));

                    for (let packageName of allPackage) {
                        if (packageName.startsWith('@')) packageName = packageName.split('/').slice(0, 2).join('/');
                        else packageName = packageName.split('/')[0];

                        if (!packageAlready.includes(packageName)) {
                            packageAlready.push(packageName);
                            if (!existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
                                const waiting = setInterval(() => {
                                    process.stdout.write(chalk.hex("#00F5FF")(`\r${spinner[count % spinner.length]}`) + ' ' +
                                        chalk.hex("#FF00FF")(`Installing package ${packageName}`) + ' ' +
                                        chalk.hex("#FFD700")(`for ${text} ${file}...`)
                                    );
                                    count++;
                                }, 80);
                                try {
                                    await exec(`npm install ${packageName} --${pathCommand.endsWith('.dev.js') ? 'no-save' : 'save'}`);
                                    clearInterval(waiting);
                                    process.stderr.write('\r\x1b[K');
                                    console.log(chalk.hex("#00F5FF")(`✔`) + ' ' + chalk.hex("#FFD700")(`Installed package ${packageName} successfully`));
                                } catch (err) {
                                    clearInterval(waiting);
                                    process.stderr.write('\r\x1b[K');
                                    console.log(chalk.hex("#FF00FF")(`✖`) + ' ' + chalk.hex("#FFD700")(`Failed to install package ${packageName}`));
                                    throw new Error(`Can't install package ${packageName}`);
                                }
                            }
                        }
                    }
                }

                // ————————— CHECK CONTENT SCRIPT ————————— //
                global.temp.contentScripts[folderModules][file] = contentFile;
                const command = require(pathCommand);
                command.location = pathCommand;
                const configCommand = command.config;
                const commandName = configCommand?.name;

                if (!configCommand) throw new Error(chalk.red(`config of ${text} undefined`));
                if (!configCommand.category) throw new Error(chalk.red(`category of ${text} undefined`));
                if (!commandName) throw new Error(chalk.red(`name of ${text} undefined`));
                if (!command.onStart) throw new Error(chalk.red(`onStart of ${text} undefined`));
                if (typeof command.onStart !== "function") throw new Error(chalk.red(`onStart of ${text} must be a function`));
                if (GoatBot[setMap].has(commandName)) throw new Error(chalk.red(`${text} "${commandName}" already exists with file "${removeHomeDir(GoatBot[setMap].get(commandName)?.location || "")}"`));

                const { onFirstChat, onChat, onLoad, onEvent, onAnyEvent } = command;
                const { envGlobal, envConfig, aliases } = configCommand;

                // ————————— CHECK ALIASES ————————— //
                const validAliases = [];
                if (aliases) {
                    if (!Array.isArray(aliases)) throw new Error(chalk.red("The value of \"config.aliases\" must be array!"));
                    for (const alias of aliases) {
                        if (aliases.filter(item => item == alias).length > 1)
                            throw new Error(chalk.red(`alias "${alias}" duplicate in ${text} "${commandName}" with file "${removeHomeDir(pathCommand)}"`));
                        if (GoatBot.aliases.has(alias))
                            throw new Error(chalk.red(`alias "${alias}" already exists in ${text} "${GoatBot.aliases.get(alias)}"`));
                        validAliases.push(alias);
                    }
                    for (const alias of validAliases) GoatBot.aliases.set(alias, commandName);
                }

                // ————————— CHECK ENV GLOBAL ————————— //
                if (envGlobal) {
                    if (typeof envGlobal !== "object" || Array.isArray(envGlobal)) throw new Error(chalk.red("the value of \"envGlobal\" must be object"));
                    for (const i in envGlobal) {
                        if (!configCommands.envGlobal[i]) configCommands.envGlobal[i] = envGlobal[i];
                        else {
                            const readCommand = readFileSync(pathCommand, "utf-8").replace(envGlobal[i], configCommands.envGlobal[i]);
                            writeFileSync(pathCommand, readCommand);
                        }
                    }
                }

                // ————————— CHECK ENV CONFIG ————————— //
                if (envConfig) {
                    if (typeof envConfig !== "object" || Array.isArray(envConfig)) throw new Error(chalk.red("the value of \"envConfig\" must be object"));
                    if (!configCommands[typeEnvCommand]) configCommands[typeEnvCommand] = {};
                    if (!configCommands[typeEnvCommand][commandName]) configCommands[typeEnvCommand][commandName] = {};
                    for (const [key, value] of Object.entries(envConfig)) {
                        if (!configCommands[typeEnvCommand][commandName][key]) configCommands[typeEnvCommand][commandName][key] = value;
                        else {
                            const readCommand = readFileSync(pathCommand, "utf-8").replace(value, configCommands[typeEnvCommand][commandName][key]);
                            writeFileSync(pathCommand, readCommand);
                        }
                    }
                }

                // ————————— ONLOAD ————————— //
                if (onLoad) {
                    if (typeof onLoad !== "function") throw new Error(chalk.red("The value of \"onLoad\" must be function"));
                    await onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });
                }

                // ————————— EVENT HANDLERS ————————— //
                if (onChat) GoatBot.onChat.push(commandName);
                if (onFirstChat) GoatBot.onFirstChat.push({ commandName, threadIDsChattedFirstTime: [] });
                if (onEvent) GoatBot.onEvent.push(commandName);
                if (onAnyEvent) GoatBot.onAnyEvent.push(commandName);

                // ————————— REGISTER COMMAND ————————— //
                GoatBot[setMap].set(commandName.toLowerCase(), command);
                commandLoadSuccess++;

                global.GoatBot[folderModules === "cmds" ? "commandFilesPath" : "eventCommandsFilesPath"].push({
                    filePath: path.normalize(pathCommand),
                    commandName: [commandName, ...validAliases]
                });


            } catch (error) {
                commandError.push({ name: file, error });
            }
        }

        // ————————— SUMMARY BOX ————————— //
        console.log(`
${chalk.hex("#FF00FF")('╔═════════════════════════════════════╗')}
${chalk.hex("#FF00FF")('║ ░▒▓ ' + (folderModules === "cmds" ? "CMMNDS" : "EVENTS") + ' LOADED ▓▒░               ║')}
║   ${chalk.hex("#00F5FF")('Success')}: ${chalk.hex("#FFD700")(commandLoadSuccess)}                      
║   ${chalk.hex("#FF00FF")('Failed')}: ${chalk.hex("#FFD700")(commandError.length)}                         ║
${chalk.hex("#FF00FF")('╚═════════════════════════════════════╝')}
`);


        if (commandError.length > 0) {
            console.log(chalk.red("❗ Error details:"));
            commandError.forEach(err => console.log(chalk.red(` - ${err.name}: ${err.error}`)));
        }
    }
};