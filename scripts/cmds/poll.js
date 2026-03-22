module.exports = {
  config: {
    name: "poll",
    version: "1.1",
    author: "Rasin",
    countDown: 5,
    role: 0,
    description: "Create a poll in the group chat",
    category: "box chat",
    guide: {
      en: "{pn} <question> | <option1> | <option2> | [option3] | ...\n"
        + "Example: {pn} What's your favorite color? | Red | Blue | Green | Yellow"
    }
  },

  langs: {
    en: {
      missingQuestion: "Please provide a question for the poll",
      missingOptions: "Please provide at least 2 options for the poll\nFormat: {pn} <question> | <option1> | <option2>",
      tooManyOptions: "Maximum 10 options allowed",
      onlyInGroup: "This command can only be used in group chats",
      pollCreated: "Poll created successfully!",
      pollFailed: "Failed to create poll: {1}\n\nPossible reasons:\n• The group may not support polls\n• Facebook API restrictions\n• Bot account limitations\n\nTry using Facebook's built-in poll feature instead.",
      invalidFormat: "Invalid format. Use: {pn} <question> | <option1> | <option2> | ...",
      apiNotSupported: "⚠️ Poll creation via API is currently not supported by Facebook.\n\nPlease create polls manually:\n1. Click the '+' button in the chat\n2. Select 'Poll'\n3. Enter your question and options\n\n📋 Your poll details:\n━━━━━━━━━━━━━━━━\n❓ Question: {1}\n\n📊 Options:\n{2}"
    }
  },

  onStart: async function ({ api, event, args, getLang, message }) {
    const { threadID, isGroup } = event;

    // Check if command is used in a group
    if (!isGroup) {
      return message.reply(getLang("onlyInGroup"));
    }

    // Check if args are provided
    if (args.length === 0) {
      return message.reply(getLang("missingQuestion"));
    }

    // Join args and split by |
    const input = args.join(" ").split("|").map(item => item.trim());

    // Extract question and options
    const question = input[0];
    const options = input.slice(1);

    // Validate input
    if (!question) {
      return message.reply(getLang("missingQuestion"));
    }

    if (options.length < 2) {
      return message.reply(getLang("missingOptions"));
    }

    if (options.length > 10) {
      return message.reply(getLang("tooManyOptions"));
    }

    // Filter out empty options
    const validOptions = options.filter(opt => opt.length > 0);

    if (validOptions.length < 2) {
      return message.reply(getLang("missingOptions"));
    }

    // Format options for display
    const optionsText = validOptions.map((opt, idx) => `${idx + 1}. ${opt}`).join("\n");

    // Try to create poll, but handle the known API limitation
    try {
      // Create options object (all options initially unselected)
      const pollOptions = {};
      validOptions.forEach(option => {
        pollOptions[option] = false;
      });

      // Attempt to create the poll
      const result = await new Promise((resolve, reject) => {
        api.createPoll(question, threadID, pollOptions, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      // Check if result indicates failure
      if (result && result.payload && result.payload.status === 'failure') {
        throw new Error(result.payload.errorMessage || "Facebook API returned failure status");
      }

      return message.reply(getLang("pollCreated"));
    } catch (error) {
      console.error("Poll creation error:", error);
      
      // Provide helpful fallback message with poll details
      const fallbackMsg = getLang("apiNotSupported", question, optionsText);
      return message.reply(fallbackMsg);
    }
  }
};