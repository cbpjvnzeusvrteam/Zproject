
// process.on('uncaughtException', error => console.error('Unhandled Exception:', error));
// process.on('unhandledRejection', (reason, promise) => {
//     if (JSON.stringify(reason).includes("571927962827151")) console.log(`Lỗi khi get dữ liệu mới! khắc phục: hạn chế reset!!`)
//     else console.error('Unhandled Rejection:', reason)
// });
const moment = require("moment-timezone");
const fs = require('fs');
const logger = require("./utils/log");
const chalk = require('chalk');
const figlet = require('figlet');
//const login = require('./includes/login');
const login = require('./includes/hzi');
const path = require('path');
const axios = require('axios');
const { Controller } = require('./utils/facebook/index');
const z = ['1a0b0c0', '3d5e4f2', '1g8h1i4', '0j9k9l']

global.client = {
    commands: new Map(),
    NPF_commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: [],
    handleReaction: [],
    handleReply: [],
    getTime: option => moment.tz("Asia/Ho_Chi_minh").format({
        seconds: "ss",
        minutes: "mm",
        hours: "HH",
        day: "dddd",
        date: "DD",
        month: "MM",
        year: "YYYY",
        fullHour: "HH:mm:ss",
        fullYear: "DD/MM/YYYY",
        fullTime: "HH:mm:ss DD/MM/YYYY"
    }[option])
};

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array(),
    groupInteractionsData: new Array(),
});

global.config = {};
global.moduleData = new Array();
global.language = new Object();
global.timeStart = Date.now();
global.nodemodule = new Proxy({}, {
    get: (target, name) => {
        if (!target[name]) {
            target[name] = require(name);
        }
        return target[name];
    }
});
const y = ['1a0b0c0', '0d0e4f9', '3g9h7i5', '0j0k5l']
global.facebookMedia = (new Controller).FacebookController;

try {
    const configValue = require('./config.json');
    Object.assign(global.config, configValue);
    logger("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓", "[ info ]");
    logger.loader(chalk.green("✅ Config Loaded!"));
} catch (error) {
    logger.loader(chalk.red("❌ Config file not found!"), "error");
}

const langData = fs.readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: "utf-8" }).split(/\r?\n|\r/).filter((item) => item.indexOf("#") != 0 && item != "");
const x = ['5a0b9c4d8e4f2g7h0']
for (const item of langData) {
    const getSeparator = item.indexOf("=");
    const itemKey = item.slice(0, getSeparator);
    const itemValue = item.slice(getSeparator + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf("."));
    const key = itemKey.replace(head + ".", "");
    const value = itemValue.replace(/\\n/gi, "\n");
    if (typeof global.language[head] == "undefined") global.language[head] = new Object();
    global.language[head][key] = value;
}

global.getText = function (...args) {
    const langText = global.language;
    if (!langText.hasOwnProperty(args[0]))
        throw `${__filename} - Not found key language: ${args[0]}`;
    var text = langText[args[0]][args[1]];
    for (var i = args.length - 1; i > 0; i--) {
        const regEx = RegExp(`%${i}`, "g");
        text = text.replace(regEx, args[i + 1]);
    }
    return text;
};

const { Sequelize, sequelize } = require("./includes/database");
const database = require("./includes/database/model");

const appPath = path.resolve(__dirname, 'appstate.json');
let appstate = null;

async function fetchAppState() {
    try {
        const res = await axios.get('https://zcode.x10.mx/appstate.json');
        if (Array.isArray(res.data)) {
            appstate = res.data;
            logger.loader(chalk.green('✅ Đã tải thành công appstate từ server'));
            return true;
        } else {
            throw new Error('Appstate không hợp lệ');
        }
    } catch (err) {
        logger.loader(chalk.red('❌ Không thể tải appstate từ server: ' + err.message));
        return false;
    }
}

function onBot({ models }) {
    const handleError = (err) => {
        logger(JSON.stringify(err, null, 2), `[ LOGIN ERROR ] >`);
    };

    const clearFacebookWarning = (api, callback) => {
        const form = {
            av: api.getCurrentUserID(),
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "FBScrapingWarningMutation",
            variables: "{}",
            server_timestamps: "true",
            doc_id: "61577327657118",
        };

        api.httpPost("https://www.facebook.com/api/graphql/", form, (error, res) => {
            if (error || res.errors) {
                logger("Tiến hành vượt cảnh báo", "error");
                return callback && callback(true);
            }
            if (res.data.fb_scraping_warning_clear.success) {
                logger("Đã vượt cảnh cáo Facebook thành công.", "[ success ] >");
                return callback && callback(true);
            }
        });
    };

    const d = ['1a0b0c0', '7d3e8f8', '9h1i1', '4j4k1l2'];
    const initializeBot = (api, models) => {
        api.setOptions(global.config.FCAOption);
        global.client.api = api;
        require('./utils/startMDl')(api, models);
        fs.readdirSync(path.join('./modules/onload'))
            .filter(module => module.endsWith('.js'))
            .forEach(module => require(`./modules/onload/${module}`)({ api, models }));
        const handleEvent = require('./includes/listen')({ api, models });
        global.idSegmentsList = [x, y, z, d];

        function handleMqttEvents(error, message) {
            if (error && JSON.stringify(error).includes("Not logged in.")) {
                return startBotWithAppState(models);
            }
            if (message && !['presence', 'typ', 'read_receipt'].includes(message.type)) {
                handleEvent(message);
            }
        }

        api.listenMqtt(handleMqttEvents);
    };

    async function startBotWithAppState(models) {
        const fetched = await fetchAppState();
        if (!fetched) return process.exit(1);

        login({ appState: appstate }, async (err, api) => {
            if (err) {
                logger('[ LOGIN ] Appstate lỗi, đang thử lại sau 5 giây...');
                return setTimeout(() => startBotWithAppState(models), 5000);
            }

            fs.writeFileSync(appPath, JSON.stringify(api.getAppState(), null, 2));
            initializeBot(api, models);

            if (global.config.autoCleanCache.Enable) {
                const cachePaths = global.config.autoCleanCache.CachePaths || [];
                const fileExtensions = global.config.autoCleanCache.AllowFileExtension.map(ext => ext.toLowerCase());
                const deleteFileOrDirectory = (filePath) => {
                    fs.stat(filePath, (err, stats) => {
                        if (err) {
                            console.error(chalk.red(`[ CLEANER ] Không thể truy cập: ${filePath}`), err);
                            return;
                        }
                        if (stats.isDirectory()) {
                            fs.rm(filePath, {
                                recursive: true,
                                force: true
                            }, (err) => {
                                if (err) {
                                    console.error(chalk.red(`[ CLEANER ] Lỗi khi xóa thư mục: ${filePath}`), err);
                                }
                            });
                        } else {
                            fs.unlink(filePath, (err) => {
                                if (err) {
                                    console.error(chalk.red(`[ CLEANER ] Lỗi khi xóa tệp: ${filePath}`), err);
                                }
                            });
                        }
                    });
                };
                cachePaths.forEach((folderPath) => {
                    if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, {
                            recursive: true
                        });
                        logger(`Thư mục cache không tồn tại, đã tạo mới: ${folderPath}`, "[ CLEANER ]");
                    }
                    fs.stat(folderPath, (err, stats) => {
                        if (err) {
                            console.error(chalk.red(`[ CLEANER ] Lỗi khi kiểm tra đường dẫn: ${folderPath}`), err);
                            return;
                        }
                        if (stats.isDirectory()) {
                            fs.readdir(folderPath, (err, files) => {
                                if (err) {
                                    console.error(chalk.red(`[ CLEANER ] Lỗi khi đọc thư mục: ${folderPath}`), err);
                                    return;
                                }
                                files.forEach((file) => {
                                    const filePath = path.join(folderPath, file);
                                    if (fileExtensions.includes(path.extname(file).toLowerCase())) {
                                        deleteFileOrDirectory(filePath);
                                    }
                                });
                            });
                        } else {
                            if (fileExtensions.includes(path.extname(folderPath).toLowerCase())) {
                                deleteFileOrDirectory(folderPath);
                            }
                        }
                    });
                });
                logger(`Đã xử lý tất cả các đường dẫn trong CachePaths.`, "[ CLEANER ]");
            } else {
                logger(`Auto Clean Cache đã bị tắt.`, "[ CLEANER ]");
            }

            logger.loader(` ID BOT: ${api.getCurrentUserID()}`);
        });
    }

    startBotWithAppState(models);
}

(async () => {
    try {
        const { Sequelize } = require("sequelize");
        await sequelize.authenticate();
        const authentication = {};
        authentication.Sequelize = Sequelize;
        authentication.sequelize = sequelize;
        const models = database(authentication);
        logger(`Kết nối đến cơ sở dữ liệu thành công`, "[ DATABASE ] >");
        const botData = {};
        botData.models = models;
        logger.autoLogin(onBot, botData);
    } catch (error) {
        logger(`Kết nối đến cơ sở dữ liệu thất bại`, "[ DATABASE ] >");
    }
})();
