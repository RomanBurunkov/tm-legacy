const os = require('os');
const fs = require('fs');
const path = require('path');
const TMLegacy = require('../../lib/legacy');

const file = 'test.legacy.json';
const legacyKeys = ['option1', 'option2'];
const mockLegacy = () => ({
  option1: 'val1',
  option2: 'val2',
});


describe('Test TMLegacy class', () => {
  test('TMLegacy should be defined.', () => {
    expect(TMLegacy).toBeDefined();
  });

  test('TMLegacy.validate should return false if file does not exist', async () => {
    const legacy = new TMLegacy({
      file,
      path: path.join(os.tmpdir(), file),
      legacyKeys,
    });
    const valid = await legacy.validate();
    expect(valid).toBe(false);
  });
});
