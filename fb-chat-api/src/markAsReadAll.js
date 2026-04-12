"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  return function markAsReadAll(callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc();
      };
    }

    const folders = ["INBOX", "PENDING", "OTHERS"];

    function markFolderAsRead(index) {
      if (index >= folders.length) {
        return callback();
      }

      const form = { folder: folders[index] };
      defaultFuncs
        .post(
          "https://www.facebook.com/ajax/mercury/mark_folder_as_read.php",
          ctx.jar,
          form
        )
        .then(utils.saveCookies(ctx.jar))
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then((resData) => {
          if (!resData) return markFolderAsRead(index + 1);
          if (resData.error) throw resData;
          markFolderAsRead(index + 1);
        })
        .catch((err) => {
          log.error("markAsReadAll", err);
          return callback(err);
        });
    }

    markFolderAsRead(0);
    return returnPromise;
  };
};
