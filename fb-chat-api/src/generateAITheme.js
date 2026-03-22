"use strict";

const helper = require("../utils");
const logger = require("npmlog");

module.exports = (core, api, context) => {

  return function generateAITheme(text, cfg = {}, cb) {
    let done, fail;

    const task = new Promise((res, rej) => {
      done = res;
      fail = rej;
    });

    // callback normalize
    if (typeof cfg === "function") {
      cb = cfg;
      cfg = {};
    }

    if (!cb) {
      cb = (e, d) => e ? fail(e) : done(d);
    }

    if (!text || typeof text !== "string") {
      return cb({ error: "Invalid or missing prompt" });
    }

    const themeLimit = Math.min(Number(cfg.count) || 1, 5);
    const previewImage = cfg.image || null;

    const payload = {
      client_mutation_id: String(Math.floor(Math.random() * 9999)),
      actor_id: context.userID,
      bypass_cache: true,
      caller: "MESSENGER",
      num_themes: themeLimit,
      prompt: text
    };

    if (previewImage) payload.image_url = previewImage;

    const requestBody = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "AIThemeGenerator",
      doc_id: "23873748445608673",
      server_timestamps: true,
      variables: JSON.stringify({ input: payload }),
      qpl_active_flow_ids: "25309433,521485406",
      fb_api_analytics_tags: JSON.stringify([
        "qpl_active_flow_ids=25309433,521485406"
      ])
    };

    core.post("https://www.facebook.com/api/graphql/", context.jar, requestBody)
      .then(helper.parseAndCheckLogin(context, core))
      .then(data => {
        const root = data?.data?.xfb_generate_ai_themes_from_prompt;
        if (!root || !root.success || !Array.isArray(root.themes)) {
          throw new Error("Theme generation failed");
        }

        const themes = root.themes.map((t, i) => ({
          index: i + 1,
          id: t.id,
          title: t.accessibility_label,
          description: t.description,
          colors: {
            composer: t.composer_background_color,
            gradient: t.gradient_colors,
            fallback: t.fallback_color,
            titleBar: t.title_bar_background_color,
            text: t.message_text_color,
            button: t.primary_button_background_color
          },
          images: {
            background: t.background_asset?.image?.uri || null,
            icon: t.icon_asset?.image?.uri || null
          },
          alternatives: (t.alternative_themes || []).map(a => ({
            id: a.id,
            name: a.accessibility_label,
            bg: a.background_asset?.image?.uri || null,
            icon: a.icon_asset?.image?.uri || null
          }))
        }));

        const output = {
          success: true,
          total: themes.length,
          themes,
          ...themes[0]
        };

        return cb(null, output);
      })
      .catch(err => {
        logger.error("AITheme", err);

        let msg = "Theme generation error";

        if (/auth|permission/i.test(err.message)) {
          msg = "Permission denied for AI theme access";
        } else if (/rate/i.test(err.message)) {
          msg = "Too many requests, slow down";
        }

        return cb({
          error: msg,
          detail: err.message || err,
          code: err.statusCode || null
        });
      });

    return task;
  };
};
