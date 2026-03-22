const { getPrefix } = global.utils;

module.exports = {
    config: {
        name: "postreact",
        aliases: ["react", "preact", "reactpost"],
        version: "1.1",
        author: "Rasin",
        countDown: 5,
        role: 0,
        description: "React to Facebook posts with different emotions",
        category: "social",
        guide: {
            en: "{pn} <postID> <reaction> - React to a post\n"
        }
    },

    onStart: async function ({ message, args, api, event }) {
        const postID = args[0];
        const reactionType = args[1];

        if (!postID || !reactionType) {
            return message.reply(
                `━━━━━━━━━━━━━━━━━\n` +
                `◈ Poꜱt Reaction Command ◈\n` +
                `━━━━━━━━━━━━━━━━━\n\n` +
                `◆ Uꜱage: ${getPrefix(event.threadID)}postreact <postID> <reaction>\n\n` +
                `◆ Available Reactionꜱ:\n` +
                `◆ Like\n` +
                `◆ Love\n` +
                `◆ Care\n` +
                `◆ Haha\n` +
                `◆ Wow\n` +
                `◆ Sad\n` +
                `◆ Angry\n` +
                `◆ unlike - Remove Reaction\n\n` +
                `◆ Example:\n` +
                `${getPrefix(event.threadID)}postreact pfbid123... love`
            );
        }


        const reactionMap = {
            "unlike": "unlike",
            "like": "like",
            "love": "heart",    
            "care": "love",       
            "haha": "haha",
            "wow": "wow",
            "sad": "sad",
            "angry": "angry"
        };


        const emojiMap = {
            "like": "👍",
            "love": "❤️",
            "care": "🤗",
            "haha": "😆",
            "wow": "😮",
            "sad": "😢",
            "angry": "😠"
        };

        const normalizedReaction = reactionType.toLowerCase();

        if (!reactionMap[normalizedReaction]) {
            return message.reply(
                `◆ Invalid Reaction Type!\n\n` +
                `◆ Available Reactionꜱ:\n` +
                `◆ like, love, care, haha, wow, sad, angry, unlike\n\n` +
                `◆ Example:\n` +
                `${getPrefix(event.threadID)}postreact ${postID} love`
            );
        }

        try {

            if (!api.setPostReaction) {
                return message.reply(
                    "◆ Poꜱt Reaction Feature Iꜱ Not Available\n" +
                    "◆ Pleaꜱe Enꜱure The API Iꜱ Properly Configured"
                );
            }


            const apiReaction = reactionMap[normalizedReaction];
            
            const result = await new Promise((resolve, reject) => {
                api.setPostReaction(postID, apiReaction, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });


            let responseText = "";
            
            if (normalizedReaction === "unlike") {
                responseText = 
                    `━━━━━━━━━━━━━━━━━\n` +
                    `◈ Reaction Removed ◈\n` +
                    `━━━━━━━━━━━━━━━━━\n\n` +
                    `◆ Poꜱt ID: ${postID}\n` +
                    `◆ Action: Removed All Reactionꜱ ✅`;
            } else {
                const emoji = emojiMap[normalizedReaction] || "";
                responseText = 
                    `━━━━━━━━━━━━━━━━━\n` +
                    `◈ Reacted Succeꜱꜱfully ◈\n` +
                    `━━━━━━━━━━━━━━━━━\n\n` +
                    `◆ Poꜱt ID: ${postID}\n` +
                    `◆ Reaction: ${normalizedReaction.toUpperCase()} ${emoji}`;
                

                if (result && typeof result.reaction_count !== 'undefined') {
                    responseText += `\n◆ Total Reactionꜱ: ${result.reaction_count}`;
                }


                if (result && result.top_reactions && Array.isArray(result.top_reactions) && result.top_reactions.length > 0) {
                    responseText += "\n\n◆ Top Reactionꜱ On Thiꜱ Poꜱt:";
                    
                    result.top_reactions.slice(0, 3).forEach(edge => {
                        if (edge && edge.node && edge.node.reaction_type && edge.node.reaction_count) {
                            const reactionName = edge.node.reaction_type.toLowerCase();
                            let displayName = reactionName;
                            if (reactionName === "heart") displayName = "love ❤️";
                            else if (reactionName === "love") displayName = "care 🤗";
                            else if (emojiMap[reactionName]) displayName = `${reactionName} ${emojiMap[reactionName]}`;
                            
                            responseText += `\n  • ${displayName}: ${edge.node.reaction_count}`;
                        }
                    });
                }
            }

            return message.reply(responseText);

        } catch (error) {
            console.error("PostReact Error:", error);
            
            let errorMessage = 
                `━━━━━━━━━━━━━━━━━\n` +
                `◈ Reaction Failed ◈\n` +
                `━━━━━━━━━━━━━━━━━\n\n`;
            
            if (error.error) {
                errorMessage += `◆ Error: ${error.error}`;
            } else if (error.message) {
                errorMessage += `◆ Error: ${error.message}`;
            } else {
                errorMessage += "◆ An Unknown Error Occurred";
            }

            errorMessage += 
                "\n\n◆ Troubleꜱhooting:\n" +
                "  • Verify The Poꜱt ID Iꜱ Correct\n" +
                "  • Check If You Have Permiꜱꜱion\n" +
                "  • Enꜱure The Poꜱt Iꜱ Acceꜱꜱible\n" +
                "  • Try A Different Reaction Type";

            return message.reply(errorMessage);
        }
    }
};