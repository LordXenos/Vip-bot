"use strict";

const utils = require("../utils");
const log = require("npmlog");

function formatFriendRequestData(response) {
  const list = response?.data?.friend_request_send?.friend_requestees;
  if (!Array.isArray(list)) return [];

  return list.map(item => ({
    id: item.id,
    friendship_status: item.friendship_status,
    action_id: item.profile_action?.id || null,
    action_title: item.profile_action?.title?.text || null,
    icon: item.profile_action?.icon_image?.uri || null
  }));
}

function formatCancelRequestData(response) {
  const item = response?.data?.friend_request_cancel?.cancelled_friend_requestee;
  if (!item) return [];

  return [{
    id: item.id,
    friendship_status: item.friendship_status,
    canceled: true,
    action_title: item.profile_action?.title?.text || null,
    icon: item.profile_action?.icon_image?.uri || null
  }];
}

module.exports = function (defaultFuncs, api, ctx) {

  function sendFriendRequest(friendIds, callback) {
    let resolveFunc, rejectFunc;
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof callback !== "function") {
      callback = (err, data) => err ? rejectFunc(err) : resolveFunc(data);
    }

    if (!friendIds || (Array.isArray(friendIds) && !friendIds.length)) {
      const err = new Error("sendFriendRequest requires friendIds");
      log.error("sendFriendRequest", err);
      return callback(err);
    }

    if (!Array.isArray(friendIds)) friendIds = [friendIds];

    const variables = {
      input: {
        click_correlation_id: Date.now().toString(),
        click_proof_validation_result: JSON.stringify({ validated: true }),
        friend_requestee_ids: friendIds.map(String),
        friending_channel: "PROFILE_BUTTON",
        warn_ack_for_ids: [],
        actor_id: String(ctx.userID),
        client_mutation_id: "1"
      },
      scale: 3
    };

    const form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FriendingCometFriendRequestSendMutation",
      server_timestamps: true,
      doc_id: "25491427290506954",
      variables: JSON.stringify(variables)
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(res => {
        if (res.errors) throw res.errors[0];
        if (!res.data?.friend_request_send)
          throw new Error("Friend request failed or response changed");
        callback(null, formatFriendRequestData(res));
      })
      .catch(err => {
        log.error("sendFriendRequest", err);
        callback(err);
      });

    return returnPromise;
  }

  function cancelFriendRequest(friendIds, callback) {
    let resolveFunc, rejectFunc;
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof callback !== "function") {
      callback = (err, data) => err ? rejectFunc(err) : resolveFunc(data);
    }

    if (!friendIds || (Array.isArray(friendIds) && !friendIds.length)) {
      const err = new Error("cancelFriendRequest requires friendIds");
      log.error("cancelFriendRequest", err);
      return callback(err);
    }

    if (!Array.isArray(friendIds)) friendIds = [friendIds];

    const variables = {
      input: {
        cancelled_friend_requestee_id: String(friendIds[0]),
        click_correlation_id: Date.now().toString(),
        click_proof_validation_result: JSON.stringify({ validated: true }),
        friending_channel: "PROFILE_BUTTON",
        actor_id: String(ctx.userID),
        client_mutation_id: "2"
      },
      scale: 3
    };

    const form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FriendingCometFriendRequestCancelMutation",
      server_timestamps: true,
      doc_id: "24453541284254355",
      variables: JSON.stringify(variables)
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(res => {
        if (res.errors) throw res.errors[0];
        if (!res.data?.friend_request_cancel)
          throw new Error("Cancel request failed or response changed");
        callback(null, formatCancelRequestData(res));
      })
      .catch(err => {
        log.error("cancelFriendRequest", err);
        callback(err);
      });

    return returnPromise;
  }

  return {
    sendFriendRequest,
    cancelFriendRequest
  };
};
