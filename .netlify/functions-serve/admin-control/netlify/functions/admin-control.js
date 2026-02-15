var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// netlify/functions/utils/common.js
var require_common = __commonJS({
  "netlify/functions/utils/common.js"(exports2, module2) {
    var sendResponse2 = (success, data = null, error = null, statusCode = 200) => {
      const origin = process.env.ALLOWED_ORIGIN || "*";
      return {
        statusCode,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        },
        body: JSON.stringify({
          success,
          data,
          error
        })
      };
    };
    var cache = /* @__PURE__ */ new Map();
    var getCached = (key) => {
      const item = cache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }
      return item.value;
    };
    var setCached = (key, value, ttlSeconds = 60) => {
      cache.set(key, {
        value,
        expiry: Date.now() + ttlSeconds * 1e3
      });
    };
    var rateLimitMap = /* @__PURE__ */ new Map();
    var checkRateLimit = (ip, limit = 50, windowMs = 6e4) => {
      const now = Date.now();
      const userStats = rateLimitMap.get(ip) || { count: 0, startTime: now };
      if (now - userStats.startTime > windowMs) {
        userStats.count = 1;
        userStats.startTime = now;
      } else {
        userStats.count++;
      }
      rateLimitMap.set(ip, userStats);
      return userStats.count <= limit;
    };
    var isValidPaxiAddress2 = (address) => {
      return /^paxi1[0-9a-z]{38,85}$/.test(address);
    };
    var adminState = {
      isFrozen: false,
      blockedAddresses: []
    };
    var getAdminState2 = () => adminState;
    var updateAdminState2 = (newState) => {
      adminState = { ...adminState, ...newState };
      return adminState;
    };
    module2.exports = {
      sendResponse: sendResponse2,
      getCached,
      setCached,
      checkRateLimit,
      isValidPaxiAddress: isValidPaxiAddress2,
      getAdminState: getAdminState2,
      updateAdminState: updateAdminState2
    };
  }
});

// netlify/functions/admin-control.js
var { sendResponse, getAdminState, updateAdminState, isValidPaxiAddress } = require_common();
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return sendResponse(true);
  let currentState = getAdminState();
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { action: bodyAction, value } = body;
      switch (bodyAction) {
        case "freeze":
          currentState = updateAdminState({ isFrozen: !!value });
          break;
        case "block":
          if (value && isValidPaxiAddress(value)) {
            const blocked = new Set(currentState.blockedAddresses);
            blocked.add(value);
            currentState = updateAdminState({ blockedAddresses: Array.from(blocked) });
          } else if (value) {
            return sendResponse(false, null, "Invalid address to block", 400);
          }
          break;
        case "unblock":
          if (value && isValidPaxiAddress(value)) {
            const blocked = currentState.blockedAddresses.filter((a) => a !== value);
            currentState = updateAdminState({ blockedAddresses: blocked });
          }
          break;
      }
    } catch (e) {
      return sendResponse(false, null, "Invalid request body", 400);
    }
  }
  return sendResponse(true, currentState);
};
//# sourceMappingURL=admin-control.js.map
