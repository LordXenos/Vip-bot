const axios = require('axios');

module.exports = {
    config: {
        name: 'gpt4',
        aliases: [],
        version: '2.0',
        author: 'Rasin',
        prefix: true,
        description: 'Chat with AI (GPT)',
        usages: '!gpt4 <your question>',
        countDown: 5,
        role: 0,
        category: 'ai'
    },

    onStart: async function ({ message, event, args, api }) {
        try {
            if (args.length === 0) {
                return message.reply('⚠️ Please provide a question.\n\nUsage: !gpt4 <your question>\n\nExample: !gpt4 What is artificial intelligence?');
            }

            const query = args.join(' ');

            // Send typing indicator
            api.sendTypingIndicator(event.threadID);

            // API 1: Blackbox AI (Free and reliable)
            try {
                const blackboxResponse = await axios.post('https://www.blackbox.ai/api/chat', {
                    messages: [{ role: 'user', content: query }],
                    previewToken: null,
                    userId: null,
                    codeModelMode: true,
                    agentMode: {},
                    trendingAgentMode: {},
                    isMicMode: false,
                    isChromeExt: false,
                    githubToken: null
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                });

                if (blackboxResponse.data) {
                    const response = blackboxResponse.data.trim();
                    if (response) {
                        return message.reply(`🤖 AI Response:\n\n${response}`);
                    }
                }
            } catch (blackboxError) {
                console.error('Blackbox AI error:', blackboxError);
            }

            // API 2: GPT4Free (Multiple models)
            try {
                const gpt4freeResponse = await axios.post('https://api.kastg.xyz/api/ai/chatgptv2', {
                    prompt: query,
                    customId: event.senderID
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                });

                if (gpt4freeResponse.data && gpt4freeResponse.data.response) {
                    return message.reply(`🤖 AI Response:\n\n${gpt4freeResponse.data.response}`);
                }
            } catch (gpt4freeError) {
                console.error('GPT4Free error:', gpt4freeError);
            }

            // API 3: OpenAI Alternative via Ryzen
            try {
                const ryzenResponse = await axios.get(`https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(query)}`, {
                    timeout: 30000
                });

                if (ryzenResponse.data && ryzenResponse.data.response) {
                    return message.reply(`🤖 AI Response:\n\n${ryzenResponse.data.response}`);
                }
            } catch (ryzenError) {
                console.error('Ryzen API error:', ryzenError);
            }

            // API 4: Hercai AI
            try {
                const hercaiResponse = await axios.get(`https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(query)}`, {
                    timeout: 30000
                });

                if (hercaiResponse.data && hercaiResponse.data.reply) {
                    return message.reply(`🤖 AI Response:\n\n${hercaiResponse.data.reply}`);
                }
            } catch (hercaiError) {
                console.error('Hercai error:', hercaiError);
            }

            // API 5: Simple chatbot fallback
            try {
                const chatbotResponse = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(query)}&owner=Rasin&botname=AI`, {
                    timeout: 30000
                });

                if (chatbotResponse.data && chatbotResponse.data.response) {
                    return message.reply(`🤖 AI Response:\n\n${chatbotResponse.data.response}`);
                }
            } catch (chatbotError) {
                console.error('Chatbot error:', chatbotError);
            }

            throw new Error('All APIs failed');

        } catch (error) {
            console.error('GPT-4 error:', error);
            return message.reply('❌ Failed to get AI response. All services are currently unavailable. Please try again later.');
        }
    }
};