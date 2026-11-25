const { promises: fs } = require('node:fs');
const { isObject } = require('tm-is');

/**
 * Pads number with 0 if needed.
 * @param {number} n
 * @returns {string}
 */
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

/**
 * Convert Date object to local ISO string.
 * @param {Date} [date] Date object to convert, defaults to current Date.
 * @param {string} separator Separator between date and time, defaults to 'T'.
 * @returns {string}
 */
const localIsoDate = (date = new Date(), separator = 'T') => `${date.getFullYear()}-${
  pad(date.getMonth() + 1)}-${
  pad(date.getDate())}${separator}${
  pad(date.getHours())}:${
  pad(date.getMinutes())}:${
  pad(date.getSeconds())}`;

/**
 * Logs a message with timestamp.
 * @param {...any} args
 * @returns {void}
 */
exports.logMsg = (...args) => {
  console.log(`[${localIsoDate()}]`, ...args); // eslint-disable-line no-console
};

/**
 * Logs an error with timestamp.
 * @param {...any} args Arguments to log.
 * @returns {void}
 */
exports.logError = (...args) => {
  console.error(`[${localIsoDate()}]`, ...args); // eslint-disable-line no-console
};

/**
 * Parses JSON string.
 * @param {string} json JSON string to parse.
 * @returns {Record<string, any>|false} Parsed object or false.
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
 * @param {string} file Path to the file.
 * @returns {Promise<Record<string, any>|false>} Parsed object or false.
 */
exports.readJson = async (file) => {
  const data = await fs.readFile(file, 'utf8');
  return tryParseJSON(data);
};

/**
 * Saves data as JSON string into a file.
 * @param {string} file Path to a file.
 * @param {any} json Object to save.
 * @returns {Promise<void>} Resolves when done.
 */
exports.saveJson = (file, json) => {
  const data = JSON.stringify(json, null, 2);
  return fs.writeFile(file, data);
};
