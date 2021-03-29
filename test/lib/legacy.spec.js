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
