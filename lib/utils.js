const fs = require('fs');
const { isObject } = require('tm-is');

// Standart pad function.
const pad = (n) => (n < 10 ? `0${n}` : n);
// Convert Date object to local ISO string.
const localIsoDate = (date = new Date(), separator = 'T') => `${date.getFullYear()}-
  ${pad(date.getMonth() + 1)}-
  ${pad(date.getDate())}${separator}
  ${pad(date.getHours())}:
  ${pad(date.getMinutes())}:
  ${pad(date.getSeconds())}`;

// Log a message.
exports.logMsg = (...args) => {
  console.log(`[${localIsoDate()}]:`, ...args); // eslint-disable-line no-console
};
// Log an error.
exports.logError = (...args) => {
  console.error(`[${localIsoDate()}]:`, ...args); // eslint-disable-line no-console
};

/**
 * Parses JSON
 * @param {string} json
 * @returns {Object|false}
 */
const tryParseJSON = (json) => {
  try {
    const o = JSON.parse(json);
    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    return isObject(o) ? o : false;
  } catch (e) {
    return false;
  }
};

/**
 * Reads and parses json from a file.
 * @param {string} file path to the file.
 * @returns {Object|false}
 */
exports.readJson = async (file) => {
  const data = await fs.promises.readFile(file);
  return tryParseJSON(data);
};

exports.saveJson = (file, data) => {
  const json = JSON.stringify(data, null, 2);
  return fs.promises.writeFile(file, json);
};
