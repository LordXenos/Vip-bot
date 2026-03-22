module.exports = {
    config: {
        name: 'active',
        aliases: ['activestatus', 'status'],
        version: '1.0',
        author: 'Rasin',
        prefix: true,
        description: 'Toggle your active status on/off',
        usages: '!active <on|off>',
        countDown: 5,
        role: 2,
        category: 'admin'
    },

    onStart: async function ({ message, event, args, api }) {
        try {
            if (args.length === 0) {
                return message.reply('Please specify on or off');
            }

            const action = args[0].toLowerCase();
            let isActive;

            if (action === 'on' || action === '1' || action === 'true') {
                isActive = true;
            } else if (action === 'off' || action === '0' || action === 'false') {
                isActive = false;
            } else {
                return message.reply('Invalid option. Please use "on" or "off".\n\nExample:\n!active on\n!active off');
            }

            const processingMsg = await message.reply(`${isActive ? 'Turning ON' : 'Turning OFF'} active status...`);
            api.setActiveStatus(isActive, (err, data) => {
                if (err) {
                    console.error('Error setting active status:', err);
                    return message.reply('❌ Failed to change active status. Please try again later.');
                }

                if (data && data.success) {
                    const statusText = isActive ? '🟢 ON' : '⚫ OFF';
                    const statusEmoji = isActive ? '✅' : '🔴';
                    
                    message.reply(
                        `${statusEmoji} Active Status Changed!\n\n` +
                        `Status: ${statusText}\n` +
                        `Time: ${new Date().toLocaleString()}\n\n` +
                        `${isActive ? 'You are now visible as active to your friends.' : 'You are now invisible to your friends.'}`
                    );
                } else {
                    message.reply('Status change completed but response was unexpected.');
                }
            });

        } catch (error) {
            console.error('Error in active status command:', error);
            message.reply('❌ An error occurred while changing active status.');
        }
    }
}