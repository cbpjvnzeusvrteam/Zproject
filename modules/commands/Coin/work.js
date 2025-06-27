const fs = require('fs');
const moment = require('moment-timezone');

const path = __dirname + '/data/daily/';

const jobs = {
    ruong: { name: 'Làm ruộng', emoji: '🌾', cooldown: 2 * 60 * 1000, min: 1000, max: 6000 },
    xeom: { name: 'Chạy xe ôm', emoji: '🛵', cooldown: 2 * 60 * 1000, min: 1200, max: 5000 },
    cafe: { name: 'Phục vụ cafe', emoji: '☕', cooldown: 2 * 60 * 1000, min: 1200, max: 5500 },
    coder: { name: 'Lập trình viên', emoji: '💻', cooldown: 3 * 60 * 1000, min: 2000, max: 7000 }
};

exports.config = {
    name: 'lamviec',
    version: '2.0.0',
    hasPermssion: 0,
    credits: 'Zproject X Dương Công Bằng',
    description: 'Chọn ngành nghề để làm việc và kiếm tiền',
    commandCategory: 'Coin',
    usages: '.lamviec <nghề>',
    cooldowns: 0,
};

exports.run = async ({ api, event, Currencies, args }) => {
    const senderID = event.senderID;
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderInfo = await api.getUserInfo(senderID);
    const senderName = senderInfo[senderID].name;
    const currentTime = moment.tz('Asia/Ho_Chi_Minh');

    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

    const jobKey = args[0]?.toLowerCase();
    if (!jobKey || !jobs[jobKey]) {
        const jobList = Object.keys(jobs).map(j => `🔹 ${j} (${jobs[j].name})`).join("\n");
        return api.sendMessage({
            body: `❌ Bạn chưa chọn nghề hoặc nghề không tồn tại!\n📋 Danh sách nghề:\n${jobList}\n\n👉 Dùng: .lamviec <nghề>`,
            replyToMessage: messageID
        }, threadID);
    }

    const job = jobs[jobKey];
    const userDataPath = `${path}work_${jobKey}_${senderID}.json`;

    if (!fs.existsSync(userDataPath)) {
        const earned = getRandomMoney(job.min, job.max);
        await Currencies.increaseMoney(senderID, earned);
        fs.writeFileSync(userDataPath, JSON.stringify({ lastDailyTime: currentTime.valueOf() }));
        return api.sendMessage({
            body: `${job.emoji} ${job.name} thành công!\n👤 Người làm: ${senderName}\n💵 Thu nhập: ${earned.toLocaleString()}$\n🕓 Lúc: ${currentTime.format('HH:mm:ss - DD/MM/YYYY')}`,
            replyToMessage: messageID
        }, threadID);
    } else {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        const lastTime = userData.lastDailyTime;
        const timePassed = currentTime.valueOf() - lastTime;
        const remainingTime = job.cooldown - timePassed;

        if (timePassed < job.cooldown) {
            return api.sendMessage({
                body: `⏱ Bạn đã làm "${job.name}" rồi!\n⛔ Quay lại sau ${formatTime(remainingTime)}.`,
                replyToMessage: messageID
            }, threadID);
        } else {
            const earned = getRandomMoney(job.min, job.max);
            await Currencies.increaseMoney(senderID, earned);
            fs.writeFileSync(userDataPath, JSON.stringify({ lastDailyTime: currentTime.valueOf() }));
            return api.sendMessage({
                body: `${job.emoji} ${job.name} thành công!\n👤 Người làm: ${senderName}\n💵 Thu nhập: ${earned.toLocaleString()}$\n🕓 Lúc: ${currentTime.format('HH:mm:ss - DD/MM/YYYY')}`,
                replyToMessage: messageID
            }, threadID);
        }
    }
};

function getRandomMoney(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(time) {
    const pad = (num) => num < 10 ? "0" + num : num;
    const minutes = pad(Math.floor((time % (60 * 60 * 1000)) / (60 * 1000)));
    const seconds = pad(Math.floor((time % (60 * 1000)) / 1000));
    return `${minutes} phút ${seconds} giây`;
}