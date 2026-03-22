"use strict";

const log = require("npmlog");
const utils = require("../utils.js");

module.exports = function (defaultFuncs, api, ctx) {
  return function evalCode(run, callback) {
        const { args, message, event } = run;
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!Array.isArray(args)) {
      const err = new Error("args must be an array of strings.");
      log.error("evalCode", err);
      if (callback) callback(err);
      return rejectFunc(err);
    }

    if (!callback) {
      callback = function (err, result) {
        if (err) return rejectFunc(err);
        resolveFunc(result);
      };
    }

    function output(msg) {
      if (typeof msg === "number" || typeof msg === "boolean" || typeof msg === "function")
        msg = msg.toString();
      else if (msg instanceof Map) {
        let text = `Map(${msg.size}) `;
        text += JSON.stringify(mapToObj(msg), null, 2);
        msg = text;
      } else if (typeof msg === "object")
        msg = JSON.stringify(msg, null, 2);
      else if (typeof msg === "undefined")
        msg = "undefined";

      message.reply(msg);
    }

    function out(msg) {
      output(msg);
    }

    function mapToObj(map) {
      const obj = {};
      map.forEach(function (v, k) {
        obj[k] = v;
      });
      return obj;
    }

    function removeHomeDir(str) {
      return str.replace(process.env.HOME || "~", "~");
    }

    const code = `
      (async () => {
        try {
          ${args.join(" ")}
        } catch(err) {
          log.error("evalCode", err);
          message.send(
            "[Eval Error]\\n" +
            (err.stack ? removeHomeDir(err.stack) : removeHomeDir(JSON.stringify(err, null, 2) || ""))
          );
        }
      })()
    `;

    try {
      const result = eval(code);
      callback(null, result);
    } catch (err) {
      log.error("evalCode", err);
      callback(err, null);
    }

    return returnPromise;
  };
};