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
    var getCached2 = (key) => {
      const item = cache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }
      return item.value;
    };
    var setCached2 = (key, value, ttlSeconds = 60) => {
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
    var isValidPaxiAddress = (address) => {
      return /^paxi1[0-9a-z]{38,85}$/.test(address);
    };
    var adminState = {
      isFrozen: false,
      blockedAddresses: []
    };
    var getAdminState = () => adminState;
    var updateAdminState = (newState) => {
      adminState = { ...adminState, ...newState };
      return adminState;
    };
    module2.exports = {
      sendResponse: sendResponse2,
      getCached: getCached2,
      setCached: setCached2,
      checkRateLimit,
      isValidPaxiAddress,
      getAdminState,
      updateAdminState
    };
  }
});

// netlify/functions/gas-estimate.js
var { sendResponse, getCached, setCached } = require_common();
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return sendResponse(true);
  const { msgs = 1 } = event.queryStringParameters || {};
  const msgCount = parseInt(msgs);
  const cacheKey = `gas_estimate_${msgCount}`;
  const cached = getCached(cacheKey);
  if (cached) return sendResponse(true, cached);
  const GAS_PRICE = 0.025;
  const BASE_GAS = 5e5;
  const ADDITIONAL_MSG_GAS = 3e5;
  const baseGasLimit = BASE_GAS + ADDITIONAL_MSG_GAS * (msgCount - 1);
  const gasLimit = Math.ceil(baseGasLimit * 1.4);
  const estimatedFee = Math.ceil(gasLimit * GAS_PRICE);
  const data = {
    gasPrice: GAS_PRICE.toString(),
    gasLimit: gasLimit.toString(),
    estimatedFee: estimatedFee.toString(),
    usdValue: "0.00"
    // Requires external Oracle for real USD
  };
  setCached(cacheKey, data, 300);
  return sendResponse(true, data);
};
//# sourceMappingURL=gas-estimate.js.map
