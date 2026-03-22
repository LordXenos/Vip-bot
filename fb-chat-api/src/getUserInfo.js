"use strict";

const utils = require("../utils");
const log = require("npmlog");

function formatData(data) {
  const retObj = {};

  for (const prop in data) {
    if (!data.hasOwnProperty(prop)) continue;

    const innerObj = data[prop];

    const userData = {
      id: innerObj.id || prop,
      name: innerObj.name || null,
      firstName: innerObj.firstName || null,
      vanity: innerObj.vanity || null,
      thumbSrc: innerObj.thumbSrc || null,
      profileUrl: innerObj.uri || null,
      gender: innerObj.gender || null,
      i18nGender: innerObj.i18nGender || null,
      type: innerObj.type || null,
      isFriend: innerObj.is_friend || false,
      isBirthday: !!innerObj.is_birthday,
      isBlocked: !!innerObj.is_blocked,
      isNonfriendMessengerContact: !!innerObj.is_nonfriend_messenger_contact,
      mThumbSrcSmall: innerObj.mThumbSrcSmall || null,
      mThumbSrcLarge: innerObj.mThumbSrcLarge || null,
      dir: innerObj.dir || null,
      alternateName: innerObj.alternateName || null,
      searchTokens: innerObj.searchTokens || [],
      extra: {}
    };

    const excludedKeys = Object.keys(userData).concat([
      "id",
      "name",
      "firstName",
      "vanity",
      "thumbSrc",
      "uri",
      "gender",
      "i18nGender",
      "type",
      "is_friend",
      "is_birthday",
      "is_blocked",
      "is_nonfriend_messenger_contact",
      "mThumbSrcSmall",
      "mThumbSrcLarge",
      "dir",
      "alternateName",
      "searchTokens"
    ]);

    for (const key in innerObj) {
      if (!excludedKeys.includes(key)) {
        userData.extra[key] = innerObj[key];
      }
    }

    retObj[prop] = userData;
  }

  return retObj;
}

module.exports = function (defaultFuncs, api, ctx) {
  return function getUserInfo(id, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, result) {
        if (err) return rejectFunc(err);
        resolveFunc(result);
      };
    }

    if (utils.getType(id) !== "Array") {
      id = [id];
    }

    const form = {};
    id.forEach((v, i) => {
      form[`ids[${i}]`] = v;
    });

    defaultFuncs
      .post("https://www.facebook.com/chat/user_info/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {
        if (resData.error) throw resData;
        const formatted = formatData(resData.payload?.profiles || {});
        callback(null, formatted);
      })
      .catch((err) => {
        log.error("getUserInfo", err);
        callback(err);
      });

    return returnPromise;
  };
};
