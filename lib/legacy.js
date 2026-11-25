const { join } = require('node:path');

const { isObject, isNotEmptyArray } = require('tm-is');

const {
  readJson, saveJson, logMsg, logError,
} = require('./utils');

/**
 * @typedef {Object} LegacyOptions TM legacy options.
 * @property {string} [file] Legacy file name (default used if not set).
 * @property {string} path Legacy file path.
 * @property {Array<String>} keys Settings object keys to backup.
 */

/** Default legacy file name to use if not set */
const DEFAULT_FILE_NAME = 'default.legacy.json';

/** Saves or restores settings for updates. */
module.exports = class TMLegacy {
  /**
   * @param {LegacyOptions} opts Legacy options.
   */
  constructor(opts) {
    if (!isObject(opts)) {
      throw new Error('Invalid options');
    }

    /** @type {string} Legacy file name */
    this.file = opts.file || DEFAULT_FILE_NAME;

    /** @type {string} Full path to legacy file */
    this.path = join(opts.path, this.file);

    /** @type {Array<String>} Settings keys */
    this.keys = isNotEmptyArray(opts.keys) ? opts.keys : [];

    /**
     * Current backup data (usefull to handle updates).
     * @type {Record<string, any>|null}
     */
    this.data = null;
  }

  /**
   * Logs a message with class prefix and timestamp
   * @param {...any} args Message parts
   * @returns {void}
   */
  logMsg(...args) {
    logMsg(`${this.constructor.name}::`, ...args);
  }

  /**
   * Logs an error with class prefix and timestamp
   * @param {...any} args Message parts
   * @returns {void}
   */
  logError(...args) {
    logError(`${this.constructor.name}::`, ...args);
  }

  /**
   * Checks whether backup settings are available.
   * @returns {Promise<boolean>} true if backup settings are available.
   */
  async validate() {
    try {
      const data = await readJson(this.path);
      return isObject(data);
    } catch (err) {
      this.logError('Invalid legacy file', err);
      return false;
    }
  }

  /**
   * Stores/updates in-memory copy of backup data.
   * Helps to understand if there were any changes and we should save stored settings.
   * @param {Record<string, any>} settings Settings object.
   * @return {number|false} Amount of changed settings or false if there were no changes.
   */
  updateData(settings) {
    if (!isObject(settings)) {
      return false;
    }

    const isFirstUpdate = !isObject(this.data);
    if (isFirstUpdate) {
      this.data = {};
    }

    return Object.keys(settings)
      .filter((k) => this.keys.includes(k))
      .filter((k) => this.data[k] !== settings[k])
      .reduce((acc, k) => {
        if (!isFirstUpdate) {
          this.logMsg(`Changed option ${k}: ${this.data[k]} => ${settings[k]}`);
        }
        this.data[k] = settings[k];
        return acc + 1;
      }, 0) || false;
  }

  /**
   * Loads backup data and stores it in memory.
   * @param {string} [filePath] File to load from, default this.path.
   * @returns {Promise<Record<string, any>|false>} Settings object or false.
   */
  async load(filePath) {
    const file = filePath || this.path;
    this.logMsg(`Loading backup settings from ${file}...`);
    try {
      const legacy = await readJson(file);
      this.updateData(legacy);
      return legacy;
    } catch (err) {
      this.logError('Failed to load backup settings', err);
      return false;
    }
  }

  /**
   * Saves settings to a backup JSON.
   * @param {Record<string, any>} [settingsData] Settings to save.
   * @returns {Promise<void>}
   */
  save(settingsData) {
    const data = settingsData || this.data;
    this.logMsg(`Saving backup settings to ${this.path}...`);
    return saveJson(this.path, data);
  }

  /**
   * Updates backup settings.
   * @param {Record<string, any>} settings New settings.
   * @returns {Promise<boolean>} true if there were any updates and they successfuly saved.
   */
  async update(settings) {
    this.logMsg('Updating backup settings...');
    try {
      if (!isObject(settings)) {
        throw new Error('Backup settings have not been set!');
      }
      // Validate backup and load settings if they haven't been loaded.
      if (!isObject(this.data) && await this.validate()) {
        await this.load();
      }
      // Update data if needed.
      const updated = this.updateData(settings);
      if (updated === false) {
        this.logMsg('Cancel update since settings have not been changed.');
        return false;
      }
      await this.save();
      this.logMsg('Backup settings have been updated.');
      return true;
    } catch (e) {
      this.logError(`Failed to update backup settings: ${e.message}`);
      return false;
    }
  }
};
