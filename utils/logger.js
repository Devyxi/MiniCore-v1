const fs = require('fs');
const { inspect } = require('node:util');

const colors = {
    red: '\x1b[31m',
    orange: '\x1b[38;5;202m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    lightBlue: '\x1b[36m', 
    pink: '\x1b[35m',
    purple: '\x1b[38;5;129m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

let LAST_CHECK = 0;
let NEWEST_LOG = '';

function getTimestamp() {
    const date = new Date();
    return `${date.toISOString().slice(0, 19).replace('T', ' ')}`;
}

function parseMessage(message) {
    const properties = inspect(message, { depth: 3 });
    const regex = /^\s*["'`](.*)["'`]\s*\+?$/gm;
    return properties.split('\n').map(line => line.replace(regex, '$1')).join('\n');
}

function GetLatestLogFile() {
    if (Date.now() - LAST_CHECK < 1000 * 60 * 5) return NEWEST_LOG;

    const logsDir = `${__dirname}/../logs/`;
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    const files = fs.readdirSync(logsDir);
    const logs = files.filter(file => file.endsWith('.txt'));
    const dates = logs.map(log => log.split('.').shift()).sort((a, b) => new Date(b) - new Date(a));
    let newest = dates.shift();

    const today = new Date().toISOString().split('T').shift();
    if (newest !== today) {
        fs.writeFileSync(`${logsDir}${today}.txt`, '');
        if (files.length >= 7) {
            fs.unlinkSync(`${logsDir}${dates.pop()}`);
        }
        newest = today;
    }

    NEWEST_LOG = `${logsDir}${newest}.txt`;
    LAST_CHECK = Date.now();
    return NEWEST_LOG;
}

function logToFile(data) {
    const formattedData = `${data}\n`; 
    fs.appendFileSync(GetLatestLogFile(), formattedData);
}

function logWithColor(colorCode, level, message) {
    const timestamp = getTimestamp();
    const levelColor = colorCode; 

    const formattedMessage = `${levelColor}[${timestamp}] ${colors.reset}${parseMessage(message)}`;

    console.log(formattedMessage); 
    logToFile(`[${timestamp}] ${parseMessage(message)}`); 
}

function boxConsole(messages) {
    const totalWidth = 66; 
    const borderHorizontal = '─'.repeat(totalWidth - 2); 
    console.log(`${colors.cyan}╭${borderHorizontal}╮${colors.reset}`);

    messages.forEach(msg => {
        const paddedMessage = ` ${msg} `; 
        const messageLength = paddedMessage.replace(/\x1b\[[0-9;]*m/g, '').length; 

        const totalSymbols = totalWidth - 2; 
        const padding = Math.max(totalSymbols - messageLength, 0); 
        const leftPadding = Math.floor(padding / 2); 
        const rightPadding = padding - leftPadding; 

        console.log(`│${' '.repeat(leftPadding)}${paddedMessage}${' '.repeat(rightPadding)}│`);
    });

    console.log(`${colors.cyan}╰${borderHorizontal}╯${colors.reset}`);
}

function printSeparator() {
    console.log("=" + "=".repeat(64) + "="); 
}
function printSeparator2() {
    console.log(``); 
}

global.clientLogger = {
    info: (message) => logWithColor(colors.yellow, 'INFO', message),
    warn: (message) => logWithColor(colors.orange, 'WARN', message),
    error: (message) => logWithColor(colors.red, 'ERROR', message),
    success: (message) => logWithColor(colors.green, 'SUCCESS', message),
    debug: (message) => logWithColor(colors.blue, 'DEBUG', message),
    deleted: (message) => logWithColor(colors.pink, 'DELETED', message),
    updated: (message) => logWithColor(colors.purple, 'UPDATED', message),
    created: (message) => logWithColor(colors.cyan, 'CREATED', message),
    custom: (message, hexColor) => {
        let colorInt;
        if (typeof hexColor === 'string') {
            colorInt = parseInt(hexColor.replace('#', ''), 16);
        } else if (typeof hexColor === 'number') {
            colorInt = hexColor;
        } else {
            colorInt = 0;
        }

        const rgb = [(colorInt >> 16) & 0xFF, (colorInt >> 8) & 0xFF, colorInt & 0xFF];
        const ansiRGB = `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
        const timestamp = getTimestamp();
        const formattedMessage = `${ansiRGB}[${timestamp}] (CUSTOM) ${colors.reset}${parseMessage(message)}`;

        console.log(formattedMessage);
        logToFile(`[${timestamp}] (CUSTOM) ${parseMessage(message)}`);
    }
};

const welcomeText = `${colors.white}Welcome to ${colors.blue}MiniCore-v1${colors.white} by ${colors.red}Digital. Inc${colors.white}`;
const supportText = `${colors.white}Support: ${colors.lightBlue}https://discord.gg/M375Bh6QyK${colors.white}`;
const codedByText = `${colors.white}Coded By ${colors.cyan}Devyxi${colors.reset}`;

console.clear();
boxConsole([welcomeText, supportText, codedByText]);
printSeparator();
printSeparator2(); 

if (require.main === module) {
    clientLogger.info("This is an informational message");
    clientLogger.warn("This is a warning message");
    clientLogger.error("This is an error message");
    clientLogger.success("Operation was successful!");
    clientLogger.debug("Debugging information here");
    clientLogger.deleted("This item has been deleted");
    clientLogger.updated("This item has been updated");
    clientLogger.created("This item has been created");
    clientLogger.custom("This is a custom colored message", "#FFA500"); // Custom Orange color
}