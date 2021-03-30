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

const createTestLegacy = (data = JSON.stringify(mockLegacy())) => {
  return fs.promises.writeFile(testLegacyPath(), data);
};

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

const legacyFactory = () => new TMLegacy({
  file,
  path: os.tmpdir(),
  keys,
});

describe('Test TMLegacy class', () => {
  test('TMLegacy should be defined.', () => {
    expect(TMLegacy).toBeDefined();
  });

  describe('Test TMLegacy.validate method', () => {
    const legacy = legacyFactory();

    test('TMLegacy.validate should return false if file does not exist', async () => {
      await deleteTestLegacy();
      const valid = await legacy.validate();
      expect(valid).toBe(false);
    });
  
    test('TMLegacy.validate should return false if file does not contains json', async () => {
      await createTestLegacy('Some data');
      const valid = await legacy.validate();
      await deleteTestLegacy();
      expect(valid).toBe(false);
    });
  
    test('TMLegacy.validate should return true if file exist and contains json', async () => {
      await createTestLegacy();
      const valid = await legacy.validate();
      await deleteTestLegacy();
      expect(valid).toBe(true);
    });
  });

  describe('Test TMLegacy.updateData method', () => {
    const legacy = legacyFactory();

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

  describe('Test TMLegacy.load method', () => {
    const legacy = legacyFactory();

    test('TMLegacy.load should return false if there is no legacy file.', async () => {
      await deleteTestLegacy();
      const res = await legacy.load();
      expect(res).toBe(false);
    });

    test('TMLegacy.load should return data if legacy file has been loaded.', async () => {
      await createTestLegacy();
      const res = await legacy.load();
      expect(res).toEqual(mockLegacy());
      await deleteTestLegacy();
    });
  });

  describe('Test TMLegacy.update method.', () => {
    const legacy = legacyFactory();

    test('TMLegacy.update should return false if no settings passed.', async () => {
      expect(await legacy.update()).toBe(false);
    });

    test('TMLegacy.update should return false if passed settings not an object.', async () => {
      expect(await legacy.update('dfgdfgdf')).toBe(false);
    });

    test('TMLegacy.update should return true in case new settings passed.', async () => {
      expect(await legacy.update(mockLegacy())).toBe(true);
    });

    test('TMLegacy.update should return false in case same settings passed.', async () => {
      expect(await legacy.update(mockLegacy())).toBe(false);
    });

    test('TMLegacy.update should return true in case updated settings passed.', async () => {
      expect(await legacy.update({ option2: 150 })).toBe(true);
    });

    test('TMLegacy should have expected data after update', () => {
      expect(legacy.data).toEqual({ option1: 'val1', option2: 150 });
    });
  });
});
