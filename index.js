
const { spawn } = require("child_process");
const log = require("./utils/log");
require('./includes/chess/covua');

const http = require("http");
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>ZPROJECT X DCB</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(to right, #1f4037, #99f2c8);
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Segoe UI', sans-serif;
          overflow: hidden;
        }
        .box {
          background-color: rgba(255, 255, 255, 0.15);
          padding: 30px 40px;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          text-align: center;
          animation: fadeIn 1s ease;
        }
        h1 {
          font-size: 26px;
          margin-bottom: 10px;
          color: #f1c40f;
          animation: pulse 2s infinite;
        }
        p {
          margin: 10px 0;
          font-size: 16px;
        }
        .emoji {
          font-size: 32px;
          margin: 15px 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        footer {
          margin-top: 15px;
          font-size: 12px;
          color: #ddd;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>🌸 Bot ZPROJECT X Dương Công Bằng</h1>
        <div class="emoji">🚀💻🧠</div>
        <p>Server đang hoạt động 24/7</p>
        <p><strong>DCB Đẹp Zai Vô Địch Thiên Hạ</strong></p>
        <div class="emoji">✨ ヽ(=ﾟωﾟ)人(ﾟωﾟ=)ﾉ ✨</div>
        <footer>Phiên bản UI Zproject dành riêng cho anh Bằng ❤️</footer>
      </div>
    </body>
    </html>
  `);
}).listen(port, () => {
  log(`🌐 Giao diện HTTP đã chạy tại cổng ${port}`, "[ SERVER ]");
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
