const moment = require('moment-timezone');

module.exports = {
	config: {
		name: "baby2",
		version: "2.0.2",
		author: "Rasin",
		countDown: 0,
		role: 0,
		description: "Auto replyy",
		category: "no prefix",
		guide: {
			en: "automatically responds"
		}
	},

	onStart: async function({ message, api, event, args, rasin }) {
		console.log('Hello')
	},

	onChat: async function({ event, message, api, usersData }) {
		const { body, threadID, senderID } = event;
		if (!body) return;

		if (senderID == api.getCurrentUserID()) return;

		const text = body.toLowerCase().trim();

		if (text === "miss you") {
			return api.sendMessage("Usssssssssss 😭", threadID);
		}

		if (["😘","😽"].includes(text)) {
			return api.sendMessage("কিস দিস না তোর মুখে দূর গন্ধ কয়দিন ধরে দাঁত ব্রাশ করিস নাই🤬", threadID);
		}

		if (["ওই কিরে","oi kire"].includes(text)) {
			return api.sendMessage("মধু মধু রসমালাই", threadID);
		}

		if (["bc","mc"].includes(text)) {
			return api.sendMessage("SAME TO YOU😊", threadID);
		}

		if (["🫦","💋"].includes(text)) {
			return api.sendMessage("কিরে হালা লুচ্চা, এগুলো কি ইমুজি দেস", threadID);
		}

		if (["morning","good morning"].includes(text)) {
			return api.sendMessage("GOOD MORNING দাত ব্রাশ করে খেয়ে নেও😚", threadID);
		}

		if (["chup","stop","চুপ কর","chup kor"].includes(text)) {
			return api.sendMessage("তুই চুপ চুপ কর", threadID);
		}

		if (["আসসালামু আলাইকুম","assalamualaikum","assalamu alaikum","salam"].includes(text)) {
			return api.sendMessage("️- ওয়ালাইকুমুস-সালাম-!!🖤", threadID);
		}

		if (["kiss me"].includes(text)) {
			return api.sendMessage("️ তুমি পঁচা তোমাকে কিস দিবো না 🤭", threadID);
		}

		if (["tnx","ধন্যবাদ","thank you","thanks"].includes(text)) {
			return api.sendMessage("️এতো ধন্যবাদ না দিয়ে পারলে গার্লফ্রেন্ড টা দিয়ে দে..!🌚", threadID);
		}

		if (["😾","😡","😠","🤬"].includes(text)) {
			return api.sendMessage("️রাগ করে না সোনা পাখি এতো রাগ শরীরের জন্য ভালো না🥰", threadID);
		}

		if (["pic de","ss daw"].includes(text)) {
			return api.sendMessage("️এন থেকে সর দুরে গিয়া মর😒", threadID);
		}

		if (text === "😅") {
			return api.sendMessage("️Ki go seka khaicho🥺", threadID);
		}

		if (["😒","🙄"].includes(text)) {
			return api.sendMessage("️ এইদিকে ওইদিকে কি দেখো জানু আমি তোমার সামনে দেখো😘", threadID);
		}

		if (["amake kew valobashe na","aj kew nei bole","aj kew nai bole"].includes(text)) {
			return api.sendMessage("️চিন্তা করো কেন আমি তো আছি🫶\nতোমাকে রাইতে ভালোবাসবো", threadID);
		}

		if (["gf","bf"].includes(text)) {
			return api.sendMessage("খালি কি তোরাই পেম করবি আমাকেও একটা GF দে🥺", threadID);
		}

		if (["😂","😁","😆","🤣","😸","😹"].includes(text)) {
			return api.sendMessage("ভাই তুই এত হাসিস না হাসলে তোরে চোরের মত লাগে..!🌚🤣", threadID);
		}

		if (["কেমন আছো","কেমন আছেন","kmon acho","how are you","how are you?"].includes(text)) {
			return api.sendMessage("আমি তখনই ভালো থাকি যখন আপনাকে হাসতে দেখি🤎☺️", threadID);
		}

		if (["mon kharap","tmr ki mon kharap"].includes(text)) {
			return api.sendMessage("আমার সাদা মনে কোনো কাদা নাই...!🌝", threadID);
		}

		if (["by","bye","jaiga","বাই","pore kotha hbe","যাই গা"].includes(text)) {
			return api.sendMessage("কিরে তুই কই যাস 👋🏻", threadID);
		}

		if (["tumi khaiso","khaicho"].includes(text)) {
			return api.sendMessage("Na Jaan🥹 Tumi ranna kore rakho ami ese khabo 😘", threadID);
		}

		if (["tumi ki amake bhalobaso","tmi ki amake vlo basho"].includes(text)) {
			return api.sendMessage("Yes babeee 👀", threadID);
		}
	}
};
