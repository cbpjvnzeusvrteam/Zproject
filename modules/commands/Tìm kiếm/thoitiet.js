module.exports.config = {
  name: "thoitiet",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "D-Jukie fix by Zproject X DuongCongBang",
  description: "Xem thời tiết 5 ngày có ảnh",
  commandCategory: "Tìm kiếm",
  usages: "[location]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const moment = require("moment-timezone");
  const Canvas = require("canvas");
  const fs = require("fs-extra");

  const apikey = "d7e795ae6a0d44aaa8abb1a0a7ac19e4";
  const area = args.join(" ");
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!area) return api.sendMessage("❗ Vui lòng nhập địa điểm!", threadID, messageID);

  if (!fs.existsSync(__dirname + '/tad')) fs.mkdirSync(__dirname + '/tad');
  if (!fs.existsSync(__dirname + '/tad/bgweather.jpg')) {
    const bg = (await axios.get("https://i.imgur.com/1Rx88Te.jpg", { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname + "/tad/bgweather.jpg", Buffer.from(bg, "utf-8"));
  }
  if (!fs.existsSync(__dirname + "/tad/Play-Bold.ttf")) {
    const font = (await axios.get("https://drive.google.com/u/0/uc?id=1uni8AiYk7prdrC7hgAmezaGTMH5R8gW8&export=download", { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname + "/tad/Play-Bold.ttf", Buffer.from(font, "utf-8"));
  }

  let areaKey, location = {}, dataWeather;
  try {
    const res = (await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=vi-vn`)).data;
    if (res.length == 0) return api.sendMessage("❌ Không tìm thấy địa điểm!", threadID, messageID);
    const data = res[0];
    areaKey = data.Key;
    location = { latitude: data.GeoPosition.Latitude, longitude: data.GeoPosition.Longitude };
  } catch (e) {
    return api.sendMessage("❌ Đã xảy ra lỗi khi tìm địa điểm!", threadID, messageID);
  }

  try {
    dataWeather = (await axios.get(`http://api.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=vi`)).data;
  } catch (e) {
    return api.sendMessage("❌ Lỗi lấy dữ liệu thời tiết!", threadID, messageID);
  }

  if (!dataWeather.DailyForecasts || dataWeather.DailyForecasts.length === 0) {
    return api.sendMessage("❌ Không lấy được dự báo thời tiết!", threadID, messageID);
  }

  function convertFtoC(F) {
    return Math.floor((F - 32) / 1.8);
  }
  function formatHours(hours) {
    return moment(hours).tz("Asia/Ho_Chi_Minh").format("HH[h]mm[p]");
  }

  const dataWeatherToday = dataWeather.DailyForecasts[0];
  let msg = `📍 Địa điểm: ${area}\n🗓 Thời tiết hôm nay:\n${dataWeather.Headline.Text}` +
    `\n🌡 Nhiệt độ: ${convertFtoC(dataWeatherToday.Temperature.Minimum.Value)}°C - ${convertFtoC(dataWeatherToday.Temperature.Maximum.Value)}°C` +
    `\n🌡 Cảm nhận: ${convertFtoC(dataWeatherToday.RealFeelTemperature.Minimum.Value)}°C - ${convertFtoC(dataWeatherToday.RealFeelTemperature.Maximum.Value)}°C` +
    `\n🌅 Mặt trời mọc: ${formatHours(dataWeatherToday.Sun.Rise)}` +
    `\n🌄 Mặt trời lặn: ${formatHours(dataWeatherToday.Sun.Set)}` +
    `\n🌃 Trăng mọc: ${formatHours(dataWeatherToday.Moon.Rise)}` +
    `\n🏙️ Trăng lặn: ${formatHours(dataWeatherToday.Moon.Set)}` +
    `\n🌞 Ban ngày: ${dataWeatherToday.Day.LongPhrase}` +
    `\n🌙 Ban đêm: ${dataWeatherToday.Night.LongPhrase}`;

  try {
    Canvas.registerFont(__dirname + "/tad/Play-Bold.ttf", { family: "Play-Bold" });
    const bg = await Canvas.loadImage(__dirname + "/tad/bgweather.jpg");
    const canvas = Canvas.createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    let X = 100;
    ctx.fillStyle = "#ffffff";
    const data = dataWeather.DailyForecasts.slice(0, 7);

    for (let item of data) {
      const iconUrl = `http://vortex.accuweather.com/adc2010/images/slate/icons/${item.Day.Icon}.svg`;
      let iconImg;
      try {
        const iconData = (await axios.get(iconUrl, { responseType: "arraybuffer" })).data;
        iconImg = await Canvas.loadImage(iconData);
      } catch (e) {
        continue; // Bỏ qua nếu ảnh lỗi
      }

      ctx.drawImage(iconImg, X, 210, 80, 80);
      ctx.font = "22px Play-Bold";
      ctx.fillText(`${convertFtoC(item.Temperature.Maximum.Value)}°C`, X, 366);
      ctx.fillText(`${convertFtoC(item.Temperature.Minimum.Value)}°C`, X, 445);
      ctx.fillText(moment(item.Date).format("DD"), X + 20, 140);
      X += 135;
    }

    const pathImg = __dirname + "/cache/weather.jpg";
    fs.writeFileSync(pathImg, canvas.toBuffer());

    await api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Lỗi tạo ảnh thời tiết!", threadID, messageID);
  }
};