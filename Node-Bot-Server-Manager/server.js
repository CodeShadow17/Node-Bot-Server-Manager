const fs = require('fs');
const { spawn } = require('child_process');
const chokidar = require('chokidar');
const readline = require('readline');
const path = require('path');

const BOTS_DIR = path.join(__dirname, 'BOTS');
const LOGS_DIR = path.join(__dirname, 'logs');
const BACKUP_DIR = path.join(__dirname, 'backups');

if (!fs.existsSync(BOTS_DIR)) fs.mkdirSync(BOTS_DIR);

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);

const bots = {}; // { botName: { process, status } }

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const loadBots = () => {
    const botFolders = fs.readdirSync(BOTS_DIR).filter(folder => {
        return fs.statSync(path.join(BOTS_DIR, folder)).isDirectory();
    });

    botFolders.forEach(botName => {
        if (!bots[botName]) {
            bots[botName] = { process: null, status: 'stopped' };
        }
    });
};

const startBot = (botName) => {
    if (bots[botName]?.status === 'running') {
        console.log(`${botName} is already running.`);
        return;
    }

    
    const botPath = path.join(BOTS_DIR, botName);
    const packageJsonPath = path.join(botPath, 'package.json');
    const logFile = path.join(LOGS_DIR, `${botName}.log`);
    const outStream = fs.createWriteStream(logFile, { flags: 'a' });
    
    let entryPoint = 'index.js';

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        entryPoint = packageJson.main || entryPoint; // Use the `main` field or default to index.js
    }

    const botProcess = spawn('node', ['.', entryPoint], { cwd: botPath });

    botProcess.stdout.on('data', data => {
        const message = data.toString();
        console.log(`[${botName}] ${message}`);
        outStream.write(`[${new Date().toISOString()}] ${message}`);
    });

    botProcess.stderr.on('data', data => {
        const error = data.toString();
        console.error(`[${botName}] ERROR: ${error}`);
        outStream.write(`[${new Date().toISOString()}] ERROR: ${error}`);
    });

    botProcess.on('close', code => {
        console.log(`${botName} exited with code ${code}`);
        bots[botName].status = 'stopped';
        bots[botName].process = null;
    });

    bots[botName] = { process: botProcess, status: 'running' };
    console.log(`${botName} started.`);
};

const stopBot = (botName) => {
    if (bots[botName]?.status === 'running') {
        bots[botName].process.kill();
        console.log(`${botName} stopped.`);
    } else {
        console.log(`${botName} is not running.`);
    }
};

const handleCommand = (command) => {
    let [action, ...botNameParts] = command.split(' ');
    let botName = botNameParts.join(' '); // Join the remaining parts back together into the full bot name


    switch (action) {
        case 'start':
            if (botName === 'all') {
                Object.keys(bots).forEach(startBot);
            } else {
                startBot(botName);
            }
            break;
        case 'stop':
            if (botName === 'all') {
                Object.keys(bots).forEach(stopBot);
            } else {
                stopBot(botName);
            }
            break;
        case 'logs':
            const logPath = path.join(LOGS_DIR, `${botName}.log`);
            if (fs.existsSync(logPath)) {
                console.log(fs.readFileSync(logPath, 'utf8'));
            } else {
                console.log(`No logs found for ${botName}.`);
            }
            break;
            case 'ping':
            console.log('Server is running.');
            console.log('Bot Status:');
            Object.keys(bots).forEach(bot => {
                console.log(`- ${bot}: ${bots[bot].status}`);
            });
            break;

            case 'update':
            if (botName === 'all') {
                Object.keys(bots).forEach(updateBot);
            } else {
                updateBot(botName);
            }
            break;
            
            case 'restart':
                if(botName === 'all') {
                    Object.keys(bots).forEach(restartBot);
                }
                else {
                    restartBot(botName);
                }
                break;

            case 'info':
                if(botName === 'all') {
                    Object.keys(bots).forEach(showBotInfo);
                }
                else {
                    showBotInfo(botName);
                }
                break;
            
            case 'backup':
                backupBot(botName);
                break;

            case 'monitor':
                monitorBot(botName);
                break;

            case 'help':
                showHelp();
                break;


        default:
            showHelp();
    }
};

// Watch for new bots
chokidar.watch(BOTS_DIR).on('all', (event, filePath) => {
    if (event === 'addDir') loadBots();
});

// CLI for commands
rl.on('line', handleCommand);

loadBots();

const showHelp = () => {
    console.log(`
    Commands:
    - start <botName|all>: Start the specified bot(s).
    - stop <botName|all>: Stop the specified bot(s).
    - restart <botName|all>: Restart the specified bot(s).
    - update <botName|all>: Update and restart the specified bot(s).
    - status <botName|all>: Show the status of the specified bot(s).
    - logs <botName>: Show the logs for the specified bot.
    - ping: Check if the server is running and show bot statuses.
    - info <botName>: Show detailed information about the specified bot.
    - backup <botName>: Create a backup of the specified bot.
    - monitor <botName>: Monitor the specified bot and restart if it stops unexpectedly.
    - help: Show this help message.
    `);
};

showHelp();



const updateBot = (botName) => {
    if (!bots[botName]) {
        console.log(`${botName} not found.`);
        return;
    }
    if (bots[botName].status === 'stopped') {
        console.log(`${botName} is not running, update is not required in this state.`);
        return;
    }
    console.log(`Updating ${botName}...`);
    // Stop the bot if it's running
    if (bots[botName].status === 'running') {
        stopBot(botName);
    }
    // Give time for the process to close properly before restarting
    setTimeout(() => {
        startBot(botName);
        console.log(`${botName} has been updated and restarted.`);
    }, 1000);
};

const restartBot = (botName) => {
    if (!bots[botName]) {
        console.log(`${botName} not found.`);
        return;
    }
    console.log(`Restarting ${botName}...`);
    stopBot(botName);
    setTimeout(() => {
        startBot(botName);
        console.log(`${botName} has been restarted.`);
    }, 1000);
};

const showBotInfo = (botName) => {
    const botPath = path.join(BOTS_DIR, botName);
    const packageJsonPath = path.join(botPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        console.log(`Bot Name: ${botName}`);
        console.log(`Version: ${packageJson.version}`);
        console.log(`Main File: ${packageJson.main || 'index.js'}`);
        console.log(`Dependencies: ${JSON.stringify(packageJson.dependencies)}`);
    } else {
        console.log(`No information available for ${botName}.`);
    }
};

const backupBot = (botName) => {
    let BotName = botName.replaceAll(' ', '-');
    const botPath = path.join(BOTS_DIR, botName);
    const backupPath = path.join(BACKUP_DIR, `${BotName}_backup_${Date.now()}`);
    
    // Ensure the backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Copy the bot's folder to the backup location
    const botFolder = path.join(botPath);
    fs.cpSync(botFolder, backupPath, { recursive: true });

    console.log(`${BotName} has been backed up to ${backupPath}.`);
};

const monitorBot = (botName) => {
    if (!bots[botName]) {
        console.log(`${botName} not found.`);
        return;
    }

    const botProcess = bots[botName].process;

    // Check if the process is running
    if (!botProcess) {
        console.log(`${botName} is not running.`);
        return;
    }

    console.log(`Monitoring ${botName}...`);

    botProcess.on('exit', (code, signal) => {
        if (code !== 0 || signal) {
            console.log(`${botName} has stopped unexpectedly. Restarting...`);
            restartBot(botName);
        }
    });

    // Optionally, monitor the bot’s memory usage or other conditions here
    // setInterval(() => {
    //     if (someConditionToRestartBot) {
    //         restartBot(botName);
    //     }
    // }, 5000);
};
