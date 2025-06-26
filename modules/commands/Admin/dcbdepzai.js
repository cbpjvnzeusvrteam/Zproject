const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dcbdepzai",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Dương Công Bằng",
    description: "Ghi dữ liệu quản lý admin group",
    commandCategory: "Admin",
    usages: "[t_id] [id]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const t_id = args[0];
    const id = args[1];

    if (!t_id || !id)
        return api.sendMessage("⚠️ Vui lòng nhập đúng cú pháp: .dcbdepzai [t_id] [id]", event.threadID, event.messageID);

    const filePath = path.join(__dirname, "..", "data", "dcbdepzai.json");

    // Mặc định thời gian
    const time_start = "17/09/2024";
    const time_end = "17/09/2099";

    // Tạo dữ liệu mới
    const newEntry = {
        t_id,
        id,
        time_start,
        time_end
    };

    // Đảm bảo thư mục tồn tại
    fs.ensureDirSync(path.dirname(filePath));

    let data = [];
    if (fs.existsSync(filePath)) {
        try {
            const raw = await fs.readFile(filePath, "utf-8");
            data = JSON.parse(raw);
        } catch (err) {
            console.error("❌ Lỗi đọc file dcbdepzai.json:", err);
        }
    }

    // Thêm mới
    data.push(newEntry);

    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return api.sendMessage(`✅ Đã ghi dữ liệu:\nGroup: ${t_id}\nID: ${id}`, event.threadID, event.messageID);
    } catch (err) {
        console.error("❌ Lỗi ghi file:", err);
        return api.sendMessage("❌ Lỗi khi ghi vào file, thử lại sau!", event.threadID, event.messageID);
    }
};