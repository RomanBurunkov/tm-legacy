const os = require('os');
const fs = require('fs');
const path = require('path');
const utils = require('../../lib/utils');
const { isFunc } = require('tm-is');

const mockFile = path.join(os.tmpdir(), 'legacy.test.json');
const textFile = path.join(__dirname, '../', 'test.txt');
const mockObj = { a: 1, b: 2, c: 'test' };

describe('Test utils functions defined', () => {
  ['readJson', 'saveJson', 'logMsg', 'logError'].forEach((f) => {
    test(`Function ${f} should be defined`, () => {
      expect(utils[f]).toBeDefined();
    });

    test(`${f} should be a function`, () => {
      expect(isFunc(utils[f])).toBe(true);
    });
  });
});

describe('Test saveJson', () => {
  test('saveJson should save an object to a file', async () => {
    await utils.saveJson(mockFile, mockObj);
    await fs.promises.stat(mockFile);
    return fs.promises.unlink(mockFile);
  });
});

describe('Test readJson', () => {
  test('readJson should return false if failed to parse data from file', async () => {
    const data = await utils.readJson(textFile);
    expect(data).toBe(false);
  });

  test('readJson should get an object from a file', async () => {
    await utils.saveJson(mockFile, mockObj);
    const data = await utils.readJson(mockFile);
    fs.promises.unlink(mockFile);
    expect(data).toEqual(mockObj);
  });
});
