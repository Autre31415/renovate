const {
  writeUpdates,
} = require('../../../../lib/workers/repository/process/write');
/** @type any */
const branchWorker = require('../../../../lib/workers/branch');
/** @type any */
const limits = require('../../../../lib/workers/repository/process/limits');
/** @type any */

branchWorker.processBranch = jest.fn();

limits.getPrsRemaining = jest.fn(() => 99);

let config;
beforeEach(() => {
  jest.resetAllMocks();
  config = { ...require('../../../config/config/_fixtures') };
});

describe('workers/repository/write', () => {
  describe('writeUpdates()', () => {
    const packageFiles = {};
    it('skips branches blocked by pin', async () => {
      const branches = [{ updateType: 'pin' }, { blockedByPin: true }, {}];
      const res = await writeUpdates(config, packageFiles, branches);
      expect(res).toEqual('done');
      expect(branchWorker.processBranch).toHaveBeenCalledTimes(2);
    });
    it('stops after automerge', async () => {
      const branches = [{}, {}, {}, {}];
      branchWorker.processBranch.mockReturnValueOnce('created');
      branchWorker.processBranch.mockReturnValueOnce('delete');
      branchWorker.processBranch.mockReturnValueOnce('automerged');
      const res = await writeUpdates(config, packageFiles, branches);
      expect(res).toEqual('automerged');
      expect(branchWorker.processBranch).toHaveBeenCalledTimes(3);
    });
  });
});
