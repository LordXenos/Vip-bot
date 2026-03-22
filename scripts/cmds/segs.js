const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "segs",
    version: "1.0",
    author: "Vydron1122",
    countDown: 20,
    role: 0,
    category: "image",
    description: {
      en: "🎨 Generate any image from text (Unfiltered - Z-Image API)"
    },
    guide: {
      en: "{pn} <prompt>\nExample: {pn} beautiful sunset over mountains\n\n⚠️ This command can generate 18+ content. Use responsibly."
    }
  },

  onStart: async function ({ message, args, event, api }) {
    if (!args.length) {
      return message.reply("❌ Please provide a prompt!\nExample: segs beautiful sunset over mountains");
    }

    const prompt = args.join(" ");
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `segs_${Date.now()}.png`);

    // Cache folder তৈরি
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // ওয়েট মেসেজ
    const waitMsg = await message.reply(`⏳ Generating image for: "${prompt}"...\n⏰ This may take 30-60 seconds. Please wait...`);

    try {
      // তোমার ModelScope টোকেন (এখানে বসাও)
      const token = "ms-5db4acc8-e408-4627-9876-bd4f90a16e1c";
      
      // Step 1: টাস্ক সাবমিট
      const submitResponse = await axios.post(
        "https://api-inference.modelscope.cn/v1/images/generations",
        {
          model: "Tongyi-MAI/Z-Image-Turbo",
          prompt: prompt,
          height: 1024,
          width: 1024,
          num_inference_steps: 9,      // Z-Image-Turbo-এর জন্য оптимал 
          guidance_scale: 0.0           // আনফিল্টারড আউটপুটের জন্য 
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-ModelScope-Async-Mode": "true"
          },
          timeout: 30000
        }
      );

      const taskId = submitResponse.data.task_id;
      
      // Step 2: টাস্ক স্ট্যাটাস চেক
      let imageUrl = null;
      let attempts = 0;
      const maxAttempts = 30; // 30 * 5 = 150 সেকেন্ড পর্যন্ত wait
      
      while (!imageUrl && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // ৫ সেকেন্ড পর পর চেক
        
        const statusResponse = await axios.get(
          `https://api-inference.modelscope.cn/v1/tasks/${taskId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "X-ModelScope-Task-Type": "image_generation"
            }
          }
        );
        
        if (statusResponse.data.task_status === "SUCCEED") {
          imageUrl = statusResponse.data.output_images[0];
          break;
        } else if (statusResponse.data.task_status === "FAILED") {
          throw new Error("Image generation failed");
        }
        
        attempts++;
      }
      
      if (!imageUrl) {
        throw new Error("Timeout: Image generation took too long");
      }

      // ইমেজ ডাউনলোড
      const imageResponse = await axios.get(imageUrl, { 
        responseType: "arraybuffer",
        timeout: 30000
      });
      
      fs.writeFileSync(filePath, Buffer.from(imageResponse.data));

      // ওয়েট মেসেজ ডিলিট
      if (waitMsg?.messageID) {
        try {
          await api.unsendMessage(waitMsg.messageID);
        } catch (e) {}
      }

      // ইমেজ পাঠানো
      await message.reply({
        body: `🎨 **Generated Image** 🎨\n━━━━━━━━━━━━━━\n💬 **Prompt:** ${prompt}\n━━━━━━━━━━━━━━\n✨ Here's your image baby! 😘\n━━━━━━━━━━━━━━\n⚠️ This image may contain adult content.`,
        attachment: fs.createReadStream(filePath)
      });

      // ১ মিনিট পর cache থেকে ফাইল ডিলিট
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 60000);

    } catch (err) {
      console.error("SEGS Error:", err);
      
      if (waitMsg?.messageID) {
        try {
          await api.unsendMessage(waitMsg.messageID);
        } catch (e) {}
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Error message
      let errorMsg = "❌ Failed to generate image.\n";
      
      if (err.message.includes("401") || err.message.includes("token") || err.message.includes("Authentication")) {
        errorMsg += "🔑 Invalid API token. Please check your ModelScope token.";
      } else if (err.message.includes("timeout")) {
        errorMsg += "⏱️ Request timeout. Please try again.";
      } else if (err.message.includes("429")) {
        errorMsg += "🔄 Rate limit exceeded. Please wait a moment and try again.";
      } else {
        errorMsg += `⚠️ ${err.message}`;
      }

      return message.reply(errorMsg);
    }
  }
};