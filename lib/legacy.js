const fs = require('fs');
const path = require('path');
const { isObject } = require('tm-is');
const { readJson, logMsg, logError } = require('./utils.js');

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
   * @param {Array<String>} opts.legacyKeys List of legacy settings keys.
   */
  constructor(opts) {
    this.data = null; // Текущие данные резервных настроек.
    this.file = opts.file || 'default.legacy.json';
    this.path = path.join(opts.path, this.file);
    this.legacyKeys = opts.legacyKeys || [];
  }

  logMsg() {
    logMsg(`${this.constructor.name}::`, ...arguments);
  }

  logError() {
    logError(`${this.constructor.name}::`, ...arguments);
  }

  /**
   * Проверяет доступность файла с резервными настройками.
   * @returns {Promise} true если файл с резерыными настройками доступен.
   */
  async validate() {
    try {
      const data = await readJson(this.path);
      return isObject(data);
    } catch(e) {
      return false;
    }
  }

  /**
   * Установка/обновление текущих данных резервных настроек в памяти.
   * Позволяет оценить необходимость обновления файла при изменении настроек.
   * @return {number|false} Кол-во изменений в настройках. false если изменений нет.
   */
  updateData(settings = {}) {
    if (!isObject(settings)) return false;
    let updated = 0;
    const firstUpdate = !isObject(this.data);
    if (firstUpdate) this.data = {};
    Object.keys(settings)
      .filter(k => this.legacyKeys.includes(k))
      .filter(k => this.data[k] !== settings[k])
      .forEach((k) => {
        if (!firstUpdate) {
          this.logMsg(`Изменилась настройка ${k}: ${this.data[k]} => ${settings[k]}`);
        }
        this.data[k] = settings[k];
        updated += 1;
      });
    return updated || false;
  }

  async load() {
    this.logMsg(`Чтение файла с резервными настройками ${this.path}...`);
    const legacy = await readJson(this.path);
    this.updateData(legacy);
    return legacy;
  }

  save(data) {
    return fs.promises.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async update(settings = {}) {
    this.logMsg(`Обновление файла с резервными настройками...`);
    try {
      if (!isObject(settings)) throw new Error('Настройки для резервирования не заданы!');
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
      this.logMsg(`Файл с резервными настройками сохранён.`);
      return true;
    } catch(e) {
      this.logError(`Ошибка обновления файла с резервными настройками: ${e.message}`);
      return false;
    }
  }
};
