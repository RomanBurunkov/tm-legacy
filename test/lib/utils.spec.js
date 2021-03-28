const utils = require('../../lib/utils');

describe('Test utils functions', () => {
  ['readJson', 'saveJson', 'logMsg', 'logError'].forEach((f) => {
    test(`Function ${f} defined`, () => {
      expect(utils[f]).toBeDefined();
    });
  });
});
