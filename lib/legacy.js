const path = require('path');
const { isObject } = require('tm-is');
const {
  readJson, saveJson, logMsg, logError,
} = require('./utils.js');

/**
 * Сохранение/восстановление настроек для переноса при обновлениях.
 * @class TMLegacy
 */
module.exports = class TMLegacy {
  /**
   * @constructor
   * @param {Object} opts Legacy options.
   * @param {string} opts.file Legacy file name.
   * @param {string} opts.path Legacy file directory path.
   * @param {Array<String>} opts.keys List of legacy settings keys.
   */
  constructor(opts) {
    this.data = null; // Current backup data (usefull to handle updates).
    this.file = opts.file || 'default.legacy.json';
    this.path = path.join(opts.path, this.file);
    this.keys = opts.keys || [];
  }

  logMsg(...args) {
    logMsg(`${this.constructor.name}::`, ...args);
  }

  logError(...args) {
    logError(`${this.constructor.name}::`, ...args);
  }

  /**
   * Checks whether backup settings is available.
   * @returns {Promise} true if backup settings is available.
   */
  async validate() {
    try {
      const data = await readJson(this.path);
      return isObject(data);
    } catch (e) {
      return false;
    }
  }

  /**
   * Store/update in-memory copy of backup data.
   * Helps to understand if there were any changes and we shoud to save stored settings.
   * @param {Object} settings Settings object.
   * @return {number|false} Amount of changed settings or false if there we no changes.
   */
  updateData(settings = {}) {
    if (!isObject(settings)) return false;
    const firstUpdate = !isObject(this.data);
    if (firstUpdate) this.data = {};
    return Object.keys(settings)
      .filter((k) => this.keys.includes(k))
      .filter((k) => this.data[k] !== settings[k])
      .reduce((acc, k) => {
        if (!firstUpdate) {
          this.logMsg(`Changed option ${k}: ${this.data[k]} => ${settings[k]}`);
        }
        this.data[k] = settings[k];
        return acc + 1;
      }, 0) || false;
  }

  /**
   * Loads backup data and stores it in memory.
   * @returns {Object|boolean} Settings object or false.
   */
  async load(file = this.path) {
    this.logMsg(`Loading backup settings from ${file}...`);
    try {
      const legacy = await readJson(file);
      this.updateData(legacy);
      return legacy;
    } catch (err) {
      this.logError('Failed to load backup settings!');
      return false;
    }
  }

  /**
   * Saves settings to a backup.
   */
  save(data = this.data) {
    return saveJson(this.path, data);
  }

  /**
   * Update backup settings.
   * @param {Object} settings New settings.
   * @returns {boolean} true if there were any updates and they successfuly saved.
   */
  async update(settings) {
    this.logMsg('Updating backup settings...');
    try {
      if (!isObject(settings)) {
        throw new Error('Backup settings have not been set!');
      }
      // Validate backup and load settings if they hasn't been loaded.
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
      this.logMsg('Backup settings have been saved.');
      return true;
    } catch (e) {
      this.logError(`Failed to store backup settings: ${e.message}`);
      return false;
    }
  }
};
