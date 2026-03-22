const { getStreamsFromAttachment, log } = global.utils;

module.exports = {
    config: {
        name: "post",
        aliases: ["createpost", "fbpost"],
        version: "1.1",
        author: "Rasin",
        prefix: false,
        countDown: 5,
        role: 2,
        description: "Create a Facebook post with text, attachments, and mentions",
        category: "social",
        guide: {
            en: "   {pn} <text> - Create a post with text\n"
                + "   {pn} <text> [reply to message] - Create post with attachments\n"
                + "   {pn} url <link> <text> - Create post with URL preview\n"
                + "   {pn} group <groupID> <text> - Post to specific group"
        }
    },

    langs: {
        en: {
            missingText: "◆ Pleaꜱe Enter The Text For Your Poꜱt",
            missingUrl: "◆ Pleaꜱe Provide A URL\n◆ Uꜱage: post url <link> <text>",
            missingGroupId: "◆ Pleaꜱe Provide A Group ID\n◆ Uꜱage: post group <groupID> <text>",
            creating: "◆ Creating Your Poꜱt...",
            success: "◆ Poꜱt Created Succeꜱꜱfully!\n━━━━━━━━━━━━━━━━━\n◆ Poꜱt URL:\n%1",
            failed: "◆ Failed To Create Poꜱt\n◆ Error: %1",
            invalidUrl: "◆ The URL You Provided Iꜱ Not Accepted",
            uploadingAttachments: "◆ Uploading Attachmentꜱ...",
            noUrlFound: "◆ Poꜱt Created But URL Not Available\n◆ Check Your Facebook Profile/Group"
        }
    },

    onStart: async function ({ args, message, event, api, getLang }) {
        try {
            // Check if subcommand is used
            const subCommand = args[0]?.toLowerCase();
            let postData = {};

            if (subCommand === "url") {
                // Post with URL
                if (!args[1]) return message.reply(getLang("missingUrl"));
                
                const url = args[1];
                const text = args.slice(2).join(" ");
                
                postData = {
                    body: text,
                    url: url
                };
            } 
            else if (subCommand === "group") {
                // Post to group
                if (!args[1]) return message.reply(getLang("missingGroupId"));
                
                const groupID = args[1];
                const text = args.slice(2).join(" ");
                
                if (!text) return message.reply(getLang("missingText"));
                
                postData = {
                    body: text,
                    groupID: groupID
                };
            }
            else {
                // Regular post
                const text = args.join(" ");
                if (!text && !event.messageReply?.attachments?.length && !event.attachments?.length) {
                    return message.reply(getLang("missingText"));
                }
                
                postData = {
                    body: text || ""
                };
            }

            // Handle attachments
            const attachments = [
                ...(event.attachments || []),
                ...(event.messageReply?.attachments || [])
            ];

            if (attachments.length > 0) {
                message.reply(getLang("uploadingAttachments"));
                postData.attachment = await getStreamsFromAttachment(attachments);
            }

            // Send creating message
            const creatingMsg = await message.reply(getLang("creating"));

            // Create the post using the API
            const result = await new Promise((resolve, reject) => {
                api.createPost(postData, (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            });

            // Extract URL from result - handle different response formats
            let postUrl = null;
            
            if (typeof result === 'string') {
                // Direct URL string
                postUrl = result;
            } else if (result && result.data && result.data.story_create && result.data.story_create.story) {
                // Extract from GraphQL response
                postUrl = result.data.story_create.story.url;
            } else if (result && result[0] && result[0].data && result[0].data.story_create) {
                // Array format response
                postUrl = result[0].data.story_create.story?.url;
            }

            // Check if there were errors but post was still created
            if (result && result.errors && result.errors.length > 0) {
                log.warn("POST COMMAND", "Post created with warnings:", result.errors[0].message);
            }

            // IMPORTANT: If we have a URL, the post was successful regardless of errors array
            if (postUrl) {
                message.reply(getLang("success", postUrl), () => {
                    message.unsend(creatingMsg.messageID);
                });
            } else {
                // Only throw error if no URL was found
                throw new Error("Post may have been created but URL not available in response");
            }

        } catch (err) {
            // SPECIAL CASE: Post was created but API threw error due to warnings
            // Check if error object actually contains a successful post URL
            let postUrl = null;
            
            if (err && err.data && err.data.story_create && err.data.story_create.story) {
                postUrl = err.data.story_create.story.url;
            } else if (err && err[0] && err[0].data && err[0].data.story_create) {
                postUrl = err[0].data.story_create.story?.url;
            }
            
            // If URL exists, post was actually successful despite the "error"
            if (postUrl) {
                log.warn("POST COMMAND", "Post created successfully despite API warnings");
                return message.reply(getLang("success", postUrl));
            }
            
            // Otherwise, it's a real error
            log.err("POST COMMAND", err);
            
            // Handle error object safely
            let errorMsg = "Unknown error";
            
            if (typeof err === 'string') {
                errorMsg = err;
            } else if (err && err.error) {
                if (typeof err.error === 'string') {
                    errorMsg = err.error;
                } else if (err.error.message) {
                    errorMsg = err.error.message;
                }
            } else if (err && err.message) {
                errorMsg = err.message;
            } else if (err && err.errors && err.errors.length > 0) {
                errorMsg = err.errors[0].message;
            }
            
            // Handle specific errors
            if (errorMsg.includes("url is not accepted")) {
                return message.reply(getLang("invalidUrl"));
            }
            
            return message.reply(getLang("failed", errorMsg));
        }
    }
};