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
    this.data = null; // Текущие данные резервных настроек.
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
   * Set/update currently backuped in-memory data.
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
  async load() {
    this.logMsg(`Reading backup settings from ${this.path}...`);
    const legacy = await readJson(this.path);
    this.updateData(legacy);
    return legacy;
  }

  /**
   * Saves settings to a backup.
   * @param {Object} data Settings object
   */
  save(data) {
    return saveJson(this.path, data);
  }

  /**
   * Update settings in a backup.
   * @param {Object} settings
   * @returns {boolean} true if there were any updates and they successfuly saved.
   */
  async update(settings = {}) {
    this.logMsg('Обновление файла с резервными настройками...');
    try {
      if (!isObject(settings)) {
        throw new Error('Настройки для резервирования не заданы!');
      }
      // Если настройки не загружались ранее, загружаем их из файла.
      if (!isObject(this.data) && await this.validate()) {
        await this.load(this.path);
      }
      // Обновляем данные, если требуется.
      const updated = this.updateData(settings);
      if (updated === false) {
        return this.logMsg('Резервные настройки не изменились, обновление файла не требуется.');
      }
      await this.save(this.data);
      this.logMsg('Файл с резервными настройками сохранён.');
      return true;
    } catch (e) {
      this.logError(`Ошибка обновления файла с резервными настройками: ${e.message}`);
      return false;
    }
  }
};
