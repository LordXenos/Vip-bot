const axios = require("axios");
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const { getStreamFromURL } = global.utils;

async function generatePinterestCanvas(imageUrls, query, page, totalPages) {
    const canvasWidth = 800;
    const canvasHeight = 1600;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🔍 Pinterest Searcher', 20, 45);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#b0b0b0';
    ctx.fillText(`Search results of "${query}", Showing ${imageUrls.length} images.`, 20, 75);

    const numColumns = 3;
    const padding = 15;
    const columnWidth = (canvasWidth - (padding * (numColumns + 1))) / numColumns;
    const columnHeights = Array(numColumns).fill(100);

    const loadedImages = await Promise.all(
        imageUrls.map(url => loadImage(url).catch(e => {
            console.error(`Failed to load image: ${url}`);
            return null; 
        }))
    );

    for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        if (!img) continue;

        const minHeight = Math.min(...columnHeights);
        const columnIndex = columnHeights.indexOf(minHeight);

        const x = padding + columnIndex * (columnWidth + padding);
        const y = minHeight + padding;

        const scale = columnWidth / img.width;
        const scaledHeight = img.height * scale;

        ctx.drawImage(img, x, y, columnWidth, scaledHeight);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, 50, 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${i + 1}`, x + 25, y + 12);

        ctx.fillStyle = '#b0b0b0';
        ctx.font = '10px Arial';
        ctx.fillText(`${img.width} x ${img.height}`, x + columnWidth - 30, y + scaledHeight - 8);

        columnHeights[columnIndex] += scaledHeight + padding;
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`YukiBot - Page ${page}/${totalPages}`, canvasWidth / 2, Math.max(...columnHeights) + 40);

    const outputPath = path.join(__dirname, 'cache', `pinterest_page_${Date.now()}.png`);
    await fs.ensureDir(path.dirname(outputPath));
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
}

module.exports = {
  config: {
    name: "pinterest",
    requiredMoney: 2000,
    aliases: ["Pinterest", "pin"],
    version: "2.0",
    author: "Mahi--",
    countDown: 10,
    role: 0,
    shortDescription: "Search Pinterest for images",
    longDescription: "Search Pinterest for images, with canvas view for Browse.",
    category: "image",
    guide: {
      en: "{pn} query [-count]\n" +
          "• If count is used, it sends images directly.\n" +
          "• If no count, it shows an interactive canvas.\n" +
          "• Example: {pn} cute cat -5 (direct send)\n" +
          "• Example: {pn} anime wallpaper (canvas view)"
    }
  },

  onStart: async function({ api, args, message, event }) {
    try {
      let count = null;
      const countArg = args.find(arg => /^-\d+$/.test(arg));
      if (countArg) {
        count = parseInt(countArg.slice(1), 10);
        args = args.filter(arg => arg !== countArg);
      }
      const query = args.join(" ").trim();
      if (!query) {
        return message.reply("Please provide a search query.");
      }

      const processingMessage = await message.reply("🔍 Searching on Pinterest wait...");

      if (count) { // Logic for sending multiple attachments directly
        const res = await axios.get(`https://egret-driving-cattle.ngrok-free.app/api/pin?query=${encodeURIComponent(query)}&num=${count}`);
        const urls = res.data.results || [];

        if (urls.length === 0) {
            return message.reply(`No images found for "${query}".`);
        }

        const streams = await Promise.all(urls.map(url => getStreamFromURL(url).catch(() => null)));
        const validStreams = streams.filter(s => s);

        await message.reply({
            body: `Here are ${validStreams.length} image(s) for "${query}":`,
            attachment: validStreams
        });

      } else { // Logic for canvas view
        const res = await axios.get(`https://egret-driving-cattle.ngrok-free.app/api/pin?query=${encodeURIComponent(query)}&num=90`);
        const allImageUrls = res.data.results || [];

        if (allImageUrls.length === 0) {
            return message.reply(`No images found for "${query}".`);
        }

        const imagesPerPage = 21;
        const totalPages = Math.ceil(allImageUrls.length / imagesPerPage);
        const i