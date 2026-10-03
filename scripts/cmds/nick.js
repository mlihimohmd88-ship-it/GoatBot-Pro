"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "targetData.json");

if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData() {
	try {
		if (!fs.existsSync(DATA_FILE)) return {};
		return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
	} catch {
		return {};
	}
}

function saveData(data) {
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
	config: {
		name: "استهداف",
		aliases: ["target", "استهدف"],
		version: "1.0",
		author: "shtot",
		category: "fun",
		role: 0,
		cooldown: 2
	},

	onStart: async function ({ message, event, args }) {
		const data = loadData();
		const threadID = event.threadID;

		// إيقاف الاستهداف
		if (args[0] === "وقف" || args[0] === "stop") {
			if (data[threadID]) {
				delete data[threadID];
				saveData(data);
				return message.reply("✅ تم إيقاف الاستهداف.");
			}

			return message.reply("❌ ما كاين حتى استهداف خدام فهاد المجموعة.");
		}

		// خاص يكون رد على صورة
		if (!event.messageReply) {
			return message.reply(
				"❌ ردّ على الصورة أولاً، ومن بعد كتب:\nاستهداف ID"
			);
		}

		const replied = event.messageReply;

		if (!replied.attachments || replied.attachments.length === 0) {
			return message.reply("❌ خاصك ترد على صورة.");
		}

		const image = replied.attachments.find(
			attachment =>
				attachment.type === "photo" ||
				attachment.type === "image"
		);

		if (!image || !image.url) {
			return message.reply("❌ ما لقيتش صورة فهاد الرد.");
		}

		const targetID = args[0];

		if (!targetID || !/^\d+$/.test(targetID)) {
			return message.reply(
				"❌ الاستعمال الصحيح:\n\nردّ على صورة وكتب:\nاستهداف 1000123456789"
			);
		}

		// تحميل الصورة وحفظها محلياً
		const imagePath = path.join(
			DATA_DIR,
			`target_${threadID}.jpg`
		);

		try {
			const response = await axios({
				method: "GET",
				url: image.url,
				responseType: "arraybuffer"
			});

			fs.writeFileSync(imagePath, response.data);

			data[threadID] = {
				targetID: targetID,
				imagePath: imagePath,
				enabled: true
			};

			saveData(data);

			return message.reply(
				`🎯 تم تفعيل الاستهداف بنجاح.\n\n👤 ID: ${targetID}\n🖼️ الصورة: محفوظة\n\nكل رسالة من هذا الشخص غادي يرد عليها البوت بالصورة.`
			);
		} catch (error) {
			console.error(error);
			return message.reply("❌ ما قدرتش نحفظ الصورة.");
		}
	},

	onChat: async function ({ event, api }) {
		const data = loadData();
		const threadID = event.threadID;
		const target = data[threadID];

		if (!target || !target.enabled) return;

		// تجاهل رسائل البوت نفسه
		if (event.senderID === api.getCurrentUserID?.()) return;

		// غير الشخص المستهدف
		if (String(event.senderID) !== String(target.targetID)) return;

		if (!fs.existsSync(target.imagePath)) return;

		try {
			await api.sendMessage(
				{
					attachment: fs.createReadStream(target.imagePath)
				},
				threadID
			);
		} catch (error) {
			console.error("Target error:", error);
		}
	}
};
