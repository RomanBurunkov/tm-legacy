const os = require('os');
const fs = require('fs');
const path = require('path');
const TMLegacy = require('../../lib/legacy');

const file = 'test.legacy.json';
const keys = ['option1', 'option2'];
const mockLegacy = () => ({
  option1: 'val1',
  option2: 'val2',
});

const testLegacyPath = () => path.join(os.tmpdir(), file);

const deleteTestLegacy = async () => {
  try {
    await fs.promises.unlink(testLegacyPath());
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
};

const legacy = new TMLegacy({
  file,
  path: os.tmpdir(),
  keys,
});

describe('Test TMLegacy class', () => {
  test('TMLegacy should be defined.', () => {
    expect(TMLegacy).toBeDefined();
  });

  describe('Test TMLegacy.validate method', () => {
    test('TMLegacy.validate should return false if file does not exist', async () => {
      await deleteTestLegacy();
      const valid = await legacy.validate();
      expect(valid).toBe(false);
    });
  
    test('TMLegacy.validate should return false if file does not contains json', async () => {
      await fs.promises.writeFile(testLegacyPath(), 'Some data');
      const valid = await legacy.validate();
      await deleteTestLegacy();
      expect(valid).toBe(false);
    });
  
    test('TMLegacy.validate should return true if file exist and contains json', async () => {
      await fs.promises.writeFile(testLegacyPath(), JSON.stringify(mockLegacy()));
      const valid = await legacy.validate();
      await deleteTestLegacy();
      expect(valid).toBe(true);
    });
  });

  describe('Test TMLegacy.updateData method', () => {
    test('TMLegacy.updateData should set data on first run.', () => {
      const settings = mockLegacy();
      const updates = legacy.updateData(settings);
      expect(updates).toBe(Object.keys(settings).length);
      expect(legacy.data).toEqual(mockLegacy());
    });

    test('TMLegacy.updateData should return false if there were no changes.', () => {
      const settings = mockLegacy();
      const updates = legacy.updateData(settings);
      expect(updates).toBe(false);
    });

    test('TMLegacy.updateData should return amount of changed options.', () => {
      const settings = mockLegacy();
      settings[keys[0]] = Date.now();
      const updates = legacy.updateData(settings);
      expect(updates).toBe(1);
    });
  });
});
