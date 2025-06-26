const axios = require("axios");

module.exports.config = {
    name: "ask",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Dương Công Bằng",
    description: "Gửi câu hỏi tới AI CyberD (không ghi nhớ)",
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
        if (!reply)
            return api.sendMessage("🤖 Không nhận được phản hồi từ CyberD.", event.threadID, event.messageID);

        return api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
        console.error("❌ Lỗi gửi tới API:", error);
        return api.sendMessage("🚫 Có lỗi khi kết nối với CyberD. Thử lại sau nhé!", event.threadID, event.messageID);
    }
};