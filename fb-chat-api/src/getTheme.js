"use strict";

const utils = require("../utils");
const log = require("npmlog");

function formatTheme(theme) {
	if (!theme) return null;

	const darkTheme = theme.alternative_themes?.[0] || null;

	const extractTheme = (t) => {
		const raw = {
			id: t.id,
			name: t.accessibility_label,
			description: t.description,
			appColorMode: t.app_color_mode,
			isDeprecated: t.is_deprecated,
			backgroundUrl: t.background_asset?.image?.uri,
			iconUrl: t.icon_asset?.image?.uri,
			gradientColors: t.gradient_colors,
			backgroundGradientColors: t.background_gradient_colors,
			reactionPillColor: t.reaction_pill_background_color,
			composerBgColor: t.composer_background_color,
			composerTintColor: t.composer_tint_color,
			composerInputBgColor: t.composer_input_background_color,
			primaryButtonBgColor: t.primary_button_background_color,
			titleBarTextColor: t.title_bar_text_color,
			titleBarBgColor: t.title_bar_background_color,
			titleBarButtonTintColor: t.title_bar_button_tint_color,
			titleBarAttributionColor: t.title_bar_attribution_color,
			inboundMessageGradientColors: t.inbound_message_gradient_colors,
			inboundMessageTextColor: t.inbound_message_text_color,
			inboundMessageBorderColor: t.inbound_message_border_color,
			inboundMessageBorderWidth: t.inbound_message_border_width,
			hotLikeColor: t.hot_like_color,
			messageTextColor: t.message_text_color,
			messageBorderColor: t.message_border_color,
			messageBorderWidth: t.message_border_width,
			secondaryTextColor: t.secondary_text_color,
			tertiaryTextColor: t.tertiary_text_color,
			fallbackColor: t.fallback_color,
			reverseRadialGradient: t.reverse_gradients_for_radial
		};

		const cleaned = {};
		for (const [key, value] of Object.entries(raw)) {
			if (
				value !== null &&
				value !== undefined &&
				!(Array.isArray(value) && value.length === 0)
			) {
				cleaned[key] = value;
			}
		}
		return cleaned;
	};

	const formatted = {
		normal: extractTheme(theme)
	};

	if (darkTheme) {
		const dark = extractTheme(darkTheme);
		if (Object.keys(dark).length > 0) {
			formatted.dark = dark;
		}
	}

	return formatted;
}

module.exports = function(defaultFuncs, api, ctx) {
	return function getTheme(themeID, callback) {
		let resolveFunc = function() {};
		let rejectFunc = function() {};
		const returnPromise = new Promise(function(resolve, reject) {
			resolveFunc = resolve;
			rejectFunc = reject;
		});

		if (utils.getType(callback) !== "Function" && utils.getType(callback) !== "AsyncFunction") {
			callback = function(err, data) {
				if (err) {
					return rejectFunc(err);
				}
				resolveFunc(data);
			};
		}

		if (!themeID) {
			const err = new Error("getTheme requires a themeID to be provided.");
			log.error("getTheme", err);
			return callback(err);
		}

		const form = {
			doc_id: "24474714052117636",
			variables: JSON.stringify({ "id": themeID }),
			fb_api_caller_class: "RelayModern",
			fb_api_req_friendly_name: "MWPThreadThemeProviderQuery"
		};

		defaultFuncs
			.post("https://www.facebook.com/api/graphql/", ctx.jar, form)
			.then(utils.parseAndCheckLogin(ctx, defaultFuncs))
			.then(function(resData) {
				if (resData.errors) {
					throw resData.errors[0];
				}
				if (!resData.data || !resData.data.messenger_thread_theme) {
					throw new Error(`Theme with ID ${themeID} not found or API has changed.`);
				}

				const formattedTheme = formatTheme(resData.data.messenger_thread_theme);
				callback(null, formattedTheme);
			})
			.catch(function(err) {
				log.error("getTheme", err);
				return callback(err);
			});

		return returnPromise;
	};
};
