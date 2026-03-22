const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: 'shazam',
        aliases: ['recognize', 'whatsong'],
        version: '2.0',
        author: 'Rasin',
        prefix: true,
        description: 'Identify songs from audio/video',
        usages: '!shazam <reply to audio/video>',
        countDown: 10,
        role: 0,
        category: 'shazam'
    },

    onStart: async function ({ message, event, args, api }) {
        try {
            if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
                return message.reply('Please reply to an audio or video');
            }

            const attachment = event.messageReply.attachments[0];

            if (attachment.type !== 'audio' && attachment.type !== 'video') {
                return message.reply('Please reply to an audio or video only');
            }

            const mediaUrl = attachment.url;

            message.reply('Identifying song... Please wait...');

            try {
                const auddResponse = await axios.post('https://api.audd.io/', 
                    `url=${encodeURIComponent(mediaUrl)}&return=apple_music,spotify`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 60000
                    }
                );

                if (auddResponse.data && auddResponse.data.status === 'success' && auddResponse.data.result) {
                    const track = auddResponse.data.result;
                    
                    let songInfo = `🎵 Details\n\n`;
                    songInfo += `Title: ${track.title}\n`;
                    songInfo += `Artist: ${track.artist}\n`;
                    
                    if (track.album) {
                        songInfo += `Album: ${track.album}\n`;
                    }
                    
                    if (track.release_date) {
                        songInfo += `Released: ${track.release_date}\n`;
                    }
                    
                    if (track.spotify) {
                        songInfo += `\n🎧 Spotify: ${track.spotify.external_urls?.spotify || 'N/A'}`;
                    }
                    
                    if (track.apple_music) {
                        songInfo += `\n🍎 Apple Music: ${track.apple_music.url || 'N/A'}`;
                    }

                    return message.reply(songInfo);
                }
            } catch (auddError) {
                console.error('AudD API error:', auddError);
            }

            try {
                const acrResponse = await axios.post('https://api-v2.soundhound.com/audio/search', {
                    url: mediaUrl
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                });

                if (acrResponse.data && acrResponse.data.tracks && acrResponse.data.tracks.length > 0) {
                    const track = acrResponse.data.tracks[0];
                    
                    let songInfo = `🎵 Details \n\n`;
                    songInfo += `Title: ${track.title}\n`;
                    songInfo += `Artist: ${track.artist}\n`;
                    
                    if (track.album) {
                        songInfo += `Album: ${track.album}\n`;
                    }

                    return message.reply(songInfo);
                }
            } catch (acrError) {
                console.error('ACRCloud API error:', acrError);
            }

            try {
                const shazamResponse = await axios.get(
                    `https://shazam-api6.p.rapidapi.com/shazam/recognize?url=${encodeURIComponent(mediaUrl)}`,
                    {
                        headers: {
                            'X-RapidAPI-Host': 'shazam-api6.p.rapidapi.com'
                        },
                        timeout: 60000
                    }
                );

                if (shazamResponse.data && shazamResponse.data.track) {
                    const track = shazamResponse.data.track;
                    
                    let songInfo = `🎵 Details \n\n`;
                    songInfo += `Title: ${track.title}\n`;
                    songInfo += `Artist: ${track.subtitle}\n`;

                    return message.reply(songInfo);
                }
            } catch (shazamError) {
                console.error('Shazam API error:', shazamError);
            }

            try {
                const audioResponse = await axios.get(mediaUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 30000
                });

                const FormData = require('form-data');
                const form = new FormData();
                form.append('file', Buffer.from(audioResponse.data), 'audio.mp3');

                const uploadResponse = await axios.post('https://api.audd.io/', form, {
                    headers: {
                        ...form.getHeaders()
                    },
                    timeout: 60000
                });

                if (uploadResponse.data && uploadResponse.data.status === 'success' && uploadResponse.data.result) {
                    const track = uploadResponse.data.result;
                    
                    let songInfo = `🎵 Details \n\n`;
                    songInfo += `Title: ${track.title}\n`;
                    songInfo += `Artist: ${track.artist}\n`;
                    
                    if (track.album) {
                        songInfo += `Album: ${track.album}\n`;
                    }

                    return message.reply(songInfo);
                }
            } catch (uploadError) {
                console.error('Upload recognition error:', uploadError);
            }

            return message.reply(
                '❌ Could not identify the song.\n\n' +
                'Possible reasons:\n' +
                '• Audio quality is too low\n' +
                '• Song is not in the database\n' +
                '• Background noise is too loud\n' +
                '• Audio is too short\n\n' +
                'Try uploading a clearer audio clip (at least 10 seconds).'
            );

        } catch (error) {
            console.error('error:', error);
            return message.reply('❌ Failed to identify song. Please try again later.');
        }
    }
};