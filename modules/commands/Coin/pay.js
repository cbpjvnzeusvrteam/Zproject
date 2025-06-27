module.exports.config = {
    name: "pay",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "Mirai Team - Fix by Zprojct X Duong Cong Bang",
    description: "Chuyển tiền của bản thân cho ai đó",
    commandCategory: "Coin",
    usages: "pay @tag coins",
    cooldowns: 5,
};

module.exports.run = async ({ event, api, Currencies, args, Users }) => {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;

    // Trường hợp trả lời tin nhắn
    if (type === "message_reply") {
        const mention = messageReply?.senderID;
        if (!mention) return api.sendMessage("Không thể xác định người nhận!", threadID, messageID);
        const name = (await Users.getData(mention)).name;

        if (!args[0] || isNaN(args[0])) return api.sendMessage("Vui lòng nhập số tiền bạn muốn chuyển.", threadID, messageID);

        const coins = parseInt(args[0]);
        const balance = (await Currencies.getData(senderID)).money;

        if (coins <= 0) return api.sendMessage("Số tiền bạn muốn chuyển không hợp lệ!", threadID, messageID);
        if (coins > balance) return api.sendMessage("Số tiền bạn muốn chuyển lớn hơn số dư của bạn!", threadID, messageID);

        await Currencies.increaseMoney(mention, coins);
        await Currencies.decreaseMoney(senderID, coins);

        return api.sendMessage(`💸 Đã chuyển cho ${name} ${coins}$`, threadID, messageID);
    }

    // Trường hợp tag người nhận
    const mentionID = Object.keys(mentions)[0];
    if (!mentionID) return api.sendMessage("Vui lòng tag người bạn muốn chuyển tiền cho!", threadID, messageID);

    // Tìm vị trí số tiền trong args
    const mentionText = mentions[mentionID];
    const indexMoney = args.findIndex(arg => arg === mentionText) + 1;

    if (!args[indexMoney] || isNaN(args[indexMoney])) return api.sendMessage("Vui lòng nhập số tiền hợp lệ!", threadID, messageID);

    const coins = parseInt(args[indexMoney]);
    const balance = (await Currencies.getData(senderID)).money;

    if (coins <= 0) return api.sendMessage("Số tiền bạn muốn chuyển không hợp lệ!", threadID, messageID);
    if (coins > balance) return api.sendMessage("Số tiền bạn muốn chuyển lớn hơn số dư hiện có!", threadID, messageID);

    await Currencies.increaseMoney(mentionID, coins);
    await Currencies.decreaseMoney(senderID, coins);

    const name = (await Users.getData(mentionID)).name;
    return api.sendMessage(`💸 Đã chuyển cho ${name} ${coins}$`, threadID, messageID);
};