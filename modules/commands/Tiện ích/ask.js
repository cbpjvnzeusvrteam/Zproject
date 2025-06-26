const axios = require("axios");

module.exports.config = {
    name: "ask",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Dương Công Bằng",
    description: "Gửi câu hỏi tới AI CyberD",
    commandCategory: "Tiện ích",
    usages: "[câu hỏi]",
    cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
    const question = args.join(" ");
    if (!question)
        return api.sendMessage("⚠️ Vui lòng nhập nội dung câu hỏi. Ví dụ: .ask Trái đất quay quanh gì?", event.threadID, event.messageID);

    try {
        const res = await axios.get("https://www.zeusvr.x10.mx/cyberd.php", {
            params: {
                "api-key": "dcb1709",
                dcb: question
            }
        });

        const reply = res.data?.response?.response;
        if (!reply) return api.sendMessage("🤖 Không nhận được phản hồi từ CyberD.", event.threadID, event.messageID);

        return api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
        console.error("❌ Lỗi khi gửi yêu cầu đến API:", error);
        return api.sendMessage("🚫 Đã xảy ra lỗi khi kết nối với CyberD. Vui lòng thử lại sau!", event.threadID, event.messageID);
    }
};