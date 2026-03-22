const axios = require('axios');

module.exports = {
    config: {
        name: 'spotify',
        aliases: ['spot', 'music'],
        version: '2.0',
        author: 'Rasin',
        prefix: true,
        description: 'Search Spotify tracks and get info',
        usages: '!spotify <track name>',
        countDown: 5,
        role: 0,
        category: 'music'
    },

    onStart: async function ({ message, event, args, api }) {
        try {
            if (args.length === 0) {
                return message.reply('⚠️ Please provide a track name.\n\nUsage: !spotify <track name>\n\nExample: !spotify Blinding Lights');
            }

            const query = args.join(' ');

            // Send searching message
            message.reply(`Searching for "${query}" on Spotify...`);

            // API 1: Spotify via Ryzen (Most reliable)
            try {
                const response = await axios.get(`https://api.ryzendesu.vip/api/search/spotify?song=${encodeURIComponent(query)}`);

                if (response.data && response.data.status && response.data.data && response.data.data.length > 0) {
                    const track = response.data.data[0];
                    
                    let trackInfo = `🎵 Spotify Track Found!\n\n`;
                    trackInfo += `Title: ${track.title}\n`;
                    trackInfo += `Artist: ${track.artist}\n`;
                    
                    if (track.album) {
                        trackInfo += `Album: ${track.album}\n`;
                    }
                    if (track.duration) {
                        trackInfo += `Duration: ${track.duration}\n`;
                    }
                    if (track.popularity) {
                        trackInfo += `Popularity: ${track.popularity}/100\n`;
                    }
                    
                    trackInfo += `\n🔗 Listen: ${track.url}`;

                    // Try to get album art
                    if (track.image) {
                        try {
                            const imageResponse = await axios.get(track.image, { responseType: 'stream' });
                            return api.sendMessage(
                                {
                                    body: trackInfo,
                                    attachment: imageResponse.data
                                },
                                event.threadID
                            );
                        } catch (imgErr) {
                            return message.reply(trackInfo);
                        }
                    } else {
                        return message.reply(trackInfo);
                    }
                }
            } catch (ryzenError) {
                console.error('Ryzen Spotify API error:', ryzenError);
            }

            // API 2: Spotify via Joshweb
            try {
                const joshResponse = await axios.get(`https://joshweb.click/api/spotify?q=${encodeURIComponent(query)}`);

                if (joshResponse.data && joshResponse.data.result) {
                    const track = joshResponse.data.result;
                    
                    let trackInfo = `🎵 Spotify Track Found!\n\n`;
                    trackInfo += `Title: ${track.name}\n`;
                    trackInfo += `Artist: ${track.artists}\n`;
                    trackInfo += `Album: ${track.album}\n`;
                    trackInfo += `Duration: ${track.duration}\n`;
                    trackInfo += `\n🔗 Listen: ${track.url}`;

                    if (track.thumbnail) {
                        try {
                            const imageResponse = await axios.get(track.thumbnail, { responseType: 'stream' });
                            return api.sendMessage(
                                {
                                    body: trackInfo,
                                    attachment: imageResponse.data
                                },
                                event.threadID
                            );
                        } catch (imgErr) {
                            return message.reply(trackInfo);
                        }
                    } else {
                        return message.reply(trackInfo);
                    }
                }
            } catch (joshError) {
                console.error('Joshweb Spotify API error:', joshError);
            }

            // API 3: Spotify via Deku
            try {
                const dekuResponse = await axios.get(`https://deku-rest-api.gleeze.com/search/spotify?q=${encodeURIComponent(query)}`);

                if (dekuResponse.data && dekuResponse.data.result && dekuResponse.data.result.length > 0) {
                    const track = dekuResponse.data.result[0];
                    
                    let trackInfo = `🎵 Spotify Track Found!\n\n`;
                    trackInfo += `Title: ${track.name}\n`;
                    trackInfo += `Artist: ${track.artist}\n`;
                    trackInfo += `Album: ${track.album}\n`;
                    trackInfo += `Duration: ${track.duration}\n`;
                    trackInfo += `\n🔗 Listen: ${track.url}`;

                    if (track.image) {
                        try {
                            const imageResponse = await axios.get(track.image, { responseType: 'stream' });
                            return api.sendMessage(
                                {
                                    body: trackInfo,
                                    attachment: imageResponse.data
                                },
                                event.threadID
                            );
                        } catch (imgErr) {
                            return message.reply(trackInfo);
                        }
                    } else {
                        return message.reply(trackInfo);
                    }
                }
            } catch (dekuError) {
                console.error('Deku Spotify API error:', dekuError);
            }

            return message.reply(`❌ No tracks found for "${query}". Try a different search term or artist name.`);

        } catch (error) {
            console.error('Spotify error:', error);
            return message.reply('❌ Failed to search Spotify. Please try again later.');
        }
    }
};