const { spawn } = require("child_process");
const log = require("./utils/log");
require('./includes/chess/covua');

// Tạo một HTTP server nếu dùng Web Service trên Render
const http = require("http");
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.end("🌸 Bot is running and alive!");
}).listen(port, () => {
    log(`🌐 Đã mở cổng HTTP trên port ${port}`, "[ SERVER ]");
});

const startBot = () => {
    log('🌸 ĐANG KHỞI ĐỘNG BOT', "⟦ KÍCH HOẠT ⟧⪼ ");
    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "niio-limit.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", async (exitCode) => {
        if (exitCode === 1 || exitCode === 134) {
            log("🔄 BOT ĐANG KHỞI ĐỘNG LẠI DO LỖI!!!", "[ Khởi động ]");
            startBot();
        } else if (exitCode >= 200 && exitCode < 300) {
            const delay = (exitCode - 200) * 1000;
            log(`🕒 TẠM DỪNG ${delay / 1000} GIÂY TRƯỚC KHI KHỞI ĐỘNG LẠI`, "[ Khởi động ]");
            await new Promise((resolve) => setTimeout(resolve, delay));
            startBot();
        } else {
            log(`⛔ BOT DỪNG VỚI MÃ THOÁT ${exitCode}`, "[ Khởi động ]");
            process.exit(0);
        }
    });

    child.on("error", (error) => {
        log(`🚨 LỖI TRONG PROCESS: ${error.message}`, "[ Khởi động ]");
    });
};

startBot();